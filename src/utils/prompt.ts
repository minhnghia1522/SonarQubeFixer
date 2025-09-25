import { SonarQubeIssue } from "src/types";

export class Prompt {
  static fixIssue(issue: SonarQubeIssue, filePath: string): string {
    const languageAndTags =
      issue.tags.length > 0
        ? `specializing in ${issue.tags.join(" and ")}`
        : "specializing in general code quality";

    return this
      .formatOneLine(`You are an autonomous senior software engineer AI ${languageAndTags}.
        Fix issue identified by SonarQube.

        **Issue Details:**
        - **Full Path:** ${filePath}
        - **Line:** ${issue.line}
        - **Rule:** ${issue.rule}
        - **Severity:** ${issue.severity}
        - **Message:** ${issue.message}

        **Instructions:**
        1.  **Analyze the issue** described above at line ${issue.line} in the file located at \`${filePath}\`.
        2.  **Correct the code** to resolve the issue. Only change what is necessary to apply the fix. Do not refactor unrelated code.
`);
  }

  private static formatOneLine(text: string): string {
    return text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .join(" ");
  }
}
