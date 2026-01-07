import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Minimal config to prevent heap overflow on large projects
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
    minify: false,
    target: "esnext",
    chunkSizeWarningLimit: 100000,
    cssCodeSplit: false,
    modulePreload: false,
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        manualChunks: undefined,
        inlineDynamicImports: true,
      },
      treeshake: false,
      maxParallelFileOps: 1,
    },
  },
  optimizeDeps: {
    include: ["react", "react-dom"],
    exclude: [
      "@tensorflow/tfjs",
      "@tensorflow-models/coco-ssd",
      "onnxruntime-web",
      "three",
      "@react-three/fiber",
      "@react-three/drei",
      "mapbox-gl",
      "tesseract.js",
      "recharts",
    ],
    esbuildOptions: {
      target: "esnext",
    },
  },
  esbuild: {
    target: "esnext",
    legalComments: "none",
    treeShaking: false,
  },
}));
