import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

import { resolve } from "path";

import watchThemeChange from "./plugins/watch-theme-change";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), watchThemeChange()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
