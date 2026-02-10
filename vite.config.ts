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
    minify: "esbuild",
    target: "esnext",
    chunkSizeWarningLimit: 100000,
    cssCodeSplit: true,
    modulePreload: { polyfill: true },
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        // PATCH v26: Advanced chunk splitting for optimal bundle size
        manualChunks(id) {
          // Core React - cached indefinitely
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'react-vendor';
          }
          // Query & State management
          if (id.includes('@tanstack/react-query')) return 'query-vendor';
          // Supabase client
          if (id.includes('@supabase/')) return 'supabase-vendor';
          // UI Components - shared across app
          if (id.includes('@radix-ui/')) return 'ui-vendor';
          // Animation
          if (id.includes('framer-motion')) return 'animation-vendor';
          // Charts - separate chunk, loaded on dashboard routes
          if (id.includes('recharts') || id.includes('chart.js') || id.includes('react-chartjs-2')) {
            return 'charts-vendor';
          }
          // PDF generation - lazy loaded on export actions (~600KB)
          if (id.includes('jspdf') || id.includes('jspdf-autotable')) return 'pdf-vendor';
          // Excel - lazy loaded on export actions (~400KB)
          if (id.includes('/xlsx')) return 'xlsx-vendor';
          // 3D rendering - lazy loaded (~500KB+)
          if (id.includes('three') || id.includes('@react-three')) return 'three-vendor';
          // Date utilities
          if (id.includes('date-fns')) return 'date-vendor';
          // Form handling
          if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('/zod')) {
            return 'form-vendor';
          }
          // Maps
          if (id.includes('mapbox-gl')) return 'mapbox-vendor';
          // Router
          if (id.includes('react-router')) return 'router-vendor';
        },
        // Ensure consistent chunk naming for caching
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId;
          if (facadeModuleId && facadeModuleId.includes('node_modules')) {
            return 'assets/vendor/[name]-[hash].js';
          }
          return 'assets/[name]-[hash].js';
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
      "@tanstack/react-query",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-popover",
      "@radix-ui/react-tooltip",
      "lodash-es",
      "react-smooth",
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
      "jspdf",
      "jspdf-autotable",
      "xlsx",
      "firebase",
      "reactflow",
    ],
    esbuildOptions: {
      target: "esnext",
    },
    // Force re-optimization when dependencies change
    force: mode === "development",
  },
  esbuild: {
    target: "esnext",
    legalComments: "none",
  },
}));