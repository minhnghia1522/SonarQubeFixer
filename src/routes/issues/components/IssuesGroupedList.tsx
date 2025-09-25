import React from 'react';
import type { SonarQubeComponent, SonarQubeIssue } from '../../../types/issues';
import { IssueAccordion } from './IssueAccordion';

export type IssuesGroupedListProps = {
  groupedIssues: Record<string, SonarQubeIssue[]>;
  componentMap: Record<string, SonarQubeComponent>;
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

export function IssuesGroupedList(props: IssuesGroupedListProps) {
  const {
    groupedIssues,
    componentMap,
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

  const keys = Object.keys(groupedIssues);

  if (keys.length === 0) {
    return <></>;
  }

  return (
    <>
      {keys.map((componentKey) => (
        <IssueAccordion
          key={componentKey}
          componentKey={componentKey}
          component={componentMap[componentKey]}
          issues={groupedIssues[componentKey]}
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
      ))}
    </>
  );
}