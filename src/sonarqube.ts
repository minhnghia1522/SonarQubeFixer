import { ProjectsDomain } from "./domains";
import {
  ISonarQubeClient,
  PaginationParams,
  SonarQubeProjectsResult,
} from "./types";
import { SonarQubeClient as WebApiClient } from "sonarqube-web-api-client";

const DEFAULT_SONARQUBE_URL = "https://sonarcloud.io";
type OptionalOrganization = string | null;


export class SonarQubeClient implements ISonarQubeClient {
  private readonly webApiClient: WebApiClient;
  private readonly organization: OptionalOrganization;

  // Domain modules
  private readonly projectsDomain: ProjectsDomain;

  constructor(
    token: string,
    baseUrl = DEFAULT_SONARQUBE_URL,
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
  }

  listProjects(params?: PaginationParams): Promise<SonarQubeProjectsResult> {
    return this.projectsDomain.listProjects(params);
  }
}
