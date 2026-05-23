import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: "dist", // Explicitly direct Vite to compile files into 'dist' to match Vercel's current expectations
    target: "es2022", // Explicitly target es2022 to enable modern features
  },
  esbuild: {
    target: "es2022",
    supported: {
      "import-meta": true // Explicitly enable support for import.meta keys
    }
  }
});
