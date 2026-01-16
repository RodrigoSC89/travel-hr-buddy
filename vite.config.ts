import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

/**
 * PATCH 856: Ultimate React singleton fix
 * Forces a single React instance across all dependencies
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
        // Force single React instance
        "react": reactPath,
        "react-dom": reactDomPath,
        "react-dom/client": path.resolve(__dirname, "node_modules/react-dom/client"),
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
        "@radix-ui/react-context",
      ],
    },
    build: {
      target: "esnext",
      minify: "esbuild",
      sourcemap: false,
      cssMinify: true,
      cssCodeSplit: true,
      chunkSizeWarningLimit: 2000,
      commonjsOptions: {
        include: [/node_modules/],
        transformMixedEsModules: true,
      },
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // Force all React-related modules into single chunk
            if (id.includes("node_modules/react") || 
                id.includes("node_modules/scheduler") ||
                id.includes("node_modules/react-dom")) {
              return "react-core";
            }
            if (id.includes("@tanstack/react-query")) {
              return "query";
            }
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
      esbuildOptions: {
        target: "esnext",
      },
    },
    esbuild: {
      target: "esnext",
      legalComments: "none",
      jsx: "automatic",
    },
  };
});
