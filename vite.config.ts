import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
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
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2}"],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB limit
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
              return "vendor-react";
            }
            if (id.includes("@radix-ui")) {
              return "vendor-ui";
            }
            if (id.includes("recharts") || id.includes("chart.js")) {
              return "vendor-charts";
            }
            if (id.includes("@supabase")) {
              return "vendor-supabase";
            }
            if (id.includes("mapbox-gl")) {
              return "vendor-mapbox";
            }
            if (id.includes("@tanstack/react-query")) {
              return "vendor-query";
            }
            // Group other node_modules into vendor-misc
            return "vendor-misc";
          }
          
          // Nautilus Core modules (new chunking strategy)
          if (id.includes("src/core/")) {
            return "nautilus-core";
          }
          if (id.includes("src/ai/nautilus-core")) {
            return "nautilus-ai";
          }
          
          // Module chunking
          if (id.includes("src/modules/bridgelink/")) {
            return "module-bridgelink";
          }
          if (id.includes("src/modules/control-hub/")) {
            return "module-controlhub";
          }
          if (id.includes("src/modules/dp-intelligence/")) {
            return "module-dp";
          }
          if (id.includes("src/modules/mmi/")) {
            return "module-mmi";
          }
          if (id.includes("src/modules/fmea/")) {
            return "module-fmea";
          }
          
          // SGSO module chunking
          if (id.includes("src/components/sgso/")) {
            return "module-sgso";
          }
          
          // Travel module chunking
          if (id.includes("src/components/travel/")) {
            if (id.includes("hotel")) {
              return "travel-hotel";
            }
            if (id.includes("flight")) {
              return "travel-flights";
            }
            return "travel-misc";
          }
          
          // Don't create chunks for pages - keep them dynamic
          if (id.includes("src/pages/")) {
            return undefined;
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
