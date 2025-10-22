// src/lib/ai/CodeRefresher.ts
import mqtt from "mqtt";

let refresherClient: ReturnType<typeof mqtt.connect> | null = null;
const changedModules = new Set<string>();

export function initCodeRefresher() {
  if (refresherClient) return;

  refresherClient = mqtt.connect(import.meta.env.VITE_MQTT_URL || "wss://broker.hivemq.com:8884/mqtt");
  refresherClient.subscribe("system/hotreload");

  refresherClient.on("message", (_, msg) => {
    const { module, action } = JSON.parse(msg.toString());
    if (action === "reload") {
      console.log(`♻️ Atualizando módulo: ${module}`);
      changedModules.add(module);
      invalidateModuleCache(module);
    }
  });

  console.log("⚙️ AI CodeRefresher ativo — HMR inteligente inicializado");
}

function invalidateModuleCache(moduleName: string) {
  const entries = Object.entries(import.meta.glob("/src/**/*.tsx"));
  for (const [path, importer] of entries) {
    if (path.includes(moduleName)) {
      importer().then(() => console.log(`✅ Módulo recarregado: ${path}`));
    }
  }
}
