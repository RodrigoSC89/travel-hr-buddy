import type { BridgeLinkData } from "../types";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import { FF_BRIDGELINK_LIVE_WS } from "@/lib/feature-flags";

/**
 * Fetch BridgeLink data from Supabase (real data)
 * Queries dp_events and risk alerts tables directly
 */
export async function getBridgeLinkData(): Promise<BridgeLinkData> {
  try {
    // Fetch DP events from Supabase
    const { data: eventsData, error: eventsError } = await (supabase.from as Function)("dp_events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (eventsError) {
      logger.warn("dp_events table not available, using empty state", eventsError);
    }

    // Fetch risk alerts
    const { data: alertsData, error: alertsError } = await (supabase.from as Function)("risk_alerts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    if (alertsError) {
      logger.warn("risk_alerts table not available, using empty state", alertsError);
    }

    // Determine system status based on data
    const dpEvents = (eventsData || []).map((e: any) => ({
      id: e.id,
      timestamp: e.created_at || e.timestamp,
      type: e.event_type || e.type || "unknown",
      severity: e.severity || "normal",
      system: e.system || "DP",
      description: e.description || "",
      vessel: e.vessel_name || e.vessel,
      location: e.location,
    }));

    const riskAlerts = (alertsData || []).map((a: any) => ({
      id: a.id,
      level: a.level || a.severity || "low",
      title: a.title || a.alert_type || "Alert",
      description: a.description || "",
      timestamp: a.created_at || a.timestamp,
      source: a.source || "system",
      recommendations: a.recommendations,
    }));

    const hasCritical = dpEvents.some((e: any) => e.severity === "critical");
    const hasDegraded = dpEvents.some((e: any) => e.severity === "degradation");
    const status = hasCritical ? "Critical" : hasDegraded ? "Degradation" : dpEvents.length > 0 ? "Normal" : "Sem dados";

    return {
      dpEvents,
      riskAlerts,
      status,
    };
  } catch (error) {
    logger.error("Erro ao carregar dados do BridgeLink:", error);
    return {
      dpEvents: [],
      riskAlerts: [],
      status: "Erro de conexão",
    };
  }
}

/**
 * Connect to live updates for DP events
 * Uses polling (real Supabase queries) as WebSocket substitute
 * Feature flag FF_BRIDGELINK_LIVE_WS controls this behavior
 * @param onMessage Callback for new events
 * @returns Cleanup function
 */
export function connectToLiveStream(
  onMessage: (event: any) => void
): () => void {
  if (FF_BRIDGELINK_LIVE_WS) {
    // Future: Real WebSocket implementation
    logger.info("🟢 BridgeLink WebSocket modo não implementado - usando polling");
  }

  // Polling-based live updates (every 5 seconds)
  let lastEventTime = new Date().toISOString();
  
  const pollInterval = setInterval(async () => {
    try {
      const { data, error } = await (supabase.from as Function)("dp_events")
        .select("*")
        .gt("created_at", lastEventTime)
        .order("created_at", { ascending: true })
        .limit(10);

      if (error) return;

      if (data && data.length > 0) {
        lastEventTime = data[data.length - 1].created_at;
        data.forEach((event: any) => {
          onMessage({
            type: event.event_type || event.type,
            description: event.description,
            severity: event.severity,
            timestamp: event.created_at,
          });
        });
      }
    } catch (err) {
      logger.error("Erro no polling BridgeLink:", err);
    }
  }, 5000);

  logger.info("🟢 BridgeLink polling ativo (5s interval)");

  return () => {
    clearInterval(pollInterval);
    logger.info("🔴 BridgeLink polling desconectado");
  };
}

/**
 * Export report in PDF format via Edge Function
 */
export async function exportReportPDF(data: BridgeLinkData): Promise<Blob> {
  const { data: pdfData, error } = await supabase.functions.invoke("pdf-generator", {
    body: {
      type: "bridgelink-report",
      content: data,
      title: "BridgeLink Report",
      timestamp: new Date().toISOString(),
    },
  });

  if (error) {
    throw new Error("Falha ao exportar relatório PDF");
  }

  // If the Edge Function returns base64 PDF
  if (pdfData?.pdf) {
    const binaryString = atob(pdfData.pdf);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return new Blob([bytes], { type: "application/pdf" });
  }

  throw new Error("Formato de resposta PDF inválido");
}

/**
 * Export report in JSON format
 */
export function exportReportJSON(data: BridgeLinkData): string {
  const exportData = {
    timestamp: new Date().toISOString(),
    data,
    signature: generateDigitalSignature(data),
  };
  return JSON.stringify(exportData, null, 2);
}

/**
 * Generate digital signature for audit trail
 */
function generateDigitalSignature(data: BridgeLinkData): string {
  const dataString = JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < dataString.length; i++) {
    const char = dataString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `BRIDGE-${Math.abs(hash).toString(16).toUpperCase()}-${Date.now()}`;
}
