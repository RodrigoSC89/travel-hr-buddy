/**
 * MQTT Publisher Utility
 * Provides functions to publish events to MQTT topics for real-time synchronization
 */

import { initSecureMQTT } from "./secure-client";

/**
 * Publishes an event to an MQTT topic
 * @param topic - MQTT topic to publish to (e.g., "nautilus/forecast/update")
 * @param payload - Data to publish
 * @param qos - Quality of Service level (0, 1, or 2). Default is 1 for reliable delivery
 */
export function publishEvent(
  topic: string,
  payload: Record<string, any>,
  qos: 0 | 1 | 2 = 1
): void {
  try {
    const client = initSecureMQTT();
    const message = JSON.stringify(payload);
    
    client.publish(topic, message, { qos }, (error) => {
      if (error) {
        console.error(`❌ Error publishing to ${topic}:`, error);
      } else {
        console.log(`✅ Published to ${topic}:`, payload);
      }
    });
  } catch (error) {
    console.error(`❌ Failed to publish event to ${topic}:`, error);
  }
}

/**
 * Subscribes to forecast updates from MQTT
 * @param callback - Function to call when a message is received
 */
export function subscribeForecast(
  callback: (data: any) => void
): () => void {
  try {
    const client = initSecureMQTT();
    const topic = "nautilus/forecast/update";
    
    client.subscribe(topic, { qos: 1 }, (error) => {
      if (error) {
        console.error(`❌ Error subscribing to ${topic}:`, error);
      } else {
        console.log(`✅ Subscribed to ${topic}`);
      }
    });
    
    client.on("message", (receivedTopic, message) => {
      if (receivedTopic === topic) {
        try {
          const data = JSON.parse(message.toString());
          callback(data);
        } catch (parseError) {
          console.error("❌ Error parsing MQTT message:", parseError);
        }
      }
    });
    
    // Return unsubscribe function
    return () => {
      client.unsubscribe(topic, (error) => {
        if (error) {
          console.error(`❌ Error unsubscribing from ${topic}:`, error);
        } else {
          console.log(`✅ Unsubscribed from ${topic}`);
        }
      });
    };
  } catch (error) {
    console.error("❌ Failed to subscribe to forecast updates:", error);
    return () => {}; // Return no-op function on error
  }
}
