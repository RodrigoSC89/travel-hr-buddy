/**
 * MQTT Publisher Helper
 * Utility for publishing events to MQTT broker
 */

import { MQTTClient } from "@/core/MQTTClient";

export const publishEvent = (topic: string, payload: unknown) => {
  try {
    // Ensure MQTT is connected
    if (!MQTTClient.isConnected()) {
      console.warn("📡 [MQTT Publisher] Cliente não conectado. Tentando conectar...");
      const mqttUrl = import.meta.env.VITE_MQTT_URL;
      if (mqttUrl) {
        MQTTClient.connect({ url: mqttUrl });
      }
    }

    // Publish the event
    MQTTClient.send(topic, payload);
    console.log("📡 [MQTT Publisher] Evento publicado em", topic, ":", payload);
  } catch (error) {
    console.error("📡 [MQTT Publisher] Erro ao publicar evento:", error);
  }
};
