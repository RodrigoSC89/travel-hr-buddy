import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Enable PWA only in production mode
  const enablePwa = mode === "production";
  
  return {
    base: "/",
    server: {
      host: true,
      port: 8080,
      strictPort: true,
      hmr: { overlay: false }
    },
    plugins: [
      react(), 
      mode === "development" && componentTagger(),
      mode === "production" && sentryVitePlugin({
        org: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT,
        authToken: process.env.SENTRY_AUTH_TOKEN,
      }),
      enablePwa && VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "favicon.ico",
        "robots.txt",
        "placeholder.svg",
        "src/modules/**/*",
        "public/modules/**/*"
      ],
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
        maximumFileSizeToCacheInBytes: 10485760, // 10MB limit for PWA caching
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
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
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    chunkSizeWarningLimit: 1200,
    target: "esnext",
    cssCodeSplit: true,
    minify: "esbuild",
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks for core libraries
          if (id.includes("node_modules")) {
            if (id.includes("mqtt")) {
              return "mqtt";
            }
            if (id.includes("@supabase/supabase-js")) {
              return "supabase";
            }
            if (id.includes("react") || id.includes("react-dom") || id.includes("react-router-dom")) {
              return "vendor-react";
            }
            if (id.includes("@radix-ui/react-dialog") || 
                id.includes("@radix-ui/react-dropdown-menu") || 
                id.includes("@radix-ui/react-tabs")) {
              return "vendor-ui";
            }
            if (id.includes("recharts")) {
              return "vendor-charts";
            }
            if (id.includes("mapbox-gl")) {
              return "vendor-mapbox";
            }
            // Group other vendors
            return "vendor-misc";
          }
          
          // AI modules
          if (id.includes("src/lib/ai/reporter.ts")) {
            return "ai";
          }
          
          // Nautilus Core modules
          if (id.includes("src/core/BridgeLink")) {
            return "module-bridgelink";
          }
          if (id.includes("src/pages/ControlHub")) {
            return "module-controlhub";
          }
          if (id.includes("src/ai/nautilus-core")) {
            return "module-nautilus-ai";
          }
          
          // DP module chunking
          if (id.includes("src/pages/DP") || id.includes("src/modules/dp")) {
            return "module-dp";
          }
          
          // MMI module chunking
          if (id.includes("src/pages/MMI") || id.includes("src/modules/mmi")) {
            return "module-mmi";
          }
          
          // FMEA module chunking
          if (id.includes("src/modules/fmea")) {
            return "module-fmea";
          }
          
          // SGSO module chunking
          if (id.includes("src/components/sgso/") || id.includes("src/pages/SGSO")) {
            return "module-sgso";
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
  },
  optimizeDeps: {
    include: ["mqtt", "@supabase/supabase-js", "react-router-dom"],
  },
  cacheDir: ".vite",
  esbuild: {
    target: "esnext",
    logOverride: { "this-is-undefined-in-esm": "silent" },
    logLevel: "silent",
    ...(mode === "production" ? {
      drop: ["debugger"],
      pure: ["console.log", "console.debug"],
    } : {}),
  },
  define: {
    "process.env": {},
    "process": { env: {} },
    "process.env.LOVABLE_FULL_PREVIEW": true
  },
    preview: {
      host: true,
      port: 4173
    }
  };
});
