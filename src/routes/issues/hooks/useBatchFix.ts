import { useCallback, useMemo, useState } from 'react';
import type { IssuesParams, SonarQubeIssue } from '../../../types/issues';
import { fixIssue, listIssues } from '../../../domains/issues.service';
import { useSnackbar } from '../../../contexts/SnackbarContext';

export type PerIssueStatus = 'pending' | 'running' | 'success' | 'error';

export type BatchState = {
  isRunning: boolean;
  processed: number;
  total: number;
  perIssueStatus: Record<string, PerIssueStatus>;
};

export type BatchFixOptions = {
  concurrency?: number;
  onIssueSuccess?: (issue: SonarQubeIssue) => void;
  onComplete?: () => void;
};

export type BatchFixInputs = {
  projectKey: string;
  // current page issues and the selected keys
  currentPageIssues: SonarQubeIssue[];
  selectedIssueKeys: Set<string>;
  // if true, fetch all issues across pages with current filters
  selectAllAcrossPages: boolean;
  // filters used for fetching (aligned with screen)
  filters: {
    page: number;
    rowsPerPage: number;
    severities?: IssuesParams['severities'];
    types?: IssuesParams['types'];
    issueStatuses?: IssuesParams['issueStatuses'];
    s?: IssuesParams['s'];
    asc?: IssuesParams['asc'];
  };
};

/**
 * Hook to run batch fix for selected issues with limited concurrency (default: 5)
 * Mirrors the original logic while being reusable.
 */
export function useBatchFix() {
  const { showSnackbar } = useSnackbar();
  const [state, setState] = useState<BatchState>({
    isRunning: false,
    processed: 0,
    total: 0,
    perIssueStatus: {},
  });

  const isDisabled = useMemo(() => state.isRunning, [state.isRunning]);

  const start = useCallback(
    async (input: BatchFixInputs, opts?: BatchFixOptions) => {
      const {
        projectKey,
        currentPageIssues,
        selectedIssueKeys,
        selectAllAcrossPages,
        filters,
      } = input;

      // Prepare issues to fix
      let issuesToFix: SonarQubeIssue[] = [];

      if (selectAllAcrossPages) {
        // Fetch all issues with pageSize 500 (max)
        try {
          const s = filters.s ?? 'FILE_LINE';
          const asc = filters.asc ?? true;

          const pageSize = 500;
          let currentPage = 1;
          let totalPages = 1;
          const all: SonarQubeIssue[] = [];

          do {
            const result = await listIssues({
              projectKey,
              page: currentPage,
              pageSize,
              s,
              asc,
              ...(filters.severities && { severities: filters.severities }),
              ...(filters.types && { types: filters.types }),
              ...(filters.issueStatuses && { issueStatuses: filters.issueStatuses }),
            });
            all.push(...result.issues);
            totalPages = Math.ceil(result.paging.total / result.paging.pageSize);
            currentPage += 1;
          } while (currentPage <= totalPages);

          issuesToFix = all;
        } catch (err) {
          if (err instanceof Error) {
            showSnackbar(`Error fetching all issues: ${err.message}`, 'error');
          }
          return;
        }
      } else {
        issuesToFix = currentPageIssues.filter((i) => selectedIssueKeys.has(i.key));
      }

      if (issuesToFix.length === 0) {
        showSnackbar('No issues selected to fix.', 'info');
        return;
      }

      // Initialize state
      setState({
        isRunning: true,
        processed: 0,
        total: issuesToFix.length,
        perIssueStatus: issuesToFix.reduce((acc, issue) => {
          acc[issue.key] = 'pending';
          return acc;
        }, {} as Record<string, PerIssueStatus>),
      });

      // Concurrency control
      const concurrency = Math.max(1, opts?.concurrency ?? 5);
      const queue = [...issuesToFix];
      let running = 0;
      let processed = 0;

      const runNext = () => {
        while (running < concurrency && queue.length > 0) {
          const issue = queue.shift();
          if (issue) {
            runTask(issue);
          }
        }
        if (processed === issuesToFix.length) {
          setState((prev) => ({ ...prev, isRunning: false }));
          showSnackbar('Batch fix completed.', 'success');
          opts?.onComplete?.();
        }
      };

      const runTask = async (issue: SonarQubeIssue) => {
        running++;
        setState((prev) => ({
          ...prev,
          perIssueStatus: { ...prev.perIssueStatus, [issue.key]: 'running' },
        }));
        try {
          await fixIssue(issue);
          opts?.onIssueSuccess?.(issue);
          setState((prev) => ({
            ...prev,
            perIssueStatus: { ...prev.perIssueStatus, [issue.key]: 'success' },
          }));
        } catch (err) {
          setState((prev) => ({
            ...prev,
            perIssueStatus: { ...prev.perIssueStatus, [issue.key]: 'error' },
          }));
          if (err instanceof Error) {
            showSnackbar(`Error fixing issue ${issue.key}: ${err.message}`, 'error');
          }
        } finally {
          running--;
          processed++;
          setState((prev) => ({ ...prev, processed }));
          runNext();
        }
      };

      runNext();
    },
    [showSnackbar]
  );

  return {
    state,
    isDisabled,
    start,
  };
}