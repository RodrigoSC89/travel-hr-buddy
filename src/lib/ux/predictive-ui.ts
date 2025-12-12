/**
 * Predictive UI System - PATCH 836
 * AI-powered user behavior prediction for pre-loading content
 */

import { useState, useEffect, useCallback } from "react";

interface UserAction {
  type: "click" | "hover" | "scroll" | "navigation" | "search";
  target: string;
  timestamp: number;
  context?: Record<string, unknown>;
}

interface PredictionResult {
  action: string;
  confidence: number;
  prefetchUrls: string[];
  preloadComponents: string[];
}

class PredictiveUIEngine {
  private actions: UserAction[] = [];
  private patterns: Map<string, number> = new Map();
  private maxHistory = 100;
  private storageKey = "nautilus_user_patterns";
  
  constructor() {
    this.loadPatterns();
  }
  
  private loadPatterns(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        this.patterns = new Map(Object.entries(data));
      }
    } catch {
      // Ignore storage errors
    }
  }
  
  private savePatterns(): void {
    try {
      const data = Object.fromEntries(this.patterns);
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch {
      // Ignore storage errors
    }
  }
  
  /**
   * Track user action
   */
  trackAction(action: Omit<UserAction, "timestamp">): void {
    const fullAction: UserAction = {
      ...action,
      timestamp: Date.now(),
    };
    
    this.actions.push(fullAction);
    
    // Keep history limited
    if (this.actions.length > this.maxHistory) {
      this.actions.shift();
    }
    
    // Update patterns
    this.updatePatterns(fullAction);
  }
  
  private updatePatterns(action: UserAction): void {
    // Create pattern key from last 2 actions
    const recentActions = this.actions.slice(-3);
    if (recentActions.length < 2) return;
    
    const patternKey = recentActions
      .slice(0, -1)
      .map(a => `${a.type}:${a.target}`)
      .join("->");
    
    const currentAction = `${action.type}:${action.target}`;
    const fullPattern = `${patternKey}->${currentAction}`;
    
    // Increment pattern count
    const count = this.patterns.get(fullPattern) || 0;
    this.patterns.set(fullPattern, count + 1);
    
    // Save periodically
    if (this.actions.length % 10 === 0) {
      this.savePatterns();
    }
  }
  
  /**
   * Predict next user action
   */
  predict(): PredictionResult[] {
    if (this.actions.length < 2) {
      return [];
    }
    
    const recentPattern = this.actions
      .slice(-2)
      .map(a => `${a.type}:${a.target}`)
      .join("->");
    
    const predictions: PredictionResult[] = [];
    let totalMatches = 0;
    
    // Find matching patterns
    this.patterns.forEach((count, pattern) => {
      if (pattern.startsWith(recentPattern)) {
        const nextAction = pattern.split("->").pop() || "";
        totalMatches += count;
        
        predictions.push({
          action: nextAction,
          confidence: count,
          prefetchUrls: this.getPrefetchUrls(nextAction),
          preloadComponents: this.getPreloadComponents(nextAction),
        });
      }
    });
    
    // Normalize confidence
    return predictions
      .map(p => ({
        ...p,
        confidence: totalMatches > 0 ? p.confidence / totalMatches : 0,
      }))
      .filter(p => p.confidence > 0.1)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3);
  }
  
  private getPrefetchUrls(action: string): string[] {
    const [, target] = action.split(":");
    
    // Map actions to URLs
    const urlMappings: Record<string, string[]> = {
      "dashboard": ["/api/dashboard-stats", "/api/notifications"],
      "travel": ["/api/travel-requests", "/api/travel-stats"],
      "hr": ["/api/employees", "/api/hr-stats"],
      "documents": ["/api/documents", "/api/recent-docs"],
      "fleet": ["/api/vessels", "/api/fleet-status"],
      "operations": ["/api/operations", "/api/schedules"],
    };
    
    return urlMappings[target] || [];
  }
  
  private getPreloadComponents(action: string): string[] {
    const [, target] = action.split(":");
    
    // Map actions to components
    const componentMappings: Record<string, string[]> = {
      "dashboard": ["DashboardStats", "ActivityFeed"],
      "travel": ["TravelRequestForm", "TravelHistory"],
      "hr": ["EmployeeList", "HRDashboard"],
      "documents": ["DocumentViewer", "DocumentList"],
      "fleet": ["VesselMap", "FleetStatus"],
    };
    
    return componentMappings[target] || [];
  }
  
  /**
   * Get user engagement score
   */
  getEngagementScore(): number {
    if (this.actions.length === 0) return 0;
    
    const now = Date.now();
    const recentActions = this.actions.filter(
      a => now - a.timestamp < 5 * 60 * 1000 // Last 5 minutes
    );
    
    return Math.min(100, recentActions.length * 5);
  }
  
  /**
   * Get most used features
   */
  getMostUsedFeatures(): Array<{ feature: string; count: number }> {
    const featureCounts: Record<string, number> = {};
    
    this.actions
      .filter(a => a.type === "navigation" || a.type === "click")
      .forEach(a => {
        featureCounts[a.target] = (featureCounts[a.target] || 0) + 1;
      });
    
    return Object.entries(featureCounts)
      .map(([feature, count]) => ({ feature, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }
  
  /**
   * Clear user data
   */
  clearData(): void {
    this.actions = [];
    this.patterns.clear();
    localStorage.removeItem(this.storageKey);
  }
}

// Singleton instance
export const predictiveUI = new PredictiveUIEngine();

/**
 * React hook for predictive UI
 */
export function usePredictiveUI() {
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  const [engagement, setEngagement] = useState(0);
  
  const trackAction = useCallback((
    type: UserAction["type"],
    target: string,
    context?: Record<string, unknown>
  ) => {
    predictiveUI.trackAction({ type, target, context });
    setPredictions(predictiveUI.predict());
    setEngagement(predictiveUI.getEngagementScore());
  }, []);
  
  const trackNavigation = useCallback((path: string) => {
    trackAction("navigation", path);
  }, [trackAction]);
  
  const trackClick = useCallback((element: string) => {
    trackAction("click", element);
  }, [trackAction]);
  
  const trackHover = useCallback((element: string) => {
    trackAction("hover", element);
  }, [trackAction]);
  
  return {
    predictions,
    engagement,
    trackAction,
    trackNavigation,
    trackClick,
    trackHover,
    mostUsedFeatures: predictiveUI.getMostUsedFeatures(),
    clearData: predictiveUI.clearData.bind(predictiveUI),
  };
}

/**
 * Hook for smart prefetching based on predictions
 */
export function useSmartPrefetching() {
  const { predictions } = usePredictiveUI();
  
  useEffect(() => {
    // Prefetch predicted URLs
    predictions.forEach(prediction => {
      if (prediction.confidence > 0.3) {
        prediction.prefetchUrls.forEach(url => {
          const link = document.createElement("link");
          link.rel = "prefetch";
          link.href = url;
          document.head.appendChild(link);
        });
      }
    });
  }, [predictions]);
  
  return { predictions };
}
