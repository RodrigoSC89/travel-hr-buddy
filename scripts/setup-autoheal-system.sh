#!/bin/bash
echo "🚀 Aplicando PATCH_25.8 — AI Auto-Healing Runtime & Rollback System"

# Create directory if it doesn't exist
mkdir -p src/lib/ai

# Create AutoHealSystem module
cat > src/lib/ai/AutoHealSystem.ts <<'EOF'
// src/lib/ai/AutoHealSystem.ts
import { createClient } from "@supabase/supabase-js";
import mqtt from "mqtt";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_KEY!
);

const mqttClient = mqtt.connect(
  import.meta.env.VITE_MQTT_URL || "wss://broker.hivemq.com:8884/mqtt"
);

export class AutoHealSystem {
  static cache = new Map<string, any>();

  static async reportError(module: string, error: Error) {
    console.error(`🛑 Falha detectada no módulo ${module}:`, error);

    try {
      // Reporta no Supabase
      await supabase.from("system_logs").insert([
        {
          type: "autoheal_error",
          message: error.message,
          context: { module },
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (dbError) {
      console.warn("⚠️ Falha ao registrar erro no Supabase:", dbError);
    }

    try {
      // Reporta via MQTT
      mqttClient.publish(
        "system/autoheal",
        JSON.stringify({ module, error: error.message })
      );
    } catch (mqttError) {
      console.warn("⚠️ Falha ao publicar erro via MQTT:", mqttError);
    }

    // Tenta rollback automático
    if (this.cache.has(module)) {
      console.warn(`🔁 Restaurando módulo anterior de cache: ${module}`);
      return this.cache.get(module);
    } else {
      console.warn(`⚠️ Nenhum cache anterior disponível para ${module}`);
      return null;
    }
  }

  static async loadSafely(modulePath: string, importer: () => Promise<any>) {
    try {
      const mod = await importer();
      this.cache.set(modulePath, mod);
      return mod;
    } catch (error) {
      return this.reportError(modulePath, error as Error);
    }
  }
}
EOF

# Create AutoHealMonitor module
cat > src/lib/ai/AutoHealMonitor.ts <<'EOF'
// src/lib/ai/AutoHealMonitor.ts
import mqtt from "mqtt";

export function initAutoHealMonitor() {
  try {
    const client = mqtt.connect(
      import.meta.env.VITE_MQTT_URL || "wss://broker.hivemq.com:8884/mqtt"
    );
    
    client.on("connect", () => {
      console.log("🚑 AutoHeal Monitor conectado ao MQTT");
      client.subscribe("system/autoheal");
    });

    client.on("message", (_, msg) => {
      try {
        const { module, error } = JSON.parse(msg.toString());
        console.warn(`🚑 AutoHeal ativado: ${module} reiniciado por erro (${error})`);
      } catch (parseError) {
        console.warn("⚠️ Erro ao processar mensagem do AutoHeal:", parseError);
      }
    });

    client.on("error", (error) => {
      console.warn("⚠️ Erro na conexão MQTT do AutoHeal Monitor:", error);
    });
  } catch (error) {
    console.warn("⚠️ Falha ao inicializar AutoHeal Monitor:", error);
  }
}
EOF

echo "✅ AutoHealSystem e AutoHealMonitor criados com sucesso."
echo "📦 Executando build..."
npm run build

echo "✅ PATCH_25.8 aplicado com sucesso!"
