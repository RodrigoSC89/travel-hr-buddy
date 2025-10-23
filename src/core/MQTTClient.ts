/**
 * MQTTClient - Cliente MQTT com auto-reconexão - PATCH 65.0
 * 
 * Gerencia conexão bidirecional com broker MQTT (ex: Mosquitto)
 * para sincronização com backend PEO-DP e outros sistemas externos.
 * 
 * @module MQTTClient
 * @version 1.0.0 (Beta 3.1)
 */

import mqtt, { MqttClient } from "mqtt";
import { BridgeLink, BridgeLinkEventType } from "@/core/BridgeLink";
import { Logger } from "@/lib/utils/logger";

interface MQTTClientConfig {
  url?: string;
  reconnectInterval?: number;
  topics?: string[];
}

class MQTTClientManager {
  private client: MqttClient | null = null;
  private config: MQTTClientConfig = {
    reconnectInterval: 5000,
    topics: ["nautilus/events"]
  };
  private isConnecting = false;
  private reconnectTimer: NodeJS.Timeout | null = null;

  /**
   * Conecta ao broker MQTT
   * @param config - Configuração de conexão
   */
  connect(config?: MQTTClientConfig): void {
    if (this.client?.connected || this.isConnecting) {
      Logger.info("MQTT já conectado ou conectando", undefined, "MQTTClient");
      return;
    }

    this.isConnecting = true;
    
    // Merge config
    if (config) {
      this.config = { ...this.config, ...config };
    }

    // Get MQTT URL from env or config
    const mqttUrl = this.config.url || import.meta.env.VITE_MQTT_URL;
    
    if (!mqttUrl) {
      Logger.warn("MQTT URL não configurada. Defina VITE_MQTT_URL no .env", undefined, "MQTTClient");
      this.isConnecting = false;
      return;
    }

    try {
      Logger.info(`Conectando MQTT a ${mqttUrl}`, undefined, "MQTTClient");
      
      this.client = mqtt.connect(mqttUrl, {
        reconnectPeriod: this.config.reconnectInterval,
        connectTimeout: 30000,
      });

      this.setupEventHandlers();
    } catch (error) {
      Logger.error("Erro ao conectar MQTT", error, "MQTTClient");
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  /**
   * Configura handlers de eventos MQTT
   */
  private setupEventHandlers(): void {
    if (!this.client) return;

    this.client.on("connect", () => {
      Logger.info("Conectado ao broker MQTT", undefined, "MQTTClient");
      this.isConnecting = false;
      
      // Cancelar timer de reconexão se houver
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }

      // Subscribe aos tópicos configurados
      this.config.topics?.forEach((topic) => {
        this.client?.subscribe(topic, (err) => {
          if (err) {
            Logger.error(`Erro ao subscrever ${topic}`, err, "MQTTClient");
          } else {
            console.log(`📡 [MQTT] Subscrito a ${topic}`);
          }
        });
      });

      // Emitir evento de conexão
      BridgeLink.emit("nautilus:event" as any, "MQTTClient", {
        message: "📡 Conectado ao broker MQTT",
        timestamp: new Date().toISOString()
      });
    });

    this.client.on("message", (topic: string, message: Buffer) => {
      const messageStr = message.toString();
      console.log(`📡 [MQTT] Mensagem recebida de ${topic}:`, messageStr);

      // Emitir evento através do BridgeLink
      BridgeLink.emit("nautilus:event" as any, "MQTTClient", {
        message: `[MQTT] ${messageStr}`,
        topic,
        timestamp: new Date().toISOString()
      });
    });

    this.client.on("error", (error: Error) => {
      console.error("📡 [MQTT] Erro:", error);
      this.isConnecting = false;
    });

    this.client.on("disconnect", () => {
      console.log("📡 [MQTT] Desconectado do broker");
      this.isConnecting = false;
      
      BridgeLink.emit("nautilus:event" as any, "MQTTClient", {
        message: "📡 Desconectado do broker MQTT",
        timestamp: new Date().toISOString()
      });

      this.scheduleReconnect();
    });

    this.client.on("offline", () => {
      console.log("📡 [MQTT] Cliente offline");
      this.isConnecting = false;
      this.scheduleReconnect();
    });

    this.client.on("close", () => {
      console.log("📡 [MQTT] Conexão fechada");
      this.isConnecting = false;
    });
  }

  /**
   * Agenda reconexão automática
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;

    console.log(`📡 [MQTT] Agendando reconexão em ${this.config.reconnectInterval}ms...`);
    
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (!this.client?.connected && !this.isConnecting) {
        console.log("📡 [MQTT] Tentando reconectar...");
        this.connect();
      }
    }, this.config.reconnectInterval);
  }

  /**
   * Envia mensagem para o broker MQTT
   * @param topic - Tópico MQTT
   * @param payload - Dados a enviar
   */
  send(topic: string, payload: any): void {
    if (!this.client?.connected) {
      console.warn("📡 [MQTT] Não conectado. Mensagem não enviada.");
      return;
    }

    const message = typeof payload === "string" ? payload : JSON.stringify(payload);
    
    this.client.publish(topic, message, (err) => {
      if (err) {
        console.error(`📡 [MQTT] Erro ao publicar em ${topic}:`, err);
      } else {
        console.log(`📡 [MQTT] Mensagem publicada em ${topic}`);
      }
    });
  }

  /**
   * Subscreve a um tópico adicional
   * @param topic - Tópico para subscrever
   */
  subscribe(topic: string): void {
    if (!this.client?.connected) {
      console.warn("📡 [MQTT] Não conectado. Adicionando tópico à lista de subscrição.");
      if (!this.config.topics?.includes(topic)) {
        this.config.topics?.push(topic);
      }
      return;
    }

    this.client.subscribe(topic, (err) => {
      if (err) {
        console.error(`📡 [MQTT] Erro ao subscrever ${topic}:`, err);
      } else {
        console.log(`📡 [MQTT] Subscrito a ${topic}`);
        if (!this.config.topics?.includes(topic)) {
          this.config.topics?.push(topic);
        }
      }
    });
  }

  /**
   * Remove subscrição de um tópico
   * @param topic - Tópico para remover subscrição
   */
  unsubscribe(topic: string): void {
    if (!this.client?.connected) {
      console.warn("📡 [MQTT] Não conectado.");
      return;
    }

    this.client.unsubscribe(topic, (err) => {
      if (err) {
        console.error(`📡 [MQTT] Erro ao remover subscrição de ${topic}:`, err);
      } else {
        console.log(`📡 [MQTT] Subscrição removida de ${topic}`);
        const index = this.config.topics?.indexOf(topic);
        if (index !== undefined && index > -1) {
          this.config.topics?.splice(index, 1);
        }
      }
    });
  }

  /**
   * Desconecta do broker MQTT
   */
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.client) {
      console.log("📡 [MQTT] Desconectando...");
      this.client.end(false, () => {
        console.log("📡 [MQTT] Desconectado com sucesso");
      });
      this.client = null;
    }
  }

  /**
   * Verifica se está conectado
   * @returns true se conectado
   */
  isConnected(): boolean {
    return this.client?.connected || false;
  }

  /**
   * Obtém status da conexão
   */
  getStatus() {
    return {
      connected: this.client?.connected || false,
      connecting: this.isConnecting,
      url: this.config.url || import.meta.env.VITE_MQTT_URL,
      topics: this.config.topics || []
    };
  }
}

// Exporta instância singleton
export const MQTTClient = new MQTTClientManager();
