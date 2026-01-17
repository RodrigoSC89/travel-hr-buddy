import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

/**
 * PATCH 860: SIMPLIFIED config to fix React duplicate instances
 * 
 * The error happens because different chunks load different React instances.
 * Solution: Minimal config with essential deduplication only.
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
    },
    // CRITICAL: Force all these packages to use the same instance
    dedupe: [
      "react",
      "react-dom",
      "react-is",
      "scheduler",
      "@tanstack/react-query",
      "next-themes",
      // Radix UI packages that use React
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
    // Force rebuild
    force: true,
    
    include: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "scheduler",
      "@tanstack/react-query",
      "react-router-dom",
      "next-themes",
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
