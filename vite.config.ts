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
        workbox: {
          maximumFileSizeToCacheInBytes: 10485760, // 10MB limit for PWA caching
          globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2}"],
          // PATCH 599: Enhanced runtime caching strategies
          runtimeCaching: [
            // Google Fonts - CacheFirst for long-term caching
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
            // PATCH 599: API calls - NetworkFirst with fallback
            {
              urlPattern: /\/api\/.*/i,
              handler: "NetworkFirst",
              options: {
                cacheName: "api-cache",
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 5 // 5 minutes
                },
                networkTimeoutSeconds: 10,
                plugins: [
                  {
                    // PATCH 599: Fallback to cache on network failure
                    handlerDidError: async () => {
                      const cached = await caches.match("/offline.html");
                      return cached || new Response("Offline", { status: 503 });
                    }
                  }
                ]
              }
            },
            // PATCH 599: Static assets - CacheFirst with versioning
            {
              urlPattern: /\.(?:js|css)$/,
              handler: "StaleWhileRevalidate",
              options: {
                cacheName: "static-assets",
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 * 7 // 1 week
                }
              }
            },
            // PATCH 599: Images - CacheFirst
            {
              urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
              handler: "CacheFirst",
              options: {
                cacheName: "image-cache",
                expiration: {
                  maxEntries: 60,
                  maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
                }
              }
            },
            // PATCH 599: Supabase API - NetworkFirst
            {
              urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
              handler: "NetworkFirst",
              options: {
                cacheName: "supabase-api",
                expiration: {
                  maxEntries: 30,
                  maxAgeSeconds: 60 * 2 // 2 minutes
                },
                networkTimeoutSeconds: 5
              }
            }
          ],
          navigateFallback: "/",
          navigateFallbackDenylist: [/^\/api\//],
          // PATCH 599: Clean old caches on activation
          cleanupOutdatedCaches: true,
          // PATCH 600: Skip waiting to activate immediately
          skipWaiting: true,
          clientsClaim: true
        },
        // PATCH 598: Enhanced manifest configuration
        manifest: {
          name: "Nautilus One - Sistema de Gestão Empresarial",
          short_name: "Nautilus One",
          description: "Sistema revolucionário de gestão empresarial com módulos de RH, viagens e hospedagem",
          theme_color: "#0f172a",
          background_color: "#0A0A0A",
          display: "standalone",
          orientation: "portrait",
          start_url: "/",
          scope: "/",
          // PATCH 598: Enhanced icons with multiple sizes
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
            },
            {
              src: "/nautilus-logo.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "any"
            },
            {
              src: "/nautilus-logo.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any"
            }
          ],
          // PATCH 598: App shortcuts for quick access
          shortcuts: [
            {
              name: "Dashboard",
              short_name: "Dashboard",
              description: "Acesse o dashboard principal",
              url: "/?module=dashboard",
              icons: [{ src: "/icons/icon.svg", sizes: "96x96" }]
            },
            {
              name: "Recursos Humanos",
              short_name: "RH",
              description: "Gestão de pessoas e certificados",
              url: "/?module=hr",
              icons: [{ src: "/icons/icon.svg", sizes: "96x96" }]
            },
            {
              name: "Viagens",
              short_name: "Viagens",
              description: "Buscar passagens e hotéis",
              url: "/?module=flights",
              icons: [{ src: "/icons/icon.svg", sizes: "96x96" }]
            }
          ],
          // PATCH 600: Security and privacy configurations
          categories: ["business", "productivity", "travel"],
          lang: "pt-BR",
          dir: "ltr",
          // PATCH 600: Display override for enhanced PWA experience
          display_override: ["window-controls-overlay", "standalone"],
          // PATCH 600: Protocol handlers (future enhancement)
          protocol_handlers: []
        },
        // PATCH 598: Push notification support
        includeAssets: [
          "favicon.ico",
          "robots.txt",
          "placeholder.svg",
          "offline.html",
          "src/modules/**/*",
          "public/modules/**/*"
        ],
        devOptions: {
          enabled: false,
          type: "module",
          // PATCH 600: Security - no devtools in production
          navigateFallback: "/"
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
          // PATCH 547: Otimização agressiva para chunks menores e melhor cache
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
