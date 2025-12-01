/**
 * Incident Response AI Core
 * Automated incident detection and compliance tracking for Nautilus One
 * Aligned with IMCA, ISM, and ISPS maritime standards
 */

import { supabase } from "@/integrations/supabase/client";
import mqtt from "mqtt";
import { logger } from "@/lib/logger";

interface IncidentReport {
  type: string;
  severity: "Critical" | "Major" | "Moderate" | "Minor";
  message: string;
  module: string;
}

interface IncidentResponse {
  id: string;
  timestamp: string;
  module: string;
  type: string;
  severity: string;
  message: string;
  riskScore: number;
  compliance: string[];
}

/**
 * Calculate risk score based on severity level
 */
function calculateRiskScore(severity: string): number {
  const riskScores: Record<string, number> = {
    Critical: 0.9,
    Major: 0.7,
    Moderate: 0.4,
    Minor: 0.2,
  };
  return riskScores[severity] || 0.2;
}

/**
 * Map incident types to relevant maritime compliance standards
 */
function mapComplianceStandards(type: string, severity: string): string[] {
  const standards: string[] = [];
  
  // Critical incidents always require comprehensive compliance
  if (severity === "Critical") {
    standards.push("ISM Code 9.1", "ISM Code 10.2", "ISPS Code Part B-16");
  }

  // Map specific incident types to standards
  const typeMapping: Record<string, string[]> = {
    "DP Failure": ["IMCA M109", "IMCA M254", "ISM Code 10.2"],
    "Equipment Failure": ["IMCA M140", "ISM Code 10.3"],
    "Safety Alert": ["ISM Code 9.1", "ISPS Code Part B-16"],
    "Maintenance Delay": ["IMCA M103", "ISM Code 10.3"],
    "System Event": ["IMO MSC.428(98)", "MTS Guidelines"],
    "Operational Anomaly": ["IMCA M166", "NORMAM 101"],
  };

  const mappedStandards = typeMapping[type] || ["MTS Guidelines", "NORMAM 101"];
  standards.push(...mappedStandards);

  // Remove duplicates
  return [...new Set(standards)];
}

/**
 * Handles incident report and publishes to MQTT and Supabase
 * @param incident - Incident report details
 * @returns Incident response with risk score and compliance standards
 */
export async function handleIncidentReport(
  incident: IncidentReport
): Promise<IncidentResponse> {
  const riskScore = calculateRiskScore(incident.severity);
  const compliance = mapComplianceStandards(incident.type, incident.severity);

  const response: IncidentResponse = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    module: incident.module,
    type: incident.type,
    severity: incident.severity,
    message: incident.message,
    riskScore,
    compliance,
  };

  // Persist to Supabase
  try {
    await (supabase as any).from("incident_reports").insert({
      id: response.id,
      timestamp: response.timestamp,
      module: response.module,
      type: response.type,
      severity: response.severity,
      message: response.message,
      riskScore: response.riskScore,
      compliance: response.compliance,
    });
  } catch (error) {
    logger.error("Failed to save incident to Supabase", error as Error, { 
      incidentId: response.id,
      type: response.type,
      severity: response.severity 
    });
  }

  // Publish MQTT alert
  try {
    const mqttUrl = import.meta.env.VITE_MQTT_URL;
    if (mqttUrl) {
      const client = mqtt.connect(mqttUrl);
      client.on("connect", () => {
        client.publish(
          "nautilus/incidents/alert",
          JSON.stringify(response),
          () => {
            client.end();
          }
        );
      });
    }
  } catch (error) {
    logger.warn("MQTT publishing skipped", { 
      error: error instanceof Error ? error.message : String(error),
      incidentId: response.id 
    });
  }

  return response;
}
