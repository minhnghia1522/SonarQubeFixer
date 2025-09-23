import { SonarQubeClient as WebApiClient } from "sonarqube-web-api-client";

export abstract class BaseDomain {
  constructor(
    protected readonly webApiClient: WebApiClient,
    protected readonly organization: string | null
  ) {}
}
