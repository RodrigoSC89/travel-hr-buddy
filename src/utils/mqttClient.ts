/**
 * MQTT Client
 * Communication backbone for BridgeLink v2
 * Provides intelligent event messaging with offline support
 */

import mqtt, { MqttClient } from "mqtt";
import { logger } from "@/lib/logger";

class MQTTClientManager {
  private client: MqttClient | null = null;
  private subscriptions: Map<string, Array<(msg: string) => void>> = new Map();
  private connected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  /**
   * Connect to MQTT broker with TLS support
   */
  connect(brokerUrl = "wss://broker.hivemq.com:8884/mqtt"): void {
    if (this.client) {
      logger.info("ℹ️ MQTT client already connected");
      return;
    }

    try {
      this.client = mqtt.connect(brokerUrl, {
        clean: true,
        connectTimeout: 4000,
        reconnectPeriod: 1000,
      });

      this.client.on("connect", () => {
        logger.info("✅ MQTT client connected");
        this.connected = true;
        this.reconnectAttempts = 0;
        this.resubscribeAll();
      });

      this.client.on("error", (error) => {
        this.connected = false;
      });

      this.client.on("offline", () => {
        this.connected = false;
      });

      this.client.on("reconnect", () => {
        this.reconnectAttempts++;
        logger.info(`🔄 MQTT reconnecting... (attempt ${this.reconnectAttempts})`);
        
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          this.disconnect();
        }
      });

      this.client.on("message", (topic, message) => {
        const handlers = this.subscriptions.get(topic);
        if (handlers) {
          const msgString = message.toString();
          handlers.forEach((handler) => handler(msgString));
        }
      });
    } catch (error) {
      console.error("❌ Failed to create MQTT client:", error);
      console.error("❌ Failed to create MQTT client:", error);
    }
  }

  /**
   * Subscribe to a topic with callback handler
   */
  subscribe(topic: string, callback: (msg: string) => void): void {
    if (!this.client) {
      this.connect();
    }

    if (!this.subscriptions.has(topic)) {
      this.subscriptions.set(topic, []);
    }

    this.subscriptions.get(topic)?.push(callback);

    if (this.connected && this.client) {
      this.client.subscribe(topic, (err) => {
        if (err) {
        } else {
          logger.info(`✅ Subscribed to ${topic}`);
        }
      });
    }
  }

  /**
   * Unsubscribe from a topic
   */
  unsubscribe(topic: string): void {
    if (this.client && this.connected) {
      this.client.unsubscribe(topic, (err) => {
        if (err) {
        }
      });
    }
    this.subscriptions.delete(topic);
  }

  /**
   * Publish a message to a topic
   */
  publish(topic: string, message: string, options = { qos: 0 as const }): void {
    if (!this.client) {
      return;
    }

    this.client.publish(topic, message, options, (err) => {
      if (err) {
      }
    });
  }

  /**
   * Resubscribe to all topics after reconnection
   */
  private resubscribeAll(): void {
    if (!this.client) return;

    this.subscriptions.forEach((_, topic) => {
      this.client?.subscribe(topic, (err) => {
        if (err) {
        }
      });
    });
  }

  /**
   * Disconnect from MQTT broker
   */
  disconnect(): void {
    if (this.client) {
      this.client.end(true);
      this.client = null;
      this.connected = false;
      logger.info("🔌 MQTT client disconnected");
    }
  }

  /**
   * Check if client is connected
   */
  isConnected(): boolean {
    return this.connected;
  }
}

export const mqttClient = new MQTTClientManager();
