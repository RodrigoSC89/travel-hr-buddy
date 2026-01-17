import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

/**
 * PATCH 854: Fixed React duplicate instances + optimized for slow connections
 * Key changes:
 * 1. Strong React deduplication with resolve.alias
 * 2. Optimized chunking for faster initial load
 * 3. Compression and tree shaking
 */
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
      // CRITICAL: Force single React instance
      "react": path.resolve(__dirname, "node_modules/react"),
      "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
      "react-dom/client": path.resolve(__dirname, "node_modules/react-dom/client"),
      "react/jsx-runtime": path.resolve(__dirname, "node_modules/react/jsx-runtime"),
      "react/jsx-dev-runtime": path.resolve(__dirname, "node_modules/react/jsx-dev-runtime"),
      "scheduler": path.resolve(__dirname, "node_modules/scheduler"),
    },
    dedupe: [
      "react",
      "react-dom",
      "react-dom/client",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "scheduler",
      "react-is",
      "@tanstack/react-query",
    ],
  },
  
  build: {
    outDir: "dist",
    sourcemap: false,
    minify: "esbuild",
    target: "esnext",
    cssCodeSplit: true,
    modulePreload: { polyfill: true },
    reportCompressedSize: false,
    chunkSizeWarningLimit: 1000,
    
    rollupOptions: {
      output: {
        // Optimized chunking for faster initial load
        manualChunks: (id) => {
          // Core React - must load first
          if (id.includes('node_modules/react-dom')) return 'vendor-react-dom';
          if (id.includes('node_modules/react/') || id.includes('node_modules/scheduler')) return 'vendor-react';
          
          // Router - needed for navigation
          if (id.includes('react-router')) return 'vendor-router';
          
          // Query - needed for data fetching
          if (id.includes('@tanstack/react-query')) return 'vendor-query';
          
          // UI Components - can load slightly later
          if (id.includes('@radix-ui')) return 'vendor-ui';
          if (id.includes('lucide-react')) return 'vendor-icons';
          
          // Heavy libs - lazy load
          if (id.includes('recharts') || id.includes('chart.js')) return 'vendor-charts';
          if (id.includes('framer-motion')) return 'vendor-motion';
          if (id.includes('mapbox') || id.includes('three')) return 'vendor-3d';
          if (id.includes('tensorflow') || id.includes('onnx')) return 'vendor-ml';
          
          // Everything else from node_modules
          if (id.includes('node_modules')) return 'vendor-misc';
        },
      },
    },
  },
  
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-dom/client",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "scheduler",
      "react-is",
      "@tanstack/react-query",
      "react-router-dom",
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
    // Force re-bundling to ensure single React instance
    force: true,
  },
  
  esbuild: {
    target: "esnext",
    legalComments: "none",
    // Remove console.log in production
    drop: mode === "production" ? ["console", "debugger"] : [],
  },
}));
