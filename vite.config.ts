import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: "/",
  server: {
    host: true,
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    minify: "esbuild",
    target: "es2020", // Atualizado para suportar big integers
    chunkSizeWarningLimit: 1700, // Increased to accommodate mapbox-gl (1.6MB) - other chunks remain well below 600kB
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks for core libraries
          if (id.includes("node_modules")) {
            if (id.includes("react") || id.includes("react-dom") || id.includes("react-router-dom")) {
              return "vendor";
            }
            if (id.includes("@radix-ui")) {
              return "ui";
            }
            if (id.includes("recharts")) {
              return "charts";
            }
            if (id.includes("@supabase/supabase-js")) {
              return "supabase";
            }
            // Mapbox is very large, give it its own chunk
            if (id.includes("mapbox-gl")) {
              return "mapbox";
            }
            // Date utilities
            if (id.includes("date-fns")) {
              return "date-utils";
            }
            // Form libraries
            if (id.includes("react-hook-form") || id.includes("zod") || id.includes("@hookform")) {
              return "forms";
            }
            // Query and data fetching
            if (id.includes("@tanstack/react-query")) {
              return "query";
            }
          }
          // SGSO module chunking for better performance
          if (id.includes("src/components/sgso/")) {
            return "sgso";
          }
          // Travel module chunking - split large travel components into separate chunks
          if (id.includes("src/components/travel/")) {
            // Large components get their own chunks
            if (id.includes("enhanced-hotel-search") || id.includes("responsive-hotel-search")) {
              return "travel-hotel";
            }
            if (id.includes("flight-search")) {
              return "travel-flights";
            }
            if (id.includes("predictive-travel-dashboard")) {
              return "travel-predictive";
            }
            if (id.includes("travel-booking-system")) {
              return "travel-booking";
            }
            if (id.includes("travel-analytics-dashboard")) {
              return "travel-analytics";
            }
            if (id.includes("ai-travel-assistant")) {
              return "travel-ai";
            }
            if (id.includes("travel-expense-system")) {
              return "travel-expenses";
            }
            if (id.includes("travel-policy-system")) {
              return "travel-policy";
            }
            if (id.includes("travel-approval-system")) {
              return "travel-approvals";
            }
            if (id.includes("travel-document-manager")) {
              return "travel-documents";
            }
            if (id.includes("travel-communication")) {
              return "travel-comms";
            }
            if (id.includes("travel-notification")) {
              return "travel-notifications";
            }
            // Travel map goes with other small components
            if (id.includes("travel-map")) {
              return "travel-map";
            }
            // Rest of travel components (should be minimal now)
            return "travel-misc";
          }
        }
      }
    },
    // Remove console logs and debugger in production for better performance
    esbuild: mode === "production" ? {
      drop: ["console", "debugger"],
    } : undefined,
  },
  preview: {
    host: true,
    port: 4173
  }
}));
