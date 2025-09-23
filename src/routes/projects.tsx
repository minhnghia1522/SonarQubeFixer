import { useSnackbar } from "../contexts/SnackbarContext";
import { SonarQubeProject } from "../types";
import { getSonarQubeSetup } from "../utils/setupUtil";
import { createFileRoute } from "@tanstack/react-router";
import React, { useEffect, useState } from "react";

export const Route = createFileRoute()({
  component: ProjectsPage,
});

function ProjectsPage() {
  const [projects, setProjects] = useState<SonarQubeProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    // Send the setup to the main process as soon as the component mounts
    // and every time the setup might change.
    const setup = getSonarQubeSetup();
    if (setup.sonarqubeToken) {
      window.electronAPI.updateSonarQubeConfig(setup);
    }
  }, []);

  const handleFetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await window.electronAPI.listProjects({});
      setProjects(result.projects);
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes("Insufficient privileges")) {
          showSnackbar("Token không có quyền lấy danh sách project!", "error");
        }
        console.log("Error fetching projects:", err);
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Projects Page</h1>
      <p>This is the Projects page.</p>
      <button onClick={handleFetchProjects} disabled={loading}>
        {loading ? "Loading..." : "Fetch Projects"}
      </button>

      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      <ul>
        {projects.map((project) => (
          <li key={project.key}>
            {project.name} ({project.key})
          </li>
        ))}
      </ul>
    </div>
  );
}
