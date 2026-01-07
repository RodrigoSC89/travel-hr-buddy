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
      chunkSizeWarningLimit: 100000,
      target: "esnext",
      cssCodeSplit: false,
      minify: false,
      reportCompressedSize: false,
      assetsInlineLimit: 0,
      commonjsOptions: {
        include: [/lodash/, /react-is/, /node_modules/],
        exclude: [/supabase\/functions/],
        transformMixedEsModules: true,
      },
      rollupOptions: {
        maxParallelFileOps: 1,
        treeshake: false,
        cache: false,
        output: {
          compact: true,
          entryFileNames: "[name].js",
          chunkFileNames: "[name].js",
          assetFileNames: "[name][extname]",
          manualChunks: {
            "vendor-react": ["react", "react-dom", "react-router-dom", "react-is"],
            "vendor-ui": ["@radix-ui/react-dialog", "@radix-ui/react-select", "@radix-ui/react-tabs"],
            "vendor-charts": ["recharts"],
            "vendor-lodash": ["lodash", "lodash-es"],
          },
        }
      },
    },
    optimizeDeps: {
      include: ["react", "react-dom", "react-router-dom", "lodash", "recharts", "react-is"],
      exclude: ['@tensorflow/tfjs', 'onnxruntime-web', 'three', '@react-three/fiber', '@react-three/drei', 'react-reconciler', 'mapbox-gl'],
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
