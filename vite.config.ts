import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

/**
 * PATCH 860: Ultimate React singleton fix - forces single React instance
 */
export default defineConfig(({ mode }) => {
  const reactPath = path.resolve(__dirname, "node_modules/react");
  const reactDomPath = path.resolve(__dirname, "node_modules/react-dom");
  
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
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "react": reactPath,
        "react-dom": reactDomPath,
        "react-dom/client": path.resolve(__dirname, "node_modules/react-dom/client"),
        "react/jsx-runtime": path.resolve(__dirname, "node_modules/react/jsx-runtime"),
        "react/jsx-dev-runtime": path.resolve(__dirname, "node_modules/react/jsx-dev-runtime"),
        "scheduler": path.resolve(__dirname, "node_modules/scheduler"),
      },
      dedupe: [
        "react", "react-dom", "react-dom/client", "react-is",
        "react/jsx-runtime", "react/jsx-dev-runtime", "scheduler",
        "@tanstack/react-query", "@radix-ui/react-context",
        "@radix-ui/react-tooltip", "@radix-ui/react-dialog",
        "@radix-ui/react-dropdown-menu", "@radix-ui/react-tabs",
        "@radix-ui/react-accordion", "@radix-ui/react-select",
        "@radix-ui/react-popover", "@radix-ui/react-primitive",
        "@radix-ui/react-slot", "@radix-ui/react-compose-refs",
      ],
    },
    cacheDir: `node_modules/.vite-${Date.now()}`,
    build: {
      target: "esnext",
      minify: "esbuild",
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes("node_modules/react") || id.includes("node_modules/scheduler")) return "react-core";
            if (id.includes("@radix-ui")) return "radix-ui";
            if (id.includes("@tanstack/react-query")) return "query";
          },
        },
      },
    },
    optimizeDeps: {
      include: ["react", "react-dom", "react-dom/client", "scheduler", "@tanstack/react-query"],
      exclude: ["@tensorflow/tfjs", "onnxruntime-web", "tesseract.js"],
      force: true,
    },
    esbuild: { target: "esnext", jsx: "automatic" },
  };
});
