// Import types for interface definitions
import type { PaginationParams } from "./common.js";
import type { SonarQubeProjectsResult } from "./projects.js";

// Common types
export type { PaginationParams, SeverityLevel } from "./common.js";

// Project types
export type { SonarQubeProject, SonarQubeProjectsResult } from "./projects.js";

// Client interface
export interface ISonarQubeClient {
  listProjects(params?: PaginationParams): Promise<SonarQubeProjectsResult>;
}
