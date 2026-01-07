import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Fix for multiple React instances and ESM compatibility
export default defineConfig(({ mode }) => ({
  base: "/",
  server: {
    host: true,
    port: 8080,
    strictPort: true,
    hmr: { overlay: false },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Force single React instance - CRITICAL for hooks to work
      "react": path.resolve(__dirname, "node_modules/react"),
      "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
      "react-is": path.resolve(__dirname, "node_modules/react-is"),
      // Force lodash to use ESM version
      "lodash": path.resolve(__dirname, "node_modules/lodash-es"),
    },
    dedupe: [
      "react",
      "react-dom",
      "react-is",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "@tanstack/react-query",
      "lodash-es",
      "framer-motion",
    ],
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
    include: [
      "react",
      "react-dom",
      "react-is",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "@tanstack/react-query",
      "lodash-es",
      "recharts",
      "react-smooth",
      "framer-motion",
    ],
    exclude: [
      "@tensorflow/tfjs",
      "@tensorflow-models/coco-ssd",
      "onnxruntime-web",
      "three",
      "@react-three/fiber",
      "@react-three/drei",
      "mapbox-gl",
      "tesseract.js",
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