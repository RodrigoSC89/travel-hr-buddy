import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isDev = mode === "development";
  
  return {
    base: "/",
    server: {
      host: true,
      port: 8080,
      strictPort: true,
      hmr: { overlay: false, timeout: 5000 }
    },
    plugins: [
      react(),
      isDev && componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      dedupe: ["react", "react-dom", "react-router-dom", "@tanstack/react-query"],
    },
    build: {
      outDir: "dist",
      sourcemap: false,
      chunkSizeWarningLimit: 10000,
      target: "esnext",
      cssCodeSplit: false, // Single CSS file to reduce processing
      minify: false,
      reportCompressedSize: false,
      assetsInlineLimit: 0, // Don't inline assets
      commonjsOptions: {
        exclude: [/supabase\/functions/],
      },
      rollupOptions: {
        maxParallelFileOps: 1,
        treeshake: false,
        cache: false, // Disable cache to reduce memory
        output: {
          compact: true,
          entryFileNames: "[name].js",
          chunkFileNames: "[name].js",
          assetFileNames: "[name][extname]",
          // No manual chunks - let rollup handle it simply
        }
      },
    },
    optimizeDeps: {
      include: ["react", "react-dom", "react-router-dom"],
      exclude: ['@tensorflow/tfjs', 'onnxruntime-web', 'three', '@react-three/fiber', '@react-three/drei'],
      esbuildOptions: {
        target: "esnext",
      }
    },
    cacheDir: ".vite-cache",
    esbuild: {
      logLevel: "silent",
      logOverride: { "this-is-undefined-in-esm": "silent" },
      target: "esnext",
    },
    define: {
      "process.env.NODE_ENV": JSON.stringify(mode),
      "process.env": {},
    },
    preview: {
      host: true,
      port: 4173
    }
  };
});
