import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Read package.json to get version
const packageJson = JSON.parse(
  readFileSync(resolve(process.cwd(), "package.json"), "utf-8")
);

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  plugins: [
    react(),
    {
      name: "replace-version",
      transformIndexHtml(html) {
        return html.replace(/__VERSION__/g, packageJson.version);
      },
    },
  ],
});
