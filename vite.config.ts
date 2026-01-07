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
    dedupe: ["react", "react-dom", "react-is"],
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    target: "esnext",
    minify: false,
    chunkSizeWarningLimit: 10000,
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom", "react-is"],
          "vendor-ui": ["@radix-ui/react-dialog", "@radix-ui/react-select", "@radix-ui/react-tabs", "@radix-ui/react-tooltip"],
        },
      },
    },
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom", "react-is"],
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
