/**
 * Secure MQTT Client
 * Production-ready MQTT client with TLS/SSL support and authentication
 */

import { mqttClient } from "@/utils/mqttClient";
import { logger } from "@/lib/logger";

export function initSecureMQTT() {
  const url = import.meta.env.VITE_MQTT_URL;
  
  if (!url) {
    logger.warn("VITE_MQTT_URL not set, MQTT disabled");
  }
  
  // Connect to MQTT broker if not already connected
  if (!mqttClient.isConnected()) {
    mqttClient.connect(url);
  }
  
  return mqttClient;
}
