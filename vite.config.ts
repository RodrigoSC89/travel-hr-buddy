import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// PATCH 852: Fix for multiple React instances
// This configuration ensures all React imports resolve to the same instance
export default defineConfig(({ mode }) => ({
  base: "/",
  server: {
    host: true,
    port: 8080,
    strictPort: true,
    hmr: { overlay: false },
    // Force dependency pre-bundling on every restart in dev
    watch: {
      usePolling: false,
    },
  },
  plugins: [
    react({
      // Use automatic JSX runtime
      jsxImportSource: undefined,
    }),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // CRITICAL: Force ALL React imports to single instance
      "react": path.resolve(__dirname, "node_modules/react"),
      "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
      "react-dom/client": path.resolve(__dirname, "node_modules/react-dom/client"),
      "react/jsx-runtime": path.resolve(__dirname, "node_modules/react/jsx-runtime"),
      "react/jsx-dev-runtime": path.resolve(__dirname, "node_modules/react/jsx-dev-runtime"),
      "react-is": path.resolve(__dirname, "node_modules/react-is"),
      // Force lodash to use ESM version
      "lodash": path.resolve(__dirname, "node_modules/lodash-es"),
    },
    dedupe: [
      "react",
      "react-dom",
      "react-dom/client",
      "react-is",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "@tanstack/react-query",
      "@tanstack/query-core",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-popover",
      "@radix-ui/react-tooltip",
      "@radix-ui/react-slot",
      "@radix-ui/react-primitive",
      "lodash-es",
      "framer-motion",
      "scheduler",
    ],
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    minify: "esbuild",
    target: "esnext",
    chunkSizeWarningLimit: 100000,
    cssCodeSplit: true,
    modulePreload: { polyfill: true },
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        // Separate React into its own chunk to prevent duplication
        manualChunks: {
          'react-core': ['react', 'react-dom', 'react-dom/client', 'scheduler'],
          'react-query': ['@tanstack/react-query', '@tanstack/query-core'],
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
      "@tanstack/query-core",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-popover",
      "@radix-ui/react-tooltip",
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
    // CRITICAL: Force cache invalidation
    force: true,
  },
  cacheDir: ".vite-cache-" + Date.now().toString(36).slice(-4),
  esbuild: {
    target: "esnext",
    legalComments: "none",
  },
}));