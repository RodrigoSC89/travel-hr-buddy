import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InsuranceRequest {
  action: 'policy_overview' | 'submit_claim' | 'claim_status' | 'coverage_analysis' | 'renewal_optimization';
  data: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, data }: InsuranceRequest = await req.json();

    let result;

    switch (action) {
      case 'policy_overview':
        result = await getPolicyOverview(data);
        break;
      case 'submit_claim':
        result = await submitClaim(data);
        break;
      case 'claim_status':
        result = await getClaimStatus(data);
        break;
      case 'coverage_analysis':
        result = await analyzeCoverage(data);
        break;
      case 'renewal_optimization':
        result = await optimizeRenewal(data);
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Insurance Claims AI error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function getPolicyOverview(data: { organizationId: string }) {
  return {
    organizationId: data.organizationId,
    policies: [
      {
        policyId: 'POL-HM-2024',
        type: 'Hull & Machinery',
        insurer: 'Lloyd\'s Syndicate',
        coverage: 45000000,
        deductible: 50000,
        premium: 225000,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        vessels: ['MV Ocean Star', 'MV Pacific Voyager'],
        status: 'active',
        specialConditions: ['Navigation warranty', 'Classification clause', 'ISM compliance'],
      },
      {
        policyId: 'POL-PI-2024',
        type: 'P&I (Protection & Indemnity)',
        insurer: 'UK P&I Club',
        coverage: 'Unlimited (pooled)',
        deductible: 25000,
        premium: 180000,
        startDate: '2024-02-20',
        endDate: '2025-02-20',
        vessels: ['MV Ocean Star', 'MV Pacific Voyager', 'MV Atlantic Explorer'],
        status: 'active',
        coveredRisks: ['Crew injury', 'Cargo damage', 'Pollution', 'Collision liability', 'Wreck removal'],
      },
      {
        policyId: 'POL-FDD-2024',
        type: 'Loss of Hire / FD&D',
        insurer: 'Gard AS',
        coverage: 5000000,
        deductible: 14, // days
        dailyRate: 35000,
        premium: 45000,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        status: 'active',
        maxPeriod: 180, // days
      },
      {
        policyId: 'POL-WAR-2024',
        type: 'War Risks',
        insurer: 'Norwegian Hull Club',
        coverage: 45000000,
        premium: 15000,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        status: 'active',
        excludedAreas: ['Listed High Risk Areas per JWC'],
        additionalPremiumAreas: ['Gulf of Aden', 'Red Sea', 'Persian Gulf'],
      },
    ],
    totalPremiums: 465000,
    totalCoverage: {
      hullMachinery: 45000000,
      piLiability: 'Unlimited',
      lossOfHire: 5000000,
      warRisks: 45000000,
    },
    upcomingRenewals: [
      { policy: 'POL-HM-2024', daysUntil: 45, action: 'Prepare renewal submission' },
    ],
    claimsHistory: {
      last12Months: 2,
      totalPaid: 125000,
      openClaims: 1,
    },
  };
}

async function submitClaim(data: { policyId: string; claimDetails: any }) {
  const { policyId, claimDetails } = data;
  
  const claimId = `CLM-${Date.now()}`;
  
  // AI-assisted claim processing
  const categoryAnalysis = analyzeClaimCategory(claimDetails);
  const documentsRequired = getRequiredDocuments(categoryAnalysis.category);
  const estimatedProcessingTime = calculateProcessingTime(categoryAnalysis);
  
  return {
    claimId,
    policyId,
    submissionDate: new Date().toISOString(),
    status: 'submitted',
    claimDetails: {
      ...claimDetails,
      aiCategory: categoryAnalysis.category,
      aiConfidence: categoryAnalysis.confidence,
    },
    nextSteps: [
      {
        step: 1,
        action: 'Claim registered with insurer',
        status: 'completed',
        date: new Date().toISOString(),
      },
      {
        step: 2,
        action: 'Submit supporting documents',
        status: 'pending',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        step: 3,
        action: 'Surveyor appointment (if required)',
        status: 'pending',
        estimated: categoryAnalysis.surveyorRequired,
      },
      {
        step: 4,
        action: 'Claim assessment',
        status: 'pending',
        estimatedDuration: `${estimatedProcessingTime} days`,
      },
    ],
    documentsRequired,
    estimatedSettlement: {
      minDays: estimatedProcessingTime,
      maxDays: estimatedProcessingTime + 30,
      factors: ['Complexity of claim', 'Document completeness', 'Third party involvement'],
    },
    tips: [
      'Gather all evidence immediately (photos, statements, logs)',
      'Notify all relevant parties promptly',
      'Keep detailed records of all communications',
      'Do not admit liability without insurer consultation',
    ],
  };
}

function analyzeClaimCategory(details: any) {
  const description = (details.description || '').toLowerCase();
  
  const categories = {
    collision: ['collision', 'allision', 'contact', 'struck'],
    machinery: ['engine', 'machinery', 'breakdown', 'mechanical'],
    cargo: ['cargo', 'damage to goods', 'shortage', 'contamination'],
    crew: ['injury', 'illness', 'death', 'crew', 'medical'],
    pollution: ['pollution', 'oil spill', 'bunker', 'environmental'],
    grounding: ['grounding', 'stranding', 'aground'],
    fire: ['fire', 'explosion', 'smoke damage'],
  };
  
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(kw => description.includes(kw))) {
      return {
        category,
        confidence: 0.85,
        surveyorRequired: ['collision', 'grounding', 'fire', 'machinery'].includes(category),
      };
    }
  }
  
  return { category: 'general', confidence: 0.5, surveyorRequired: true };
}

function getRequiredDocuments(category: string) {
  const baseDocuments = [
    { name: 'Claim form (completed)', required: true },
    { name: 'Incident report', required: true },
    { name: 'Photographs/video evidence', required: true },
    { name: 'Relevant ship\'s logs', required: true },
    { name: 'Crew statements', required: true },
  ];
  
  const categoryDocuments: Record<string, any[]> = {
    collision: [
      { name: 'Bridge team statements', required: true },
      { name: 'ECDIS/VDR data', required: true },
      { name: 'Survey report', required: true },
      { name: 'Repair quotations', required: true },
    ],
    machinery: [
      { name: 'Engine room logs', required: true },
      { name: 'Maintenance records', required: true },
      { name: 'Chief Engineer report', required: true },
      { name: 'Repair invoices', required: true },
    ],
    cargo: [
      { name: 'Bill of lading', required: true },
      { name: 'Cargo manifest', required: true },
      { name: 'Survey report', required: true },
      { name: 'Letter of protest', required: false },
    ],
    crew: [
      { name: 'Medical reports', required: true },
      { name: 'Crew employment contract', required: true },
      { name: 'Drug/alcohol test results', required: true },
      { name: 'Witness statements', required: true },
    ],
  };
  
  return [...baseDocuments, ...(categoryDocuments[category] || [])];
}

function calculateProcessingTime(analysis: any) {
  const baseDays = 30;
  const complexityFactor = analysis.surveyorRequired ? 1.5 : 1;
  return Math.round(baseDays * complexityFactor);
}

async function getClaimStatus(data: { claimId: string }) {
  return {
    claimId: data.claimId,
    status: 'under_review',
    timeline: [
      { date: '2024-01-15', event: 'Claim submitted', status: 'completed' },
      { date: '2024-01-16', event: 'Acknowledged by insurer', status: 'completed' },
      { date: '2024-01-20', event: 'Documents received', status: 'completed' },
      { date: '2024-01-25', event: 'Surveyor appointed', status: 'completed' },
      { date: '2024-02-01', event: 'Survey completed', status: 'completed' },
      { date: '2024-02-10', event: 'Assessment in progress', status: 'in_progress' },
      { date: 'TBD', event: 'Settlement offer', status: 'pending' },
      { date: 'TBD', event: 'Claim closed', status: 'pending' },
    ],
    currentStage: 'Assessment',
    handler: {
      name: 'John Smith',
      company: 'Maritime Claims Services Ltd',
      email: 'j.smith@mcs.com',
      phone: '+44 20 7123 4567',
    },
    reserveAmount: 75000,
    estimatedSettlement: {
      min: 60000,
      max: 85000,
      confidence: 'medium',
    },
    pendingActions: [
      { action: 'Provide additional repair quotations', deadline: '2024-02-15' },
      { action: 'Confirm final repair scope', deadline: '2024-02-20' },
    ],
    communications: [
      { date: '2024-02-05', type: 'email', summary: 'Request for additional documentation' },
      { date: '2024-02-08', type: 'call', summary: 'Discussed survey findings' },
    ],
  };
}

async function analyzeCoverage(data: { vesselId: string; scenario: string }) {
  const { scenario } = data;
  
  return {
    vesselId: data.vesselId,
    scenario,
    coverageAnalysis: {
      hullMachinery: {
        covered: true,
        limit: 45000000,
        applicableDeductible: 50000,
        conditions: ['Subject to classification maintenance', 'ISM compliance required'],
      },
      piCoverage: {
        covered: true,
        limit: 'Unlimited (pooled)',
        applicableDeductible: 25000,
        conditions: ['Standard P&I rules apply'],
      },
      lossOfHire: {
        covered: true,
        limit: 5000000,
        waitingPeriod: 14,
        dailyRate: 35000,
        maxPeriod: 180,
      },
    },
    gapAnalysis: [
      { gap: 'Cyber risk coverage limited', recommendation: 'Consider standalone cyber policy' },
      { gap: 'No strike/delay coverage', recommendation: 'Add FD&D extension' },
    ],
    estimatedExposure: {
      worstCase: 15000000,
      mostLikely: 2500000,
      netExposure: 50000, // After insurance recovery
    },
    recommendations: [
      'Review deductible levels for cost optimization',
      'Consider increasing loss of hire daily rate',
      'Add additional assured clause for charterers',
    ],
  };
}

async function optimizeRenewal(data: { organizationId: string }) {
  return {
    organizationId: data.organizationId,
    renewalOptimization: {
      currentPremiums: 465000,
      optimizedPremiums: 425000,
      potentialSavings: 40000,
      savingsPercentage: 8.6,
    },
    recommendations: [
      {
        category: 'Deductible Optimization',
        current: 50000,
        recommended: 75000,
        premiumReduction: 15000,
        riskIncrease: 'Low - based on claims history',
      },
      {
        category: 'Fleet Discount',
        current: '5%',
        recommended: '10%',
        premiumReduction: 12000,
        action: 'Add MV Atlantic Explorer to H&M policy',
      },
      {
        category: 'Claims-Free Discount',
        current: '0%',
        recommended: '5%',
        premiumReduction: 8000,
        eligibility: '2 years claims-free on H&M',
      },
      {
        category: 'Loss Prevention Credit',
        current: '0%',
        recommended: '3%',
        premiumReduction: 5000,
        action: 'Implement enhanced bridge procedures',
      },
    ],
    marketComparison: {
      currentInsurer: 465000,
      alternativeQuote1: 445000,
      alternativeQuote2: 458000,
      recommendation: 'Negotiate with current insurer using alternative quotes',
    },
    renewalTimeline: {
      start: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      milestones: [
        { date: 'T-90', action: 'Prepare renewal submission' },
        { date: 'T-60', action: 'Request alternative quotes' },
        { date: 'T-30', action: 'Negotiate terms' },
        { date: 'T-14', action: 'Finalize and bind' },
      ],
    },
  };
}
