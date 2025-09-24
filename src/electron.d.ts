import {
  SonarQubeProjectsResult,
  SonarQubeSetup,
  ISonarQubeClient,
} from "./types";

export interface IElectronAPI extends ISonarQubeClient {
  updateSonarQubeConfig: (setup: SonarQubeSetup) => void;
  fixIssue: (issueKey: string) => Promise<string>;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}