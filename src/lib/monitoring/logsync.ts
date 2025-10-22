// src/lib/monitoring/logsync.ts
import { createClient } from "@supabase/supabase-js";
import mqtt from "mqtt";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_KEY!
);

const mqttClient = mqtt.connect(
  import.meta.env.VITE_MQTT_URL || "wss://broker.hivemq.com:8884/mqtt"
);

export async function initLogSync() {
  const sendLog = async (type: string, message: string, context?: any) => {
    console.log(`[${type}]`, message);
    await supabase.from("system_logs").insert([
      {
        type,
        message,
        context: JSON.stringify(context || {}),
        created_at: new Date().toISOString(),
      },
    ]);
    mqttClient.publish(
      "system/logs",
      JSON.stringify({ type, message, context })
    );
  };

  window.addEventListener("error", (event) => {
    sendLog("runtime_error", event.message, {
      file: event.filename,
      line: event.lineno,
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    sendLog("promise_rejection", String(event.reason));
  });

  sendLog("startup", "✅ LogSync initialized successfully");
}
