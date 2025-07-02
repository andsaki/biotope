import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      external: [
        "public/assets/Smoked Fish Raw/weflciqaa_tier_0.bin",
        "public/assets/Smoked Fish Raw/weflciqaa_tier_0.gltf",
      ],
    },
  },
});
