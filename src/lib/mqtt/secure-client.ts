/**
 * Secure MQTT Client
 * Production-ready MQTT client with TLS/SSL support and authentication
 */

import { mqttClient } from "@/utils/mqttClient";
import { logger } from "@/lib/logger";

export function initSecureMQTT() {
  const safeEnv = (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {}) as Record<string, string | undefined>;
  const url = safeEnv.VITE_MQTT_URL || "";
  
  if (!url) {
    logger.warn("VITE_MQTT_URL not set, MQTT disabled");
    return mqttClient;
  }
  
  // Connect to MQTT broker if not already connected
  if (!mqttClient.isConnected()) {
    mqttClient.connect(url);
  }
  
  return mqttClient;
}
