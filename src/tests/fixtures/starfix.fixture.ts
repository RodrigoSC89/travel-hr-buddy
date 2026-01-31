/**
 * StarFix API Test Fixtures
 * 
 * ⚠️ SOMENTE PARA TESTES E DESENVOLVIMENTO LOCAL
 * Em produção, use a API real configurando VITE_USE_MOCK_STARFIX=false
 * 
 * @module tests/fixtures/starfix
 */

import type { 
  StarFixVessel, 
  StarFixInspection, 
  StarFixDeficiency,
  StarFixPerformanceMetrics 
} from '@/services/api/starfix/starfix.service';

/**
 * Gera vessel simulado para testes
 */
export function createMockVessel(
  overrides: Partial<StarFixVessel> = {}
): StarFixVessel {
  const flagStates = ['BRA', 'PAN', 'LBR', 'MLT', 'CYP'];
  const vesselTypes = ['BULK_CARRIER', 'CONTAINER', 'TANKER', 'GENERAL_CARGO'];
  const classificationSocieties = ['DNV', 'ABS', 'LR', 'BV', 'RINA'];
  
  return {
    imo_number: overrides.imo_number ?? `IMO${Math.floor(1000000 + Math.random() * 9000000)}`,
    vessel_name: overrides.vessel_name ?? `Test Vessel ${Math.floor(Math.random() * 1000)}`,
    flag_state: flagStates[Math.floor(Math.random() * flagStates.length)],
    vessel_type: vesselTypes[Math.floor(Math.random() * vesselTypes.length)],
    gross_tonnage: Math.floor(5000 + Math.random() * 95000),
    year_built: 1990 + Math.floor(Math.random() * 34),
    classification_society: classificationSocieties[Math.floor(Math.random() * classificationSocieties.length)],
    ...overrides,
  };
}

/**
 * Gera deficiência simulada para testes
 */
export function createMockDeficiency(
  overrides: Partial<StarFixDeficiency> = {}
): StarFixDeficiency {
  const deficiencyCodes = [
    { code: '01306', desc: 'Fire doors', convention: 'SOLAS', severity: 'medium' as const },
    { code: '15150', desc: 'ISM - Procedures for reporting accidents', convention: 'ISM', severity: 'high' as const },
    { code: '07115', desc: 'Lifeboats', convention: 'SOLAS', severity: 'critical' as const },
    { code: '11101', desc: 'Charts', convention: 'SOLAS', severity: 'low' as const },
  ];
  
  const def = deficiencyCodes[Math.floor(Math.random() * deficiencyCodes.length)];
  const rectified = Math.random() > 0.3;
  
  return {
    deficiency_code: def.code,
    deficiency_description: def.desc,
    convention: def.convention,
    severity: def.severity,
    action_taken: rectified ? 'Rectified on board' : 'Rectification required',
    rectification_deadline: !rectified ? 
      new Date(Date.now() + 30 * 24 * 3600000).toISOString().split('T')[0] : 
      undefined,
    rectified,
    rectification_date: rectified ? 
      new Date(Date.now() - 7 * 24 * 3600000).toISOString().split('T')[0] : 
      undefined,
    ...overrides,
  };
}

/**
 * Gera inspeção simulada para testes
 */
export function createMockInspection(
  overrides: Partial<StarFixInspection> = {}
): StarFixInspection {
  const inspectionTypes = ['PSC', 'FSI', 'ISM', 'ISPS'] as const;
  const ports = [
    { name: 'Santos', country: 'Brazil' },
    { name: 'Rotterdam', country: 'Netherlands' },
    { name: 'Singapore', country: 'Singapore' },
  ];
  
  const port = ports[Math.floor(Math.random() * ports.length)];
  const deficienciesCount = Math.floor(Math.random() * 5);
  const detentions = deficienciesCount > 3 ? 1 : 0;
  
  return {
    id: overrides.id ?? crypto.randomUUID(),
    vessel_id: overrides.vessel_id ?? 'test-vessel-001',
    imo_number: overrides.imo_number ?? 'IMO1234567',
    inspection_date: new Date(Date.now() - Math.random() * 365 * 24 * 3600000).toISOString().split('T')[0],
    port_name: port.name,
    port_country: port.country,
    inspection_type: inspectionTypes[Math.floor(Math.random() * inspectionTypes.length)],
    authority: 'Paris MOU',
    deficiencies_count: deficienciesCount,
    detentions,
    inspection_result: detentions > 0 ? 'DETENTION' : deficienciesCount > 0 ? 'DEFICIENCY' : 'CLEAR',
    deficiencies: Array.from({ length: deficienciesCount }, () => createMockDeficiency()),
    starfix_sync_status: 'synced',
    last_sync_date: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Gera métricas de performance simuladas para testes
 */
export function createMockPerformanceMetrics(
  overrides: Partial<StarFixPerformanceMetrics> = {}
): StarFixPerformanceMetrics {
  const totalInspections = overrides.total_inspections ?? Math.floor(5 + Math.random() * 10);
  const deficienciesCount = overrides.deficiencies_count ?? Math.floor(totalInspections * 2);
  const detentionsCount = overrides.detentions_count ?? Math.floor(Math.random() * 2);
  
  const performanceScore = Math.max(0, 100 - (deficienciesCount * 5) - (detentionsCount * 20));
  
  let riskLevel: 'low' | 'medium' | 'high' | 'critical';
  if (performanceScore >= 80) riskLevel = 'low';
  else if (performanceScore >= 60) riskLevel = 'medium';
  else if (performanceScore >= 40) riskLevel = 'high';
  else riskLevel = 'critical';
  
  return {
    vessel_id: overrides.vessel_id ?? 'test-vessel-001',
    imo_number: overrides.imo_number ?? 'IMO1234567',
    period_start: new Date(Date.now() - 365 * 24 * 3600000).toISOString().split('T')[0],
    period_end: new Date().toISOString().split('T')[0],
    total_inspections: totalInspections,
    detentions_count: detentionsCount,
    deficiencies_count: deficienciesCount,
    nil_deficiency_rate: Math.round((1 - deficienciesCount / (totalInspections * 3)) * 100),
    detention_rate: Math.round((detentionsCount / totalInspections) * 100),
    performance_score: Math.round(performanceScore),
    risk_level: riskLevel,
    flag_state_average_score: 75 + Math.floor(Math.random() * 15),
    comparison_to_fleet: Math.floor(Math.random() * 20) - 10,
    ...overrides,
  };
}

/**
 * Factory para criar múltiplos fixtures de uma vez
 */
export const StarFixFixtures = {
  vessel: createMockVessel,
  deficiency: createMockDeficiency,
  inspection: createMockInspection,
  performanceMetrics: createMockPerformanceMetrics,
  
  /**
   * Cria um conjunto completo de dados para testes
   */
  fullDataset() {
    const vessel = createMockVessel();
    const inspections = Array.from({ length: 5 }, () => 
      createMockInspection({ imo_number: vessel.imo_number })
    );
    
    return {
      vessel,
      inspections,
      metrics: createMockPerformanceMetrics({ 
        imo_number: vessel.imo_number,
        total_inspections: inspections.length,
      }),
    };
  },
};
