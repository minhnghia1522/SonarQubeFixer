import { IssuesDomain, ProjectsDomain } from "./domains";
import {
  ISonarQubeClient,
  IssuesParams,
  PaginationParams,
  SonarQubeIssuesResult,
  SonarQubeProjectsResult,
} from "./types";
const { SonarQubeClient: WebApiClient } = require("sonarqube-web-api-client");

const DEFAULT_SONARQUBE_URL = "https://sonarcloud.io";
type OptionalOrganization = string | null;

export class SonarQubeClient implements ISonarQubeClient {
  private readonly webApiClient: typeof WebApiClient;
  private readonly organization: OptionalOrganization;

  // Domain modules
  private readonly projectsDomain: ProjectsDomain;
  private readonly issuesDomain: IssuesDomain;

  constructor(
    baseUrl = DEFAULT_SONARQUBE_URL,
    token: string,
    organization?: OptionalOrganization
  ) {
    this.webApiClient = WebApiClient.withToken(
      baseUrl,
      token,
      organization ? { organization } : undefined
    );
    this.organization = organization ?? null;

    // Initialize domain modules
    this.projectsDomain = new ProjectsDomain(
      this.webApiClient,
      this.organization
    );
    this.issuesDomain = new IssuesDomain(this.webApiClient, this.organization);
  }

  listProjects(params?: PaginationParams): Promise<SonarQubeProjectsResult> {
    return this.projectsDomain.listProjects(params);
  }

  listIssues(params: IssuesParams): Promise<SonarQubeIssuesResult> {
    return this.issuesDomain.getIssues(params);
  }
}
