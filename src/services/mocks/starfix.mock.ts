/**
 * StarFix API Mock Service
 * 
 * Fornece dados simulados realistas de FSP (Flag State Performance)
 * Para desenvolvimento e testes até obter acesso à API real
 */

import { 
  StarFixVessel, 
  StarFixInspection, 
  StarFixDeficiency,
  StarFixPerformanceMetrics 
} from '../api/starfix/starfix.service';

// Feature flag - controla se usa mock ou API real
const USE_MOCK_API = (import.meta as any).env.VITE_USE_MOCK_STARFIX !== 'false';

/**
 * Banco de dados mock de vessels
 */
const mockVessels: Map<string, StarFixVessel> = new Map();

/**
 * Banco de dados mock de inspections
 */
const mockInspections: Map<string, StarFixInspection[]> = new Map();

/**
 * Gera vessel simulado
 */
export function generateMockVessel(imoNumber: string, vesselName: string): StarFixVessel {
  const flagStates = ['BRA', 'PAN', 'LBR', 'MLT', 'CYP', 'GRC', 'USA'];
  const vesselTypes = ['BULK_CARRIER', 'CONTAINER', 'TANKER', 'GENERAL_CARGO', 'PASSENGER'];
  const classificationSocieties = ['DNV', 'ABS', 'LR', 'BV', 'RINA', 'CCS'];
  
  return {
    imo_number: imoNumber,
    vessel_name: vesselName,
    flag_state: flagStates[Math.floor(Math.random() * flagStates.length)],
    vessel_type: vesselTypes[Math.floor(Math.random() * vesselTypes.length)],
    gross_tonnage: Math.floor(5000 + Math.random() * 95000), // 5k - 100k GT
    year_built: 1990 + Math.floor(Math.random() * 34), // 1990-2024
    classification_society: classificationSocieties[Math.floor(Math.random() * classificationSocieties.length)],
  };
}

/**
 * Gera deficiências simuladas
 */
function generateMockDeficiencies(count: number): StarFixDeficiency[] {
  const deficiencyCodes = [
    { code: '01306', desc: 'Fire doors', convention: 'SOLAS', severity: 'medium' as const },
    { code: '15150', desc: 'ISM - Procedures for reporting accidents', convention: 'ISM', severity: 'high' as const },
    { code: '07115', desc: 'Lifeboats', convention: 'SOLAS', severity: 'critical' as const },
    { code: '11101', desc: 'Charts', convention: 'SOLAS', severity: 'low' as const },
    { code: '02106', desc: 'Stability information', convention: 'LOADLINE', severity: 'medium' as const },
    { code: '13216', desc: 'Food and catering', convention: 'MLC', severity: 'low' as const },
    { code: '04118', desc: 'Oil discharge monitoring', convention: 'MARPOL', severity: 'high' as const },
    { code: '18305', desc: 'Safe working load test', convention: 'SOLAS', severity: 'medium' as const },
  ];
  
  const deficiencies: StarFixDeficiency[] = [];
  
  for (let i = 0; i < count; i++) {
    const def = deficiencyCodes[Math.floor(Math.random() * deficiencyCodes.length)];
    const rectified = Math.random() > 0.3; // 70% rectified
    const daysAgo = Math.floor(Math.random() * 180); // últimos 6 meses
    
    deficiencies.push({
      deficiency_code: def.code,
      deficiency_description: def.desc,
      convention: def.convention,
      severity: def.severity,
      action_taken: rectified ? 'Rectified on board' : 'Rectification required',
      rectification_deadline: !rectified ? 
        new Date(Date.now() + (30 + Math.random() * 60) * 24 * 3600000).toISOString().split('T')[0] : 
        undefined,
      rectified,
      rectification_date: rectified ? 
        new Date(Date.now() - daysAgo * 24 * 3600000).toISOString().split('T')[0] : 
        undefined,
    });
  }
  
  return deficiencies;
}

/**
 * Gera inspeção simulada
 */
export function generateMockInspection(vesselId: string, imoNumber: string): StarFixInspection {
  const inspectionTypes = ['PSC', 'FSI', 'ISM', 'ISPS'] as const;
  const ports = [
    { name: 'Santos', country: 'Brazil' },
    { name: 'Rotterdam', country: 'Netherlands' },
    { name: 'Singapore', country: 'Singapore' },
    { name: 'Houston', country: 'USA' },
    { name: 'Antwerp', country: 'Belgium' },
    { name: 'Hamburg', country: 'Germany' },
    { name: 'Tokyo', country: 'Japan' },
  ];
  const authorities = ['Paris MOU', 'Tokyo MOU', 'US Coast Guard', 'Vigiagro', 'Caribbean MOU'];
  
  const port = ports[Math.floor(Math.random() * ports.length)];
  const deficienciesCount = Math.random() < 0.6 ? 
    Math.floor(Math.random() * 5) : // 60% tem 0-4 deficiências
    Math.floor(5 + Math.random() * 10); // 40% tem 5-14 deficiências
  
  const detentions = deficienciesCount > 8 && Math.random() < 0.3 ? 1 : 0; // Detenção se muitas deficiências
  
  const deficiencies = generateMockDeficiencies(deficienciesCount);
  const result = detentions > 0 ? 'DETENTION' : 
                 deficienciesCount > 0 ? 'DEFICIENCY' : 
                 'CLEAR';
  
  const daysAgo = Math.floor(Math.random() * 365); // último ano
  
  return {
    id: crypto.randomUUID(),
    vessel_id: vesselId,
    imo_number: imoNumber,
    inspection_date: new Date(Date.now() - daysAgo * 24 * 3600000).toISOString().split('T')[0],
    port_name: port.name,
    port_country: port.country,
    inspection_type: inspectionTypes[Math.floor(Math.random() * inspectionTypes.length)],
    authority: authorities[Math.floor(Math.random() * authorities.length)],
    deficiencies_count: deficienciesCount,
    detentions: detentions,
    inspection_result: result,
    deficiencies,
    starfix_sync_status: 'synced',
    last_sync_date: new Date().toISOString(),
  };
}

/**
 * Gera métricas de performance
 */
export function generateMockPerformanceMetrics(
  vesselId: string, 
  imoNumber: string,
  inspections: StarFixInspection[]
): StarFixPerformanceMetrics {
  const now = new Date();
  const periodStart = new Date(now.getTime() - 365 * 24 * 3600000); // último ano
  
  const totalInspections = inspections.length;
  const deficienciesCount = inspections.reduce((sum, i) => sum + i.deficiencies_count, 0);
  const detentionsCount = inspections.reduce((sum, i) => sum + i.detentions, 0);
  
  const nilDeficiencyRate = totalInspections > 0 ? 
    (inspections.filter(i => i.deficiencies_count === 0).length / totalInspections) * 100 : 0;
  const detentionRate = totalInspections > 0 ? (detentionsCount / totalInspections) * 100 : 0;
  
  // Performance score (0-100)
  const performanceScore = Math.max(0, 100 - (deficienciesCount * 5) - (detentionsCount * 20));
  
  // Métricas de frota (simuladas)
  const flagStateAverageScore = 75 + Math.random() * 15; // 75-90
  const comparisonToFleet = performanceScore - flagStateAverageScore;
  
  // Cálculo de risk level
  let riskLevel: 'low' | 'medium' | 'high' | 'critical';
  if (performanceScore >= 80) {
    riskLevel = 'low';
  } else if (performanceScore >= 60) {
    riskLevel = 'medium';
  } else if (performanceScore >= 40) {
    riskLevel = 'high';
  } else {
    riskLevel = 'critical';
  }
  
  return {
    vessel_id: vesselId,
    imo_number: imoNumber,
    period_start: periodStart.toISOString().split('T')[0],
    period_end: now.toISOString().split('T')[0],
    total_inspections: totalInspections,
    detentions_count: detentionsCount,
    deficiencies_count: deficienciesCount,
    nil_deficiency_rate: Math.round(nilDeficiencyRate * 100) / 100,
    detention_rate: Math.round(detentionRate * 100) / 100,
    performance_score: Math.round(performanceScore),
    risk_level: riskLevel,
    flag_state_average_score: Math.round(flagStateAverageScore),
    comparison_to_fleet: Math.round(comparisonToFleet),
  };
}

/**
 * Simula delay de rede
 */
async function simulateNetworkDelay(minMs: number = 200, maxMs: number = 800): Promise<void> {
  const delay = Math.random() * (maxMs - minMs) + minMs;
  await new Promise(resolve => setTimeout(resolve, delay));
}

/**
 * Mock API Wrapper
 */
export const StarFixMockAPI = {
  /**
   * Registrar vessel no StarFix
   */
  async registerVessel(vesselData: Partial<StarFixVessel>): Promise<{ success: boolean; vessel: StarFixVessel }> {
    console.log('🟡 [MOCK] StarFix: Registering vessel...');
    await simulateNetworkDelay();
    
    const vessel = generateMockVessel(
      vesselData.imo_number || `IMO${Math.floor(1000000 + Math.random() * 9000000)}`,
      vesselData.vessel_name || 'Mock Vessel'
    );
    
    // Armazenar no "banco de dados" mock
    mockVessels.set(vessel.imo_number, vessel);
    
    // Gerar algumas inspeções iniciais
    const initialInspections = [];
    const inspectionCount = Math.floor(3 + Math.random() * 7); // 3-10 inspeções
    for (let i = 0; i < inspectionCount; i++) {
      initialInspections.push(generateMockInspection('vessel-id', vessel.imo_number));
    }
    mockInspections.set(vessel.imo_number, initialInspections);
    
    console.log('✅ [MOCK] StarFix: Vessel registered', vessel);
    return { success: true, vessel };
  },
  
  /**
   * Buscar inspeções do StarFix
   */
  async fetchInspections(imoNumber: string, startDate?: string, endDate?: string): Promise<StarFixInspection[]> {
    console.log('🟡 [MOCK] StarFix: Fetching inspections...');
    await simulateNetworkDelay();
    
    let inspections = mockInspections.get(imoNumber) || [];
    
    // Se não tem inspeções, gerar algumas
    if (inspections.length === 0) {
      const count = Math.floor(3 + Math.random() * 7);
      for (let i = 0; i < count; i++) {
        inspections.push(generateMockInspection('vessel-id', imoNumber));
      }
      mockInspections.set(imoNumber, inspections);
    }
    
    // Filtrar por data se fornecido
    if (startDate || endDate) {
      inspections = inspections.filter(insp => {
        const inspDate = new Date(insp.inspection_date);
        if (startDate && inspDate < new Date(startDate)) return false;
        if (endDate && inspDate > new Date(endDate)) return false;
        return true;
      });
    }
    
    // Ordenar por data (mais recente primeiro)
    inspections.sort((a, b) => new Date(b.inspection_date).getTime() - new Date(a.inspection_date).getTime());
    
    console.log(`✅ [MOCK] StarFix: Found ${inspections.length} inspections`);
    return inspections;
  },
  
  /**
   * Obter métricas de performance
   */
  async getPerformanceMetrics(imoNumber: string): Promise<StarFixPerformanceMetrics> {
    console.log('🟡 [MOCK] StarFix: Getting performance metrics...');
    await simulateNetworkDelay();
    
    const inspections = await this.fetchInspections(imoNumber);
    const metrics = generateMockPerformanceMetrics('vessel-id', imoNumber, inspections);
    
    console.log('✅ [MOCK] StarFix: Metrics retrieved', metrics);
    return metrics;
  },
  
  /**
   * Submeter inspeção para StarFix
   */
  async submitInspection(inspection: Partial<StarFixInspection>): Promise<{ success: boolean; inspectionId: string }> {
    console.log('🟡 [MOCK] StarFix: Submitting inspection...');
    await simulateNetworkDelay(300, 1000);
    
    const inspectionId = crypto.randomUUID();
    const imoNumber = inspection.imo_number || 'IMO0000000';
    
    // Adicionar ao banco mock
    const existingInspections = mockInspections.get(imoNumber) || [];
    const newInspection: StarFixInspection = {
      id: inspectionId,
      vessel_id: inspection.vessel_id || 'vessel-id',
      imo_number: imoNumber,
      inspection_date: inspection.inspection_date || new Date().toISOString().split('T')[0],
      port_name: inspection.port_name || 'Unknown Port',
      port_country: inspection.port_country || 'Unknown',
      inspection_type: inspection.inspection_type || 'PSC',
      authority: inspection.authority || 'Unknown Authority',
      deficiencies_count: inspection.deficiencies_count || 0,
      detentions: inspection.detentions || 0,
      inspection_result: inspection.inspection_result || 'CLEAR',
      deficiencies: inspection.deficiencies || [],
      starfix_sync_status: 'synced',
      last_sync_date: new Date().toISOString(),
    };
    
    existingInspections.push(newInspection);
    mockInspections.set(imoNumber, existingInspections);
    
    console.log('✅ [MOCK] StarFix: Inspection submitted', inspectionId);
    return { success: true, inspectionId };
  },
  
  /**
   * Sincronizar inspeções pendentes
   */
  async syncPendingInspections(vesselIds: string[]): Promise<{ synced: number; failed: number; errors: string[] }> {
    console.log('🟡 [MOCK] StarFix: Syncing pending inspections...');
    await simulateNetworkDelay(500, 1500);
    
    const synced = vesselIds.length;
    const failed = Math.random() < 0.1 ? 1 : 0; // 10% de chance de falha
    const errors = failed > 0 ? ['Mock sync error for testing'] : [];
    
    console.log(`✅ [MOCK] StarFix: Sync complete - ${synced} synced, ${failed} failed`);
    return { synced, failed, errors };
  },
  
  /**
   * Obter status de sincronização
   */
  async getSyncStatus(vesselId: string): Promise<{ 
    last_sync: string; 
    pending_count: number; 
    status: 'ok' | 'pending' | 'error' 
  }> {
    console.log('🟡 [MOCK] StarFix: Getting sync status...');
    await simulateNetworkDelay(100, 300);
    
    const pendingCount = Math.floor(Math.random() * 3); // 0-2 pendentes
    const status: 'ok' | 'pending' | 'error' = pendingCount > 0 ? 'pending' : 'ok';
    
    const result = {
      last_sync: new Date(Date.now() - Math.random() * 3600000).toISOString(), // última hora
      pending_count: pendingCount,
      status,
    };
    
    console.log('✅ [MOCK] StarFix: Sync status retrieved', result);
    return result;
  },
};

/**
 * Helper: Verificar se está usando mock
 */
export function isUsingMockStarFix(): boolean {
  return USE_MOCK_API;
}

/**
 * Helper: Log de aviso sobre mock
 */
export function logMockWarning(): void {
  if (USE_MOCK_API) {
    console.warn('⚠️  STARFIX MOCK API EM USO');
    console.warn('📘 Dados simulados para desenvolvimento');
    console.warn('🔄 Configure VITE_USE_MOCK_STARFIX=false para usar API real');
  }
}

// Auto-log ao importar
logMockWarning();
