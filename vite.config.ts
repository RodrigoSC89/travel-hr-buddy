import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/tests/setup.ts",
    css: true,
    testTimeout: 15000, // Increase timeout to 15 seconds for tests with external calls
    env: {
      NODE_ENV: "test", // Set NODE_ENV to test to skip delays in fallback logic
    },
  },
  base: "/",
  server: {
    host: true,
    port: 8080,
    strictPort: true,
  },
  plugins: [
    react(), 
    mode === "development" && componentTagger(),
    mode === "production" && sentryVitePlugin({
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
    }),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "robots.txt", "placeholder.svg"],
      manifest: {
        name: "Nautilus One - Sistema de Gestão Empresarial",
        short_name: "Nautilus One",
        description: "Sistema revolucionário de gestão empresarial com módulos de RH, viagens e hospedagem",
        theme_color: "#0f172a",
        background_color: "#0A0A0A",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        icons: [
          {
            src: "/icons/icon.svg",
            sizes: "192x192",
            type: "image/svg+xml",
            purpose: "any maskable"
          },
          {
            src: "/icons/icon.svg",
            sizes: "512x512",
            type: "image/svg+xml",
            purpose: "any maskable"
          }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "gstatic-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /\/api\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 5 // 5 minutes
              },
              networkTimeoutSeconds: 10
            }
          }
        ],
        navigateFallback: "/",
        navigateFallbackDenylist: [/^\/api\//]
      },
      devOptions: {
        enabled: false,
        type: "module"
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/lib": path.resolve(__dirname, "./lib"),
    },
  },
  build: {
    outDir: "dist",
    sourcemap: mode === "production",
    minify: "esbuild",
    target: "es2020",
    chunkSizeWarningLimit: 1700,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks for core libraries
          if (id.includes("node_modules")) {
            if (id.includes("react") || id.includes("react-dom") || id.includes("react-router-dom")) {
              return "vendor";
            }
            if (id.includes("@radix-ui/react-dialog") || 
                id.includes("@radix-ui/react-dropdown-menu") || 
                id.includes("@radix-ui/react-tabs")) {
              return "ui";
            }
            if (id.includes("recharts")) {
              return "charts";
            }
            if (id.includes("@supabase/supabase-js")) {
              return "supabase";
            }
            if (id.includes("mapbox-gl")) {
              return "mapbox";
            }
          }
          // SGSO module chunking
          if (id.includes("src/components/sgso/")) {
            return "sgso";
          }
          // Travel module chunking
          if (id.includes("src/components/travel/")) {
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
            if (id.includes("travel-map")) {
              return "travel-map";
            }
            return "travel-misc";
          }
        }
      }
    },
    esbuild: mode === "production" ? {
      drop: ["debugger"],
      pure: mode === "production" ? ["console.log", "console.debug"] : [],
    } : undefined,
  },
  define: {
    "process.env": {},
    "process": { env: {} }
  },
  preview: {
    host: true,
    port: 4173
  }
}));
