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

  static formatResponseIssueFixed(outResponse: string) {
    return this.formatOneLine(`
      Format the provided text into a valid JSON object using the following structure:
        {
          "fileChange": "<insert the relevant description or identifier for the file change>",
          "originText": {
            "lineStart": <number indicating the starting line of the original text>,
            "lineEnd": <number indicating the ending line of the original text>,
            "content": "<insert the exact content of the text before the change>"
          },
          "changeText": {
            "lineStart": <number indicating the starting line of the changed text>,
            "lineEnd": <number indicating the ending line of the changed text>,
            "content": "<insert the exact content of the text after the change>"
          }
          "tokenUsage: <tokens used>
        }
      Ensure that all fields are accurately filled based on the information from the provided text. Replace any placeholder values with the actual data extracted from the input. The final output should be a single, well-formatted JSON object that strictly adheres to the specified template. Use the following text as your data source: ${outResponse}
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
