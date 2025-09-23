import { PaginationParams } from "src/types/common";
import { SonarQubeProjectsResult } from "src/types/projects";
import { BaseDomain } from "./base";

export class ProjectsDomain extends BaseDomain {
  async listProjects(
    params: PaginationParams = {}
  ): Promise<SonarQubeProjectsResult> {
    const { page, pageSize } = params;

    try {
      const builder = this.webApiClient.projects.search();

      if (page !== undefined) {
        builder.page(page);
      }
      if (pageSize !== undefined) {
        builder.pageSize(pageSize);
      }

      const response = await builder.execute();

      // Transform to our interface
      return {
        projects: response.components.map((component) => ({
          key: component.key,
          name: component.name,
          qualifier: component.qualifier,
          visibility: component.visibility,
          lastAnalysisDate: component.lastAnalysisDate,
          revision: component.revision,
          managed: component.managed,
        })),
        paging: response.paging,
      };
    } catch (error) {
      console.error("Failed to list projects", error);
      throw error;
    }
  }
}
