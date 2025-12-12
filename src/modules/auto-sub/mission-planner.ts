/**
 * PATCH 184.0 - Autonomous Mission Planner
 * AI-driven mission planning for autonomous underwater operations
 * 
 * Features:
 * - Area definition with boundaries
 * - Depth target configuration
 * - Environmental parameters
 * - Autonomous waypoint generation
 * - Real-time feedback and status
 */

export interface SurveyArea {
  id: string;
  name: string;
  bounds: {
    north: number; // latitude
    south: number;
    east: number; // longitude
    west: number;
  };
  minDepth: number; // meters
  maxDepth: number;
  priority: "low" | "medium" | "high" | "critical";
}

export interface EnvironmentalParams {
  maxCurrentSpeed: number; // knots
  maxWaveHeight: number; // meters
  minVisibility: number; // meters
  tempRange: { min: number; max: number }; // celsius
  salinityRange: { min: number; max: number }; // ppt
}

export interface AutoMissionPlan {
  id: string;
  name: string;
  area: SurveyArea;
  objectives: string[];
  waypoints: Array<{
    id: string;
    lat: number;
    lon: number;
    depth: number;
    action: "survey" | "sample" | "scan" | "observe" | "transit";
    duration: number; // seconds
    order: number;
  }>;
  environmental: EnvironmentalParams;
  estimatedDuration: number; // minutes
  estimatedDistance: number; // nautical miles
  riskLevel: "low" | "medium" | "high";
  status: "draft" | "approved" | "active" | "completed" | "aborted";
  createdAt: string;
  updatedAt?: string;
}

export interface MissionFeedback {
  missionId: string;
  timestamp: string;
  type: "progress" | "warning" | "error" | "completion" | "abort";
  waypoint?: string;
  progress: number; // 0-100
  message: string;
  data?: any;
}

class MissionPlanner {
  private activeMissions: Map<string, AutoMissionPlan> = new Map();
  private feedbackLog: MissionFeedback[] = [];
  private feedbackCallback?: (feedback: MissionFeedback) => void;

  /**
   * Generate autonomous mission plan
   */
  generateMissionPlan(
    area: SurveyArea,
    objectives: string[],
    environmental: EnvironmentalParams,
    scanPattern: "grid" | "spiral" | "random" = "grid"
  ): AutoMissionPlan {
    const waypoints = this.generateWaypoints(area, scanPattern);
    const estimatedDuration = this.estimateDuration(waypoints, environmental);
    const estimatedDistance = this.estimateDistance(waypoints);
    const riskLevel = this.assessRisk(area, environmental);

    const plan: AutoMissionPlan = {
      id: `mission-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: `Autonomous Survey - ${area.name}`,
      area,
      objectives,
      waypoints,
      environmental,
      estimatedDuration,
      estimatedDistance,
      riskLevel,
      status: "draft",
      createdAt: new Date().toISOString(),
    };

    this.activeMissions.set(plan.id, plan);
    return plan;
  }

  /**
   * Generate waypoints based on area and pattern
   */
  private generateWaypoints(
    area: SurveyArea,
    pattern: "grid" | "spiral" | "random"
  ): AutoMissionPlan["waypoints"] {
    const waypoints: AutoMissionPlan["waypoints"] = [];
    
    switch (pattern) {
    case "grid":
      waypoints.push(...this.generateGridPattern(area));
      break;
    case "spiral":
      waypoints.push(...this.generateSpiralPattern(area));
      break;
    case "random":
      waypoints.push(...this.generateRandomPattern(area));
      break;
    }

    return waypoints;
  }

  /**
   * Generate grid pattern waypoints
   */
  private generateGridPattern(area: SurveyArea): AutoMissionPlan["waypoints"] {
    const waypoints: AutoMissionPlan["waypoints"] = [];
    const gridSize = 5; // 5x5 grid
    
    const latStep = (area.bounds.north - area.bounds.south) / gridSize;
    const lonStep = (area.bounds.east - area.bounds.west) / gridSize;
    
    let order = 0;
    
    for (let i = 0; i <= gridSize; i++) {
      const lat = area.bounds.south + i * latStep;
      
      // Alternate direction for efficiency (lawnmower pattern)
      const lonRange = i % 2 === 0 
        ? { start: area.bounds.west, end: area.bounds.east, step: lonStep }
        : { start: area.bounds.east, end: area.bounds.west, step: -lonStep };
      
      for (let j = 0; j <= gridSize; j++) {
        const lon = lonRange.start + j * lonRange.step;
        const depth = area.minDepth + (Math.random() * (area.maxDepth - area.minDepth));
        
        waypoints.push({
          id: `wp-grid-${i}-${j}`,
          lat,
          lon,
          depth,
          action: j === 0 || j === gridSize ? "transit" : "survey",
          duration: j === 0 || j === gridSize ? 10 : 30,
          order: order++,
        });
      }
    }
    
    return waypoints;
  }

  /**
   * Generate spiral pattern waypoints
   */
  private generateSpiralPattern(area: SurveyArea): AutoMissionPlan["waypoints"] {
    const waypoints: AutoMissionPlan["waypoints"] = [];
    const centerLat = (area.bounds.north + area.bounds.south) / 2;
    const centerLon = (area.bounds.east + area.bounds.west) / 2;
    const maxRadius = Math.max(
      area.bounds.north - area.bounds.south,
      area.bounds.east - area.bounds.west
    ) / 2;
    
    const spirals = 5;
    const pointsPerSpiral = 10;
    
    for (let i = 0; i < spirals * pointsPerSpiral; i++) {
      const angle = (i / pointsPerSpiral) * Math.PI * 2;
      const radius = (i / (spirals * pointsPerSpiral)) * maxRadius;
      
      const lat = centerLat + radius * Math.cos(angle);
      const lon = centerLon + radius * Math.sin(angle);
      const depth = area.minDepth + (Math.random() * (area.maxDepth - area.minDepth));
      
      waypoints.push({
        id: `wp-spiral-${i}`,
        lat,
        lon,
        depth,
        action: i < 3 ? "transit" : "survey",
        duration: i < 3 ? 10 : 30,
        order: i,
      });
    }
    
    return waypoints;
  }

  /**
   * Generate random pattern waypoints
   */
  private generateRandomPattern(area: SurveyArea): AutoMissionPlan["waypoints"] {
    const waypoints: AutoMissionPlan["waypoints"] = [];
    const numPoints = 20;
    
    for (let i = 0; i < numPoints; i++) {
      const lat = area.bounds.south + Math.random() * (area.bounds.north - area.bounds.south);
      const lon = area.bounds.west + Math.random() * (area.bounds.east - area.bounds.west);
      const depth = area.minDepth + Math.random() * (area.maxDepth - area.minDepth);
      
      waypoints.push({
        id: `wp-random-${i}`,
        lat,
        lon,
        depth,
        action: "survey",
        duration: 30,
        order: i,
      });
    }
    
    return waypoints;
  }

  /**
   * Estimate mission duration
   */
  private estimateDuration(
    waypoints: AutoMissionPlan["waypoints"],
    environmental: EnvironmentalParams
  ): number {
    let totalTime = 0;
    
    // Add waypoint action durations
    waypoints.forEach(wp => {
      totalTime += wp.duration;
    });
    
    // Add transit time between waypoints (assuming 2 knots average speed)
    const avgSpeed = 2; // knots
    const totalDistance = this.estimateDistance(waypoints);
    const transitTime = (totalDistance / avgSpeed) * 60; // minutes
    
    totalTime += transitTime;
    
    // Add environmental impact factor
    if (environmental.maxCurrentSpeed > 2) {
      totalTime *= 1.2; // 20% longer in strong currents
    }
    
    return Math.round(totalTime);
  }

  /**
   * Estimate total distance
   */
  private estimateDistance(waypoints: AutoMissionPlan["waypoints"]): number {
    let totalDistance = 0;
    
    for (let i = 0; i < waypoints.length - 1; i++) {
      const wp1 = waypoints[i];
      const wp2 = waypoints[i + 1];
      
      const distance = this.calculateDistance(
        wp1.lat, wp1.lon,
        wp2.lat, wp2.lon
      );
      
      totalDistance += distance;
    }
    
    // Convert from kilometers to nautical miles
    return totalDistance * 0.539957;
  }

  /**
   * Calculate distance between two points (Haversine)
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Assess mission risk
   */
  private assessRisk(area: SurveyArea, environmental: EnvironmentalParams): "low" | "medium" | "high" {
    let riskScore = 0;
    
    // Depth risk
    if (area.maxDepth > 200) riskScore += 2;
    else if (area.maxDepth > 100) riskScore += 1;
    
    // Current risk
    if (environmental.maxCurrentSpeed > 3) riskScore += 2;
    else if (environmental.maxCurrentSpeed > 2) riskScore += 1;
    
    // Wave risk
    if (environmental.maxWaveHeight > 3) riskScore += 2;
    else if (environmental.maxWaveHeight > 2) riskScore += 1;
    
    // Visibility risk
    if (environmental.minVisibility < 5) riskScore += 2;
    else if (environmental.minVisibility < 10) riskScore += 1;
    
    if (riskScore >= 5) return "high";
    if (riskScore >= 2) return "medium";
    return "low";
  }

  /**
   * Approve mission plan
   */
  approveMission(missionId: string): boolean {
    const mission = this.activeMissions.get(missionId);
    if (!mission || mission.status !== "draft") return false;
    
    mission.status = "approved";
    mission.updatedAt = new Date().toISOString();
    
    this.addFeedback({
      missionId,
      type: "progress",
      progress: 0,
      message: "Mission approved and ready for execution",
    });
    
    return true;
  }

  /**
   * Start mission execution
   */
  startMission(missionId: string): boolean {
    const mission = this.activeMissions.get(missionId);
    if (!mission || mission.status !== "approved") return false;
    
    mission.status = "active";
    mission.updatedAt = new Date().toISOString();
    
    this.addFeedback({
      missionId,
      type: "progress",
      progress: 0,
      message: "Mission started - executing autonomous operations",
    });
    
    return true;
  }

  /**
   * Update mission progress
   */
  updateProgress(missionId: string, waypointId: string, progress: number): void {
    const mission = this.activeMissions.get(missionId);
    if (!mission || mission.status !== "active") return;
    
    this.addFeedback({
      missionId,
      type: "progress",
      waypoint: waypointId,
      progress,
      message: `Waypoint ${waypointId} - ${progress}% complete`,
    });
  }

  /**
   * Complete mission
   */
  completeMission(missionId: string): boolean {
    const mission = this.activeMissions.get(missionId);
    if (!mission || mission.status !== "active") return false;
    
    mission.status = "completed";
    mission.updatedAt = new Date().toISOString();
    
    this.addFeedback({
      missionId,
      type: "completion",
      progress: 100,
      message: "Mission completed successfully",
    });
    
    return true;
  }

  /**
   * Abort mission
   */
  abortMission(missionId: string, reason: string): boolean {
    const mission = this.activeMissions.get(missionId);
    if (!mission) return false;
    
    mission.status = "aborted";
    mission.updatedAt = new Date().toISOString();
    
    this.addFeedback({
      missionId,
      type: "abort",
      progress: 0,
      message: `Mission aborted: ${reason}`,
    });
    
    return true;
  }

  /**
   * Get mission plan
   */
  getMissionPlan(missionId: string): AutoMissionPlan | null {
    return this.activeMissions.get(missionId) || null;
  }

  /**
   * Get all missions
   */
  getAllMissions(): AutoMissionPlan[] {
    return Array.from(this.activeMissions.values());
  }

  /**
   * Get feedback log
   */
  getFeedback(missionId?: string): MissionFeedback[] {
    if (missionId) {
      return this.feedbackLog.filter(f => f.missionId === missionId);
    }
    return [...this.feedbackLog];
  }

  /**
   * Set feedback callback
   */
  onFeedback(callback: (feedback: MissionFeedback) => void): void {
    this.feedbackCallback = callback;
  }

  /**
   * Add feedback
   */
  private addFeedback(partial: Omit<MissionFeedback, "timestamp">): void {
    const feedback: MissionFeedback = {
      timestamp: new Date().toISOString(),
      ...partial,
    });
    
    this.feedbackLog.unshift(feedback);
    
    // Keep only last 100 entries
    if (this.feedbackLog.length > 100) {
      this.feedbackLog = this.feedbackLog.slice(0, 100);
    }
    
    if (this.feedbackCallback) {
      this.feedbackCallback(feedback);
    }
  }

  /**
   * Export mission plan to JSON
   */
  exportMissionPlan(missionId: string): string {
    const mission = this.activeMissions.get(missionId);
    if (!mission) throw new Error("Mission not found");
    
    return JSON.stringify(mission, null, 2);
  }

  /**
   * Clear all missions
   */
  clearAll(): void {
    this.activeMissions.clear();
    this.feedbackLog = [];
  }
}

export default MissionPlanner;
