/**
 * Secure MQTT Client
 * Wrapper around the existing MQTT client for secure communication
 */

import { mqttClient } from "@/utils/mqttClient";

/**
 * Initialize secure MQTT client
 * Returns the singleton instance of the MQTT client manager
 */
export function initSecureMQTT() {
  // Connect to the MQTT broker if not already connected
  if (!mqttClient.isConnected()) {
    mqttClient.connect();
  }
  
  return mqttClient;
}
