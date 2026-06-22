import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "./",
  build: { outDir: "site-output" },
  plugins: [react()],
  resolve: { alias: { "@content": path.resolve(__dirname, "../_content") } },
});
