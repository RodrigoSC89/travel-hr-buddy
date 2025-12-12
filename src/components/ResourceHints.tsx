/**
import { useEffect } from "react";;
 * Resource Hints Component
 * Preconnect, prefetch, and preload critical resources
 */

import React, { useEffect, memo } from "react";
import { Helmet } from "react-helmet-async";

interface ResourceHintsProps {
  // External domains to preconnect
  preconnectDomains?: string[];
  // Critical resources to preload
  preloadResources?: Array<{
    href: string;
    as: "script" | "style" | "font" | "image" | "fetch";
    type?: string;
    crossOrigin?: "anonymous" | "use-credentials";
  }>;
  // DNS prefetch domains
  dnsPrefetchDomains?: string[];
}

// Default critical domains
const DEFAULT_PRECONNECT = [
  "https://vnbptmixvwropvanyhdb.supabase.co",
  "https://fonts.googleapis.com",
  "https://fonts.gstatic.com",
];

const DEFAULT_DNS_PREFETCH = [
  "https://api.mapbox.com",
  "https://events.mapbox.com",
];

export const ResourceHints: React.FC<ResourceHintsProps> = memo(({
  preconnectDomains = DEFAULT_PRECONNECT,
  preloadResources = [],
  dnsPrefetchDomains = DEFAULT_DNS_PREFETCH,
}) => {
  // Add preconnect links dynamically for faster resource loading
  useEffect(() => {
    const links: HTMLLinkElement[] = [];
    
    // Add preconnect links
    preconnectDomains.forEach(domain => {
      const link = document.createElement("link");
      link.rel = "preconnect";
      link.href = domain;
      link.crossOrigin = "anonymous";
      document.head.appendChild(link);
      links.push(link);
    });

    // Cleanup on unmount
    return () => {
      links.forEach(link => {
        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
      });
    };
  }, [preconnectDomains]);

  return (
    <Helmet>
      {/* DNS Prefetch for less critical domains */}
      {dnsPrefetchDomains.map(domain => (
        <link key={`dns-${domain}`} rel="dns-prefetch" href={domain} />
      ))}
      
      {/* Preload critical resources */}
      {preloadResources.map(resource => (
        <link
          key={`preload-${resource.href}`}
          rel="preload"
          href={resource.href}
          as={resource.as}
          type={resource.type}
          crossOrigin={resource.crossOrigin}
        />
      ))}
    </Helmet>
  );
});

ResourceHints.displayName = "ResourceHints";

/**
 * Critical CSS inline component
 * Injects critical CSS for above-the-fold content
 */
export const CriticalCSS: React.FC = memo(() => {
  const criticalStyles = `
    /* Critical CSS for initial render */
    :root {
      --background: 0 0% 100%;
      --foreground: 222.2 84% 4.9%;
    }
    .dark {
      --background: 222.2 84% 4.9%;
      --foreground: 210 40% 98%;
    }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background: hsl(var(--background));
      color: hsl(var(--foreground));
    }
    /* Prevent layout shift */
    img, video { max-width: 100%; height: auto; }
    /* Loading skeleton animation */
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    .skeleton {
      background: linear-gradient(90deg, hsl(var(--muted)) 25%, hsl(var(--muted)/0.5) 50%, hsl(var(--muted)) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s ease-in-out infinite;
    }
  `;

  return (
    <Helmet>
      <style>{criticalStyles}</style>
    </Helmet>
  );
});

CriticalCSS.displayName = "CriticalCSS";

export default ResourceHints;
