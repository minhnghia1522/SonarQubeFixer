import { defineConfig } from "vite";
import stripUseClient from "./vite-plugin-strip-use-client.js";

export default defineConfig(async () => {
  const react = (await import("@vitejs/plugin-react")).default;
  return {
    plugins: [stripUseClient(), react()],
  };
});
