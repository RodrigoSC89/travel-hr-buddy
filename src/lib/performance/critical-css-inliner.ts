/**
 * Critical CSS Inliner
 * PATCH 880: Extract and inline critical CSS for FCP
 */

/**
 * Critical CSS for above-the-fold content
 * This gets inlined in the HTML head
 */
export const criticalCSS = `
/* Critical Reset */
*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%;line-height:1.5}
body{margin:0;font-family:Inter,-apple-system,sans-serif}

/* Critical Layout */
.min-h-screen{min-height:100vh}
.flex{display:flex}
.items-center{align-items:center}
.justify-center{justify-content:center}
.w-full{width:100%}

/* Loading Spinner */
.animate-spin{animation:spin 1s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}

/* Background */
.bg-background{background-color:hsl(0 0% 100%)}
.dark .bg-background{background-color:hsl(220 17% 7%)}

/* Text */
.text-foreground{color:hsl(220 87% 8%)}
.dark .text-foreground{color:hsl(0 0% 95%)}

/* Border */
.border-primary{border-color:hsl(214 84% 46%)}
.border-t-transparent{border-top-color:transparent}
.rounded-full{border-radius:9999px}

/* Sizing */
.h-12{height:3rem}
.w-12{width:3rem}
.border-4{border-width:4px}
`;

/**
 * Inject critical CSS into document head
 */
export function injectCriticalCSS(): void {
  if (typeof document === "undefined") return;
  
  // Check if already injected
  if (document.getElementById("critical-css")) return;
  
  const style = document.createElement("style");
  style.id = "critical-css";
  style.textContent = criticalCSS;
  
  // Insert at beginning of head
  document.head.insertBefore(style, document.head.firstChild);
}

/**
 * Mark non-critical CSS as async
 */
export function deferNonCriticalCSS(): void {
  if (typeof document === "undefined") return;
  
  const links = document.querySelectorAll('link[rel="stylesheet"]');
  
  links.forEach((link) => {
    const href = link.getAttribute("href");
    
    // Skip critical stylesheets
    if (href?.includes("critical")) return;
    
    // Convert to async loading
    link.setAttribute("media", "print");
    link.setAttribute("onload", "this.media='all'");
  });
}

/**
 * Preload critical fonts
 */
export function preloadCriticalFonts(): void {
  if (typeof document === "undefined") return;
  
  const fonts = [
    {
      href: "https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7.woff2",
      type: "font/woff2",
    },
  ];
  
  fonts.forEach(({ href, type }) => {
    if (document.querySelector(`link[href="${href}"]`)) return;
    
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "font";
    link.type = type;
    link.href = href;
    link.crossOrigin = "anonymous";
    document.head.appendChild(link);
  });
}

/**
 * Initialize critical CSS optimizations
 */
export function initCriticalCSS(): void {
  injectCriticalCSS();
  preloadCriticalFonts();
  
  // Defer non-critical CSS after load
  if (document.readyState === "complete") {
    deferNonCriticalCSS();
  } else {
    window.addEventListener("load", deferNonCriticalCSS, { once: true });
  }
}
