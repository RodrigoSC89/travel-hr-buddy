/**
 * PATCH 605 - ESG & EEXI Compliance Types
 */

export type MetricType = 
  | "carbon_intensity"
  | "energy_efficiency"
  | "waste_management"
  | "water_usage"
  | "biodiversity"
  | "social_compliance"
  | "governance_score";

export type ComplianceStatus = "compliant" | "at_risk" | "non_compliant" | "pending";

export type EmissionType = "co2" | "sox" | "nox" | "pm" | "ch4" | "total_ghg";

export type CIIRating = "A" | "B" | "C" | "D" | "E";

export interface ESGMetric {
  id: string;
  vesselId?: string;
  metricType: MetricType;
  value: number;
  unit: string;
  measurementDate: Date;
  reportingPeriod?: string;
  targetValue?: number;
  baselineValue?: number;
  complianceStatus?: ComplianceStatus;
  notes?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt?: Date;
  createdBy?: string;
}

export interface EmissionLog {
  id: string;
  vesselId: string;
  emissionType: EmissionType;
  amount: number;
  unit: string;
  measurementDate: Date;
  voyageId?: string;
  distanceTraveled?: number;
  fuelConsumed?: number;
  fuelType?: string;
  eexiValue?: number;
  ciiRating?: CIIRating;
  calculationMethod?: string;
  verified: boolean;
  verifierId?: string;
  verificationDate?: Date;
  notes?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt?: Date;
}

export interface EmissionsForecast {
  vesselId?: string;
  period: string;
  predictedEmissions: {
    co2: number;
    sox: number;
    nox: number;
    total_ghg: number;
  };
  confidence: number;
  factors: string[];
  recommendations: string[];
}

export interface ESGReport {
  reportId: string;
  vesselId?: string;
  reportingPeriod: string;
  generatedAt: Date;
  metrics: ESGMetric[];
  emissions: EmissionLog[];
  summary: {
    totalEmissions: number;
    avgEEXI?: number;
    ciiRating?: CIIRating;
    complianceRate: number;
    keyFindings: string[];
  };
  forecast?: EmissionsForecast;
}

export interface ESGDashboardData {
  currentMetrics: ESGMetric[];
  recentEmissions: EmissionLog[];
  trends: {
    metricType: string;
    trend: "improving" | "stable" | "declining";
    changePercentage: number;
  }[];
  complianceSummary: {
    compliant: number;
    atRisk: number;
    nonCompliant: number;
    pending: number;
  };
}
