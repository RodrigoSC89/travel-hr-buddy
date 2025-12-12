/**
 * Terrastar API Mock Service
 * 
 * Fornece dados simulados realistas para desenvolvimento e testes
 * Quando obtiver acesso à API real, apenas troque USE_MOCK_API para false
 */

import { 
  TerrastarIonosphereData, 
  TerrastarCorrection, 
  TerrastarAlert 
} from "../api/terrastar/terrastar.service";

// Feature flag - controla se usa mock ou API real
const USE_MOCK_API = (import.meta as any).env.VITE_USE_MOCK_TERRASTAR !== "false";

/**
 * Gera dados ionosféricos simulados baseados em localização
 */
export function generateMockIonosphereData(
  latitude: number,
  longitude: number,
  altitude: number = 0
): TerrastarIonosphereData {
  // Simula variação ionosférica baseada em:
  // - Latitude (mais intenso próximo ao equador)
  // - Hora do dia
  // - Randomização para realismo
  
  const hour = new Date().getHours();
  const latitudeFactor = Math.abs(latitude) / 90; // 0-1
  const dayTimeFactor = Math.sin((hour / 24) * Math.PI * 2); // Variação diurna
  
  // VTEC (Vertical Total Electron Content) - unidades: TECU (10^16 electrons/m²)
  // Valores típicos: 5-100 TECU (mais alto durante o dia e próximo ao equador)
  const baseVTEC = 20 + (50 * (1 - latitudeFactor)) + (20 * dayTimeFactor);
  const vtec = baseVTEC + (Math.random() * 10 - 5);
  
  // STEC (Slant Total Electron Content) - geralmente maior que VTEC
  const stec = vtec * (1.2 + Math.random() * 0.3);
  
  // Ionospheric delay - calculado a partir do VTEC
  // Fórmula aproximada: delay ≈ VTEC * 0.16 ms (em L1)
  const ionospheric_delay = vtec * 0.16 * (1 + Math.random() * 0.1);
  
  // Quality indicator - melhor durante o dia
  const quality_indicator = Math.min(100, 70 + dayTimeFactor * 20 + Math.random() * 10);
  
  // Satellite count - varia por localização e hora
  const satellite_count = Math.floor(8 + Math.random() * 8); // 8-15 satélites
  
  return {
    timestamp: new Date().toISOString(),
    latitude,
    longitude,
    vtec: Math.round(vtec * 100) / 100,
    stec: Math.round(stec * 100) / 100,
    ionospheric_delay: Math.round(ionospheric_delay * 100) / 100,
    correction_type: "L1",
    quality_indicator: Math.round(quality_indicator),
    satellite_count,
  };
}

/**
 * Gera correção GPS simulada
 */
export function generateMockCorrection(
  vesselId: string,
  latitude: number,
  longitude: number,
  serviceLevel: "BASIC" | "PREMIUM" | "RTK" = "PREMIUM"
): TerrastarCorrection {
  // Precisão baseada no service level
  const accuracyMap = {
    BASIC: { horizontal: 5.0, vertical: 8.0 },    // 5m horizontal, 8m vertical
    PREMIUM: { horizontal: 1.0, vertical: 2.0 },  // 1m horizontal, 2m vertical
    RTK: { horizontal: 0.02, vertical: 0.05 },    // 2cm horizontal, 5cm vertical
  };
  
  const accuracy = accuracyMap[serviceLevel];
  
  // VTEC correction - baseado nos dados ionosféricos
  const ionoData = generateMockIonosphereData(latitude, longitude);
  const vtec_correction = ionoData.vtec * 0.4; // Fator de correção
  
  // Signal quality - melhor em níveis premium
  const signal_quality = serviceLevel === "RTK" ? 95 : 
    serviceLevel === "PREMIUM" ? 85 : 70;
  
  // Correction age - quanto tempo desde a última atualização
  const correction_age = Math.floor(Math.random() * 5); // 0-5 segundos
  
  return {
    vessel_id: vesselId,
    position_lat: latitude,
    position_lon: longitude,
    timestamp: new Date().toISOString(),
    vtec_correction: Math.round(vtec_correction * 100) / 100,
    horizontal_accuracy: accuracy.horizontal + (Math.random() * 0.5),
    vertical_accuracy: accuracy.vertical + (Math.random() * 0.5),
    correction_age,
    service_level: serviceLevel,
    signal_quality: signal_quality + Math.floor(Math.random() * 5),
  };
}

/**
 * Gera alertas ionosféricos simulados
 */
export function generateMockAlerts(
  vesselId: string,
  latitude: number,
  longitude: number
): TerrastarAlert[] {
  const alerts: TerrastarAlert[] = [];
  const now = new Date();
  
  // 30% de chance de ter alerta ativo
  if (Math.random() < 0.3) {
    // Alerta de tempestade ionosférica
    alerts.push({
      vessel_id: vesselId,
      alert_type: "IONOSPHERIC_STORM",
      severity: "medium",
      message: "Atividade ionosférica moderada detectada na região. Possível degradação na precisão GPS.",
      affected_area: {
        lat_min: latitude - 5,
        lat_max: latitude + 5,
        lon_min: longitude - 5,
        lon_max: longitude + 5,
      },
      timestamp: new Date(now.getTime() - 30 * 60000).toISOString(), // 30 min atrás
      expires_at: new Date(now.getTime() + 2 * 3600000).toISOString(), // expira em 2h
      acknowledged: false,
    });
  }
  
  // 10% de chance de degradação de sinal
  if (Math.random() < 0.1) {
    alerts.push({
      vessel_id: vesselId,
      alert_type: "SIGNAL_DEGRADATION",
      severity: "low",
      message: "Qualidade do sinal GPS abaixo do normal. Verificar antena e obstruções.",
      affected_area: {
        lat_min: latitude - 1,
        lat_max: latitude + 1,
        lon_min: longitude - 1,
        lon_max: longitude + 1,
      },
      timestamp: new Date(now.getTime() - 15 * 60000).toISOString(), // 15 min atrás
      expires_at: new Date(now.getTime() + 1 * 3600000).toISOString(), // expira em 1h
      acknowledged: false,
    });
  }
  
  return alerts;
}

/**
 * Gera previsão ionosférica de 24h
 */
export function generateMockForecast(
  latitude: number,
  longitude: number
): Array<{ timestamp: string; vtec_forecast: number; reliability: number }> {
  const forecast = [];
  const now = new Date();
  
  // Gera previsão hora a hora por 24h
  for (let hour = 0; hour < 24; hour++) {
    const forecastTime = new Date(now.getTime() + hour * 3600000);
    const forecastHour = forecastTime.getHours();
    
    // Padrão diurno de VTEC (mais alto durante o dia)
    const dayTimeFactor = Math.sin((forecastHour / 24) * Math.PI * 2);
    const baseVTEC = 30 + (40 * dayTimeFactor);
    const vtec_forecast = baseVTEC + (Math.random() * 10 - 5);
    
    // Confiabilidade diminui quanto mais longe no futuro
    const reliability = 95 - (hour * 2); // 95% agora, ~50% em 24h
    
    forecast.push({
      timestamp: forecastTime.toISOString(),
      vtec_forecast: Math.round(vtec_forecast * 100) / 100,
      reliability: Math.max(50, reliability),
    });
  }
  
  return forecast;
}

/**
 * Gera estatísticas de correção
 */
export function generateMockStatistics(vesselId: string) {
  return {
    vessel_id: vesselId,
    period_start: new Date(Date.now() - 7 * 24 * 3600000).toISOString(), // última semana
    period_end: new Date().toISOString(),
    total_corrections: 1234,
    average_accuracy: 1.2, // metros
    max_accuracy: 0.8,
    min_accuracy: 2.5,
    availability: 98.5, // porcentagem
    average_signal_quality: 87,
  });
}

/**
 * Simula delay de rede (opcional)
 */
async function simulateNetworkDelay(minMs: number = 100, maxMs: number = 500): Promise<void> {
  const delay = Math.random() * (maxMs - minMs) + minMs;
  await new Promise(resolve => setTimeout(resolve, delay));
}

/**
 * Mock API Wrapper
 * Simula chamadas à API com delays realistas
 */
export const TerrastarMockAPI = {
  /**
   * Obter dados ionosféricos
   */
  async getIonosphericData(latitude: number, longitude: number, altitude: number = 0): Promise<TerrastarIonosphereData> {
    await simulateNetworkDelay();
    const data = generateMockIonosphereData(latitude, longitude, altitude);
    return data;
  },
  
  /**
   * Solicitar correção de posição
   */
  async requestCorrection(
    vesselId: string, 
    latitude: number, 
    longitude: number,
    serviceLevel: "BASIC" | "PREMIUM" | "RTK" = "PREMIUM"
  ): Promise<TerrastarCorrection> {
    await simulateNetworkDelay();
    const correction = generateMockCorrection(vesselId, latitude, longitude, serviceLevel);
    return correction;
  },
  
  /**
   * Obter alertas ativos
   */
  async getActiveAlerts(vesselId: string, latitude: number, longitude: number): Promise<TerrastarAlert[]> {
    await simulateNetworkDelay(50, 200);
    const alerts = generateMockAlerts(vesselId, latitude, longitude);
    return alerts;
  },
  
  /**
   * Obter previsão 24h
   */
  async getForecast(latitude: number, longitude: number): Promise<any> {
    await simulateNetworkDelay(200, 600);
    const forecast = generateMockForecast(latitude, longitude);
    return forecast;
  },
  
  /**
   * Obter estatísticas
   */
  async getStatistics(vesselId: string): Promise<any> {
    await simulateNetworkDelay(100, 300);
    const stats = generateMockStatistics(vesselId);
    return stats;
  },
  
  /**
   * Verificar status do serviço
   */
  async checkServiceStatus(): Promise<{ status: string; message: string }> {
    await simulateNetworkDelay(50, 150);
    const status = {
      status: "operational",
      message: "Mock service is operational. Replace with real API when ready.",
    };
    return status;
  },
};

/**
 * Helper: Verificar se está usando mock
 */
export function isUsingMockTerrastar(): boolean {
  return USE_MOCK_API;
}

/**
 * Helper: Log de aviso sobre mock
 */
export function logMockWarning(): void {
  if (USE_MOCK_API) {
  }
}

// Auto-log ao importar
logMockWarning();
