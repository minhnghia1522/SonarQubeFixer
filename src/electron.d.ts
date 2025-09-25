import {
  SonarQubeProjectsResult,
  SonarQubeSetup,
  ISonarQubeClient,
  SonarQubeIssue,
} from "./types";

export interface IElectronAPI extends ISonarQubeClient {
  updateSonarQubeConfig: (setup: SonarQubeSetup) => void;
  fixIssue: (payload: SonarQubeIssue) => Promise<string>;
  getProjectDirectory: (projectKey: string) => Promise<string | null>;
  setProjectDirectory: (projectKey: string, path: string) => Promise<void>;
  selectProjectDirectory: () => Promise<string | null>;
  checkIssuesFixed: (
    projectKey: string,
    issueKeys: string[]
  ) => Promise<Record<string, boolean>>;
  readIssueLog: (
    projectKey: string,
    issueKey: string
  ) => Promise<string | null>;
  openExternal: (url: string) => void;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}