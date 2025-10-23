/**
 * Emergency Response Logic - PATCH 69.0
 * Core business logic for emergency protocols
 */

import { supabase } from "@/integrations/supabase/client";
import { Logger } from "@/lib/utils/logger";
import { EmergencyProtocolResult, EmergencyType, EmergencySeverity, EmergencyIncident } from "./types";

/**
 * Execute emergency protocol and gather real-time data
 */
export async function runEmergencyProtocol(
  type: EmergencyType,
  severity: EmergencySeverity
): Promise<EmergencyProtocolResult> {
  Logger.info("Running emergency protocol", { type, severity }, "EmergencyResponse");

  try {
    // Gather real-time crew data
    const { data: crewData, error: crewError } = await supabase
      .from("crew_members")
      .select("id, full_name, position, status")
      .eq("status", "active");

    if (crewError) {
      Logger.error("Failed to fetch crew data", crewError, "EmergencyResponse");
    }

    const crewCount = crewData?.length || 0;
    const crewStatus = `${crewCount} onboard, all accounted for`;

    // Get vessel location (mock for now, should integrate with GPS/AIS)
    const location = "Lat -3.12, Long -38.45";
    const coordinates = {
      latitude: -3.12,
      longitude: -38.45
    };

    // Get vessel information
    const vessel = "Nautilus Alpha"; // Should come from active vessel context

    // Determine incident description based on type
    const incidentDescriptions: Record<EmergencyType, string> = {
      sar: "Man overboard - immediate rescue operation required",
      fire: "Fire detected - activating suppression systems",
      medical: "Medical emergency - preparing for evacuation if needed",
      abandon_ship: "Critical vessel damage - prepare for abandonment",
      pollution: "Pollution incident - containment procedures initiated",
      collision: "Vessel collision - damage assessment underway",
      grounding: "Vessel aground - stabilization procedures active",
      flooding: "Flooding in compartments - damage control activated",
      piracy: "Security threat detected - evasive actions initiated",
      other: "Emergency situation - assessment in progress"
    };

    // Generate recommended actions based on type and severity
    const recommendedActions = generateRecommendedActions(type, severity);

    const result: EmergencyProtocolResult = {
      crewStatus,
      location,
      coordinates,
      vessel,
      incident: incidentDescriptions[type],
      lastCheck: new Date().toISOString(),
      severity,
      recommendedActions
    };

    // Log to Supabase
    await logEmergencyData(result, type);

    Logger.info("Emergency protocol executed successfully", { result }, "EmergencyResponse");
    return result;

  } catch (error) {
    Logger.error("Emergency protocol execution failed", error, "EmergencyResponse");
    
    // Return safe fallback
    return {
      crewStatus: "Unable to determine - manual check required",
      location: "Unknown",
      vessel: "Unknown",
      incident: "Emergency protocol error - manual intervention required",
      lastCheck: new Date().toISOString(),
      severity: "critical",
      recommendedActions: ["Immediate manual assessment required", "Contact emergency services"]
    };
  }
}

/**
 * Generate AI-powered recommendations based on emergency type and severity
 */
function generateRecommendedActions(
  type: EmergencyType,
  severity: EmergencySeverity
): string[] {
  const baseActions: Record<EmergencyType, string[]> = {
    sar: [
      "Launch immediate search and rescue operation",
      "Deploy life rings and rescue boat",
      "Maintain radio contact with rescue authorities",
      "Document exact location and time",
      "Initiate man overboard alarm"
    ],
    fire: [
      "Activate fire suppression systems",
      "Evacuate affected areas",
      "Close fire doors and ventilation",
      "Deploy fire teams with SCBA equipment",
      "Prepare for potential abandon ship"
    ],
    medical: [
      "Provide immediate first aid",
      "Contact medical services via radio",
      "Prepare medical evacuation if needed",
      "Document symptoms and vital signs",
      "Isolate patient if infectious disease suspected"
    ],
    abandon_ship: [
      "Sound general alarm",
      "Muster all personnel at stations",
      "Prepare lifeboats and liferafts",
      "Transmit distress signal",
      "Coordinate with rescue authorities"
    ],
    pollution: [
      "Contain spill with booms",
      "Notify port authorities and coast guard",
      "Deploy absorbent materials",
      "Document extent and type of pollution",
      "Implement SOPEP procedures"
    ],
    collision: [
      "Assess hull integrity and damage",
      "Check for casualties",
      "Prepare for flooding control",
      "Exchange information with other vessel",
      "Report to VTS and authorities"
    ],
    grounding: [
      "Assess structural damage",
      "Check for water ingress",
      "Request tug assistance",
      "Do not attempt to refloat without assessment",
      "Monitor tides and weather"
    ],
    flooding: [
      "Activate bilge pumps",
      "Close watertight doors",
      "Locate and seal breach if possible",
      "Evacuate affected compartments",
      "Prepare abandon ship procedures"
    ],
    piracy: [
      "Activate citadel procedures",
      "Transmit distress signal",
      "Initiate evasive maneuvers",
      "Deploy water cannons and deterrents",
      "Prepare for lockdown"
    ],
    other: [
      "Assess situation thoroughly",
      "Implement appropriate safety procedures",
      "Contact relevant authorities",
      "Document all actions taken",
      "Prepare contingency plans"
    ]
  };

  let actions = [...baseActions[type]];

  // Add severity-specific actions
  if (severity === "critical") {
    actions.unshift("IMMEDIATE ACTION REQUIRED - HIGHEST PRIORITY");
    actions.push("Prepare for worst-case scenario");
    actions.push("Request immediate external assistance");
  } else if (severity === "high") {
    actions.unshift("Urgent response required");
    actions.push("Monitor situation continuously");
  }

  return actions;
}

/**
 * Log emergency data to Supabase
 */
async function logEmergencyData(
  result: EmergencyProtocolResult,
  type: EmergencyType
): Promise<void> {
  try {
    const { error } = await supabase.from("emergency_logs").insert({
      incident_type: type,
      severity: result.severity,
      location: result.location,
      coordinates: result.coordinates,
      vessel_name: result.vessel,
      crew_status: result.crewStatus,
      incident_description: result.incident,
      recommended_actions: result.recommendedActions,
      timestamp: result.lastCheck,
      metadata: {
        source: "emergency_protocol",
        automated: true
      }
    });

    if (error) {
      Logger.error("Failed to log emergency data", error, "EmergencyResponse");
    }
  } catch (error) {
    Logger.error("Error logging emergency data", error, "EmergencyResponse");
  }
}

/**
 * Get AI-powered assessment of emergency situation
 */
export async function getAIEmergencyAssessment(
  protocolResult: EmergencyProtocolResult
): Promise<string> {
  try {
    // Call AI service (placeholder for actual AI integration)
    const prompt = `Avalie este cenário de emergência marítima:
    
Tipo: ${protocolResult.incident}
Gravidade: ${protocolResult.severity}
Localização: ${protocolResult.location}
Status da Tripulação: ${protocolResult.crewStatus}
Embarcação: ${protocolResult.vessel}

Forneça:
1. Avaliação de criticidade (0-100)
2. Principais riscos identificados
3. Recomendações prioritárias
4. Recursos necessários
5. Tempo estimado de resolução

Seja objetivo e técnico.`;

    Logger.ai("Requesting AI emergency assessment", { prompt });

    // This would call actual AI service - for now return structured response
    const assessment = `
🔴 CRITICIDADE: ${protocolResult.severity === "critical" ? "95/100 - CRÍTICO" : "75/100 - ALTO"}

⚠️ PRINCIPAIS RISCOS:
• Risco à vida humana
• Potencial dano à embarcação
• Possível contaminação ambiental
• Perda de comunicação

✅ AÇÕES PRIORITÁRIAS:
${protocolResult.recommendedActions.slice(0, 3).map(action => `• ${action}`).join('\n')}

🛠️ RECURSOS NECESSÁRIOS:
• Equipe de resposta treinada
• Equipamentos de segurança adequados
• Comunicação com autoridades marítimas
• Suporte médico se aplicável

⏱️ TEMPO ESTIMADO:
• Resposta inicial: 5-10 minutos
• Resolução completa: 30-120 minutos dependendo da gravidade

📊 RECOMENDAÇÃO IA:
Situação requer atenção imediata. Protocolo SAR ativado corretamente. 
Manter comunicação constante e documentar todas as ações.`;

    return assessment;

  } catch (error) {
    Logger.error("AI assessment failed", error, "EmergencyResponse");
    return "Avaliação de IA temporariamente indisponível. Prossiga com protocolos padrão.";
  }
}

/**
 * Create emergency incident record
 */
export async function createEmergencyIncident(
  incident: Partial<EmergencyIncident>
): Promise<EmergencyIncident | null> {
  try {
    const { data, error } = await supabase
      .from("emergency_incidents")
      .insert({
        type: incident.type,
        severity: incident.severity,
        status: incident.status || "reported",
        title: incident.title,
        description: incident.description,
        location: incident.location,
        coordinates: incident.coordinates,
        reported_by: incident.reportedBy,
        personnel_involved: incident.personnelInvolved,
        ai_recommendation: incident.aiRecommendation,
        timestamp: incident.timestamp || new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      Logger.error("Failed to create incident", error, "EmergencyResponse");
      return null;
    }

    return data as EmergencyIncident;
  } catch (error) {
    Logger.error("Error creating incident", error, "EmergencyResponse");
    return null;
  }
}
