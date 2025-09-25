import { useCallback, useEffect, useMemo, useState } from 'react';

/**
 * Manage selection state for issues (current page and across pages).
 */
export function useSelection(deps?: { resetKeys?: any[] }) {
  const [selectedIssues, setSelectedIssues] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [selectAllAcrossPages, setSelectAllAcrossPages] = useState(false);

  // Reset selection when dependencies change (filters, pagination, etc.)
  useEffect(() => {
    setSelectedIssues(new Set());
    setSelectAll(false);
    setSelectAllAcrossPages(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps?.resetKeys ?? []);

  const toggleSelect = useCallback((issueKey: string) => {
    setSelectedIssues((prev) => {
      const next = new Set(prev);
      if (next.has(issueKey)) next.delete(issueKey);
      else next.add(issueKey);
      return next;
    });
  }, []);

  const toggleSelectAllOnPage = useCallback((issueKeysOnPage: string[]) => {
    setSelectedIssues((prev) => {
      const next = new Set(prev);
      if (issueKeysOnPage.every((k) => next.has(k))) {
        // unselect all on page
        issueKeysOnPage.forEach((k) => next.delete(k));
        setSelectAll(false);
      } else {
        // select all on page
        issueKeysOnPage.forEach((k) => next.add(k));
        setSelectAll(true);
      }
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIssues(new Set());
    setSelectAll(false);
    setSelectAllAcrossPages(false);
  }, []);

  const selectedCount = useMemo(() => selectedIssues.size, [selectedIssues]);

  return {
    // state
    selectedIssues,
    selectedCount,
    selectAll,
    selectAllAcrossPages,
    // setters
    setSelectAllAcrossPages,
    setSelectAll,
    setSelectedIssues,
    // actions
    toggleSelect,
    toggleSelectAllOnPage,
    clearSelection,
  };
}