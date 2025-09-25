import React from 'react';
import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';
import type { SonarQubeIssue } from '../../../types/issues';
import { IssueRow } from './IssueRow';

export type IssuesTableProps = {
  issues: SonarQubeIssue[];
  selectedIssues: Set<string>;
  onToggleSelect: (issueKey: string) => void;
  onFixIssue: (issue: SonarQubeIssue) => void;
  onViewLog: (issueKey: string) => void;
  onOpenInSonar: (issueKey: string) => void;
  rowLoading: Record<string, boolean>;
  perIssueStatus?: Record<string, 'pending' | 'running' | 'success' | 'error'>;
  batchRunning?: boolean;
  everFixedMap: Record<string, boolean>;
};

export function IssuesTable(props: IssuesTableProps) {
  const {
    issues,
    selectedIssues,
    onToggleSelect,
    onFixIssue,
    onViewLog,
    onOpenInSonar,
    rowLoading,
    perIssueStatus,
    batchRunning,
    everFixedMap,
  } = props;

  return (
    <TableContainer>
      <Table size="small" sx={{ tableLayout: 'fixed' }}>
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">{/* row checkbox column */}</TableCell>
            <TableCell sx={{ width: '10%' }}>Severity</TableCell>
            <TableCell sx={{ width: '10%' }}>Type</TableCell>
            <TableCell sx={{ width: '10%' }}>Issue Key</TableCell>
            <TableCell sx={{ width: '50%' }}>Message</TableCell>
            <TableCell sx={{ width: '5%' }}>Line</TableCell>
            <TableCell sx={{ width: '15%' }}>Status</TableCell>
            <TableCell sx={{ width: '10%' }}>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {issues.map((issue) => (
            <IssueRow
              key={issue.key}
              issue={issue}
              isSelected={selectedIssues.has(issue.key)}
              onToggleSelect={() => onToggleSelect(issue.key)}
              onFixIssue={onFixIssue}
              onViewLog={onViewLog}
              onOpenInSonar={onOpenInSonar}
              isLoading={!!rowLoading[issue.key]}
              everFixed={!!everFixedMap[issue.key]}
              perIssueStatus={perIssueStatus?.[issue.key]}
              batchRunning={batchRunning}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}