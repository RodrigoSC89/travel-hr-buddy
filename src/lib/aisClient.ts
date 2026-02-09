/**
 * AIS (Automatic Identification System) Client
 * Integrates with MarineTraffic API for real-time vessel tracking
 * 
 * PATCH OPS-V7: IntegrationStatus obrigatório
 * REGRA: Não exibir dados fake como se fossem reais
 */

import { logger } from "@/lib/logger";
import type { IntegrationStatus, IntegrationHealthCheck } from "@/types/integration-status";

export interface VesselPosition {
  mmsi: string;
  name: string;
  latitude: number;
  longitude: number;
  speed: number;
  course: number;
  heading: number;
  timestamp: string;
  status: "underway" | "at_anchor" | "moored" | "not_under_command" | "restricted_maneuverability";
  type: string;
}

export interface AISClientConfig {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
}

export interface AISClientResult<T> {
  data: T | null;
  status: IntegrationStatus;
  error?: string;
}

/**
 * AIS Client for vessel tracking
 * Can be configured to use MarineTraffic or OpenAIS APIs
 * 
 * OPS-V7: Retorna status da integração junto com os dados
 */
export class AISClient {
  private config: Required<AISClientConfig>;
  private _status: IntegrationStatus = 'NOT_CONFIGURED';
  private _lastError?: string;
  private _lastCheck: Date = new Date();
  private _latencyMs?: number;

  constructor(config: AISClientConfig = {}) {
    this.config = {
      apiKey: config.apiKey || "",
      baseUrl: config.baseUrl || "https://api.marinetraffic.com/api/exportvessel/v:5",
      timeout: config.timeout || 10000,
    };
    
    // Definir status inicial baseado na configuração
    this._status = this.config.apiKey ? 'DISCONNECTED' : 'NOT_CONFIGURED';
  }

  /**
   * Retorna o status atual da integração
   */
  getStatus(): IntegrationStatus {
    return this._status;
  }

  /**
   * Retorna health check completo
   */
  getHealthCheck(): IntegrationHealthCheck {
    return {
      name: 'AIS (MarineTraffic)',
      status: this._status,
      lastCheck: this._lastCheck,
      latencyMs: this._latencyMs,
      errorMessage: this._lastError,
    };
  }

  /**
   * Verifica se a integração pode retornar dados
   */
  isOperational(): boolean {
    return this._status === 'CONNECTED' || this._status === 'DEGRADED';
  }

  /**
   * Fetches vessel positions in a given area
   * OPS-V7: Retorna resultado com status da integração
   */
  async getVesselsInArea(bounds: {
    minLat: number;
    maxLat: number;
    minLon: number;
    maxLon: number;
  }): Promise<AISClientResult<VesselPosition[]>> {
    this._lastCheck = new Date();

    // Se não configurado, retornar status apropriado (SEM dados fake)
    if (!this.config.apiKey) {
      this._status = 'NOT_CONFIGURED';
      return {
        data: null,
        status: 'NOT_CONFIGURED',
        error: 'API key não configurada. Configure MARINE_TRAFFIC_API_KEY.',
      };
    }

    try {
      const startTime = Date.now();
      const url = `${this.config.baseUrl}/${this.config.apiKey}/MINLAT:${bounds.minLat}/MAXLAT:${bounds.maxLat}/MINLON:${bounds.minLon}/MAXLON:${bounds.maxLon}`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          "Accept": "application/json",
        },
      });

      clearTimeout(timeoutId);
      this._latencyMs = Date.now() - startTime;

      if (!response.ok) {
        this._status = 'ERROR';
        this._lastError = `API retornou status ${response.status}`;
        return {
          data: null,
          status: 'ERROR',
          error: this._lastError,
        };
      }

      const data = await response.json();
      const vessels = this.parseVesselData(data);
      
      // Verificar se latência está degradada (> 2s)
      this._status = this._latencyMs > 2000 ? 'DEGRADED' : 'CONNECTED';
      this._lastError = undefined;

      return {
        data: vessels,
        status: this._status,
      };
    } catch (error) {
      this._status = 'DISCONNECTED';
      this._lastError = error instanceof Error ? error.message : 'Erro desconhecido';
      logger.error("Error fetching AIS data", error as Error, { bounds });
      
      return {
        data: null,
        status: 'DISCONNECTED',
        error: this._lastError,
      };
    }
  }

  /**
   * Gets a specific vessel by MMSI
   * OPS-V7: Retorna resultado com status da integração
   */
  async getVesselByMMSI(mmsi: string): Promise<AISClientResult<VesselPosition>> {
    this._lastCheck = new Date();

    if (!this.config.apiKey) {
      this._status = 'NOT_CONFIGURED';
      return {
        data: null,
        status: 'NOT_CONFIGURED',
        error: 'API key não configurada',
      };
    }

    try {
      const startTime = Date.now();
      const url = `${this.config.baseUrl}/${this.config.apiKey}/MMSI:${mmsi}`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          "Accept": "application/json",
        },
      });

      clearTimeout(timeoutId);
      this._latencyMs = Date.now() - startTime;

      if (!response.ok) {
        this._status = 'ERROR';
        return {
          data: null,
          status: 'ERROR',
          error: `API retornou status ${response.status}`,
        };
      }

      const data = await response.json();
      const vessels = this.parseVesselData(data);
      this._status = this._latencyMs > 2000 ? 'DEGRADED' : 'CONNECTED';

      return {
        data: vessels[0] || null,
        status: this._status,
      };
    } catch (error) {
      this._status = 'DISCONNECTED';
      this._lastError = error instanceof Error ? error.message : 'Erro desconhecido';
      logger.error("Error fetching vessel by MMSI", error as Error, { mmsi });
      
      return {
        data: null,
        status: 'DISCONNECTED',
        error: this._lastError,
      };
    }
  }

  /**
   * Parses raw API data into VesselPosition format
   */
  private parseVesselData(data: unknown): VesselPosition[] {
    if (!Array.isArray(data)) {
      return [];
    }

    return data.map((vessel: Record<string, unknown>) => ({
      mmsi: String(vessel.MMSI || vessel.mmsi || ""),
      name: String(vessel.SHIPNAME || vessel.shipname || "Unknown Vessel"),
      latitude: parseFloat(String(vessel.LAT || vessel.latitude || 0)),
      longitude: parseFloat(String(vessel.LON || vessel.longitude || 0)),
      speed: parseFloat(String(vessel.SPEED || vessel.speed || 0)),
      course: parseFloat(String(vessel.COURSE || vessel.course || 0)),
      heading: parseFloat(String(vessel.HEADING || vessel.heading || 0)),
      timestamp: String(vessel.TIMESTAMP || vessel.timestamp || new Date().toISOString()),
      status: this.parseStatus(Number(vessel.STATUS || vessel.status || 0)),
      type: String(vessel.TYPE || vessel.type || "Unknown"),
    }));
  }

  /**
   * Converts numeric status codes to readable status
   */
  private parseStatus(statusCode: number | string): VesselPosition["status"] {
    const code = typeof statusCode === "string" ? parseInt(statusCode) : statusCode;
    
    if (code === 0 || code === 5) return "underway";
    if (code === 1 || code === 5) return "at_anchor";
    if (code === 2) return "not_under_command";
    if (code === 3) return "restricted_maneuverability";
    if (code === 5) return "moored";
    
    return "underway";
  }

  // OPS-V7: Métodos getMockVessels REMOVIDOS
  // REGRA: Proibido exibir dados fake como se fossem reais
  // Se a integração não está configurada, a UI deve mostrar status NOT_CONFIGURED
}

// Export singleton instance with default config
export const aisClient = new AISClient();
