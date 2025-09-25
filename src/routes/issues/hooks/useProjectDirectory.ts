import { useCallback, useEffect, useState } from 'react';
import { getProjectDirectory, setProjectDirectory, selectProjectDirectory } from '../../../domains/projects.service';
import { useSnackbar } from '../../../contexts/SnackbarContext';

/**
 * Manage project directory selection and persistence for a given projectKey.
 */
export function useProjectDirectory(projectKey: string) {
  const { showSnackbar } = useSnackbar();
  const [projectDir, setProjectDir] = useState<string | null>(null);
  const [loadingDir, setLoadingDir] = useState<boolean>(false);

  const refresh = useCallback(async () => {
    setLoadingDir(true);
    try {
      const dir = await getProjectDirectory(projectKey);
      setProjectDir(dir);
    } catch (err) {
      if (err instanceof Error) {
        showSnackbar(`Error fetching project directory: ${err.message}`, 'error');
      }
    } finally {
      setLoadingDir(false);
    }
  }, [projectKey, showSnackbar]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const onSelectDirectory = useCallback(async () => {
    try {
      const dir = await selectProjectDirectory();
      if (dir) {
        await setProjectDirectory(projectKey, dir);
        setProjectDir(dir);
        showSnackbar('Project directory updated successfully', 'success');
      }
    } catch (err) {
      if (err instanceof Error) {
        showSnackbar(`Error selecting directory: ${err.message}`, 'error');
      }
    }
  }, [projectKey, showSnackbar]);

  return {
    projectDir,
    loadingDir,
    refresh,
    onSelectDirectory,
    setProjectDir, // expose in case caller needs to set after custom flow
  };
}