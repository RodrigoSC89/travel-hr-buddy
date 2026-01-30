import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContractRequest {
  action: 'analyze_contract' | 'track_obligations' | 'renewal_alerts' | 'risk_assessment' | 'clause_extraction';
  data: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, data }: ContractRequest = await req.json();

    let result;

    switch (action) {
      case 'analyze_contract':
        result = await analyzeContract(data);
        break;
      case 'track_obligations':
        result = await trackObligations(data);
        break;
      case 'renewal_alerts':
        result = await generateRenewalAlerts(data);
        break;
      case 'risk_assessment':
        result = await assessContractRisk(data);
        break;
      case 'clause_extraction':
        result = await extractClauses(data);
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Contract Legal AI error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function analyzeContract(data: { contractText: string; contractType: string }) {
  const { contractText, contractType } = data;
  
  // Simulated AI analysis - in production would use Claude/GPT
  const keyTermsPatterns = {
    duration: /(\d+)\s*(years?|months?|days?)/gi,
    value: /\$[\d,]+(?:\.\d{2})?|\d+(?:,\d{3})*(?:\.\d{2})?\s*(?:USD|EUR|GBP)/gi,
    parties: /(?:between|party|parties|contractor|owner|charterer|shipowner)\s*[:.]?\s*([A-Z][a-zA-Z\s&.,]+(?:Ltd|Inc|LLC|Corp|Company|AS|BV)?)/gi,
    termination: /terminat(?:e|ion)[^.]*\./gi,
    liability: /liabilit(?:y|ies)[^.]*\./gi,
    indemnity: /indemnif(?:y|ication)[^.]*\./gi,
  };
  
  const extractedTerms: Record<string, string[]> = {};
  for (const [key, pattern] of Object.entries(keyTermsPatterns)) {
    const matches = contractText.match(pattern) || [];
    extractedTerms[key] = matches;
  }
  
  return {
    contractId: `CON-${Date.now()}`,
    contractType,
    summary: {
      parties: extractedTerms.parties?.slice(0, 2) || ['Party A', 'Party B'],
      duration: extractedTerms.duration?.[0] || 'Not specified',
      totalValue: extractedTerms.value?.[0] || 'Not specified',
    },
    keyTerms: {
      terminationClauses: extractedTerms.termination?.length || 0,
      liabilityClauses: extractedTerms.liability?.length || 0,
      indemnityClauses: extractedTerms.indemnity?.length || 0,
    },
    riskScore: {
      overall: 6.5,
      breakdown: {
        liability: 7,
        termination: 5,
        payment: 6,
        performance: 7,
        force_majeure: 6,
      },
    },
    recommendations: [
      { priority: 'high', issue: 'Liability cap not specified', suggestion: 'Negotiate liability cap at 100% of contract value' },
      { priority: 'medium', issue: 'Termination for convenience unclear', suggestion: 'Clarify notice period requirements' },
      { priority: 'low', issue: 'Dispute resolution vague', suggestion: 'Specify arbitration venue and rules' },
    ],
    maritimeSpecificClauses: contractType.includes('charter') ? {
      laytime: 'Review clause',
      demurrage: 'Standard BIMCO terms',
      despatch: '50% of demurrage rate',
      laycan: 'Specified',
      cargoClauses: 'Standard',
    } : null,
    complianceCheck: {
      sanctionsScreening: 'passed',
      antiCorruption: 'clause_present',
      dataProtection: 'gdpr_compliant',
    },
  };
}

async function trackObligations(data: { contractId: string }) {
  return {
    contractId: data.contractId,
    obligations: [
      {
        id: 'OBL-001',
        description: 'Submit monthly performance reports',
        frequency: 'monthly',
        nextDue: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        responsible: 'Operations Manager',
        status: 'upcoming',
        alertDays: 5,
      },
      {
        id: 'OBL-002',
        description: 'Insurance certificate renewal',
        frequency: 'annual',
        nextDue: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
        responsible: 'Finance Manager',
        status: 'upcoming',
        alertDays: 30,
      },
      {
        id: 'OBL-003',
        description: 'Quarterly invoice submission',
        frequency: 'quarterly',
        nextDue: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        responsible: 'Finance Team',
        status: 'due_soon',
        alertDays: 7,
      },
      {
        id: 'OBL-004',
        description: 'Annual audit documentation',
        frequency: 'annual',
        nextDue: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        responsible: 'Compliance Officer',
        status: 'overdue',
        alertDays: 14,
      },
    ],
    milestones: [
      { name: 'Contract Start', date: '2024-01-01', status: 'completed' },
      { name: 'First Review', date: '2024-06-01', status: 'completed' },
      { name: 'Mid-term Review', date: '2025-01-01', status: 'upcoming' },
      { name: 'Contract End', date: '2026-01-01', status: 'future' },
    ],
    compliance: {
      overallStatus: 'attention_required',
      completedObligations: 12,
      pendingObligations: 4,
      overdueObligations: 1,
    },
    notifications: {
      enabled: true,
      channels: ['email', 'in_app'],
      escalation: ['department_manager', 'legal_team'],
    },
  };
}

async function generateRenewalAlerts(data: { organizationId: string }) {
  const today = new Date();
  
  return {
    organizationId: data.organizationId,
    upcomingRenewals: [
      {
        contractId: 'CON-2024-001',
        contractName: 'Time Charter - MV Ocean Star',
        expiryDate: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        daysRemaining: 30,
        value: 2500000,
        priority: 'critical',
        actionRequired: 'Initiate renewal negotiations',
        counterparty: 'Global Shipping Ltd',
        renewalOptions: {
          autoRenewal: false,
          noticePeriod: 60,
          renewalTerms: '12 months at current rate +3%',
        },
      },
      {
        contractId: 'CON-2024-002',
        contractName: 'P&I Insurance Policy',
        expiryDate: new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        daysRemaining: 60,
        value: 500000,
        priority: 'high',
        actionRequired: 'Request renewal quotes',
        counterparty: 'Maritime Insurance Co',
        renewalOptions: {
          autoRenewal: true,
          noticePeriod: 30,
          renewalTerms: 'Standard renewal with premium adjustment',
        },
      },
      {
        contractId: 'CON-2024-003',
        contractName: 'Crew Management Agreement',
        expiryDate: new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        daysRemaining: 90,
        value: 1200000,
        priority: 'medium',
        actionRequired: 'Schedule performance review',
        counterparty: 'Pacific Crew Services',
        renewalOptions: {
          autoRenewal: false,
          noticePeriod: 90,
          renewalTerms: 'Subject to performance review',
        },
      },
    ],
    recentlyExpired: [
      {
        contractId: 'CON-2023-045',
        contractName: 'Bunker Supply Agreement',
        expiredDate: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'expired',
        action: 'New agreement pending signature',
      },
    ],
    summary: {
      totalActiveContracts: 45,
      expiringIn30Days: 2,
      expiringIn60Days: 5,
      expiringIn90Days: 8,
      totalValueAtRisk: 8500000,
    },
    recommendations: [
      'Start MV Ocean Star charter renewal immediately - high value contract',
      'Consider alternative suppliers for bunker supply',
      'Review crew management performance before renewal decision',
    ],
  };
}

async function assessContractRisk(data: { contractId: string; contractDetails: any }) {
  const { contractDetails } = data;
  
  const riskCategories = {
    financial: {
      score: 7,
      factors: [
        { factor: 'Payment terms', risk: 'Net 60 days - extended credit risk', severity: 'medium' },
        { factor: 'Currency exposure', risk: 'USD denominated, no hedging clause', severity: 'medium' },
        { factor: 'Price adjustment', risk: 'Annual CPI adjustment only', severity: 'low' },
      ],
    },
    operational: {
      score: 6,
      factors: [
        { factor: 'Performance standards', risk: 'KPIs clearly defined', severity: 'low' },
        { factor: 'Service levels', risk: 'SLA penalties uncapped', severity: 'high' },
        { factor: 'Dependencies', risk: 'Third party dependencies present', severity: 'medium' },
      ],
    },
    legal: {
      score: 5,
      factors: [
        { factor: 'Jurisdiction', risk: 'English law - familiar jurisdiction', severity: 'low' },
        { factor: 'Dispute resolution', risk: 'London arbitration', severity: 'low' },
        { factor: 'Liability', risk: 'Unlimited liability exposure', severity: 'high' },
      ],
    },
    compliance: {
      score: 4,
      factors: [
        { factor: 'Regulatory', risk: 'All maritime regulations covered', severity: 'low' },
        { factor: 'Sanctions', risk: 'Sanctions clause included', severity: 'low' },
        { factor: 'Environmental', risk: 'ESG requirements specified', severity: 'low' },
      ],
    },
    counterparty: {
      score: 6,
      factors: [
        { factor: 'Financial stability', risk: 'Credit rating BB+', severity: 'medium' },
        { factor: 'Track record', risk: '5 year relationship, no issues', severity: 'low' },
        { factor: 'Market position', risk: 'Top 10 in sector', severity: 'low' },
      ],
    },
  };
  
  const overallScore = Object.values(riskCategories).reduce((sum, cat) => sum + cat.score, 0) / Object.keys(riskCategories).length;
  
  return {
    contractId: data.contractId,
    assessmentDate: new Date().toISOString(),
    overallRiskScore: overallScore,
    riskRating: overallScore < 4 ? 'Low' : overallScore < 6 ? 'Medium' : overallScore < 8 ? 'High' : 'Critical',
    categories: riskCategories,
    highPriorityRisks: [
      { risk: 'Uncapped SLA penalties', mitigation: 'Negotiate cap at 10% of monthly fees' },
      { risk: 'Unlimited liability', mitigation: 'Insert liability cap clause' },
    ],
    mitigationPlan: {
      immediate: ['Request liability cap amendment', 'Obtain parent company guarantee'],
      shortTerm: ['Implement monitoring dashboard', 'Schedule quarterly reviews'],
      longTerm: ['Develop alternative supplier options', 'Build internal capabilities'],
    },
    approvalRecommendation: overallScore < 7 ? 'Proceed with noted mitigations' : 'Escalate to legal committee',
  };
}

async function extractClauses(data: { contractText: string; clauseTypes: string[] }) {
  const { clauseTypes } = data;
  
  // Simulated clause extraction
  const extractedClauses: Record<string, any> = {};
  
  if (clauseTypes.includes('termination')) {
    extractedClauses.termination = {
      found: true,
      clauses: [
        { section: '12.1', text: 'Either party may terminate with 90 days written notice', type: 'convenience' },
        { section: '12.2', text: 'Immediate termination for material breach after 30 day cure period', type: 'cause' },
        { section: '12.3', text: 'Automatic termination upon insolvency event', type: 'insolvency' },
      ],
    };
  }
  
  if (clauseTypes.includes('liability')) {
    extractedClauses.liability = {
      found: true,
      clauses: [
        { section: '15.1', text: 'Liability limited to direct damages only', type: 'limitation' },
        { section: '15.2', text: 'Consequential damages excluded', type: 'exclusion' },
        { section: '15.3', text: 'Cap not specified', type: 'cap', warning: true },
      ],
    };
  }
  
  if (clauseTypes.includes('indemnity')) {
    extractedClauses.indemnity = {
      found: true,
      clauses: [
        { section: '16.1', text: 'Mutual indemnification for third party claims', type: 'mutual' },
        { section: '16.2', text: 'IP indemnity from supplier', type: 'ip' },
      ],
    };
  }
  
  if (clauseTypes.includes('force_majeure')) {
    extractedClauses.force_majeure = {
      found: true,
      clauses: [
        { section: '18.1', text: 'Standard force majeure events listed', type: 'definition' },
        { section: '18.2', text: 'Pandemic explicitly included', type: 'pandemic' },
        { section: '18.3', text: 'Termination right after 180 days of force majeure', type: 'termination' },
      ],
    };
  }
  
  return {
    extractionDate: new Date().toISOString(),
    clausesRequested: clauseTypes,
    extractedClauses,
    summary: {
      totalClausesFound: Object.values(extractedClauses).reduce((sum, c) => sum + (c.clauses?.length || 0), 0),
      warnings: Object.values(extractedClauses).filter((c: any) => c.clauses?.some((cl: any) => cl.warning)).length,
    },
    suggestions: [
      'Add liability cap clause',
      'Review indemnity scope',
      'Consider adding cyber event to force majeure',
    ],
  };
}
