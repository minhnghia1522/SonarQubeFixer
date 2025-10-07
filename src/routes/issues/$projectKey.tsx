import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Box, CircularProgress, Typography, TablePagination, Paper } from '@mui/material';
import { LogViewerDialog } from '../../components/issues/LogViewerDialog';
import { useSnackbar } from '../../contexts/SnackbarContext';

// Hooks
import { useProjectDirectory } from './hooks/useProjectDirectory';
import { useIssueFilters } from './hooks/useIssueFilters';
import { useIssuesData } from './hooks/useIssuesData';
import { useSelection } from './hooks/useSelection';
import { useIssueActions } from './hooks/useIssueActions';
import { useBatchFix } from './hooks/useBatchFix';

// UI Components
import { ProjectDirectoryBanner } from './components/ProjectDirectoryBanner';
import { IssuesToolbar } from './components/IssuesToolbar';
import { IssuesSelectionBar } from './components/IssuesSelectionBar';
import { BatchFixProgress } from './components/BatchFixProgress';
import { IssuesGroupedList } from './components/IssuesGroupedList';

import type { IssuesParams } from '../../types/issues';

export const Route = createFileRoute('/issues/$projectKey')({
  component: ProjectIssues,
});

function ProjectIssues() {
  const { projectKey } = Route.useParams();
  const { showSnackbar } = useSnackbar();

  // Project directory state and actions
  const { projectDir, onSelectDirectory } = useProjectDirectory(projectKey);

  // Filters + pagination (controlled)
  const {
    filters,
    setSearch,
    setSeverity,
    setType,
    setStatuses,
    setPage,
    setRowsPerPage,
    applyFilters,
  } = useIssueFilters();

  // Server data
  const {
    issues,
    componentMap,
    groupedIssues,
    total,
    loading,
    error,
    everFixedMap,
    setEverFixedMap,
    fetchIssues,
  } = useIssuesData(projectKey, {
    page: filters.page,
    rowsPerPage: filters.rowsPerPage,
    s: 'FILE_LINE',
    asc: true,
    severities: filters.severity ? ([filters.severity] as IssuesParams['severities']) : undefined,
    types: filters.type,
    issueStatuses: filters.statuses,
    search: filters.search,
  });

  // Selection management (resets when filters/pagination change)
  const {
    selectedIssues,
    selectedCount,
    selectAll,
    selectAllAcrossPages,
    setSelectAllAcrossPages,
    toggleSelect,
    toggleSelectAllOnPage,
    clearSelection,
  } = useSelection({
    resetKeys: [filters.severity, filters.type, filters.statuses, filters.search, filters.page, filters.rowsPerPage],
  });

  // Row-level actions (open sonar, fix single, log dialog)
  const {
    rowLoading,
    handleOpenIssueInSonarQube,
    handleFixIssue,
    logViewerOpen,
    selectedIssueKey,
    handleViewLogClick,
    handleCloseLogViewer,
  } = useIssueActions(projectKey, {
    onIssueFixed: (issue) => setEverFixedMap((prev) => ({ ...prev, [issue.key]: true })),
  });

  // Batch fix
  const { state: batchState, isDisabled: batchDisabled, start: startBatchFix } = useBatchFix();

  // Handlers
  const handleToggleSelectAll = React.useCallback(() => {
    const currentPageKeys = issues.map((i) => i.key);
    toggleSelectAllOnPage(currentPageKeys);
  }, [issues, toggleSelectAllOnPage]);

  const handleFixSelectedIssues = React.useCallback(async () => {
    // Ensure project directory before batch run (behavior parity)
    if (!projectDir) {
      showSnackbar('Please select the project directory first.', 'warning');
      await onSelectDirectory();
      // If user cancels, abort
      if (!window.electronAPI) return;
      // Note: projectDir state may update asynchronously; batch fix itself doesn't strictly need it,
      // but we keep UX parity with original implementation.
    }

    await startBatchFix(
      {
        projectKey,
        currentPageIssues: issues,
        selectedIssueKeys: selectedIssues,
        selectAllAcrossPages,
        filters: {
          page: filters.page,
          rowsPerPage: filters.rowsPerPage,
          severities: filters.severity ? ([filters.severity] as IssuesParams['severities']) : undefined,
          types: filters.type,
          issueStatuses: filters.statuses,
          s: 'FILE_LINE',
          asc: true,
        },
      },
      {
        concurrency: 5,
        onIssueSuccess: (issue) => setEverFixedMap((prev) => ({ ...prev, [issue.key]: true })),
        onComplete: () => {
          clearSelection();
        },
      }
    );
  }, [
    projectDir,
    showSnackbar,
    onSelectDirectory,
    startBatchFix,
    projectKey,
    issues,
    selectedIssues,
    selectAllAcrossPages,
    filters.page,
    filters.rowsPerPage,
    filters.severity,
    filters.type,
    filters.statuses,
    setEverFixedMap,
    clearSelection,
  ]);

  // Refresh when explicitly applying filters (keep parity)
  const onApplyFilters = React.useCallback(() => {
    applyFilters();
    fetchIssues();
  }, [applyFilters, fetchIssues]);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Issues for <b>{projectKey}</b>
      </Typography>

      <ProjectDirectoryBanner projectDir={projectDir} onSelectDirectory={onSelectDirectory} />

      <IssuesToolbar
        search={filters.search}
        severity={filters.severity}
        type={filters.type}
        statuses={filters.statuses}
        setSearch={setSearch}
        setSeverity={setSeverity}
        setType={setType}
        setStatuses={setStatuses}
        applyFilters={onApplyFilters}
      />

      {loading && <CircularProgress />}
      {error && (
        <Typography color="error" sx={{ mt: 1 }}>
          Error: {error}
        </Typography>
      )}

      {!loading && !error && (
        <Paper>
          <IssuesSelectionBar
            selectAll={selectAll}
            selectedCount={selectedCount}
            total={total}
            selectAllAcrossPages={selectAllAcrossPages}
            onToggleSelectAll={handleToggleSelectAll}
            onFixSelected={handleFixSelectedIssues}
            disabled={selectedCount === 0 || batchDisabled}
          />

          <BatchFixProgress
            isRunning={batchState.isRunning}
            processed={batchState.processed}
            total={batchState.total}
          />

          {Object.keys(groupedIssues).length === 0 ? (
            <Typography sx={{ p: 2 }}>No issues found for the selected criteria.</Typography>
          ) : (
            <IssuesGroupedList
              groupedIssues={groupedIssues}
              componentMap={componentMap}
              selectedIssues={selectedIssues}
              onToggleSelect={toggleSelect}
              onFixIssue={(issue) => handleFixIssue(issue, projectDir)}
              onViewLog={handleViewLogClick}
              onOpenInSonar={handleOpenIssueInSonarQube}
              rowLoading={rowLoading}
              perIssueStatus={batchState.perIssueStatus}
              batchRunning={batchState.isRunning}
              everFixedMap={everFixedMap}
            />
          )}

          <TablePagination
            rowsPerPageOptions={[10, 25, 50, 100, 200, 500]}
            component="div"
            count={total}
            rowsPerPage={filters.rowsPerPage}
            page={filters.page}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
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
