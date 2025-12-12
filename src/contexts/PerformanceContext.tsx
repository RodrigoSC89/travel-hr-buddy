/**
import { useCallback, useContext, useEffect, useState } from "react";;
 * Performance Provider
 * Centralizes all performance optimizations and provides context
 * PATCH: Fixed to avoid hook initialization issues
 */

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { webVitalsMonitor } from "@/lib/web-vitals-monitor";
import { imageOptimizer } from "@/lib/image-optimizer";

interface PerformanceContextType {
  // Network state
  isSlowConnection: boolean;
  isOffline: boolean;
  networkQuality: "excellent" | "good" | "fair" | "poor" | "offline";
  
  // Performance metrics
  performanceScore: number;
  performanceRating: "good" | "needs-improvement" | "poor";
  
  // Image optimization
  bestImageFormat: "avif" | "webp" | "jpeg";
  imageQuality: number;
  
  // Actions
  prefetchRoute: (route: string) => void;
  reportCustomMetric: (name: string, value: number) => void;
}

const PerformanceContext = createContext<PerformanceContextType | null>(null);

export const usePerformance = () => {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error("usePerformance must be used within PerformanceProvider");
  }
  return context;
};

// Optional hook that doesn't throw
export const usePerformanceOptional = () => {
  return useContext(PerformanceContext);
};

interface PerformanceProviderProps {
  children: ReactNode;
}

// Simple network detection without external dependencies
function useSimpleNetworkState() {
  const [isOnline, setIsOnline] = useState(true);
  const [isSlowConnection, setIsSlowConnection] = useState(false);
  const [quality, setQuality] = useState<"excellent" | "good" | "fair" | "poor" | "offline">("good");

  useEffect(() => {
    // Check if we're in browser
    if (typeof window === "undefined" || typeof navigator === "undefined") {
      return;
    }

    // Update online status
    setIsOnline(navigator.onLine);

    // Check connection quality
    const connection = (navigator as unknown).connection || 
                      (navigator as unknown).mozConnection || 
                      (navigator as unknown).webkitConnection;

    const updateNetworkState = () => {
      const online = navigator.onLine;
      setIsOnline(online);

      if (!online) {
        setQuality("offline");
        setIsSlowConnection(true);
        return;
      }

      if (connection) {
        const effectiveType = connection.effectiveType;
        const downlink = connection.downlink ?? 10;
        
        if (effectiveType === "4g" && downlink >= 5) {
          setQuality("excellent");
          setIsSlowConnection(false);
        } else if (effectiveType === "4g" || effectiveType === "3g") {
          setQuality("good");
          setIsSlowConnection(downlink < 2);
        } else if (effectiveType === "2g") {
          setQuality("poor");
          setIsSlowConnection(true);
        } else {
          setQuality("fair");
          setIsSlowConnection(downlink < 2);
        }
      }
    };

    updateNetworkState();

    // Listen for changes
    window.addEventListener("online", updateNetworkState);
    window.addEventListener("offline", updateNetworkState);
    
    if (connection?.addEventListener) {
      connection.addEventListener("change", updateNetworkState);
    }

    return () => {
      window.removeEventListener("online", updateNetworkState);
      window.removeEventListener("offline", updateNetworkState);
      if (connection?.removeEventListener) {
        connection.removeEventListener("change", updateNetworkState);
      }
    };
  }, []);

  return { isOnline, isSlowConnection, quality };
}

export const PerformanceProvider: React.FC<PerformanceProviderProps> = ({ children }) => {
  const networkState = useSimpleNetworkState();
  const [performanceScore, setPerformanceScore] = useState(100);
  const [performanceRating, setPerformanceRating] = useState<"good" | "needs-improvement" | "poor">("good");
  const [bestImageFormat, setBestImageFormat] = useState<"avif" | "webp" | "jpeg">("jpeg");

  // Initialize image optimizer and get best format
  useEffect(() => {
    const initImageOptimizer = async () => {
      try {
        await imageOptimizer.initialize();
        setBestImageFormat(imageOptimizer.getBestFormat());
      } catch (e) {
        // Silently fail - use default jpeg
      }
    };
    initImageOptimizer();
  }, []);

  // Subscribe to web vitals updates
  useEffect(() => {
    try {
      const unsubscribe = webVitalsMonitor.onMetric(() => {
        const score = webVitalsMonitor.getScore();
        setPerformanceScore(score.score);
        setPerformanceRating(score.rating);
      });
      
      return unsubscribe;
    } catch (e) {
      // Silently fail
      return () => {};
    }
  }, []);

  // Update web vitals monitor based on network
  useEffect(() => {
    try {
      webVitalsMonitor.setSlowNetworkMode(networkState.isSlowConnection);
    } catch (e) {
      // Silently fail
    }
  }, [networkState.isSlowConnection]);

  // Prefetch route for faster navigation
  const prefetchRoute = useCallback((route: string) => {
    if (networkState.isSlowConnection || !networkState.isOnline) return;
    
    try {
      const link = document.createElement("link");
      link.rel = "prefetch";
      link.href = route;
      document.head.appendChild(link);
    } catch (e) {
      // Silently fail
    }
  }, [networkState.isSlowConnection, networkState.isOnline]);

  // Report custom performance metric
  const reportCustomMetric = useCallback((name: string, value: number) => {
    try {
      if ("performance" in window && "mark" in performance) {
        performance.mark(`custom-${name}-${value}`);
      }
    } catch (e) {
      // Silently fail
    }
  }, []);

  // Calculate image quality based on network
  const imageQuality = networkState.isSlowConnection ? 60 : 80;

  const value: PerformanceContextType = {
    isSlowConnection: networkState.isSlowConnection,
    isOffline: !networkState.isOnline,
    networkQuality: networkState.quality,
    performanceScore,
    performanceRating,
    bestImageFormat,
    imageQuality,
    prefetchRoute,
    reportCustomMetric
  };

  return (
    <PerformanceContext.Provider value={value}>
      {children}
    </PerformanceContext.Provider>
  );
};

export default PerformanceProvider;
