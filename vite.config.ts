import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

/**
 * PATCH 855: DEFINITIVE React singleton fix
 * Root cause: Multiple React instances in bundle from stale cache
 * Solution: Force single React via alias + optimizeDeps + manual chunks
 */
export default defineConfig(({ mode }) => ({
  base: "/",
  server: {
    host: "::",
    port: 8080,
    strictPort: false,
    hmr: {
      overlay: true,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // CRITICAL: Force single React instance via absolute paths
      "react": path.resolve(__dirname, "node_modules/react"),
      "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
      "react/jsx-runtime": path.resolve(__dirname, "node_modules/react/jsx-runtime"),
      "react/jsx-dev-runtime": path.resolve(__dirname, "node_modules/react/jsx-dev-runtime"),
      "scheduler": path.resolve(__dirname, "node_modules/scheduler"),
    },
    dedupe: [
      "react",
      "react-dom",
      "react-dom/client",
      "react-is",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "@tanstack/react-query",
      "scheduler",
    ],
  },
  build: {
    target: "esnext",
    minify: "esbuild",
    sourcemap: false,
    cssMinify: true,
    cssCodeSplit: true,
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks: {
          // Force React into single chunk to prevent duplication
          "react-vendor": ["react", "react-dom", "react-dom/client", "scheduler"],
          "query": ["@tanstack/react-query"],
        },
      },
    },
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-dom/client",
      "react-is",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "scheduler",
      "@tanstack/react-query",
    ],
    exclude: [
      "@tensorflow/tfjs",
      "onnxruntime-web",
      "tesseract.js",
    ],
    force: true,
  },
  esbuild: {
    target: "esnext",
    legalComments: "none",
    jsx: "automatic",
  },
}));
