import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import viteCompression from "vite-plugin-compression";

/**
 * PATCH 870: Optimized for slow connections
 * - Gzip + Brotli compression
 * - Aggressive code splitting
 * - React singleton fix
 */
export default defineConfig(({ mode }) => {
  const reactPath = path.resolve(__dirname, "node_modules/react");
  const reactDomPath = path.resolve(__dirname, "node_modules/react-dom");
  
  return {
    base: "/",
    server: {
      host: "::",
      port: 8080,
      strictPort: false,
      hmr: { overlay: true },
    },
    plugins: [
      react(),
      mode === "development" && componentTagger(),
      // PATCH 870: Gzip compression
      viteCompression({
        algorithm: "gzip",
        ext: ".gz",
        threshold: 1024, // Only compress files > 1KB
        deleteOriginFile: false,
      }),
      // PATCH 870: Brotli compression (better than gzip)
      viteCompression({
        algorithm: "brotliCompress",
        ext: ".br",
        threshold: 1024,
        deleteOriginFile: false,
      }),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "react": reactPath,
        "react-dom": reactDomPath,
        "react-dom/client": path.resolve(__dirname, "node_modules/react-dom/client"),
        "react/jsx-runtime": path.resolve(__dirname, "node_modules/react/jsx-runtime"),
        "react/jsx-dev-runtime": path.resolve(__dirname, "node_modules/react/jsx-dev-runtime"),
        "scheduler": path.resolve(__dirname, "node_modules/scheduler"),
      },
      dedupe: [
        "react", "react-dom", "react-dom/client", "react-is",
        "react/jsx-runtime", "react/jsx-dev-runtime", "scheduler",
        "@tanstack/react-query",
      ],
    },
    cacheDir: "node_modules/.vite-fresh",
    build: {
      target: "esnext",
      minify: "esbuild",
      sourcemap: false,
      // PATCH 870: Smaller chunks for faster loading
      chunkSizeWarningLimit: 500,
      rollupOptions: {
        output: {
          // PATCH 870: Aggressive code splitting
          manualChunks: (id) => {
            // React core (CRITICAL: keep React + Query together)
            if (
              id.includes("node_modules/react") || 
              id.includes("node_modules/scheduler") ||
              id.includes("@tanstack/react-query")
            ) {
              return "react-core";
            }
            // UI components
            if (id.includes("@radix-ui")) return "radix-ui";
            // Charts (heavy, lazy load)
            if (id.includes("recharts") || id.includes("chart.js")) return "charts";
            // AI/ML (very heavy, lazy load)
            if (id.includes("openai") || id.includes("tensorflow") || id.includes("onnx")) return "ai";
            // Supabase
            if (id.includes("@supabase")) return "supabase";
            // Icons
            if (id.includes("lucide-react")) return "icons";
            // Forms
            if (id.includes("react-hook-form") || id.includes("zod")) return "forms";
            // Date utilities
            if (id.includes("date-fns")) return "date-utils";
          },
        },
      },
    },
    optimizeDeps: {
      include: [
        "react", 
        "react-dom", 
        "react-dom/client", 
        "scheduler", 
        "@tanstack/react-query",
        "react-is"
      ],
      exclude: ["@tensorflow/tfjs", "onnxruntime-web", "tesseract.js"],
      force: true,
      esbuildOptions: {
        define: {
          global: 'globalThis',
        },
      },
    },
    esbuild: { target: "esnext", jsx: "automatic" },
  };
});
