import { app, BrowserWindow, ipcMain } from "electron";
import path from "node:path";
import { spawn } from "node:child_process";
import started from "electron-squirrel-startup";
import store from "./storage/store";
import { IssuesParams, SonarQubeSetup } from "./types";
import { SonarQubeClient } from "./sonarqube";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

ipcMain.on("sonarqube:update-config", (_, setup: SonarQubeSetup) => {
  store.set("sonarQubeSetup", setup);
});

ipcMain.handle("sonarqube:list-projects", async () => {
  const sonarQubeSetup = store.get("sonarQubeSetup");
  if (!sonarQubeSetup || !sonarQubeSetup.sonarqubeToken) {
    throw new Error("SonarQube setup is not configured.");
  }

  const client = new SonarQubeClient(
    sonarQubeSetup.sonarqubeUrl,
    sonarQubeSetup.sonarqubeToken,
    sonarQubeSetup.sonarqubeOrganization
  );

  return await client.listProjects();
});

ipcMain.handle("sonarqube:list-issues", async (_, params: IssuesParams) => {
  const sonarQubeSetup = store.get("sonarQubeSetup");
  if (!sonarQubeSetup || !sonarQubeSetup.sonarqubeToken) {
    throw new Error("SonarQube setup is not configured.");
  }

  const client = new SonarQubeClient(
    sonarQubeSetup.sonarqubeUrl,
    sonarQubeSetup.sonarqubeToken,
    sonarQubeSetup.sonarqubeOrganization
  );

  return await client.listIssues(params);
});

ipcMain.handle("fix-issue", async (_, issueKey: string) => {
  console.log(`Fixing issue: ${issueKey}`);
  return new Promise((resolve, reject) => {
    const command = "codex";
    const args = [
      "exec",
      "--yolo",
      "--model",
      "gpt-4.1",
      '"What time UTC is it now in Vietnam?"',
      "--skip-git-repo-check",
    ];
    console.log(`Executing command: ${command} ${args.join(" ")}`);
    const process = spawn(command, args, {
      shell: true,
    });
    let result = "";
    process.stdout.on("data", (data) => {
      console.log(`stdout: ${data}`);
      result += data;
    });

    process.stderr.on("data", (data) => {
      console.error(`stderr: ${data}`);
      result += data;
    });

    process.on("close", (code) => {
      if (code === 0) {
        resolve(result);
      } else {
        reject(new Error(`Process exited with code ${code}`));
      }
    });
  });
});

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
