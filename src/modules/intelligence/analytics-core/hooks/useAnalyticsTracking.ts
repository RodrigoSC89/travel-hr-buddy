import { useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface AnalyticsEvent {
  event_name: string;
  event_data?: Record<string, any>;
  page_url?: string;
  user_agent?: string;
}

export function useAnalyticsTracking() {
  const { toast } = useToast();

  // Track an event
  const trackEvent = useCallback(async (event: AnalyticsEvent) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("analytics_events")
        .insert([{
          user_id: user?.id,
          event_name: event.event_name,
          event_data: event.event_data,
          page_url: event.page_url || window.location.href,
          user_agent: event.user_agent || navigator.userAgent,
          session_id: sessionStorage.getItem('analytics_session_id') || generateSessionId()
        }]);

      if (error) throw error;
    } catch (error: any) {
      console.error("Error tracking event:", error);
    }
  }, []);

  // Track page view
  const trackPageView = useCallback((pageName?: string) => {
    trackEvent({
      event_name: "page_view",
      event_data: {
        page_name: pageName || document.title,
        timestamp: new Date().toISOString()
      }
    });
  }, [trackEvent]);

  // Track click event
  const trackClick = useCallback((elementName: string, metadata?: Record<string, any>) => {
    trackEvent({
      event_name: "click",
      event_data: {
        element_name: elementName,
        ...metadata
      }
    });
  }, [trackEvent]);

  // Track navigation
  const trackNavigation = useCallback((from: string, to: string) => {
    trackEvent({
      event_name: "navigation",
      event_data: {
        from_page: from,
        to_page: to,
        timestamp: new Date().toISOString()
      }
    });
  }, [trackEvent]);

  // Generate session ID
  const generateSessionId = () => {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('analytics_session_id', sessionId);
    return sessionId;
  };

  // Initialize session on mount
  useEffect(() => {
    if (!sessionStorage.getItem('analytics_session_id')) {
      generateSessionId();
    }
  }, []);

  return {
    trackEvent,
    trackPageView,
    trackClick,
    trackNavigation
  };
}
