/**
 * Drift Alert AI Engine
 * Detecção autônoma de desvio de rota com alertas
 */

export interface PlannedRoute {
  voyage_id: string;
  vessel_id: string;
  waypoints: RouteWaypoint[];
  total_distance_nm: number;
  max_deviation_nm: number;
  speed_tolerance_percentage: number;
}

export interface RouteWaypoint {
  waypoint_id: string;
  name: string;
  position: { lat: number; lng: number };
  planned_eta: string;
  required_speed_knots: number;
  navigation_notes?: string;
}

export interface VesselTrackingData {
  vessel_id: string;
  vessel_name: string;
  timestamp: string;
  position: { lat: number; lng: number };
  speed_knots: number;
  heading: number;
  course_over_ground: number;
}

export interface DriftAnalysis {
  vessel_id: string;
  vessel_name: string;
  analysis_timestamp: string;
  current_position: { lat: number; lng: number };
  closest_waypoint: RouteWaypoint;
  next_waypoint: RouteWaypoint;
  deviation_nm: number;
  deviation_status: 'on_track' | 'minor_deviation' | 'significant_deviation' | 'critical_deviation';
  speed_variance_percentage: number;
  heading_variance_degrees: number;
  eta_variance_hours: number;
  trend: DriftTrend;
  alerts: DriftAlert[];
  autonomous_actions: AutonomousAction[];
  recommendations: DriftRecommendation[];
}

export interface DriftTrend {
  direction: 'improving' | 'stable' | 'worsening';
  rate_nm_per_hour: number;
  predicted_max_deviation_nm: number;
  time_to_correction_hours: number | null;
}

export interface DriftAlert {
  alert_id: string;
  alert_type: 'position_deviation' | 'speed_deviation' | 'heading_deviation' | 'eta_deviation' | 'danger_zone';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  detected_at: string;
  value: number;
  threshold: number;
  acknowledged: boolean;
}

export interface AutonomousAction {
  action_type: 'notify_bridge' | 'notify_vts' | 'log_event' | 'trigger_alarm';
  executed: boolean;
  execution_time: string;
  result: string;
}

export interface DriftRecommendation {
  priority: 'low' | 'medium' | 'high' | 'immediate';
  type: 'course_correction' | 'speed_adjustment' | 'waypoint_update' | 'communication';
  action: string;
  expected_correction_time_hours: number;
  new_values?: { heading?: number; speed?: number };
}

export interface FleetDriftReport {
  report_timestamp: string;
  vessels_monitored: number;
  vessels_on_track: number;
  vessels_with_deviation: DriftAnalysis[];
  critical_alerts: DriftAlert[];
  autonomous_actions_taken: number;
  system_health: 'healthy' | 'degraded' | 'critical';
}

// Danger zones and restricted areas (simplified example)
const DANGER_ZONES = [
  { name: 'Traffic Separation Scheme', center: { lat: 51.0, lng: 1.5 }, radius_nm: 5 },
  { name: 'Shallow Water Area', center: { lat: 50.5, lng: 0.5 }, radius_nm: 3 },
  { name: 'Military Exercise Area', center: { lat: 52.0, lng: 2.0 }, radius_nm: 10 }
];

class DriftAlertEngine {
  private readonly DEVIATION_THRESHOLDS = {
    minor: 0.5, // nm
    significant: 2.0,
    critical: 5.0
  };

  private readonly SPEED_TOLERANCE = 0.15; // 15%
  private readonly HEADING_TOLERANCE = 15; // degrees
  private readonly ETA_TOLERANCE_HOURS = 2;

  private trackingHistory: Map<string, VesselTrackingData[]> = new Map();

  /**
   * Analyze vessel drift from planned route
   */
  analyzeDrift(
    route: PlannedRoute,
    currentTracking: VesselTrackingData
  ): DriftAnalysis {
    // Store tracking data for trend analysis
    this.updateTrackingHistory(currentTracking);

    // Find closest and next waypoints
    const { closest, next } = this.findRelevantWaypoints(route, currentTracking.position);
    
    // Calculate deviations
    const deviation = this.calculateDeviation(currentTracking.position, closest, next);
    const deviationStatus = this.classifyDeviation(deviation, route.max_deviation_nm);
    
    // Calculate variances
    const speedVariance = this.calculateSpeedVariance(currentTracking.speed_knots, next?.required_speed_knots || 12);
    const headingVariance = this.calculateHeadingVariance(currentTracking, next);
    const etaVariance = this.calculateETAVariance(currentTracking, next, route);
    
    // Analyze trend
    const trend = this.analyzeTrend(currentTracking.vessel_id, route);
    
    // Generate alerts
    const alerts = this.generateAlerts(
      currentTracking,
      deviation,
      deviationStatus,
      speedVariance,
      headingVariance,
      etaVariance,
      route
    );
    
    // Execute autonomous actions
    const autonomousActions = this.executeAutonomousActions(alerts, currentTracking);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(
      currentTracking,
      deviation,
      trend,
      next
    );

    return {
      vessel_id: currentTracking.vessel_id,
      vessel_name: currentTracking.vessel_name,
      analysis_timestamp: new Date().toISOString(),
      current_position: currentTracking.position,
      closest_waypoint: closest,
      next_waypoint: next,
      deviation_nm: Math.round(deviation * 100) / 100,
      deviation_status: deviationStatus,
      speed_variance_percentage: Math.round(speedVariance * 100),
      heading_variance_degrees: Math.round(headingVariance),
      eta_variance_hours: Math.round(etaVariance * 10) / 10,
      trend,
      alerts,
      autonomous_actions: autonomousActions,
      recommendations
    };
  }

  /**
   * Monitor entire fleet
   */
  monitorFleet(
    routes: Map<string, PlannedRoute>,
    trackingData: VesselTrackingData[]
  ): FleetDriftReport {
    const analyses: DriftAnalysis[] = [];
    let onTrack = 0;
    const allAlerts: DriftAlert[] = [];
    let actionsCount = 0;

    trackingData.forEach(tracking => {
      const route = routes.get(tracking.vessel_id);
      if (route) {
        const analysis = this.analyzeDrift(route, tracking);
        analyses.push(analysis);
        
        if (analysis.deviation_status === 'on_track') {
          onTrack++;
        }
        
        allAlerts.push(...analysis.alerts);
        actionsCount += analysis.autonomous_actions.filter(a => a.executed).length;
      }
    });

    const criticalAlerts = allAlerts.filter(a => a.severity === 'critical');
    const systemHealth = criticalAlerts.length === 0 
      ? 'healthy' 
      : criticalAlerts.length <= 2 ? 'degraded' : 'critical';

    return {
      report_timestamp: new Date().toISOString(),
      vessels_monitored: trackingData.length,
      vessels_on_track: onTrack,
      vessels_with_deviation: analyses.filter(a => a.deviation_status !== 'on_track'),
      critical_alerts: criticalAlerts,
      autonomous_actions_taken: actionsCount,
      system_health: systemHealth
    };
  }

  /**
   * Check for danger zone proximity
   */
  checkDangerZones(position: { lat: number; lng: number }): {
    in_danger_zone: boolean;
    zones: { name: string; distance_nm: number }[];
  } {
    const nearbyZones = DANGER_ZONES
      .map(zone => ({
        name: zone.name,
        distance_nm: this.haversineDistance(position, zone.center)
      }))
      .filter(z => z.distance_nm < z.distance_nm + 5) // Within 5nm of zone boundary
      .sort((a, b) => a.distance_nm - b.distance_nm);

    return {
      in_danger_zone: nearbyZones.some(z => z.distance_nm < 0.5),
      zones: nearbyZones.slice(0, 3)
    };
  }

  private updateTrackingHistory(tracking: VesselTrackingData): void {
    const history = this.trackingHistory.get(tracking.vessel_id) || [];
    history.push(tracking);
    
    // Keep only last 100 data points
    if (history.length > 100) {
      history.shift();
    }
    
    this.trackingHistory.set(tracking.vessel_id, history);
  }

  private findRelevantWaypoints(
    route: PlannedRoute,
    position: { lat: number; lng: number }
  ): { closest: RouteWaypoint; next: RouteWaypoint } {
    let closestDistance = Infinity;
    let closestIndex = 0;

    route.waypoints.forEach((wp, index) => {
      const distance = this.haversineDistance(position, wp.position);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    const closest = route.waypoints[closestIndex];
    const next = route.waypoints[Math.min(closestIndex + 1, route.waypoints.length - 1)];

    return { closest, next };
  }

  private calculateDeviation(
    position: { lat: number; lng: number },
    closest: RouteWaypoint,
    next: RouteWaypoint
  ): number {
    // Calculate cross-track distance (distance from position to line between waypoints)
    const d1 = this.haversineDistance(position, closest.position);
    const d2 = this.haversineDistance(position, next.position);
    const d3 = this.haversineDistance(closest.position, next.position);

    if (d3 === 0) return d1;

    // Use formula for distance from point to line
    const s = (d1 + d2 + d3) / 2;
    const area = Math.sqrt(Math.max(0, s * (s - d1) * (s - d2) * (s - d3)));
    const crossTrackDistance = (2 * area) / d3;

    return crossTrackDistance;
  }

  private classifyDeviation(deviation: number, maxAllowed: number): DriftAnalysis['deviation_status'] {
    const thresholds = {
      minor: Math.min(this.DEVIATION_THRESHOLDS.minor, maxAllowed * 0.25),
      significant: Math.min(this.DEVIATION_THRESHOLDS.significant, maxAllowed * 0.5),
      critical: Math.min(this.DEVIATION_THRESHOLDS.critical, maxAllowed)
    };

    if (deviation <= thresholds.minor) return 'on_track';
    if (deviation <= thresholds.significant) return 'minor_deviation';
    if (deviation <= thresholds.critical) return 'significant_deviation';
    return 'critical_deviation';
  }

  private calculateSpeedVariance(actual: number, planned: number): number {
    return Math.abs(actual - planned) / planned;
  }

  private calculateHeadingVariance(
    tracking: VesselTrackingData,
    nextWaypoint: RouteWaypoint
  ): number {
    const requiredHeading = this.calculateBearing(tracking.position, nextWaypoint.position);
    let variance = Math.abs(tracking.course_over_ground - requiredHeading);
    if (variance > 180) variance = 360 - variance;
    return variance;
  }

  private calculateETAVariance(
    tracking: VesselTrackingData,
    nextWaypoint: RouteWaypoint,
    route: PlannedRoute
  ): number {
    if (!nextWaypoint.planned_eta) return 0;

    const distanceToNext = this.haversineDistance(tracking.position, nextWaypoint.position);
    const timeToNextHours = tracking.speed_knots > 0 ? distanceToNext / tracking.speed_knots : 0;
    const predictedETA = new Date(Date.now() + timeToNextHours * 60 * 60 * 1000);
    const plannedETA = new Date(nextWaypoint.planned_eta);

    return (predictedETA.getTime() - plannedETA.getTime()) / (60 * 60 * 1000);
  }

  private analyzeTrend(vesselId: string, route: PlannedRoute): DriftTrend {
    const history = this.trackingHistory.get(vesselId) || [];
    
    if (history.length < 5) {
      return {
        direction: 'stable',
        rate_nm_per_hour: 0,
        predicted_max_deviation_nm: 0,
        time_to_correction_hours: null
      };
    }

    // Calculate deviation trend from recent history
    const recentDeviations = history.slice(-10).map((h, i) => {
      const { closest, next } = this.findRelevantWaypoints(route, h.position);
      return this.calculateDeviation(h.position, closest, next);
    });

    const deviationChange = recentDeviations[recentDeviations.length - 1] - recentDeviations[0];
    const timeSpanHours = (
      new Date(history[history.length - 1].timestamp).getTime() -
      new Date(history[history.length - 10].timestamp).getTime()
    ) / (60 * 60 * 1000);

    const ratePerHour = timeSpanHours > 0 ? deviationChange / timeSpanHours : 0;

    let direction: DriftTrend['direction'] = 'stable';
    if (ratePerHour > 0.1) direction = 'worsening';
    if (ratePerHour < -0.1) direction = 'improving';

    return {
      direction,
      rate_nm_per_hour: Math.round(Math.abs(ratePerHour) * 100) / 100,
      predicted_max_deviation_nm: Math.max(0, recentDeviations[recentDeviations.length - 1] + ratePerHour * 2),
      time_to_correction_hours: direction === 'improving' && ratePerHour !== 0
        ? Math.abs(recentDeviations[recentDeviations.length - 1] / ratePerHour)
        : null
    };
  }

  private generateAlerts(
    tracking: VesselTrackingData,
    deviation: number,
    deviationStatus: DriftAnalysis['deviation_status'],
    speedVariance: number,
    headingVariance: number,
    etaVariance: number,
    route: PlannedRoute
  ): DriftAlert[] {
    const alerts: DriftAlert[] = [];
    const timestamp = new Date().toISOString();

    // Position deviation alerts
    if (deviationStatus !== 'on_track') {
      alerts.push({
        alert_id: `DEV-${tracking.vessel_id}-${Date.now()}`,
        alert_type: 'position_deviation',
        severity: deviationStatus === 'critical_deviation' ? 'critical' : 
                  deviationStatus === 'significant_deviation' ? 'warning' : 'info',
        message: `Desvio de ${deviation.toFixed(2)} nm da rota planejada`,
        detected_at: timestamp,
        value: deviation,
        threshold: route.max_deviation_nm,
        acknowledged: false
      });
    }

    // Speed deviation alert
    if (speedVariance > this.SPEED_TOLERANCE) {
      alerts.push({
        alert_id: `SPD-${tracking.vessel_id}-${Date.now()}`,
        alert_type: 'speed_deviation',
        severity: speedVariance > 0.3 ? 'warning' : 'info',
        message: `Velocidade ${speedVariance * 100 > 0 ? 'acima' : 'abaixo'} do planejado (${(speedVariance * 100).toFixed(0)}%)`,
        detected_at: timestamp,
        value: speedVariance * 100,
        threshold: this.SPEED_TOLERANCE * 100,
        acknowledged: false
      });
    }

    // Heading deviation alert
    if (headingVariance > this.HEADING_TOLERANCE) {
      alerts.push({
        alert_id: `HDG-${tracking.vessel_id}-${Date.now()}`,
        alert_type: 'heading_deviation',
        severity: headingVariance > 30 ? 'warning' : 'info',
        message: `Rumo desviado em ${headingVariance.toFixed(0)}° do curso planejado`,
        detected_at: timestamp,
        value: headingVariance,
        threshold: this.HEADING_TOLERANCE,
        acknowledged: false
      });
    }

    // ETA deviation alert
    if (Math.abs(etaVariance) > this.ETA_TOLERANCE_HOURS) {
      alerts.push({
        alert_id: `ETA-${tracking.vessel_id}-${Date.now()}`,
        alert_type: 'eta_deviation',
        severity: Math.abs(etaVariance) > 6 ? 'warning' : 'info',
        message: etaVariance > 0 
          ? `Atraso previsto de ${etaVariance.toFixed(1)} horas`
          : `Chegada antecipada em ${Math.abs(etaVariance).toFixed(1)} horas`,
        detected_at: timestamp,
        value: etaVariance,
        threshold: this.ETA_TOLERANCE_HOURS,
        acknowledged: false
      });
    }

    // Danger zone alert
    const dangerCheck = this.checkDangerZones(tracking.position);
    if (dangerCheck.in_danger_zone) {
      alerts.push({
        alert_id: `DNG-${tracking.vessel_id}-${Date.now()}`,
        alert_type: 'danger_zone',
        severity: 'critical',
        message: `Proximidade de zona perigosa: ${dangerCheck.zones[0]?.name}`,
        detected_at: timestamp,
        value: dangerCheck.zones[0]?.distance_nm || 0,
        threshold: 0.5,
        acknowledged: false
      });
    }

    return alerts;
  }

  private executeAutonomousActions(
    alerts: DriftAlert[],
    tracking: VesselTrackingData
  ): AutonomousAction[] {
    const actions: AutonomousAction[] = [];
    const timestamp = new Date().toISOString();

    // Always log events
    actions.push({
      action_type: 'log_event',
      executed: true,
      execution_time: timestamp,
      result: `Análise de desvio registrada para ${tracking.vessel_name}`
    });

    // Critical alerts trigger immediate notifications
    const criticalAlerts = alerts.filter(a => a.severity === 'critical');
    if (criticalAlerts.length > 0) {
      actions.push({
        action_type: 'notify_bridge',
        executed: true,
        execution_time: timestamp,
        result: `Notificação enviada: ${criticalAlerts.length} alerta(s) crítico(s)`
      });

      actions.push({
        action_type: 'trigger_alarm',
        executed: true,
        execution_time: timestamp,
        result: 'Alarme de desvio acionado no sistema de navegação'
      });

      // Notify VTS for danger zone or critical deviation
      if (criticalAlerts.some(a => a.alert_type === 'danger_zone' || a.alert_type === 'position_deviation')) {
        actions.push({
          action_type: 'notify_vts',
          executed: true,
          execution_time: timestamp,
          result: 'VTS notificado sobre situação crítica'
        });
      }
    }

    // Warning alerts trigger bridge notification
    const warningAlerts = alerts.filter(a => a.severity === 'warning');
    if (warningAlerts.length > 0 && criticalAlerts.length === 0) {
      actions.push({
        action_type: 'notify_bridge',
        executed: true,
        execution_time: timestamp,
        result: `Notificação enviada: ${warningAlerts.length} alerta(s) de atenção`
      });
    }

    return actions;
  }

  private generateRecommendations(
    tracking: VesselTrackingData,
    deviation: number,
    trend: DriftTrend,
    nextWaypoint: RouteWaypoint
  ): DriftRecommendation[] {
    const recommendations: DriftRecommendation[] = [];

    // Course correction recommendation
    if (deviation > this.DEVIATION_THRESHOLDS.minor) {
      const requiredHeading = this.calculateBearing(tracking.position, nextWaypoint.position);
      recommendations.push({
        priority: deviation > this.DEVIATION_THRESHOLDS.significant ? 'high' : 'medium',
        type: 'course_correction',
        action: `Alterar rumo para ${requiredHeading.toFixed(0)}° para retornar à rota`,
        expected_correction_time_hours: deviation / (tracking.speed_knots * 0.1),
        new_values: { heading: Math.round(requiredHeading) }
      });
    }

    // Speed adjustment if behind schedule
    if (nextWaypoint.planned_eta) {
      const timeToWaypoint = this.haversineDistance(tracking.position, nextWaypoint.position) / tracking.speed_knots;
      const plannedTime = (new Date(nextWaypoint.planned_eta).getTime() - Date.now()) / (60 * 60 * 1000);
      
      if (timeToWaypoint > plannedTime * 1.1) {
        const requiredSpeed = this.haversineDistance(tracking.position, nextWaypoint.position) / plannedTime;
        recommendations.push({
          priority: 'medium',
          type: 'speed_adjustment',
          action: `Aumentar velocidade para ${requiredSpeed.toFixed(1)} nós para manter ETA`,
          expected_correction_time_hours: plannedTime,
          new_values: { speed: Math.round(requiredSpeed * 10) / 10 }
        });
      }
    }

    // Communication recommendation for worsening trend
    if (trend.direction === 'worsening') {
      recommendations.push({
        priority: 'high',
        type: 'communication',
        action: 'Reportar situação ao VTC/Companhia e solicitar orientações',
        expected_correction_time_hours: 0.5
      });
    }

    // Waypoint update for significant deviation
    if (deviation > this.DEVIATION_THRESHOLDS.significant) {
      recommendations.push({
        priority: 'immediate',
        type: 'waypoint_update',
        action: 'Considerar inserção de waypoint intermediário para correção gradual',
        expected_correction_time_hours: deviation / tracking.speed_knots
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { immediate: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  private haversineDistance(
    pos1: { lat: number; lng: number },
    pos2: { lat: number; lng: number }
  ): number {
    const R = 3440.065; // Earth radius in nautical miles
    const dLat = this.toRad(pos2.lat - pos1.lat);
    const dLon = this.toRad(pos2.lng - pos1.lng);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(pos1.lat)) * Math.cos(this.toRad(pos2.lat)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private calculateBearing(
    from: { lat: number; lng: number },
    to: { lat: number; lng: number }
  ): number {
    const dLon = this.toRad(to.lng - from.lng);
    const lat1 = this.toRad(from.lat);
    const lat2 = this.toRad(to.lat);
    
    const y = Math.sin(dLon) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
    const bearing = this.toDeg(Math.atan2(y, x));
    
    return (bearing + 360) % 360;
  }

  private toRad(deg: number): number {
    return deg * Math.PI / 180;
  }

  private toDeg(rad: number): number {
    return rad * 180 / Math.PI;
  }
}

export const driftAlertEngine = new DriftAlertEngine();
