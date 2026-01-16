import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import viteCompression from "vite-plugin-compression";

/**
 * PATCH 873: Simplified React singleton - remove complex aliasing that causes issues
 * Let Vite handle React deduplication naturally with just dedupe option
 */
export default defineConfig(({ mode }) => {
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
      viteCompression({
        algorithm: "gzip",
        ext: ".gz",
        threshold: 1024,
        deleteOriginFile: false,
      }),
      viteCompression({
        algorithm: "brotliCompress",
        ext: ".br",
        threshold: 1024,
        deleteOriginFile: false,
      }),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      // PATCH 873: Let Vite dedupe without complex aliasing
      dedupe: ["react", "react-dom"],
    },
    build: {
      target: "esnext",
      minify: "esbuild",
      sourcemap: false,
      chunkSizeWarningLimit: 500,
      rollupOptions: {
        output: {
          manualChunks: {
            "react-vendor": ["react", "react-dom", "@tanstack/react-query"],
          },
        },
      },
    },
    optimizeDeps: {
      include: ["react", "react-dom", "@tanstack/react-query"],
      exclude: ["@tensorflow/tfjs", "onnxruntime-web", "tesseract.js"],
    },
    esbuild: { target: "esnext", jsx: "automatic" },
  };
});
