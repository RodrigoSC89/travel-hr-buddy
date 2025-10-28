/**
 * PATCH 173.0 - SurfaceBot Core
 * AI-based navigation logic for Autonomous Surface Vehicles (ASV)
 */

import { logger } from "@/lib/logger";

export interface SurfaceBotPosition {
  latitude: number;
  longitude: number;
  heading: number; // degrees 0-360
  speed: number; // knots
}

export interface NavigationState {
  mode: "manual" | "autonomous" | "waypoint_follow" | "hold_position" | "emergency";
  targetPosition: SurfaceBotPosition | null;
  currentWaypoint: number | null;
  obstacleDetected: boolean;
  autonomyLevel: number; // 0-100%
}

export interface SurfaceBotStatus {
  id: string;
  name: string;
  status: "idle" | "active" | "navigating" | "holding" | "emergency" | "offline";
  position: SurfaceBotPosition;
  navigationState: NavigationState;
  lastUpdate: Date;
  connectedSince: Date;
}

export interface NavigationDecision {
  timestamp: Date;
  decision: "continue" | "turn_left" | "turn_right" | "stop" | "reverse";
  reason: string;
  confidence: number; // 0-1
  alternativeActions: string[];
}

export interface AINavigationParams {
  maxSpeed: number; // knots
  safetyDistance: number; // meters
  turnRate: number; // degrees per second
  reactionTime: number; // milliseconds
  riskTolerance: number; // 0-1, higher means more aggressive
}

class SurfaceBotCore {
  private bots: Map<string, SurfaceBotStatus> = new Map();
  private navigationDecisions: Map<string, NavigationDecision[]> = new Map();
  private aiParams: AINavigationParams = {
    maxSpeed: 10, // knots
    safetyDistance: 50, // meters
    turnRate: 5, // degrees per second
    reactionTime: 500, // ms
    riskTolerance: 0.3 // conservative
  };
  private maxBotsGlobal = 10;
  private maxDecisionHistory = 100;

  /**
   * Register a new surface bot
   */
  registerBot(bot: Omit<SurfaceBotStatus, "connectedSince" | "lastUpdate">): boolean {
    if (this.bots.size >= this.maxBotsGlobal) {
      logger.error(`[SurfaceBot Core] Maximum bots (${this.maxBotsGlobal}) already registered`);
      return false;
    }

    if (this.bots.has(bot.id)) {
      logger.warn(`[SurfaceBot Core] Bot ${bot.id} already registered`);
      return false;
    }

    const status: SurfaceBotStatus = {
      ...bot,
      connectedSince: new Date(),
      lastUpdate: new Date()
    };

    this.bots.set(bot.id, status);
    this.navigationDecisions.set(bot.id, []);

    logger.info(`[SurfaceBot Core] Bot ${bot.id} registered successfully`);
    return true;
  }

  /**
   * Unregister a bot
   */
  unregisterBot(botId: string): boolean {
    if (!this.bots.has(botId)) {
      return false;
    }

    this.bots.delete(botId);
    this.navigationDecisions.delete(botId);

    logger.info(`[SurfaceBot Core] Bot ${botId} unregistered`);
    return true;
  }

  /**
   * AI-based navigation decision making
   */
  makeNavigationDecision(
    botId: string,
    obstacles: { distance: number; bearing: number }[],
    targetBearing?: number
  ): NavigationDecision {
    const bot = this.bots.get(botId);
    
    if (!bot) {
      return {
        timestamp: new Date(),
        decision: "stop",
        reason: "Bot not found",
        confidence: 0,
        alternativeActions: []
      };
    }

    // Analyze obstacles
    const nearObstacles = obstacles.filter(
      obs => obs.distance < this.aiParams.safetyDistance
    );

    let decision: NavigationDecision["decision"];
    let reason: string;
    let confidence: number;
    const alternatives: string[] = [];

    if (nearObstacles.length === 0) {
      // No obstacles - continue or navigate to target
      if (targetBearing !== undefined) {
        const bearingDiff = this.normalizeBearing(targetBearing - bot.position.heading);
        
        if (Math.abs(bearingDiff) < 5) {
          decision = "continue";
          reason = "On course to target";
          confidence = 0.95;
        } else if (bearingDiff > 0) {
          decision = "turn_right";
          reason = `Adjusting course ${bearingDiff.toFixed(1)}° right`;
          confidence = 0.9;
          alternatives.push("continue with slight adjustment");
        } else {
          decision = "turn_left";
          reason = `Adjusting course ${Math.abs(bearingDiff).toFixed(1)}° left`;
          confidence = 0.9;
          alternatives.push("continue with slight adjustment");
        }
      } else {
        decision = "continue";
        reason = "Path clear, no target specified";
        confidence = 0.85;
        alternatives.push("hold_position", "turn_left", "turn_right");
      }
    } else {
      // Obstacles detected - avoid
      const closestObstacle = nearObstacles.reduce((min, obs) =>
        obs.distance < min.distance ? obs : min
      );

      if (closestObstacle.distance < this.aiParams.safetyDistance * 0.3) {
        // Very close obstacle - emergency stop
        decision = "stop";
        reason = `Emergency stop - obstacle at ${closestObstacle.distance.toFixed(1)}m`;
        confidence = 1.0;
        alternatives.push("reverse");
      } else {
        // Obstacle ahead - choose avoidance direction
        const leftClear = !nearObstacles.some(
          obs => obs.bearing > -90 && obs.bearing < -10
        );
        const rightClear = !nearObstacles.some(
          obs => obs.bearing > 10 && obs.bearing < 90
        );

        if (leftClear && !rightClear) {
          decision = "turn_left";
          reason = "Avoiding obstacle - turning left (clear path)";
          confidence = 0.85;
          alternatives.push("stop", "reverse");
        } else if (rightClear && !leftClear) {
          decision = "turn_right";
          reason = "Avoiding obstacle - turning right (clear path)";
          confidence = 0.85;
          alternatives.push("stop", "reverse");
        } else if (leftClear && rightClear) {
          // Both sides clear - choose based on target or default to right
          if (targetBearing !== undefined) {
            const bearingDiff = this.normalizeBearing(targetBearing - bot.position.heading);
            decision = bearingDiff > 0 ? "turn_right" : "turn_left";
            reason = "Both sides clear - turning toward target";
            confidence = 0.8;
          } else {
            decision = "turn_right";
            reason = "Both sides clear - default right turn";
            confidence = 0.75;
          }
          alternatives.push("turn_left", "turn_right", "stop");
        } else {
          // Both sides blocked - stop
          decision = "stop";
          reason = "Obstacles on both sides - stopping";
          confidence = 0.9;
          alternatives.push("reverse");
        }
      }
    }

    // Apply risk tolerance adjustment
    confidence = confidence * (1 - this.aiParams.riskTolerance * 0.2);

    const navigationDecision: NavigationDecision = {
      timestamp: new Date(),
      decision,
      reason,
      confidence,
      alternativeActions: alternatives
    };

    // Store decision
    this.addDecision(botId, navigationDecision);

    logger.info(
      `[SurfaceBot Core] Navigation decision for ${botId}: ${decision} (${(confidence * 100).toFixed(0)}% confidence)`,
      { reason, alternatives }
    );

    return navigationDecision;
  }

  /**
   * Normalize bearing to -180 to 180 range
   */
  private normalizeBearing(bearing: number): number {
    while (bearing > 180) bearing -= 360;
    while (bearing < -180) bearing += 360;
    return bearing;
  }

  /**
   * Add navigation decision to history
   */
  private addDecision(botId: string, decision: NavigationDecision): void {
    let decisions = this.navigationDecisions.get(botId) || [];
    decisions.unshift(decision);

    if (decisions.length > this.maxDecisionHistory) {
      decisions = decisions.slice(0, this.maxDecisionHistory);
    }

    this.navigationDecisions.set(botId, decisions);
  }

  /**
   * Set autonomous navigation mode
   */
  setAutonomousMode(
    botId: string,
    targetPosition: SurfaceBotPosition
  ): boolean {
    const bot = this.bots.get(botId);
    
    if (!bot) {
      return false;
    }

    bot.navigationState.mode = "autonomous";
    bot.navigationState.targetPosition = targetPosition;
    bot.navigationState.autonomyLevel = 100;
    bot.status = "navigating";
    bot.lastUpdate = new Date();

    logger.info(`[SurfaceBot Core] Bot ${botId} set to autonomous mode`, {
      target: targetPosition
    });

    return true;
  }

  /**
   * Hold current position
   */
  holdPosition(botId: string): boolean {
    const bot = this.bots.get(botId);
    
    if (!bot) {
      return false;
    }

    bot.navigationState.mode = "hold_position";
    bot.status = "holding";
    bot.position.speed = 0;
    bot.lastUpdate = new Date();

    logger.info(`[SurfaceBot Core] Bot ${botId} holding position`);
    return true;
  }

  /**
   * Emergency stop
   */
  emergencyStop(botId: string): boolean {
    const bot = this.bots.get(botId);
    
    if (!bot) {
      return false;
    }

    bot.navigationState.mode = "emergency";
    bot.status = "emergency";
    bot.position.speed = 0;
    bot.lastUpdate = new Date();

    logger.warn(`[SurfaceBot Core] EMERGENCY STOP for bot ${botId}`);
    return true;
  }

  /**
   * Update bot position
   */
  updatePosition(botId: string, position: Partial<SurfaceBotPosition>): void {
    const bot = this.bots.get(botId);
    
    if (!bot) {
      return;
    }

    bot.position = {
      ...bot.position,
      ...position
    };
    bot.lastUpdate = new Date();
  }

  /**
   * Get bot status
   */
  getBotStatus(botId: string): SurfaceBotStatus | null {
    return this.bots.get(botId) || null;
  }

  /**
   * List all bots
   */
  listBots(): SurfaceBotStatus[] {
    return Array.from(this.bots.values());
  }

  /**
   * Get navigation decisions for a bot
   */
  getDecisionHistory(botId: string, limit: number = 20): NavigationDecision[] {
    const decisions = this.navigationDecisions.get(botId) || [];
    return decisions.slice(0, limit);
  }

  /**
   * Update AI parameters
   */
  updateAIParams(updates: Partial<AINavigationParams>): void {
    this.aiParams = {
      ...this.aiParams,
      ...updates
    };

    logger.info("[SurfaceBot Core] AI parameters updated", updates);
  }

  /**
   * Get AI parameters
   */
  getAIParams(): AINavigationParams {
    return { ...this.aiParams };
  }

  /**
   * Get fleet statistics
   */
  getFleetStatistics(): {
    total: number;
    active: number;
    autonomous: number;
    manual: number;
    emergency: number;
    averageSpeed: number;
    } {
    const bots = Array.from(this.bots.values());

    return {
      total: bots.length,
      active: bots.filter(b => b.status === "active" || b.status === "navigating").length,
      autonomous: bots.filter(b => b.navigationState.mode === "autonomous").length,
      manual: bots.filter(b => b.navigationState.mode === "manual").length,
      emergency: bots.filter(b => b.status === "emergency").length,
      averageSpeed: bots.reduce((sum, b) => sum + b.position.speed, 0) / (bots.length || 1)
    };
  }

  /**
   * Reset all bots
   */
  reset(): void {
    this.bots.clear();
    this.navigationDecisions.clear();
    logger.info("[SurfaceBot Core] Reset completed");
  }
}

// Export singleton instance
export const surfaceBotCore = new SurfaceBotCore();
