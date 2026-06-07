import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

function normalizeAssetBase(value: string | undefined) {
  if (!value || value === "/") {
    return "/";
  }

  const withLeadingSlash = value.startsWith("/") ? value : `/${value}`;
  return withLeadingSlash.endsWith("/") ? withLeadingSlash : `${withLeadingSlash}/`;
}

export default defineConfig({
  base: normalizeAssetBase(process.env.VITE_APP_BASE_PATH),
  plugins: [react()],
  server: {
    port: 3001,
    proxy: {
      "/socket.io": {
        target: "ws://localhost:6942",
        ws: true,
        changeOrigin: true,
      },
      "/api": {
        target: "http://localhost:6942",
        changeOrigin: true,
      },
    },
  },
});
