// Import types for interface definitions
import type { PaginationParams } from "./common.js";
import type { SonarQubeProjectsResult } from "./projects.js";

// Common types
export type { PaginationParams, SeverityLevel } from "./common.js";

// Project types
export type { SonarQubeProject, SonarQubeProjectsResult } from "./projects.js";

export type SonarQubeSetup = {
  sonarqubeUrl: string;
  sonarqubeToken: string;
  sonarqubeOrganization?: string;
};

export type {
  SonarQubeIssue,
  SonarQubeIssueComment,
  SonarQubeIssueFlow,
  SonarQubeIssueImpact,
  SonarQubeIssueLocation,
  SonarQubeMessageFormatting,
  SonarQubeTextRange,
  SonarQubeComponent,
  SonarQubeRule,
  SonarQubeUser,
  SonarQubeFacet,
  SonarQubeFacetValue,
  SonarQubeIssuesResult,
  IssuesParams,
  MarkIssueFalsePositiveParams,
  MarkIssueWontFixParams,
  BulkIssueMarkParams,
  AddCommentToIssueParams,
  AssignIssueParams,
  ConfirmIssueParams,
  UnconfirmIssueParams,
  ResolveIssueParams,
  ReopenIssueParams,
  DoTransitionRequest,
  DoTransitionResponse,
} from "./issues.js";

// Client interface
export interface ISonarQubeClient {
  listProjects(params?: PaginationParams): Promise<SonarQubeProjectsResult>;
}
