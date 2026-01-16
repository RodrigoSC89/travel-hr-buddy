import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import viteCompression from "vite-plugin-compression";

/**
 * PATCH 871: FINAL React singleton fix
 * The key insight: use a SINGLE cache directory and ensure all React imports resolve to same file
 */
export default defineConfig(({ mode }) => {
  // Resolve to exact React paths to prevent duplicates
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
      // Gzip compression
      viteCompression({
        algorithm: "gzip",
        ext: ".gz",
        threshold: 1024,
        deleteOriginFile: false,
      }),
      // Brotli compression
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
        // CRITICAL: Force all React imports to same path
        "react": reactPath,
        "react-dom": reactDomPath,
        "react-dom/client": path.resolve(reactDomPath, "client"),
        "react/jsx-runtime": path.resolve(reactPath, "jsx-runtime"),
        "react/jsx-dev-runtime": path.resolve(reactPath, "jsx-dev-runtime"),
        "scheduler": path.resolve(__dirname, "node_modules/scheduler"),
      },
      dedupe: [
        "react", 
        "react-dom", 
        "react-dom/client",
        "react-is",
        "react/jsx-runtime", 
        "react/jsx-dev-runtime", 
        "scheduler",
        "@tanstack/react-query",
      ],
    },
    // PATCH 871: Single stable cache directory
    cacheDir: "node_modules/.vite_cache",
    build: {
      target: "esnext",
      minify: "esbuild",
      sourcemap: false,
      chunkSizeWarningLimit: 500,
      rollupOptions: {
        output: {
          // PATCH 871: Put React + Query in SAME chunk
          manualChunks: (id) => {
            // All React-related must go together
            if (
              id.includes("node_modules/react") || 
              id.includes("node_modules/scheduler") ||
              id.includes("node_modules/use-sync-external-store") ||
              id.includes("@tanstack/react-query")
            ) {
              return "react-vendor";
            }
            if (id.includes("@radix-ui")) return "radix-ui";
            if (id.includes("recharts") || id.includes("chart.js")) return "charts";
            if (id.includes("@supabase")) return "supabase";
            if (id.includes("lucide-react")) return "icons";
          },
        },
      },
    },
    optimizeDeps: {
      // PATCH 871: Pre-bundle React ecosystem together
      include: [
        "react", 
        "react-dom", 
        "react-dom/client", 
        "scheduler", 
        "@tanstack/react-query",
        "react-is",
        "use-sync-external-store",
        "use-sync-external-store/shim",
      ],
      exclude: ["@tensorflow/tfjs", "onnxruntime-web", "tesseract.js"],
      // PATCH 871: Force clean rebuild
      force: mode === "development",
      esbuildOptions: {
        define: {
          global: 'globalThis',
        },
      },
    },
    esbuild: { target: "esnext", jsx: "automatic" },
  };
});
