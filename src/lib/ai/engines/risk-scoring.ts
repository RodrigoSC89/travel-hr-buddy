/**
 * Dynamic Risk Scoring Engine
 * Score de risco por operação/viagem com ajuste automático de protocolos
 * Nível: Semi-autônomo
 */

export interface RiskAssessmentInput {
  vesselId: string;
  vesselData: VesselRiskData;
  operationData: OperationData;
  environmentalData: EnvironmentalData;
  crewData: CrewRiskData;
  historicalData: HistoricalRiskData;
}

export interface VesselRiskData {
  vesselName: string;
  vesselType: string;
  age: number; // years
  flagState: string;
  classStatus: 'valid' | 'suspended' | 'expired';
  lastInspectionDate: Date;
  pscDeficiencies: number; // last 36 months
  detentions: number; // last 36 months
  maintenanceScore: number; // 0-100
  equipmentStatus: EquipmentStatus[];
}

export interface EquipmentStatus {
  equipment: string;
  status: 'operational' | 'degraded' | 'failed';
  lastMaintenance: Date;
  nextMaintenance: Date;
  criticality: 'critical' | 'important' | 'standard';
}

export interface OperationData {
  operationType: OperationType;
  cargoType: string;
  cargoVolume: number;
  loadingPort: string;
  dischargePort: string;
  estimatedDuration: number; // days
  nightOperations: boolean;
  complexManeuvers: boolean;
  specialRequirements: string[];
}

export type OperationType = 
  | 'cargo_loading' 
  | 'cargo_discharge' 
  | 'bunkering' 
  | 'anchor_handling'
  | 'dp_operations'
  | 'passenger_transfer'
  | 'hot_work'
  | 'confined_space'
  | 'routine_navigation';

export interface EnvironmentalData {
  weatherForecast: WeatherRisk;
  seaState: number; // Beaufort scale 0-12
  visibility: 'good' | 'moderate' | 'poor' | 'very_poor';
  currentStrength: number; // knots
  windSpeed: number; // knots
  precipitation: boolean;
  iceRisk: boolean;
  piracyZone: boolean;
  portConditions: 'normal' | 'congested' | 'restricted';
}

export interface WeatherRisk {
  severity: 'low' | 'moderate' | 'high' | 'extreme';
  forecast: string;
  warnings: string[];
}

export interface CrewRiskData {
  totalCrew: number;
  experiencedCrew: number; // >2 years on similar vessel
  certificationCompliance: number; // percentage
  recentIncidents: number;
  fatigueRisk: 'low' | 'moderate' | 'high';
  languageBarriers: boolean;
  newCrewPercentage: number;
}

export interface HistoricalRiskData {
  similarOperationIncidents: number;
  vesselIncidentRate: number;
  companyIncidentRate: number;
  routeIncidentHistory: number;
  seasonalRiskFactor: number;
}

export interface RiskScore {
  assessmentId: string;
  vesselId: string;
  vesselName: string;
  operationType: OperationType;
  timestamp: Date;
  overallScore: number; // 0-100 (higher = more risk)
  riskLevel: 'acceptable' | 'elevated' | 'high' | 'critical';
  categoryScores: RiskCategoryScores;
  topRisks: IdentifiedRisk[];
  mitigations: RiskMitigation[];
  protocolAdjustments: ProtocolAdjustment[];
  goNoGoRecommendation: 'proceed' | 'proceed_with_caution' | 'delay' | 'abort';
  validUntil: Date;
}

export interface RiskCategoryScores {
  vesselCondition: number;
  operationalComplexity: number;
  environmental: number;
  crewReadiness: number;
  historical: number;
  regulatory: number;
}

export interface IdentifiedRisk {
  riskId: string;
  category: keyof RiskCategoryScores;
  description: string;
  likelihood: 'rare' | 'unlikely' | 'possible' | 'likely' | 'almost_certain';
  impact: 'negligible' | 'minor' | 'moderate' | 'major' | 'catastrophic';
  riskScore: number;
  trend: 'improving' | 'stable' | 'worsening';
  controlsInPlace: string[];
}

export interface RiskMitigation {
  mitigationId: string;
  targetRisk: string;
  action: string;
  priority: 'immediate' | 'before_operation' | 'during_operation' | 'after_operation';
  responsible: string;
  expectedReduction: number; // percentage
  cost: number;
  timeRequired: string;
  mandatory: boolean;
}

export interface ProtocolAdjustment {
  protocol: string;
  currentLevel: string;
  adjustedLevel: string;
  reason: string;
  additionalRequirements: string[];
}

class RiskScoringEngine {
  private readonly CATEGORY_WEIGHTS: Record<keyof RiskCategoryScores, number> = {
    vesselCondition: 0.20,
    operationalComplexity: 0.25,
    environmental: 0.20,
    crewReadiness: 0.15,
    historical: 0.10,
    regulatory: 0.10
  };

  private readonly OPERATION_BASE_RISK: Record<OperationType, number> = {
    cargo_loading: 30,
    cargo_discharge: 30,
    bunkering: 45,
    anchor_handling: 55,
    dp_operations: 50,
    passenger_transfer: 40,
    hot_work: 60,
    confined_space: 65,
    routine_navigation: 20
  };

  assessRisk(input: RiskAssessmentInput): RiskScore {
    const categoryScores = this.calculateCategoryScores(input);
    const overallScore = this.calculateOverallScore(categoryScores);
    const riskLevel = this.categorizeRiskLevel(overallScore);
    const topRisks = this.identifyTopRisks(input, categoryScores);
    const mitigations = this.generateMitigations(topRisks, input);
    const protocolAdjustments = this.determineProtocolAdjustments(riskLevel, input);

    return {
      assessmentId: crypto.randomUUID(),
      vesselId: input.vesselId,
      vesselName: input.vesselData.vesselName,
      operationType: input.operationData.operationType,
      timestamp: new Date(),
      overallScore,
      riskLevel,
      categoryScores,
      topRisks,
      mitigations,
      protocolAdjustments,
      goNoGoRecommendation: this.generateGoNoGoRecommendation(overallScore, topRisks),
      validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000)
    };
  }

  private calculateCategoryScores(input: RiskAssessmentInput): RiskCategoryScores {
    return {
      vesselCondition: this.scoreVesselCondition(input.vesselData),
      operationalComplexity: this.scoreOperationalComplexity(input.operationData),
      environmental: this.scoreEnvironmental(input.environmentalData),
      crewReadiness: this.scoreCrewReadiness(input.crewData),
      historical: this.scoreHistorical(input.historicalData),
      regulatory: this.scoreRegulatory(input.vesselData, input.crewData)
    };
  }

  private scoreVesselCondition(vessel: VesselRiskData): number {
    let score = 20; // Base score

    // Age factor
    if (vessel.age > 20) score += 25;
    else if (vessel.age > 15) score += 15;
    else if (vessel.age > 10) score += 8;

    // Class status
    if (vessel.classStatus === 'expired') score += 30;
    else if (vessel.classStatus === 'suspended') score += 20;

    // PSC history
    score += Math.min(20, vessel.pscDeficiencies * 3);
    score += vessel.detentions * 15;

    // Maintenance
    score += (100 - vessel.maintenanceScore) * 0.2;

    // Equipment status
    const criticalIssues = vessel.equipmentStatus.filter(
      e => e.criticality === 'critical' && e.status !== 'operational'
    );
    score += criticalIssues.length * 15;

    return Math.min(100, score);
  }

  private scoreOperationalComplexity(operation: OperationData): number {
    let score = this.OPERATION_BASE_RISK[operation.operationType];

    // Night operations
    if (operation.nightOperations) score += 10;

    // Complex maneuvers
    if (operation.complexManeuvers) score += 15;

    // Cargo risk
    if (this.isHazardousCargo(operation.cargoType)) score += 20;

    // Duration
    if (operation.estimatedDuration > 14) score += 10;
    else if (operation.estimatedDuration > 7) score += 5;

    // Special requirements
    score += operation.specialRequirements.length * 3;

    return Math.min(100, score);
  }

  private isHazardousCargo(cargoType: string): boolean {
    const hazardous = ['crude_oil', 'lng', 'lpg', 'chemicals', 'explosives', 'radioactive'];
    return hazardous.some(h => cargoType.toLowerCase().includes(h));
  }

  private scoreEnvironmental(env: EnvironmentalData): number {
    let score = 15; // Base score

    // Weather
    const weatherScores = { low: 0, moderate: 15, high: 30, extreme: 50 };
    score += weatherScores[env.weatherForecast.severity];

    // Sea state
    if (env.seaState >= 7) score += 30;
    else if (env.seaState >= 5) score += 15;
    else if (env.seaState >= 4) score += 8;

    // Visibility
    const visibilityScores = { good: 0, moderate: 10, poor: 20, very_poor: 35 };
    score += visibilityScores[env.visibility];

    // Wind
    if (env.windSpeed > 40) score += 25;
    else if (env.windSpeed > 25) score += 12;

    // Special conditions
    if (env.iceRisk) score += 20;
    if (env.piracyZone) score += 25;
    if (env.portConditions === 'congested') score += 10;
    if (env.portConditions === 'restricted') score += 15;

    return Math.min(100, score);
  }

  private scoreCrewReadiness(crew: CrewRiskData): number {
    let score = 20; // Base score

    // Experience ratio
    const experienceRatio = crew.experiencedCrew / crew.totalCrew;
    if (experienceRatio < 0.3) score += 30;
    else if (experienceRatio < 0.5) score += 15;
    else if (experienceRatio < 0.7) score += 5;

    // New crew
    if (crew.newCrewPercentage > 30) score += 20;
    else if (crew.newCrewPercentage > 20) score += 10;

    // Certification
    score += (100 - crew.certificationCompliance) * 0.3;

    // Fatigue
    const fatigueScores = { low: 0, moderate: 15, high: 30 };
    score += fatigueScores[crew.fatigueRisk];

    // Recent incidents
    score += crew.recentIncidents * 8;

    // Language barriers
    if (crew.languageBarriers) score += 10;

    return Math.min(100, score);
  }

  private scoreHistorical(history: HistoricalRiskData): number {
    let score = 15; // Base score

    // Similar operation incidents
    score += history.similarOperationIncidents * 10;

    // Vessel incident rate (incidents per 1000 days)
    score += Math.min(30, history.vesselIncidentRate * 15);

    // Company rate comparison
    if (history.vesselIncidentRate > history.companyIncidentRate * 1.5) {
      score += 15;
    }

    // Route history
    score += Math.min(15, history.routeIncidentHistory * 5);

    // Seasonal factor
    score += (history.seasonalRiskFactor - 1) * 20;

    return Math.min(100, score);
  }

  private scoreRegulatory(vessel: VesselRiskData, crew: CrewRiskData): number {
    let score = 10; // Base score

    // Days since last inspection
    const daysSinceInspection = Math.floor(
      (Date.now() - new Date(vessel.lastInspectionDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceInspection > 365) score += 25;
    else if (daysSinceInspection > 180) score += 10;

    // Flag state performance (simplified)
    const highRiskFlags = ['unknown', 'grey_list', 'banned'];
    if (highRiskFlags.some(f => vessel.flagState.toLowerCase().includes(f))) {
      score += 25;
    }

    // Crew certification compliance
    if (crew.certificationCompliance < 90) score += 20;
    else if (crew.certificationCompliance < 95) score += 10;

    // PSC deficiency trend
    if (vessel.pscDeficiencies > 10) score += 20;
    else if (vessel.pscDeficiencies > 5) score += 10;

    return Math.min(100, score);
  }

  private calculateOverallScore(categories: RiskCategoryScores): number {
    let total = 0;
    for (const [category, score] of Object.entries(categories)) {
      const weight = this.CATEGORY_WEIGHTS[category as keyof RiskCategoryScores];
      total += score * weight;
    }
    return Math.round(total);
  }

  private categorizeRiskLevel(score: number): RiskScore['riskLevel'] {
    if (score >= 75) return 'critical';
    if (score >= 55) return 'high';
    if (score >= 35) return 'elevated';
    return 'acceptable';
  }

  private identifyTopRisks(
    input: RiskAssessmentInput,
    scores: RiskCategoryScores
  ): IdentifiedRisk[] {
    const risks: IdentifiedRisk[] = [];

    // Vessel condition risks
    if (scores.vesselCondition >= 50) {
      const criticalEquipment = input.vesselData.equipmentStatus.filter(
        e => e.criticality === 'critical' && e.status !== 'operational'
      );
      
      if (criticalEquipment.length > 0) {
        risks.push({
          riskId: crypto.randomUUID(),
          category: 'vesselCondition',
          description: `${criticalEquipment.length} equipamento(s) crítico(s) com status degradado`,
          likelihood: 'likely',
          impact: 'major',
          riskScore: 80,
          trend: 'stable',
          controlsInPlace: ['Manutenção programada', 'Monitoramento contínuo']
        });
      }

      if (input.vesselData.age > 20) {
        risks.push({
          riskId: crypto.randomUUID(),
          category: 'vesselCondition',
          description: 'Embarcação com mais de 20 anos de operação',
          likelihood: 'possible',
          impact: 'moderate',
          riskScore: 60,
          trend: 'worsening',
          controlsInPlace: ['Inspeções ampliadas', 'Programa de manutenção intensivo']
        });
      }
    }

    // Environmental risks
    if (scores.environmental >= 50) {
      if (input.environmentalData.weatherForecast.severity === 'extreme') {
        risks.push({
          riskId: crypto.randomUUID(),
          category: 'environmental',
          description: 'Condições meteorológicas extremas previstas',
          likelihood: 'almost_certain',
          impact: 'major',
          riskScore: 90,
          trend: 'worsening',
          controlsInPlace: ['Monitoramento meteorológico', 'Plano de contingência']
        });
      }

      if (input.environmentalData.piracyZone) {
        risks.push({
          riskId: crypto.randomUUID(),
          category: 'environmental',
          description: 'Rota passa por zona de alto risco de pirataria',
          likelihood: 'possible',
          impact: 'catastrophic',
          riskScore: 85,
          trend: 'stable',
          controlsInPlace: ['Equipe de segurança armada', 'Protocolo anti-pirataria']
        });
      }
    }

    // Crew risks
    if (scores.crewReadiness >= 50) {
      if (input.crewData.fatigueRisk === 'high') {
        risks.push({
          riskId: crypto.randomUUID(),
          category: 'crewReadiness',
          description: 'Alto risco de fadiga identificado na tripulação',
          likelihood: 'likely',
          impact: 'major',
          riskScore: 75,
          trend: 'worsening',
          controlsInPlace: ['Registro de horas de descanso', 'Rotação de turnos']
        });
      }

      if (input.crewData.newCrewPercentage > 30) {
        risks.push({
          riskId: crypto.randomUUID(),
          category: 'crewReadiness',
          description: `${input.crewData.newCrewPercentage}% da tripulação é nova`,
          likelihood: 'possible',
          impact: 'moderate',
          riskScore: 55,
          trend: 'stable',
          controlsInPlace: ['Programa de familiarização', 'Supervisão intensificada']
        });
      }
    }

    return risks.sort((a, b) => b.riskScore - a.riskScore).slice(0, 5);
  }

  private generateMitigations(
    risks: IdentifiedRisk[],
    input: RiskAssessmentInput
  ): RiskMitigation[] {
    const mitigations: RiskMitigation[] = [];

    for (const risk of risks) {
      switch (risk.category) {
        case 'vesselCondition':
          mitigations.push({
            mitigationId: crypto.randomUUID(),
            targetRisk: risk.riskId,
            action: 'Realizar inspeção técnica pré-operação',
            priority: 'before_operation',
            responsible: 'Chief Engineer',
            expectedReduction: 20,
            cost: 500,
            timeRequired: '4 horas',
            mandatory: risk.riskScore >= 70
          });
          break;

        case 'environmental':
          if (risk.description.includes('meteorológicas')) {
            mitigations.push({
              mitigationId: crypto.randomUUID(),
              targetRisk: risk.riskId,
              action: 'Aguardar janela meteorológica favorável',
              priority: 'immediate',
              responsible: 'Master',
              expectedReduction: 40,
              cost: 0,
              timeRequired: '24-48 horas',
              mandatory: true
            });
          }
          if (risk.description.includes('pirataria')) {
            mitigations.push({
              mitigationId: crypto.randomUUID(),
              targetRisk: risk.riskId,
              action: 'Embarcar equipe de segurança armada',
              priority: 'before_operation',
              responsible: 'Fleet Manager',
              expectedReduction: 50,
              cost: 15000,
              timeRequired: '24 horas',
              mandatory: true
            });
          }
          break;

        case 'crewReadiness':
          if (risk.description.includes('fadiga')) {
            mitigations.push({
              mitigationId: crypto.randomUUID(),
              targetRisk: risk.riskId,
              action: 'Implementar escala de descanso reforçada',
              priority: 'immediate',
              responsible: 'Chief Officer',
              expectedReduction: 30,
              cost: 0,
              timeRequired: 'Imediato',
              mandatory: true
            });
          }
          break;
      }
    }

    return mitigations;
  }

  private determineProtocolAdjustments(
    riskLevel: RiskScore['riskLevel'],
    input: RiskAssessmentInput
  ): ProtocolAdjustment[] {
    const adjustments: ProtocolAdjustment[] = [];

    if (riskLevel === 'critical' || riskLevel === 'high') {
      adjustments.push({
        protocol: 'Supervisão de Operações',
        currentLevel: 'Normal',
        adjustedLevel: 'Intensificada',
        reason: `Nível de risco ${riskLevel}`,
        additionalRequirements: [
          'Oficial de serviço em ponte durante toda operação',
          'Check-ins de 15 em 15 minutos com escritório'
        ]
      });

      adjustments.push({
        protocol: 'Comunicação',
        currentLevel: 'Padrão',
        adjustedLevel: 'Reforçada',
        reason: 'Operação de alto risco',
        additionalRequirements: [
          'Canal de rádio dedicado',
          'Relatórios horários ao DPA'
        ]
      });
    }

    if (input.operationData.operationType === 'hot_work' || 
        input.operationData.operationType === 'confined_space') {
      adjustments.push({
        protocol: 'Permissão de Trabalho',
        currentLevel: 'Nível 1',
        adjustedLevel: 'Nível 3',
        reason: 'Trabalho de alto risco',
        additionalRequirements: [
          'Aprovação do Comandante E DPA',
          'Equipe de resgate de prontidão',
          'Monitoramento de atmosfera contínuo'
        ]
      });
    }

    if (input.environmentalData.weatherForecast.severity === 'high' ||
        input.environmentalData.weatherForecast.severity === 'extreme') {
      adjustments.push({
        protocol: 'Operações em Mau Tempo',
        currentLevel: 'Não aplicável',
        adjustedLevel: 'Ativo',
        reason: 'Previsão de condições adversas',
        additionalRequirements: [
          'Amarração reforçada',
          'Equipamentos de convés seguros',
          'Tripulação em alerta'
        ]
      });
    }

    return adjustments;
  }

  private generateGoNoGoRecommendation(
    score: number,
    risks: IdentifiedRisk[]
  ): RiskScore['goNoGoRecommendation'] {
    const catastrophicRisks = risks.filter(r => r.impact === 'catastrophic' && r.likelihood !== 'rare');
    
    if (catastrophicRisks.length > 0) return 'abort';
    if (score >= 80) return 'abort';
    if (score >= 65) return 'delay';
    if (score >= 45) return 'proceed_with_caution';
    return 'proceed';
  }

  recalculateAfterMitigation(
    originalScore: RiskScore,
    implementedMitigations: string[]
  ): RiskScore {
    const applicableMitigations = originalScore.mitigations.filter(
      m => implementedMitigations.includes(m.mitigationId)
    );

    const totalReduction = applicableMitigations.reduce(
      (sum, m) => sum + m.expectedReduction, 0
    );

    const newScore = Math.max(0, originalScore.overallScore - (totalReduction * 0.5));
    const newRiskLevel = this.categorizeRiskLevel(newScore);

    return {
      ...originalScore,
      overallScore: Math.round(newScore),
      riskLevel: newRiskLevel,
      goNoGoRecommendation: this.generateGoNoGoRecommendation(newScore, originalScore.topRisks),
      timestamp: new Date()
    };
  }
}

export const riskScoringEngine = new RiskScoringEngine();
