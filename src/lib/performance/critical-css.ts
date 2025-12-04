/**
 * PATCH 190.0 - Critical CSS Extractor
 * 
 * Extracts and inlines critical CSS for faster FCP
 */

/**
 * Critical CSS rules for above-the-fold content
 * These should be inlined in the HTML head
 */
export const criticalCSS = `
/* Base reset */
*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%;line-height:1.5}
body{margin:0;font-family:system-ui,-apple-system,sans-serif}

/* Layout */
.app-shell{min-height:100vh;display:flex;flex-direction:column}
.app-header{height:64px;display:flex;align-items:center;padding:0 16px}
.app-main{flex:1;padding:16px}
.app-nav{height:56px;display:flex;align-items:center;justify-content:space-around}

/* Skeleton loading */
.skeleton{background:linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%);
background-size:200% 100%;animation:skeleton 1.5s infinite}
@keyframes skeleton{0%{background-position:200% 0}100%{background-position:-200% 0}}

/* Critical buttons */
.btn{display:inline-flex;align-items:center;justify-content:center;
padding:8px 16px;border-radius:6px;font-weight:500;cursor:pointer}
.btn-primary{background:#3b82f6;color:#fff;border:none}

/* Hide content until JS loads */
.js-only{opacity:0;transition:opacity 0.3s}
.js-loaded .js-only{opacity:1}

/* Reduce layout shift */
img,video{max-width:100%;height:auto}
img[loading="lazy"]{aspect-ratio:attr(width)/attr(height)}
`;

/**
 * Font preload links
 */
export const fontPreloads = [
  {
    href: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff2",
    type: "font/woff2",
    crossOrigin: "anonymous",
  },
];

/**
 * Resource hints for faster loading
 */
export const resourceHints = {
  // DNS prefetch for external domains
  dnsPrefetch: [
    "https://fonts.googleapis.com",
    "https://fonts.gstatic.com",
  ],
  
  // Preconnect for critical resources
  preconnect: [
    "https://fonts.googleapis.com",
    "https://fonts.gstatic.com",
  ],
  
  // Prefetch for likely next pages
  prefetch: [
    "/dashboard",
    "/missions",
  ],
};

/**
 * Generate critical CSS inline tag
 */
export function generateCriticalStyleTag(): string {
  return `<style id="critical-css">${criticalCSS.replace(/\s+/g, " ").trim()}</style>`;
}

/**
 * Generate font preload tags
 */
export function generateFontPreloads(): string {
  return fontPreloads
    .map(
      (font) =>
        `<link rel="preload" href="${font.href}" as="font" type="${font.type}" crossorigin="${font.crossOrigin}">`
    )
    .join("\n");
}

/**
 * Generate resource hint tags
 */
export function generateResourceHints(): string {
  const hints: string[] = [];
  
  resourceHints.dnsPrefetch.forEach((url) => {
    hints.push(`<link rel="dns-prefetch" href="${url}">`);
  });
  
  resourceHints.preconnect.forEach((url) => {
    hints.push(`<link rel="preconnect" href="${url}" crossorigin>`);
  });
  
  return hints.join("\n");
}

/**
 * Generate complete head optimizations
 */
export function generateHeadOptimizations(): string {
  return `
${generateResourceHints()}
${generateFontPreloads()}
${generateCriticalStyleTag()}
<script>document.documentElement.classList.add('js-loaded')</script>
  `.trim();
}
