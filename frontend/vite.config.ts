import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // In development, proxy /api calls to Firebase Functions emulator
      // The emulator URL format: http://localhost:5001/{project-id}/us-central1/api
      "/api": {
        target: "http://localhost:5001/superreader/us-central1/api",
        changeOrigin: true,
        // Keep the /api prefix so Express matches /api/analyze-frame
      },
    },
  },
});
