/**
 * MQTT Publisher
 * Provides publish and subscribe functions for DP telemetry
 */

import mqtt from "mqtt";

/**
 * Publish an event to MQTT broker
 */
export const publishEvent = (topic: string, payload: Record<string, unknown>) => {
  const client = mqtt.connect(import.meta.env.VITE_MQTT_URL || "wss://broker.hivemq.com:8884/mqtt");
  client.on("connect", () => {
    client.publish(topic, JSON.stringify(payload), { qos: 1 }, (err) => {
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
 * Subscribe to Forecast channel
 */
export const subscribeForecast = (callback: (data: Record<string, unknown>) => void) => {
  const client = mqtt.connect(import.meta.env.VITE_MQTT_URL || "wss://broker.hivemq.com:8884/mqtt");
  
  client.on("connect", () => {
    client.subscribe("nautilus/forecast", (err) => {
      if (err) {
        console.error("❌ Failed to subscribe to nautilus/forecast:", err);
      } else {
        console.log("✅ Subscribed to nautilus/forecast");
      }
    });
  });
  
  client.on("message", (topic, msg) => {
    if (topic === "nautilus/forecast") {
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

/**
 * Subscribe to Forecast telemetry updates
 */
export const subscribeForecast = (callback: (data: Record<string, unknown>) => void) => {
  const client = mqtt.connect(import.meta.env.VITE_MQTT_URL || "wss://broker.hivemq.com:8884/mqtt");
  
  client.on("connect", () => {
    client.subscribe("nautilus/forecast/telemetry", (err) => {
      if (err) {
        console.error("❌ Failed to subscribe to nautilus/forecast/telemetry:", err);
      } else {
        console.log("✅ Subscribed to nautilus/forecast/telemetry");
      }
    });
  });
  
  client.on("message", (topic, msg) => {
    if (topic === "nautilus/forecast/telemetry") {
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
 * Subscribe to system alerts
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
 * Subscribe to Bridge Status updates
 */
export const subscribeBridgeStatus = (callback: (data: Record<string, unknown>) => void) => {
  const client = mqtt.connect(import.meta.env.VITE_MQTT_URL || "wss://broker.hivemq.com:8884/mqtt");
  
  client.on("connect", () => {
    client.subscribe("nautilus/bridge/status", (err) => {
      if (err) {
        console.error("❌ Failed to subscribe to nautilus/bridge/status:", err);
      } else {
        console.log("✅ Subscribed to nautilus/bridge/status");
      }
    });
  });
  
  client.on("message", (topic, msg) => {
    if (topic === "nautilus/bridge/status") {
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
 * Subscribe to Forecast data
 */
export const subscribeForecast = (callback: (data: Record<string, unknown>) => void) => {
  const client = mqtt.connect(import.meta.env.VITE_MQTT_URL || "wss://broker.hivemq.com:8884/mqtt");
  
  client.on("connect", () => {
    client.subscribe("nautilus/forecast/data", (err) => {
      if (err) {
        console.error("❌ Failed to subscribe to nautilus/forecast/data:", err);
      } else {
        console.log("✅ Subscribed to nautilus/forecast/data");
      }
    });
  });
  
  client.on("message", (topic, msg) => {
    if (topic === "nautilus/forecast/data") {
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
 * Subscribe to DP Alerts
 */
export const subscribeAlerts = (callback: (data: Record<string, unknown>) => void) => {
  const client = mqtt.connect(import.meta.env.VITE_MQTT_URL || "wss://broker.hivemq.com:8884/mqtt");
  
  client.on("connect", () => {
    client.subscribe("nautilus/dp/alert", (err) => {
      if (err) {
        console.error("❌ Failed to subscribe to nautilus/dp/alert:", err);
      } else {
        console.log("✅ Subscribed to nautilus/dp/alert");
      }
    });
  });
  
  client.on("message", (topic, msg) => {
    if (topic === "nautilus/dp/alert") {
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
 * Publish forecast data to MQTT broker
 */
export const publishForecast = (data: { wind: number; wave: number; temp: number; visibility: number }) => {
  const client = mqtt.connect(import.meta.env.VITE_MQTT_URL || "wss://broker.hivemq.com:8884/mqtt");
  client.on("connect", () => {
    client.publish("nautilus/forecast/global", JSON.stringify(data), { qos: 1 }, (err) => {
      if (err) {
        console.error("❌ Failed to publish to nautilus/forecast/global:", err);
      } else {
        console.log("✅ Published to nautilus/forecast/global:", data);
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
 * Subscribe to forecast global data channel
 */
export const subscribeForecast = (callback: (data: { wind: number; wave: number; temp: number; visibility: number }) => void) => {
  const client = mqtt.connect(import.meta.env.VITE_MQTT_URL || "wss://broker.hivemq.com:8884/mqtt");
  
  client.on("connect", () => {
    client.subscribe("nautilus/forecast/global", (err) => {
      if (err) {
        console.error("❌ Failed to subscribe to nautilus/forecast/global:", err);
      } else {
        console.log("✅ Subscribed to nautilus/forecast/global");
      }
    });
  });
  
  client.on("message", (topic, msg) => {
    if (topic === "nautilus/forecast/global") {
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
