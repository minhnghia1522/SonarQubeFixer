import { SonarQubeClient as WebApiClient } from "sonarqube-web-api-client";

export class SonarQubeBaseClient {
  protected readonly client: WebApiClient;

  constructor(
    sonarqubeUrl: string,
    sonarqubeToken: string,
    sonarqubeOrganization?: string
  ) {
    this.client = new WebApiClient(
      sonarqubeUrl,
      sonarqubeToken,
      sonarqubeOrganization
    );
  }
}

export const sonarQubeBaseClient = new SonarQubeBaseClient(
  localStorage.getItem("sonarqubeUrl") || "",
  localStorage.getItem("sonarqubeToken") || "",
  localStorage.getItem("sonarqubeOrganization") || undefined
);
