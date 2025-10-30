import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import { VitePWA } from "vite-plugin-pwa";
import { createHtmlPlugin } from "vite-plugin-html";

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
      // PATCH 130.0: Preload critical assets
      createHtmlPlugin({
        minify: mode === "production",
        inject: {
          tags: [
            // Preload critical fonts
            {
              tag: "link",
              attrs: {
                rel: "preconnect",
                href: "https://fonts.googleapis.com",
              },
              injectTo: "head-prepend",
            },
            {
              tag: "link",
              attrs: {
                rel: "preconnect",
                href: "https://fonts.gstatic.com",
                crossorigin: "anonymous",
              },
              injectTo: "head-prepend",
            },
          ],
        },
      }),
      ...(mode === "production" && process.env.SENTRY_AUTH_TOKEN ? [sentryVitePlugin({
        org: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT,
        authToken: process.env.SENTRY_AUTH_TOKEN,
      })] : []),
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
      chunkSizeWarningLimit: 1000, // Reduzido para forçar chunks menores
      target: "esnext",
      cssCodeSplit: true,
      minify: "terser",
      terserOptions: {
        compress: {
          drop_console: mode === "production", // Remove console em produção
          drop_debugger: true,
          pure_funcs: mode === "production" ? ["console.log", "console.debug", "console.info"] : [],
        },
        mangle: {
          safari10: true, // Compatibilidade
        },
        format: {
          comments: false, // Remove comentários
        },
      },
      commonjsOptions: {
        exclude: [/supabase\/functions/],
      },
      // Compressão otimizada
      reportCompressedSize: false, // Acelera build
      assetsInlineLimit: 4096, // Inline assets pequenos
      rollupOptions: {
        output: {
          // Otimização agressiva para chunks menores
          manualChunks: (id) => {
            // Core vendors - carregados primeiro
            if (id.includes("node_modules")) {
              // React core - essencial
              if (id.includes("react/") || id.includes("react-dom/")) {
                return "core-react";
              }
              if (id.includes("react-router")) {
                return "core-router";
              }
              if (id.includes("@tanstack/react-query")) {
                return "core-query";
              }
              
              // Supabase - crítico
              if (id.includes("@supabase/supabase-js")) {
                return "core-supabase";
              }
              
              // UI Components - carregamento lazy
              if (id.includes("@radix-ui")) {
                // Separar componentes Radix por tipo
                if (id.includes("dialog") || id.includes("sheet") || id.includes("drawer")) {
                  return "ui-modals";
                }
                if (id.includes("select") || id.includes("dropdown") || id.includes("popover")) {
                  return "ui-popovers";
                }
                if (id.includes("tabs") || id.includes("accordion") || id.includes("collapsible")) {
                  return "ui-containers";
                }
                return "ui-misc";
              }
              
              // Charts - lazy loading
              if (id.includes("recharts") || id.includes("chart.js") || id.includes("react-chartjs-2")) {
                return "charts";
              }
              
              // Map libraries - muito pesadas, lazy
              if (id.includes("mapbox-gl")) {
                return "map";
              }
              
              // Icons - separado para cache
              if (id.includes("lucide-react")) {
                return "icons";
              }
              
              // Editor - lazy
              if (id.includes("@tiptap")) {
                return "editor";
              }
              
              // Animations - lazy
              if (id.includes("framer-motion")) {
                return "motion";
              }
              
              // MQTT - específico
              if (id.includes("mqtt")) {
                return "mqtt";
              }
              
              // Outros vendors agrupados
              return "vendors";
            }
            
            // Módulos grandes - separar em chunks individuais
            if (id.includes("src/modules/")) {
              // Travel module - usado frequentemente
              if (id.includes("modules/travel")) {
                return "module-travel";
              }
              // HR modules
              if (id.includes("modules/hr")) {
                return "module-hr";
              }
              // Document modules
              if (id.includes("modules/documents")) {
                return "module-docs";
              }
              // Intelligence modules
              if (id.includes("modules/intelligence")) {
                return "module-intel";
              }
              // Logistics
              if (id.includes("modules/logistics")) {
                return "module-logistics";
              }
              // Operations
              if (id.includes("modules/operations")) {
                return "module-ops";
              }
              // Fleet
              if (id.includes("modules/fleet")) {
                return "module-fleet";
              }
              // Emergency
              if (id.includes("modules/emergency")) {
                return "module-emergency";
              }
              // Compliance
              if (id.includes("modules/compliance")) {
                return "module-compliance";
              }
              // Connectivity
              if (id.includes("modules/connectivity")) {
                return "module-connectivity";
              }
              // Finance
              if (id.includes("modules/finance")) {
                return "module-finance";
              }
              // Assistants
              if (id.includes("modules/assistants")) {
                return "module-assistants";
              }
              // Demais módulos
              return "modules-misc";
            }
            
            // Pages - agrupar por área
            if (id.includes("src/pages/")) {
              if (id.includes("admin/")) {
                return "pages-admin";
              }
              if (id.includes("developer/")) {
                return "pages-dev";
              }
              return "pages-main";
            }
          }
        }
      },
    },
    optimizeDeps: {
      include: ["mqtt", "@supabase/supabase-js", "react-router-dom"],
    },
    cacheDir: ".vite-cache",
    esbuild: {
      logOverride: { "this-is-undefined-in-esm": "silent" },
      logLevel: "silent",
      ...(mode === "production" ? {
        drop: ["debugger"],
        pure: ["console.log", "console.debug"],
      } : {}),
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
