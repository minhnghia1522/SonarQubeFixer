/**
 * Projects service wrapping window.electronAPI for project directory operations.
 */
export async function getProjectDirectory(projectKey: string): Promise<string | null> {
  return window.electronAPI.getProjectDirectory(projectKey);
}

export async function setProjectDirectory(projectKey: string, path: string): Promise<void> {
  return window.electronAPI.setProjectDirectory(projectKey, path);
}

export async function selectProjectDirectory(): Promise<string | null> {
  return window.electronAPI.selectProjectDirectory();
}