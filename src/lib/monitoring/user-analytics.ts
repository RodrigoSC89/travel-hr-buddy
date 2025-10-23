/**
 * User Analytics - PATCH 67.5
 * Track user behavior, sessions, and feature usage
 */

import { logger } from "@/lib/logger";

export interface UserEvent {
  name: string;
  category: string;
  properties?: Record<string, any>;
  timestamp: number;
}

export interface SessionInfo {
  id: string;
  userId?: string;
  startTime: number;
  lastActivity: number;
  pageViews: number;
  events: number;
  duration: number;
}

export interface PageView {
  path: string;
  title: string;
  timestamp: number;
  duration?: number;
}

class UserAnalytics {
  private session: SessionInfo | null = null;
  private events: UserEvent[] = [];
  private pageViews: PageView[] = [];
  private currentPage: PageView | null = null;
  private maxHistorySize = 500;

  /**
   * Initialize analytics tracking
   */
  initialize(userId?: string): void {
    if (typeof window === 'undefined') return;

    // Create or restore session
    this.session = this.createSession(userId);

    // Track page visibility
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackEvent('page_hidden', 'engagement');
      } else {
        this.trackEvent('page_visible', 'engagement');
        this.updateSessionActivity();
      }
    });

    // Track page beforeunload
    window.addEventListener('beforeunload', () => {
      this.endCurrentPageView();
      this.saveSession();
    });

    // Track navigation
    this.trackPageView(window.location.pathname, document.title);

    logger.info('User analytics initialized', { sessionId: this.session.id });
  }

  /**
   * Create new session
   */
  private createSession(userId?: string): SessionInfo {
    const sessionId = this.generateSessionId();
    
    return {
      id: sessionId,
      userId,
      startTime: Date.now(),
      lastActivity: Date.now(),
      pageViews: 0,
      events: 0,
      duration: 0,
    };
  }

  /**
   * Track custom event
   */
  trackEvent(name: string, category: string, properties?: Record<string, any>): void {
    if (!this.session) return;

    const event: UserEvent = {
      name,
      category,
      properties,
      timestamp: Date.now(),
    };

    this.events.push(event);
    this.session.events++;
    this.updateSessionActivity();

    // Keep history size manageable
    if (this.events.length > this.maxHistorySize) {
      this.events.shift();
    }

    logger.debug('Event tracked', event);
  }

  /**
   * Track page view
   */
  trackPageView(path: string, title: string): void {
    if (!this.session) return;

    // End current page view
    this.endCurrentPageView();

    // Start new page view
    this.currentPage = {
      path,
      title,
      timestamp: Date.now(),
    };

    this.pageViews.push(this.currentPage);
    this.session.pageViews++;
    this.updateSessionActivity();

    logger.debug('Page view tracked', { path, title });
  }

  /**
   * End current page view and calculate duration
   */
  private endCurrentPageView(): void {
    if (this.currentPage && !this.currentPage.duration) {
      this.currentPage.duration = Date.now() - this.currentPage.timestamp;
    }
  }

  /**
   * Track feature usage
   */
  trackFeatureUsage(feature: string, action: string, metadata?: Record<string, any>): void {
    this.trackEvent(`feature_${action}`, 'feature_usage', {
      feature,
      ...metadata,
    });
  }

  /**
   * Track user interaction
   */
  trackInteraction(element: string, action: string, metadata?: Record<string, any>): void {
    this.trackEvent(`${element}_${action}`, 'interaction', metadata);
  }

  /**
   * Update session activity timestamp
   */
  private updateSessionActivity(): void {
    if (this.session) {
      this.session.lastActivity = Date.now();
      this.session.duration = this.session.lastActivity - this.session.startTime;
    }
  }

  /**
   * Get current session info
   */
  getSession(): SessionInfo | null {
    if (this.session) {
      this.updateSessionActivity();
    }
    return this.session;
  }

  /**
   * Get analytics summary
   */
  getSummary() {
    const session = this.getSession();
    
    return {
      session,
      events: {
        total: this.events.length,
        byCategory: this.groupEventsByCategory(),
        recent: this.events.slice(-20).reverse(),
      },
      pageViews: {
        total: this.pageViews.length,
        pages: this.pageViews.map(pv => ({
          path: pv.path,
          duration: pv.duration || (Date.now() - pv.timestamp),
        })),
        current: this.currentPage,
      },
      engagement: {
        sessionDuration: session?.duration || 0,
        avgPageDuration: this.calculateAvgPageDuration(),
        pagesPerSession: session?.pageViews || 0,
        eventsPerSession: session?.events || 0,
      },
    };
  }

  /**
   * Group events by category
   */
  private groupEventsByCategory(): Record<string, number> {
    return this.events.reduce((acc, event) => {
      acc[event.category] = (acc[event.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  /**
   * Calculate average page duration
   */
  private calculateAvgPageDuration(): number {
    const completedPages = this.pageViews.filter(pv => pv.duration);
    if (completedPages.length === 0) return 0;

    const totalDuration = completedPages.reduce((sum, pv) => sum + (pv.duration || 0), 0);
    return Math.round(totalDuration / completedPages.length);
  }

  /**
   * Get feature usage statistics
   */
  getFeatureUsage(): Record<string, number> {
    return this.events
      .filter(e => e.category === 'feature_usage')
      .reduce((acc, event) => {
        const feature = event.properties?.feature || 'unknown';
        acc[feature] = (acc[feature] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
  }

  /**
   * Save session to localStorage
   */
  private saveSession(): void {
    if (this.session && typeof window !== 'undefined') {
      try {
        localStorage.setItem('nautilus_session', JSON.stringify(this.session));
      } catch (error) {
        logger.warn('Failed to save session', { error: String(error) });
      }
    }
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Clear analytics data
   */
  clear(): void {
    this.events = [];
    this.pageViews = [];
    this.currentPage = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('nautilus_session');
    }
  }
}

export const userAnalytics = new UserAnalytics();
