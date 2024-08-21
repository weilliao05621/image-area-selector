import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

import { resolve } from "path";

import watchTheme from "./plugins/watch-theme";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), watchTheme()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
