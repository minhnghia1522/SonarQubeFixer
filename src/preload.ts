import { contextBridge, ipcRenderer } from "electron";
import { IssuesParams, SonarQubeSetup } from "./types";

contextBridge.exposeInMainWorld("electronAPI", {
  listProjects: () => ipcRenderer.invoke("sonarqube:list-projects"),
  updateSonarQubeConfig: (setup: SonarQubeSetup) =>
    ipcRenderer.send("sonarqube:update-config", setup),
  listIssues: (params: IssuesParams) =>
    ipcRenderer.invoke("sonarqube:list-issues", params),
});
