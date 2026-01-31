/**
 * CPTEC/INPE Weather Service
 * Integração com dados meteorológicos oficiais do INPE
 * 
 * Centro de Previsão de Tempo e Estudos Climáticos
 * Instituto Nacional de Pesquisas Espaciais
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from '@/lib/logger';

export interface PrevisaoCPTEC {
  dia: string;
  tempo: string;
  tempo_descricao: string;
  maxima: number | null;
  minima: number | null;
  iuv: number | null;
}

export interface OndasPeriodo {
  periodo: "manha" | "tarde" | "noite";
  agitacao: string;
  altura: number | null;
  direcao: string;
  vento: number | null;
  vento_dir: string;
}

export interface PrevisaoOndas {
  dia: string;
  periodos: OndasPeriodo[];
}

export interface CPTECData {
  success: boolean;
  source: string;
  cidade?: string;
  uf?: string;
  cidade_id?: number;
  atualizacao?: string;
  previsoes?: PrevisaoCPTEC[];
  ondas?: PrevisaoOndas[];
  capitais?: any[];
  error?: string;
}

// Cache
const cptecCache = new Map<string, { data: CPTECData; timestamp: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour (CPTEC updates every few hours)

/**
 * Get cache key
 */
function getCacheKey(type: string, city: string): string {
  return `cptec_${type}_${city}`;
}

/**
 * Fetch CPTEC/INPE data
 */
export async function fetchCPTECData(
  options: {
    type?: "previsao" | "ondas" | "capitais" | "estendida";
    cidade?: string;
    cidadeId?: number;
    lat?: number;
    lon?: number;
    dias?: number;
    forceRefresh?: boolean;
  } = {}
): Promise<CPTECData> {
  const { 
    type = "previsao", 
    cidade, 
    cidadeId, 
    lat, 
    lon, 
    dias = 7,
    forceRefresh = false 
  } = options;

  const cacheKey = getCacheKey(type, cidade || `${lat}_${lon}` || "default");

  // Check cache
  if (!forceRefresh) {
    const cached = cptecCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      logger.debug("[CPTEC] Using cached data");
      return cached.data;
    }
  }

  try {
    logger.debug(`[CPTEC] Fetching ${type} data...`);
    
    const { data, error } = await supabase.functions.invoke("cptec-inpe", {
      body: { type, cidade, cidadeId, lat, lon, dias }
    });

    if (error) {
      logger.error("[CPTEC] Edge Function error:", error);
      throw error;
    }

    // Cache successful response
    cptecCache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });

    return data;
  } catch (error) {
    logger.error("[CPTEC] Fetch failed:", error);
    
    // Return cached data even if expired
    const cached = cptecCache.get(cacheKey);
    if (cached) {
      return { ...cached.data, success: false };
    }

    return {
      success: false,
      source: "CPTEC/INPE (offline)",
      error: error instanceof Error ? error.message : "Failed to fetch data"
    };
  }
}

/**
 * Get weather forecast for a city
 */
export async function getPrevisaoCidade(
  cidade: string,
  dias: number = 7
): Promise<PrevisaoCPTEC[]> {
  const data = await fetchCPTECData({ type: "previsao", cidade, dias });
  return data.previsoes || [];
}

/**
 * Get weather forecast by coordinates
 */
export async function getPrevisaoCoordenadas(
  lat: number,
  lon: number,
  dias: number = 7
): Promise<CPTECData> {
  return fetchCPTECData({ type: "previsao", lat, lon, dias });
}

/**
 * Get wave forecast for coastal city
 */
export async function getPrevisaoOndas(
  cidade: string
): Promise<PrevisaoOndas[]> {
  const data = await fetchCPTECData({ type: "ondas", cidade });
  return data.ondas || [];
}

/**
 * Get current conditions for all state capitals
 */
export async function getCondicoesCapitais(): Promise<any[]> {
  const data = await fetchCPTECData({ type: "capitais" });
  return data.capitais || [];
}

/**
 * Get extended forecast (up to 14 days)
 */
export async function getPrevisaoEstendida(
  cidade: string,
  dias: number = 14
): Promise<PrevisaoCPTEC[]> {
  const data = await fetchCPTECData({ type: "estendida", cidade, dias });
  return data.previsoes || [];
}

/**
 * Clear CPTEC cache
 */
export function clearCPTECCache(): void {
  cptecCache.clear();
  logger.debug("[CPTEC] Cache cleared");
}

/**
 * Get UV Index description
 */
export function getUVDescription(iuv: number | null): { level: string; color: string } {
  if (iuv === null) return { level: "Desconhecido", color: "gray" };
  if (iuv <= 2) return { level: "Baixo", color: "green" };
  if (iuv <= 5) return { level: "Moderado", color: "yellow" };
  if (iuv <= 7) return { level: "Alto", color: "orange" };
  if (iuv <= 10) return { level: "Muito Alto", color: "red" };
  return { level: "Extremo", color: "purple" };
}

/**
 * Get wave agitation description
 */
export function getAgitacaoColor(agitacao: string): string {
  switch (agitacao?.toLowerCase()) {
    case "fraco":
      return "green";
    case "moderado":
      return "yellow";
    case "forte":
      return "orange";
    case "muito forte":
      return "red";
    default:
      return "gray";
  }
}

/**
 * Map CPTEC weather code to icon
 */
export function getWeatherIcon(tempo: string): string {
  const iconMap: Record<string, string> = {
    "cl": "sun",
    "ps": "sun",
    "pn": "cloud-sun",
    "n": "cloud",
    "e": "cloud",
    "c": "cloud-rain",
    "ci": "cloud-drizzle",
    "pc": "cloud-rain",
    "t": "cloud-lightning",
    "g": "snowflake",
    "ne": "snowflake",
    "nv": "cloud-fog"
  };

  return iconMap[tempo?.toLowerCase()] || "cloud";
}
