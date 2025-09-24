import { contextBridge, ipcRenderer } from "electron";
import { IssuesParams, SonarQubeSetup } from "./types";

contextBridge.exposeInMainWorld("electronAPI", {
  updateSonarQubeConfig: (setup: SonarQubeSetup) =>
    ipcRenderer.send("sonarqube:update-config", setup),
  listProjects: () => ipcRenderer.invoke("sonarqube:list-projects"),
  listIssues: (params: IssuesParams) =>
    ipcRenderer.invoke("sonarqube:list-issues", params),
  fixIssue: (issueKey: string) => ipcRenderer.invoke("fix-issue", issueKey),
});
