/**
 * PATCH 175.0 - Fallback Layer
 * Ensures safety during disconnection
 */

import { logger } from "@/lib/logger";

export interface FallbackAction {
  deviceId: string;
  action: "return_home" | "hold_position" | "land" | "emergency_stop";
  reason: string;
  timestamp: Date;
}

class FallbackLayer {
  private actions: FallbackAction[] = [];

  /**
   * Trigger fallback for disconnected device
   */
  triggerFallback(deviceId: string, deviceType: "drone" | "surfacebot"): FallbackAction {
    const action: FallbackAction = {
      deviceId,
      action: deviceType === "drone" ? "land" : "hold_position",
      reason: "Connection lost - safety protocol",
      timestamp: new Date()
    };

    this.actions.push(action);
    logger.warn(`[Fallback Layer] Triggered fallback for ${deviceId}`, action);

    return action;
  }

  /**
   * Get fallback history
   */
  getHistory(): FallbackAction[] {
    return this.actions;
  }
}

export const fallbackLayer = new FallbackLayer();
