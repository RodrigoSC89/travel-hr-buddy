/**
 * Browser Push Notification Service
 * Handles critical IoT sensor alerts via browser notifications
 */

import { logger } from '@/lib/logger';

export interface NotificationPreferences {
  enabled: boolean;
  criticalAlerts: boolean;
  warningAlerts: boolean;
  infoAlerts: boolean;
}

const STORAGE_KEY = "nautilus_notification_prefs";

export function getNotificationPreferences(): NotificationPreferences {
  const stored = sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return {
    enabled: false,
    criticalAlerts: true,
    warningAlerts: true,
    infoAlerts: false,
  };
}

export function saveNotificationPreferences(prefs: NotificationPreferences): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) {
    logger.warn("Browser does not support notifications");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
}

export function isNotificationSupported(): boolean {
  return "Notification" in window;
}

export function getNotificationPermission(): NotificationPermission | "unsupported" {
  if (!isNotificationSupported()) return "unsupported";
  return Notification.permission;
}

export interface AlertNotification {
  title: string;
  body: string;
  level: "critical" | "warning" | "info";
  data?: Record<string, unknown>;
}

export function sendNotification(alert: AlertNotification): void {
  const prefs = getNotificationPreferences();
  
  if (!prefs.enabled) return;
  if (Notification.permission !== "granted") return;
  
  // Check level preferences
  if (alert.level === "critical" && !prefs.criticalAlerts) return;
  if (alert.level === "warning" && !prefs.warningAlerts) return;
  if (alert.level === "info" && !prefs.infoAlerts) return;

  const icon = alert.level === "critical" 
    ? "🚨" 
    : alert.level === "warning" 
    ? "⚠️" 
    : "ℹ️";

  const notification = new Notification(`${icon} ${alert.title}`, {
    body: alert.body,
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    tag: `nautilus-${alert.level}-${Date.now()}`,
    requireInteraction: alert.level === "critical",
  });

  notification.onclick = () => {
    window.focus();
    notification.close();
  };

  // Auto-close non-critical after 10 seconds
  if (alert.level !== "critical") {
    setTimeout(() => notification.close(), 10000);
  }
}

export function sendCriticalIoTAlert(
  sensorType: string,
  value: number,
  vesselName?: string
): void {
  sendNotification({
    title: "Alerta Crítico IoT",
    body: `Sensor ${sensorType}${vesselName ? ` em ${vesselName}` : ""} detectou valor anormal: ${value}`,
    level: "critical",
    data: { sensorType, value, vesselName },
  });
}

export function sendWarningIoTAlert(
  sensorType: string,
  message: string
): void {
  sendNotification({
    title: "Aviso IoT",
    body: message,
    level: "warning",
    data: { sensorType },
  });
}
