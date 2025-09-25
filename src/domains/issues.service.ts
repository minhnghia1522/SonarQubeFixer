import type { IssuesParams, SonarQubeIssuesResult, SonarQubeIssue } from '../types/issues';

/**
 * Issues service wrapping window.electronAPI for UI layer usage.
 * Keep contract identical to current route usage for a non-breaking refactor.
 */
export async function listIssues(params: IssuesParams): Promise<SonarQubeIssuesResult> {
  return window.electronAPI.listIssues(params);
}

export async function checkIssuesFixed(
  projectKey: string,
  issueKeys: string[]
): Promise<Record<string, boolean>> {
  return window.electronAPI.checkIssuesFixed(projectKey, issueKeys);
}

export async function fixIssue(issue: SonarQubeIssue): Promise<string> {
  return window.electronAPI.fixIssue(issue);
}