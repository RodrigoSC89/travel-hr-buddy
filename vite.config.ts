import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Produção otimizada
    minify: 'esbuild',
    sourcemap: false,
    target: 'es2020',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React ecosystem
          if (id.includes('node_modules/react') || 
              id.includes('node_modules/react-dom') || 
              id.includes('node_modules/react-router-dom') ||
              id.includes('node_modules/react-helmet-async')) {
            return 'vendor';
          }
          
          // Radix UI components
          if (id.includes('node_modules/@radix-ui')) {
            return 'ui';
          }
          
          // Charts
          if (id.includes('node_modules/recharts') || 
              id.includes('node_modules/react-big-calendar')) {
            return 'charts';
          }
          
          // Supabase
          if (id.includes('node_modules/@supabase')) {
            return 'supabase';
          }
          
          // Icons
          if (id.includes('node_modules/lucide-react')) {
            return 'icons';
          }
          
          // Form libraries
          if (id.includes('node_modules/react-hook-form') ||
              id.includes('node_modules/zod') ||
              id.includes('node_modules/@hookform')) {
            return 'forms';
          }
          
          // Date libraries
          if (id.includes('node_modules/date-fns') ||
              id.includes('node_modules/react-day-picker')) {
            return 'dates';
          }
        },
      },
    },
    // Remove console.log/error/warn em produção
    esbuild: mode === 'production' ? {
      drop: ['console', 'debugger'],
      pure: ['console.log', 'console.error', 'console.warn', 'console.info'],
    } : undefined,
  },
}));
