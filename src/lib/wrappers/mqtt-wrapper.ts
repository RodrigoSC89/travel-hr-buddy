/**
 * PATCH 548 - MQTT Wrapper
 * Type-safe wrapper for MQTT client operations
 */

import type { 
  MQTTConfig, 
  MQTTClient, 
  MQTTMessage,
  MQTTSubscription 
} from "@/types/ai-core";
import { logger } from "@/lib/logger";

class MQTTClientWrapper implements MQTTClient {
  private client: unknown = null;
  private connected = false;
  private subscriptions = new Map<string, MQTTSubscription>();

  constructor(private config: MQTTConfig) {}

  async connect(): Promise<void> {
    try {
      // Dynamic import to handle MQTT client
      const mqtt = await import("mqtt");
      const url = `${this.config.protocol}://${this.config.host}:${this.config.port}`;
      
      this.client = mqtt.connect(url, {
        clientId: this.config.clientId,
        username: this.config.username,
        password: this.config.password,
        keepalive: this.config.keepalive ?? 60,
        reconnectPeriod: this.config.reconnectPeriod ?? 1000,
        connectTimeout: this.config.connectTimeout ?? 30000,
        clean: this.config.clean ?? true,
      });

      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("MQTT connection timeout"));
        }, this.config.connectTimeout ?? 30000);

        (this.client as any).on("connect", () => {
          clearTimeout(timeout);
          this.connected = true;
          logger.info("[MQTT] Connected successfully");
          resolve();
        });

        (this.client as any).on("error", (error: Error) => {
          clearTimeout(timeout);
          logger.error("[MQTT] Connection error:", error);
          reject(error);
        });
      });
    } catch (error) {
      logger.error("[MQTT] Failed to initialize client:", error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (!this.client) return;

    return new Promise((resolve) => {
      (this.client as any).end(false, () => {
        this.connected = false;
        this.subscriptions.clear();
        logger.info("[MQTT] Disconnected");
        resolve();
      });
    });
  }

  async subscribe(topic: string, qos: 0 | 1 | 2 = 0): Promise<void> {
    if (!this.connected || !this.client) {
      throw new Error("MQTT client not connected");
    }

    return new Promise((resolve, reject) => {
      (this.client as any).subscribe(topic, { qos }, (error: Error | null) => {
        if (error) {
          logger.error(`[MQTT] Subscribe error for topic ${topic}:`, error);
          reject(error);
        } else {
          logger.info(`[MQTT] Subscribed to topic: ${topic}`);
          resolve();
        }
      });
    });
  }

  async unsubscribe(topic: string): Promise<void> {
    if (!this.connected || !this.client) {
      throw new Error("MQTT client not connected");
    }

    return new Promise((resolve, reject) => {
      (this.client as any).unsubscribe(topic, (error: Error | null) => {
        if (error) {
          logger.error(`[MQTT] Unsubscribe error for topic ${topic}:`, error);
          reject(error);
        } else {
          this.subscriptions.delete(topic);
          logger.info(`[MQTT] Unsubscribed from topic: ${topic}`);
          resolve();
        }
      });
    });
  }

  async publish(topic: string, payload: string | Buffer, qos: 0 | 1 | 2 = 0): Promise<void> {
    if (!this.connected || !this.client) {
      throw new Error("MQTT client not connected");
    }

    return new Promise((resolve, reject) => {
      (this.client as any).publish(topic, payload, { qos }, (error?: Error) => {
        if (error) {
          logger.error(`[MQTT] Publish error for topic ${topic}:`, error);
          reject(error);
        } else {
          logger.debug(`[MQTT] Published to topic: ${topic}`);
          resolve();
        }
      });
    });
  }

  on(event: string, callback: (...args: unknown[]) => void): void {
    if (!this.client) {
      throw new Error("MQTT client not initialized");
    }
    (this.client as any).on(event, callback);
  }

  isConnected(): boolean {
    return this.connected;
  }
}

/**
 * Factory function to create MQTT client instance
 */
export function createMQTTClient(config: MQTTConfig): MQTTClient {
  return new MQTTClientWrapper(config);
}
