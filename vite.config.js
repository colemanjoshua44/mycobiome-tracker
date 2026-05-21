import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: "build", // Force Vite to compile files into 'build' to perfectly match Vercel's expectations
    target: "es2022",
  },
  esbuild: {
    target: "es2022",
    supported: {
      "import-meta": true
    }
  }
});
