/**
 * PATCH 190.0 - Build Optimization Config
 * 
 * Vite configuration for optimal mobile builds
 */

import { defineConfig, type UserConfig } from "vite";

/**
 * Mobile-optimized build configuration
 */
export const mobileBuildConfig: Partial<UserConfig["build"]> = {
  // Target modern browsers for smaller bundles
  target: "es2020",
  
  // Minification
  minify: "terser",
  terserOptions: {
    compress: {
      drop_console: true,
      drop_debugger: true,
      pure_funcs: ["console.log", "console.debug"],
    },
    mangle: {
      safari10: true,
    },
  },
  
  // Code splitting
  rollupOptions: {
    output: {
      // Manual chunks for better caching
      manualChunks: {
        // Core React (rarely changes)
        "vendor-react": ["react", "react-dom", "react-router-dom"],
        
        // UI Components
        "vendor-ui": [
          "@radix-ui/react-dialog",
          "@radix-ui/react-dropdown-menu",
          "@radix-ui/react-popover",
          "@radix-ui/react-tooltip",
        ],
        
        // Supabase (separate chunk)
        "vendor-supabase": ["@supabase/supabase-js"],
        
        // Charts (lazy loaded)
        "vendor-charts": ["recharts"],
        
        // Query/State
        "vendor-query": ["@tanstack/react-query", "@tanstack/react-virtual"],
      },
      
      // Asset file naming
      assetFileNames: (assetInfo) => {
        const name = assetInfo.name || "";
        if (/\.(gif|jpe?g|png|svg|webp|avif)$/.test(name)) {
          return "assets/images/[name]-[hash][extname]";
        }
        if (/\.css$/.test(name)) {
          return "assets/css/[name]-[hash][extname]";
        }
        return "assets/[name]-[hash][extname]";
      },
      
      // Chunk file naming
      chunkFileNames: "assets/js/[name]-[hash].js",
      entryFileNames: "assets/js/[name]-[hash].js",
    },
  },
  
  // Source maps for production debugging
  sourcemap: "hidden",
  
  // Chunk size warning
  chunkSizeWarningLimit: 300,
  
  // CSS code splitting
  cssCodeSplit: true,
  
  // Asset inlining threshold (4kb)
  assetsInlineLimit: 4096,
};

/**
 * PWA configuration for offline support
 */
export const pwaConfig = {
  registerType: "autoUpdate" as const,
  includeAssets: ["favicon.ico", "robots.txt", "icons/*.png"],
  
  manifest: {
    name: "Nautilus One",
    short_name: "Nautilus",
    description: "Maritime Operations Platform",
    theme_color: "#0f172a",
    background_color: "#0f172a",
    display: "standalone",
    orientation: "portrait",
    start_url: "/",
    scope: "/",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  },
  
  workbox: {
    // Cache strategies
    runtimeCaching: [
      // App shell - stale while revalidate
      {
        urlPattern: /^https:\/\/.*\.(js|css|html)$/,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "app-shell-v1",
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 60 * 60 * 24, // 1 day
          },
        },
      },
      
      // API calls - network first with fallback
      {
        urlPattern: /\/rest\/v1\//,
        handler: "NetworkFirst",
        options: {
          cacheName: "api-cache-v1",
          networkTimeoutSeconds: 5,
          expiration: {
            maxEntries: 200,
            maxAgeSeconds: 60 * 60, // 1 hour
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },
      
      // Images - cache first
      {
        urlPattern: /\.(png|jpg|jpeg|webp|avif|gif|svg)$/,
        handler: "CacheFirst",
        options: {
          cacheName: "images-v1",
          expiration: {
            maxEntries: 200,
            maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
          },
        },
      },
      
      // Fonts - cache first with long expiry
      {
        urlPattern: /\.(woff2?|ttf|eot)$/,
        handler: "CacheFirst",
        options: {
          cacheName: "fonts-v1",
          expiration: {
            maxEntries: 20,
            maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
          },
        },
      },
      
      // Google Fonts
      {
        urlPattern: /^https:\/\/fonts\.googleapis\.com/,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "google-fonts-stylesheets",
        },
      },
      {
        urlPattern: /^https:\/\/fonts\.gstatic\.com/,
        handler: "CacheFirst",
        options: {
          cacheName: "google-fonts-webfonts",
          expiration: {
            maxEntries: 30,
            maxAgeSeconds: 60 * 60 * 24 * 365,
          },
        },
      },
    ],
    
    // Precache important assets
    globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
    
    // Skip waiting
    skipWaiting: true,
    clientsClaim: true,
    
    // Clean old caches
    cleanupOutdatedCaches: true,
  },
};

/**
 * Development optimization
 */
export const devOptimizations = {
  // Faster HMR
  server: {
    hmr: {
      overlay: true,
    },
    watch: {
      usePolling: false,
    },
  },
  
  // Optimized deps
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@tanstack/react-query",
      "@supabase/supabase-js",
    ],
    exclude: ["@vite/client", "@vite/env"],
  },
  
  // Faster esbuild
  esbuild: {
    target: "es2020",
    legalComments: "none",
  },
};

export default { mobileBuildConfig, pwaConfig, devOptimizations };
