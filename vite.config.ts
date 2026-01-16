import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

/**
 * PATCH 862: Force React singleton by bundling React + Query together
 * The key fix is putting @tanstack/react-query in the same chunk as React
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
    // Force new cache to invalidate old chunks
    cacheDir: "node_modules/.vite-fresh",
    build: {
      target: "esnext",
      minify: "esbuild",
      sourcemap: false,
      rollupOptions: {
        output: {
          // CRITICAL: Bundle React AND React-Query together in same chunk
          manualChunks: (id) => {
            // React + React Query MUST be in same chunk
            if (
              id.includes("node_modules/react") || 
              id.includes("node_modules/scheduler") ||
              id.includes("@tanstack/react-query")
            ) {
              return "react-core";
            }
            if (id.includes("@radix-ui")) return "radix-ui";
          },
        },
      },
    },
    optimizeDeps: {
      // Pre-bundle all React-related packages together
      include: [
        "react", 
        "react-dom", 
        "react-dom/client", 
        "scheduler", 
        "@tanstack/react-query",
        "react-is"
      ],
      exclude: ["@tensorflow/tfjs", "onnxruntime-web", "tesseract.js"],
      // Force fresh optimization
      force: true,
      esbuildOptions: {
        // Ensure single React instance in esbuild
        define: {
          global: 'globalThis',
        },
      },
    },
    esbuild: { target: "esnext", jsx: "automatic" },
  };
});
