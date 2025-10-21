/**
 * Secure MQTT Client
 * 
 * Enhanced MQTT client with TLS/SSL support and username/password authentication
 * for production deployments. Automatically uses secure protocols (wss:// or mqtts://)
 * when credentials are provided.
 * 
 * @module SecureMQTTClient
 * @version 1.0.0 (Nautilus v3.5)
 */

import mqtt, { MqttClient } from "mqtt";

interface SecureMQTTConfig {
  url?: string;
  username?: string;
  password?: string;
  clean?: boolean;
  reconnectPeriod?: number;
  connectTimeout?: number;
}

class SecureMQTTClientManager {
  private client: MqttClient | null = null;
  private subscriptions: Map<string, Array<(msg: string) => void>> = new Map();
  private connected = false;
  private config: SecureMQTTConfig = {};

  /**
   * Initialize secure MQTT connection with TLS/SSL and authentication
   * 
   * @param config - Optional configuration overrides
   * @returns MQTT client instance
   */
  connect(config?: SecureMQTTConfig): MqttClient | null {
    if (this.client && this.connected) {
      console.log("ℹ️ Secure MQTT client already connected");
      return this.client;
    }

    // Load configuration from environment variables
    const url = config?.url || import.meta.env.VITE_MQTT_URL || "wss://broker.hivemq.com:8884/mqtt";
    const username = config?.username || import.meta.env.VITE_MQTT_USER;
    const password = config?.password || import.meta.env.VITE_MQTT_PASS;

    // Validate secure connection in production
    if (import.meta.env.VITE_NODE_ENV === "production" && !url.startsWith("wss://") && !url.startsWith("mqtts://")) {
      console.warn("⚠️ Production environment detected with unencrypted MQTT connection. Use wss:// or mqtts://");
    }

    this.config = {
      url,
      username,
      password,
      clean: config?.clean ?? true,
      reconnectPeriod: config?.reconnectPeriod ?? 1000,
      connectTimeout: config?.connectTimeout ?? 4000,
    };

    try {
      const connectOptions: any = {
        clean: this.config.clean,
        connectTimeout: this.config.connectTimeout,
        reconnectPeriod: this.config.reconnectPeriod,
      };

      // Add authentication if credentials are provided
      if (username && password) {
        connectOptions.username = username;
        connectOptions.password = password;
        console.log("🔒 Connecting to secure MQTT broker with authentication");
      } else {
        console.log("📡 Connecting to MQTT broker (no authentication)");
      }

      this.client = mqtt.connect(url, connectOptions);

      this.client.on("connect", () => {
        console.log("✅ Secure MQTT client connected");
        this.connected = true;
        this.resubscribeAll();
      });

      this.client.on("error", (error) => {
        console.error("❌ Secure MQTT connection error:", error);
        this.connected = false;
      });

      this.client.on("offline", () => {
        console.warn("⚠️ Secure MQTT client offline");
        this.connected = false;
      });

      this.client.on("message", (topic, message) => {
        const handlers = this.subscriptions.get(topic);
        if (handlers) {
          const msgString = message.toString();
          handlers.forEach((handler) => handler(msgString));
        }
      });

      return this.client;
    } catch (error) {
      console.error("❌ Failed to create secure MQTT client:", error);
      return null;
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
          console.error(`❌ Failed to subscribe to ${topic}:`, err);
        } else {
          console.log(`✅ Subscribed to ${topic}`);
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
          console.error(`❌ Failed to unsubscribe from ${topic}:`, err);
        }
      });
    }
    this.subscriptions.delete(topic);
  }

  /**
   * Publish a message to a topic
   */
  publish(topic: string, message: string, options = { qos: 0 as const }): void {
    if (!this.client || !this.connected) {
      console.error("❌ Secure MQTT client not connected");
      return;
    }

    this.client.publish(topic, message, options, (err) => {
      if (err) {
        console.error(`❌ Failed to publish to ${topic}:`, err);
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
          console.error(`❌ Failed to resubscribe to ${topic}:`, err);
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
      console.log("🔌 Secure MQTT client disconnected");
    }
  }

  /**
   * Check if client is connected
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Get current configuration (without sensitive data)
   */
  getConfig() {
    return {
      url: this.config.url,
      hasAuth: !!(this.config.username && this.config.password),
      connected: this.connected,
    };
  }
}

export const secureMQTTClient = new SecureMQTTClientManager();

/**
 * Initialize secure MQTT client
 * Returns the singleton instance of the secure MQTT client manager
 */
export function initSecureMQTT(config?: SecureMQTTConfig) {
  secureMQTTClient.connect(config);
  return secureMQTTClient;
}
