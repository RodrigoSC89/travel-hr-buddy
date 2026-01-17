import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

/**
 * PATCH 856: CRITICAL FIX for React duplicate instances
 * 
 * The error "Cannot read properties of null (reading 'useEffect')" 
 * happens when multiple React instances exist.
 * 
 * Solution: Simplified config with aggressive deduplication
 */
export default defineConfig(({ mode }) => {
  const reactPath = path.resolve(__dirname, "node_modules/react");
  const reactDomPath = path.resolve(__dirname, "node_modules/react-dom");
  
  return {
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
        // CRITICAL: All React imports must resolve to the same instance
        "react": reactPath,
        "react-dom": reactDomPath,
        "react-dom/client": path.join(reactDomPath, "client"),
        "react/jsx-runtime": path.join(reactPath, "jsx-runtime"),
        "react/jsx-dev-runtime": path.join(reactPath, "jsx-dev-runtime"),
      },
      // Force deduplication of these packages
      dedupe: [
        "react",
        "react-dom", 
        "react-dom/client",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "react-is",
        "scheduler",
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
      chunkSizeWarningLimit: 1500,
      
      rollupOptions: {
        output: {
          // Simplified chunking - React MUST be in a single chunk
          manualChunks: {
            // All React in ONE chunk
            "vendor-react": ["react", "react-dom", "react-dom/client", "scheduler"],
            "vendor-router": ["react-router-dom"],
            "vendor-query": ["@tanstack/react-query"],
          },
        },
      },
    },
    
    optimizeDeps: {
      // Pre-bundle these together to ensure single React instance
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
      // Heavy libs that shouldn't be pre-bundled
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
      // CRITICAL: Force rebuild of the dependency cache
      force: true,
      // Use a consistent cache directory
      esbuildOptions: {
        target: "esnext",
      },
    },
    
    esbuild: {
      target: "esnext",
      legalComments: "none",
    },
  };
});
