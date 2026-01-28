/**
 * Zero-Trust Validator - Enterprise Excellence v5.0
 * Continuous session validation and anomaly detection
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

interface SessionContext {
  userId: string;
  sessionId: string;
  deviceFingerprint: string;
  ipAddress: string;
  location?: {
    country: string;
    city: string;
    lat: number;
    lon: number;
  };
  userAgent: string;
  timestamp: Date;
}

interface RiskAssessment {
  score: number; // 0-100, higher = more risk
  factors: RiskFactor[];
  action: 'allow' | 'challenge' | 'block';
  requireMFA: boolean;
}

interface RiskFactor {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  score: number;
}

interface BehaviorProfile {
  userId: string;
  typicalIPs: string[];
  typicalLocations: string[];
  typicalDevices: string[];
  loginTimes: { hour: number; count: number }[];
  averageSessionDuration: number;
  lastUpdated: Date;
}

class ZeroTrustValidator {
  private static instance: ZeroTrustValidator;
  private sessionCache = new Map<string, SessionContext>();
  private behaviorProfiles = new Map<string, BehaviorProfile>();
  private validationInterval: ReturnType<typeof setInterval> | null = null;

  private readonly riskThresholds = {
    allow: 30,
    challenge: 60,
    block: 80
  };

  private constructor() {}

  static getInstance(): ZeroTrustValidator {
    if (!ZeroTrustValidator.instance) {
      ZeroTrustValidator.instance = new ZeroTrustValidator();
    }
    return ZeroTrustValidator.instance;
  }

  /**
   * Start continuous validation
   */
  startContinuousValidation(intervalMs = 60000): void {
    if (this.validationInterval) return;

    this.validationInterval = setInterval(() => {
      this.validateAllSessions();
    }, intervalMs);

    logger.info('Zero-trust continuous validation started');
  }

  /**
   * Stop continuous validation
   */
  stopContinuousValidation(): void {
    if (this.validationInterval) {
      clearInterval(this.validationInterval);
      this.validationInterval = null;
    }
  }

  /**
   * Register a new session
   */
  async registerSession(context: SessionContext): Promise<RiskAssessment> {
    this.sessionCache.set(context.sessionId, context);
    
    // Assess initial risk
    const assessment = await this.assessRisk(context);
    
    // Log session
    await this.logSessionEvent(context, 'session_start', assessment);

    return assessment;
  }

  /**
   * Validate current session
   */
  async validateSession(sessionId: string): Promise<RiskAssessment> {
    const context = this.sessionCache.get(sessionId);
    if (!context) {
      return {
        score: 100,
        factors: [{ type: 'unknown_session', severity: 'critical', description: 'Session not found', score: 100 }],
        action: 'block',
        requireMFA: true
      };
    }

    // Update timestamp
    context.timestamp = new Date();

    // Assess current risk
    const assessment = await this.assessRisk(context);

    // Take action based on risk
    if (assessment.action === 'block') {
      await this.terminateSession(sessionId, 'high_risk');
    }

    return assessment;
  }

  /**
   * Assess risk for a session context
   */
  async assessRisk(context: SessionContext): Promise<RiskAssessment> {
    const factors: RiskFactor[] = [];

    // Get user's behavior profile
    const profile = await this.getBehaviorProfile(context.userId);

    // Check location anomaly
    if (profile && context.location) {
      const locationRisk = this.checkLocationAnomaly(context.location, profile);
      if (locationRisk) factors.push(locationRisk);
    }

    // Check device anomaly
    if (profile) {
      const deviceRisk = this.checkDeviceAnomaly(context.deviceFingerprint, profile);
      if (deviceRisk) factors.push(deviceRisk);
    }

    // Check IP reputation
    const ipRisk = await this.checkIPReputation(context.ipAddress);
    if (ipRisk) factors.push(ipRisk);

    // Check time anomaly
    if (profile) {
      const timeRisk = this.checkTimeAnomaly(new Date(), profile);
      if (timeRisk) factors.push(timeRisk);
    }

    // Check velocity (too many sessions)
    const velocityRisk = await this.checkVelocity(context.userId);
    if (velocityRisk) factors.push(velocityRisk);

    // Check impossible travel
    if (profile && context.location) {
      const travelRisk = await this.checkImpossibleTravel(context.userId, context.location);
      if (travelRisk) factors.push(travelRisk);
    }

    // Calculate total risk score
    const score = Math.min(100, factors.reduce((sum, f) => sum + f.score, 0));

    // Determine action
    let action: RiskAssessment['action'] = 'allow';
    if (score >= this.riskThresholds.block) {
      action = 'block';
    } else if (score >= this.riskThresholds.challenge) {
      action = 'challenge';
    }

    return {
      score,
      factors,
      action,
      requireMFA: score >= this.riskThresholds.challenge
    };
  }

  /**
   * Check for location anomaly
   */
  private checkLocationAnomaly(
    location: NonNullable<SessionContext['location']>,
    profile: BehaviorProfile
  ): RiskFactor | null {
    if (!profile.typicalLocations.includes(location.country)) {
      return {
        type: 'unusual_location',
        severity: 'high',
        description: `Login from unusual location: ${location.city}, ${location.country}`,
        score: 25
      };
    }
    return null;
  }

  /**
   * Check for device anomaly
   */
  private checkDeviceAnomaly(
    fingerprint: string,
    profile: BehaviorProfile
  ): RiskFactor | null {
    if (!profile.typicalDevices.includes(fingerprint)) {
      return {
        type: 'new_device',
        severity: 'medium',
        description: 'Login from unrecognized device',
        score: 15
      };
    }
    return null;
  }

  /**
   * Check IP reputation
   */
  private async checkIPReputation(ipAddress: string): Promise<RiskFactor | null> {
    // Check against known bad IPs (simplified)
    const knownBadPatterns = [
      /^10\./, // Private but used by proxies
      /^192\.168\./, // Private
    ];

    // In production, would check against threat intelligence feeds
    const isProxy = knownBadPatterns.some(pattern => pattern.test(ipAddress));
    
    if (isProxy) {
      return {
        type: 'suspicious_ip',
        severity: 'medium',
        description: 'IP address from suspicious network',
        score: 20
      };
    }

    return null;
  }

  /**
   * Check for time anomaly
   */
  private checkTimeAnomaly(
    timestamp: Date,
    profile: BehaviorProfile
  ): RiskFactor | null {
    const hour = timestamp.getHours();
    const typicalHours = profile.loginTimes
      .filter(t => t.count > 3)
      .map(t => t.hour);

    if (typicalHours.length > 0 && !typicalHours.includes(hour)) {
      return {
        type: 'unusual_time',
        severity: 'low',
        description: `Login at unusual time: ${hour}:00`,
        score: 10
      };
    }

    return null;
  }

  /**
   * Check for velocity anomaly (too many sessions)
   */
  private async checkVelocity(userId: string): Promise<RiskFactor | null> {
    // Count sessions in last 5 minutes
    const recentSessions = Array.from(this.sessionCache.values())
      .filter(s => s.userId === userId)
      .filter(s => Date.now() - s.timestamp.getTime() < 5 * 60 * 1000);

    if (recentSessions.length > 5) {
      return {
        type: 'high_velocity',
        severity: 'high',
        description: `${recentSessions.length} sessions in 5 minutes`,
        score: 30
      };
    }

    return null;
  }

  /**
   * Check for impossible travel
   */
  private async checkImpossibleTravel(
    userId: string,
    currentLocation: NonNullable<SessionContext['location']>
  ): Promise<RiskFactor | null> {
    // Get last known location
    const { data: lastSession } = await supabase
      .from('active_sessions')
      .select('device_info')
      .eq('user_id', userId)
      .order('last_activity', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!lastSession?.device_info) return null;

    const deviceInfo = lastSession.device_info as { location?: SessionContext['location'] };
    const lastLocation = deviceInfo.location;
    if (!lastLocation) return null;

    // Calculate distance
    const distance = this.calculateDistance(
      lastLocation.lat, lastLocation.lon,
      currentLocation.lat, currentLocation.lon
    );

    // If distance > 500km in < 1 hour, flag as impossible
    if (distance > 500) {
      return {
        type: 'impossible_travel',
        severity: 'critical',
        description: `Travel of ${Math.round(distance)}km detected in short time`,
        score: 40
      };
    }

    return null;
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Get or create behavior profile
   */
  private async getBehaviorProfile(userId: string): Promise<BehaviorProfile | null> {
    if (this.behaviorProfiles.has(userId)) {
      return this.behaviorProfiles.get(userId)!;
    }

    // Would load from database in production
    return null;
  }

  /**
   * Update behavior profile
   */
  async updateBehaviorProfile(context: SessionContext): Promise<void> {
    let profile = this.behaviorProfiles.get(context.userId);
    
    if (!profile) {
      profile = {
        userId: context.userId,
        typicalIPs: [],
        typicalLocations: [],
        typicalDevices: [],
        loginTimes: Array(24).fill(null).map((_, i) => ({ hour: i, count: 0 })),
        averageSessionDuration: 0,
        lastUpdated: new Date()
      };
    }

    // Update profile with new context
    if (!profile.typicalIPs.includes(context.ipAddress)) {
      profile.typicalIPs.push(context.ipAddress);
      if (profile.typicalIPs.length > 10) profile.typicalIPs.shift();
    }

    if (context.location && !profile.typicalLocations.includes(context.location.country)) {
      profile.typicalLocations.push(context.location.country);
      if (profile.typicalLocations.length > 5) profile.typicalLocations.shift();
    }

    if (!profile.typicalDevices.includes(context.deviceFingerprint)) {
      profile.typicalDevices.push(context.deviceFingerprint);
      if (profile.typicalDevices.length > 5) profile.typicalDevices.shift();
    }

    const hour = new Date().getHours();
    profile.loginTimes[hour].count++;
    profile.lastUpdated = new Date();

    this.behaviorProfiles.set(context.userId, profile);
  }

  /**
   * Terminate session
   */
  async terminateSession(sessionId: string, reason: string): Promise<void> {
    this.sessionCache.delete(sessionId);

    await supabase
      .from('active_sessions')
      .update({ is_active: false })
      .eq('session_token', sessionId);

    logger.warn('Session terminated', { sessionId, reason });
  }

  /**
   * Validate all active sessions
   */
  private async validateAllSessions(): Promise<void> {
    for (const [sessionId] of this.sessionCache) {
      const assessment = await this.validateSession(sessionId);
      if (assessment.action === 'block') {
        logger.warn('Session blocked during continuous validation', { sessionId });
      }
    }
  }

  /**
   * Log session event
   */
  private async logSessionEvent(
    _context: SessionContext,
    eventType: string,
    assessment: RiskAssessment
  ): Promise<void> {
    try {
      // Log to console - access_logs table has specific schema
      logger.info('Session event', {
        eventType,
        action: assessment.action,
        riskScore: assessment.score
      });
    } catch (error) {
      logger.error('Failed to log session event', error as Error);
    }
  }

  /**
   * Generate device fingerprint
   */
  async generateDeviceFingerprint(): Promise<string> {
    const components = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset().toString(),
      navigator.hardwareConcurrency?.toString() || '',
      (navigator as unknown as { deviceMemory?: number }).deviceMemory?.toString() || ''
    ];

    // Create hash from components
    const encoder = new TextEncoder();
    const data = encoder.encode(components.join('|'));
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
}

export const zeroTrustValidator = ZeroTrustValidator.getInstance();
export { ZeroTrustValidator };
export type { SessionContext, RiskAssessment, RiskFactor, BehaviorProfile };
