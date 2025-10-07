import React from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import type { SonarQubeComponent, SonarQubeIssue } from '../../../types/issues';
import { IssuesTable } from './IssuesTable';

export type IssueAccordionProps = {
  componentKey: string;
  component?: SonarQubeComponent;
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

export function IssueAccordion(props: IssueAccordionProps) {
  const {
    componentKey,
    component,
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

  const title = `${component?.path || componentKey} (${issues.length} issues found)`;

  return (
    <Accordion defaultExpanded>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>{title}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <IssuesTable
          issues={issues}
          selectedIssues={selectedIssues}
          onToggleSelect={onToggleSelect}
          onFixIssue={onFixIssue}
          onViewLog={onViewLog}
          onOpenInSonar={onOpenInSonar}
          rowLoading={rowLoading}
          perIssueStatus={perIssueStatus}
          batchRunning={batchRunning}
          everFixedMap={everFixedMap}
        />
      </AccordionDetails>
    </Accordion>
  );
}