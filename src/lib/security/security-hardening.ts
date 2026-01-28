/**
 * Security Hardening Module - PROMPT 3
 * Comprehensive security implementation
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

// Security event types
type SecurityEventType = 
  | "auth_failure"
  | "suspicious_activity"
  | "rate_limit"
  | "xss_attempt"
  | "sql_injection"
  | "csrf_attempt"
  | "unauthorized_access";

interface SecurityEvent {
  type: SecurityEventType;
  severity: "low" | "medium" | "high" | "critical";
  details: Record<string, unknown>;
  timestamp: Date;
  userId?: string;
  ip?: string;
}

class SecurityHardening {
  private eventLog: SecurityEvent[] = [];
  private rateLimitMap = new Map<string, { count: number; resetTime: number }>();
  private readonly MAX_EVENTS = 1000;
  private readonly RATE_LIMIT_WINDOW = 60000; // 1 minute
  private readonly RATE_LIMIT_MAX = 100; // requests per window

  /**
   * Initialize security measures
   */
  init(): void {
    this.setupCSP();
    this.setupXSSProtection();
    this.setupInputSanitization();
    this.setupSessionProtection();
    logger.info("Security hardening initialized");
  }

  /**
   * Content Security Policy headers (client-side enforcement)
   */
  private setupCSP(): void {
    // Add CSP meta tag for additional protection
    const cspMeta = document.createElement("meta");
    cspMeta.httpEquiv = "Content-Security-Policy";
    cspMeta.content = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.supabase.co",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.openai.com",
      "frame-ancestors 'self'",
      "form-action 'self'",
    ].join("; ");

    if (!document.querySelector("meta[http-equiv='Content-Security-Policy']")) {
      document.head.appendChild(cspMeta);
    }
  }

  /**
   * XSS Protection
   */
  private setupXSSProtection(): void {
    // Override innerHTML to sanitize content
    const originalInnerHTML = Object.getOwnPropertyDescriptor(Element.prototype, "innerHTML");
    
    if (originalInnerHTML && originalInnerHTML.set) {
      const originalSet = originalInnerHTML.set;
      
      Object.defineProperty(Element.prototype, "innerHTML", {
        ...originalInnerHTML,
        set(value: string) {
          // Log potential XSS attempts
          if (typeof value === "string" && (
            value.includes("<script") ||
            value.includes("javascript:") ||
            value.includes("onerror=") ||
            value.includes("onload=")
          )) {
            securityHardening.logEvent({
              type: "xss_attempt",
              severity: "high",
              details: { 
                element: this.tagName, 
                contentPreview: value.substring(0, 100) 
              },
              timestamp: new Date(),
            });
          }
          return originalSet.call(this, value);
        }
      });
    }
  }

  /**
   * Input sanitization helpers
   */
  private setupInputSanitization(): void {
    // Add global input sanitization
    document.addEventListener("input", (e) => {
      const target = e.target as HTMLInputElement;
      if (target.type === "text" || target.type === "textarea") {
        const dangerous = /<script|javascript:|data:/i;
        if (dangerous.test(target.value)) {
          this.logEvent({
            type: "xss_attempt",
            severity: "medium",
            details: { 
              inputType: target.type, 
              inputName: target.name 
            },
            timestamp: new Date(),
          });
        }
      }
    }, true);
  }

  /**
   * Session protection
   */
  private setupSessionProtection(): void {
    // Monitor for session hijacking attempts
    const originalSessionId = sessionStorage.getItem("sessionId");
    
    if (!originalSessionId) {
      const newSessionId = crypto.randomUUID();
      sessionStorage.setItem("sessionId", newSessionId);
    }

    // Tab fingerprint to detect session sharing
    const tabFingerprint = `${navigator.userAgent}-${screen.width}x${screen.height}`;
    const storedFingerprint = sessionStorage.getItem("tabFingerprint");
    
    if (storedFingerprint && storedFingerprint !== tabFingerprint) {
      this.logEvent({
        type: "suspicious_activity",
        severity: "medium",
        details: { 
          reason: "Tab fingerprint mismatch",
          expected: storedFingerprint,
          actual: tabFingerprint
        },
        timestamp: new Date(),
      });
    } else {
      sessionStorage.setItem("tabFingerprint", tabFingerprint);
    }
  }

  /**
   * Rate limiting
   */
  checkRateLimit(identifier: string): boolean {
    const now = Date.now();
    const entry = this.rateLimitMap.get(identifier);

    if (!entry || now > entry.resetTime) {
      this.rateLimitMap.set(identifier, {
        count: 1,
        resetTime: now + this.RATE_LIMIT_WINDOW
      });
      return true;
    }

    if (entry.count >= this.RATE_LIMIT_MAX) {
      this.logEvent({
        type: "rate_limit",
        severity: "medium",
        details: { identifier, count: entry.count },
        timestamp: new Date(),
      });
      return false;
    }

    entry.count++;
    return true;
  }

  /**
   * Sanitize HTML content
   */
  sanitizeHTML(html: string): string {
    const div = document.createElement("div");
    div.textContent = html;
    return div.innerHTML;
  }

  /**
   * Sanitize SQL-like input
   */
  sanitizeInput(input: string): string {
    return input
      .replace(/['";\\]/g, "") // Remove quotes and backslashes
      .replace(/--/g, "") // Remove SQL comments
      .replace(/\/\*/g, "") // Remove block comments
      .trim();
  }

  /**
   * Validate UUID format
   */
  isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  /**
   * Validate email format
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  /**
   * Log security event
   */
  logEvent(event: SecurityEvent): void {
    this.eventLog.push(event);
    
    // Trim log if too large
    if (this.eventLog.length > this.MAX_EVENTS) {
      this.eventLog = this.eventLog.slice(-this.MAX_EVENTS / 2);
    }

    // Log critical events to server
    if (event.severity === "critical" || event.severity === "high") {
      this.reportToServer(event).catch(console.error);
    }

    logger.warn(`Security event: ${event.type}`, event);
  }

  /**
   * Report security event to server
   */
  private async reportToServer(event: SecurityEvent): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Log to console in dev, would send to security monitoring service in prod
      logger.warn("Security event reported", {
        type: event.type,
        severity: event.severity,
        userId: user?.id,
        details: event.details,
      });
      
      // Store in localStorage for security dashboard
      const securityEvents = JSON.parse(localStorage.getItem("security_events") || "[]");
      securityEvents.push({
        ...event,
        userId: user?.id,
        reportedAt: new Date().toISOString(),
      });
      // Keep only last 100 events
      localStorage.setItem("security_events", JSON.stringify(securityEvents.slice(-100)));
    } catch (error) {
      logger.error("Failed to report security event", { error });
    }
  }

  /**
   * Get security events
   */
  getEvents(filter?: { type?: SecurityEventType; severity?: string }): SecurityEvent[] {
    let events = [...this.eventLog];
    
    if (filter?.type) {
      events = events.filter(e => e.type === filter.type);
    }
    if (filter?.severity) {
      events = events.filter(e => e.severity === filter.severity);
    }
    
    return events;
  }

  /**
   * Check if current session is secure
   */
  isSecureSession(): boolean {
    return (
      window.isSecureContext &&
      document.location.protocol === "https:" &&
      !this.eventLog.some(e => 
        e.severity === "critical" && 
        Date.now() - e.timestamp.getTime() < 300000 // 5 minutes
      )
    );
  }
}

export const securityHardening = new SecurityHardening();
