import React from "react";
import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Box } from "@mui/material";

const RootLayout = () => (
  <>
    <Box className="p-2 flex gap-2" gap={2} p={2} display="flex">
      <Link to="/" className="[&.active]:font-bold">
        Home
      </Link>
      <Link to="/setup" className="[&.active]:font-bold">
        Setup
      </Link>
      <Link to="/projects" className="[&.active]:font-bold">
        Project
      </Link>
    </Box>
    <hr />
    <Outlet />
    <TanStackRouterDevtools />
  </>
);

export const Route = createRootRoute({ component: RootLayout });
