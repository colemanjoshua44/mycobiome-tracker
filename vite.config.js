import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Force Vite to compile directly into the 'build' directory to match Vercel's overrides
    outDir: "build", 
    target: "es2022", // Explicitly target es2022 to enable modern features
  },
  esbuild: {
    target: "es2022",
    supported: {
      "import-meta": true // Explicitly enable support for import.meta keys
    }
  }
});
