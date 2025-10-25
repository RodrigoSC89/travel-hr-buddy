// @ts-nocheck
import { supabase } from "@/integrations/supabase/client";
import mqtt from "mqtt";
import { runComplianceAudit } from "@/lib/compliance/ai-compliance-engine";

/**
 * Handles incident detection and response workflow
 * @param event - Incident event containing type, description and data
 * @returns Generated incident report
 */
export async function handleIncident(event: { type?: string; description?: string; data: any }) {
  const audit = await runComplianceAudit(event.data);

  const report = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    type: event.type || "Operational",
    description: event.description || "Evento detectado pelo sistema.",
    level: audit.complianceLevel,
    score: audit.score,
    recommendation: getRecommendation(audit.complianceLevel, event.type),
  };

  await (supabase as any).from("incident_reports").insert(report);

  // Optional MQTT publishing (if configured)
  try {
    const mqttUrl = import.meta.env.VITE_MQTT_URL;
    if (mqttUrl) {
      const client = mqtt.connect(mqttUrl);
      client.publish("nautilus/incidents/alert", JSON.stringify(report));
    }
  } catch (error) {
    console.warn("MQTT publishing skipped:", error);
  }

  return report;
}

/**
 * Generates AI recommendations based on compliance level and incident type
 */
function getRecommendation(level: string, type: string) {
  if (level === "Conforme") return "Nenhuma ação necessária. Manter monitoramento.";
  if (level === "Risco") return `Verificar sistemas de suporte relacionados (${type}). Reavaliar ASOG.`;
  return "Executar resposta imediata. Acionar protocolo ISM/ISPS e registrar no Control Hub.";
}
