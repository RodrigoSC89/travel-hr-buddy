import { useEffect, useState } from "react";
import { BridgeLink } from "@/core/BridgeLink";
import { MQTTClient } from "@/core/MQTTClient";

export default function ControlHub() {
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    MQTTClient.connect();
    const unsub = BridgeLink.on("mqtt:event", (data) => {
      setLogs((prev) => [...prev, `[MQTT] ${data.message}`]);
    });
    return () => unsub();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">🛰️ Nautilus Control Hub</h2>
      <div className="bg-gray-900 text-green-300 p-4 rounded-lg h-96 overflow-auto font-mono text-sm">
        {logs.length ? logs.map((log, i) => <div key={i}>{log}</div>) : "Aguardando dados..."}
      </div>
    </div>
  );
}
