import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import path from "path";

const reactVendors = ["react", "react-dom"];
const threeVendors = ["three", "@react-three/fiber", "@react-three/drei", "@react-three/rapier"];
const matchesPackage = (id: string, pkg: string) => id.includes(`/node_modules/${pkg}/`);

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  plugins: [
    react(),
    visualizer({
      open: true, // Automatically open the report in the browser
      filename: "dist/stats.html", // Output file
    }),
  ],
  build: {
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return;
          }
          if (reactVendors.some((pkg) => matchesPackage(id, pkg))) {
            return "react-vendor";
          }
          if (threeVendors.some((pkg) => matchesPackage(id, pkg))) {
            return "three-vendor";
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    target: 'esnext',
    cssCodeSplit: true,
  },
  optimizeDeps: {
    include: ["react", "react-dom", "three", "@react-three/fiber", "@react-three/drei"],
  },
});
