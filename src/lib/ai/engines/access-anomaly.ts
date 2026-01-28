/**
 * Access Anomaly Detection Engine
 * Bloqueia automaticamente acessos suspeitos e notifica segurança
 * Nível: Autônomo
 */

export interface AccessEvent {
  eventId: string;
  userId: string;
  userName: string;
  userRole: string;
  department: string;
  timestamp: Date;
  eventType: AccessEventType;
  resource: string;
  resourceType: ResourceType;
  action: AccessAction;
  ipAddress: string;
  userAgent: string;
  geoLocation: GeoLocation | null;
  deviceFingerprint: string;
  sessionId: string;
  success: boolean;
  failureReason?: string;
}

export type AccessEventType = 
  | 'login'
  | 'logout'
  | 'resource_access'
  | 'permission_change'
  | 'data_export'
  | 'bulk_operation'
  | 'api_call'
  | 'admin_action';

export type ResourceType = 
  | 'document'
  | 'crew_data'
  | 'financial'
  | 'vessel'
  | 'compliance'
  | 'system_config'
  | 'user_management'
  | 'audit_log';

export type AccessAction = 
  | 'view'
  | 'create'
  | 'update'
  | 'delete'
  | 'export'
  | 'share'
  | 'approve'
  | 'execute';

export interface GeoLocation {
  country: string;
  city: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface UserBehaviorProfile {
  userId: string;
  typicalLoginTimes: TimePattern[];
  typicalLocations: string[];
  typicalDevices: string[];
  accessPatterns: AccessPattern[];
  sensitiveResourceAccess: ResourceAccessPattern[];
  riskScore: number;
  lastProfileUpdate: Date;
}

export interface TimePattern {
  dayOfWeek: number; // 0-6
  hourStart: number; // 0-23
  hourEnd: number;
  frequency: number; // percentage of logins
}

export interface AccessPattern {
  resourceType: ResourceType;
  typicalActions: AccessAction[];
  averageAccessPerDay: number;
  peakHours: number[];
}

export interface ResourceAccessPattern {
  resourceType: ResourceType;
  normalAccessRate: number; // per day
  alertThreshold: number;
  bulkThreshold: number;
}

export interface AnomalyDetectionResult {
  eventId: string;
  timestamp: Date;
  userId: string;
  userName: string;
  anomalyType: AnomalyType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  description: string;
  indicators: AnomalyIndicator[];
  riskScore: number;
  recommendedAction: RecommendedAction;
  autoActionTaken: AutoAction | null;
  requiresReview: boolean;
  relatedEvents: string[];
}

export type AnomalyType = 
  | 'unusual_time'
  | 'unusual_location'
  | 'unusual_device'
  | 'excessive_access'
  | 'bulk_data_access'
  | 'privilege_escalation'
  | 'impossible_travel'
  | 'brute_force'
  | 'session_anomaly'
  | 'data_exfiltration'
  | 'unauthorized_admin';

export interface AnomalyIndicator {
  indicator: string;
  observed: string;
  expected: string;
  deviation: number; // percentage from normal
}

export interface RecommendedAction {
  action: string;
  priority: 'immediate' | 'urgent' | 'normal';
  automatable: boolean;
  requiresApproval: boolean;
}

export interface AutoAction {
  actionType: 'block_session' | 'require_mfa' | 'notify_user' | 'notify_admin' | 'log_enhanced';
  executedAt: Date;
  success: boolean;
  details: string;
}

export interface SecurityAlert {
  alertId: string;
  anomaly: AnomalyDetectionResult;
  status: 'open' | 'investigating' | 'resolved' | 'false_positive';
  assignedTo: string | null;
  createdAt: Date;
  updatedAt: Date;
  resolution: string | null;
  escalated: boolean;
}

export interface AccessAnalytics {
  period: { start: Date; end: Date };
  totalEvents: number;
  anomaliesDetected: number;
  blockedSessions: number;
  topAnomalyTypes: Array<{ type: AnomalyType; count: number }>;
  highRiskUsers: Array<{ userId: string; userName: string; riskScore: number }>;
  geographicAnomalies: number;
  afterHoursAccess: number;
  failedLoginAttempts: number;
  bulkDataOperations: number;
}

class AccessAnomalyEngine {
  private userProfiles: Map<string, UserBehaviorProfile> = new Map();
  private recentEvents: Map<string, AccessEvent[]> = new Map();
  
  private readonly ANOMALY_THRESHOLDS = {
    unusualTimeDeviation: 3, // hours outside normal pattern
    locationChangeKm: 500, // km/h impossible travel threshold
    excessiveAccessMultiplier: 5, // times normal rate
    bulkOperationThreshold: 50, // items in short period
    failedLoginThreshold: 5, // attempts in 15 minutes
    sessionDurationMax: 24, // hours
  };

  analyzeAccess(event: AccessEvent): AnomalyDetectionResult | null {
    const profile = this.getUserProfile(event.userId);
    const recentUserEvents = this.getRecentEvents(event.userId);
    
    const anomalies: AnomalyIndicator[] = [];
    let maxSeverity: AnomalyDetectionResult['severity'] = 'low';
    let anomalyType: AnomalyType | null = null;

    // Check for unusual login time
    const timeAnomaly = this.checkTimeAnomaly(event, profile);
    if (timeAnomaly) {
      anomalies.push(timeAnomaly);
      if (!anomalyType) anomalyType = 'unusual_time';
    }

    // Check for unusual location
    const locationAnomaly = this.checkLocationAnomaly(event, profile);
    if (locationAnomaly) {
      anomalies.push(locationAnomaly);
      anomalyType = 'unusual_location';
      maxSeverity = this.escalateSeverity(maxSeverity, 'medium');
    }

    // Check for impossible travel
    const travelAnomaly = this.checkImpossibleTravel(event, recentUserEvents);
    if (travelAnomaly) {
      anomalies.push(travelAnomaly);
      anomalyType = 'impossible_travel';
      maxSeverity = 'critical';
    }

    // Check for unusual device
    const deviceAnomaly = this.checkDeviceAnomaly(event, profile);
    if (deviceAnomaly) {
      anomalies.push(deviceAnomaly);
      if (!anomalyType) anomalyType = 'unusual_device';
      maxSeverity = this.escalateSeverity(maxSeverity, 'medium');
    }

    // Check for brute force
    const bruteForce = this.checkBruteForce(event, recentUserEvents);
    if (bruteForce) {
      anomalies.push(bruteForce);
      anomalyType = 'brute_force';
      maxSeverity = 'critical';
    }

    // Check for excessive access
    const excessiveAccess = this.checkExcessiveAccess(event, recentUserEvents, profile);
    if (excessiveAccess) {
      anomalies.push(excessiveAccess);
      anomalyType = 'excessive_access';
      maxSeverity = this.escalateSeverity(maxSeverity, 'high');
    }

    // Check for bulk data access
    const bulkAccess = this.checkBulkDataAccess(event, recentUserEvents);
    if (bulkAccess) {
      anomalies.push(bulkAccess);
      anomalyType = 'bulk_data_access';
      maxSeverity = 'high';
    }

    // Check for privilege escalation attempts
    const privEscalation = this.checkPrivilegeEscalation(event);
    if (privEscalation) {
      anomalies.push(privEscalation);
      anomalyType = 'privilege_escalation';
      maxSeverity = 'critical';
    }

    // Store event for future analysis
    this.storeEvent(event);

    if (anomalies.length === 0) return null;

    const riskScore = this.calculateRiskScore(anomalies, maxSeverity);
    const autoAction = this.determineAutoAction(anomalyType!, maxSeverity, riskScore);

    return {
      eventId: event.eventId,
      timestamp: new Date(),
      userId: event.userId,
      userName: event.userName,
      anomalyType: anomalyType!,
      severity: maxSeverity,
      confidence: this.calculateConfidence(anomalies),
      description: this.generateDescription(anomalyType!, anomalies),
      indicators: anomalies,
      riskScore,
      recommendedAction: this.generateRecommendation(anomalyType!, maxSeverity),
      autoActionTaken: autoAction,
      requiresReview: maxSeverity === 'high' || maxSeverity === 'critical',
      relatedEvents: recentUserEvents.slice(-5).map(e => e.eventId)
    };
  }

  private getUserProfile(userId: string): UserBehaviorProfile {
    if (!this.userProfiles.has(userId)) {
      // Create default profile for new user
      this.userProfiles.set(userId, this.createDefaultProfile(userId));
    }
    return this.userProfiles.get(userId)!;
  }

  private createDefaultProfile(userId: string): UserBehaviorProfile {
    return {
      userId,
      typicalLoginTimes: [
        { dayOfWeek: 1, hourStart: 8, hourEnd: 18, frequency: 80 },
        { dayOfWeek: 2, hourStart: 8, hourEnd: 18, frequency: 80 },
        { dayOfWeek: 3, hourStart: 8, hourEnd: 18, frequency: 80 },
        { dayOfWeek: 4, hourStart: 8, hourEnd: 18, frequency: 80 },
        { dayOfWeek: 5, hourStart: 8, hourEnd: 18, frequency: 80 }
      ],
      typicalLocations: [],
      typicalDevices: [],
      accessPatterns: [],
      sensitiveResourceAccess: [
        { resourceType: 'financial', normalAccessRate: 10, alertThreshold: 50, bulkThreshold: 100 },
        { resourceType: 'crew_data', normalAccessRate: 20, alertThreshold: 100, bulkThreshold: 200 },
        { resourceType: 'system_config', normalAccessRate: 2, alertThreshold: 10, bulkThreshold: 20 }
      ],
      riskScore: 50,
      lastProfileUpdate: new Date()
    };
  }

  private getRecentEvents(userId: string): AccessEvent[] {
    return this.recentEvents.get(userId) || [];
  }

  private storeEvent(event: AccessEvent): void {
    const events = this.recentEvents.get(event.userId) || [];
    events.push(event);
    
    // Keep only last 24 hours of events
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const filtered = events.filter(e => new Date(e.timestamp) > cutoff);
    
    this.recentEvents.set(event.userId, filtered.slice(-1000));
  }

  private checkTimeAnomaly(event: AccessEvent, profile: UserBehaviorProfile): AnomalyIndicator | null {
    const eventHour = new Date(event.timestamp).getHours();
    const eventDay = new Date(event.timestamp).getDay();

    const matchingPattern = profile.typicalLoginTimes.find(
      p => p.dayOfWeek === eventDay && eventHour >= p.hourStart && eventHour <= p.hourEnd
    );

    if (!matchingPattern && event.eventType === 'login') {
      return {
        indicator: 'Horário de acesso incomum',
        observed: `${eventHour}:00 (${this.getDayName(eventDay)})`,
        expected: profile.typicalLoginTimes.map(p => 
          `${p.hourStart}:00-${p.hourEnd}:00 (${this.getDayName(p.dayOfWeek)})`
        ).join(', ') || 'Horário comercial',
        deviation: 100
      };
    }

    return null;
  }

  private getDayName(day: number): string {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return days[day];
  }

  private checkLocationAnomaly(event: AccessEvent, profile: UserBehaviorProfile): AnomalyIndicator | null {
    if (!event.geoLocation) return null;

    const location = `${event.geoLocation.city}, ${event.geoLocation.country}`;
    
    if (profile.typicalLocations.length > 0 && !profile.typicalLocations.includes(location)) {
      return {
        indicator: 'Localização de acesso incomum',
        observed: location,
        expected: profile.typicalLocations.join(' ou '),
        deviation: 100
      };
    }

    return null;
  }

  private checkImpossibleTravel(event: AccessEvent, recentEvents: AccessEvent[]): AnomalyIndicator | null {
    if (!event.geoLocation) return null;

    const lastEventWithLocation = [...recentEvents]
      .reverse()
      .find(e => e.geoLocation && e.eventId !== event.eventId);

    if (!lastEventWithLocation?.geoLocation) return null;

    const distance = this.calculateDistance(
      event.geoLocation.latitude,
      event.geoLocation.longitude,
      lastEventWithLocation.geoLocation.latitude,
      lastEventWithLocation.geoLocation.longitude
    );

    const timeDiff = (new Date(event.timestamp).getTime() - 
                     new Date(lastEventWithLocation.timestamp).getTime()) / (1000 * 60 * 60);

    if (timeDiff > 0) {
      const speedKmh = distance / timeDiff;
      
      if (speedKmh > this.ANOMALY_THRESHOLDS.locationChangeKm) {
        return {
          indicator: 'Viagem impossível detectada',
          observed: `${Math.round(distance)}km em ${timeDiff.toFixed(1)}h (${Math.round(speedKmh)} km/h)`,
          expected: `Máximo ${this.ANOMALY_THRESHOLDS.locationChangeKm} km/h`,
          deviation: (speedKmh / this.ANOMALY_THRESHOLDS.locationChangeKm) * 100
        };
      }
    }

    return null;
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  private checkDeviceAnomaly(event: AccessEvent, profile: UserBehaviorProfile): AnomalyIndicator | null {
    if (profile.typicalDevices.length > 0 && 
        !profile.typicalDevices.includes(event.deviceFingerprint)) {
      return {
        indicator: 'Dispositivo não reconhecido',
        observed: event.userAgent.substring(0, 50),
        expected: 'Dispositivo cadastrado',
        deviation: 100
      };
    }
    return null;
  }

  private checkBruteForce(event: AccessEvent, recentEvents: AccessEvent[]): AnomalyIndicator | null {
    if (event.eventType !== 'login' || event.success) return null;

    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const recentFailures = recentEvents.filter(
      e => e.eventType === 'login' && 
           !e.success && 
           new Date(e.timestamp) > fifteenMinutesAgo
    );

    if (recentFailures.length >= this.ANOMALY_THRESHOLDS.failedLoginThreshold) {
      return {
        indicator: 'Tentativas de login falhas excessivas',
        observed: `${recentFailures.length + 1} tentativas em 15 minutos`,
        expected: `Máximo ${this.ANOMALY_THRESHOLDS.failedLoginThreshold}`,
        deviation: ((recentFailures.length + 1) / this.ANOMALY_THRESHOLDS.failedLoginThreshold) * 100
      };
    }

    return null;
  }

  private checkExcessiveAccess(
    event: AccessEvent, 
    recentEvents: AccessEvent[],
    profile: UserBehaviorProfile
  ): AnomalyIndicator | null {
    const pattern = profile.sensitiveResourceAccess.find(p => p.resourceType === event.resourceType);
    if (!pattern) return null;

    const lastHour = new Date(Date.now() - 60 * 60 * 1000);
    const recentSameResource = recentEvents.filter(
      e => e.resourceType === event.resourceType && new Date(e.timestamp) > lastHour
    );

    const hourlyRate = recentSameResource.length + 1;
    const normalHourlyRate = pattern.normalAccessRate / 24;

    if (hourlyRate > normalHourlyRate * this.ANOMALY_THRESHOLDS.excessiveAccessMultiplier) {
      return {
        indicator: `Acesso excessivo a ${event.resourceType}`,
        observed: `${hourlyRate} acessos/hora`,
        expected: `~${Math.round(normalHourlyRate)} acessos/hora`,
        deviation: (hourlyRate / normalHourlyRate) * 100
      };
    }

    return null;
  }

  private checkBulkDataAccess(event: AccessEvent, recentEvents: AccessEvent[]): AnomalyIndicator | null {
    if (event.action !== 'export' && event.eventType !== 'data_export') return null;

    const lastHour = new Date(Date.now() - 60 * 60 * 1000);
    const recentExports = recentEvents.filter(
      e => (e.action === 'export' || e.eventType === 'data_export') && 
           new Date(e.timestamp) > lastHour
    );

    if (recentExports.length >= 3) {
      return {
        indicator: 'Múltiplas exportações de dados',
        observed: `${recentExports.length + 1} exportações em 1 hora`,
        expected: 'Exportações ocasionais',
        deviation: (recentExports.length / 3) * 100
      };
    }

    return null;
  }

  private checkPrivilegeEscalation(event: AccessEvent): AnomalyIndicator | null {
    if (event.eventType === 'admin_action' && event.userRole !== 'admin') {
      return {
        indicator: 'Tentativa de ação administrativa',
        observed: `Usuário ${event.userRole} tentando ${event.action}`,
        expected: 'Apenas administradores',
        deviation: 100
      };
    }

    if (event.eventType === 'permission_change' && event.userRole !== 'admin') {
      return {
        indicator: 'Tentativa de alteração de permissões',
        observed: `Usuário ${event.userRole} modificando permissões`,
        expected: 'Apenas administradores',
        deviation: 100
      };
    }

    return null;
  }

  private escalateSeverity(
    current: AnomalyDetectionResult['severity'],
    proposed: AnomalyDetectionResult['severity']
  ): AnomalyDetectionResult['severity'] {
    const order = ['low', 'medium', 'high', 'critical'];
    return order.indexOf(proposed) > order.indexOf(current) ? proposed : current;
  }

  private calculateRiskScore(
    anomalies: AnomalyIndicator[],
    severity: AnomalyDetectionResult['severity']
  ): number {
    const severityMultiplier = {
      low: 1,
      medium: 2,
      high: 3,
      critical: 4
    };

    const baseScore = anomalies.reduce((sum, a) => sum + Math.min(a.deviation, 100), 0) / anomalies.length;
    return Math.min(100, Math.round(baseScore * severityMultiplier[severity] / 2));
  }

  private calculateConfidence(anomalies: AnomalyIndicator[]): number {
    // More indicators = higher confidence
    const baseConfidence = 0.6;
    const indicatorBonus = Math.min(0.35, anomalies.length * 0.1);
    const avgDeviation = anomalies.reduce((sum, a) => sum + a.deviation, 0) / anomalies.length;
    const deviationBonus = Math.min(0.05, avgDeviation / 2000);
    
    return Math.min(0.99, baseConfidence + indicatorBonus + deviationBonus);
  }

  private generateDescription(anomalyType: AnomalyType, anomalies: AnomalyIndicator[]): string {
    const descriptions: Record<AnomalyType, string> = {
      unusual_time: 'Acesso em horário fora do padrão normal do usuário',
      unusual_location: 'Acesso de localização geográfica não habitual',
      unusual_device: 'Acesso de dispositivo não reconhecido',
      excessive_access: 'Volume de acessos muito acima do padrão',
      bulk_data_access: 'Possível exfiltração de dados detectada',
      privilege_escalation: 'Tentativa de acesso a recursos além das permissões',
      impossible_travel: 'Acessos de locais impossíveis no intervalo de tempo',
      brute_force: 'Múltiplas tentativas de login falhas detectadas',
      session_anomaly: 'Comportamento de sessão anormal',
      data_exfiltration: 'Padrão de extração de dados suspeito',
      unauthorized_admin: 'Tentativa de ação administrativa não autorizada'
    };

    return `${descriptions[anomalyType]}. ${anomalies.length} indicador(es) de anomalia identificado(s).`;
  }

  private generateRecommendation(
    anomalyType: AnomalyType,
    severity: AnomalyDetectionResult['severity']
  ): RecommendedAction {
    if (severity === 'critical') {
      return {
        action: 'Bloquear sessão e investigar imediatamente',
        priority: 'immediate',
        automatable: true,
        requiresApproval: false
      };
    }

    if (severity === 'high') {
      return {
        action: 'Solicitar reautenticação e notificar segurança',
        priority: 'urgent',
        automatable: true,
        requiresApproval: true
      };
    }

    return {
      action: 'Registrar para análise posterior',
      priority: 'normal',
      automatable: true,
      requiresApproval: false
    };
  }

  private determineAutoAction(
    anomalyType: AnomalyType,
    severity: AnomalyDetectionResult['severity'],
    riskScore: number
  ): AutoAction | null {
    if (severity === 'critical' || riskScore >= 80) {
      return {
        actionType: 'block_session',
        executedAt: new Date(),
        success: true,
        details: `Sessão bloqueada automaticamente devido a ${anomalyType}`
      };
    }

    if (severity === 'high' || riskScore >= 60) {
      return {
        actionType: 'require_mfa',
        executedAt: new Date(),
        success: true,
        details: 'MFA adicional solicitado'
      };
    }

    if (riskScore >= 40) {
      return {
        actionType: 'notify_admin',
        executedAt: new Date(),
        success: true,
        details: 'Equipe de segurança notificada'
      };
    }

    return {
      actionType: 'log_enhanced',
      executedAt: new Date(),
      success: true,
      details: 'Logging aprimorado ativado para o usuário'
    };
  }

  updateUserProfile(userId: string, events: AccessEvent[]): void {
    const profile = this.getUserProfile(userId);
    
    // Update typical locations
    const locations = events
      .filter(e => e.geoLocation)
      .map(e => `${e.geoLocation!.city}, ${e.geoLocation!.country}`);
    const uniqueLocations = [...new Set(locations)];
    profile.typicalLocations = uniqueLocations.slice(0, 5);

    // Update typical devices
    const devices = [...new Set(events.map(e => e.deviceFingerprint))];
    profile.typicalDevices = devices.slice(0, 10);

    // Update login times
    const loginEvents = events.filter(e => e.eventType === 'login' && e.success);
    profile.typicalLoginTimes = this.analyzeLoginTimes(loginEvents);

    profile.lastProfileUpdate = new Date();
    this.userProfiles.set(userId, profile);
  }

  private analyzeLoginTimes(logins: AccessEvent[]): TimePattern[] {
    const patterns: Map<string, number> = new Map();

    for (const login of logins) {
      const date = new Date(login.timestamp);
      const key = `${date.getDay()}-${date.getHours()}`;
      patterns.set(key, (patterns.get(key) || 0) + 1);
    }

    const total = logins.length || 1;
    const result: TimePattern[] = [];

    // Group consecutive hours
    for (let day = 0; day < 7; day++) {
      let startHour = -1;
      let endHour = -1;
      let freq = 0;

      for (let hour = 0; hour < 24; hour++) {
        const count = patterns.get(`${day}-${hour}`) || 0;
        const frequency = (count / total) * 100;

        if (frequency >= 5) {
          if (startHour === -1) startHour = hour;
          endHour = hour;
          freq += frequency;
        } else if (startHour !== -1) {
          result.push({ dayOfWeek: day, hourStart: startHour, hourEnd: endHour, frequency: freq });
          startHour = -1;
          freq = 0;
        }
      }

      if (startHour !== -1) {
        result.push({ dayOfWeek: day, hourStart: startHour, hourEnd: endHour, frequency: freq });
      }
    }

    return result;
  }

  getAnalytics(startDate: Date, endDate: Date): AccessAnalytics {
    const allEvents: AccessEvent[] = [];
    for (const events of this.recentEvents.values()) {
      allEvents.push(...events.filter(e => 
        new Date(e.timestamp) >= startDate && new Date(e.timestamp) <= endDate
      ));
    }

    const anomalies = allEvents.map(e => this.analyzeAccess(e)).filter(Boolean);
    
    return {
      period: { start: startDate, end: endDate },
      totalEvents: allEvents.length,
      anomaliesDetected: anomalies.length,
      blockedSessions: anomalies.filter(a => a?.autoActionTaken?.actionType === 'block_session').length,
      topAnomalyTypes: this.countAnomalyTypes(anomalies as AnomalyDetectionResult[]),
      highRiskUsers: this.identifyHighRiskUsers(anomalies as AnomalyDetectionResult[]),
      geographicAnomalies: anomalies.filter(a => a?.anomalyType === 'unusual_location').length,
      afterHoursAccess: anomalies.filter(a => a?.anomalyType === 'unusual_time').length,
      failedLoginAttempts: allEvents.filter(e => e.eventType === 'login' && !e.success).length,
      bulkDataOperations: anomalies.filter(a => a?.anomalyType === 'bulk_data_access').length
    };
  }

  private countAnomalyTypes(anomalies: AnomalyDetectionResult[]): Array<{ type: AnomalyType; count: number }> {
    const counts = new Map<AnomalyType, number>();
    for (const a of anomalies) {
      counts.set(a.anomalyType, (counts.get(a.anomalyType) || 0) + 1);
    }
    return [...counts.entries()]
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);
  }

  private identifyHighRiskUsers(anomalies: AnomalyDetectionResult[]): Array<{ userId: string; userName: string; riskScore: number }> {
    const userRisks = new Map<string, { name: string; totalRisk: number; count: number }>();
    
    for (const a of anomalies) {
      const existing = userRisks.get(a.userId) || { name: a.userName, totalRisk: 0, count: 0 };
      existing.totalRisk += a.riskScore;
      existing.count += 1;
      userRisks.set(a.userId, existing);
    }

    return [...userRisks.entries()]
      .map(([userId, data]) => ({
        userId,
        userName: data.name,
        riskScore: Math.round(data.totalRisk / data.count)
      }))
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 10);
  }
}

export const accessAnomalyEngine = new AccessAnomalyEngine();
