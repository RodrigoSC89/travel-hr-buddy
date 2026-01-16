import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

/**
 * PATCH 859: Ultimate React singleton fix with Radix UI support
 * Forces a single React instance across all dependencies including Radix
 */
export default defineConfig(({ mode }) => {
  const reactPath = path.resolve(__dirname, "node_modules/react");
  const reactDomPath = path.resolve(__dirname, "node_modules/react-dom");
  
  // Generate unique cache dir to force fresh builds
  const timestamp = Date.now();
  
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
        // Force single React instance - all paths must resolve to the same module
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
        // Add all Radix UI packages to dedupe
        "@radix-ui/react-context",
        "@radix-ui/react-tooltip",
        "@radix-ui/react-dialog",
        "@radix-ui/react-dropdown-menu",
        "@radix-ui/react-tabs",
        "@radix-ui/react-accordion",
        "@radix-ui/react-select",
        "@radix-ui/react-popover",
        "@radix-ui/react-primitive",
        "@radix-ui/react-use-callback-ref",
        "@radix-ui/react-use-controllable-state",
        "@radix-ui/react-use-layout-effect",
        "@radix-ui/react-slot",
        "@radix-ui/react-compose-refs",
        "@radix-ui/react-id",
      ],
    },
    // Force cache clear on every build
    cacheDir: `node_modules/.vite-${timestamp}`,
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
            // Bundle all Radix UI together
            if (id.includes("@radix-ui")) {
              return "radix-ui";
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
        // Include Radix packages for pre-bundling
        "@radix-ui/react-tooltip",
        "@radix-ui/react-dialog",
        "@radix-ui/react-dropdown-menu",
        "@radix-ui/react-tabs",
        "@radix-ui/react-accordion",
        "@radix-ui/react-select",
        "@radix-ui/react-popover",
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
