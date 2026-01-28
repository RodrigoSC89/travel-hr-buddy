/**
 * Non-Conformity Prediction Engine
 * ML prevê áreas com maior probabilidade de falhas em inspeções PSC/OVID
 * Nível: Assistivo
 */

export interface VesselInspectionData {
  vesselId: string;
  vesselName: string;
  vesselType: string;
  imo: string;
  flagState: string;
  classificationSociety: string;
  age: number;
  dwt: number;
  lastDryDock: Date;
  inspectionHistory: InspectionRecord[];
  deficiencyHistory: DeficiencyRecord[];
  certificateStatus: CertificateRecord[];
  crewData: CrewInspectionData;
  maintenanceData: MaintenanceInspectionData;
  complianceData: ComplianceInspectionData;
}

export interface InspectionRecord {
  inspectionId: string;
  type: InspectionType;
  port: string;
  date: Date;
  inspector: string;
  authority: string;
  result: 'clear' | 'deficiencies' | 'detention';
  deficiencyCount: number;
  detentionDays: number;
  followUpRequired: boolean;
}

export type InspectionType = 'psc' | 'ovid' | 'flag_state' | 'class' | 'internal' | 'rightship';

export interface DeficiencyRecord {
  deficiencyId: string;
  inspectionId: string;
  code: string;
  category: DeficiencyCategory;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'detainable';
  area: string;
  rectifiedDate: Date | null;
  recurring: boolean;
  rootCause: string | null;
}

export type DeficiencyCategory = 
  | 'certificates'
  | 'crew'
  | 'ism_isps'
  | 'navigation'
  | 'safety_equipment'
  | 'fire_safety'
  | 'pollution_prevention'
  | 'structural'
  | 'machinery'
  | 'living_conditions'
  | 'working_conditions'
  | 'cargo_operations';

export interface CertificateRecord {
  name: string;
  number: string;
  issuedBy: string;
  issueDate: Date;
  expiryDate: Date;
  lastAudit: Date | null;
  status: 'valid' | 'expiring' | 'expired' | 'suspended';
  endorsements: number;
}

export interface CrewInspectionData {
  totalCrew: number;
  certificationsValid: number;
  certificationsExpiring: number;
  restHourCompliance: number;
  trainingUpToDate: number;
  medicalCertsValid: number;
  languageProficiency: 'high' | 'medium' | 'low';
  recentChanges: number;
}

export interface MaintenanceInspectionData {
  pmsCompliance: number;
  overdueTasks: number;
  criticalEquipmentStatus: EquipmentInspectionStatus[];
  lastClassSurvey: Date;
  hullCondition: 'good' | 'fair' | 'poor';
  machineryCondition: 'good' | 'fair' | 'poor';
}

export interface EquipmentInspectionStatus {
  equipment: string;
  category: string;
  status: 'operational' | 'degraded' | 'defective';
  lastTest: Date;
  testDue: Date;
  complianceStatus: 'compliant' | 'non_compliant' | 'pending';
}

export interface ComplianceInspectionData {
  smsUpdated: boolean;
  smsLastReview: Date;
  drillsCompleted: number;
  drillsRequired: number;
  openCAPs: number;
  recurringDeficiencies: number;
  lastInternalAudit: Date;
  internalAuditFindings: number;
}

export interface NCPrediction {
  predictionId: string;
  vesselId: string;
  vesselName: string;
  timestamp: Date;
  inspectionType: InspectionType;
  predictedOutcome: PredictedOutcome;
  overallRiskScore: number;
  detentionProbability: number;
  predictedDeficiencyCount: { min: number; max: number; expected: number };
  riskAreas: RiskArea[];
  recommendations: NCRecommendation[];
  confidence: number;
  validUntil: Date;
}

export interface PredictedOutcome {
  likely: 'clear' | 'minor_deficiencies' | 'major_deficiencies' | 'detention';
  probability: number;
  rationale: string;
}

export interface RiskArea {
  category: DeficiencyCategory;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  likelihood: number;
  potentialDeficiencies: PotentialDeficiency[];
  contributing_factors: string[];
  trend: 'improving' | 'stable' | 'worsening';
}

export interface PotentialDeficiency {
  code: string;
  description: string;
  likelihood: number;
  severity: 'low' | 'medium' | 'high' | 'detainable';
  preventiveAction: string;
}

export interface NCRecommendation {
  priority: 'critical' | 'high' | 'medium' | 'low';
  area: DeficiencyCategory;
  action: string;
  deadline: Date;
  estimatedEffort: string;
  expectedImpact: number;
  responsible: string;
}

export interface PortRiskProfile {
  portCode: string;
  portName: string;
  country: string;
  regime: 'paris_mou' | 'tokyo_mou' | 'indian_ocean' | 'uscg' | 'other';
  inspectionRate: number;
  detentionRate: number;
  focusAreas: DeficiencyCategory[];
  averageDeficiencies: number;
  riskLevel: 'low' | 'medium' | 'high';
}

class NCPredictionEngine {
  private readonly CATEGORY_WEIGHTS: Record<DeficiencyCategory, number> = {
    certificates: 0.12,
    crew: 0.10,
    ism_isps: 0.12,
    navigation: 0.08,
    safety_equipment: 0.10,
    fire_safety: 0.10,
    pollution_prevention: 0.08,
    structural: 0.08,
    machinery: 0.08,
    living_conditions: 0.06,
    working_conditions: 0.04,
    cargo_operations: 0.04
  };

  private readonly PORT_PROFILES: Map<string, PortRiskProfile> = new Map([
    ['USLAX', {
      portCode: 'USLAX',
      portName: 'Los Angeles',
      country: 'USA',
      regime: 'uscg',
      inspectionRate: 0.35,
      detentionRate: 0.02,
      focusAreas: ['safety_equipment', 'pollution_prevention', 'crew'],
      averageDeficiencies: 2.5,
      riskLevel: 'high'
    }],
    ['NLRTM', {
      portCode: 'NLRTM',
      portName: 'Rotterdam',
      country: 'Netherlands',
      regime: 'paris_mou',
      inspectionRate: 0.25,
      detentionRate: 0.03,
      focusAreas: ['ism_isps', 'certificates', 'structural'],
      averageDeficiencies: 3.0,
      riskLevel: 'medium'
    }]
  ]);

  predictNC(
    vesselData: VesselInspectionData,
    targetInspectionType: InspectionType,
    targetPort?: string
  ): NCPrediction {
    const riskAreas = this.analyzeRiskAreas(vesselData);
    const overallRisk = this.calculateOverallRisk(riskAreas);
    const detentionProb = this.calculateDetentionProbability(vesselData, riskAreas);
    const portProfile = targetPort ? this.PORT_PROFILES.get(targetPort) : null;

    return {
      predictionId: crypto.randomUUID(),
      vesselId: vesselData.vesselId,
      vesselName: vesselData.vesselName,
      timestamp: new Date(),
      inspectionType: targetInspectionType,
      predictedOutcome: this.predictOutcome(overallRisk, detentionProb),
      overallRiskScore: overallRisk,
      detentionProbability: detentionProb,
      predictedDeficiencyCount: this.predictDeficiencyCount(vesselData, riskAreas),
      riskAreas: riskAreas.sort((a, b) => b.riskScore - a.riskScore),
      recommendations: this.generateRecommendations(riskAreas, vesselData),
      confidence: this.calculateConfidence(vesselData),
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    };
  }

  private analyzeRiskAreas(data: VesselInspectionData): RiskArea[] {
    const areas: RiskArea[] = [];

    // Certificates
    areas.push(this.analyzeCertificates(data));

    // Crew
    areas.push(this.analyzeCrew(data));

    // ISM/ISPS
    areas.push(this.analyzeISM(data));

    // Safety Equipment
    areas.push(this.analyzeSafetyEquipment(data));

    // Fire Safety
    areas.push(this.analyzeFireSafety(data));

    // Pollution Prevention
    areas.push(this.analyzePollution(data));

    // Structural
    areas.push(this.analyzeStructural(data));

    // Machinery
    areas.push(this.analyzeMachinery(data));

    // Living/Working Conditions
    areas.push(this.analyzeConditions(data));

    return areas;
  }

  private analyzeCertificates(data: VesselInspectionData): RiskArea {
    const expiring = data.certificateStatus.filter(c => c.status === 'expiring');
    const expired = data.certificateStatus.filter(c => c.status === 'expired');
    
    let riskScore = 20; // Base
    riskScore += expiring.length * 15;
    riskScore += expired.length * 40;

    const potentialDeficiencies: PotentialDeficiency[] = [];

    if (expired.length > 0) {
      potentialDeficiencies.push({
        code: 'PSC-CERT-001',
        description: 'Certificado estatutário expirado',
        likelihood: 0.95,
        severity: 'detainable',
        preventiveAction: 'Renovar certificados antes da inspeção'
      });
    }

    if (expiring.length > 0) {
      potentialDeficiencies.push({
        code: 'PSC-CERT-002',
        description: 'Certificado próximo do vencimento',
        likelihood: 0.6,
        severity: 'medium',
        preventiveAction: 'Agendar renovação'
      });
    }

    return {
      category: 'certificates',
      riskScore: Math.min(100, riskScore),
      riskLevel: this.categorizeRisk(riskScore),
      likelihood: Math.min(0.95, (expired.length + expiring.length * 0.3) / 5),
      potentialDeficiencies,
      contributing_factors: this.getCertificateFactors(data),
      trend: this.analyzeTrend(data.deficiencyHistory, 'certificates')
    };
  }

  private analyzeCrew(data: VesselInspectionData): RiskArea {
    const crew = data.crewData;
    let riskScore = 15;

    riskScore += (100 - crew.certificationsValid) * 0.5;
    riskScore += crew.certificationsExpiring * 3;
    riskScore += (100 - crew.restHourCompliance) * 0.4;
    riskScore += (100 - crew.trainingUpToDate) * 0.3;
    riskScore += (100 - crew.medicalCertsValid) * 0.4;

    if (crew.languageProficiency === 'low') riskScore += 15;
    if (crew.recentChanges > 5) riskScore += 10;

    const potentialDeficiencies: PotentialDeficiency[] = [];

    if (crew.restHourCompliance < 90) {
      potentialDeficiencies.push({
        code: 'MLC-REST-001',
        description: 'Não conformidade com horas de descanso',
        likelihood: (100 - crew.restHourCompliance) / 100,
        severity: 'high',
        preventiveAction: 'Revisar escalas de trabalho e registros'
      });
    }

    return {
      category: 'crew',
      riskScore: Math.min(100, riskScore),
      riskLevel: this.categorizeRisk(riskScore),
      likelihood: Math.min(0.9, riskScore / 100),
      potentialDeficiencies,
      contributing_factors: this.getCrewFactors(crew),
      trend: this.analyzeTrend(data.deficiencyHistory, 'crew')
    };
  }

  private analyzeISM(data: VesselInspectionData): RiskArea {
    const compliance = data.complianceData;
    let riskScore = 15;

    if (!compliance.smsUpdated) riskScore += 25;
    
    const daysSinceReview = Math.floor(
      (Date.now() - new Date(compliance.smsLastReview).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceReview > 365) riskScore += 20;

    const drillCompletion = compliance.drillsCompleted / compliance.drillsRequired;
    riskScore += (1 - drillCompletion) * 30;

    riskScore += compliance.openCAPs * 5;
    riskScore += compliance.recurringDeficiencies * 10;

    const potentialDeficiencies: PotentialDeficiency[] = [];

    if (drillCompletion < 1) {
      potentialDeficiencies.push({
        code: 'ISM-DRL-001',
        description: 'Exercícios de emergência não realizados conforme programação',
        likelihood: (1 - drillCompletion),
        severity: 'high',
        preventiveAction: 'Completar exercícios pendentes'
      });
    }

    return {
      category: 'ism_isps',
      riskScore: Math.min(100, riskScore),
      riskLevel: this.categorizeRisk(riskScore),
      likelihood: Math.min(0.85, riskScore / 100),
      potentialDeficiencies,
      contributing_factors: this.getISMFactors(compliance),
      trend: this.analyzeTrend(data.deficiencyHistory, 'ism_isps')
    };
  }

  private analyzeSafetyEquipment(data: VesselInspectionData): RiskArea {
    const equipment = data.maintenanceData.criticalEquipmentStatus.filter(
      e => e.category === 'safety'
    );

    let riskScore = 15;
    const defective = equipment.filter(e => e.status === 'defective').length;
    const degraded = equipment.filter(e => e.status === 'degraded').length;
    const overdue = equipment.filter(e => new Date(e.testDue) < new Date()).length;

    riskScore += defective * 25;
    riskScore += degraded * 10;
    riskScore += overdue * 15;

    const potentialDeficiencies: PotentialDeficiency[] = [];

    if (defective > 0) {
      potentialDeficiencies.push({
        code: 'SOLAS-LSA-001',
        description: 'Equipamento salva-vidas defeituoso',
        likelihood: 0.9,
        severity: 'detainable',
        preventiveAction: 'Reparar ou substituir equipamento'
      });
    }

    if (overdue > 0) {
      potentialDeficiencies.push({
        code: 'SOLAS-LSA-002',
        description: 'Teste/inspeção de equipamento em atraso',
        likelihood: 0.7,
        severity: 'high',
        preventiveAction: 'Realizar testes pendentes'
      });
    }

    return {
      category: 'safety_equipment',
      riskScore: Math.min(100, riskScore),
      riskLevel: this.categorizeRisk(riskScore),
      likelihood: Math.min(0.9, riskScore / 100),
      potentialDeficiencies,
      contributing_factors: this.getEquipmentFactors(equipment),
      trend: this.analyzeTrend(data.deficiencyHistory, 'safety_equipment')
    };
  }

  private analyzeFireSafety(data: VesselInspectionData): RiskArea {
    const equipment = data.maintenanceData.criticalEquipmentStatus.filter(
      e => e.category === 'fire'
    );

    let riskScore = 15;
    const issues = equipment.filter(e => e.status !== 'operational').length;
    const overdueTests = equipment.filter(e => new Date(e.testDue) < new Date()).length;

    riskScore += issues * 20;
    riskScore += overdueTests * 12;

    return {
      category: 'fire_safety',
      riskScore: Math.min(100, riskScore),
      riskLevel: this.categorizeRisk(riskScore),
      likelihood: Math.min(0.85, riskScore / 100),
      potentialDeficiencies: issues > 0 ? [{
        code: 'FSS-001',
        description: 'Deficiência em sistema de combate a incêndio',
        likelihood: 0.8,
        severity: 'high',
        preventiveAction: 'Verificar e reparar sistemas de incêndio'
      }] : [],
      contributing_factors: [],
      trend: this.analyzeTrend(data.deficiencyHistory, 'fire_safety')
    };
  }

  private analyzePollution(data: VesselInspectionData): RiskArea {
    let riskScore = 15;
    
    // Check MARPOL-related equipment
    const pollutionEquipment = data.maintenanceData.criticalEquipmentStatus.filter(
      e => e.category === 'pollution' || e.category === 'marpol'
    );

    const issues = pollutionEquipment.filter(e => e.status !== 'operational').length;
    riskScore += issues * 20;

    return {
      category: 'pollution_prevention',
      riskScore: Math.min(100, riskScore),
      riskLevel: this.categorizeRisk(riskScore),
      likelihood: Math.min(0.7, riskScore / 100),
      potentialDeficiencies: [],
      contributing_factors: [],
      trend: this.analyzeTrend(data.deficiencyHistory, 'pollution_prevention')
    };
  }

  private analyzeStructural(data: VesselInspectionData): RiskArea {
    let riskScore = 10;

    if (data.age > 20) riskScore += 25;
    else if (data.age > 15) riskScore += 15;
    else if (data.age > 10) riskScore += 8;

    if (data.maintenanceData.hullCondition === 'poor') riskScore += 30;
    else if (data.maintenanceData.hullCondition === 'fair') riskScore += 15;

    const daysSinceDryDock = Math.floor(
      (Date.now() - new Date(data.lastDryDock).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceDryDock > 365 * 2.5) riskScore += 20;

    return {
      category: 'structural',
      riskScore: Math.min(100, riskScore),
      riskLevel: this.categorizeRisk(riskScore),
      likelihood: Math.min(0.75, riskScore / 100),
      potentialDeficiencies: [],
      contributing_factors: [`Idade: ${data.age} anos`, `Condição do casco: ${data.maintenanceData.hullCondition}`],
      trend: this.analyzeTrend(data.deficiencyHistory, 'structural')
    };
  }

  private analyzeMachinery(data: VesselInspectionData): RiskArea {
    let riskScore = 15;

    if (data.maintenanceData.machineryCondition === 'poor') riskScore += 30;
    else if (data.maintenanceData.machineryCondition === 'fair') riskScore += 15;

    riskScore += data.maintenanceData.overdueTasks * 2;
    riskScore += (100 - data.maintenanceData.pmsCompliance) * 0.3;

    return {
      category: 'machinery',
      riskScore: Math.min(100, riskScore),
      riskLevel: this.categorizeRisk(riskScore),
      likelihood: Math.min(0.7, riskScore / 100),
      potentialDeficiencies: [],
      contributing_factors: [],
      trend: this.analyzeTrend(data.deficiencyHistory, 'machinery')
    };
  }

  private analyzeConditions(data: VesselInspectionData): RiskArea {
    let riskScore = 10;
    
    // Simplified - would need more detailed data
    riskScore += (100 - data.crewData.trainingUpToDate) * 0.2;

    return {
      category: 'living_conditions',
      riskScore: Math.min(100, riskScore),
      riskLevel: this.categorizeRisk(riskScore),
      likelihood: Math.min(0.5, riskScore / 100),
      potentialDeficiencies: [],
      contributing_factors: [],
      trend: 'stable'
    };
  }

  private categorizeRisk(score: number): RiskArea['riskLevel'] {
    if (score >= 70) return 'critical';
    if (score >= 50) return 'high';
    if (score >= 30) return 'medium';
    return 'low';
  }

  private calculateOverallRisk(areas: RiskArea[]): number {
    let weightedSum = 0;
    for (const area of areas) {
      const weight = this.CATEGORY_WEIGHTS[area.category];
      weightedSum += area.riskScore * weight;
    }
    return Math.round(weightedSum);
  }

  private calculateDetentionProbability(
    data: VesselInspectionData,
    areas: RiskArea[]
  ): number {
    // Historical detention rate
    const detentions = data.inspectionHistory.filter(i => i.result === 'detention').length;
    const historicalRate = detentions / Math.max(1, data.inspectionHistory.length);

    // Current risk contribution
    const criticalAreas = areas.filter(a => a.riskLevel === 'critical').length;
    const detainableDeficiencies = areas.flatMap(a => a.potentialDeficiencies)
      .filter(d => d.severity === 'detainable' && d.likelihood > 0.5).length;

    let probability = historicalRate * 0.3; // Historical weight
    probability += criticalAreas * 0.15;
    probability += detainableDeficiencies * 0.2;

    return Math.min(0.95, probability);
  }

  private predictOutcome(risk: number, detentionProb: number): PredictedOutcome {
    if (detentionProb > 0.5) {
      return {
        likely: 'detention',
        probability: detentionProb,
        rationale: 'Alto risco de deficiências detentíveis identificadas'
      };
    }

    if (risk >= 60) {
      return {
        likely: 'major_deficiencies',
        probability: 0.7,
        rationale: 'Múltiplas áreas de alto risco identificadas'
      };
    }

    if (risk >= 35) {
      return {
        likely: 'minor_deficiencies',
        probability: 0.6,
        rationale: 'Algumas áreas requerem atenção'
      };
    }

    return {
      likely: 'clear',
      probability: 0.75,
      rationale: 'Embarcação em boas condições gerais'
    };
  }

  private predictDeficiencyCount(
    data: VesselInspectionData,
    areas: RiskArea[]
  ): { min: number; max: number; expected: number } {
    // Historical average
    const historicalAvg = data.inspectionHistory.reduce((sum, i) => sum + i.deficiencyCount, 0) / 
                         Math.max(1, data.inspectionHistory.length);

    // Risk-based adjustment
    const riskMultiplier = areas.reduce((sum, a) => sum + a.riskScore, 0) / (areas.length * 50);
    
    const expected = Math.round(historicalAvg * riskMultiplier);

    return {
      min: Math.max(0, expected - 2),
      max: expected + 3,
      expected
    };
  }

  private generateRecommendations(
    areas: RiskArea[],
    data: VesselInspectionData
  ): NCRecommendation[] {
    const recommendations: NCRecommendation[] = [];

    const highRiskAreas = areas.filter(a => a.riskLevel === 'critical' || a.riskLevel === 'high');

    for (const area of highRiskAreas) {
      for (const deficiency of area.potentialDeficiencies.slice(0, 2)) {
        recommendations.push({
          priority: deficiency.severity === 'detainable' ? 'critical' : 'high',
          area: area.category,
          action: deficiency.preventiveAction,
          deadline: new Date(Date.now() + (deficiency.severity === 'detainable' ? 3 : 7) * 24 * 60 * 60 * 1000),
          estimatedEffort: this.estimateEffort(deficiency),
          expectedImpact: Math.round(deficiency.likelihood * 20),
          responsible: this.assignResponsible(area.category)
        });
      }
    }

    return recommendations.slice(0, 10).sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  private estimateEffort(deficiency: PotentialDeficiency): string {
    if (deficiency.severity === 'detainable') return '8-24 horas';
    if (deficiency.severity === 'high') return '4-8 horas';
    return '1-4 horas';
  }

  private assignResponsible(category: DeficiencyCategory): string {
    const responsible: Record<DeficiencyCategory, string> = {
      certificates: 'DPA',
      crew: 'Master',
      ism_isps: 'DPA',
      navigation: 'Master',
      safety_equipment: 'Chief Officer',
      fire_safety: 'Chief Officer',
      pollution_prevention: 'Chief Engineer',
      structural: 'Chief Officer',
      machinery: 'Chief Engineer',
      living_conditions: 'Master',
      working_conditions: 'Master',
      cargo_operations: 'Chief Officer'
    };
    return responsible[category];
  }

  private analyzeTrend(
    history: DeficiencyRecord[],
    category: DeficiencyCategory
  ): 'improving' | 'stable' | 'worsening' {
    const categoryDeficiencies = history.filter(d => d.category === category);
    if (categoryDeficiencies.length < 3) return 'stable';

    const recent = categoryDeficiencies.slice(-3);
    const earlier = categoryDeficiencies.slice(-6, -3);

    if (earlier.length === 0) return 'stable';

    const recentAvg = recent.length;
    const earlierAvg = earlier.length;

    if (recentAvg < earlierAvg * 0.7) return 'improving';
    if (recentAvg > earlierAvg * 1.3) return 'worsening';
    return 'stable';
  }

  private calculateConfidence(data: VesselInspectionData): number {
    let confidence = 0.6; // Base

    // More historical data = higher confidence
    if (data.inspectionHistory.length >= 10) confidence += 0.15;
    else if (data.inspectionHistory.length >= 5) confidence += 0.1;

    // Recent inspections = higher confidence
    const recentInspections = data.inspectionHistory.filter(
      i => new Date(i.date) > new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
    );
    if (recentInspections.length >= 3) confidence += 0.1;

    // Complete data = higher confidence
    if (data.crewData && data.maintenanceData && data.complianceData) {
      confidence += 0.1;
    }

    return Math.min(0.95, confidence);
  }

  private getCertificateFactors(data: VesselInspectionData): string[] {
    const factors: string[] = [];
    const expiring = data.certificateStatus.filter(c => c.status === 'expiring').length;
    const expired = data.certificateStatus.filter(c => c.status === 'expired').length;
    
    if (expired > 0) factors.push(`${expired} certificado(s) expirado(s)`);
    if (expiring > 0) factors.push(`${expiring} certificado(s) expirando`);
    
    return factors;
  }

  private getCrewFactors(crew: CrewInspectionData): string[] {
    const factors: string[] = [];
    if (crew.restHourCompliance < 95) factors.push(`Conformidade horas descanso: ${crew.restHourCompliance}%`);
    if (crew.recentChanges > 3) factors.push(`${crew.recentChanges} mudanças recentes na tripulação`);
    return factors;
  }

  private getISMFactors(compliance: ComplianceInspectionData): string[] {
    const factors: string[] = [];
    if (compliance.openCAPs > 0) factors.push(`${compliance.openCAPs} CAPs em aberto`);
    if (compliance.recurringDeficiencies > 0) factors.push(`${compliance.recurringDeficiencies} deficiências recorrentes`);
    return factors;
  }

  private getEquipmentFactors(equipment: EquipmentInspectionStatus[]): string[] {
    const factors: string[] = [];
    const defective = equipment.filter(e => e.status === 'defective').length;
    const overdue = equipment.filter(e => new Date(e.testDue) < new Date()).length;
    
    if (defective > 0) factors.push(`${defective} equipamento(s) defeituoso(s)`);
    if (overdue > 0) factors.push(`${overdue} teste(s) em atraso`);
    
    return factors;
  }
}

export const ncPredictionEngine = new NCPredictionEngine();
