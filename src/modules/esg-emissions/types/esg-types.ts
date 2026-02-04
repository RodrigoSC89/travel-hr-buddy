/**
 * ESG & Emissions Enterprise Types
 * Tipos completos para plataforma de sustentabilidade marítima
 */

// ========================================
// CARBON EMISSIONS
// ========================================

export type EmissionScope = 'scope1' | 'scope2' | 'scope3';
export type EmissionType = 'co2' | 'ch4' | 'n2o' | 'nox' | 'sox' | 'pm' | 'co2e';
export type CIIRating = 'A' | 'B' | 'C' | 'D' | 'E';
export type FuelType = 'hfo' | 'mgo' | 'lsfo' | 'lng' | 'methanol' | 'ammonia' | 'hydrogen' | 'biofuel';

export interface EmissionRecord {
  id: string;
  vesselId: string;
  vesselName: string;
  voyageId?: string;
  
  // Time Period
  periodStart: Date;
  periodEnd: Date;
  periodType: 'hourly' | 'daily' | 'voyage' | 'monthly' | 'annual';
  
  // Fuel Consumption
  fuelConsumption: {
    type: FuelType;
    quantity: number; // metric tons
    lowerCalorificValue: number; // MJ/kg
    emissionFactor: number; // kgCO2/kg fuel
    source: 'flowmeter' | 'bunkering' | 'tank_sounding' | 'manual';
  }[];
  
  // Emissions by Type
  emissions: {
    [key in EmissionType]?: {
      value: number; // metric tons
      methodology: string;
      uncertainty?: number; // %
    };
  };
  
  // Total CO2 Equivalent
  totalCO2e: number; // metric tons
  
  // Intensity Metrics
  intensity: {
    eeoi?: number; // gCO2/ton-nm
    aer?: number; // gCO2/DWT-nm
    cii?: number; // gCO2/DWT-nm (attained)
    ciiRequired?: number; // gCO2/DWT-nm (required)
    ciiRating?: CIIRating;
  };
  
  // Voyage Data (for calculation)
  voyageData?: {
    distance: number; // nautical miles
    cargoWeight: number; // metric tons
    passengers?: number;
    dwt: number;
    avgSpeed: number; // knots
    seaTime: number; // hours
    portTime: number; // hours
  };
  
  // Verification
  verification: {
    status: 'draft' | 'submitted' | 'verified' | 'reported';
    verifiedBy?: string;
    verificationDate?: Date;
    methodology: string;
    notes?: string;
  };
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface VesselEmissionProfile {
  vesselId: string;
  vesselName: string;
  imo: string;
  vesselType: string;
  dwt: number;
  gt: number;
  yearBuilt: number;
  flagState: string;
  
  // CII Profile
  cii: {
    category: 'bulk_carrier' | 'tanker' | 'container' | 'general_cargo' | 'lng' | 'ro_ro' | 'cruise';
    referenceYear: number;
    reductionFactor: number;
    requiredCII: number;
    attainedCII: number;
    rating: CIIRating;
    trajectory: CIIRating[];
  };
  
  // EEXI
  eexi: {
    attained: number;
    required: number;
    compliant: boolean;
    reductionMeasures?: string[];
  };
  
  // Annual Emissions
  annualEmissions: {
    year: number;
    totalCO2: number;
    totalCH4: number;
    totalN2O: number;
    totalCO2e: number;
    fuelConsumed: number;
    distance: number;
    cargoCarried: number;
  }[];
  
  // Efficiency Measures
  efficiencyMeasures: {
    id: string;
    type: string;
    description: string;
    implementedDate?: Date;
    estimatedReduction: number; // %
    actualReduction?: number; // %
    cost?: number;
    status: 'planned' | 'in_progress' | 'completed';
  }[];
}

// ========================================
// ESG REPORTING & COMPLIANCE
// ========================================

export type ESGFramework = 
  | 'csrd' | 'cdp' | 'tcfd' | 'eu_taxonomy' 
  | 'gri' | 'sasb' | 'ungc' | 'sdg'
  | 'imo_dcs' | 'eu_mrv' | 'poseidon_principles';

export interface ESGReport {
  id: string;
  organizationId: string;
  reportingPeriod: {
    start: Date;
    end: Date;
    type: 'annual' | 'quarterly' | 'monthly';
  };
  
  // Report Metadata
  title: string;
  framework: ESGFramework[];
  status: 'draft' | 'review' | 'approved' | 'published' | 'archived';
  version: string;
  
  // Environmental Metrics
  environmental: {
    emissions: {
      scope1: number;
      scope2: number;
      scope3: number;
      totalCO2e: number;
      intensityMetric: number;
      yoyChange: number;
    };
    
    airQuality: {
      nox: number;
      sox: number;
      pm: number;
    };
    
    water: {
      ballastWaterTreated: number;
      wastewaterDischarged: number;
      freshwaterConsumed: number;
    };
    
    waste: {
      totalGenerated: number;
      recycled: number;
      hazardous: number;
      disposedAtPort: number;
    };
    
    biodiversity: {
      incidentsReported: number;
      sensitiveAreasTransited: number;
      mitigationMeasures: string[];
    };
  };
  
  // Social Metrics
  social: {
    workforce: {
      totalEmployees: number;
      seafarers: number;
      shoreStaff: number;
      genderRatio: { male: number; female: number };
      nationalityDiversity: number;
    };
    
    safety: {
      lti: number;
      ltifr: number;
      trir: number;
      fatalities: number;
      nearMisses: number;
      safetyDrills: number;
    };
    
    welfare: {
      mlcCompliance: number;
      avgRestHours: number;
      crewSatisfactionScore: number;
      trainingHours: number;
      mentalHealthSupport: boolean;
    };
    
    humanRights: {
      dueDiligenceCompleted: boolean;
      grievancesReceived: number;
      grievancesResolved: number;
    };
  };
  
  // Governance Metrics
  governance: {
    board: {
      size: number;
      independent: number;
      diversityRatio: number;
      esgCommittee: boolean;
    };
    
    ethics: {
      codeOfConduct: boolean;
      whistleblowingMechanism: boolean;
      corruptionIncidents: number;
      trainedOnEthics: number;
    };
    
    compliance: {
      regulatoryFines: number;
      portStateDetentions: number;
      classDeficiencies: number;
      certificationStatus: Record<string, boolean>;
    };
    
    risk: {
      climateRisksIdentified: number;
      mitigationPlansActive: number;
      scenarioAnalysis: boolean;
    };
  };
  
  // Targets & Progress
  targets: {
    id: string;
    category: 'environmental' | 'social' | 'governance';
    metric: string;
    baselineYear: number;
    baselineValue: number;
    targetYear: number;
    targetValue: number;
    currentValue: number;
    progress: number;
    status: 'on_track' | 'at_risk' | 'off_track';
  }[];
  
  // Assurance
  assurance: {
    type: 'limited' | 'reasonable' | 'none';
    provider?: string;
    statement?: string;
    scope: string[];
  };
  
  // Document
  documentUrl?: string;
  appendices: string[];
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  createdBy: string;
  approvedBy?: string;
}

// ========================================
// DECARBONIZATION
// ========================================

export interface DecarbonizationTarget {
  id: string;
  organizationId: string;
  
  // Target Definition
  type: 'absolute' | 'intensity';
  scope: EmissionScope[];
  metric: string;
  
  // Baseline
  baselineYear: number;
  baselineValue: number;
  
  // Target
  targetYear: number;
  targetValue: number;
  reductionPercent: number;
  
  // Pathway
  pathway: 'linear' | 'accelerated' | 'science_based';
  milestones: {
    year: number;
    targetValue: number;
    actualValue?: number;
    status?: 'achieved' | 'on_track' | 'behind';
  }[];
  
  // Science-Based
  scienceBased: {
    validated: boolean;
    pathway: '1.5C' | '2C' | 'well_below_2C';
    validationDate?: Date;
    commitmentLetter?: string;
  };
  
  // IMO Alignment
  imoAlignment: {
    aligned: boolean;
    target2030: number;
    target2050: number;
  };
  
  // Current Status
  currentYear: number;
  currentValue: number;
  gapToTarget: number;
  onTrack: boolean;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface DecarbonizationInitiative {
  id: string;
  organizationId: string;
  
  // Initiative Details
  name: string;
  category: 'operational' | 'technology' | 'alternative_fuel' | 'fleet_renewal' | 'offsetting';
  subcategory: string;
  description: string;
  
  // Vessels
  appliesTo: 'all_fleet' | 'vessel_type' | 'specific_vessels';
  vesselIds?: string[];
  vesselTypes?: string[];
  
  // Impact
  estimatedReduction: {
    co2: number; // metric tons/year
    percentage: number; // %
    intensity: number; // gCO2/ton-nm
  };
  actualReduction?: {
    co2: number;
    percentage: number;
    intensity: number;
  };
  
  // Financial
  capex: number;
  opex: number;
  paybackPeriod: number; // years
  roi: number; // %
  
  // Timeline
  status: 'concept' | 'feasibility' | 'approved' | 'implementation' | 'operational' | 'completed';
  startDate?: Date;
  completionDate?: Date;
  
  // Dependencies
  dependencies: string[];
  risks: {
    description: string;
    likelihood: 'low' | 'medium' | 'high';
    impact: 'low' | 'medium' | 'high';
    mitigation: string;
  }[];
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

// ========================================
// ENVIRONMENTAL MONITORING
// ========================================

export interface EnvironmentalIncident {
  id: string;
  vesselId: string;
  vesselName: string;
  voyageId?: string;
  
  // Incident Details
  type: 'oil_spill' | 'chemical_spill' | 'cargo_loss' | 'grounding' | 'collision_wildlife' | 'ballast_violation' | 'emission_violation' | 'waste_violation' | 'other';
  severity: 'minor' | 'moderate' | 'serious' | 'catastrophic';
  
  // Location
  location: {
    coordinates: { lat: number; lng: number };
    area: string;
    nearestPort: string;
    inProtectedArea: boolean;
    protectedAreaName?: string;
  };
  
  // Timeline
  occurredAt: Date;
  discoveredAt: Date;
  reportedAt: Date;
  resolvedAt?: Date;
  
  // Impact
  environmentalImpact: {
    quantityReleased?: number;
    unit?: string;
    areaAffected?: number; // km²
    wildlifeAffected?: boolean;
    wildlifeDetails?: string;
    coastlineAffected?: boolean;
    coastlineKm?: number;
  };
  
  // Response
  response: {
    immediateActions: string[];
    containmentMeasures: string[];
    cleanupOperations: string[];
    thirdPartyInvolved: boolean;
    thirdParties?: string[];
  };
  
  // Regulatory
  regulatory: {
    reportedToAuthorities: boolean;
    authorities: string[];
    referenceNumber?: string;
    fineIssued?: number;
    prosecutionInitiated?: boolean;
  };
  
  // Investigation
  investigation: {
    rootCause: string;
    contributingFactors: string[];
    lessonsLearned: string[];
    correctiveActions: {
      action: string;
      responsible: string;
      dueDate: Date;
      status: 'pending' | 'in_progress' | 'completed';
    }[];
  };
  
  // Documentation
  documents: {
    name: string;
    type: string;
    url: string;
  }[];
  photos: string[];
  
  // Metadata
  status: 'open' | 'investigating' | 'remediation' | 'closed';
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

// ========================================
// MARPOL COMPLIANCE
// ========================================

export interface MARPOLCompliance {
  vesselId: string;
  vesselName: string;
  
  // Annex I - Oil
  annexI: {
    oilRecordBookPart1: boolean;
    oilRecordBookPart2: boolean;
    odme: boolean;
    sopep: boolean;
    oilyWaterSeparator: boolean;
    oilContentMeter: boolean;
    lastInspection: Date;
    nextInspection: Date;
    deficiencies: string[];
    status: 'compliant' | 'non_compliant' | 'pending';
  };
  
  // Annex II - Noxious Liquid Substances
  annexII: {
    cargoRecordBook: boolean;
    pAndAManual: boolean;
    tankWashingProcedures: boolean;
    lastInspection: Date;
    status: 'compliant' | 'non_compliant' | 'pending' | 'not_applicable';
  };
  
  // Annex III - Harmful Substances in Packaged Form
  annexIII: {
    imdgCompliance: boolean;
    dangerousGoodsManifest: boolean;
    lastInspection: Date;
    status: 'compliant' | 'non_compliant' | 'pending' | 'not_applicable';
  };
  
  // Annex IV - Sewage
  annexIV: {
    sewageTreatmentPlant: boolean;
    holdingTank: boolean;
    dischargePipeline: boolean;
    isppCertificate: boolean;
    lastInspection: Date;
    status: 'compliant' | 'non_compliant' | 'pending';
  };
  
  // Annex V - Garbage
  annexV: {
    garbageManagementPlan: boolean;
    garbageRecordBook: boolean;
    placard: boolean;
    lastInspection: Date;
    status: 'compliant' | 'non_compliant' | 'pending';
  };
  
  // Annex VI - Air Pollution
  annexVI: {
    iappCertificate: boolean;
    seemp: boolean;
    fuelChangeover: boolean;
    noxTier: 'I' | 'II' | 'III';
    egcs: boolean; // Scrubber
    egcsType?: 'open' | 'closed' | 'hybrid';
    ecaCompliance: boolean;
    sulfurContentLog: boolean;
    lastInspection: Date;
    status: 'compliant' | 'non_compliant' | 'pending';
  };
  
  // BWM Convention
  bwm: {
    bwmPlan: boolean;
    bwRecordBook: boolean;
    treatmentSystem: boolean;
    treatmentType?: 'uv' | 'electrolysis' | 'filtration' | 'other';
    dTypeApproval: boolean;
    lastInspection: Date;
    status: 'compliant' | 'non_compliant' | 'pending';
  };
  
  // Overall
  overallStatus: 'compliant' | 'non_compliant' | 'partial';
  nextSurveyDate: Date;
  certificatesValid: boolean;
  updatedAt: Date;
}

// ========================================
// SUSTAINABILITY ANALYTICS
// ========================================

export interface SustainabilityDashboard {
  period: {
    start: Date;
    end: Date;
  };
  
  // Emissions Overview
  emissions: {
    total: number;
    scope1: number;
    scope2: number;
    scope3: number;
    yoyChange: number;
    targetGap: number;
    byVessel: { vesselId: string; name: string; emissions: number; ciiRating: CIIRating }[];
    byFuelType: { fuel: FuelType; emissions: number; percentage: number }[];
    trend: { date: string; value: number }[];
  };
  
  // CII Overview
  cii: {
    fleetAverage: number;
    fleetRating: CIIRating;
    distribution: { rating: CIIRating; count: number }[];
    atRisk: { vesselId: string; name: string; current: CIIRating; projected: CIIRating }[];
  };
  
  // Fuel Efficiency
  fuelEfficiency: {
    totalConsumption: number;
    avgConsumptionPerVessel: number;
    efficiency: number; // tons/nm
    yoyChange: number;
    byFuelType: { fuel: FuelType; quantity: number; cost: number }[];
  };
  
  // Environmental Compliance
  compliance: {
    overallScore: number;
    marpolStatus: { annex: string; compliantVessels: number; totalVessels: number }[];
    upcomingInspections: { vesselId: string; name: string; type: string; date: Date }[];
    openDeficiencies: number;
  };
  
  // Social Metrics
  social: {
    safetyScore: number;
    ltifr: number;
    crewWelfare: number;
    trainingCompliance: number;
  };
  
  // Initiatives Progress
  initiatives: {
    total: number;
    completed: number;
    inProgress: number;
    planned: number;
    totalReduction: number;
    totalInvestment: number;
  };
  
  // Ratings & Scores
  ratings: {
    cdpScore?: string;
    esgRating?: string;
    poseidonAlignment?: number;
    seaCargoCharter?: boolean;
  };
}
