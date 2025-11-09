/**
 * Hybrid Space Weather Service
 * 
 * Combina:
 * 1. Nossa implementação TypeScript direta (NOAA SWPC + CelesTrak)
 * 2. DP ASOG Service (FastAPI Python com SGP4 robusto)
 * 
 * Estratégia:
 * - Primary: DP ASOG Service (SGP4 real, DOP preciso)
 * - Fallback: Nossa implementação TypeScript (se ASOG offline)
 * - Cache: Resultados de ambas as fontes
 * 
 * @module services/space-weather/hybrid-monitoring
 */

import { getDPASOGClient, mapDPASOGToSpaceWeatherStatus } from './dp-asog-client.service';
import type { DPASOGStatusResponse, DPASOGPDOPResponse } from './dp-asog-client.service';
import { SpaceWeatherMonitoring, DEFAULT_THRESHOLDS } from './space-weather-monitoring.service';
import type { SpaceWeatherStatus, SpaceWeatherThresholds } from '@/types/space-weather.types';

// ============================================================================
// Configuration
// ============================================================================

export interface HybridSpaceWeatherConfig {
  /** Preferir DP ASOG Service quando disponível */
  prefer_dp_asog: boolean;
  
  /** URL do DP ASOG Service */
  dp_asog_url?: string;
  
  /** Timeout para DP ASOG (ms) */
  dp_asog_timeout_ms: number;
  
  /** Fallback para TypeScript impl se ASOG falhar */
  enable_fallback: boolean;
  
  /** Cache TTL (ms) */
  cache_ttl_ms: number;
  
  /** Thresholds customizados */
  thresholds?: Partial<SpaceWeatherThresholds>;
}

const DEFAULT_CONFIG: HybridSpaceWeatherConfig = {
  prefer_dp_asog: true,
  dp_asog_timeout_ms: 10000,
  enable_fallback: true,
  cache_ttl_ms: 5 * 60 * 1000, // 5 min
};

// ============================================================================
// Cache
// ============================================================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class SimpleCache<T> {
  private cache = new Map<string, CacheEntry<T>>();

  set(key: string, data: T, ttl: number): void {
    this.cache.set(key, { data, timestamp: Date.now() + ttl });
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.timestamp) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }
}

// ============================================================================
// Hybrid Service
// ============================================================================

export class HybridSpaceWeatherService {
  private config: HybridSpaceWeatherConfig;
  private cache = new SimpleCache<SpaceWeatherStatus>();
  private dpASOGAvailable: boolean | null = null;
  private lastHealthCheck = 0;
  private healthCheckInterval = 60000; // 1 min

  constructor(config?: Partial<HybridSpaceWeatherConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Health check do DP ASOG Service
   */
  private async checkDPASOGHealth(): Promise<boolean> {
    const now = Date.now();
    
    // Cache health check por 1 min
    if (this.dpASOGAvailable !== null && now - this.lastHealthCheck < this.healthCheckInterval) {
      return this.dpASOGAvailable;
    }

    try {
      const client = getDPASOGClient(this.config.dp_asog_url);
      this.dpASOGAvailable = await client.healthCheck();
      this.lastHealthCheck = now;
      return this.dpASOGAvailable;
    } catch {
      this.dpASOGAvailable = false;
      this.lastHealthCheck = now;
      return false;
    }
  }

  /**
   * Get space weather status - HYBRID MODE
   * 
   * Tenta DP ASOG primeiro, fallback para nossa implementação TypeScript.
   * 
   * @param latitude - Latitude do observador
   * @param longitude - Longitude do observador
   * @param altitude - Altitude em metros (default: 0)
   * @param hours - Janela de análise (default: 6)
   * @returns Status consolidado
   * 
   * @example
   * ```typescript
   * const hybrid = new HybridSpaceWeatherService();
   * 
   * const status = await hybrid.getSpaceWeatherStatus(-22.9, -43.2);
   * 
   * console.log(`Risk: ${status.risk_level}`);
   * console.log(`DP Gate: ${status.dp_gate_status}`);
   * console.log(`Source: ${status.data_source}`); // 'DP_ASOG' ou 'TYPESCRIPT'
   * ```
   */
  async getSpaceWeatherStatus(
    latitude: number,
    longitude: number,
    altitude = 0,
    hours = 6
  ): Promise<SpaceWeatherStatus & { data_source: 'DP_ASOG' | 'TYPESCRIPT' | 'CACHED' }> {
    const cacheKey = `status_${latitude}_${longitude}_${altitude}_${hours}`;
    
    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached) {
      console.log('[HybridSpaceWeather] Using cached data');
      return { ...cached, data_source: 'CACHED' };
    }

    // Try DP ASOG first (if preferred and available)
    if (this.config.prefer_dp_asog) {
      const isHealthy = await this.checkDPASOGHealth();
      
      if (isHealthy) {
        try {
          const status = await this.getStatusFromDPASOG(latitude, longitude, altitude, hours);
          this.cache.set(cacheKey, status, this.config.cache_ttl_ms);
          return { ...status, data_source: 'DP_ASOG' };
        } catch (error) {
          console.warn('[HybridSpaceWeather] DP ASOG failed:', error);
          
          if (!this.config.enable_fallback) {
            throw error;
          }
          
          console.log('[HybridSpaceWeather] Falling back to TypeScript implementation');
        }
      } else {
        console.log('[HybridSpaceWeather] DP ASOG unavailable, using TypeScript fallback');
      }
    }

    // Fallback to TypeScript implementation
    const status = await this.getStatusFromTypeScript(latitude, longitude, altitude);
    this.cache.set(cacheKey, status, this.config.cache_ttl_ms);
    return { ...status, data_source: 'TYPESCRIPT' };
  }

  /**
   * Get status from DP ASOG Service (Python FastAPI)
   */
  private async getStatusFromDPASOG(
    latitude: number,
    longitude: number,
    altitude: number,
    hours: number
  ): Promise<SpaceWeatherStatus> {
    const client = getDPASOGClient(this.config.dp_asog_url);
    
    // Parallel fetch: status + PDOP details
    const [statusResponse, pdopResponse] = await Promise.all([
      client.getStatus({ lat: latitude, lon: longitude, hours, alt: altitude }),
      client.getPDOP({
        lat: latitude,
        lon: longitude,
        alt: altitude,
        hours,
        step_min: 5,
        elev_mask: 10,
        constellations: 'GPS,GALILEO',
      }).catch(() => null), // PDOP é opcional
    ]);

    // Map to our SpaceWeatherStatus format
    const mapped = mapDPASOGToSpaceWeatherStatus(statusResponse, pdopResponse || undefined);

    // Build full status
    const status: SpaceWeatherStatus = {
      timestamp: new Date().toISOString(),
      risk_level: mapped.risk_level,
      
      // NOAA data (from DP ASOG)
      kp_current: statusResponse.kp,
      kp_forecast_3h: statusResponse.kp, // DP ASOG não separa forecast
      kp_forecast_24h: statusResponse.kp,
      active_alerts: [],
      solar_wind_speed: 0, // DP ASOG não expõe (usa só Kp)
      bz_gsm: 0,
      
      // GNSS data
      pdop_current: statusResponse.worst_pdop,
      visible_satellites: pdopResponse?.timeline[0]?.satellites || 0,
      
      // Risk assessment
      scintillation_risk: this.estimateScintillationRisk(latitude, statusResponse.kp),
      forecast_6h: statusResponse.status,
      forecast_24h: statusResponse.status,
      forecast_48h: statusResponse.status,
      
      // DP operations
      dp_gate_status: mapped.dp_gate_status,
      recommendations: mapped.recommendations,
    };

    return status;
  }

  /**
   * Get status from our TypeScript implementation
   */
  private async getStatusFromTypeScript(
    latitude: number,
    longitude: number,
    altitude: number
  ): Promise<SpaceWeatherStatus> {
    const thresholds = this.config.thresholds
      ? { ...DEFAULT_THRESHOLDS, ...this.config.thresholds }
      : DEFAULT_THRESHOLDS;

    return await SpaceWeatherMonitoring.getSpaceWeatherStatus(
      latitude,
      longitude,
      altitude,
      thresholds
    );
  }

  /**
   * Estima risco de scintillation baseado em latitude e Kp
   */
  private estimateScintillationRisk(latitude: number, kp: number): 'LOW' | 'MODERATE' | 'HIGH' {
    const absLat = Math.abs(latitude);
    
    // Equatorial region (±20°)
    if (absLat <= 20) {
      if (kp >= 5) return 'HIGH';
      if (kp >= 3) return 'MODERATE';
      return 'LOW';
    }
    
    // Polar region (>60°)
    if (absLat > 60) {
      if (kp >= 6) return 'HIGH';
      if (kp >= 4) return 'MODERATE';
      return 'LOW';
    }
    
    // Mid-latitude
    if (kp >= 7) return 'HIGH';
    if (kp >= 5) return 'MODERATE';
    return 'LOW';
  }

  /**
   * Quick DP check
   */
  async quickDPCheck(latitude: number, longitude: number): Promise<{
    status: 'GO' | 'CAUTION' | 'NO-GO';
    kp: number;
    pdop: number;
    message: string;
    source: 'DP_ASOG' | 'TYPESCRIPT' | 'CACHED';
  }> {
    const fullStatus = await this.getSpaceWeatherStatus(latitude, longitude);
    
    const status =
      fullStatus.dp_gate_status === 'PROCEED' ? 'GO' :
      fullStatus.dp_gate_status === 'CAUTION' ? 'CAUTION' :
      'NO-GO';

    return {
      status,
      kp: fullStatus.kp_current,
      pdop: fullStatus.pdop_current,
      message: fullStatus.recommendations[0] || 'No data',
      source: (fullStatus as any).data_source,
    };
  }

  /**
   * Force usar DP ASOG (ignora fallback)
   */
  async getStatusFromDPASOGOnly(
    latitude: number,
    longitude: number,
    altitude = 0,
    hours = 6
  ): Promise<SpaceWeatherStatus> {
    const isHealthy = await this.checkDPASOGHealth();
    
    if (!isHealthy) {
      throw new Error('DP ASOG Service is not available');
    }

    return await this.getStatusFromDPASOG(latitude, longitude, altitude, hours);
  }

  /**
   * Force usar TypeScript implementation (ignora DP ASOG)
   */
  async getStatusFromTypeScriptOnly(
    latitude: number,
    longitude: number,
    altitude = 0
  ): Promise<SpaceWeatherStatus> {
    return await this.getStatusFromTypeScript(latitude, longitude, altitude);
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get current config
   */
  getConfig(): HybridSpaceWeatherConfig {
    return { ...this.config };
  }

  /**
   * Update config
   */
  updateConfig(newConfig: Partial<HybridSpaceWeatherConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let hybridServiceInstance: HybridSpaceWeatherService | null = null;

export function getHybridSpaceWeatherService(
  config?: Partial<HybridSpaceWeatherConfig>
): HybridSpaceWeatherService {
  if (!hybridServiceInstance || config) {
    hybridServiceInstance = new HybridSpaceWeatherService(config);
  }
  return hybridServiceInstance;
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Quick hybrid check - usa melhor fonte disponível
 */
export async function hybridQuickCheck(lat: number, lon: number) {
  const service = getHybridSpaceWeatherService();
  return await service.quickDPCheck(lat, lon);
}

/**
 * Get full status - hybrid mode
 */
export async function getHybridSpaceWeatherStatus(
  lat: number,
  lon: number,
  alt = 0,
  hours = 6
) {
  const service = getHybridSpaceWeatherService();
  return await service.getSpaceWeatherStatus(lat, lon, alt, hours);
}
