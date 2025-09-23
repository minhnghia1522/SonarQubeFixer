import {
  SonarQubeProjectsResult,
  SonarQubeSetup,
  ISonarQubeClient,
} from "./types";

export interface IElectronAPI extends ISonarQubeClient {
  updateSonarQubeConfig: (setup: SonarQubeSetup) => void;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}