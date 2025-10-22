// src/components/SystemHealthPanel.tsx
import { useEffect, useState } from "react";
import mqtt from "mqtt";

export default function SystemHealthPanel() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    const client = mqtt.connect(
      import.meta.env.VITE_MQTT_URL || "wss://broker.hivemq.com:8884/mqtt"
    );
    client.subscribe("system/logs");
    client.on("message", (_, msg) => {
      const data = JSON.parse(msg.toString());
      setLogs((prev) => [data, ...prev.slice(0, 50)]);
    });

    return () => {
      client.end();
    };
  }, []);

  return (
    <div className="p-4 bg-neutral-900 text-white rounded-2xl shadow-md">
      <h3 className="text-lg font-bold mb-2">⚙️ System Diagnostics</h3>
      <div className="h-96 overflow-y-auto space-y-2">
        {logs.map((log, idx) => (
          <div key={idx} className="border-b border-neutral-700 pb-1 text-sm">
            <strong>{log.type.toUpperCase()}</strong>: {log.message}
            {log.context && (
              <pre className="text-xs text-gray-400">
                {JSON.stringify(log.context, null, 2)}
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
