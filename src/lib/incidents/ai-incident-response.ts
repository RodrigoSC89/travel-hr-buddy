// @ts-nocheck
/**
 * AI Incident Response Handler
 * Automatically detects and responds to operational and compliance incidents
 */

import { supabase } from "@/integrations/supabase/client";
import mqtt from "mqtt";
import { runComplianceAudit } from "@/lib/compliance/ai-compliance-engine";

interface IncidentEvent {
  type?: string;
  description?: string;
  data?: any;
}

interface IncidentReport {
  id: string;
  timestamp: string;
  type: string;
  description: string;
  level: string;
  score: number;
  recommendation: string;
}

/**
 * Handles an incident event by running compliance audit and creating report
 * @param event - Incident event to handle
 * @returns Incident report
 */
export async function handleIncident(event: IncidentEvent): Promise<IncidentReport> {
  const audit = await runComplianceAudit(event.data);

  const report: IncidentReport = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    type: event.type || "Operational",
    description: event.description || "Evento detectado pelo sistema.",
    level: audit.complianceLevel,
    score: audit.score,
    recommendation: getRecommendation(audit.complianceLevel, event.type),
  };

  // Insert report into Supabase
  await supabase.from("incident_reports").insert(report);

  // Publish MQTT alert if MQTT URL is configured
  if (import.meta.env.VITE_MQTT_URL) {
    try {
      const client = mqtt.connect(import.meta.env.VITE_MQTT_URL);
      client.on("connect", () => {
        client.publish("nautilus/incidents/alert", JSON.stringify(report));
        client.end();
      });
    } catch (error) {
      console.warn("Failed to publish MQTT alert:", error);
    }
  }

  return report;
}

/**
 * Gets recommendation based on compliance level and incident type
 * @param level - Compliance level
 * @param type - Incident type
 * @returns Recommendation text
 */
function getRecommendation(level: string, type?: string): string {
  if (level === "Conforme") {
    return "Nenhuma ação necessária. Manter monitoramento.";
  }
  
  if (level === "Risco") {
    return `Verificar sistemas de suporte (${type || "N/A"}). Reavaliar ASOG.`;
  }
  
  return "Executar resposta imediata. Acionar protocolo ISM/ISPS e registrar no Control Hub.";
}
