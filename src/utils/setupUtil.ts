export const getSonarQubeSetup = () => {
  const sonarqubeUrl = localStorage.getItem("sonarqubeUrl") || "";
  const sonarqubeToken = localStorage.getItem("sonarqubeToken") || "";
  const sonarqubeOrganization =
    localStorage.getItem("sonarqubeOrganization") || "";
  return {
    sonarqubeUrl,
    sonarqubeToken,
    sonarqubeOrganization,
  };
};
