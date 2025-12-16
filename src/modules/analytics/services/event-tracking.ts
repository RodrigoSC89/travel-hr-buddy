/**
 * Event Tracking Service for Analytics Core
 * Tracks user interactions and page views in real-time
 */

import { supabase } from "@/integrations/supabase/client";

export interface TrackEventOptions {
  eventName: string;
  eventCategory?: string;
  properties?: Record<string, any>;
  pageUrl?: string;
  referrer?: string;
}

class EventTrackingService {
  private sessionId: string;
  private organizationId: string | null = null;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeOrganization();
  }

  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  }

  private async initializeOrganization() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // TODO: Replace with actual organization lookup
        // For now, using user_id as placeholder. In production, fetch from:
        // - profiles table with organization_id foreign key
        // - organization_members junction table
        // - or similar organizational structure
        this.organizationId = user.id;
      }
    } catch (error) {
      console.error("Error initializing organization:", error);
    }
  }

  /**
   * Track a custom event
   */
  async trackEvent(options: TrackEventOptions): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const eventData = {
        user_id: user?.id || null,
        organization_id: this.organizationId,
        session_id: this.sessionId,
        event_name: options.eventName,
        event_category: options.eventCategory || "user_interaction",
        properties: options.properties || {},
        page_url: options.pageUrl || window.location.href,
        referrer: options.referrer || document.referrer,
        user_agent: navigator.userAgent,
        device_type: this.getDeviceType(),
        browser: this.getBrowser(),
        os: this.getOS()
      };

      const { error } = await supabase
        .from("analytics_events")
        .insert([eventData]);

      if (error) {
        console.error("Error tracking event:", error);
      }
    } catch (error) {
      console.error("Error in trackEvent:", error);
    }
  }

  /**
   * Track page view
   */
  async trackPageView(pageName?: string): Promise<void> {
    await this.trackEvent({
      eventName: "page_view",
      eventCategory: "navigation",
      properties: {
        page_name: pageName || document.title,
        path: window.location.pathname
      }
    });
  }

  /**
   * Track button click
   */
  async trackClick(buttonName: string, properties?: Record<string, any>): Promise<void> {
    await this.trackEvent({
      eventName: "button_click",
      eventCategory: "interaction",
      properties: {
        button_name: buttonName,
        ...properties
      }
    });
  }

  /**
   * Track form submission
   */
  async trackFormSubmit(formName: string, properties?: Record<string, any>): Promise<void> {
    await this.trackEvent({
      eventName: "form_submit",
      eventCategory: "interaction",
      properties: {
        form_name: formName,
        ...properties
      }
    });
  }

  /**
   * Track search
   */
  async trackSearch(query: string, resultsCount?: number): Promise<void> {
    await this.trackEvent({
      eventName: "search",
      eventCategory: "interaction",
      properties: {
        query,
        results_count: resultsCount
      }
    });
  }

  /**
   * Track feature usage
   */
  async trackFeatureUse(featureName: string, properties?: Record<string, any>): Promise<void> {
    await this.trackEvent({
      eventName: "feature_use",
      eventCategory: "engagement",
      properties: {
        feature_name: featureName,
        ...properties
      }
    });
  }

  /**
   * Track error
   */
  async trackError(errorMessage: string, errorStack?: string): Promise<void> {
    await this.trackEvent({
      eventName: "error",
      eventCategory: "system",
      properties: {
        error_message: errorMessage,
        error_stack: errorStack
      }
    });
  }

  /**
   * Get device type
   */
  private getDeviceType(): string {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return "tablet";
    }
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
      return "mobile";
    }
    return "desktop";
  }

  /**
   * Get browser name
   */
  private getBrowser(): string {
    const ua = navigator.userAgent;
    if (ua.includes("Firefox")) return "Firefox";
    if (ua.includes("Chrome")) return "Chrome";
    if (ua.includes("Safari")) return "Safari";
    if (ua.includes("Edge")) return "Edge";
    if (ua.includes("Opera")) return "Opera";
    return "Unknown";
  }

  /**
   * Get operating system
   */
  private getOS(): string {
    const ua = navigator.userAgent;
    if (ua.includes("Win")) return "Windows";
    if (ua.includes("Mac")) return "MacOS";
    if (ua.includes("Linux")) return "Linux";
    if (ua.includes("Android")) return "Android";
    if (ua.includes("iOS")) return "iOS";
    return "Unknown";
  }
}

// Export singleton instance
export const eventTracker = new EventTrackingService();
