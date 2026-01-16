/**
 * PostHog Analytics & Feature Flags
 * Tracks user behavior, feature adoption, and conversion funnels
 */
import posthog from "posthog-js";

// Initialize PostHog
export const initPostHog = () => {
  const apiKey = import.meta.env.VITE_POSTHOG_KEY;
  const host = import.meta.env.VITE_POSTHOG_HOST || "https://app.posthog.com";
  
  if (!apiKey || import.meta.env.DEV) {
    console.log("[PostHog] Disabled in development mode");
    return;
  }

  posthog.init(apiKey, {
    api_host: host,
    autocapture: true,
    capture_pageview: true,
    capture_pageleave: true,
    persistence: "localStorage",
    
    // Privacy settings
    mask_all_text: false,
    mask_all_element_attributes: false,
    
    // Session recording
    enable_recording_console_log: true,
    session_recording: {
      recordCrossOriginIframes: false,
    },
    
    // Feature flags
    bootstrap: {
      featureFlags: {},
    },
    
    loaded: (ph) => {
      console.log("[PostHog] Initialized successfully");
      
      // Auto-identify if user stored
      const userId = localStorage.getItem("posthog_user_id");
      if (userId) {
        ph.identify(userId);
      }
    },
  });
};

// Identify user
export const identifyUser = (
  userId: string,
  properties?: Record<string, unknown>
) => {
  posthog.identify(userId, properties);
  localStorage.setItem("posthog_user_id", userId);
};

// Reset user (on logout)
export const resetUser = () => {
  posthog.reset();
  localStorage.removeItem("posthog_user_id");
};

// Track events
export const trackEvent = (
  eventName: string,
  properties?: Record<string, unknown>
) => {
  posthog.capture(eventName, properties);
};

// Track page views
export const trackPageView = (pageName: string, properties?: Record<string, unknown>) => {
  posthog.capture("$pageview", {
    page_name: pageName,
    ...properties,
  });
};

// Feature flags
export const isFeatureEnabled = (flagKey: string): boolean => {
  return posthog.isFeatureEnabled(flagKey) ?? false;
};

export const getFeatureFlag = (flagKey: string): string | boolean | undefined => {
  return posthog.getFeatureFlag(flagKey);
};

// Set user properties
export const setUserProperties = (properties: Record<string, unknown>) => {
  posthog.people?.set(properties);
};

// ═══════════════════════════════════════════════════════════════
// PRE-DEFINED EVENTS FOR NAUTI ONE
// ═══════════════════════════════════════════════════════════════

// Navigation events
export const trackNavigation = (from: string, to: string) => {
  trackEvent("navigation", { from, to });
};

// Module usage
export const trackModuleUsage = (moduleName: string, action: string) => {
  trackEvent("module_usage", { module: moduleName, action });
};

// AI interactions
export const trackAIInteraction = (
  agentName: string,
  action: "query" | "response" | "error",
  metadata?: Record<string, unknown>
) => {
  trackEvent("ai_interaction", {
    agent: agentName,
    action,
    ...metadata,
  });
};

// PEOTRAM events
export const trackPEOTRAMEvent = (
  action: "start_audit" | "generate_evidence" | "export_pdf" | "complete",
  element?: number
) => {
  trackEvent("peotram", { action, element });
};

// GMUD events
export const trackGMUDEvent = (
  action: "create" | "submit" | "approve" | "reject" | "sign",
  stage?: number
) => {
  trackEvent("gmud", { action, stage });
};

// Crew events
export const trackCrewEvent = (
  action: "view" | "add" | "edit" | "sync_cts" | "certificate_upload"
) => {
  trackEvent("crew_management", { action });
};

// Voice events
export const trackVoiceEvent = (
  action: "start" | "command" | "response" | "error",
  command?: string
) => {
  trackEvent("voice_ai", { action, command });
};

// Billing events
export const trackBillingEvent = (
  action: "view_plans" | "select_plan" | "checkout" | "success" | "cancel",
  plan?: string
) => {
  trackEvent("billing", { action, plan });
};

// Performance metrics
export const trackPerformance = (
  metricName: string,
  value: number,
  unit: "ms" | "s" | "count" | "percent"
) => {
  trackEvent("performance", { metric: metricName, value, unit });
};

// Error tracking
export const trackError = (
  errorType: string,
  message: string,
  context?: Record<string, unknown>
) => {
  trackEvent("error", { type: errorType, message, ...context });
};

export default posthog;
