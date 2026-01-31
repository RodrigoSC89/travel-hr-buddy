/**
 * DP ASOG Service Client
 * 
 * Cliente TypeScript para consumir o FastAPI dp-asog-service (Python backend).
 * 
 * Endpoints disponíveis:
 * - GET /spaceweather/kp → Kp observado (NOAA SWPC)
 * - GET /gnss/pdop → Série PDOP/HDOP/VDOP com SGP4 propagation
 * - GET /status → Status consolidado GREEN/AMBER/RED
 * 
 * Configuração:
 * - VITE_DP_ASOG_SERVICE_URL (default: http://localhost:8000)
 * 
 * @module services/space-weather/dp-asog-client
 */

import { logger } from "@/lib/logger";

// ============================================================================
// Types
// ============================================================================

export interface DPASOGKpResponse {
  /** Kp index (0-9 scale) */
  kp: number;
  /** ISO timestamp do dado */
  timestamp: string;
  /** Fonte (NOAA SWPC) */
  source: string;
}

export interface DPASOGPDOPPoint {
  /** ISO timestamp */
  time: string;
  /** Position Dilution of Precision */
  pdop: number;
  /** Horizontal Dilution of Precision */
  hdop: number;
  /** Vertical Dilution of Precision */
  vdop: number;
  /** Temporal Dilution of Precision */
  tdop?: number;
  /** Geometric Dilution of Precision */
  gdop?: number;
  /** Número de satélites visíveis */
  satellites: number;
}

export interface DPASOGPDOPResponse {
  /** Latitude do observador */
  latitude: number;
  /** Longitude do observador */
  longitude: number;
  /** Altitude em metros */
  altitude_m: number;
  /** Máscara de elevação (graus) */
  elevation_mask_deg: number;
  /** Constelações incluídas */
  constellations: string[];
  /** Timeline de DOP */
  timeline: DPASOGPDOPPoint[];
  /** Pior PDOP da janela */
  worst_pdop: number;
  /** Melhor PDOP da janela */
  best_pdop: number;
  /** Média de PDOP */
  avg_pdop: number;
}

export interface DPASOGStatusResponse {
  /** Status operacional */
  status: 'GREEN' | 'AMBER' | 'RED';
  /** Razões para o status */
  reasons: string[];
  /** Kp atual */
  kp: number;
  /** Pior PDOP da janela */
  worst_pdop: number;
  /** Média PDOP */
  avg_pdop?: number;
  /** TEC (se WAM-IPE ativo) */
  tec?: number;
  /** Timestamp da avaliação */
  timestamp?: string;
}

export interface DPASOGPDOPRequest {
  /** Latitude (-90 a 90) */
  lat: number;
  /** Longitude (-180 a 180) */
  lon: number;
  /** Altitude em metros */
  alt?: number;
  /** Janela de análise em horas */
  hours?: number;
  /** Intervalo de cálculo em minutos */
  step_min?: number;
  /** Máscara de elevação em graus */
  elev_mask?: number;
  /** Constelações (GPS, GALILEO, GLONASS, BEIDOU) */
  constellations?: string;
}

export interface DPASOGStatusRequest {
  /** Latitude */
  lat: number;
  /** Longitude */
  lon: number;
  /** Janela de análise em horas */
  hours?: number;
  /** Altitude em metros */
  alt?: number;
}

// ============================================================================
// Service Client
// ============================================================================

export class DPASOGClient {
  private baseUrl: string;
  private timeout: number;

  constructor(baseUrl?: string, timeout = 10000) {
    this.baseUrl = baseUrl || this.getDefaultBaseUrl();
    this.timeout = timeout;
  }

  private getDefaultBaseUrl(): string {
    // Tenta obter da env var, senão usa localhost
    if (typeof process !== 'undefined' && process.env?.VITE_DP_ASOG_SERVICE_URL) {
      return process.env.VITE_DP_ASOG_SERVICE_URL;
    }
    
    // Fallback para localhost (desenvolvimento)
    return 'http://localhost:8000';
  }

  /**
   * Fetch com timeout
   */
  private async fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * GET /spaceweather/kp
   * 
   * Obtém Kp index atual do NOAA SWPC.
   * 
   * @returns Kp observado
   * 
   * @example
   * ```typescript
   * const client = new DPASOGClient();
   * const kp = await client.getKp();
   * logger.debug(`Kp atual: ${kp.kp}`); // Kp atual: 3.0
   * ```
   */
  async getKp(): Promise<DPASOGKpResponse> {
    const url = `${this.baseUrl}/spaceweather/kp`;
    
    try {
      const response = await this.fetchWithTimeout(url);
      
      if (!response.ok) {
        throw new Error(`DP ASOG Service error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      logger.error('[DPASOGClient] Failed to fetch Kp', error as Error);
      throw new Error(`Failed to fetch Kp from DP ASOG Service: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * GET /gnss/pdop
   * 
   * Calcula série temporal de PDOP/HDOP/VDOP usando TLEs e SGP4 propagation.
   * 
   * @param request - Parâmetros da requisição
   * @returns Timeline de DOP
   * 
   * @example
   * ```typescript
   * const client = new DPASOGClient();
   * const pdop = await client.getPDOP({
   *   lat: -22.9,
   *   lon: -43.2,
   *   hours: 6,
   *   step_min: 5,
   *   elev_mask: 10,
   *   constellations: 'GPS,GALILEO'
   * });
   * 
   * logger.debug(`Pior PDOP: ${pdop.worst_pdop}`);
   * logger.debug(`Melhor PDOP: ${pdop.best_pdop}`);
   * pdop.timeline.forEach(p => {
   *   logger.debug(`${p.time}: PDOP=${p.pdop}, sats=${p.satellites}`);
   * });
   * ```
   */
  async getPDOP(request: DPASOGPDOPRequest): Promise<DPASOGPDOPResponse> {
    const params = new URLSearchParams();
    params.append('lat', request.lat.toString());
    params.append('lon', request.lon.toString());
    
    if (request.alt !== undefined) params.append('alt', request.alt.toString());
    if (request.hours !== undefined) params.append('hours', request.hours.toString());
    if (request.step_min !== undefined) params.append('step_min', request.step_min.toString());
    if (request.elev_mask !== undefined) params.append('elev_mask', request.elev_mask.toString());
    if (request.constellations) params.append('constellations', request.constellations);
    
    const url = `${this.baseUrl}/gnss/pdop?${params.toString()}`;
    
    try {
      const response = await this.fetchWithTimeout(url);
      
      if (!response.ok) {
        throw new Error(`DP ASOG Service error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      logger.error('[DPASOGClient] Failed to fetch PDOP', error as Error, { lat: request.lat, lon: request.lon, hours: request.hours });
      throw new Error(`Failed to fetch PDOP from DP ASOG Service: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * GET /status
   * 
   * Consolida Kp + pior PDOP da janela ⇒ GREEN/AMBER/RED.
   * 
   * Lógica de thresholds (configurável no asog.yml):
   * - RED: Kp >= 7 OR PDOP >= 6.0
   * - AMBER: Kp >= 5 OR PDOP >= 4.0
   * - GREEN: Caso contrário
   * 
   * @param request - Parâmetros da requisição
   * @returns Status ASOG
   * 
   * @example
   * ```typescript
   * const client = new DPASOGClient();
   * const status = await client.getStatus({
   *   lat: -22.9,
   *   lon: -43.2,
   *   hours: 6
   * });
   * 
   * logger.debug(`Status: ${status.status}`); // GREEN, AMBER ou RED
   * logger.debug(`Razões: ${status.reasons.join(', ')}`);
   * 
   * if (status.status === 'RED') {
   *   logger.debug('🔴 HOLD DP operations!');
   * } else if (status.status === 'AMBER') {
   *   logger.debug('🟡 CAUTION - Monitor closely');
   * } else {
   *   logger.debug('🟢 PROCEED');
   * }
   * ```
   */
  async getStatus(request: DPASOGStatusRequest): Promise<DPASOGStatusResponse> {
    const params = new URLSearchParams();
    params.append('lat', request.lat.toString());
    params.append('lon', request.lon.toString());
    
    if (request.hours !== undefined) params.append('hours', request.hours.toString());
    if (request.alt !== undefined) params.append('alt', request.alt.toString());
    
    const url = `${this.baseUrl}/status?${params.toString()}`;
    
    try {
      const response = await this.fetchWithTimeout(url);
      
      if (!response.ok) {
        throw new Error(`DP ASOG Service error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      logger.error('[DPASOGClient] Failed to fetch status', error as Error, { lat: request.lat, lon: request.lon, hours: request.hours });
      throw new Error(`Failed to fetch status from DP ASOG Service: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Health check do serviço
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/docs`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let dpASOGClientInstance: DPASOGClient | null = null;

/**
 * Obtém instância singleton do DPASOGClient
 */
export function getDPASOGClient(baseUrl?: string): DPASOGClient {
  if (!dpASOGClientInstance || baseUrl) {
    dpASOGClientInstance = new DPASOGClient(baseUrl);
  }
  return dpASOGClientInstance;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Quick helper: Kp atual
 */
export async function getKpFromDPASOG(): Promise<number> {
  const client = getDPASOGClient();
  const response = await client.getKp();
  return response.kp;
}

/**
 * Quick helper: Status ASOG para localização
 */
export async function quickDPASOGCheck(lat: number, lon: number, hours = 6): Promise<DPASOGStatusResponse> {
  const client = getDPASOGClient();
  return await client.getStatus({ lat, lon, hours });
}

/**
 * Quick helper: PDOP timeline
 */
export async function getPDOPTimeline(
  lat: number,
  lon: number,
  hours = 6,
  stepMin = 5,
  elevMask = 10
): Promise<DPASOGPDOPPoint[]> {
  const client = getDPASOGClient();
  const response = await client.getPDOP({
    lat,
    lon,
    hours,
    step_min: stepMin,
    elev_mask: elevMask,
    constellations: 'GPS,GALILEO',
  });
  return response.timeline;
}

// ============================================================================
// Mapping to Our Types
// ============================================================================

/**
 * Converte DPASOGStatusResponse para nosso SpaceWeatherStatus
 * (compatibilidade com nossa implementação TypeScript existente)
 */
export function mapDPASOGToSpaceWeatherStatus(
  dpasogStatus: DPASOGStatusResponse,
  dpasogPdop?: DPASOGPDOPResponse
): {
  risk_level: 'GREEN' | 'AMBER' | 'RED';
  dp_gate_status: 'PROCEED' | 'CAUTION' | 'HOLD';
  kp_current: number;
  pdop_current: number;
  recommendations: string[];
} {
  // Map status
  const risk_level = dpasogStatus.status;
  
  const dp_gate_status =
    risk_level === 'RED' ? 'HOLD' :
    risk_level === 'AMBER' ? 'CAUTION' :
    'PROCEED';
  
  // Recomendações baseadas no status
  const recommendations: string[] = [];
  
  if (risk_level === 'RED') {
    recommendations.push('🔴 DP GATE: HOLD - Conditions unfavorable');
    recommendations.push(...dpasogStatus.reasons.map(r => `⚠️ ${r}`));
    recommendations.push('→ Consider postponing DP operations');
    recommendations.push('→ If critical, activate backup systems (INS/radar)');
  } else if (risk_level === 'AMBER') {
    recommendations.push('🟡 DP GATE: CAUTION - Monitor closely');
    recommendations.push(...dpasogStatus.reasons.map(r => `⚠️ ${r}`));
    recommendations.push('→ Increase monitoring frequency to 1-5 min');
    recommendations.push('→ Verify backup systems ready');
  } else {
    recommendations.push('🟢 DP GATE: PROCEED - Conditions nominal');
    recommendations.push(`→ Kp ${dpasogStatus.kp} (quiet to unsettled)`);
    recommendations.push(`→ PDOP ${dpasogStatus.worst_pdop.toFixed(1)} (good geometry)`);
  }
  
  return {
    risk_level,
    dp_gate_status,
    kp_current: dpasogStatus.kp,
    pdop_current: dpasogStatus.worst_pdop,
    recommendations,
  };
}
