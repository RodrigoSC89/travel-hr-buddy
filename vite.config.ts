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
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tabs'],
          charts: ['recharts'],
          supabase: ['@supabase/supabase-js'],
          // SGSO module chunking for better performance
          sgso: [
            './src/components/sgso/SgsoDashboard',
            './src/components/sgso/AnpPracticesManager',
            './src/components/sgso/RiskAssessmentMatrix',
            './src/components/sgso/IncidentReporting',
            './src/components/sgso/TrainingCompliance',
            './src/components/sgso/AuditPlanner',
            './src/components/sgso/NonConformityManager',
            './src/components/sgso/ComplianceMetrics',
            './src/components/sgso/EmergencyResponse'
          ]
        }
      }
    },
    // Remove console.log/error/warn em produção
    esbuild: mode === 'production' ? {
      drop: ['console', 'debugger'],
      pure: ['console.log', 'console.error', 'console.warn', 'console.info'],
    } : undefined,
  },
  preview: {
    host: true,
    port: 4173
  }
}));
