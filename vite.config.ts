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
      chunkSizeWarningLimit: 5000,
      target: "esnext",
      cssCodeSplit: true,
      minify: false, // Disable minification to save memory
      reportCompressedSize: false,
      assetsInlineLimit: 4096,
      commonjsOptions: {
        exclude: [/supabase\/functions/],
      },
      rollupOptions: {
        maxParallelFileOps: 1,
        treeshake: false, // Disable treeshake in dev to save memory
        output: {
          // Minimal chunking - only split heavy vendors
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom', 'scheduler'],
            'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-tabs', '@radix-ui/react-select', 'lucide-react'],
            'vendor-data': ['@supabase/supabase-js', '@tanstack/react-query'],
          }
        }
      },
    },
    optimizeDeps: {
      include: [
        "react", 
        "react-dom", 
        "react-dom/client",
        "react/jsx-runtime",
        "react-router-dom",
        "@supabase/supabase-js",
        "@tanstack/react-query",
      ],
      exclude: ['@tensorflow/tfjs', 'onnxruntime-web', 'three'],
    },
    cacheDir: ".vite-cache",
    esbuild: {
      logLevel: "silent",
      logOverride: { "this-is-undefined-in-esm": "silent" },
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
