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
      hmr: { 
        overlay: false,
        // Prevent full page reloads on HMR errors
        timeout: 5000
      }
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
          maximumFileSizeToCacheInBytes: 5242880, // 5MB limit for PWA caching (reduced for 2Mb connections)
          globPatterns: ["**/*.{js,css,html,ico,svg,woff2}"], // Removed png, prefer webp
          // PATCH 587: Enhanced runtime caching strategies for better offline support
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
            // PATCH 587: API cache with network-first strategy (optimized for 2Mb)
            {
              urlPattern: /\/api\/.*/i,
              handler: "NetworkFirst",
              options: {
                cacheName: "api-cache",
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 5 // 5 minutes - shorter TTL for bandwidth
                },
                networkTimeoutSeconds: 8, // Faster timeout for slow connections
                plugins: [
                  {
                    cacheWillUpdate: async ({ response }) => {
                      // Only cache successful responses
                      if (response && response.status === 200) {
                        return response;
                      }
                      return null;
                    }
                  }
                ]
              }
            },
            // PATCH 587: Supabase API caching for offline resilience (optimized)
            {
              urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/.*/i,
              handler: "NetworkFirst",
              options: {
                cacheName: "supabase-api-cache",
                expiration: {
                  maxEntries: 100, // Reduced for memory
                  maxAgeSeconds: 60 * 10 // 10 minutes
                },
                networkTimeoutSeconds: 6, // Faster fallback to cache
                plugins: [
                  {
                    cacheWillUpdate: async ({ response }) => {
                      if (response && (response.status === 200 || response.status === 304)) {
                        return response;
                      }
                      return null;
                    }
                  }
                ]
              }
            },
            // PATCH 587: Image caching with CacheFirst for better performance
            {
              urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
              handler: "CacheFirst",
              options: {
                cacheName: "images-cache",
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            // PATCH 587: Static assets caching
            {
              urlPattern: /\.(?:js|css)$/i,
              handler: "StaleWhileRevalidate",
              options: {
                cacheName: "static-assets-cache",
                expiration: {
                  maxEntries: 60,
                  maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            }
          ],
          navigateFallback: "/",
          navigateFallbackDenylist: [/^\/api\//],
          // PATCH 587: Skip waiting for faster updates
          skipWaiting: true,
          clientsClaim: true
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
        // CRITICAL PATCH 854.0: Force all React imports to resolve to the same location
        // This prevents "Cannot read properties of null (reading 'useEffect')" error
        "react": path.resolve(__dirname, "node_modules/react"),
        "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
        "react/jsx-runtime": path.resolve(__dirname, "node_modules/react/jsx-runtime"),
        "react/jsx-dev-runtime": path.resolve(__dirname, "node_modules/react/jsx-dev-runtime"),
        // CRITICAL: Also alias scheduler to prevent React internals mismatch
        "scheduler": path.resolve(__dirname, "node_modules/scheduler"),
      },
      // CRITICAL: Ensure single React instance to prevent useState null error
      dedupe: [
        "react", 
        "react-dom", 
        "react-router-dom",
        "@tanstack/react-query",
        "react-helmet-async",
        "scheduler",
        "react/jsx-runtime",
        "react/jsx-dev-runtime"
      ],
    },
    build: {
      outDir: "dist",
      sourcemap: false,
      chunkSizeWarningLimit: 500, // FASE 2.5: Reduzido para 500KB para forçar melhor splitting
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
          // FASE 2.5: Otimização ultra-agressiva para reduzir bundle inicial
          manualChunks: (id) => {
            // Core vendors - carregados primeiro (prioritário)
            if (id.includes("node_modules")) {
              // React core - essencial, sempre carregado
              if (id.includes("react/") || id.includes("react-dom/")) {
                return "core-react";
              }
              if (id.includes("react-router")) {
                return "core-router";
              }
              if (id.includes("@tanstack/react-query")) {
                return "core-query";
              }
              
              // Supabase - crítico, mas pode ser otimizado
              if (id.includes("@supabase/supabase-js") || id.includes("@supabase/ssr")) {
                return "core-supabase";
              }
              
              // UI Components - carregamento lazy e granular
              if (id.includes("@radix-ui")) {
                // Separar componentes Radix por tipo para melhor cache
                if (id.includes("dialog") || id.includes("sheet") || id.includes("drawer") || id.includes("alert-dialog")) {
                  return "ui-modals";
                }
                if (id.includes("select") || id.includes("dropdown") || id.includes("popover") || id.includes("hover-card")) {
                  return "ui-popovers";
                }
                if (id.includes("tabs") || id.includes("accordion") || id.includes("collapsible")) {
                  return "ui-containers";
                }
                if (id.includes("toast") || id.includes("tooltip")) {
                  return "ui-feedback";
                }
                return "ui-misc";
              }
              
              // Charts - lazy loading, separado por biblioteca
              if (id.includes("recharts")) {
                return "charts-recharts";
              }
              if (id.includes("chart.js") || id.includes("react-chartjs-2")) {
                return "charts-chartjs";
              }
              
              // Map libraries - muito pesadas, totalmente lazy
              if (id.includes("mapbox-gl")) {
                return "map";
              }
              
              // Icons - separado para cache
              if (id.includes("lucide-react")) {
                return "icons";
              }
              
              // Editor - lazy
              if (id.includes("@tiptap") || id.includes("y-prosemirror") || id.includes("yjs")) {
                return "editor";
              }
              
              // Animations - lazy
              if (id.includes("framer-motion")) {
                return "motion";
              }
              
              // MQTT - específico para IoT/conectividade
              if (id.includes("mqtt")) {
                return "mqtt";
              }
              
              // AI/ML libraries - lazy, pesadas
              if (id.includes("@tensorflow") || id.includes("onnxruntime")) {
                return "ai-ml";
              }
              
              // 3D/XR libraries - lazy, muito pesadas
              if (id.includes("three") || id.includes("@react-three") || id.includes("webxr")) {
                return "3d_xr";
              }
              
              // PDF/Document generation - lazy
              if (id.includes("jspdf") || id.includes("html2pdf") || id.includes("html2canvas") || id.includes("docx")) {
                return "pdf-gen";
              }
              
              // Firebase - lazy se usado
              if (id.includes("firebase")) {
                return "firebase";
              }
              
              // Date/Time utilities
              if (id.includes("date-fns")) {
                return "utils-date";
              }
              
              // Lodash utilities
              if (id.includes("lodash")) {
                return "utils-lodash";
              }
              
              // Form handling
              if (id.includes("react-hook-form") || id.includes("@hookform")) {
                return "forms";
              }
              
              // Outros vendors agrupados (reduzido ao mínimo)
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
            
            // FASE 2.5: Pages - chunking ultra-granular para reduzir bundles
            if (id.includes("src/pages/")) {
              // Admin pages separadas por funcionalidade
              if (id.includes("admin/")) {
                if (id.includes("admin/sgso") || id.includes("admin/templates") || id.includes("admin/training")) {
                  return "pages-admin-docs";
                }
                if (id.includes("admin/ci-") || id.includes("admin/performance") || id.includes("admin/dashboard")) {
                  return "pages-admin-monitoring";
                }
                if (id.includes("admin/restore")) {
                  return "pages-admin-restore";
                }
                return "pages-admin-core";
              }
              
              // AI pages - separar do main
              if (id.includes("pages/ai/")) {
                return "pages-ai";
              }
              
              // Emerging tech pages - lazy load
              if (id.includes("pages/emerging/")) {
                return "pages-emerging";
              }
              
              // Developer pages
              if (id.includes("developer/")) {
                return "pages-dev";
              }
              
              // Command Centers - páginas pesadas divididas
              if (id.includes("CommandCenter") || id.includes("OperationsCommandCenter") || id.includes("FinanceCommandCenter")) {
                return "pages-command-centers";
              }
              if (id.includes("WorkflowCommandCenter") || id.includes("VoyageCommandCenter") || id.includes("AlertsCommandCenter")) {
                return "pages-workflow-centers";
              }
              
              // Dashboards específicos
              if (id.includes("BIDashboard") || id.includes("MMIDashboard") || id.includes("Dashboard")) {
                return "pages-dashboards";
              }
              
              // Fleet e Tracking - podem ter mapas
              if (id.includes("FleetTracking") || id.includes("Fleet") || id.includes("Voyage")) {
                return "pages-fleet";
              }
              
              // Analytics e BI
              if (id.includes("Analytics") || id.includes("Insights") || id.includes("Predictive") || id.includes("Forecast")) {
                return "pages-analytics";
              }
              
              // Experimental e features
              if (id.includes("Experimental") || id.includes("AR.tsx") || id.includes("PluginManager")) {
                return "pages-experimental";
              }
              
              // Gamification e engagement
              if (id.includes("Gamification") || id.includes("Notification") || id.includes("Alerts")) {
                return "pages-engagement";
              }
              
              // Sistema e configuração
              if (id.includes("SystemHub") || id.includes("Settings") || id.includes("Admin.tsx")) {
                return "pages-system";
              }
              
              // Auth e profile
              if (id.includes("Auth") || id.includes("user/profile")) {
                return "pages-auth";
              }
              
              // Finance específico
              if (id.includes("Finance")) {
                return "pages-finance";
              }
              
              // Workflow e processos
              if (id.includes("Workflow") || id.includes("Bridge") || id.includes("MMI")) {
                return "pages-workflow";
              }
              
              // Páginas principais lightweight (Index, etc.)
              return "pages-core";
            }
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
        "react/jsx-dev-runtime",
        "react-router-dom",
        "@supabase/supabase-js",
        "@tanstack/react-query",
        "@tanstack/react-query-devtools",
        "react-helmet-async",
        "scheduler",
        "mqtt"
      ],
      exclude: [],
      // CRITICAL: Force rebuild of optimized deps to clear corrupted cache
      force: false,
      // Ensure single React instance by not allowing esbuild to bundle React separately
      esbuildOptions: {
        target: "esnext",
        // Force React to be resolved from the same location
        resolveExtensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json"],
      },
    },
    // Use fresh cache directory - increment version to force rebuild
    // PATCH 854.0: New cache version to clear corrupted React instances
    cacheDir: ".vite-cache-v5",
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
