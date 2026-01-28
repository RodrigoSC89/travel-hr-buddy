/**
 * Marinha do Brasil Service
 * Integração com boletins meteorológicos oficiais da Marinha do Brasil
 * 
 * Fonte: CHM (Centro de Hidrografia da Marinha) / CPTEC/INPE
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/utils/production-logger";

export interface AvisoNavegacao {
  id: string;
  tipo: string;
  area: string;
  descricao: string;
  dataEmissao: string;
  dataValidade: string;
  severidade: "info" | "atencao" | "alerta" | "perigo";
  coordenadas?: {
    lat: number;
    lon: number;
  };
}

export interface PrevisaoMaritima {
  regiao: string;
  periodo: string;
  vento: {
    direcao: string;
    velocidadeMin: number;
    velocidadeMax: number;
    rajadas?: number;
  };
  ondas: {
    alturaMin: number;
    alturaMax: number;
    direcao: string;
    periodo: number;
  };
  mar: string;
  visibilidade: string;
  fenomenos?: string[];
  timestamp: string;
}

export interface BoletimCHM {
  numero: string;
  tipo: string;
  dataEmissao: string;
  validade: string;
  texto: string;
  areas: string[];
}

export interface MarinhaBrasilData {
  success: boolean;
  source: string;
  timestamp: string;
  region: string;
  regionName: string;
  avisos?: AvisoNavegacao[];
  previsao?: PrevisaoMaritima[];
  ondas?: {
    significativa: string;
    maxima: string;
    periodo: number;
    direcao: string;
    temperatura: string;
  };
  boletim?: BoletimCHM;
}

/**
 * Cache for Marinha Brasil data
 */
const marinhaBrasilCache = new Map<string, { data: MarinhaBrasilData; timestamp: number }>();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes (boletins são menos frequentes)

/**
 * Get cache key
 */
function getCacheKey(region: string, type: string): string {
  return `marinha_${region}_${type}`;
}

/**
 * Fetch data from Marinha do Brasil Edge Function
 */
export async function fetchMarinhaBrasilData(
  options: {
    type?: "avisos" | "previsao" | "ondas" | "all";
    region?: string;
    lat?: number;
    lon?: number;
    forceRefresh?: boolean;
  } = {}
): Promise<MarinhaBrasilData> {
  const { type = "all", region, lat, lon, forceRefresh = false } = options;
  const cacheKey = getCacheKey(region || `${lat}_${lon}`, type);

  // Check cache
  if (!forceRefresh) {
    const cached = marinhaBrasilCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      logger.debug("[Marinha Brasil] Using cached data");
      return cached.data;
    }
  }

  try {
    logger.debug("[Marinha Brasil] Fetching from Edge Function...");
    
    const { data, error } = await supabase.functions.invoke("marinha-brasil", {
      body: { type, region, lat, lon }
    });

    if (error) {
      logger.error("[Marinha Brasil] Edge Function error", error);
      throw error;
    }

    // Cache successful response
    marinhaBrasilCache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });

    return data;
  } catch (error) {
    logger.error("[Marinha Brasil] Fetch failed", error);
    
    // Return cached data even if expired
    const cached = marinhaBrasilCache.get(cacheKey);
    if (cached) {
      return { ...cached.data, success: false };
    }

    // Return fallback
    return {
      success: false,
      source: "Marinha do Brasil (offline)",
      timestamp: new Date().toISOString(),
      region: region || "sudeste",
      regionName: "Costa Brasileira",
      avisos: [],
      previsao: []
    };
  }
}

/**
 * Get Avisos aos Navegantes
 */
export async function getAvisosNavegacao(
  lat?: number,
  lon?: number,
  region?: string
): Promise<AvisoNavegacao[]> {
  const data = await fetchMarinhaBrasilData({ type: "avisos", lat, lon, region });
  return data.avisos || [];
}

/**
 * Get Previsão Marítima
 */
export async function getPrevisaoMaritima(
  lat?: number,
  lon?: number,
  region?: string
): Promise<PrevisaoMaritima[]> {
  const data = await fetchMarinhaBrasilData({ type: "previsao", lat, lon, region });
  return data.previsao || [];
}

/**
 * Get Boletim CHM completo
 */
export async function getBoletimCHM(
  lat?: number,
  lon?: number,
  region?: string
): Promise<BoletimCHM | null> {
  const data = await fetchMarinhaBrasilData({ type: "all", lat, lon, region });
  return data.boletim || null;
}

/**
 * Clear Marinha Brasil cache
 */
export function clearMarinhaBrasilCache(): void {
  marinhaBrasilCache.clear();
  logger.debug("[Marinha Brasil] Cache cleared");
}

/**
 * Get severity color for UI
 */
export function getSeverityColor(severidade: AvisoNavegacao["severidade"]): string {
  switch (severidade) {
    case "perigo":
      return "destructive";
    case "alerta":
      return "warning";
    case "atencao":
      return "secondary";
    default:
      return "default";
  }
}

/**
 * Get severity icon name
 */
export function getSeverityIcon(severidade: AvisoNavegacao["severidade"]): string {
  switch (severidade) {
    case "perigo":
      return "AlertOctagon";
    case "alerta":
      return "AlertTriangle";
    case "atencao":
      return "AlertCircle";
    default:
      return "Info";
  }
}
