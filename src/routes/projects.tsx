import { createFileRoute } from "@tanstack/react-router";
import React from "react";

export const Route = createFileRoute()({
  component: ProjectsPage,
});

function ProjectsPage() {
  return (
    <div>
      <h1>Projects Page</h1>
      <p>This is the Projects page.</p>
    </div>
  );
}
