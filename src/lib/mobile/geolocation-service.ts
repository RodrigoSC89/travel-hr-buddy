/**
 * Enhanced Geolocation Service for Mobile
 * Supports offline caching, high-accuracy tracking, and background updates
 */

import { Capacitor } from "@capacitor/core";
import { logger } from "@/lib/logger";

export interface GeolocationPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number;
  altitudeAccuracy?: number;
  heading?: number;
  speed?: number;
  timestamp: number;
}

export interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

export interface GeolocationWatchOptions extends GeolocationOptions {
  distanceFilter?: number; // Minimum distance (meters) before update
}

export type GeolocationCallback = (position: GeolocationPosition) => void;
export type GeolocationErrorCallback = (error: GeolocationError) => void;

export interface GeolocationError {
  code: number;
  message: string;
}

const GEOLOCATION_ERRORS: Record<number, string> = {
  1: "Permissão de localização negada",
  2: "Posição indisponível",
  3: "Tempo limite excedido"
};

class GeolocationService {
  private watchId: number | null = null;
  private lastPosition: GeolocationPosition | null = null;
  private isNative: boolean;

  constructor() {
    this.isNative = Capacitor.isNativePlatform();
    this.loadCachedPosition();
  }

  /**
   * Load last known position from cache
   */
  private loadCachedPosition(): void {
    try {
      const cached = sessionStorage.getItem("nauti_last_position") || localStorage.getItem("nauti_last_position");
      if (cached) {
        this.lastPosition = JSON.parse(cached);
      }
    } catch (error) {
      logger.warn("[Geolocation] Failed to load cached position:", error);
    }
  }

  /**
   * Cache position for offline use
   */
  private cachePosition(position: GeolocationPosition): void {
    try {
      sessionStorage.setItem("nauti_last_position", JSON.stringify(position));
      this.lastPosition = position;
    } catch (error) {
      logger.warn("[Geolocation] Failed to cache position:", error);
    }
  }

  /**
   * Convert browser GeolocationPosition to our interface
   */
  private convertPosition(geoPosition: globalThis.GeolocationPosition): GeolocationPosition {
    return {
      latitude: geoPosition.coords.latitude,
      longitude: geoPosition.coords.longitude,
      accuracy: geoPosition.coords.accuracy,
      altitude: geoPosition.coords.altitude ?? undefined,
      altitudeAccuracy: geoPosition.coords.altitudeAccuracy ?? undefined,
      heading: geoPosition.coords.heading ?? undefined,
      speed: geoPosition.coords.speed ?? undefined,
      timestamp: geoPosition.timestamp
    };
  }

  /**
   * Check if geolocation is available
   */
  isAvailable(): boolean {
    return "geolocation" in navigator;
  }

  /**
   * Get current position
   */
  async getCurrentPosition(options: GeolocationOptions = {}): Promise<GeolocationPosition> {
    const defaultOptions: GeolocationOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    const mergedOptions = { ...defaultOptions, ...options };

    return new Promise((resolve, reject) => {
      if (!this.isAvailable()) {
        // Return cached position if available
        if (this.lastPosition) {
          logger.info("[Geolocation] Using cached position (geolocation unavailable)");
          resolve(this.lastPosition);
          return;
        }
        reject({ code: 2, message: "Geolocalização não disponível" });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = this.convertPosition(position);
          this.cachePosition(pos);
          logger.debug("[Geolocation] Position acquired:", {
            lat: pos.latitude.toFixed(6),
            lng: pos.longitude.toFixed(6),
            accuracy: pos.accuracy
          });
          resolve(pos);
        },
        (error) => {
          logger.error("[Geolocation] Error getting position:", error);
          // Try to return cached position on error
          if (this.lastPosition) {
            logger.info("[Geolocation] Using cached position due to error");
            resolve(this.lastPosition);
            return;
          }
          reject({
            code: error.code,
            message: GEOLOCATION_ERRORS[error.code] || error.message
          });
        },
        mergedOptions
      );
    });
  }

  /**
   * Watch position changes
   */
  watchPosition(
    onSuccess: GeolocationCallback,
    onError?: GeolocationErrorCallback,
    options: GeolocationWatchOptions = {}
  ): number {
    const defaultOptions: GeolocationWatchOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
      distanceFilter: 10 // 10 meters minimum
    };

    const mergedOptions = { ...defaultOptions, ...options };
    let lastReportedPosition: GeolocationPosition | null = null;

    if (!this.isAvailable()) {
      logger.error("[Geolocation] Geolocation not available");
      if (onError) {
        onError({ code: 2, message: "Geolocalização não disponível" });
      }
      return -1;
    }

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const pos = this.convertPosition(position);
        
        // Apply distance filter
        if (
          lastReportedPosition &&
          mergedOptions.distanceFilter &&
          this.calculateDistance(lastReportedPosition, pos) < mergedOptions.distanceFilter
        ) {
          return; // Skip update if distance is below threshold
        }

        lastReportedPosition = pos;
        this.cachePosition(pos);
        onSuccess(pos);
      },
      (error) => {
        logger.error("[Geolocation] Watch error:", error);
        if (onError) {
          onError({
            code: error.code,
            message: GEOLOCATION_ERRORS[error.code] || error.message
          });
        }
      },
      {
        enableHighAccuracy: mergedOptions.enableHighAccuracy,
        timeout: mergedOptions.timeout,
        maximumAge: mergedOptions.maximumAge
      }
    );

    logger.info("[Geolocation] Watch started:", this.watchId);
    return this.watchId;
  }

  /**
   * Stop watching position
   */
  clearWatch(watchId?: number): void {
    const id = watchId ?? this.watchId;
    if (id !== null && id !== -1) {
      navigator.geolocation.clearWatch(id);
      if (id === this.watchId) {
        this.watchId = null;
      }
      logger.info("[Geolocation] Watch cleared:", id);
    }
  }

  /**
   * Get last known position (from cache)
   */
  getLastKnownPosition(): GeolocationPosition | null {
    return this.lastPosition;
  }

  /**
   * Calculate distance between two points in meters (Haversine formula)
   */
  calculateDistance(pos1: GeolocationPosition, pos2: GeolocationPosition): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (pos1.latitude * Math.PI) / 180;
    const φ2 = (pos2.latitude * Math.PI) / 180;
    const Δφ = ((pos2.latitude - pos1.latitude) * Math.PI) / 180;
    const Δλ = ((pos2.longitude - pos1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  /**
   * Calculate bearing between two points in degrees
   */
  calculateBearing(from: GeolocationPosition, to: GeolocationPosition): number {
    const φ1 = (from.latitude * Math.PI) / 180;
    const φ2 = (to.latitude * Math.PI) / 180;
    const Δλ = ((to.longitude - from.longitude) * Math.PI) / 180;

    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    const θ = Math.atan2(y, x);

    return ((θ * 180) / Math.PI + 360) % 360; // Bearing in degrees
  }

  /**
   * Check if position is within a geofence
   */
  isWithinGeofence(
    position: GeolocationPosition,
    center: { latitude: number; longitude: number },
    radiusMeters: number
  ): boolean {
    const distance = this.calculateDistance(position, {
      ...center,
      accuracy: 0,
      timestamp: Date.now()
    });
    return distance <= radiusMeters;
  }

  /**
   * Request permission (for showing UI before actual request)
   */
  async requestPermission(): Promise<"granted" | "denied" | "prompt"> {
    if (!("permissions" in navigator)) {
      return "prompt";
    }

    try {
      const result = await navigator.permissions.query({ name: "geolocation" });
      return result.state as "granted" | "denied" | "prompt";
    } catch {
      return "prompt";
    }
  }
}

export const geolocationService = new GeolocationService();
export default geolocationService;
