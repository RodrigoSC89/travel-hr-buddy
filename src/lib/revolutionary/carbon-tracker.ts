/**
 * 🌍 Carbon AI - Emissions Tracking & ESG Certification
 * PATCH REVOLUTION v2.0
 * 
 * Tracking de pegada carbono com certificação automática ESG
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export interface CarbonEmission {
  id: string;
  vesselId: string;
  voyageId?: string;
  date: Date;
  
  // Fuel consumption
  fuelType: FuelType;
  fuelConsumedMT: number;
  
  // Emissions breakdown
  co2Emissions: number; // tonnes
  ch4Emissions: number; // tonnes CO2e
  n2oEmissions: number; // tonnes CO2e
  totalGHGEmissions: number; // tonnes CO2e
  
  // Intensity metrics
  eeoi: number; // Energy Efficiency Operational Indicator
  cii: number; // Carbon Intensity Indicator
  ciiRating: CIIRating;
  
  // Context
  distanceNM: number;
  cargoTonnes: number;
  operationalMode: 'at_sea' | 'in_port' | 'maneuvering' | 'anchored';
}

export type FuelType = 
  | 'hfo'      // Heavy Fuel Oil
  | 'vlsfo'    // Very Low Sulphur Fuel Oil
  | 'mgo'      // Marine Gas Oil
  | 'lfo'      // Light Fuel Oil
  | 'lng'      // Liquefied Natural Gas
  | 'methanol'
  | 'ammonia'
  | 'hydrogen'
  | 'biofuel'
  | 'shore_power';

export type CIIRating = 'A' | 'B' | 'C' | 'D' | 'E';

export interface ESGScore {
  vesselId: string;
  vesselName: string;
  calculatedAt: Date;
  
  // Overall ESG
  overallScore: number; // 0-100
  rating: 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B' | 'CCC' | 'CC' | 'C';
  
  // Environment
  environmentScore: number;
  ciiRating: CIIRating;
  emissionsReduction: number; // % vs baseline
  renewableEnergy: number; // % of energy from renewables
  wasteManagement: number; // compliance score
  
  // Social
  socialScore: number;
  crewWelfare: number;
  safetyRecord: number;
  trainingHours: number;
  diversityIndex: number;
  
  // Governance
  governanceScore: number;
  complianceRate: number;
  transparencyScore: number;
  riskManagement: number;
}

export interface CarbonReport {
  reportId: string;
  reportType: 'monthly' | 'quarterly' | 'annual' | 'voyage';
  periodStart: Date;
  periodEnd: Date;
  vesselId?: string;
  fleetWide: boolean;
  
  // Summary
  totalEmissions: number;
  totalFuelConsumed: number;
  avgCII: number;
  avgEEOI: number;
  
  // Breakdown
  emissionsByFuelType: Record<FuelType, number>;
  emissionsByMode: Record<string, number>;
  emissionsByVessel?: Array<{ vesselId: string; vesselName: string; emissions: number }>;
  
  // Trends
  changeVsPreviousPeriod: number; // %
  changeVsBaseline: number; // %
  projectedAnnual: number;
  
  // Compliance
  euEtsLiability: number; // EUR
  imoCIICompliance: boolean;
  
  // Recommendations
  reductionOpportunities: CarbonReductionOpportunity[];
}

export interface CarbonReductionOpportunity {
  id: string;
  title: string;
  description: string;
  category: 'operational' | 'technical' | 'fuel' | 'route';
  estimatedReduction: number; // tonnes CO2/year
  estimatedCost: number; // USD
  paybackPeriod: number; // months
  implementationDifficulty: 'low' | 'medium' | 'high';
  priority: number;
}

export interface CarbonOffset {
  id: string;
  vesselId?: string;
  projectName: string;
  projectType: 'forestry' | 'renewable' | 'blue_carbon' | 'direct_capture';
  offsetTonnes: number;
  certificateNumber: string;
  registry: 'verra' | 'gold_standard' | 'american_carbon' | 'other';
  purchaseDate: Date;
  expiryDate?: Date;
  costPerTonne: number;
  totalCost: number;
  isVerified: boolean;
}

// Emission factors by fuel type (kg CO2/tonne fuel)
const EMISSION_FACTORS: Record<FuelType, { co2: number; ch4: number; n2o: number }> = {
  hfo: { co2: 3114, ch4: 0.06, n2o: 0.016 },
  vlsfo: { co2: 3151, ch4: 0.06, n2o: 0.016 },
  mgo: { co2: 3206, ch4: 0.06, n2o: 0.016 },
  lfo: { co2: 3151, ch4: 0.06, n2o: 0.016 },
  lng: { co2: 2750, ch4: 0.25, n2o: 0.008 },
  methanol: { co2: 1375, ch4: 0.02, n2o: 0.005 },
  ammonia: { co2: 0, ch4: 0, n2o: 2.8 },
  hydrogen: { co2: 0, ch4: 0, n2o: 0 },
  biofuel: { co2: 2500, ch4: 0.04, n2o: 0.01 }, // Gross, net depends on lifecycle
  shore_power: { co2: 0, ch4: 0, n2o: 0 }, // Depends on grid, assumed renewable
};

// GWP factors for converting to CO2e
const GWP_FACTORS = {
  ch4: 28, // 100-year GWP
  n2o: 265,
};

// CII rating boundaries (simplified, varies by ship type)
const CII_BOUNDARIES = {
  A: 0.85, // Superior
  B: 0.95, // Minor Superior
  C: 1.05, // Moderate
  D: 1.15, // Minor Inferior
  E: Infinity, // Inferior
};

class CarbonTracker {
  
  // Calculate emissions from fuel consumption
  calculateEmissions(
    fuelType: FuelType,
    fuelConsumedMT: number,
    distanceNM: number,
    cargoTonnes: number
  ): Omit<CarbonEmission, 'id' | 'vesselId' | 'voyageId' | 'date' | 'operationalMode'> {
    const factors = EMISSION_FACTORS[fuelType];
    
    // Calculate emissions in tonnes
    const co2Emissions = (factors.co2 * fuelConsumedMT) / 1000;
    const ch4Emissions = (factors.ch4 * fuelConsumedMT * GWP_FACTORS.ch4) / 1000;
    const n2oEmissions = (factors.n2o * fuelConsumedMT * GWP_FACTORS.n2o) / 1000;
    const totalGHGEmissions = co2Emissions + ch4Emissions + n2oEmissions;

    // Calculate EEOI (grams CO2 per tonne-mile)
    const transportWork = cargoTonnes * distanceNM;
    const eeoi = transportWork > 0 ? (co2Emissions * 1000000) / transportWork : 0;

    // Calculate CII (grams CO2 per DWT-mile, simplified)
    const cii = distanceNM > 0 ? (co2Emissions * 1000000) / (cargoTonnes * distanceNM) : 0;
    
    // Determine CII rating
    const ciiRating = this.getCIIRating(cii, 1.0); // Baseline = 1.0

    return {
      fuelType,
      fuelConsumedMT,
      co2Emissions: Math.round(co2Emissions * 100) / 100,
      ch4Emissions: Math.round(ch4Emissions * 100) / 100,
      n2oEmissions: Math.round(n2oEmissions * 100) / 100,
      totalGHGEmissions: Math.round(totalGHGEmissions * 100) / 100,
      eeoi: Math.round(eeoi * 100) / 100,
      cii: Math.round(cii * 1000) / 1000,
      ciiRating,
      distanceNM,
      cargoTonnes,
    };
  }

  // Get CII rating from value
  private getCIIRating(cii: number, baseline: number): CIIRating {
    const ratio = cii / baseline;
    
    if (ratio <= CII_BOUNDARIES.A) return 'A';
    if (ratio <= CII_BOUNDARIES.B) return 'B';
    if (ratio <= CII_BOUNDARIES.C) return 'C';
    if (ratio <= CII_BOUNDARIES.D) return 'D';
    return 'E';
  }

  // Record emission event
  async recordEmission(
    vesselId: string,
    fuelType: FuelType,
    fuelConsumedMT: number,
    distanceNM: number,
    cargoTonnes: number,
    operationalMode: CarbonEmission['operationalMode'],
    voyageId?: string
  ): Promise<CarbonEmission> {
    const calculations = this.calculateEmissions(fuelType, fuelConsumedMT, distanceNM, cargoTonnes);

    const emission: CarbonEmission = {
      id: crypto.randomUUID(),
      vesselId,
      voyageId,
      date: new Date(),
      ...calculations,
      operationalMode,
    };

    // Log emission (would store in dedicated table in production)
    logger.info('Emission recorded', { vesselId, fuelType, totalGHG: emission.totalGHGEmissions });

    return emission;
  }

  // Calculate ESG score for vessel
  async calculateESGScore(vesselId: string): Promise<ESGScore> {
    const vesselName = await this.getVesselName(vesselId);
    
    // Simulated scores for demo
    const environmentScore = 75 + Math.random() * 15;
    const socialScore = 70 + Math.random() * 20;
    const governanceScore = 80 + Math.random() * 15;
    const overallScore = Math.round(environmentScore * 0.4 + socialScore * 0.3 + governanceScore * 0.3);

    return {
      vesselId,
      vesselName,
      calculatedAt: new Date(),
      overallScore,
      rating: this.getESGRating(overallScore),
      environmentScore: Math.round(environmentScore),
      ciiRating: 'B',
      emissionsReduction: -5.2,
      renewableEnergy: 0,
      wasteManagement: 85,
      socialScore: Math.round(socialScore),
      crewWelfare: 78,
      safetyRecord: 92,
      trainingHours: 24,
      diversityIndex: 0.65,
      governanceScore: Math.round(governanceScore),
      complianceRate: 96,
      transparencyScore: 88,
      riskManagement: 82,
    };
  }

  // Calculate environment score from CII and emissions
  private calculateEnvironmentScore(ciiRating: CIIRating, emissions: unknown[]): number {
    const ciiScores = { A: 95, B: 80, C: 65, D: 45, E: 25 };
    let score = ciiScores[ciiRating];

    // Bonus for using cleaner fuels
    // (Would analyze fuel mix in production)
    
    return Math.min(100, score);
  }

  // Calculate social score
  private async calculateSocialScore(vesselId: string): Promise<number> {
    // In production, would aggregate from:
    // - Crew wellness metrics
    // - Safety incidents
    // - Training completion
    // - Work hours compliance
    return 75 + Math.random() * 15;
  }

  // Calculate governance score
  private async calculateGovernanceScore(vesselId: string): Promise<number> {
    // In production, would aggregate from:
    // - Audit results
    // - Compliance records
    // - Documentation completeness
    return 80 + Math.random() * 15;
  }

  // Get ESG rating from score
  private getESGRating(score: number): ESGScore['rating'] {
    if (score >= 90) return 'AAA';
    if (score >= 80) return 'AA';
    if (score >= 70) return 'A';
    if (score >= 60) return 'BBB';
    if (score >= 50) return 'BB';
    if (score >= 40) return 'B';
    if (score >= 30) return 'CCC';
    if (score >= 20) return 'CC';
    return 'C';
  }

  // Get vessel name
  private async getVesselName(vesselId: string): Promise<string> {
    const { data } = await supabase
      .from('vessels')
      .select('name')
      .eq('id', vesselId)
      .maybeSingle();
    return data?.name || 'Unknown Vessel';
  }

  // Generate carbon report
  async generateCarbonReport(
    options: {
      vesselId?: string;
      periodStart: Date;
      periodEnd: Date;
      reportType: CarbonReport['reportType'];
    }
  ): Promise<CarbonReport> {
    const { vesselId, periodStart, periodEnd, reportType } = options;

    // Simulated data for demo
    const emissionsByFuelType: Record<FuelType, number> = {
      hfo: 450, vlsfo: 320, mgo: 180, lfo: 0, lng: 50,
      methanol: 0, ammonia: 0, hydrogen: 0, biofuel: 0, shore_power: 0,
    };

    const emissionsByMode: Record<string, number> = {
      at_sea: 750, in_port: 150, maneuvering: 80, anchored: 20,
    };

    const totalEmissions = Object.values(emissionsByFuelType).reduce((a, b) => a + b, 0);
    const reductionOpportunities = this.generateReductionOpportunities([]);

    return {
      reportId: crypto.randomUUID(),
      reportType,
      periodStart,
      periodEnd,
      vesselId,
      fleetWide: !vesselId,
      totalEmissions,
      totalFuelConsumed: totalEmissions / 3.1,
      avgCII: 0.92,
      avgEEOI: 8.5,
      emissionsByFuelType,
      emissionsByMode,
      changeVsPreviousPeriod: -3.5,
      changeVsBaseline: -8.2,
      projectedAnnual: totalEmissions * 4,
      euEtsLiability: Math.round(totalEmissions * 0.4 * 85),
      imoCIICompliance: true,
      reductionOpportunities,
    };
  }

  // Calculate days between dates
  private daysBetween(start: Date, end: Date): number {
    return Math.max(1, (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  }

  // Generate reduction opportunities
  private generateReductionOpportunities(emissions: unknown[]): CarbonReductionOpportunity[] {
    return [
      {
        id: '1',
        title: 'Otimização de Velocidade',
        description: 'Reduzir velocidade média em 10% nas rotas transatlânticas',
        category: 'operational',
        estimatedReduction: 850,
        estimatedCost: 0,
        paybackPeriod: 0,
        implementationDifficulty: 'low',
        priority: 1,
      },
      {
        id: '2',
        title: 'Hull Coating Premium',
        description: 'Aplicar revestimento anti-incrustante de alto desempenho',
        category: 'technical',
        estimatedReduction: 320,
        estimatedCost: 180000,
        paybackPeriod: 24,
        implementationDifficulty: 'medium',
        priority: 2,
      },
      {
        id: '3',
        title: 'Transição para VLSFO/LNG',
        description: 'Substituir 30% do HFO por combustíveis mais limpos',
        category: 'fuel',
        estimatedReduction: 420,
        estimatedCost: 50000,
        paybackPeriod: 18,
        implementationDifficulty: 'medium',
        priority: 3,
      },
      {
        id: '4',
        title: 'Otimização de Rotas com IA',
        description: 'Implementar sistema de weather routing avançado',
        category: 'route',
        estimatedReduction: 280,
        estimatedCost: 25000,
        paybackPeriod: 12,
        implementationDifficulty: 'low',
        priority: 4,
      },
      {
        id: '5',
        title: 'Shore Power nos Principais Portos',
        description: 'Usar energia elétrica de terra nos 5 portos mais frequentes',
        category: 'technical',
        estimatedReduction: 150,
        estimatedCost: 120000,
        paybackPeriod: 36,
        implementationDifficulty: 'high',
        priority: 5,
      },
    ];
  }

  // Register carbon offset
  async registerOffset(offset: Omit<CarbonOffset, 'id'>): Promise<CarbonOffset> {
    const newOffset: CarbonOffset = {
      id: crypto.randomUUID(),
      ...offset,
    };
    logger.info('Offset registered', { projectName: offset.projectName, tonnes: offset.offsetTonnes });
    return newOffset;
  }

  // Get fleet carbon dashboard data
  async getFleetCarbonDashboard(): Promise<{
    totalEmissions: number;
    emissionsByVessel: Array<{ vesselId: string; vesselName: string; emissions: number; ciiRating: CIIRating }>;
    monthlyTrend: Array<{ month: string; emissions: number }>;
    fuelMix: Record<FuelType, number>;
    complianceStatus: { compliant: number; atRisk: number; nonCompliant: number };
  }> {
    // Simulated dashboard data
    return {
      totalEmissions: 2450,
      emissionsByVessel: [
        { vesselId: '1', vesselName: 'MV Atlantic', emissions: 850, ciiRating: 'B' },
        { vesselId: '2', vesselName: 'MV Pacific', emissions: 920, ciiRating: 'C' },
        { vesselId: '3', vesselName: 'MV Indian', emissions: 680, ciiRating: 'A' },
      ],
      monthlyTrend: [
        { month: '2024-01', emissions: 580 },
        { month: '2024-02', emissions: 620 },
        { month: '2024-03', emissions: 650 },
        { month: '2024-04', emissions: 600 },
      ],
      fuelMix: {
        hfo: 450, vlsfo: 1200, mgo: 600, lfo: 0, lng: 200,
        methanol: 0, ammonia: 0, hydrogen: 0, biofuel: 0, shore_power: 0,
      },
      complianceStatus: { compliant: 8, atRisk: 2, nonCompliant: 0 },
    };
  }

}

export const carbonTracker = new CarbonTracker();
