import { supabase } from "@/integrations/supabase/client";
import mqtt from "mqtt";
import { runComplianceAudit } from "@/lib/compliance/ai-compliance-engine";
import { logger } from "@/lib/logger";

interface IncidentEvent {
  type?: string;
  description?: string;
  data: Record<string, unknown>;
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
 * Handles incident detection and response workflow
 * @param event - Incident event containing type, description and data
 * @returns Generated incident report
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

  try {
    // Use type assertion - incident_reports schema may differ from generated types
    const { error } = await (supabase as unknown as { from: (table: string) => { insert: (data: Record<string, unknown>) => Promise<{ error: { message: string } | null }> } }).from("incident_reports").insert({
      incident_date: report.timestamp,
      incident_type: report.type,
      description: report.description,
      severity: mapLevelToSeverity(report.level),
      status: "new",
    });
    
    if (error) {
      logger.warn("Failed to save incident report", { error: error.message, reportId: report.id });
    }
  } catch (err) {
    logger.warn("Error saving incident report", { 
      error: err instanceof Error ? err.message : String(err),
      reportId: report.id 
    });
  }

  // Optional MQTT publishing (if configured)
  try {
    const mqttUrl = (import.meta as { env: Record<string, string | undefined> }).env.VITE_MQTT_URL;
    if (mqttUrl) {
      const client = mqtt.connect(mqttUrl);
      client.publish("nautilus/incidents/alert", JSON.stringify(report));
    }
  } catch (error) {
    logger.warn("MQTT publishing skipped", { 
      error: error instanceof Error ? error.message : String(error),
      reportId: report.id 
    });
  }

  return report;
}

/**
 * Maps compliance level to severity
 */
function mapLevelToSeverity(level: string): string {
  switch (level) {
    case "Crítico": return "critical";
    case "Risco": return "high";
    case "Atenção": return "medium";
    default: return "low";
  }
}

/**
 * Generates AI recommendations based on compliance level and incident type
 */
function getRecommendation(level: string, type?: string): string {
  if (level === "Conforme") return "Nenhuma ação necessária. Manter monitoramento.";
  if (level === "Risco") return `Verificar sistemas de suporte relacionados (${type || 'geral'}). Reavaliar ASOG.`;
  return "Executar resposta imediata. Acionar protocolo ISM/ISPS e registrar no Control Hub.";
}
