import Store from "electron-store";
import z from "zod";

const ProjectDirectoriesSchema = z.record(z.string(), z.string());

type ProjectDirectories = z.infer<typeof ProjectDirectoriesSchema>;

const schema = {
  projectDirectories: {
    type: "object" as const,
    additionalProperties: {
      type: "string" as const,
    },
    default: {},
  },
  sonarQubeSetup: {
    type: "object" as const,
    properties: {
      sonarqubeUrl: { type: "string" as const },
      sonarqubeToken: { type: "string" as const },
      sonarqubeOrganization: { type: "string" as const },
    },
    default: {},
  },
};

const store = new Store({ schema });

export const getProjectDirectory = (projectKey: string): string | undefined => {
  const directories = (store as any).store.projectDirectories;
  return directories?.[projectKey];
};

export const setProjectDirectory = (projectKey: string, path: string) => {
  const directories = (store as any).store.projectDirectories;
  const newDirectories: ProjectDirectories = { ...directories, [projectKey]: path };
  (store as any).set("projectDirectories", newDirectories);
};

export default store;