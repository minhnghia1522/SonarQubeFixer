import { useCallback, useState } from 'react';
import type { IssuesParams } from '../../../types/issues';

type IssueTypes = NonNullable<IssuesParams['types']>;
type IssueStatuses = NonNullable<IssuesParams['issueStatuses']>;

export type IssueFilters = {
  search: string;
  severity: '' | 'INFO' | 'MINOR' | 'MAJOR' | 'CRITICAL' | 'BLOCKER';
  type: IssueTypes;
  statuses: IssueStatuses;
  page: number;
  rowsPerPage: number;
};

/**
 * Manage filter and pagination state for Issues screen.
 * Keep defaults aligned with the original route implementation.
 */
export function useIssueFilters(initial?: Partial<IssueFilters>) {
  const [search, setSearch] = useState<IssueFilters['search']>(initial?.search ?? '');
  const [severity, setSeverity] = useState<IssueFilters['severity']>(initial?.severity ?? '');
  const [type, setType] = useState<IssueFilters['type']>(
    initial?.type ?? (['BUG', 'VULNERABILITY', 'CODE_SMELL'] as IssueTypes)
  );
  const [statuses, setStatuses] = useState<IssueFilters['statuses']>(
    initial?.statuses ?? (['OPEN', 'CONFIRMED'] as IssueStatuses)
  );
  const [page, _setPage] = useState<IssueFilters['page']>(initial?.page ?? 0);
  const [rowsPerPage, _setRowsPerPage] = useState<IssueFilters['rowsPerPage']>(
    initial?.rowsPerPage ?? 50
  );

  // Reset page to 0 when filters change intentionally
  const applyFilters = useCallback(() => {
    _setPage(0);
  }, []);

  const setPage = useCallback((p: number) => {
    _setPage(p);
  }, []);

  const setRowsPerPage = useCallback((n: number) => {
    _setRowsPerPage(n);
    _setPage(0); // keep behavior: reset to first page when page size changes
  }, []);

  return {
    filters: { search, severity, type, statuses, page, rowsPerPage } as IssueFilters,
    // individual setters (can be passed down to toolbar)
    setSearch,
    setSeverity,
    setType,
    setStatuses,
    // pagination
    setPage,
    setRowsPerPage,
    // apply (e.g., onBlur or explicit apply button)
    applyFilters,
  };
}