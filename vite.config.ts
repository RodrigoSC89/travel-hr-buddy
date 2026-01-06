import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import { VitePWA } from "vite-plugin-pwa";
import { createHtmlPlugin } from "vite-plugin-html";
import compression from "vite-plugin-compression";

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
      }),
      // PATCH PERF: Gzip compression for production builds
      mode === "production" && compression({
        algorithm: "gzip",
        ext: ".gz",
        threshold: 1024, // Only compress files > 1KB
      }),
      // PATCH PERF: Brotli compression for modern browsers
      mode === "production" && compression({
        algorithm: "brotliCompress",
        ext: ".br",
        threshold: 1024,
      }),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      // CRITICAL: Ensure single React instance to prevent useState null error
      dedupe: [
        "react", 
        "react-dom", 
        "react-router-dom",
        "@tanstack/react-query",
        "react-helmet-async"
      ],
    },
    build: {
      outDir: "dist",
      sourcemap: false,
      chunkSizeWarningLimit: 2000,
      target: "esnext",
      cssCodeSplit: true,
      // Use esbuild instead of terser to reduce memory usage
      minify: mode === "production" ? "esbuild" : false,
      commonjsOptions: {
        exclude: [/supabase\/functions/],
      },
      reportCompressedSize: false, // Acelera build
      assetsInlineLimit: 4096,
      rollupOptions: {
        // Reduce memory usage during build
        maxParallelFileOps: 2,
        treeshake: mode === "production",
        output: {
          // Simplified chunking to reduce memory usage
          manualChunks: (id) => {
            if (id.includes("node_modules")) {
              // Core essentials
              if (id.includes("react/") || id.includes("react-dom/") || id.includes("react-router")) {
                return "core";
              }
              // Supabase
              if (id.includes("@supabase")) {
                return "supabase";
              }
              // Heavy libraries - separate chunks
              if (id.includes("three") || id.includes("@react-three")) {
                return "three";
              }
              if (id.includes("@tensorflow") || id.includes("onnxruntime")) {
                return "ai-ml";
              }
              if (id.includes("recharts") || id.includes("chart.js")) {
                return "charts";
              }
              if (id.includes("mapbox-gl")) {
                return "map";
              }
              if (id.includes("firebase")) {
                return "firebase";
              }
              if (id.includes("framer-motion")) {
                return "motion";
              }
              if (id.includes("@radix-ui")) {
                return "ui";
              }
              // Everything else
              return "vendor";
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
        "react-helmet-async",
        "mqtt"
      ],
      // Remove force: true to prevent HMR issues
      exclude: [],
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
