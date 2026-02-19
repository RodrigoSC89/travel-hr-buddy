/**
 * PostHog Analytics - Event tracking, funnels, and feature flags
 * Wraps PostHog SDK with maritime-specific events
 */
import posthog from "posthog-js";
import { logger } from "@/lib/logger";

// PostHog is already installed - configure it
const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY || "";
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || "https://us.i.posthog.com";

let initialized = false;

export function initPostHog() {
  if (initialized || !POSTHOG_KEY) {
    if (!POSTHOG_KEY) {
      logger.info("[PostHog] No API key configured, analytics disabled");
    }
    return;
  }
  
  try {
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      capture_pageview: true,
      capture_pageleave: true,
      autocapture: true,
      persistence: "localStorage",
      disable_session_recording: false,
      loaded: () => {
        logger.info("[PostHog] Analytics initialized");
      },
    });
    initialized = true;
  } catch (err) {
    logger.warn("[PostHog] Failed to initialize:", err);
  }
}

// ─── Identity ─────────────────────────────────────────
export function identifyUser(userId: string, properties?: Record<string, any>) {
  if (!initialized) return;
  posthog.identify(userId, properties);
}

export function resetUser() {
  if (!initialized) return;
  posthog.reset();
}

// ─── Events ───────────────────────────────────────────
export function trackEvent(event: string, properties?: Record<string, any>) {
  if (!initialized) return;
  posthog.capture(event, properties);
}

// Maritime-specific event helpers
export const analytics = {
  // Navigation
  pageView: (page: string) => trackEvent("page_view", { page }),
  moduleAccess: (module: string) => trackEvent("module_accessed", { module }),
  hubSwitch: (from: string, to: string) => trackEvent("hub_switch", { from, to }),
  
  // Crew
  crewAction: (action: string, crewId?: string) => trackEvent("crew_action", { action, crew_id: crewId }),
  certificationAlert: (type: string) => trackEvent("certification_alert", { type }),
  
  // Compliance
  auditStarted: (framework: string) => trackEvent("audit_started", { framework }),
  auditCompleted: (framework: string, score: number) => trackEvent("audit_completed", { framework, score }),
  
  // AI
  aiQuery: (module: string, type: string) => trackEvent("ai_query", { module, type }),
  aiDecision: (type: string, confidence: number) => trackEvent("ai_decision", { type, confidence }),
  
  // Operations
  voyageCreated: () => trackEvent("voyage_created"),
  vesselAdded: () => trackEvent("vessel_added"),
  reportGenerated: (type: string) => trackEvent("report_generated", { type }),
  
  // Engagement
  featureDiscovery: (feature: string) => trackEvent("feature_discovery", { feature }),
  onboardingStep: (step: number) => trackEvent("onboarding_step", { step }),
  onboardingCompleted: () => trackEvent("onboarding_completed"),
  
  // Subscription
  planViewed: (plan: string) => trackEvent("plan_viewed", { plan }),
  checkoutStarted: (plan: string) => trackEvent("checkout_started", { plan }),
  subscriptionActive: (plan: string) => trackEvent("subscription_active", { plan }),
};

// ─── Feature Flags ────────────────────────────────────
export function isFeatureEnabled(flag: string): boolean {
  if (!initialized) return false;
  return posthog.isFeatureEnabled(flag) ?? false;
}

export function getFeatureFlag(flag: string): string | boolean | undefined {
  if (!initialized) return undefined;
  return posthog.getFeatureFlag(flag);
}

// ─── Groups (Multi-tenant) ────────────────────────────
export function setOrganization(orgId: string, properties?: Record<string, any>) {
  if (!initialized) return;
  posthog.group("organization", orgId, properties);
}

export function setVessel(vesselId: string, properties?: Record<string, any>) {
  if (!initialized) return;
  posthog.group("vessel", vesselId, properties);
}
