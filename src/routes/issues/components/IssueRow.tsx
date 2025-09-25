import React from 'react';
import {
  TableRow,
  TableCell,
  Checkbox,
  Tooltip,
  Button,
  Stack,
  Typography,
  Chip,
  CircularProgress,
} from '@mui/material';
import type { SonarQubeIssue } from '../../../types/issues';

export type IssueRowProps = {
  issue: SonarQubeIssue;
  isSelected: boolean;
  onToggleSelect: () => void;
  onFixIssue: (issue: SonarQubeIssue) => void;
  onViewLog: (issueKey: string) => void;
  onOpenInSonar: (issueKey: string) => void;
  isLoading: boolean;
  everFixed: boolean;
  perIssueStatus?: 'pending' | 'running' | 'success' | 'error';
  batchRunning?: boolean;
};

export function IssueRow(props: IssueRowProps) {
  const {
    issue,
    isSelected,
    onToggleSelect,
    onFixIssue,
    onViewLog,
    onOpenInSonar,
    isLoading,
    everFixed,
    perIssueStatus,
    batchRunning,
  } = props;

  const disableFix =
    isLoading ||
    !!batchRunning ||
    issue.status === 'RESOLVED' ||
    issue.status === 'CLOSED';

  return (
    <TableRow key={issue.key} selected={isSelected}>
      <TableCell padding="checkbox">
        <Checkbox checked={isSelected} onChange={onToggleSelect} />
      </TableCell>
      <TableCell>{issue.severity}</TableCell>
      <TableCell>{issue.type}</TableCell>
      <TableCell>
        <Tooltip title={issue.key}>
          <Button
            variant="text"
            color="primary"
            onClick={() => onOpenInSonar(issue.key)}
            sx={{
              textTransform: 'none',
              padding: 0,
              minWidth: 0,
              textDecoration: 'underline',
              fontFamily: 'monospace',
            }}
          >
            {issue.key.slice(-8)}
          </Button>
        </Tooltip>
      </TableCell>
      <TableCell
        sx={{
          wordBreak: 'break-word',
          whiteSpace: 'normal',
        }}
      >
        {issue.message}
      </TableCell>
      <TableCell>{issue.line}</TableCell>
      <TableCell>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="body2">{issue.status}</Typography>
          {(everFixed || perIssueStatus === 'success') && (
            <Chip label="Fixed" color="success" size="small" variant="outlined" />
          )}
          {perIssueStatus === 'running' && <CircularProgress size={14} />}
          {perIssueStatus === 'error' && (
            <Chip label="Error" color="error" size="small" />
          )}
        </Stack>
      </TableCell>
      <TableCell>
        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            size="small"
            onClick={() => onFixIssue(issue)}
            disabled={disableFix}
            startIcon={isLoading ? <CircularProgress size={14} color="inherit" /> : null}
          >
            {isLoading ? 'Fixing...' : 'Fix'}
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => onViewLog(issue.key)}
            disabled={!everFixed}
          >
            View Log
          </Button>
        </Stack>
      </TableCell>
    </TableRow>
  );
}