import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import compression from "vite-plugin-compression";

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
    // Brotli compression for production
    mode === "production" &&
      compression({
        algorithm: "brotliCompress",
        ext: ".br",
        threshold: 1024, // Only files > 1KB
        deleteOriginFile: false,
      }),
    // Gzip fallback
    mode === "production" &&
      compression({
        algorithm: "gzip",
        ext: ".gz",
        threshold: 1024,
        deleteOriginFile: false,
      }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Force single React instance - CRITICAL for hooks to work
      react: path.resolve(__dirname, "node_modules/react"),
      "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
      "react-dom/client": path.resolve(__dirname, "node_modules/react-dom/client"),
      "react/jsx-runtime": path.resolve(__dirname, "node_modules/react/jsx-runtime"),
      "react/jsx-dev-runtime": path.resolve(__dirname, "node_modules/react/jsx-dev-runtime"),
      "react-is": path.resolve(__dirname, "node_modules/react-is"),
      // Force lodash to use ESM version
      lodash: path.resolve(__dirname, "node_modules/lodash-es"),
    },
    dedupe: [
      "react",
      "react-dom",
      "react-dom/client",
      "react-is",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "@tanstack/react-query",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-popover",
      "@radix-ui/react-tooltip",
      "@radix-ui/react-slot",
      "@radix-ui/react-primitive",
      "lodash-es",
      "framer-motion",
    ],
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    minify: "terser",
    target: "es2020", // Modern target for better optimization
    chunkSizeWarningLimit: 300, // Stricter limit for Lighthouse
    cssCodeSplit: true,
    cssMinify: true,
    modulePreload: { polyfill: true },
    reportCompressedSize: true,
    assetsInlineLimit: 4096,
    terserOptions: {
      compress: {
        drop_console: mode === "production",
        drop_debugger: true,
        pure_funcs: mode === "production" 
          ? ["console.log", "console.info", "console.debug", "console.warn", "console.table", "console.time", "console.timeEnd"]
          : [],
        passes: 3,
        dead_code: true,
        unused: true,
        conditionals: true,
        evaluate: true,
        collapse_vars: true,
        reduce_vars: true,
        hoist_funs: true,
        hoist_vars: false,
        join_vars: true,
        sequences: true,
      },
      mangle: {
        safari10: true,
        toplevel: true,
        properties: false, // Don't mangle properties to avoid breaking
      },
      format: {
        comments: false,
        ascii_only: true,
        ecma: 2020,
      },
    },
    rollupOptions: {
      output: {
        // PATCH 880: Optimized chunk splitting for Lighthouse 98+
        manualChunks: (id) => {
          // Node modules chunking strategy
          if (id.includes("node_modules")) {
            // Core React - smallest, cached longest
            if (id.includes("react-dom") || id.includes("react/")) {
              return "react-core";
            }
            
            // React Router
            if (id.includes("react-router")) {
              return "router";
            }
            
            // TanStack Query
            if (id.includes("@tanstack/react-query")) {
              return "query";
            }
            
            // Radix UI - shared UI primitives
            if (id.includes("@radix-ui")) {
              return "ui-primitives";
            }
            
            // Animation - lazy load
            if (id.includes("framer-motion")) {
              return "animation";
            }
            
            // Charts - lazy load
            if (id.includes("recharts") || id.includes("chart.js") || id.includes("d3-")) {
              return "charts";
            }
            
            // Supabase
            if (id.includes("@supabase")) {
              return "supabase";
            }
            
            // Forms
            if (id.includes("react-hook-form") || id.includes("zod") || id.includes("@hookform")) {
              return "forms";
            }
            
            // Date utilities
            if (id.includes("date-fns")) {
              return "date-utils";
            }
            
            // Icons
            if (id.includes("lucide-react")) {
              return "icons";
            }
            
            // Heavy libs - separate chunk
            if (
              id.includes("three") || 
              id.includes("@react-three") ||
              id.includes("mapbox") ||
              id.includes("tensorflow") ||
              id.includes("tesseract")
            ) {
              return "heavy-libs";
            }
            
            // Remaining vendor code
            return "vendor";
          }
        },
        // Ensure consistent chunk naming for caching
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId;
          if (facadeModuleId && facadeModuleId.includes("node_modules")) {
            return "assets/vendor/[name]-[hash].js";
          }
          return "assets/[name]-[hash].js";
        },
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
      },
      treeshake: {
        moduleSideEffects: true, // CRITICAL v60: Keep side-effect imports (CSS, polyfills)
        propertyReadSideEffects: false,
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
      "@tanstack/react-query",
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
      target: "es2015",
    },
    // Force re-optimization when dependencies change
    force: mode === "development",
  },
  esbuild: {
    target: "es2015",
    legalComments: "none",
  },
}));