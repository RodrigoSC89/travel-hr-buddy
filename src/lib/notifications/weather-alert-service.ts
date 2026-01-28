/**
 * Weather Alert Service
 * Monitors weather conditions and triggers push notifications when limits are exceeded
 */

import { supabase } from "@/integrations/supabase/client";
import { sendNotification, AlertNotification, getNotificationPreferences } from "./push-notification-service";
import * as Sentry from "@sentry/react";
import { logger } from "@/lib/logger";

// ===============================
// Types & Configuration
// ===============================

export interface WeatherThresholds {
  windSpeedWarning: number; // knots
  windSpeedCritical: number; // knots
  waveHeightWarning: number; // meters
  waveHeightCritical: number; // meters
  pressureLow: number; // hPa
  visibilityWarning: number; // km
}

export interface WeatherAlertConfig {
  vesselId?: string;
  vesselName?: string;
  latitude: number;
  longitude: number;
  thresholds: WeatherThresholds;
  checkInterval?: number; // ms
}

export interface WeatherAlert {
  id: string;
  type: "wind" | "waves" | "pressure" | "visibility" | "storm";
  severity: "warning" | "critical";
  title: string;
  message: string;
  value: number;
  threshold: number;
  unit: string;
  timestamp: Date;
  coordinates: { lat: number; lon: number };
}

// Default thresholds based on maritime safety standards
export const DEFAULT_THRESHOLDS: WeatherThresholds = {
  windSpeedWarning: 25, // 25 knots = Beaufort 6
  windSpeedCritical: 40, // 40 knots = Beaufort 8 (Gale)
  waveHeightWarning: 3, // 3 meters = rough sea
  waveHeightCritical: 6, // 6 meters = very rough sea
  pressureLow: 1000, // hPa, indicates approaching storm
  visibilityWarning: 2, // 2 km = poor visibility
};

const STORAGE_KEY = "nautilus_weather_alerts_config";
const ALERT_COOLDOWN = 15 * 60 * 1000; // 15 minutes between same alerts
const lastAlerts = new Map<string, number>(); // alertType -> timestamp

// ===============================
// Alert Storage & Configuration
// ===============================

export function getWeatherAlertConfig(): Partial<WeatherAlertConfig> {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return { thresholds: DEFAULT_THRESHOLDS };
}

export function saveWeatherAlertConfig(config: Partial<WeatherAlertConfig>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

// ===============================
// Alert Checking Logic
// ===============================

/**
 * Check if alert cooldown has passed
 */
function canSendAlert(alertType: string): boolean {
  const lastSent = lastAlerts.get(alertType);
  if (!lastSent) return true;
  return Date.now() - lastSent > ALERT_COOLDOWN;
}

/**
 * Mark alert as sent
 */
function markAlertSent(alertType: string): void {
  lastAlerts.set(alertType, Date.now());
}

/**
 * Check weather conditions against thresholds
 */
export function checkWeatherConditions(
  weatherData: {
    windSpeed?: number; // knots
    windSpeedMs?: number; // m/s (will be converted)
    waveHeight?: number;
    pressure?: number;
    visibility?: number; // km
  },
  thresholds: WeatherThresholds = DEFAULT_THRESHOLDS
): WeatherAlert[] {
  const alerts: WeatherAlert[] = [];
  const now = new Date();

  // Convert m/s to knots if needed
  const windSpeedKnots = weatherData.windSpeed ?? (weatherData.windSpeedMs ? weatherData.windSpeedMs * 1.944 : 0);

  // Check wind speed
  if (windSpeedKnots >= thresholds.windSpeedCritical) {
    alerts.push({
      id: `wind-critical-${now.getTime()}`,
      type: "wind",
      severity: "critical",
      title: "🚨 Ventos Extremos",
      message: `Velocidade do vento: ${windSpeedKnots.toFixed(0)} nós (Beaufort ${getBeaufortScale(windSpeedKnots)})`,
      value: windSpeedKnots,
      threshold: thresholds.windSpeedCritical,
      unit: "nós",
      timestamp: now,
      coordinates: { lat: 0, lon: 0 },
    });
  } else if (windSpeedKnots >= thresholds.windSpeedWarning) {
    alerts.push({
      id: `wind-warning-${now.getTime()}`,
      type: "wind",
      severity: "warning",
      title: "⚠️ Ventos Fortes",
      message: `Velocidade do vento: ${windSpeedKnots.toFixed(0)} nós (Beaufort ${getBeaufortScale(windSpeedKnots)})`,
      value: windSpeedKnots,
      threshold: thresholds.windSpeedWarning,
      unit: "nós",
      timestamp: now,
      coordinates: { lat: 0, lon: 0 },
    });
  }

  // Check wave height
  if (weatherData.waveHeight !== undefined) {
    if (weatherData.waveHeight >= thresholds.waveHeightCritical) {
      alerts.push({
        id: `waves-critical-${now.getTime()}`,
        type: "waves",
        severity: "critical",
        title: "🚨 Mar Muito Agitado",
        message: `Altura das ondas: ${weatherData.waveHeight.toFixed(1)} metros - Risco elevado`,
        value: weatherData.waveHeight,
        threshold: thresholds.waveHeightCritical,
        unit: "m",
        timestamp: now,
        coordinates: { lat: 0, lon: 0 },
      });
    } else if (weatherData.waveHeight >= thresholds.waveHeightWarning) {
      alerts.push({
        id: `waves-warning-${now.getTime()}`,
        type: "waves",
        severity: "warning",
        title: "⚠️ Mar Agitado",
        message: `Altura das ondas: ${weatherData.waveHeight.toFixed(1)} metros`,
        value: weatherData.waveHeight,
        threshold: thresholds.waveHeightWarning,
        unit: "m",
        timestamp: now,
        coordinates: { lat: 0, lon: 0 },
      });
    }
  }

  // Check low pressure (storm indicator)
  if (weatherData.pressure !== undefined && weatherData.pressure < thresholds.pressureLow) {
    alerts.push({
      id: `pressure-warning-${now.getTime()}`,
      type: "pressure",
      severity: "warning",
      title: "⚠️ Baixa Pressão Atmosférica",
      message: `Pressão: ${weatherData.pressure.toFixed(0)} hPa - Possível tempestade se aproximando`,
      value: weatherData.pressure,
      threshold: thresholds.pressureLow,
      unit: "hPa",
      timestamp: now,
      coordinates: { lat: 0, lon: 0 },
    });
  }

  // Check visibility
  if (weatherData.visibility !== undefined && weatherData.visibility < thresholds.visibilityWarning) {
    alerts.push({
      id: `visibility-warning-${now.getTime()}`,
      type: "visibility",
      severity: "warning",
      title: "⚠️ Visibilidade Reduzida",
      message: `Visibilidade: ${weatherData.visibility.toFixed(1)} km`,
      value: weatherData.visibility,
      threshold: thresholds.visibilityWarning,
      unit: "km",
      timestamp: now,
      coordinates: { lat: 0, lon: 0 },
    });
  }

  // Check for combined severe conditions (storm warning)
  if (
    windSpeedKnots >= thresholds.windSpeedWarning &&
    weatherData.waveHeight !== undefined &&
    weatherData.waveHeight >= thresholds.waveHeightWarning &&
    weatherData.pressure !== undefined &&
    weatherData.pressure < thresholds.pressureLow
  ) {
    alerts.push({
      id: `storm-critical-${now.getTime()}`,
      type: "storm",
      severity: "critical",
      title: "🌀 ALERTA DE TEMPESTADE",
      message: "Condições combinadas indicam tempestade iminente. Recomenda-se buscar abrigo.",
      value: 0,
      threshold: 0,
      unit: "",
      timestamp: now,
      coordinates: { lat: 0, lon: 0 },
    });
  }

  return alerts;
}

/**
 * Get Beaufort scale from wind speed in knots
 */
function getBeaufortScale(knots: number): number {
  if (knots < 1) return 0;
  if (knots < 4) return 1;
  if (knots < 7) return 2;
  if (knots < 11) return 3;
  if (knots < 17) return 4;
  if (knots < 22) return 5;
  if (knots < 28) return 6;
  if (knots < 34) return 7;
  if (knots < 41) return 8;
  if (knots < 48) return 9;
  if (knots < 56) return 10;
  if (knots < 64) return 11;
  return 12;
}

// ===============================
// Push Notification Integration
// ===============================

/**
 * Process alerts and send push notifications
 */
export function processAndNotifyAlerts(alerts: WeatherAlert[]): void {
  const prefs = getNotificationPreferences();
  if (!prefs.enabled) return;

  for (const alert of alerts) {
    const alertKey = `${alert.type}-${alert.severity}`;
    
    if (!canSendAlert(alertKey)) {
      logger.debug(`[WeatherAlert] Skipping ${alertKey} - cooldown active`);
      continue;
    }

    const notification: AlertNotification = {
      title: alert.title,
      body: alert.message,
      level: alert.severity === "critical" ? "critical" : "warning",
      data: {
        type: alert.type,
        value: alert.value,
        threshold: alert.threshold,
        unit: alert.unit,
        coordinates: alert.coordinates,
      },
    };

    sendNotification(notification);
    markAlertSent(alertKey);

    // Track in analytics
    try {
      const posthog = (window as any).posthog;
      if (posthog?.capture) {
        posthog.capture("weather_alert_sent", {
          type: alert.type,
          severity: alert.severity,
          value: alert.value,
          threshold: alert.threshold,
        });
      }
    } catch {
      // PostHog not available
    }

    logger.debug(`[WeatherAlert] Notification sent: ${alert.title}`);
  }
}

// ===============================
// Backend Notification (Slack/Discord)
// ===============================

/**
 * Send weather alert to backend notification channels
 */
export async function sendWeatherAlertToBackend(
  alerts: WeatherAlert[],
  vesselInfo?: { id: string; name: string; coordinates: { lat: number; lon: number } }
): Promise<void> {
  if (alerts.length === 0) return;

  try {
    const criticalAlerts = alerts.filter((a) => a.severity === "critical");
    const hasStorm = alerts.some((a) => a.type === "storm");

    // Only send to backend for critical alerts or storm warnings
    if (criticalAlerts.length === 0 && !hasStorm) return;

    const message = alerts
      .map((a) => `${a.title}: ${a.message}`)
      .join("\n");

    const { error } = await supabase.functions.invoke("notify-slack", {
      body: {
        message: `🌊 Weather Alert${vesselInfo ? ` - ${vesselInfo.name}` : ""}\n\n${message}`,
        severity: hasStorm ? "critical" : "warning",
        channel: "weather-alerts",
        metadata: {
          vesselId: vesselInfo?.id,
          vesselName: vesselInfo?.name,
          coordinates: vesselInfo?.coordinates,
          alerts: alerts.map((a) => ({
            type: a.type,
            severity: a.severity,
            value: a.value,
            threshold: a.threshold,
          })),
        },
      },
    });

    if (error) {
      console.error("[WeatherAlert] Failed to send to backend:", error);
      Sentry.captureException(error, {
        tags: { component: "weather-alert-service" },
      });
    }
  } catch (err) {
    console.error("[WeatherAlert] Backend notification error:", err);
  }
}

// ===============================
// Database Storage
// ===============================

/**
 * Store weather alert in database for historical tracking
 */
export async function storeWeatherAlert(
  alert: WeatherAlert,
  vesselId?: string
): Promise<void> {
  try {
    await supabase.from("real_time_notifications").insert({
      type: "weather_alert",
      title: alert.title,
      message: alert.message,
      priority: alert.severity === "critical" ? "critical" : "high",
      metadata: {
        alertType: alert.type,
        value: alert.value,
        threshold: alert.threshold,
        unit: alert.unit,
        coordinates: alert.coordinates,
        vesselId,
      },
    });
  } catch (err) {
    console.error("[WeatherAlert] Failed to store alert:", err);
  }
}

// ===============================
// Monitoring Service
// ===============================

let monitoringInterval: NodeJS.Timeout | null = null;

/**
 * Start continuous weather monitoring
 */
export function startWeatherMonitoring(
  config: WeatherAlertConfig,
  fetchWeatherFn: (lat: number, lon: number) => Promise<{
    windSpeed?: number;
    windSpeedMs?: number;
    waveHeight?: number;
    pressure?: number;
    visibility?: number;
  }>
): void {
  if (monitoringInterval) {
    stopWeatherMonitoring();
  }

  const checkInterval = config.checkInterval ?? 5 * 60 * 1000; // 5 minutes default

  const check = async () => {
    try {
      logger.debug("[WeatherMonitor] Checking conditions...");
      
      const weatherData = await fetchWeatherFn(config.latitude, config.longitude);
      const alerts = checkWeatherConditions(weatherData, config.thresholds);

      if (alerts.length > 0) {
        logger.debug(`[WeatherMonitor] ${alerts.length} alerts detected`);
        
        // Send push notifications
        processAndNotifyAlerts(alerts);

        // Send to backend (Slack/Discord)
        await sendWeatherAlertToBackend(alerts, {
          id: config.vesselId ?? "unknown",
          name: config.vesselName ?? "Vessel",
          coordinates: { lat: config.latitude, lon: config.longitude },
        });

        // Store in database
        for (const alert of alerts) {
          await storeWeatherAlert(alert, config.vesselId);
        }
      }
    } catch (err) {
      logger.error("[WeatherMonitor] Check failed", err);
    }
  };

  // Initial check
  check();

  // Start interval
  monitoringInterval = setInterval(check, checkInterval);
  logger.debug(`[WeatherMonitor] Started with ${checkInterval / 1000}s interval`);
}

/**
 * Stop weather monitoring
 */
export function stopWeatherMonitoring(): void {
  if (monitoringInterval) {
    clearInterval(monitoringInterval);
    monitoringInterval = null;
    logger.debug("[WeatherMonitor] Stopped");
  }
}

/**
 * Check if monitoring is active
 */
export function isMonitoringActive(): boolean {
  return monitoringInterval !== null;
}

export default {
  checkWeatherConditions,
  processAndNotifyAlerts,
  sendWeatherAlertToBackend,
  storeWeatherAlert,
  startWeatherMonitoring,
  stopWeatherMonitoring,
  isMonitoringActive,
  DEFAULT_THRESHOLDS,
  getWeatherAlertConfig,
  saveWeatherAlertConfig,
};
