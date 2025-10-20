/**
 * MQTTClient - MQTT Broker Integration
 * Bidirectional communication with PEO-DP backend
 * Phase Beta 3.1
 */

import mqtt, { MqttClient } from "mqtt";
import { BridgeLink } from "@/core/BridgeLink";

interface MQTTConfig {
  url: string;
  reconnectPeriod?: number;
  connectTimeout?: number;
}

export class MQTTClientClass {
  private client: MqttClient | null = null;
  private config: MQTTConfig | null = null;
  private isConnected = false;

  /**
   * Connect to MQTT broker
   * @param url MQTT broker URL (optional, defaults to env variable)
   */
  connect(url?: string): void {
    const mqttUrl = url || import.meta.env.VITE_MQTT_URL;

    if (!mqttUrl) {
      console.warn("📡 [MQTT] No MQTT URL configured. Skipping connection.");
      return;
    }

    if (this.client) {
      console.warn("📡 [MQTT] Already connected. Disconnecting first...");
      this.disconnect();
    }

    this.config = {
      url: mqttUrl,
      reconnectPeriod: 5000, // Auto-reconnect every 5 seconds
      connectTimeout: 10000, // 10 second timeout
    };

    console.log(`📡 [MQTT] Connecting to: ${mqttUrl}`);

    this.client = mqtt.connect(mqttUrl, {
      reconnectPeriod: this.config.reconnectPeriod,
      connectTimeout: this.config.connectTimeout,
    });

    this.setupEventHandlers();
  }

  /**
   * Setup MQTT event handlers
   */
  private setupEventHandlers(): void {
    if (!this.client) return;

    this.client.on("connect", () => {
      this.isConnected = true;
      console.log("📡 [MQTT] Connected to broker");

      // Subscribe to Nautilus events topic
      this.client?.subscribe("nautilus/events", (error) => {
        if (error) {
          console.error("📡 [MQTT] Subscription error:", error);
        } else {
          console.log("📡 [MQTT] Subscribed to: nautilus/events");
        }
      });

      // Emit connection event through BridgeLink
      BridgeLink.emit("mqtt:connected", {
        timestamp: new Date().toISOString(),
      });
    });

    this.client.on("disconnect", () => {
      this.isConnected = false;
      console.log("📡 [MQTT] Disconnected from broker");
      BridgeLink.emit("mqtt:disconnected", {
        timestamp: new Date().toISOString(),
      });
    });

    this.client.on("reconnect", () => {
      console.log("📡 [MQTT] Attempting to reconnect...");
      BridgeLink.emit("mqtt:reconnecting", {
        timestamp: new Date().toISOString(),
      });
    });

    this.client.on("error", (error) => {
      console.error("📡 [MQTT] Error:", error);
      BridgeLink.emit("mqtt:error", {
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    });

    this.client.on("message", (topic, message) => {
      const messageStr = message.toString();
      console.log(`📡 [MQTT] Message received on ${topic}:`, messageStr);

      // Parse and emit through BridgeLink
      try {
        const data = JSON.parse(messageStr);
        BridgeLink.emit("nautilus:event", {
          message: `[MQTT] ${messageStr}`,
          topic,
          data,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        // If not JSON, emit raw message
        BridgeLink.emit("nautilus:event", {
          message: `[MQTT] ${messageStr}`,
          topic,
          timestamp: new Date().toISOString(),
        });
      }
    });

    this.client.on("offline", () => {
      console.log("📡 [MQTT] Client is offline");
      BridgeLink.emit("mqtt:offline", {
        timestamp: new Date().toISOString(),
      });
    });
  }

  /**
   * Send event to MQTT broker
   * @param event Event topic
   * @param payload Event payload
   */
  send(event: string, payload: any): void {
    if (!this.client || !this.isConnected) {
      console.warn("📡 [MQTT] Not connected. Cannot send message.");
      return;
    }

    const message = JSON.stringify(payload);
    this.client.publish(event, message, (error) => {
      if (error) {
        console.error(`📡 [MQTT] Failed to publish to ${event}:`, error);
      } else {
        console.log(`📡 [MQTT] Published to ${event}:`, message);
      }
    });
  }

  /**
   * Subscribe to additional topics
   * @param topics Topic or array of topics
   */
  subscribe(topics: string | string[]): void {
    if (!this.client) {
      console.warn("📡 [MQTT] Not connected. Cannot subscribe.");
      return;
    }

    this.client.subscribe(topics, (error) => {
      if (error) {
        console.error("📡 [MQTT] Subscription error:", error);
      } else {
        console.log("📡 [MQTT] Subscribed to:", topics);
      }
    });
  }

  /**
   * Unsubscribe from topics
   * @param topics Topic or array of topics
   */
  unsubscribe(topics: string | string[]): void {
    if (!this.client) {
      console.warn("📡 [MQTT] Not connected. Cannot unsubscribe.");
      return;
    }

    this.client.unsubscribe(topics, (error) => {
      if (error) {
        console.error("📡 [MQTT] Unsubscribe error:", error);
      } else {
        console.log("📡 [MQTT] Unsubscribed from:", topics);
      }
    });
  }

  /**
   * Disconnect from MQTT broker
   */
  disconnect(): void {
    if (this.client) {
      this.client.end();
      this.client = null;
      this.isConnected = false;
      console.log("📡 [MQTT] Disconnected");
    }
  }

  /**
   * Check if connected
   */
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  /**
   * Get MQTT client instance (for advanced usage)
   */
  getClient(): MqttClient | null {
    return this.client;
  }
}

// Singleton instance
export const MQTTClient = new MQTTClientClass();
