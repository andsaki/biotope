import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: true, // Automatically open the report in the browser
      filename: "dist/stats.html", // Output file
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (
              id.includes("three") ||
              id.includes("@react-three/drei") ||
              id.includes("@react-three/fiber") ||
              id.includes("react-dom") ||
              id.includes("react")
            ) {
              return "react-three-vendor";
            }
            // All other modules from node_modules will be in a default vendor chunk
            return "vendor";
          }
        },
      },
    },
  },
});
