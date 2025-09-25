import React, { useEffect, useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TablePagination,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  ListItemText,
  SelectChangeEvent,
  Grid,
  Chip,
  Stack,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  IssuesParams,
  SonarQubeIssue,
  SonarQubeComponent,
} from "../../types/issues";
import { useSnackbar } from "../../contexts/SnackbarContext";
import { LogViewerDialog } from "../../components/issues/LogViewerDialog";

export const Route = createFileRoute("/issues/$projectKey")({
  component: ProjectIssues,
});

type GroupedIssues = {
  [key: string]: SonarQubeIssue[];
};

const STATUS_OPTIONS = ["OPEN", "CONFIRMED", "REOPENED", "RESOLVED", "CLOSED"];
const TYPE_OPTIONS = ["BUG", "VULNERABILITY", "CODE_SMELL"] as const;

function ProjectIssues() {
  const { projectKey } = Route.useParams();

  const [issues, setIssues] = useState<SonarQubeIssue[]>([]);
  const [components, setComponents] = useState<SonarQubeComponent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("");
  const [type, setType] = useState<IssuesParams["types"]>([
    "BUG",
    "VULNERABILITY",
    "CODE_SMELL",
  ]);
  const [statuses, setStatuses] = useState<IssuesParams["issueStatuses"]>([
    "OPEN",
    "CONFIRMED",
  ]);
  const [projectDir, setProjectDir] = useState<string | null>(null);
  const [rowLoading, setRowLoading] = useState<Record<string, boolean>>({});
  const [everFixedMap, setEverFixedMap] = useState<Record<string, boolean>>({});
  const [logViewerOpen, setLogViewerOpen] = useState(false);
  const [selectedIssueKey, setSelectedIssueKey] = useState<string | null>(null);

  const { showSnackbar } = useSnackbar();

  const fetchProjectDirectory = async () => {
    try {
      const dir = await window.electronAPI.getProjectDirectory(projectKey);
      setProjectDir(dir);
    } catch (err) {
      if (err instanceof Error) {
        showSnackbar(
          `Error fetching project directory: ${err.message}`,
          "error"
        );
      }
    }
  };

  const fetchIssues = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: IssuesParams = {
        projectKey,
        page: page + 1,
        pageSize: rowsPerPage,
        s: "FILE_LINE",
        asc: true,
        ...(severity && {
          severities: [
            severity as "INFO" | "MINOR" | "MAJOR" | "CRITICAL" | "BLOCKER",
          ],
        }),
        ...(type && { types: type }),
        ...(statuses && { issueStatuses: statuses }),
      };
      const result = await window.electronAPI.listIssues(params);
      setIssues(result.issues);
      setComponents(result.components);
      setTotal(result.paging.total);
      if (result.issues.length > 0) {
        const issueKeys = result.issues.map((i) => i.key);
        const fixedMap = await window.electronAPI.checkIssuesFixed(
          projectKey,
          issueKeys
        );
        setEverFixedMap(fixedMap);
      }
    } catch (err) {
      if (err instanceof Error) {
        showSnackbar(`Error fetching issues: ${err.message}`, "error");
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
    fetchProjectDirectory();
  }, [page, rowsPerPage, severity, type, statuses, projectKey]);

  const componentMap = useMemo(() => {
    return components.reduce(
      (acc, component) => {
        acc[component.key] = component;
        return acc;
      },
      {} as { [key: string]: SonarQubeComponent }
    );
  }, [components]);

  const groupedIssues = useMemo(() => {
    return issues.reduce((acc, issue) => {
      const componentKey = issue.component;
      if (!acc[componentKey]) {
        acc[componentKey] = [];
      }
      acc[componentKey].push(issue);
      return acc;
    }, {} as GroupedIssues);
  }, [issues]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  const handleFilterChange = () => {
    setPage(0);
    fetchIssues();
  };

  const handleStatusChange = (event: SelectChangeEvent<typeof statuses>) => {
    const {
      target: { value },
    } = event;
    setStatuses(
      (typeof value === "string" ? value.split(",") : value) as
        | ("OPEN" | "CONFIRMED" | "REOPENED" | "RESOLVED" | "CLOSED")[]
        | undefined
    );
  };

  const handleSelectDirectory = async () => {
    try {
      const dir = await window.electronAPI.selectProjectDirectory();
      if (dir) {
        await window.electronAPI.setProjectDirectory(projectKey, dir);
        setProjectDir(dir);
        showSnackbar("Project directory updated successfully", "success");
      }
    } catch (err) {
      if (err instanceof Error) {
        showSnackbar(`Error selecting directory: ${err.message}`, "error");
      }
    }
  };

  const handleFixIssue = async (issue: SonarQubeIssue) => {
    let dir = projectDir;
    if (!dir) {
      showSnackbar("Please select the project directory first.", "warning");
      const selectedDir = await window.electronAPI.selectProjectDirectory();
      if (selectedDir) {
        await window.electronAPI.setProjectDirectory(projectKey, selectedDir);
        setProjectDir(selectedDir);
        dir = selectedDir;
      } else {
        return; // User cancelled directory selection
      }
    }

    setRowLoading((prev) => ({ ...prev, [issue.key]: true }));
    try {
      const result = await window.electronAPI.fixIssue(issue);
      showSnackbar(result, "success");
      setEverFixedMap((prev) => ({ ...prev, [issue.key]: true }));
    } catch (err) {
      if (err instanceof Error) {
        showSnackbar(`Error fixing issue: ${err.message}`, "error");
        // setError(err.message);
      } else {
        showSnackbar("An unknown error occurred while fixing issue.", "error");
      }
    } finally {
      setRowLoading((prev) => ({ ...prev, [issue.key]: false }));
    }
  };

  const handleViewLogClick = (issueKey: string) => {
    setSelectedIssueKey(issueKey);
    setLogViewerOpen(true);
  };

  const handleCloseLogViewer = () => {
    setLogViewerOpen(false);
    setSelectedIssueKey(null);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Issues for <b>{projectKey}</b> project
      </Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: "auto" }}>
            <Typography variant="body1">
              <strong>Project Directory:</strong>{" "}
              {projectDir || "Not set. Please select a directory."}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: "auto" }}>
            <Button
              variant="contained"
              onClick={handleSelectDirectory}
              size="small"
            >
              {projectDir ? "Change Directory" : "Select Directory"}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              label="Search"
              value={search}
              onChange={handleSearchChange}
              onBlur={handleFilterChange}
              variant="outlined"
              size="small"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Severity</InputLabel>
              <Select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                onBlur={handleFilterChange}
                label="Severity"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="BLOCKER">Blocker</MenuItem>
                <MenuItem value="CRITICAL">Critical</MenuItem>
                <MenuItem value="MAJOR">Major</MenuItem>
                <MenuItem value="MINOR">Minor</MenuItem>
                <MenuItem value="INFO">Info</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Type</InputLabel>
              <Select
                multiple
                value={type}
                onChange={(e) =>
                  setType(e.target.value as IssuesParams["types"])
                }
                onBlur={handleFilterChange}
                label="Type"
                renderValue={(selected) => selected.join(", ")}
              >
                {TYPE_OPTIONS.map((t) => (
                  <MenuItem key={t} value={t}>
                    <Checkbox checked={(type || []).indexOf(t) > -1} />
                    <ListItemText primary={t} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                multiple
                value={statuses}
                onChange={handleStatusChange}
                onBlur={handleFilterChange}
                label="Status"
                renderValue={(selected) => selected.join(", ")}
              >
                {STATUS_OPTIONS.map((status) => (
                  <MenuItem key={status} value={status}>
                    <Checkbox
                      checked={
                        (statuses || []).indexOf(
                          status as
                            | "OPEN"
                            | "CONFIRMED"
                            | "REOPENED"
                            | "RESOLVED"
                            | "CLOSED"
                        ) > -1
                      }
                    />
                    <ListItemText primary={status} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      {loading && <CircularProgress />}
      {error && <Typography color="error">Error: {error}</Typography>}
      {!loading && !error && (
        <Paper>
          {Object.keys(groupedIssues).length === 0 ? (
            <Typography sx={{ p: 2 }}>
              No issues found for the selected criteria.
            </Typography>
          ) : (
            Object.keys(groupedIssues).map((componentKey) => (
              <Accordion key={componentKey} defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>
                    {componentMap[componentKey]?.path || componentKey} (
                    {groupedIssues[componentKey].length} issues)
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <TableContainer>
                    <Table size="small" sx={{ tableLayout: "fixed" }}>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ width: "10%" }}>Severity</TableCell>
                          <TableCell sx={{ width: "10%" }}>Type</TableCell>
                          <TableCell sx={{ width: "60%" }}>Message</TableCell>
                          <TableCell sx={{ width: "5%" }}>Line</TableCell>
                          <TableCell sx={{ width: "15%" }}>Status</TableCell>
                          <TableCell sx={{ width: "10%" }}>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {groupedIssues[componentKey].map((issue) => (
                          <TableRow key={issue.key}>
                            <TableCell>{issue.severity}</TableCell>
                            <TableCell>{issue.type}</TableCell>
                            <TableCell
                              sx={{
                                wordBreak: "break-word",
                                whiteSpace: "normal",
                              }}
                            >
                              {issue.message}
                            </TableCell>
                            <TableCell>{issue.line}</TableCell>
                            <TableCell>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Typography variant="body2">{issue.status}</Typography>
                                {everFixedMap[issue.key] && (
                                  <Chip
                                    label="Fixed"
                                    color="success"
                                    size="small"
                                    variant="outlined"
                                  />
                                )}
                              </Stack>
                            </TableCell>
                            <TableCell>
                              <Stack direction="row" spacing={1}>
                                <Button
                                  variant="contained"
                                  size="small"
                                  onClick={() => handleFixIssue(issue)}
                                  disabled={rowLoading[issue.key]}
                                  startIcon={
                                    rowLoading[issue.key] ? (
                                      <CircularProgress
                                        size={16}
                                        color="inherit"
                                      />
                                    ) : null
                                  }
                                >
                                  {rowLoading[issue.key] ? "Fixing..." : "Fix"}
                                </Button>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  onClick={() => handleViewLogClick(issue.key)}
                                  disabled={!everFixedMap[issue.key]}
                                >
                                  View Log
                                </Button>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>
            ))
          )}
          <TablePagination
            rowsPerPageOptions={[10, 25, 50, 100, 200, 500]}
            component="div"
            count={total}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </Paper>
      )}
      <LogViewerDialog
        open={logViewerOpen}
        onClose={handleCloseLogViewer}
        projectKey={projectKey}
        issueKey={selectedIssueKey}
      />
    </Box>
  );
}
