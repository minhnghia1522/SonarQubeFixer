import { useCallback, useEffect, useMemo, useState } from 'react';
import type { IssuesParams, SonarQubeComponent, SonarQubeIssue } from '../../../types/issues';
import { listIssues, checkIssuesFixed } from '../../../domains/issues.service';
import { useSnackbar } from '../../../contexts/SnackbarContext';

export type UseIssuesDataFilters = Pick<
  IssuesParams,
  'types' | 'issueStatuses' | 'severities' | 's' | 'asc'
> & {
  page: number;
  rowsPerPage: number;
  // keep search for future extension (currently not used in API)
  search?: string;
};

type GroupedIssues = Record<string, SonarQubeIssue[]>;

export function useIssuesData(projectKey: string, filters: UseIssuesDataFilters) {
  const { showSnackbar } = useSnackbar();

  const [issues, setIssues] = useState<SonarQubeIssue[]>([]);
  const [components, setComponents] = useState<SonarQubeComponent[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [everFixedMap, setEverFixedMap] = useState<Record<string, boolean>>({});

  const s = filters.s ?? 'FILE_LINE';
  const asc = filters.asc ?? true;

  const fetchIssues = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: IssuesParams = {
        projectKey,
        page: filters.page + 1,
        pageSize: filters.rowsPerPage,
        s,
        asc,
        ...(filters.severities && { severities: filters.severities }),
        ...(filters.types && { types: filters.types }),
        ...(filters.issueStatuses && { issueStatuses: filters.issueStatuses }),
      };
      const result = await listIssues(params);
      setIssues(result.issues);
      setComponents(result.components);
      setTotal(result.paging.total);
      if (result.issues.length > 0) {
        const keys = result.issues.map((i) => i.key);
        const fixed = await checkIssuesFixed(projectKey, keys);
        setEverFixedMap(fixed);
      } else {
        setEverFixedMap({});
      }
    } catch (err) {
      if (err instanceof Error) {
        showSnackbar(`Error fetching issues: ${err.message}`, 'error');
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setLoading(false);
    }
  }, [
    projectKey,
    filters.page,
    filters.rowsPerPage,
    filters.severities,
    filters.types,
    filters.issueStatuses,
    s,
    asc,
    showSnackbar,
  ]);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  const componentMap = useMemo(
    () =>
      components.reduce((acc, c) => {
        acc[c.key] = c;
        return acc;
      }, {} as Record<string, SonarQubeComponent>),
    [components]
  );

  const groupedIssues: GroupedIssues = useMemo(() => {
    return issues.reduce((acc, issue) => {
      const key = issue.component;
      if (!acc[key]) acc[key] = [];
      acc[key].push(issue);
      return acc;
    }, {} as GroupedIssues);
  }, [issues]);

  return {
    // data
    issues,
    components,
    total,
    componentMap,
    groupedIssues,
    everFixedMap,
    setEverFixedMap,
    // status
    loading,
    error,
    // actions
    fetchIssues,
  };
}