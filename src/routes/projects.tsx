import { useSnackbar } from "../contexts/SnackbarContext";
import { SonarQubeProject } from "../types";
import { createFileRoute } from "@tanstack/react-router";
import React, { useEffect, useState } from "react";
import {
  Box,
  CircularProgress,
  List,
  Paper,
  Typography,
} from "@mui/material";
import { ProjectItem } from "../components/ProjectItem";

export const Route = createFileRoute("/projects")({
  component: ProjectsPage,
});

function ProjectsPage() {
  const [projects, setProjects] = useState<SonarQubeProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showSnackbar } = useSnackbar();

  const handleFetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await window.electronAPI.listProjects({});
      setProjects(result.projects);
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes("Insufficient privileges")) {
          showSnackbar("Token does not have permission to fetch the project list!", "error");
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

  useEffect(() => {
    handleFetchProjects();
  }, []);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Projects
      </Typography>

      {loading && <CircularProgress />}

      {error && (
        <Typography color="error">
          Could not connect: {error}. Please check your token and permissions.
        </Typography>
      )}

      {!loading && !error && (
        <Paper>
          <List>
            {projects.map((project) => (
              <ProjectItem key={project.key} project={project} />
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
}
