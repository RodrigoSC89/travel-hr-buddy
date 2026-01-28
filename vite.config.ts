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
    target: "es2015",
    chunkSizeWarningLimit: 500,
    cssCodeSplit: true,
    cssMinify: true, // Use default esbuild minifier (lightningcss not installed)
    modulePreload: { polyfill: true },
    reportCompressedSize: true,
    assetsInlineLimit: 4096, // Inline assets < 4KB as base64
    terserOptions: {
      compress: {
        drop_console: mode === "production",
        drop_debugger: true,
        pure_funcs: mode === "production" ? ["console.log", "console.info", "console.debug", "console.warn", "console.table"] : [],
        passes: 3, // More passes = better compression
        dead_code: true,
        unused: true,
        conditionals: true,
        evaluate: true,
      },
      mangle: {
        safari10: true,
        toplevel: true,
      },
      format: {
        comments: false,
        ascii_only: true,
      },
    },
    rollupOptions: {
      output: {
        // PATCH v26: Advanced chunk splitting for optimal bundle size
        manualChunks: {
          // Core React - cached indefinitely
          "react-vendor": ["react", "react-dom", "react-dom/client"],

          // Query & State management
          "query-vendor": ["@tanstack/react-query"],

          // UI Components - shared across app
          "ui-vendor": [
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-popover",
            "@radix-ui/react-tooltip",
            "@radix-ui/react-tabs",
            "@radix-ui/react-select",
            "@radix-ui/react-checkbox",
          ],

          // Animation - loaded when needed
          "animation-vendor": ["framer-motion"],

          // Charts - lazy loaded for dashboards
          "charts-vendor": ["recharts", "chart.js", "react-chartjs-2"],

          // Date utilities
          "date-vendor": ["date-fns"],

          // Form handling
          "form-vendor": ["react-hook-form", "@hookform/resolvers", "zod"],

          // Supabase client
          "supabase-vendor": ["@supabase/supabase-js", "@supabase/ssr"],
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
        moduleSideEffects: false,
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