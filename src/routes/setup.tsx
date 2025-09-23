import React from "react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/setup")({
  component: SetupPage,
});

function SetupPage() {
  return (
    <div>
      <h1>Settings</h1>
    </div>
  );
}
