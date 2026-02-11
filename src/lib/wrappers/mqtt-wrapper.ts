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

/** Internal MQTT client interface matching mqtt.js API */
interface MqttClientInstance {
  on(event: string, callback: (...args: unknown[]) => void): void;
  end(force: boolean, callback: () => void): void;
  subscribe(topic: string, opts: { qos: number }, callback: (error: Error | null) => void): void;
  unsubscribe(topic: string, callback: (error: Error | null) => void): void;
  publish(topic: string, payload: string | Buffer, opts: { qos: number }, callback: (error?: Error) => void): void;
}

class MQTTClientWrapper implements MQTTClient {
  private client: MqttClientInstance | null = null;
  private connected = false;
  private subscriptions = new Map<string, MQTTSubscription>();

  constructor(private config: MQTTConfig) {}

  private getClient(): MqttClientInstance {
    if (!this.client) throw new Error("MQTT client not initialized");
    return this.client;
  }

  async connect(): Promise<void> {
    try {
      const mqtt = await import("mqtt");
      const url = `${this.config.protocol}://${this.config.host}:${this.config.port}`;
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- mqtt.connect returns MqttClient which matches our interface
      this.client = mqtt.connect(url, {
        clientId: this.config.clientId,
        username: this.config.username,
        password: this.config.password,
        keepalive: this.config.keepalive ?? 60,
        reconnectPeriod: this.config.reconnectPeriod ?? 1000,
        connectTimeout: this.config.connectTimeout ?? 30000,
        clean: this.config.clean ?? true,
      }) as unknown as MqttClientInstance;

      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("MQTT connection timeout"));
        }, this.config.connectTimeout ?? 30000);

        this.getClient().on("connect", () => {
          clearTimeout(timeout);
          this.connected = true;
          logger.info("[MQTT] Connected successfully");
          resolve();
        });

        this.getClient().on("error", (error: unknown) => {
          clearTimeout(timeout);
          logger.error("[MQTT] Connection error:", error);
          reject(error instanceof Error ? error : new Error(String(error)));
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
      this.getClient().end(false, () => {
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
      this.getClient().subscribe(topic, { qos }, (error: Error | null) => {
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
      this.getClient().unsubscribe(topic, (error: Error | null) => {
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
      this.getClient().publish(topic, payload, { qos }, (error?: Error) => {
        if (error) {
          logger.error(`[MQTT] Publish error for topic ${topic}:`, error);
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  on(event: string, callback: (...args: unknown[]) => void): void {
    this.getClient().on(event, callback);
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
