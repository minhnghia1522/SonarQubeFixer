import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Container, Paper } from "@mui/material";
import SonarQubeSettingSetupForm from "../components/SonarQubeSettingSetupForm";

export const Route = createFileRoute("/setup")({
  component: SetupPage,
});

function SetupPage() {
  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <SonarQubeSettingSetupForm />
      </Paper>
    </Container>
  );
}
