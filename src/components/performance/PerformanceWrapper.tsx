/**
 * Performance Wrapper
 * PATCH 834: Main performance wrapper component for the app
 */

import React, { useEffect, ReactNode } from "react";
import { bandwidthOptimizer, useBandwidthOptimizer } from "@/lib/performance/low-bandwidth-optimizer";
import { webVitalsMonitor } from "@/lib/performance/web-vitals-monitor";
import { errorTracker } from "@/lib/error-tracking/error-tracker";
import { analytics } from "@/lib/analytics/analytics-client";
import { ConnectionIndicator } from "./ConnectionIndicator";
import { PWAInstallPrompt, PWAUpdatePrompt, OfflineIndicator } from "@/components/pwa/PWAPrompt";

interface PerformanceWrapperProps {
  children: ReactNode;
  showConnectionIndicator?: boolean;
  showPWAPrompts?: boolean;
  showOfflineIndicator?: boolean;
  enableAnalytics?: boolean;
  enableErrorTracking?: boolean;
  enableWebVitals?: boolean;
}

export const PerformanceWrapper = memo(function({
  children,
  showConnectionIndicator = true,
  showPWAPrompts = true,
  showOfflineIndicator = true,
  enableAnalytics = true,
  enableErrorTracking = true,
  enableWebVitals = true,
}: PerformanceWrapperProps) {
  // Initialize all performance systems
  useEffect(() => {
    // Initialize bandwidth optimizer
    bandwidthOptimizer.init();

    // Initialize Web Vitals monitoring
    if (enableWebVitals) {
      webVitalsMonitor.init();
    }

    // Initialize error tracking
    if (enableErrorTracking) {
      errorTracker.init();
    }

    // Track performance metrics
    if (enableAnalytics) {
      // Track initial page load
      analytics.track("app_loaded", {
        connection_type: bandwidthOptimizer.getConnectionType(),
        viewport_width: window.innerWidth,
        viewport_height: window.innerHeight,
      });
    }

    // Performance observer for LCP
    if ("PerformanceObserver" in window) {
      try {
        const lcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          
          if (enableAnalytics) {
            analytics.timing("performance", "lcp", lastEntry.startTime);
          }
        });
        lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });

        return () => {
          lcpObserver.disconnect();
        });
      } catch (e) {
        // Performance Observer not supported
      }
    }
  }, [enableWebVitals, enableErrorTracking, enableAnalytics]);

  // Apply performance classes based on connection
  const { connectionType, isLowBandwidth } = useBandwidthOptimizer();

  useEffect(() => {
    // Add connection class to body for CSS optimizations
    document.body.setAttribute("data-connection", connectionType);
    
    if (isLowBandwidth) {
      document.body.classList.add("low-bandwidth");
    } else {
      document.body.classList.remove("low-bandwidth");
    }
  }, [connectionType, isLowBandwidth]);

  return (
    <>
      {/* Offline indicator at top */}
      {showOfflineIndicator && <OfflineIndicator />}
      
      {/* Main content */}
      {children}

      {/* Connection indicator */}
      {showConnectionIndicator && <ConnectionIndicator />}

      {/* PWA prompts */}
      {showPWAPrompts && (
        <>
          <PWAInstallPrompt />
          <PWAUpdatePrompt />
        </>
      )}
    </>
  );
}

// Higher-order component version
export function withPerformance<P extends object>(
  Component: React.ComponentType<P>,
  options?: Partial<PerformanceWrapperProps>
) {
  return function WrappedComponent(props: P) {
    return (
      <PerformanceWrapper {...options}>
        <Component {...props} />
      </PerformanceWrapper>
    );
  };
}

// Performance context for children
import { createContext, useContext, useEffect, useCallback } from "react";;;

interface PerformanceContextValue {
  connectionType: string;
  isLowBandwidth: boolean;
  shouldLoadImages: boolean;
  shouldAnimate: boolean;
  imageQuality: number;
}

const PerformanceContext = createContext<PerformanceContextValue | null>(null);

export const PerformanceProvider = memo(function({ children }: { children: ReactNode }) {
  const optimizer = useBandwidthOptimizer();

  const value: PerformanceContextValue = {
    connectionType: optimizer.connectionType,
    isLowBandwidth: optimizer.isLowBandwidth,
    shouldLoadImages: optimizer.shouldLoadImages,
    shouldAnimate: optimizer.shouldAnimate,
    imageQuality: optimizer.imageQuality,
  };

  return (
    <PerformanceContext.Provider value={value}>
      {children}
    </PerformanceContext.Provider>
  );
}

export const usePerformanceContext = memo(function() {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error("usePerformanceContext must be used within PerformanceProvider");
  }
  return context;
}
