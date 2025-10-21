/**
 * MQTT Publisher
 * Provides publish and subscribe functions for DP telemetry
 */

import mqtt from "mqtt";

/**
 * Publish an event to MQTT broker
 * @param topic - MQTT topic to publish to
 * @param payload - Data payload to publish
 * @param qos - Quality of Service level (0, 1, or 2). Default is 1
 */
export const publishEvent = (
  topic: string, 
  payload: Record<string, unknown>, 
  qos: 0 | 1 | 2 = 1
) => {
  const client = mqtt.connect(import.meta.env.VITE_MQTT_URL || "wss://broker.hivemq.com:8884/mqtt");
  client.on("connect", () => {
    client.publish(topic, JSON.stringify(payload), { qos }, (err) => {
      if (err) {
        console.error(`❌ Failed to publish to ${topic}:`, err);
      } else {
        console.log(`✅ Published to ${topic}:`, payload);
      }
      client.end();
    });
  });
  client.on("error", (err) => {
    console.error("❌ MQTT connection error:", err);
    client.end();
  });
};

/**
 * Subscribe to DP telemetry channel
 */
export const subscribeDP = (callback: (data: Record<string, unknown>) => void) => {
  const client = mqtt.connect(import.meta.env.VITE_MQTT_URL || "wss://broker.hivemq.com:8884/mqtt");
  
  client.on("connect", () => {
    client.subscribe("nautilus/dp", (err) => {
      if (err) {
        console.error("❌ Failed to subscribe to nautilus/dp:", err);
      } else {
        console.log("✅ Subscribed to nautilus/dp");
      }
    });
  });
  
  client.on("message", (topic, msg) => {
    if (topic === "nautilus/dp") {
      try {
        const data = JSON.parse(msg.toString());
        callback(data);
      } catch (err) {
        console.error("❌ Failed to parse MQTT message:", err);
      }
    }
  });
  
  client.on("error", (err) => {
    console.error("❌ MQTT connection error:", err);
  });
  
  return client;
};

/**
 * Subscribe to Forecast channel (nautilus/forecast/update)
 * Returns a cleanup function to unsubscribe
 */
export const subscribeForecast = (callback: (data: Record<string, unknown>) => void) => {
  const client = mqtt.connect(import.meta.env.VITE_MQTT_URL || "wss://broker.hivemq.com:8884/mqtt");
  
  client.on("connect", () => {
    client.subscribe("nautilus/forecast/update", (err) => {
      if (err) {
        console.error("❌ Failed to subscribe to nautilus/forecast/update:", err);
      } else {
        console.log("✅ Subscribed to nautilus/forecast/update");
      }
    });
  });
  
  client.on("message", (topic, msg) => {
    if (topic === "nautilus/forecast/update") {
      try {
        const data = JSON.parse(msg.toString());
        callback(data);
      } catch (err) {
        console.error("❌ Failed to parse MQTT message:", err);
      }
    }
  });
  
  client.on("error", (err) => {
    console.error("❌ MQTT connection error:", err);
  });
  
  // Return cleanup function
  return () => {
    client.end();
  };
};

/**
 * Subscribe to Alerts channel
 */
export const subscribeAlerts = (callback: (data: Record<string, unknown>) => void) => {
  const client = mqtt.connect(import.meta.env.VITE_MQTT_URL || "wss://broker.hivemq.com:8884/mqtt");
  
  client.on("connect", () => {
    client.subscribe("nautilus/alerts", (err) => {
      if (err) {
        console.error("❌ Failed to subscribe to nautilus/alerts:", err);
      } else {
        console.log("✅ Subscribed to nautilus/alerts");
      }
    });
  });
  
  client.on("message", (topic, msg) => {
    if (topic === "nautilus/alerts") {
      try {
        const data = JSON.parse(msg.toString());
        callback(data);
      } catch (err) {
        console.error("❌ Failed to parse MQTT message:", err);
      }
    }
  });
  
  client.on("error", (err) => {
    console.error("❌ MQTT connection error:", err);
  });
  
  return client;
};

/**
 * Subscribe to BridgeLink connection status updates
 */
export const subscribeBridgeStatus = (callback: (data: Record<string, unknown>) => void) => {
  const client = mqtt.connect(import.meta.env.VITE_MQTT_URL || "wss://broker.hivemq.com:8884/mqtt");
  
  client.on("connect", () => {
    client.subscribe("nautilus/bridgelink/status", (err) => {
      if (err) {
        console.error("❌ Failed to subscribe to nautilus/bridgelink/status:", err);
      } else {
        console.log("✅ Subscribed to nautilus/bridgelink/status");
      }
    });
  });
  
  client.on("message", (topic, msg) => {
    if (topic === "nautilus/bridgelink/status") {
      try {
        const data = JSON.parse(msg.toString());
        callback(data);
      } catch (err) {
        console.error("❌ Failed to parse MQTT message:", err);
      }
    }
  });
  
  client.on("error", (err) => {
    console.error("❌ MQTT connection error:", err);
  });
  
  return client;
};
