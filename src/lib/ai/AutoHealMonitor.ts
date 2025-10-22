// src/lib/ai/AutoHealMonitor.ts
import mqtt from "mqtt";

export function initAutoHealMonitor() {
  try {
    const client = mqtt.connect(
      import.meta.env.VITE_MQTT_URL || "wss://broker.hivemq.com:8884/mqtt"
    );
    
    client.on("connect", () => {
      console.log("🚑 AutoHeal Monitor conectado ao MQTT");
      client.subscribe("system/autoheal");
    });

    client.on("message", (_, msg) => {
      try {
        const { module, error } = JSON.parse(msg.toString());
        console.warn(`🚑 AutoHeal ativado: ${module} reiniciado por erro (${error})`);
      } catch (parseError) {
        console.warn("⚠️ Erro ao processar mensagem do AutoHeal:", parseError);
      }
    });

    client.on("error", (error) => {
      console.warn("⚠️ Erro na conexão MQTT do AutoHeal Monitor:", error);
    });
  } catch (error) {
    console.warn("⚠️ Falha ao inicializar AutoHeal Monitor:", error);
  }
}
