import mqtt from "mqtt";
import { BridgeLink } from "@/core/BridgeLink";

export const MQTTClient = {
  client: null as any,

  connect() {
    this.client = mqtt.connect(import.meta.env.VITE_MQTT_URL || "wss://mqtt.nautilus.one");
    this.client.on("connect", () => console.log("📡 Conectado ao broker MQTT"));
    this.client.on("message", (topic, message) => {
      BridgeLink.emit("mqtt:event", { topic, message: message.toString() });
    });
    this.client.subscribe("nautilus/events");
  },

  publish(event: string, data: any) {
    if (this.client?.connected) {
      this.client.publish(event, JSON.stringify(data));
    }
  }
};
