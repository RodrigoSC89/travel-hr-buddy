import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: true,
    port: 3000,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    target: 'es2020', // Atualizado para suportar big integers
    chunkSizeWarningLimit: 2000, // Increased to 2MB to accommodate large Travel chunk
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks for core libraries
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor';
            }
            if (id.includes('@radix-ui/react-dialog') || 
                id.includes('@radix-ui/react-dropdown-menu') || 
                id.includes('@radix-ui/react-tabs')) {
              return 'ui';
            }
            if (id.includes('recharts')) {
              return 'charts';
            }
            if (id.includes('@supabase/supabase-js')) {
              return 'supabase';
            }
          }
          // SGSO module chunking for better performance
          if (id.includes('src/components/sgso/')) {
            return 'sgso';
          }
        }
      }
    },
    // Use our custom logger in production instead of dropping all console
    // This allows logger.error and logger.warn to work in production
    esbuild: mode === 'production' ? {
      drop: ['debugger'],
    } : undefined,
  },
  preview: {
    host: true,
    port: 4173
  }
}));
