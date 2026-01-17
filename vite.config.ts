import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

/**
 * PATCH 863: Force complete cache invalidation
 * Timestamp: ${Date.now()}
 * 
 * Solution: Simplified config with aggressive deduplication
 */
export default defineConfig(({ mode }) => ({
  base: "/",
  
  // CRITICAL: Clear old cache entries
  cacheDir: ".vite-cache-" + Date.now(),
  
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
      // Force single React instance
      "react": path.resolve(__dirname, "./node_modules/react"),
      "react-dom": path.resolve(__dirname, "./node_modules/react-dom"),
    },
    dedupe: [
      "react",
      "react-dom",
      "react-is",
      "scheduler",
      "@tanstack/react-query",
      "@radix-ui/react-tooltip",
      "@radix-ui/react-dialog",
      "@radix-ui/react-popover",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-context-menu",
      "@radix-ui/react-menubar",
      "@radix-ui/react-navigation-menu",
      "@radix-ui/react-select",
      "@radix-ui/react-tabs",
      "@radix-ui/react-accordion",
      "@radix-ui/react-alert-dialog",
      "@radix-ui/react-avatar",
      "@radix-ui/react-checkbox",
      "@radix-ui/react-collapsible",
      "@radix-ui/react-hover-card",
      "@radix-ui/react-label",
      "@radix-ui/react-progress",
      "@radix-ui/react-radio-group",
      "@radix-ui/react-scroll-area",
      "@radix-ui/react-separator",
      "@radix-ui/react-slider",
      "@radix-ui/react-slot",
      "@radix-ui/react-switch",
      "@radix-ui/react-toast",
      "@radix-ui/react-toggle",
      "@radix-ui/react-toggle-group",
    ],
  },
  
  build: {
    outDir: "dist",
    sourcemap: false,
    minify: "esbuild",
    target: "esnext",
    chunkSizeWarningLimit: 1500,
    
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom", "scheduler"],
          "vendor-router": ["react-router-dom"],
          "vendor-query": ["@tanstack/react-query"],
        },
      },
    },
  },
  
  optimizeDeps: {
    force: true,
    
    include: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "scheduler",
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
  },
  
  esbuild: {
    target: "esnext",
    legalComments: "none",
  },
}));
