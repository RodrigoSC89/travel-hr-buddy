/**
 * Tide Alerts Service - Monitor extreme tides and send alerts to NOC
 * PATCH 862: Integration with NOC notification system
 */

import { supabase } from "@/integrations/supabase/client";
import { getTidalData } from "./weather-fallback.service";
import { addDays, parseISO, differenceInHours, format } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface TideAlert {
  id: string;
  port: PortConfig;
  tide: TideExtreme;
  severity: 'warning' | 'critical';
  message: string;
  timeUntil: number; // hours
  createdAt: string;
}

export interface TideExtreme {
  time: string;
  type: 'high' | 'low';
  height: number;
}

export interface PortConfig {
  id: string;
  name: string;
  lat: number;
  lon: number;
  thresholds: {
    highTideWarning: number;  // meters
    highTideCritical: number;
    lowTideWarning: number;
    lowTideCritical: number;
  };
}

// Brazilian ports configuration with alert thresholds
export const BRAZILIAN_PORTS: PortConfig[] = [
  {
    id: 'rio-de-janeiro',
    name: 'Rio de Janeiro',
    lat: -22.9068,
    lon: -43.1729,
    thresholds: { highTideWarning: 1.4, highTideCritical: 1.7, lowTideWarning: 0.2, lowTideCritical: 0.1 }
  },
  {
    id: 'santos',
    name: 'Santos',
    lat: -23.9548,
    lon: -46.3329,
    thresholds: { highTideWarning: 1.5, highTideCritical: 1.8, lowTideWarning: 0.15, lowTideCritical: 0.05 }
  },
  {
    id: 'paranagua',
    name: 'Paranaguá',
    lat: -25.5163,
    lon: -48.5225,
    thresholds: { highTideWarning: 1.6, highTideCritical: 2.0, lowTideWarning: 0.2, lowTideCritical: 0.1 }
  },
  {
    id: 'recife',
    name: 'Recife',
    lat: -8.0476,
    lon: -34.8770,
    thresholds: { highTideWarning: 2.0, highTideCritical: 2.4, lowTideWarning: 0.3, lowTideCritical: 0.15 }
  },
  {
    id: 'salvador',
    name: 'Salvador',
    lat: -12.9714,
    lon: -38.5014,
    thresholds: { highTideWarning: 2.2, highTideCritical: 2.6, lowTideWarning: 0.25, lowTideCritical: 0.1 }
  },
  {
    id: 'manaus',
    name: 'Manaus',
    lat: -3.1190,
    lon: -60.0217,
    thresholds: { highTideWarning: 8.0, highTideCritical: 10.0, lowTideWarning: 2.0, lowTideCritical: 1.0 }
  },
  {
    id: 'belem',
    name: 'Belém',
    lat: -1.4558,
    lon: -48.4902,
    thresholds: { highTideWarning: 3.5, highTideCritical: 4.0, lowTideWarning: 0.5, lowTideCritical: 0.2 }
  },
  {
    id: 'fortaleza',
    name: 'Fortaleza',
    lat: -3.7319,
    lon: -38.5267,
    thresholds: { highTideWarning: 2.8, highTideCritical: 3.2, lowTideWarning: 0.3, lowTideCritical: 0.15 }
  },
  {
    id: 'vitoria',
    name: 'Vitória',
    lat: -20.3155,
    lon: -40.3128,
    thresholds: { highTideWarning: 1.5, highTideCritical: 1.8, lowTideWarning: 0.2, lowTideCritical: 0.1 }
  },
  {
    id: 'itajai',
    name: 'Itajaí',
    lat: -26.9078,
    lon: -48.6619,
    thresholds: { highTideWarning: 1.3, highTideCritical: 1.6, lowTideWarning: 0.15, lowTideCritical: 0.05 }
  }
];

/**
 * Check all ports for extreme tides and generate alerts
 */
export async function checkAllPortsForAlerts(): Promise<TideAlert[]> {
  const alerts: TideAlert[] = [];
  
  for (const port of BRAZILIAN_PORTS) {
    try {
      const portAlerts = await checkPortForAlerts(port);
      alerts.push(...portAlerts);
    } catch (error) {
      console.error(`[TideAlerts] Error checking ${port.name}:`, error);
    }
  }
  
  return alerts.sort((a, b) => a.timeUntil - b.timeUntil);
}

/**
 * Check a specific port for extreme tides
 */
export async function checkPortForAlerts(port: PortConfig): Promise<TideAlert[]> {
  const alerts: TideAlert[] = [];
  const now = new Date();
  
  try {
    const tidalData = await getTidalData(port.lat, port.lon, now, addDays(now, 3));
    
    for (const tide of tidalData.extremes || []) {
      const tideTime = parseISO(tide.time);
      const hoursUntil = differenceInHours(tideTime, now);
      
      // Only alert for tides within the next 48 hours
      if (hoursUntil < 0 || hoursUntil > 48) continue;
      
      const alert = evaluateTideAlert(port, tide, hoursUntil);
      if (alert) {
        alerts.push(alert);
      }
    }
  } catch (error) {
    console.error(`[TideAlerts] Failed to get tidal data for ${port.name}:`, error);
  }
  
  return alerts;
}

/**
 * Evaluate if a tide should trigger an alert
 */
function evaluateTideAlert(
  port: PortConfig, 
  tide: TideExtreme, 
  hoursUntil: number
): TideAlert | null {
  const { thresholds } = port;
  let severity: 'warning' | 'critical' | null = null;
  let message = '';
  
  if (tide.type === 'high') {
    if (tide.height >= thresholds.highTideCritical) {
      severity = 'critical';
      message = `⚠️ MARÉ ALTA CRÍTICA em ${port.name}: ${tide.height.toFixed(2)}m`;
    } else if (tide.height >= thresholds.highTideWarning) {
      severity = 'warning';
      message = `🌊 Maré alta elevada em ${port.name}: ${tide.height.toFixed(2)}m`;
    }
  } else {
    if (tide.height <= thresholds.lowTideCritical) {
      severity = 'critical';
      message = `⚠️ MARÉ BAIXA CRÍTICA em ${port.name}: ${tide.height.toFixed(2)}m`;
    } else if (tide.height <= thresholds.lowTideWarning) {
      severity = 'warning';
      message = `📉 Maré baixa extrema em ${port.name}: ${tide.height.toFixed(2)}m`;
    }
  }
  
  if (!severity) return null;
  
  const timeStr = format(parseISO(tide.time), "dd/MM HH:mm", { locale: ptBR });
  
  return {
    id: `${port.id}-${tide.time}-${tide.type}`,
    port,
    tide,
    severity,
    message: `${message} - Previsto para ${timeStr}`,
    timeUntil: hoursUntil,
    createdAt: new Date().toISOString()
  };
}

/**
 * Send tide alerts to NOC notification system
 */
export async function sendTideAlertsToNOC(alerts: TideAlert[]): Promise<void> {
  for (const alert of alerts) {
    // Log alerts to console (can be extended to database when table is created)
    console.log(`[TideAlerts] NOC Alert: ${alert.severity.toUpperCase()} - ${alert.message}`);
    
    // Store in localStorage for NOC dashboard to read
    const existingAlerts = JSON.parse(localStorage.getItem('noc_tide_alerts') || '[]');
    const newAlerts = [...existingAlerts.filter((a: TideAlert) => a.id !== alert.id), alert];
    localStorage.setItem('noc_tide_alerts', JSON.stringify(newAlerts.slice(-50))); // Keep last 50
  }
}

/**
 * Get current tide alerts summary for dashboard
 */
export async function getTideAlertsSummary(): Promise<{
  total: number;
  critical: number;
  warning: number;
  alerts: TideAlert[];
}> {
  const alerts = await checkAllPortsForAlerts();
  
  return {
    total: alerts.length,
    critical: alerts.filter(a => a.severity === 'critical').length,
    warning: alerts.filter(a => a.severity === 'warning').length,
    alerts
  };
}
