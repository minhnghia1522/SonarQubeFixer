import { contextBridge, ipcRenderer } from "electron";
import { SonarQubeSetup } from "./types";

contextBridge.exposeInMainWorld("electronAPI", {
  listProjects: () => ipcRenderer.invoke("sonarqube:list-projects"),
  updateSonarQubeConfig: (setup: SonarQubeSetup) =>
    ipcRenderer.send("sonarqube:update-config", setup),
});
