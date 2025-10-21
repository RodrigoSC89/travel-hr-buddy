/**
 * MQTT Client for BridgeLink Integration
 * 
 * Provides MQTT messaging capabilities for real-time communication
 * with external systems and brokers, integrating with BridgeLink event system.
 * 
 * @module MQTTClient
 * @version Beta 3.1
 */

import mqtt, { MqttClient as MqttClientType } from "mqtt";
import { BridgeLink } from "@/core/BridgeLink";

/**
 * MQTT Client Manager
 * 
 * Handles MQTT connection, subscriptions, and publishing with automatic
 * integration to the BridgeLink event system for telemetry and monitoring.
 */
export const MQTTClient = {
  client: null as MqttClientType | null,
  connected: false,
  reconnectAttempts: 0,
  maxReconnectAttempts: 5,

  /**
   * Connect to MQTT broker
   * @param brokerUrl - Optional broker URL (uses env var or default)
   */
  connect(brokerUrl?: string): void {
    if (this.client) {
      console.log("ℹ️ MQTT client já conectado");
      return;
    }

    const url = brokerUrl || import.meta.env.VITE_MQTT_URL || "wss://broker.hivemq.com:8884/mqtt";

    try {
      this.client = mqtt.connect(url, {
        clean: true,
        connectTimeout: 4000,
        reconnectPeriod: 1000,
      });

      this.client.on("connect", () => {
        console.log("📡 Conectado ao broker MQTT");
        this.connected = true;
        this.reconnectAttempts = 0;

        // Emit BridgeLink event
        BridgeLink.emit("system:module:loaded", "MQTTClient", {
          status: "connected",
          broker: url,
          timestamp: Date.now(),
        });

        // Subscribe to Nautilus events topic
        this.client?.subscribe("nautilus/events", (err) => {
          if (err) {
            console.error("❌ Erro ao subscrever nautilus/events:", err);
          } else {
            console.log("✅ Subscrito em nautilus/events");
          }
        });
      });

      this.client.on("message", (topic: string, message: Buffer) => {
        const messageStr = message.toString();
        console.log(`📨 MQTT [${topic}]:`, messageStr);

        // Emit to BridgeLink for centralized handling
        BridgeLink.emit("telemetry:log", "MQTTClient", {
          topic,
          message: messageStr,
          timestamp: Date.now(),
        });
      });

      this.client.on("error", (error) => {
        console.error("❌ Erro de conexão MQTT:", error);
        this.connected = false;
      });

      this.client.on("offline", () => {
        console.warn("⚠️ MQTT client offline");
        this.connected = false;
      });

      this.client.on("reconnect", () => {
        this.reconnectAttempts++;
        console.log(`🔄 MQTT reconectando... (tentativa ${this.reconnectAttempts})`);

        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.error("❌ Máximo de tentativas de reconexão atingido");
          this.disconnect();
        }
      });
    } catch (error) {
      console.error("❌ Falha ao criar cliente MQTT:", error);
    }
  },

  /**
   * Publish an event to a topic
   * @param event - Event name/topic
   * @param data - Data to publish
   */
  publish(event: string, data: unknown): void {
    if (this.client?.connected) {
      const message = JSON.stringify(data);
      this.client.publish(event, message, (err) => {
        if (err) {
          console.error(`❌ Erro ao publicar em ${event}:`, err);
        } else {
          console.log(`📤 Publicado em ${event}:`, message);
        }
      });
    } else {
      console.warn("⚠️ Cliente MQTT não conectado. Não foi possível publicar.");
    }
  },

  /**
   * Subscribe to a topic with callback
   * @param topic - Topic to subscribe to
   * @param callback - Callback function for messages
   */
  subscribe(topic: string, callback: (message: string) => void): void {
    if (!this.client) {
      this.connect();
    }

    this.client?.subscribe(topic, (err) => {
      if (err) {
        console.error(`❌ Erro ao subscrever ${topic}:`, err);
      } else {
        console.log(`✅ Subscrito em ${topic}`);
      }
    });

    // Add message handler
    this.client?.on("message", (msgTopic: string, message: Buffer) => {
      if (msgTopic === topic) {
        callback(message.toString());
      }
    });
  },

  /**
   * Disconnect from MQTT broker
   */
  disconnect(): void {
    if (this.client) {
      this.client.end(true);
      this.client = null;
      this.connected = false;
      console.log("🔌 Cliente MQTT desconectado");
    }
  },

  /**
   * Check if client is connected
   * @returns Connection status
   */
  isConnected(): boolean {
    return this.connected;
  },
};
