import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmissionsData {
  vesselId: string;
  fuelConsumption: number;
  fuelType: string;
  distance: number;
  cargoWeight: number;
}

interface EnvironmentalRequest {
  action: 'calculate_emissions' | 'cii_rating' | 'decarbonization_roadmap' | 'ballast_compliance' | 'waste_tracking';
  data: any;
}

// Emission factors (gCO2/g fuel)
const EMISSION_FACTORS: Record<string, number> = {
  'HFO': 3.114,
  'VLSFO': 3.151,
  'MGO': 3.206,
  'LNG': 2.750,
  'Methanol': 1.375,
  'Ammonia': 0,
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, data }: EnvironmentalRequest = await req.json();

    let result;

    switch (action) {
      case 'calculate_emissions':
        result = await calculateEmissions(data);
        break;
      case 'cii_rating':
        result = await calculateCIIRating(data);
        break;
      case 'decarbonization_roadmap':
        result = await generateDecarbonizationRoadmap(data);
        break;
      case 'ballast_compliance':
        result = await checkBallastCompliance(data);
        break;
      case 'waste_tracking':
        result = await trackWasteManagement(data);
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Environmental AI error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function calculateEmissions(data: EmissionsData) {
  const { fuelConsumption, fuelType, distance, cargoWeight } = data;
  
  const emissionFactor = EMISSION_FACTORS[fuelType] || 3.114;
  const co2Emissions = fuelConsumption * emissionFactor;
  
  // EEOI calculation (gCO2 per tonne-mile)
  const eeoi = cargoWeight > 0 && distance > 0 
    ? (co2Emissions * 1000000) / (cargoWeight * distance)
    : 0;
  
  // NOx estimation (based on engine type assumptions)
  const noxEmissions = fuelConsumption * 0.087;
  
  // SOx estimation
  const sulfurContent = fuelType === 'VLSFO' ? 0.5 : fuelType === 'MGO' ? 0.1 : 3.5;
  const soxEmissions = fuelConsumption * (sulfurContent / 100) * 2;
  
  return {
    co2: {
      total: co2Emissions,
      unit: 'tonnes',
      perNauticalMile: distance > 0 ? co2Emissions / distance : 0,
    },
    nox: {
      total: noxEmissions,
      unit: 'tonnes',
    },
    sox: {
      total: soxEmissions,
      unit: 'tonnes',
    },
    eeoi: {
      value: eeoi,
      unit: 'gCO2/tonne-mile',
      rating: eeoi < 5 ? 'Excellent' : eeoi < 10 ? 'Good' : eeoi < 15 ? 'Average' : 'Poor',
    },
    euEts: {
      applicable: true,
      estimatedCost: co2Emissions * 85, // €85/tonne CO2
      currency: 'EUR',
    },
    recommendations: [
      fuelType === 'HFO' ? 'Consider switching to VLSFO or LNG for lower emissions' : null,
      eeoi > 10 ? 'Optimize voyage planning to reduce EEOI' : null,
      'Implement slow steaming during non-critical voyages',
    ].filter(Boolean),
  };
}

async function calculateCIIRating(data: { vesselId: string; annualData: any }) {
  const { annualData } = data;
  
  // CII = Annual CO2 / (DWT × Distance)
  const attainedCII = annualData.co2Emissions / (annualData.dwt * annualData.totalDistance);
  
  // Reference CII (simplified - actual values depend on ship type)
  const referenceCII = 0.0001; // Example baseline
  const requiredCII = referenceCII * (1 - (new Date().getFullYear() - 2023) * 0.02);
  
  // Rating boundaries
  const ratings = {
    A: requiredCII * 0.65,
    B: requiredCII * 0.83,
    C: requiredCII * 1.0,
    D: requiredCII * 1.17,
  };
  
  let rating: string;
  if (attainedCII <= ratings.A) rating = 'A';
  else if (attainedCII <= ratings.B) rating = 'B';
  else if (attainedCII <= ratings.C) rating = 'C';
  else if (attainedCII <= ratings.D) rating = 'D';
  else rating = 'E';
  
  return {
    attainedCII,
    requiredCII,
    rating,
    ratingBoundaries: ratings,
    trend: annualData.previousCII ? (attainedCII < annualData.previousCII ? 'improving' : 'declining') : 'baseline',
    correctionFactors: {
      iceClass: annualData.iceClass ? 0.95 : 1.0,
      shuttleTanker: annualData.shuttleTanker ? 0.92 : 1.0,
    },
    projections: {
      2024: { required: requiredCII * 0.98, projected: attainedCII * 0.97 },
      2025: { required: requiredCII * 0.96, projected: attainedCII * 0.94 },
      2026: { required: requiredCII * 0.94, projected: attainedCII * 0.91 },
    },
    actionRequired: rating === 'D' || rating === 'E',
    recommendations: rating === 'D' || rating === 'E' ? [
      'Develop Ship Energy Efficiency Management Plan (SEEMP)',
      'Consider hull cleaning and propeller polishing',
      'Evaluate alternative fuels or energy-saving devices',
    ] : [],
  };
}

async function generateDecarbonizationRoadmap(data: { vesselId: string; targetYear: number }) {
  const currentYear = new Date().getFullYear();
  const yearsToTarget = data.targetYear - currentYear;
  
  return {
    vesselId: data.vesselId,
    targetYear: data.targetYear,
    currentState: {
      estimatedEmissions: 15000, // tonnes CO2/year
      fuelType: 'VLSFO',
      efficiency: 'C',
    },
    roadmap: [
      {
        phase: 1,
        year: currentYear + 1,
        actions: [
          { action: 'Hull optimization coating', reduction: 3, cost: 150000, roi: 24 },
          { action: 'Propeller boss cap fins', reduction: 2, cost: 25000, roi: 12 },
          { action: 'LED lighting retrofit', reduction: 0.5, cost: 15000, roi: 6 },
        ],
        totalReduction: 5.5,
      },
      {
        phase: 2,
        year: currentYear + 2,
        actions: [
          { action: 'Waste heat recovery system', reduction: 4, cost: 500000, roi: 36 },
          { action: 'Air lubrication system', reduction: 5, cost: 800000, roi: 48 },
          { action: 'Variable frequency drives', reduction: 2, cost: 100000, roi: 18 },
        ],
        totalReduction: 11,
      },
      {
        phase: 3,
        year: currentYear + 4,
        actions: [
          { action: 'Dual-fuel LNG conversion', reduction: 20, cost: 5000000, roi: 72 },
          { action: 'Shore power connection', reduction: 5, cost: 200000, roi: 36 },
        ],
        totalReduction: 25,
      },
      {
        phase: 4,
        year: currentYear + 7,
        actions: [
          { action: 'Methanol/Ammonia ready conversion', reduction: 30, cost: 8000000, roi: 96 },
          { action: 'Wind-assisted propulsion', reduction: 10, cost: 2000000, roi: 60 },
        ],
        totalReduction: 40,
      },
    ],
    totalInvestment: 16790000,
    totalReduction: 81.5,
    netZeroFeasibility: yearsToTarget >= 10 ? 'achievable' : 'challenging',
    carbonCreditsOffset: 15000 * 0.185 * 85, // Remaining 18.5% × €85/tonne
  };
}

async function checkBallastCompliance(data: { vesselId: string; lastExchange: any }) {
  const { lastExchange } = data;
  
  const dConventionDate = new Date('2024-09-08');
  const isPostConvention = new Date() >= dConventionDate;
  
  return {
    vesselId: data.vesselId,
    bwmConvention: {
      applicable: true,
      standardRequired: isPostConvention ? 'D-2' : 'D-1 or D-2',
      complianceStatus: lastExchange?.treatmentSystem ? 'compliant' : 'action_required',
    },
    treatmentSystem: lastExchange?.treatmentSystem || null,
    lastExchange: {
      date: lastExchange?.date,
      location: lastExchange?.location,
      volume: lastExchange?.volume,
      method: lastExchange?.method,
    },
    riskAssessment: {
      invasiveSpeciesRisk: lastExchange?.originPort === lastExchange?.destinationPort ? 'low' : 'medium',
      sameRiskArea: false,
    },
    documentation: {
      ballastWaterRecordBook: true,
      ballastWaterManagementPlan: true,
      typeApprovalCertificate: !!lastExchange?.treatmentSystem,
    },
    upcomingRequirements: [
      { date: '2024-09-08', requirement: 'D-2 standard mandatory for all vessels' },
      { date: '2025-01-01', requirement: 'Enhanced sediment management requirements' },
    ],
  };
}

async function trackWasteManagement(data: { vesselId: string; wasteRecords: any[] }) {
  const { wasteRecords } = data;
  
  const wasteCategories = {
    oilyWaste: { generated: 0, discharged: 0, retained: 0 },
    sewage: { generated: 0, treated: 0, discharged: 0 },
    garbage: { plastics: 0, foodWaste: 0, domesticWaste: 0, operationalWaste: 0 },
    hazardous: { generated: 0, disposed: 0 },
  };
  
  wasteRecords?.forEach(record => {
    if (record.category in wasteCategories) {
      wasteCategories[record.category as keyof typeof wasteCategories] = {
        ...wasteCategories[record.category as keyof typeof wasteCategories],
        ...record.amounts,
      };
    }
  });
  
  return {
    vesselId: data.vesselId,
    reportingPeriod: {
      start: wasteRecords?.[0]?.date || new Date().toISOString(),
      end: wasteRecords?.[wasteRecords.length - 1]?.date || new Date().toISOString(),
    },
    summary: wasteCategories,
    marpolCompliance: {
      annexI: { status: 'compliant', oilyWaterSeparator: true, lastInspection: '2024-01-15' },
      annexII: { status: 'compliant', nls: false },
      annexIV: { status: 'compliant', sewageTreatmentPlant: true },
      annexV: { status: 'compliant', garbageManagementPlan: true },
      annexVI: { status: 'compliant', ecaCompliance: true },
    },
    portReceptionFacilities: {
      lastDelivery: '2024-01-20',
      nextScheduled: '2024-02-15',
      preferredPorts: ['Rotterdam', 'Singapore', 'Houston'],
    },
    recommendations: [
      'Schedule oily waste discharge at next port call',
      'Update garbage record book',
      'Review food waste management procedures',
    ],
  };
}
