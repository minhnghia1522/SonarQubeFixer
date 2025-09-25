import { contextBridge, ipcRenderer } from "electron";
import { IssuesParams, SonarQubeIssue, SonarQubeSetup } from "./types";

contextBridge.exposeInMainWorld("electronAPI", {
  updateSonarQubeConfig: (setup: SonarQubeSetup) =>
    ipcRenderer.send("sonarqube:update-config", setup),
  listProjects: () => ipcRenderer.invoke("sonarqube:list-projects"),
  listIssues: (params: IssuesParams) =>
    ipcRenderer.invoke("sonarqube:list-issues", params),
  fixIssue: (payload: SonarQubeIssue) =>
    ipcRenderer.invoke("fix-issue", payload),
  getProjectDirectory: (projectKey: string) =>
    ipcRenderer.invoke("project:get-directory", projectKey),
  setProjectDirectory: (projectKey: string, path: string) =>
    ipcRenderer.invoke("project:set-directory", { projectKey, path }),
  selectProjectDirectory: () => ipcRenderer.invoke("project:select-directory"),
});
