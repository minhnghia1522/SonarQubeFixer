import React from "react";
import { createRootRoute, Link, Outlet, redirect } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Box } from "@mui/material";

const RootLayout = () => (
  <>
    <Box className="p-2 flex gap-2" gap={2} p={2} display="flex">
      <Link to="/projects" className="[&.active]:font-bold">
        Project
      </Link>
      <Link to="/setup" className="[&.active]:font-bold">
        Setup
      </Link>
    </Box>
    <hr />
    <Outlet />
    <TanStackRouterDevtools />
  </>
);

export const Route = createRootRoute({
  component: RootLayout,
  beforeLoad: ({ location }) => {
    if (location.pathname === "/") {
      throw redirect({
        to: "/projects",
        replace: true,
      });
    }
  },
});
