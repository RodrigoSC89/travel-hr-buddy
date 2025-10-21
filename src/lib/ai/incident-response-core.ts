// @ts-nocheck
import { supabase } from "@/integrations/supabase/client";
import mqtt from "mqtt";

export async function handleIncidentReport(event) {
  const { type, severity, message, module } = event;

  const riskScore = calculateRisk(type, severity);
  const compliance = matchStandards(type);

  await supabase.from("incident_reports").insert({
    timestamp: new Date().toISOString(),
    module,
    type,
    severity,
    message,
    riskScore,
    compliance,
  });

  const client = mqtt.connect(import.meta.env.VITE_MQTT_URL);
  client.publish("nautilus/incidents/alert", JSON.stringify({ type, severity, message }));

  return { riskScore, compliance };
}

function calculateRisk(type, severity) {
  const weights = { Critical: 0.9, Major: 0.7, Moderate: 0.4, Minor: 0.2 };
  return weights[severity] || 0.1;
}

function matchStandards(type) {
  const mapping = {
    "DP Failure": ["IMCA M109", "IMCA M254", "ISM Code 10.2"],
    "Cyber Breach": ["ISPS Code Part B-16", "IMO MSC.428(98)"],
    "Maintenance Delay": ["IMCA M140", "NORMAM 101", "ISM Code 10.3"],
    "Safety Alert": ["IMCA M103", "IMCA M166", "ISM Code 9.1"],
  };
  return mapping[type] || ["MTS Guidelines", "ISM Code"];
}
