import { SonarQubeProject } from "../types";
import { Box, Card, CardContent, Chip, Grid, Typography } from "@mui/material";
import { StarBorder } from "@mui/icons-material";
import React from "react";

interface ProjectItemProps {
  project: SonarQubeProject;
}

const Rating = ({ rating, value }: { rating: string; value: string }) => {
  let color: "success" | "warning" | "error" | "info" | "default" = "default";
  switch (rating) {
    case "A":
      color = "success";
      break;
    case "B":
      color = "info";
      break;
    case "C":
      color = "warning";
      break;
    case "D":
    case "E":
      color = "error";
      break;
  }

  return (
    <Chip
      label={rating}
      color={color}
      size="small"
      sx={{ mr: 1, borderRadius: "4px", minWidth: "24px", height: "24px" }}
    />
  );
};

export const ProjectItem: React.FC<ProjectItemProps> = ({ project }) => {
  const lastAnalysis = project.lastAnalysisDate
    ? new Date(project.lastAnalysisDate).toLocaleDateString()
    : "N/A";

  const metrics = {
    security: { rating: "A", value: "0" },
    reliability: { rating: "C", value: "4" },
    maintainability: { rating: "A", value: "31" },
    hotspots: { rating: "E", value: "0.0%" },
    coverage: { value: "0.0%" },
    duplications: { value: "2.8%" },
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <StarBorder sx={{ mr: 1, color: "text.secondary" }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {project.name}
          </Typography>
          <Chip
            label={project.visibility.toUpperCase()}
            size="small"
            sx={{ mr: 2 }}
          />
          <Chip
            label={status}
            color={status === "Failed" ? "error" : "success"}
            size="small"
            variant="outlined"
          />
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Last analysis: {lastAnalysis}
        </Typography>

        <Box sx={{ borderTop: 1, borderColor: "divider", pt: 2 }}>
          <Grid container spacing={2}>
            <Grid size={2}>
              <Typography variant="body2" color="text.secondary">
                Security
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Rating
                  rating={metrics.security.rating}
                  value={metrics.security.value}
                />
                <Typography variant="body2">
                  {metrics.security.value}
                </Typography>
              </Box>
            </Grid>
            <Grid size={2}>
              <Typography variant="body2" color="text.secondary">
                Reliability
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Rating
                  rating={metrics.reliability.rating}
                  value={metrics.reliability.value}
                />
                <Typography variant="body2">
                  {metrics.reliability.value}
                </Typography>
              </Box>
            </Grid>
            <Grid size={2}>
              <Typography variant="body2" color="text.secondary">
                Maintainability
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Rating
                  rating={metrics.maintainability.rating}
                  value={metrics.maintainability.value}
                />
                <Typography variant="body2">
                  {metrics.maintainability.value}
                </Typography>
              </Box>
            </Grid>
            <Grid size={2}>
              <Typography variant="body2" color="text.secondary">
                Hotspots Reviewed
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Rating
                  rating={metrics.hotspots.rating}
                  value={metrics.hotspots.value}
                />
                <Typography variant="body2">
                  {metrics.hotspots.value}
                </Typography>
              </Box>
            </Grid>
            <Grid size={2}>
              <Typography variant="body2" color="text.secondary">
                Coverage
              </Typography>
              <Typography variant="body2">{metrics.coverage.value}</Typography>
            </Grid>
            <Grid size={2}>
              <Typography variant="body2" color="text.secondary">
                Duplications
              </Typography>
              <Typography variant="body2">
                {metrics.duplications.value}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};
