import React, { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

const router = createRouter({ routeTree });

async function render() {
  const rootNode = ReactDOM.createRoot(
    document.getElementById("root") as HTMLElement
  );
  rootNode.render(
    <StrictMode>
      <RouterProvider router={router} />
      <App />
    </StrictMode>
  );
}

render();
