/// <reference lib="deno.ns" />
/**
 * Supabase Edge Function: Space Weather Status
 * 
 * Expõe dados do DP ASOG Service (Python FastAPI) via Edge Function.
 * 
 * Endpoints:
 * - GET /space-weather-status?lat=<lat>&lon=<lon>&hours=<hours>
 * 
 * Exemplo:
 * GET /space-weather-status?lat=-22.9&lon=-43.2&hours=6
 * 
 * Response:
 * {
 *   "status": "GREEN",
 *   "kp": 3.0,
 *   "pdop": 2.1,
 *   "dp_gate": "PROCEED",
 *   "recommendations": ["..."],
 *   "data_source": "DP_ASOG"
 * }
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// ============================================================================
// Types
// ============================================================================

interface DPASOGStatusResponse {
  status: 'GREEN' | 'AMBER' | 'RED';
  reasons: string[];
  kp: number;
  worst_pdop: number;
  avg_pdop?: number;
  tec?: number;
  timestamp?: string;
}

interface DPASOGPDOPPoint {
  time: string;
  pdop: number;
  hdop: number;
  vdop: number;
  tdop?: number;
  gdop?: number;
  satellites: number;
}

interface DPASOGPDOPResponse {
  latitude: number;
  longitude: number;
  altitude_m: number;
  elevation_mask_deg: number;
  constellations: string[];
  timeline: DPASOGPDOPPoint[];
  worst_pdop: number;
  best_pdop: number;
  avg_pdop: number;
}

// ============================================================================
// Configuration
// ============================================================================

const DP_ASOG_SERVICE_URL = Deno.env.get('DP_ASOG_SERVICE_URL') || 'http://localhost:8000';
const DP_ASOG_TIMEOUT_MS = 10000;

// ============================================================================
// DP ASOG Client
// ============================================================================

class DPASOGClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async getStatus(
    lat: number,
    lon: number,
    hours = 6,
    alt = 0
  ): Promise<DPASOGStatusResponse> {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lon: lon.toString(),
      hours: hours.toString(),
      alt: alt.toString(),
    });

    const url = `${this.baseUrl}/status?${params.toString()}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), DP_ASOG_TIMEOUT_MS);

    try {
      const response = await fetch(url, { signal: controller.signal });
      
      if (!response.ok) {
        throw new Error(`DP ASOG error: ${response.status}`);
      }
      
      return await response.json();
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async getPDOP(
    lat: number,
    lon: number,
    hours = 6,
    stepMin = 5,
    elevMask = 10,
    constellations = 'GPS,GALILEO'
  ): Promise<DPASOGPDOPResponse> {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lon: lon.toString(),
      hours: hours.toString(),
      step_min: stepMin.toString(),
      elev_mask: elevMask.toString(),
      constellations,
    });

    const url = `${this.baseUrl}/gnss/pdop?${params.toString()}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), DP_ASOG_TIMEOUT_MS);

    try {
      const response = await fetch(url, { signal: controller.signal });
      
      if (!response.ok) {
        throw new Error(`DP ASOG error: ${response.status}`);
      }
      
      return await response.json();
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async getKp(): Promise<{ kp: number; timestamp: string }> {
    const url = `${this.baseUrl}/spaceweather/kp`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), DP_ASOG_TIMEOUT_MS);

    try {
      const response = await fetch(url, { signal: controller.signal });
      
      if (!response.ok) {
        throw new Error(`DP ASOG error: ${response.status}`);
      }
      
      return await response.json();
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

// ============================================================================
// Handler
// ============================================================================

serve(async (req: Request) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    
    // Parse query params
    const lat = parseFloat(url.searchParams.get('lat') || '0');
    const lon = parseFloat(url.searchParams.get('lon') || '0');
    const hours = parseInt(url.searchParams.get('hours') || '6');
    const alt = parseFloat(url.searchParams.get('alt') || '0');
    const stepMin = parseInt(url.searchParams.get('step_min') || '5');
    const elevMask = parseInt(url.searchParams.get('elev_mask') || '10');
    const constellations = url.searchParams.get('constellations') || 'GPS,GALILEO';
    const mode = url.searchParams.get('mode') || 'status'; // status | pdop | kp

    // Validate
    if (isNaN(lat) || isNaN(lon)) {
      return new Response(
        JSON.stringify({ error: 'Invalid lat/lon parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const client = new DPASOGClient(DP_ASOG_SERVICE_URL);

    // Route by mode
    if (mode === 'kp') {
      // GET /space-weather-status?mode=kp
      const kpData = await client.getKp();
      
      return new Response(
        JSON.stringify({
          kp: kpData.kp,
          timestamp: kpData.timestamp,
          risk_level: kpData.kp >= 7 ? 'RED' : kpData.kp >= 5 ? 'AMBER' : 'GREEN',
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (mode === 'pdop') {
      // GET /space-weather-status?mode=pdop&lat=...&lon=...
      const pdopData = await client.getPDOP(lat, lon, hours, stepMin, elevMask, constellations);
      
      return new Response(
        JSON.stringify({
          latitude: pdopData.latitude,
          longitude: pdopData.longitude,
          timeline: pdopData.timeline,
          worst_pdop: pdopData.worst_pdop,
          best_pdop: pdopData.best_pdop,
          avg_pdop: pdopData.avg_pdop,
          quality: pdopData.worst_pdop < 3 ? 'EXCELLENT' :
                   pdopData.worst_pdop < 6 ? 'GOOD' :
                   pdopData.worst_pdop < 10 ? 'MODERATE' : 'POOR',
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Default: status mode
    // GET /space-weather-status?lat=...&lon=...&hours=...
    const [statusData, pdopData] = await Promise.all([
      client.getStatus(lat, lon, hours, alt),
      client.getPDOP(lat, lon, hours, stepMin, elevMask, constellations).catch(() => null),
    ]);

    const dpGateStatus = 
      statusData.status === 'RED' ? 'HOLD' :
      statusData.status === 'AMBER' ? 'CAUTION' :
      'PROCEED';

    const response = {
      // Summary
      status: statusData.status,
      dp_gate: dpGateStatus,
      timestamp: new Date().toISOString(),
      
      // Space weather
      kp: statusData.kp,
      kp_risk: statusData.kp >= 7 ? 'HIGH' : statusData.kp >= 5 ? 'MODERATE' : 'LOW',
      
      // GNSS
      worst_pdop: statusData.worst_pdop,
      avg_pdop: statusData.avg_pdop || statusData.worst_pdop,
      pdop_quality: statusData.worst_pdop < 3 ? 'EXCELLENT' :
                    statusData.worst_pdop < 6 ? 'GOOD' :
                    statusData.worst_pdop < 10 ? 'MODERATE' : 'POOR',
      
      // Reasons & recommendations
      reasons: statusData.reasons,
      recommendations: buildRecommendations(statusData, pdopData),
      
      // Optional PDOP timeline
      pdop_timeline: pdopData?.timeline || null,
      
      // Metadata
      data_source: 'DP_ASOG',
      location: { latitude: lat, longitude: lon, altitude_m: alt },
      analysis_window_hours: hours,
    };

    return new Response(
      JSON.stringify(response, null, 2),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in space-weather-status function:', error);
    
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        data_source: 'ERROR',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// ============================================================================
// Helpers
// ============================================================================

function buildRecommendations(
  status: DPASOGStatusResponse,
  pdop: DPASOGPDOPResponse | null
): string[] {
  const recommendations: string[] = [];

  if (status.status === 'RED') {
    recommendations.push('🔴 DP GATE: HOLD - Conditions unfavorable for DP operations');
    recommendations.push('⚠️ Consider postponing operations if possible');
    recommendations.push('→ If critical, activate backup systems (INS/radar)');
    recommendations.push('→ Increase monitoring frequency to 1-min intervals');
    
    if (status.kp >= 7) {
      recommendations.push(`⚠️ Strong geomagnetic storm (Kp ${status.kp}) - expect GNSS degradation`);
    }
    
    if (status.worst_pdop >= 10) {
      recommendations.push(`⚠️ Very poor GNSS geometry (PDOP ${status.worst_pdop.toFixed(1)})`);
    }
  } else if (status.status === 'AMBER') {
    recommendations.push('🟡 DP GATE: CAUTION - Monitor conditions closely');
    recommendations.push('→ Increase monitoring frequency to 5-min intervals');
    recommendations.push('→ Verify backup systems are ready');
    recommendations.push('→ Consider dual-frequency GNSS (L1+L5)');
    
    if (status.kp >= 5) {
      recommendations.push(`⚠️ Minor geomagnetic storm (Kp ${status.kp}) - monitor GNSS quality`);
    }
    
    if (status.worst_pdop >= 6) {
      recommendations.push(`⚠️ Moderate GNSS geometry (PDOP ${status.worst_pdop.toFixed(1)})`);
    }
  } else {
    recommendations.push('🟢 DP GATE: PROCEED - Conditions nominal');
    recommendations.push(`→ Kp ${status.kp} (quiet to unsettled)`);
    recommendations.push(`→ PDOP ${status.worst_pdop.toFixed(1)} (good geometry)`);
    
    if (pdop?.constellations) {
      recommendations.push(`→ Using: ${pdop.constellations.join(', ')}`);
    }
  }

  // Best window (if PDOP timeline available)
  if (pdop?.timeline && pdop.timeline.length > 0) {
    const sortedByPDOP = [...pdop.timeline].sort((a, b) => a.pdop - b.pdop);
    const bestWindow = sortedByPDOP[0];
    
    if (bestWindow && bestWindow.pdop < status.worst_pdop) {
      const time = new Date(bestWindow.time).toISOString().slice(11, 16);
      recommendations.push(`💡 Best window: ${time} UTC (PDOP ${bestWindow.pdop.toFixed(1)})`);
    }
  }

  return recommendations;
}
