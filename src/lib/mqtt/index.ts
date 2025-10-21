import mqtt from "mqtt";

export function initMQTT() {
  const broker = import.meta.env.VITE_MQTT_BROKER_URL || import.meta.env.VITE_MQTT_URL || "wss://broker.hivemq.com:8884/mqtt";

  try {
    const client = mqtt.connect(broker, {
      clientId: `nautilus-${Math.random().toString(16).slice(2)}`,
      reconnectPeriod: 3000,
    });

    client.on("connect", () => {
      console.info("🛰️ Conectado ao broker MQTT Nautilus");
      client.subscribe("nautilus/telemetry/#");
    });

    client.on("error", (err) => {
      console.warn("⚠️ Erro MQTT:", err.message);
    });

    client.on("reconnect", () => console.log("🔄 Reconectando MQTT..."));

    return client;
  } catch (error) {
    console.error("❌ Falha na inicialização do MQTT:", error);
    return null;
  }
}
