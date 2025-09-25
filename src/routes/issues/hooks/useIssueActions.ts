import { useCallback, useState } from 'react';
import type { SonarQubeIssue } from '../../../types/issues';
import { fixIssue } from '../../../domains/issues.service';
import { getSonarQubeUrl } from '../../../domains/settings.service';
import { setProjectDirectory, selectProjectDirectory } from '../../../domains/projects.service';
import { useSnackbar } from '../../../contexts/SnackbarContext';

type EnsureDirFn = () => Promise<string | null>;
type OnIssueFixed = (issue: SonarQubeIssue) => void;

export function useIssueActions(
  projectKey: string,
  opts?: { ensureProjectDir?: EnsureDirFn; onIssueFixed?: OnIssueFixed }
) {
  const { showSnackbar } = useSnackbar();

  const [rowLoading, setRowLoading] = useState<Record<string, boolean>>({});
  const [logViewerOpen, setLogViewerOpen] = useState(false);
  const [selectedIssueKey, setSelectedIssueKey] = useState<string | null>(null);

  const ensureProjectDirInternal: EnsureDirFn = useCallback(async () => {
    const dir = await selectProjectDirectory();
    if (dir) {
      await setProjectDirectory(projectKey, dir);
      return dir;
    }
    return null;
  }, [projectKey]);

  const handleOpenIssueInSonarQube = useCallback(
    (issueKey: string) => {
      const urlBase = getSonarQubeUrl();
      if (!urlBase) {
        showSnackbar('Chưa cấu hình SonarQube URL!', 'error');
        return;
      }
      const url = `${urlBase}/project/issues?open=${issueKey}&id=${projectKey}`;
      window.electronAPI.openExternal(url);
    },
    [projectKey, showSnackbar]
  );

  const handleFixIssue = useCallback(
    async (issue: SonarQubeIssue, projectDir?: string | null) => {
      let dir = projectDir ?? null;
      if (!dir) {
        showSnackbar('Please select the project directory first.', 'warning');
        const ensured = await (opts?.ensureProjectDir
          ? opts.ensureProjectDir()
          : ensureProjectDirInternal());
        if (!ensured) {
          return; // cancelled
        }
        dir = ensured;
      }

      setRowLoading((prev) => ({ ...prev, [issue.key]: true }));
      try {
        const result = await fixIssue(issue);
        showSnackbar(result, 'success');
        opts?.onIssueFixed?.(issue);
      } catch (err) {
        if (err instanceof Error) {
          showSnackbar(`Error fixing issue: ${err.message}`, 'error');
        } else {
          showSnackbar('An unknown error occurred while fixing issue.', 'error');
        }
      } finally {
        setRowLoading((prev) => ({ ...prev, [issue.key]: false }));
      }
    },
    [ensureProjectDirInternal, opts, showSnackbar]
  );

  const handleViewLogClick = useCallback((issueKey: string) => {
    setSelectedIssueKey(issueKey);
    setLogViewerOpen(true);
  }, []);

  const handleCloseLogViewer = useCallback(() => {
    setLogViewerOpen(false);
    setSelectedIssueKey(null);
  }, []);

  return {
    // state
    rowLoading,
    logViewerOpen,
    selectedIssueKey,
    // actions
    handleOpenIssueInSonarQube,
    handleFixIssue,
    handleViewLogClick,
    handleCloseLogViewer,
  };
}