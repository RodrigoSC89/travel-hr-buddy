/**
 * PATCH 181.0 - Mission Upload Subsystem
 * Manages mission waypoints and autonomous navigation
 * 
 * Features:
 * - JSON mission upload
 * - Waypoint navigation
 * - Mission progress tracking
 * - Automatic mission execution
 */

import { DronePosition } from './droneSubCore';

export interface Waypoint {
  id: string;
  position: DronePosition;
  action?: 'hover' | 'scan' | 'sample' | 'photo' | 'wait';
  duration?: number; // seconds
  description?: string;
  completed: boolean;
  timestamp?: string;
}

export interface Mission {
  id: string;
  name: string;
  description: string;
  waypoints: Waypoint[];
  startTime?: string;
  endTime?: string;
  status: 'pending' | 'active' | 'paused' | 'completed' | 'aborted';
  progress: number; // 0-100%
  metadata?: {
    vesselId?: string;
    operatorId?: string;
    missionType?: string;
    priority?: 'low' | 'medium' | 'high' | 'critical';
  };
}

export interface MissionEvent {
  id: string;
  missionId: string;
  waypointId?: string;
  type: 'start' | 'waypoint_reached' | 'waypoint_completed' | 'pause' | 'resume' | 'abort' | 'complete';
  timestamp: string;
  message: string;
  data?: any;
}

class MissionUploadSub {
  private currentMission: Mission | null = null;
  private currentWaypointIndex: number = 0;
  private events: MissionEvent[] = [];
  private eventCallback?: (event: MissionEvent) => void;

  /**
   * Upload and validate mission
   */
  uploadMission(missionJson: string | object): { success: boolean; error?: string } {
    try {
      const mission: Mission = typeof missionJson === 'string' 
        ? JSON.parse(missionJson) 
        : missionJson;

      // Validate mission structure
      const validation = this.validateMission(mission);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      // Initialize mission
      this.currentMission = {
        ...mission,
        status: 'pending',
        progress: 0,
        waypoints: mission.waypoints.map(wp => ({ ...wp, completed: false })),
      };

      this.currentWaypointIndex = 0;
      
      this.addEvent({
        type: 'start',
        message: `Mission "${mission.name}" uploaded successfully`,
      });

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Invalid JSON format' 
      };
    }
  }

  /**
   * Validate mission structure
   */
  private validateMission(mission: any): { valid: boolean; error?: string } {
    if (!mission.id || !mission.name) {
      return { valid: false, error: 'Mission must have id and name' };
    }

    if (!Array.isArray(mission.waypoints) || mission.waypoints.length === 0) {
      return { valid: false, error: 'Mission must have at least one waypoint' };
    }

    // Validate waypoints
    for (let i = 0; i < mission.waypoints.length; i++) {
      const wp = mission.waypoints[i];
      if (!wp.id || !wp.position) {
        return { valid: false, error: `Waypoint ${i + 1} is invalid` };
      }

      if (
        typeof wp.position.lat !== 'number' ||
        typeof wp.position.lon !== 'number' ||
        typeof wp.position.depth !== 'number'
      ) {
        return { valid: false, error: `Waypoint ${i + 1} has invalid position` };
      }

      // Validate coordinates
      if (wp.position.lat < -90 || wp.position.lat > 90) {
        return { valid: false, error: `Waypoint ${i + 1} has invalid latitude` };
      }

      if (wp.position.lon < -180 || wp.position.lon > 180) {
        return { valid: false, error: `Waypoint ${i + 1} has invalid longitude` };
      }

      if (wp.position.depth < 0 || wp.position.depth > 1000) {
        return { valid: false, error: `Waypoint ${i + 1} has invalid depth (must be 0-1000m)` };
      }
    }

    return { valid: true };
  }

  /**
   * Start mission execution
   */
  startMission(): boolean {
    if (!this.currentMission || this.currentMission.status !== 'pending') {
      return false;
    }

    this.currentMission.status = 'active';
    this.currentMission.startTime = new Date().toISOString();
    this.currentWaypointIndex = 0;

    this.addEvent({
      type: 'start',
      message: 'Mission started',
    });

    return true;
  }

  /**
   * Pause mission
   */
  pauseMission(): boolean {
    if (!this.currentMission || this.currentMission.status !== 'active') {
      return false;
    }

    this.currentMission.status = 'paused';
    
    this.addEvent({
      type: 'pause',
      message: 'Mission paused',
    });

    return true;
  }

  /**
   * Resume mission
   */
  resumeMission(): boolean {
    if (!this.currentMission || this.currentMission.status !== 'paused') {
      return false;
    }

    this.currentMission.status = 'active';
    
    this.addEvent({
      type: 'resume',
      message: 'Mission resumed',
    });

    return true;
  }

  /**
   * Abort mission
   */
  abortMission(reason?: string): boolean {
    if (!this.currentMission) {
      return false;
    }

    this.currentMission.status = 'aborted';
    this.currentMission.endTime = new Date().toISOString();
    
    this.addEvent({
      type: 'abort',
      message: reason || 'Mission aborted',
    });

    return true;
  }

  /**
   * Get current waypoint
   */
  getCurrentWaypoint(): Waypoint | null {
    if (!this.currentMission || this.currentWaypointIndex >= this.currentMission.waypoints.length) {
      return null;
    }

    return this.currentMission.waypoints[this.currentWaypointIndex];
  }

  /**
   * Mark current waypoint as reached
   */
  waypointReached(position: DronePosition): void {
    const waypoint = this.getCurrentWaypoint();
    if (!waypoint || !this.currentMission) return;

    const distance = this.calculateDistance(position, waypoint.position);
    
    // Consider waypoint reached if within 5 meters
    if (distance <= 5) {
      this.addEvent({
        type: 'waypoint_reached',
        waypointId: waypoint.id,
        message: `Reached waypoint ${this.currentWaypointIndex + 1}: ${waypoint.description || waypoint.id}`,
        data: { distance },
      });
    }
  }

  /**
   * Mark current waypoint as completed
   */
  completeWaypoint(): void {
    const waypoint = this.getCurrentWaypoint();
    if (!waypoint || !this.currentMission) return;

    waypoint.completed = true;
    waypoint.timestamp = new Date().toISOString();

    this.addEvent({
      type: 'waypoint_completed',
      waypointId: waypoint.id,
      message: `Completed waypoint ${this.currentWaypointIndex + 1}: ${waypoint.description || waypoint.id}`,
    });

    // Move to next waypoint
    this.currentWaypointIndex++;

    // Update progress
    this.updateProgress();

    // Check if mission is complete
    if (this.currentWaypointIndex >= this.currentMission.waypoints.length) {
      this.completeMission();
    }
  }

  /**
   * Complete mission
   */
  private completeMission(): void {
    if (!this.currentMission) return;

    this.currentMission.status = 'completed';
    this.currentMission.endTime = new Date().toISOString();
    this.currentMission.progress = 100;

    this.addEvent({
      type: 'complete',
      message: 'Mission completed successfully',
    });
  }

  /**
   * Update mission progress
   */
  private updateProgress(): void {
    if (!this.currentMission) return;

    const completed = this.currentMission.waypoints.filter(wp => wp.completed).length;
    const total = this.currentMission.waypoints.length;
    this.currentMission.progress = Math.round((completed / total) * 100);
  }

  /**
   * Calculate distance between two positions
   */
  private calculateDistance(pos1: DronePosition, pos2: DronePosition): number {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (pos1.lat * Math.PI) / 180;
    const φ2 = (pos2.lat * Math.PI) / 180;
    const Δφ = ((pos2.lat - pos1.lat) * Math.PI) / 180;
    const Δλ = ((pos2.lon - pos1.lon) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const horizontalDistance = R * c;
    const depthDiff = Math.abs(pos1.depth - pos2.depth);

    return Math.sqrt(horizontalDistance * horizontalDistance + depthDiff * depthDiff);
  }

  /**
   * Get current mission
   */
  getMission(): Mission | null {
    return this.currentMission ? { ...this.currentMission } : null;
  }

  /**
   * Get mission events
   */
  getEvents(): MissionEvent[] {
    return [...this.events];
  }

  /**
   * Set event callback
   */
  onEvent(callback: (event: MissionEvent) => void): void {
    this.eventCallback = callback;
  }

  /**
   * Add mission event
   */
  private addEvent(partial: Omit<MissionEvent, 'id' | 'missionId' | 'timestamp'>): void {
    const event: MissionEvent = {
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      missionId: this.currentMission?.id || 'unknown',
      timestamp: new Date().toISOString(),
      ...partial,
    };

    this.events.unshift(event);
    
    // Keep only last 100 events
    if (this.events.length > 100) {
      this.events = this.events.slice(0, 100);
    }

    if (this.eventCallback) {
      this.eventCallback(event);
    }
  }

  /**
   * Export mission template
   */
  exportTemplate(): string {
    const template: Mission = {
      id: 'mission-template',
      name: 'Mission Template',
      description: 'Template for creating new missions',
      waypoints: [
        {
          id: 'wp-1',
          position: { lat: 0, lon: 0, depth: 10, altitude: 0 },
          action: 'hover',
          duration: 30,
          description: 'Waypoint 1',
          completed: false,
        },
        {
          id: 'wp-2',
          position: { lat: 0.001, lon: 0.001, depth: 20, altitude: 0 },
          action: 'scan',
          duration: 60,
          description: 'Waypoint 2',
          completed: false,
        },
      ],
      status: 'pending',
      progress: 0,
      metadata: {
        missionType: 'survey',
        priority: 'medium',
      },
    };

    return JSON.stringify(template, null, 2);
  }

  /**
   * Clear all mission data
   */
  clear(): void {
    this.currentMission = null;
    this.currentWaypointIndex = 0;
    this.events = [];
  }
}

export default MissionUploadSub;
