import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: "/",
  server: {
    host: true,
    port: 8080,
    strictPort: true,
    hmr: { overlay: false }
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    target: "esnext",
    minify: false,
    chunkSizeWarningLimit: 5000,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes("node_modules")) {
            if (id.includes("react")) return "vendor-react";
            if (id.includes("recharts") || id.includes("react-is")) return "vendor-charts";
            if (id.includes("radix")) return "vendor-ui";
            if (id.includes("lodash")) return "vendor-lodash";
            if (id.includes("mapbox") || id.includes("three") || id.includes("tensorflow")) return "vendor-heavy";
            return "vendor";
          }
        },
      },
    },
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom"],
    exclude: ["@tensorflow/tfjs", "onnxruntime-web", "three", "@react-three/fiber", "@react-three/drei", "mapbox-gl"],
  },
  esbuild: {
    target: "esnext",
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify(mode),
    "process.env": {},
  },
}));
