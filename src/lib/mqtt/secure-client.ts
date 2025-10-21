import mqtt from "mqtt";

/**
 * Secure MQTT Client with TLS and authentication support.
 */
export function initSecureMQTT() {
  const brokerUrl = import.meta.env.VITE_MQTT_URL || import.meta.env.VITE_MQTT_BROKER_URL;
  const username = import.meta.env.VITE_MQTT_USER || "nautilus";
  const password = import.meta.env.VITE_MQTT_PASS || "";

  if (!brokerUrl) {
    console.warn("⚠️ MQTT broker URL not configured. Telemetry will not be sent.");
    return null;
  }

  try {
    const client = mqtt.connect(brokerUrl, {
      username,
      password,
      reconnectPeriod: 3000,
      clean: true,
      protocol: brokerUrl.startsWith("wss") ? "wss" : "ws",
    });

    client.on("connect", () => console.log("🛰️ MQTT Secure Connection established"));
    client.on("error", (err) => console.error("❌ MQTT Error:", err.message));
    client.on("reconnect", () => console.log("🔁 MQTT reconnecting..."));

    return client;
  } catch (error) {
    console.error("❌ Failed to initialize MQTT client:", error);
    return null;
  }
}
