import fs from "node:fs";
import path from "node:path";

/**
 * Ghi log vào file theo đường dẫn tuyệt đối từ thư mục ứng dụng (process.cwd())
 * @param relativePath Đường dẫn tương đối từ thư mục ứng dụng, ví dụ: "keyproject/issuekey/log.txt"
 * @param content Nội dung log cần ghi
 * @param mode "append" (mặc định) hoặc "overwrite"
 */
export function writeLog(
  relativePath: string,
  content: string,
  mode: "append" | "overwrite" = "append"
) {
  const appDir = process.cwd();
  const logPath = path.join(appDir, "fix-issue-log/"+relativePath);
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
 * Đọc nội dung file log theo đường dẫn tương đối từ thư mục ứng dụng
 * @param relativePath Đường dẫn tương đối từ thư mục ứng dụng
 * @returns Nội dung file hoặc null nếu không tồn tại
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
 * Xóa file log theo đường dẫn tương đối từ thư mục ứng dụng
 * @param relativePath Đường dẫn tương đối từ thư mục ứng dụng
 * @returns true nếu xóa thành công, false nếu không tồn tại hoặc lỗi
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