import { app, BrowserWindow, ipcMain, dialog } from "electron";
import path from "node:path";
import fs from "node:fs";
import { spawn } from "node:child_process";
import started from "electron-squirrel-startup";
import store, {
  getProjectDirectory,
  setProjectDirectory,
} from "./storage/store";
import { IssuesParams, SonarQubeIssue, SonarQubeSetup } from "./types";
import { SonarQubeClient } from "./sonarqube";
import { Prompt } from "./utils/prompt";
import { writeLog } from "./utils/logUtil";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

ipcMain.on("sonarqube:update-config", (_, setup: SonarQubeSetup) => {
  (store as any).set("sonarQubeSetup", setup);
});

ipcMain.handle("project:get-directory", (_, projectKey: string) => {
  return getProjectDirectory(projectKey);
});

ipcMain.handle("project:set-directory", (_, { projectKey, path }) => {
  setProjectDirectory(projectKey, path);
});

ipcMain.handle("project:select-directory", async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ["openDirectory"],
  });
  if (canceled) {
    return null;
  } else {
    return filePaths[0];
  }
});

ipcMain.handle("sonarqube:list-projects", async () => {
  const sonarQubeSetup = (store as any).store.sonarQubeSetup as SonarQubeSetup;
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
  const sonarQubeSetup = (store as any).store.sonarQubeSetup as SonarQubeSetup;
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

ipcMain.handle("fix-issue", async (_, issue: SonarQubeIssue) => {
  const projectDir = getProjectDirectory(issue.project);
  if (!projectDir) {
    throw new Error(
      `Project directory not set for ${issue.project}. Please set it before fixing issues.`
    );
  }
  const componentPath = issue.component.includes(":")
    ? issue.component.substring(issue.component.lastIndexOf(":") + 1)
    : issue.component;
  const normalizedComponentPath = path.normalize(componentPath);
  if (path.isAbsolute(normalizedComponentPath)) {
    throw new Error(
      `Component path "${issue.component}" resolves outside of project directory.`
    );
  }
  const pathToFile = path.join(projectDir, normalizedComponentPath).normalize();
  if (!fs.existsSync(pathToFile)) {
    throw new Error(
      `File for component "${issue.component}" not found at ${pathToFile}.`
    );
  }
  const prompt = Prompt.fixIssue(issue, pathToFile);
  return new Promise(async (resolve, reject) => {
    try {
      const resultFixed = await codexExecute(prompt, projectDir);

      // Ghi log sử dụng utils, path là từ thư mục ứng dụng
      try {
        const logRelativePath = path.join(issue.project, issue.key, "log.txt");
        writeLog(logRelativePath, String(resultFixed), "append");
      } catch (logErr) {
        console.error("Ghi log thất bại:", logErr);
      }

      // const responseJson = await codexExecute(
      //   Prompt.formatResponseIssueFixed(resultFixed as string),
      //   projectDir
      // );
      resolve("Fixed "+ issue.key );
    } catch (error) {
      reject(error);
    }
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

const codexExecute = async (
  prompt: string,
  projectDir: string,
  model: string = "gpt-4.1"
) => {
  const quotedPrompt = `"${prompt.replace(/"/g, '\\"')}"`;
  return new Promise((resolve, reject) => {
    const command = "codex";
    const args = [
      "exec",
      "--yolo",
      "--model",
      model,
      quotedPrompt,
      "--skip-git-repo-check",
    ];
    console.log(`Executing command: ${command} ${args.join(" ")}`);
    const process = spawn(command, args, {
      shell: true,
      cwd: projectDir,
    });

    let result = "";

    process.stdout.on("data", (data) => {
      result += data;
    });

    process.stderr.on("data", (data) => {
      result += data;
    });

    process.on("close", (code) => {
      console.log(`result: ${result}`);
      if (code === 0) {
        resolve(result);
      } else {
        reject(new Error(`Process exited with code ${code}`));
      }
    });
  });
};
