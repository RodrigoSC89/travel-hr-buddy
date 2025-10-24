import type { BridgeLinkData } from "../types";

import { logger } from "@/lib/logger";
/**
 * Fetch BridgeLink data from API
 * Connects to DP Intelligence Center and SGSO systems
 */
export async function getBridgeLinkData(): Promise<BridgeLinkData> {
  try {
    const response = await fetch("/api/bridgelink/data");
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();

    return {
      dpEvents: data.events || [],
      riskAlerts: data.alerts || [],
      status: data.status || "Desconhecido",
      systemStatus: data.systemStatus,
    };
  } catch (error) {
    console.error("Erro ao carregar dados do BridgeLink:", error);
    
    // Return empty data with offline status on error
    return {
      dpEvents: [],
      riskAlerts: [],
      status: "Offline",
    };
  }
}

/**
 * Connect to WebSocket stream for real-time DP events
 * @param onMessage Callback for new events
 * @returns Cleanup function to close the connection
 */
export function connectToLiveStream(
  onMessage: (event: any) => void
): () => void {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const wsUrl = `${protocol}//${window.location.host}/api/dp-intelligence/stream`;
  
  let ws: WebSocket | null = null;
  
  try {
    ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      logger.info("🟢 BridgeLink WebSocket conectado");
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (error) {
        console.error("Erro ao processar mensagem WebSocket:", error);
      }
    };
    
    ws.onerror = (error) => {
      console.error("❌ Erro no WebSocket BridgeLink:", error);
    };
    
    ws.onclose = () => {
      logger.info("🔴 BridgeLink WebSocket desconectado");
    };
  } catch (error) {
    console.error("Erro ao conectar WebSocket:", error);
  }
  
  // Return cleanup function
  return () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.close();
    }
  };
}

/**
 * Export report in PDF format
 */
export async function exportReportPDF(data: BridgeLinkData): Promise<Blob> {
  const response = await fetch("/api/bridgelink/export/pdf", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error("Falha ao exportar relatório PDF");
  }
  
  return response.blob();
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
  // Simple signature based on data hash
  // In production, use proper cryptographic signing
  const dataString = JSON.stringify(data);
  let hash = 0;
  
  for (let i = 0; i < dataString.length; i++) {
    const char = dataString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return `BRIDGE-${Math.abs(hash).toString(16).toUpperCase()}-${Date.now()}`;
}
