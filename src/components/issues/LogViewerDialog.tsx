import React, { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  CircularProgress,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface LogViewerDialogProps {
  open: boolean;
  onClose: () => void;
  projectKey: string;
  issueKey: string | null;
}

export function LogViewerDialog({
  open,
  onClose,
  projectKey,
  issueKey,
}: LogViewerDialogProps) {
  const [logContent, setLogContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchLog = async () => {
    if (!issueKey || !projectKey) return;

    setLoading(true);
    setLogContent(null); // Clear previous content
    try {
      const log = await window.electronAPI.readIssueLog(projectKey, issueKey);
      setLogContent(log || "No log content found.");
    } catch (err) {
      if (err instanceof Error) {
        setLogContent(`Error loading log: ${err.message}`);
      } else {
        setLogContent("An unknown error occurred while loading the log.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchLog();
    }
  }, [open, issueKey, projectKey]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        Log for Issue: {issueKey}
        <IconButton
          aria-label="Close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "200px",
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <Typography
            component="pre"
            sx={{ whiteSpace: "pre-wrap", wordBreak: "break-all" }}
          >
            {logContent}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={fetchLog} disabled={loading}>
          Refresh
        </Button>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}