// @ts-nocheck
/**
 * PATCH 461 - Sensors Hub MQTT/Realtime Integration
 * Integrates MQTT and Supabase Realtime for external sensor data
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import { sensorStream, type SensorData } from "../sensorStream";
import type { RealtimeChannel } from "@supabase/supabase-js";

class SensorRealtimeService {
  private realtimeChannel: RealtimeChannel | null = null;
  private mqttClient: any = null;
  private isConnected = false;

  /**
   * Initialize Supabase Realtime connection for sensor data
   */
  async initializeRealtime(): Promise<void> {
    try {
      // Subscribe to sensor_data_normalized table changes
      this.realtimeChannel = supabase
        .channel("sensor-data-realtime")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "sensor_data_normalized",
          },
          (payload) => {
            this.handleRealtimeInsert(payload.new);
          }
        )
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            logger.info("✅ Supabase Realtime connected for sensors");
            this.isConnected = true;
          } else if (status === "CHANNEL_ERROR") {
            logger.error("❌ Supabase Realtime channel error");
            this.isConnected = false;
          }
        });

      // Also subscribe to sensor alerts
      supabase
        .channel("sensor-alerts-realtime")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "sensor_alerts",
          },
          (payload) => {
            this.handleAlertInsert(payload.new);
          }
        )
        .subscribe();

      logger.info("Supabase Realtime initialized for Sensors Hub");
    } catch (error) {
      logger.error("Failed to initialize Supabase Realtime", error);
      throw error;
    }
  }

  /**
   * Initialize MQTT connection for sensor data
   */
  async initializeMQTT(brokerUrl?: string): Promise<void> {
    try {
      // Dynamically import MQTT client to avoid SSR issues
      const { default: mqtt } = await import("mqtt");
      
      const url = brokerUrl || "wss://broker.hivemq.com:8884/mqtt";
      
      this.mqttClient = mqtt.connect(url, {
        clean: true,
        connectTimeout: 4000,
        reconnectPeriod: 1000,
      });

      this.mqttClient.on("connect", () => {
        logger.info("✅ MQTT connected for Sensors Hub");
        this.isConnected = true;

        // Subscribe to sensor topics
        const topics = [
          "sensors/temperature/#",
          "sensors/pressure/#",
          "sensors/vibration/#",
          "sensors/depth/#",
          "sensors/motion/#",
        ];

        topics.forEach((topic) => {
          this.mqttClient?.subscribe(topic, (err: any) => {
            if (err) {
              logger.error(`Failed to subscribe to ${topic}`, err);
            } else {
              logger.debug(`Subscribed to MQTT topic: ${topic}`);
            }
          });
        });
      });

      this.mqttClient.on("message", (topic: string, message: Buffer) => {
        this.handleMQTTMessage(topic, message);
      });

      this.mqttClient.on("error", (error: Error) => {
        logger.error("MQTT connection error", error);
        this.isConnected = false;
      });

      this.mqttClient.on("offline", () => {
        logger.warn("MQTT client offline");
        this.isConnected = false;
      });

      logger.info("MQTT initialized for Sensors Hub");
    } catch (error) {
      logger.error("Failed to initialize MQTT", error);
      throw error;
    }
  }

  /**
   * Handle Supabase Realtime insert
   */
  private handleRealtimeInsert(data: any): void {
    try {
      const sensorData: SensorData = {
        sensorId: data.sensor_id,
        type: data.sensor_type,
        value: data.value,
        unit: data.unit,
        timestamp: new Date(data.timestamp),
        location: data.location,
      };

      // Add to local stream for visualization
      sensorStream.addReading(sensorData);

      logger.debug("Realtime sensor data received", { sensorId: data.sensor_id });
    } catch (error) {
      logger.error("Error handling realtime insert", error);
    }
  }

  /**
   * Handle new alert from Supabase
   */
  private handleAlertInsert(alert: any): void {
    try {
      logger.info("New sensor alert received", {
        sensorId: alert.sensor_id,
        severity: alert.severity,
        message: alert.message,
      });

      // Emit custom event for UI to handle
      window.dispatchEvent(
        new CustomEvent("sensor-alert", {
          detail: alert,
        })
      );
    } catch (error) {
      logger.error("Error handling alert insert", error);
    }
  }

  /**
   * Handle MQTT message
   */
  private handleMQTTMessage(topic: string, message: Buffer): void {
    try {
      const payload = JSON.parse(message.toString());
      
      // Extract sensor type from topic (e.g., "sensors/temperature/sensor1" -> "temperature")
      const topicParts = topic.split("/");
      const sensorType = topicParts[1];
      const sensorId = topicParts[2] || `mqtt-${sensorType}-${Date.now()}`;

      const sensorData: SensorData = {
        sensorId,
        type: sensorType,
        value: payload.value || payload.reading || 0,
        unit: payload.unit || this.getDefaultUnit(sensorType),
        timestamp: new Date(payload.timestamp || Date.now()),
        location: payload.location,
      };

      // Add to local stream
      sensorStream.addReading(sensorData);

      logger.debug("MQTT sensor data received", { topic, sensorId });
    } catch (error) {
      logger.error("Error handling MQTT message", { topic, error });
    }
  }

  /**
   * Get default unit for sensor type
   */
  private getDefaultUnit(sensorType: string): string {
    const units: Record<string, string> = {
      temperature: "°C",
      pressure: "bar",
      vibration: "Hz",
      depth: "m",
      motion: "m/s",
    };
    return units[sensorType] || "unit";
  }

  /**
   * Publish sensor data via MQTT
   */
  publishSensorData(topic: string, data: any): void {
    if (!this.mqttClient || !this.isConnected) {
      logger.warn("MQTT not connected, cannot publish");
      return;
    }

    try {
      this.mqttClient.publish(topic, JSON.stringify(data), { qos: 1 }, (err: any) => {
        if (err) {
          logger.error("Failed to publish MQTT message", err);
        } else {
          logger.debug("MQTT message published", { topic });
        }
      });
    } catch (error) {
      logger.error("Error publishing MQTT message", error);
    }
  }

  /**
   * Check if service is connected
   */
  isServiceConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Disconnect all connections
   */
  disconnect(): void {
    try {
      if (this.realtimeChannel) {
        this.realtimeChannel.unsubscribe();
        this.realtimeChannel = null;
      }

      if (this.mqttClient) {
        this.mqttClient.end();
        this.mqttClient = null;
      }

      this.isConnected = false;
      logger.info("Sensor realtime connections closed");
    } catch (error) {
      logger.error("Error disconnecting sensor realtime", error);
    }
  }
}

// Singleton instance
export const sensorRealtimeService = new SensorRealtimeService();
