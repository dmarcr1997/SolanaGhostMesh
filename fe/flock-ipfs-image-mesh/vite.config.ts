import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// We’ll import GLSL as raw strings with `?raw` so no extra plugins.
export default defineConfig({
  plugins: [react()],
  server: { port: 5500, host: true },
});
