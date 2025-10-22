import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ["mqtt", "@supabase/supabase-js", "react-router-dom"]
  },
  server: {
    hmr: { overlay: false },
    port: 5173
  },
  define: {
    "process.env.LOVABLE_FULL_PREVIEW": true
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: "esnext",
    outDir: "dist",
    sourcemap: false
  }
});
