import fs from "node:fs";
import path from "node:path";

/**
 * Writes a log to a file using an absolute path from the application directory (process.cwd())
 * @param relativePath The relative path from the application directory, e.g., "keyproject/issuekey/log.txt"
 * @param content The log content to write
 * @param mode "append" (mặc định) hoặc "overwrite"
 */
export function writeLog(
  relativePath: string,
  content: string,
  mode: "append" | "overwrite" = "append"
) {
  const appDir = process.cwd();
  const logPath = path.join(appDir, "fix-issue-log/" + relativePath);
  const logDir = path.dirname(logPath);

  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  if (mode === "overwrite") {
    fs.writeFileSync(logPath, content, "utf8");
  } else {
    fs.appendFileSync(logPath, content + "\n", "utf8");
  }
}

/**
 * Reads the content of a log file from a relative path within the application directory
 * @param relativePath The relative path from the application directory
 * @returns The file content or null if it does not exist
 */
export function readLog(relativePath: string): string | null {
  const appDir = process.cwd();
  const logPath = path.join(appDir, "fix-issue-log", relativePath);
  try {
    if (fs.existsSync(logPath)) {
      return fs.readFileSync(logPath, "utf8");
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Deletes a log file from a relative path within the application directory
 * @param relativePath The relative path from the application directory
 * @returns true if deletion is successful, false if the file does not exist or an error occurs
 */
export function deleteLog(relativePath: string): boolean {
  const appDir = process.cwd();
  const logPath = path.join(appDir, relativePath);
  try {
    if (fs.existsSync(logPath)) {
      fs.unlinkSync(logPath);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
