import mqtt from "mqtt";
import { logger } from "@/lib/logger";

const MQTT_URL = import.meta.env.VITE_MQTT_URL || "wss://broker.hivemq.com:8884/mqtt";

// Cliente MQTT gerenciado com reconexão automática
let client: mqtt.MqttClient | null = null;
let connectionPromise: Promise<mqtt.MqttClient> | null = null;

/**
 * Obtém ou cria conexão MQTT com retry
 */
const getClient = (): Promise<mqtt.MqttClient> => {
  if (client?.connected) {
    return Promise.resolve(client);
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = new Promise((resolve, reject) => {
    try {
      client = mqtt.connect(MQTT_URL, {
        reconnectPeriod: 5000,
        connectTimeout: 10000,
        keepalive: 60,
      });

      client.on("connect", () => {
        logger.debug("MQTT conectado");
        connectionPromise = null;
        resolve(client!);
      });

      client.on("error", (err) => {
        logger.error("Erro MQTT:", err);
        connectionPromise = null;
        reject(err);
      });

      client.on("close", () => {
        logger.debug("MQTT desconectado");
        connectionPromise = null;
      });

      client.on("reconnect", () => {
        logger.debug("MQTT reconectando...");
      });
    } catch (err) {
      connectionPromise = null;
      reject(err);
    }
  });

  return connectionPromise;
};

/**
 * 📤 Publica um evento em qualquer tópico MQTT
 */
export const publishEvent = async (
  topic: string,
  payload: Record<string, unknown>,
  qos: 0 | 1 | 2 = 1
) => {
  try {
    const mqttClient = await getClient();
    mqttClient.publish(topic, JSON.stringify(payload), { qos }, (err) => {
      if (err) logger.error(`Falha ao publicar em ${topic}:`, err);
      else logger.debug(`Publicado em ${topic}:`, payload);
    });
  } catch (err) {
    logger.error(`Falha ao conectar para publicar em ${topic}:`, err);
  }
};

// Armazena callbacks de subscription para cleanup
const subscriptions = new Map<string, Set<(data: Record<string, unknown>) => void>>();

/**
 * 📡 Subscreve genericamente a um tópico MQTT
 * Retorna função de unsubscribe (não mata o cliente)
 */
export const subscribeTopic = (
  topic: string,
  callback: (data: Record<string, unknown>) => void
): (() => void) => {
  // Registra callback
  if (!subscriptions.has(topic)) {
    subscriptions.set(topic, new Set());
  }
  subscriptions.get(topic)!.add(callback);

  // Inicia conexão e subscription
  getClient()
    .then((mqttClient) => {
      // Verifica se já está subscrito
      if (subscriptions.get(topic)?.size === 1) {
        mqttClient.subscribe(topic, (err) => {
          if (err) logger.error(`Falha ao subscrever ${topic}:`, err);
          else logger.debug(`Subscreveu ${topic}`);
        });
      }

      // Handler de mensagens único para o cliente (se não existir)
      if (!mqttClient.listenerCount("message")) {
        mqttClient.on("message", (receivedTopic: string, message: Buffer) => {
          const callbacks = subscriptions.get(receivedTopic);
          if (callbacks) {
            try {
              const data = JSON.parse(message.toString());
              callbacks.forEach((cb) => cb(data));
            } catch {
              callbacks.forEach((cb) => cb({ raw: message.toString() }));
            }
          }
        });
      }
    })
    .catch((err) => {
      logger.error(`Não foi possível subscrever ${topic}:`, err);
    });

  // Retorna função de cleanup (não mata o cliente!)
  return () => {
    const callbacks = subscriptions.get(topic);
    if (callbacks) {
      callbacks.delete(callback);
      
      // Se não há mais callbacks, unsubscribe do tópico
      if (callbacks.size === 0) {
        subscriptions.delete(topic);
        client?.unsubscribe(topic, (err) => {
          if (err) logger.error(`Falha ao cancelar subscription ${topic}:`, err);
        });
      }
    }
  };
};

/**
 * 🔹 Canais específicos
 */
export const subscribeDP = (callback: (data: Record<string, unknown>) => void) => 
  subscribeTopic("nautilus/dp", callback);

export const subscribeForecast = (callback: (data: Record<string, unknown>) => void) => 
  subscribeTopic("nautilus/forecast", callback);

export const subscribeForecastData = (callback: (data: Record<string, unknown>) => void) => 
  subscribeTopic("nautilus/forecast/data", callback);

export const subscribeForecastGlobal = (callback: (data: Record<string, unknown>) => void) => 
  subscribeTopic("nautilus/forecast/global", callback);

export const subscribeSystemAlerts = (callback: (data: Record<string, unknown>) => void) => 
  subscribeTopic("nautilus/alerts", callback);

export const subscribeDPAlerts = (callback: (data: Record<string, unknown>) => void) => 
  subscribeTopic("nautilus/dp/alert", callback);

export const subscribeBridgeStatus = (callback: (data: Record<string, unknown>) => void) => 
  subscribeTopic("nautilus/bridgelink/status", callback);

export const subscribeBridgeLinkStatus = (callback: (data: Record<string, unknown>) => void) => 
  subscribeTopic("nautilus/bridgelink/status", callback);

export const subscribeControlHub = (callback: (data: Record<string, unknown>) => void) => 
  subscribeTopic("nautilus/controlhub/telemetry", callback);

export const subscribeSystemStatus = (callback: (data: Record<string, unknown>) => void) => 
  subscribeTopic("nautilus/system/status", callback);

/**
 * 📤 Função de publicação específica
 */
export const publishForecast = (
  payload: Record<string, unknown>,
  qos: 0 | 1 | 2 = 1
) => publishEvent("nautilus/forecast/global", payload, qos);
