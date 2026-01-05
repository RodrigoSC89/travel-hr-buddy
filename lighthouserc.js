/**
 * Lighthouse CI Configuration
 * Performance Budget Enforcement for Nautilus One
 */

module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:5173/',
        'http://localhost:5173/dashboard',
        'http://localhost:5173/central-comando/visao-geral',
        'http://localhost:5173/frota',
        'http://localhost:5173/tripulacao',
        'http://localhost:5173/peotram',
      ],
      numberOfRuns: 3,
      settings: {
        preset: 'desktop',
        throttling: {
          // Simulate maritime satellite connection
          rttMs: 500,
          throughputKbps: 1024,
          cpuSlowdownMultiplier: 2,
        },
      },
    },
    assert: {
      assertions: {
        // Performance metrics
        'first-contentful-paint': ['warn', { maxNumericValue: 1500 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'interactive': ['error', { maxNumericValue: 3500 }],
        'speed-index': ['warn', { maxNumericValue: 3000 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        
        // Category scores
        'categories:performance': ['warn', { minScore: 0.85 }],
        'categories:accessibility': ['error', { minScore: 0.90 }],
        'categories:best-practices': ['warn', { minScore: 0.85 }],
        'categories:seo': ['warn', { minScore: 0.80 }],
        
        // Resource budgets
        'resource-summary:script:size': ['error', { maxNumericValue: 350000 }], // 350KB
        'resource-summary:stylesheet:size': ['warn', { maxNumericValue: 50000 }], // 50KB
        'resource-summary:image:size': ['warn', { maxNumericValue: 200000 }], // 200KB
        'resource-summary:font:size': ['warn', { maxNumericValue: 100000 }], // 100KB
        'resource-summary:total:size': ['error', { maxNumericValue: 1000000 }], // 1MB
        
        // PWA requirements
        'installable-manifest': 'warn',
        'service-worker': 'warn',
        'splash-screen': 'warn',
        'themed-omnibox': 'warn',
        'viewport': 'error',
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
