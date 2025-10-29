/**
 * PATCH 540 - Navigation Copilot v3 Service
 * Fully autonomous navigation with real-time replanning
 */

import { supabase } from "@/integrations/supabase/client";
import type {
  AutonomousRoute,
  NavigationAlert,
  RouteReplanHistory,
  NavigationEnvironment,
  RouteStatus,
  AutonomyLevel,
} from "@/types/patches-536-540";

class NavigationCopilotV3Service {
  private monitoringInterval: NodeJS.Timeout | null = null;

  /**
   * Create autonomous route
   */
  async createRoute(route: {
    route_name: string;
    origin: { lat: number; lon: number; name?: string };
    destination: { lat: number; lon: number; name?: string };
    waypoints?: Array<{ lat: number; lon: number; order: number; name?: string }>;
    autonomy_level?: AutonomyLevel;
  }): Promise<AutonomousRoute | null> {
    const { data: userData } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('autonomous_routes')
      .insert([{
        route_name: route.route_name,
        origin: route.origin,
        destination: route.destination,
        waypoints: route.waypoints || [],
        status: 'planning',
        autonomy_level: route.autonomy_level || 'full',
        current_position: route.origin,
        obstacles_detected: [],
        environmental_conditions: {},
        created_by: userData?.user?.id,
      }])
      .select()
      .single();

    if (error) {
      console.error("Error creating route:", error);
      return null;
    }

    return data;
  }

  /**
   * Start route monitoring
   */
  async startRouteMonitoring(routeId: string): Promise<void> {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    // Update route to active
    await supabase
      .from('autonomous_routes')
      .update({ status: 'active' })
      .eq('id', routeId);

    // Monitor every 5 seconds
    this.monitoringInterval = setInterval(() => {
      this.monitorRoute(routeId);
    }, 5000);
  }

  /**
   * Stop route monitoring
   */
  stopRouteMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  /**
   * Monitor route for obstacles and environmental changes
   */
  private async monitorRoute(routeId: string): Promise<void> {
    const { data: route } = await supabase
      .from('autonomous_routes')
      .select('*')
      .eq('id', routeId)
      .single();

    if (!route || route.status !== 'active') {
      this.stopRouteMonitoring();
      return;
    }

    // Simulate environmental monitoring
    const environment = await this.checkEnvironment(routeId, route);

    // Check for obstacles
    const obstacles = this.detectObstacles();

    if (obstacles.length > 0) {
      // Update route with obstacles
      await supabase
        .from('autonomous_routes')
        .update({ obstacles_detected: obstacles })
        .eq('id', routeId);

      // Create alerts
      for (const obstacle of obstacles) {
        if (obstacle.severity === 'high' || obstacle.severity === 'critical') {
          await this.createAlert(routeId, 'obstacle', obstacle.severity, 
            `${obstacle.type} detected at ${obstacle.distance}m`, 
            route.current_position);
        }
      }

      // Trigger replanning if needed
      if (obstacles.some(o => o.severity === 'critical')) {
        await this.triggerReplan(routeId, route, 'Critical obstacle detected');
      }
    }

    // Check weather conditions
    if (environment.risk_assessment.overall_risk === 'high') {
      await this.createAlert(routeId, 'weather', 'warning',
        'Adverse weather conditions detected', route.current_position);
    }

    // Simulate progress
    await this.updateProgress(routeId, route);
  }

  /**
   * Check environmental conditions
   */
  private async checkEnvironment(routeId: string, route: AutonomousRoute): Promise<NavigationEnvironment> {
    const weatherConditions = {
      condition: ['clear', 'cloudy', 'rainy', 'stormy'][Math.floor(Math.random() * 4)],
      temperature: 15 + Math.random() * 15,
      humidity: 50 + Math.random() * 40,
      precipitation: Math.random() * 10,
    };

    const seaState = {
      state: ['calm', 'moderate', 'rough', 'very_rough'][Math.floor(Math.random() * 4)],
      wave_height: Math.random() * 5,
      wave_period: 5 + Math.random() * 10,
      swell_direction: Math.random() * 360,
    };

    const visibilityMeters = 1000 + Math.random() * 9000;
    const windSpeedKnots = Math.random() * 40;
    const waveHeightMeters = Math.random() * 5;

    const riskLevel = this.assessEnvironmentalRisk(weatherConditions, seaState, windSpeedKnots);

    const environment = {
      route_id: routeId,
      location: route.current_position,
      weather_conditions: weatherConditions,
      sea_state: seaState,
      visibility_meters: visibilityMeters,
      wind_speed_knots: windSpeedKnots,
      wave_height_meters: waveHeightMeters,
      obstacles: [],
      risk_assessment: riskLevel,
      timestamp: new Date().toISOString(),
    };

    await supabase.from('navigation_environment').insert([environment]);

    return environment as NavigationEnvironment;
  }

  /**
   * Assess environmental risk
   */
  private assessEnvironmentalRisk(
    weather: { condition: string; temperature: number; humidity: number; precipitation: number },
    seaState: { state: string; wave_height: number; wave_period: number; swell_direction: number },
    windSpeed: number
  ): { overall_risk: string; risk_factors: Array<{ factor: string; level: string }> } {
    const factors = [];
    let overallRisk = 'low';

    if (weather.condition === 'stormy') {
      factors.push({ factor: 'severe_weather', level: 'high' });
      overallRisk = 'high';
    }

    if (seaState.wave_height > 3) {
      factors.push({ factor: 'high_waves', level: 'medium' });
      if (overallRisk === 'low') overallRisk = 'medium';
    }

    if (windSpeed > 30) {
      factors.push({ factor: 'strong_winds', level: 'medium' });
      if (overallRisk === 'low') overallRisk = 'medium';
    }

    return {
      overall_risk: overallRisk,
      risk_factors: factors,
    };
  }

  /**
   * Detect obstacles (simulated)
   */
  private detectObstacles(): Array<{
    id: string;
    type: string;
    location: any;
    severity: string;
    detected_at: string;
    distance: number;
  }> {
    // 20% chance of detecting an obstacle
    if (Math.random() > 0.8) {
      return [{
        id: `OBS-${Date.now()}`,
        type: ['vessel', 'debris', 'shallow_water', 'restricted_area'][Math.floor(Math.random() * 4)],
        location: { lat: 0, lon: 0 },
        severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
        detected_at: new Date().toISOString(),
        distance: Math.random() * 1000,
      }];
    }
    return [];
  }

  /**
   * Create navigation alert
   */
  private async createAlert(
    routeId: string,
    alertType: string,
    severity: string,
    message: string,
    location: any
  ): Promise<void> {
    await supabase.from('navigation_alerts').insert([{
      route_id: routeId,
      alert_type: alertType,
      severity,
      message,
      location,
      visual_notification: true,
      audio_notification: severity === 'critical',
      status: 'active',
    }]);
  }

  /**
   * Trigger autonomous replanning
   */
  private async triggerReplan(routeId: string, currentRoute: AutonomousRoute, reason: string): Promise<void> {
    // Mark route as replanning
    await supabase
      .from('autonomous_routes')
      .update({ status: 'replanning' })
      .eq('id', routeId);

    // Generate new route (simplified)
    const newRoute = {
      ...currentRoute,
      waypoints: this.generateAlternativeWaypoints(currentRoute),
    };

    // Save replan history
    await supabase.from('route_replan_history').insert([{
      route_id: routeId,
      replan_reason: reason,
      original_route: {
        waypoints: currentRoute.waypoints,
        obstacles: currentRoute.obstacles_detected,
      },
      new_route: {
        waypoints: newRoute.waypoints,
      },
      trigger_data: { automated: true, timestamp: new Date().toISOString() },
      autonomous: true,
    }]);

    // Update route with new plan
    await supabase
      .from('autonomous_routes')
      .update({
        waypoints: newRoute.waypoints,
        status: 'active',
      })
      .eq('id', routeId);

    // Create alert about replanning
    await this.createAlert(routeId, 'route_deviation', 'info',
      `Route automatically replanned: ${reason}`, currentRoute.current_position);
  }

  /**
   * Generate alternative waypoints
   */
  private generateAlternativeWaypoints(route: AutonomousRoute): Array<{
    lat: number;
    lon: number;
    order: number;
    name?: string;
  }> {
    // Simplified: add small offset to existing waypoints
    return (route.waypoints || []).map((wp: any) => ({
      ...wp,
      lat: wp.lat + (Math.random() - 0.5) * 0.01,
      lon: wp.lon + (Math.random() - 0.5) * 0.01,
    }));
  }

  /**
   * Update route progress
   */
  private async updateProgress(routeId: string, route: AutonomousRoute): Promise<void> {
    // Simulate progress towards destination
    const currentPos = route.current_position;
    const dest = route.destination;

    const newLat = currentPos.lat + (dest.lat - currentPos.lat) * 0.01;
    const newLon = currentPos.lon + (dest.lon - currentPos.lon) * 0.01;

    await supabase
      .from('autonomous_routes')
      .update({
        current_position: {
          lat: newLat,
          lon: newLon,
          heading: Math.random() * 360,
          speed: 10 + Math.random() * 10,
        },
      })
      .eq('id', routeId);
  }

  /**
   * Get active routes
   */
  async getActiveRoutes(): Promise<AutonomousRoute[]> {
    const { data, error } = await supabase
      .from('autonomous_routes')
      .select('*')
      .in('status', ['planning', 'active', 'replanning'])
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching routes:", error);
      return [];
    }

    return data || [];
  }

  /**
   * Get route alerts
   */
  async getRouteAlerts(routeId: string): Promise<NavigationAlert[]> {
    const { data, error } = await supabase
      .from('navigation_alerts')
      .select('*')
      .eq('route_id', routeId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching alerts:", error);
      return [];
    }

    return data || [];
  }

  /**
   * Get replan history
   */
  async getReplanHistory(routeId: string): Promise<RouteReplanHistory[]> {
    const { data, error } = await supabase
      .from('route_replan_history')
      .select('*')
      .eq('route_id', routeId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching replan history:", error);
      return [];
    }

    return data || [];
  }
}

export const navigationCopilotV3Service = new NavigationCopilotV3Service();
