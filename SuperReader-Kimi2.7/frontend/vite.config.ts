import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5029,
    host: "0.0.0.0",
    proxy: {
      "/api": "http://localhost:5030"
    }
  },
  preview: {
    port: 5029,
    host: "0.0.0.0"
  }
});
