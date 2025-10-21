/**
 * Secure MQTT Client
 * Enhanced MQTT client with TLS/SSL support and authentication
 * Part of Nautilus One v3.5 - Security Hardening Module
 */

import mqtt, { MqttClient, IClientOptions } from "mqtt";

interface SecureMQTTConfig {
  url: string;
  username?: string;
  password?: string;
  clientId?: string;
  useTLS?: boolean;
}

/**
 * Initialize secure MQTT connection with authentication
 * 
 * @param config - Configuration for secure MQTT connection
 * @returns MQTT client instance or null on failure
 */
export function initSecureMQTT(config: SecureMQTTConfig): MqttClient | null {
  const {
    url,
    username = import.meta.env.VITE_MQTT_USER,
    password = import.meta.env.VITE_MQTT_PASS,
    clientId = `nautilus-secure-${Math.random().toString(16).slice(2)}`,
    useTLS = url.startsWith("wss://") || url.startsWith("mqtts://"),
  } = config;

  // Validate TLS usage in production
  if (import.meta.env.MODE === "production" && !useTLS) {
    console.warn(
      "⚠️ WARNING: Unencrypted MQTT connection detected in production. Use wss:// or mqtts:// protocol."
    );
  }

  try {
    const options: IClientOptions = {
      clientId,
      reconnectPeriod: 3000,
      connectTimeout: 4000,
      clean: true,
      keepalive: 60,
    };

    // Add authentication if credentials are provided
    if (username && password) {
      options.username = username;
      options.password = password;
      console.info("🔐 MQTT: Autenticação habilitada");
    }

    // Configure TLS if using secure protocol
    if (useTLS) {
      options.rejectUnauthorized = import.meta.env.MODE === "production";
      console.info("🔒 MQTT: Conexão TLS/SSL habilitada");
    }

    const client = mqtt.connect(url, options);

    client.on("connect", () => {
      console.info("✅ MQTT Secure: Conectado ao broker");
      client.subscribe("nautilus/telemetry/#", (err) => {
        if (err) {
          console.warn("⚠️ Erro ao subscrever tópicos:", err);
        } else {
          console.info("📡 MQTT: Subscrito aos tópicos de telemetria");
        }
      });
    });

    client.on("error", (err) => {
      console.error("❌ MQTT Secure: Erro de conexão:", err.message);
    });

    client.on("reconnect", () => {
      console.log("🔄 MQTT Secure: Reconectando...");
    });

    client.on("offline", () => {
      console.log("📡 MQTT Secure: Cliente offline");
    });

    client.on("disconnect", () => {
      console.log("🔌 MQTT Secure: Desconectado");
    });

    return client;
  } catch (error) {
    console.error("❌ Falha ao inicializar MQTT seguro:", error);
    return null;
  }
}
