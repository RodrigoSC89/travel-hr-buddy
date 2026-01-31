/**
 * Terrastar API Test Fixtures
 * 
 * ⚠️ SOMENTE PARA TESTES E DESENVOLVIMENTO LOCAL
 * Em produção, use a API real configurando VITE_USE_MOCK_TERRASTAR=false
 * 
 * @module tests/fixtures/terrastar
 */

import type { 
  TerrastarIonosphereData, 
  TerrastarCorrection, 
  TerrastarAlert 
} from '@/services/api/terrastar/terrastar.service';

/**
 * Gera dados ionosféricos simulados para testes
 */
export function createMockIonosphereData(
  overrides: Partial<TerrastarIonosphereData> = {}
): TerrastarIonosphereData {
  const latitude = overrides.latitude ?? -23.5505;
  const longitude = overrides.longitude ?? -46.6333;
  const hour = new Date().getHours();
  const latitudeFactor = Math.abs(latitude) / 90;
  const dayTimeFactor = Math.sin((hour / 24) * Math.PI * 2);
  
  const baseVTEC = 20 + (50 * (1 - latitudeFactor)) + (20 * dayTimeFactor);
  const vtec = baseVTEC + (Math.random() * 10 - 5);
  const stec = vtec * (1.2 + Math.random() * 0.3);
  const ionospheric_delay = vtec * 0.16 * (1 + Math.random() * 0.1);
  const quality_indicator = Math.min(100, 70 + dayTimeFactor * 20 + Math.random() * 10);
  
  return {
    timestamp: new Date().toISOString(),
    latitude,
    longitude,
    vtec: Math.round(vtec * 100) / 100,
    stec: Math.round(stec * 100) / 100,
    ionospheric_delay: Math.round(ionospheric_delay * 100) / 100,
    correction_type: 'L1',
    quality_indicator: Math.round(quality_indicator),
    satellite_count: Math.floor(8 + Math.random() * 8),
    ...overrides,
  };
}

/**
 * Gera correção GPS simulada para testes
 */
export function createMockCorrection(
  overrides: Partial<TerrastarCorrection> = {}
): TerrastarCorrection {
  const serviceLevel = overrides.service_level ?? 'PREMIUM';
  const accuracyMap = {
    BASIC: { horizontal: 5.0, vertical: 8.0 },
    PREMIUM: { horizontal: 1.0, vertical: 2.0 },
    RTK: { horizontal: 0.02, vertical: 0.05 },
  };
  
  const accuracy = accuracyMap[serviceLevel];
  
  return {
    vessel_id: overrides.vessel_id ?? 'test-vessel-001',
    position_lat: overrides.position_lat ?? -23.5505,
    position_lon: overrides.position_lon ?? -46.6333,
    timestamp: new Date().toISOString(),
    vtec_correction: Math.round((Math.random() * 20) * 100) / 100,
    horizontal_accuracy: accuracy.horizontal + (Math.random() * 0.5),
    vertical_accuracy: accuracy.vertical + (Math.random() * 0.5),
    correction_age: Math.floor(Math.random() * 5),
    service_level: serviceLevel,
    signal_quality: 85 + Math.floor(Math.random() * 10),
    ...overrides,
  };
}

/**
 * Gera alertas ionosféricos simulados para testes
 */
export function createMockAlerts(count: number = 1): TerrastarAlert[] {
  const alerts: TerrastarAlert[] = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    alerts.push({
      vessel_id: `test-vessel-${i + 1}`,
      alert_type: i % 2 === 0 ? 'IONOSPHERIC_STORM' : 'SIGNAL_DEGRADATION',
      severity: i % 3 === 0 ? 'high' : 'medium',
      message: `Test alert ${i + 1} - Simulated ionospheric activity`,
      affected_area: {
        lat_min: -25,
        lat_max: -20,
        lon_min: -50,
        lon_max: -45,
      },
      timestamp: new Date(now.getTime() - 30 * 60000).toISOString(),
      expires_at: new Date(now.getTime() + 2 * 3600000).toISOString(),
      acknowledged: false,
    });
  }
  
  return alerts;
}

/**
 * Factory para criar múltiplos fixtures de uma vez
 */
export const TerrastarFixtures = {
  ionosphereData: createMockIonosphereData,
  correction: createMockCorrection,
  alerts: createMockAlerts,
  
  /**
   * Cria um conjunto completo de dados para testes
   */
  fullDataset() {
    return {
      ionosphere: createMockIonosphereData(),
      correction: createMockCorrection(),
      alerts: createMockAlerts(2),
      forecast: Array.from({ length: 24 }, (_, hour) => ({
        timestamp: new Date(Date.now() + hour * 3600000).toISOString(),
        vtec_forecast: 30 + Math.random() * 40,
        reliability: Math.max(50, 95 - hour * 2),
      })),
    };
  },
};
