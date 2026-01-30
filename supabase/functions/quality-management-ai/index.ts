import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface QualityRequest {
  action: 'analyze_ncr' | 'generate_capa' | 'quality_kpis' | 'internal_audit' | 'continuous_improvement';
  data: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, data }: QualityRequest = await req.json();

    let result;

    switch (action) {
      case 'analyze_ncr':
        result = await analyzeNonConformity(data);
        break;
      case 'generate_capa':
        result = await generateCAPA(data);
        break;
      case 'quality_kpis':
        result = await calculateQualityKPIs(data);
        break;
      case 'internal_audit':
        result = await planInternalAudit(data);
        break;
      case 'continuous_improvement':
        result = await identifyImprovements(data);
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Quality Management AI error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function analyzeNonConformity(data: { description: string; category: string; severity: string }) {
  const { description, category, severity } = data;
  
  // AI classification based on description
  const classificationPatterns = {
    'procedural': ['procedure', 'process', 'documentation', 'record'],
    'equipment': ['equipment', 'machinery', 'breakdown', 'malfunction'],
    'training': ['training', 'competency', 'qualification', 'awareness'],
    'supplier': ['supplier', 'vendor', 'delivery', 'quality of goods'],
    'safety': ['safety', 'hazard', 'risk', 'incident'],
  };
  
  let detectedCategory = category;
  const lowerDesc = description.toLowerCase();
  
  for (const [cat, patterns] of Object.entries(classificationPatterns)) {
    if (patterns.some(p => lowerDesc.includes(p))) {
      detectedCategory = cat;
      break;
    }
  }
  
  // Impact assessment
  const impactFactors = {
    safety: severity === 'critical' ? 10 : severity === 'major' ? 7 : 3,
    operational: severity === 'critical' ? 9 : severity === 'major' ? 6 : 2,
    financial: severity === 'critical' ? 8 : severity === 'major' ? 5 : 2,
    reputational: severity === 'critical' ? 7 : severity === 'major' ? 4 : 1,
  };
  
  const totalImpact = Object.values(impactFactors).reduce((a, b) => a + b, 0);
  
  return {
    ncrId: `NCR-${Date.now()}`,
    originalDescription: description,
    aiClassification: {
      category: detectedCategory,
      confidence: 0.87,
      suggestedSeverity: severity,
    },
    impactAssessment: {
      factors: impactFactors,
      totalScore: totalImpact,
      riskLevel: totalImpact > 25 ? 'high' : totalImpact > 15 ? 'medium' : 'low',
    },
    similarNcrs: [
      { id: 'NCR-2024-001', similarity: 0.82, resolution: 'Procedure update' },
      { id: 'NCR-2023-045', similarity: 0.76, resolution: 'Training program' },
    ],
    suggestedActions: [
      {
        type: 'immediate',
        action: 'Contain the non-conformity to prevent further occurrence',
        deadline: '24 hours',
        responsible: 'Department Manager',
      },
      {
        type: 'corrective',
        action: `Investigate root cause using 5-Why analysis for ${detectedCategory} issues`,
        deadline: '7 days',
        responsible: 'Quality Manager',
      },
      {
        type: 'preventive',
        action: 'Update relevant procedures and conduct awareness training',
        deadline: '30 days',
        responsible: 'Quality Team',
      },
    ],
    regulatoryImplications: severity === 'critical' ? [
      'Potential flag state notification required',
      'May affect upcoming audits',
      'Consider PSC implications',
    ] : [],
  };
}

async function generateCAPA(data: { ncrId: string; rootCause: string; category: string }) {
  const { ncrId, rootCause, category } = data;
  
  const capaTemplates: Record<string, any> = {
    procedural: {
      corrective: [
        'Review and update affected procedure(s)',
        'Implement additional verification steps',
        'Update documentation control system',
      ],
      preventive: [
        'Conduct procedure review across similar processes',
        'Implement regular procedure audit schedule',
        'Establish change management controls',
      ],
    },
    equipment: {
      corrective: [
        'Repair or replace affected equipment',
        'Update maintenance schedule',
        'Review spare parts inventory',
      ],
      preventive: [
        'Implement condition-based monitoring',
        'Review equipment criticality assessment',
        'Enhance preventive maintenance program',
      ],
    },
    training: {
      corrective: [
        'Provide immediate retraining to affected personnel',
        'Review competency assessment records',
        'Update training materials',
      ],
      preventive: [
        'Review training needs analysis',
        'Implement competency verification system',
        'Establish refresher training schedule',
      ],
    },
  };
  
  const template = capaTemplates[category] || capaTemplates.procedural;
  
  return {
    capaId: `CAPA-${Date.now()}`,
    linkedNcr: ncrId,
    rootCauseAnalysis: {
      method: '5-Why Analysis',
      rootCause,
      contributingFactors: [
        'Inadequate supervision',
        'Unclear responsibilities',
        'Resource constraints',
      ],
    },
    correctiveActions: template.corrective.map((action: string, idx: number) => ({
      id: `CA-${idx + 1}`,
      action,
      responsible: 'TBD',
      deadline: new Date(Date.now() + (idx + 1) * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'open',
      verification: 'Required',
    })),
    preventiveActions: template.preventive.map((action: string, idx: number) => ({
      id: `PA-${idx + 1}`,
      action,
      responsible: 'TBD',
      deadline: new Date(Date.now() + (idx + 1) * 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'open',
      verification: 'Required',
    })),
    effectivenessReview: {
      scheduledDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      criteria: [
        'No recurrence of similar NCRs',
        'Successful completion of all actions',
        'Positive feedback from affected areas',
      ],
    },
    resources: {
      estimatedHours: 40,
      estimatedCost: 5000,
      trainingRequired: category === 'training',
    },
  };
}

async function calculateQualityKPIs(data: { organizationId: string; period: string }) {
  // Simulated KPI data - in production would query database
  return {
    period: data.period,
    kpis: {
      ncrMetrics: {
        totalOpen: 12,
        totalClosed: 45,
        averageCloseTime: 18.5, // days
        onTimeCloseRate: 0.87,
        trend: 'improving',
      },
      capaMetrics: {
        totalOpen: 8,
        overdueActions: 2,
        effectivenessRate: 0.92,
        averageImplementationTime: 25, // days
      },
      auditMetrics: {
        internalAuditsCompleted: 4,
        externalAuditsCompleted: 2,
        findingsOpen: 15,
        findingsClosed: 38,
        majorFindings: 3,
      },
      supplierQuality: {
        suppliersEvaluated: 25,
        approvedSuppliers: 22,
        supplierNcrs: 5,
        averageSupplierScore: 82,
      },
      customerFeedback: {
        complaintsReceived: 3,
        complaintsResolved: 3,
        satisfactionScore: 4.2, // out of 5
        nps: 45,
      },
    },
    benchmarks: {
      industry: {
        ncrCloseRate: 0.85,
        capaEffectiveness: 0.88,
        customerSatisfaction: 4.0,
      },
      comparison: {
        ncrCloseRate: '+2%',
        capaEffectiveness: '+4%',
        customerSatisfaction: '+5%',
      },
    },
    recommendations: [
      {
        area: 'CAPA',
        finding: '2 overdue actions',
        recommendation: 'Escalate to management for resource allocation',
        priority: 'high',
      },
      {
        area: 'Supplier Quality',
        finding: '3 suppliers below threshold',
        recommendation: 'Schedule supplier development meetings',
        priority: 'medium',
      },
    ],
    trends: {
      ncrsByMonth: [8, 12, 10, 7, 9, 6],
      capaEffectiveness: [0.85, 0.88, 0.90, 0.89, 0.91, 0.92],
      customerSatisfaction: [3.8, 4.0, 4.1, 4.0, 4.2, 4.2],
    },
  };
}

async function planInternalAudit(data: { scope: string; department: string }) {
  const { scope, department } = data;
  
  return {
    auditId: `IA-${Date.now()}`,
    scope,
    department,
    auditPlan: {
      objectives: [
        'Verify compliance with QMS procedures',
        'Assess effectiveness of implemented controls',
        'Identify improvement opportunities',
      ],
      criteria: [
        'ISO 9001:2015 requirements',
        'Company QMS procedures',
        'Regulatory requirements',
      ],
      schedule: {
        openingMeeting: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        fieldwork: {
          start: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          end: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString(),
        },
        closingMeeting: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        reportDue: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      },
    },
    checklist: [
      { area: 'Document Control', questions: 8, priority: 'high' },
      { area: 'Training Records', questions: 6, priority: 'high' },
      { area: 'Process Control', questions: 10, priority: 'medium' },
      { area: 'Monitoring & Measurement', questions: 7, priority: 'medium' },
      { area: 'Corrective Actions', questions: 5, priority: 'high' },
    ],
    resources: {
      leadAuditor: 'TBD',
      auditTeam: [],
      estimatedHours: 24,
    },
    previousAuditFindings: [
      { finding: 'Incomplete training records', status: 'closed', verifyEffectiveness: true },
      { finding: 'Procedure update delay', status: 'closed', verifyEffectiveness: true },
    ],
  };
}

async function identifyImprovements(data: { dataSource: string; period: string }) {
  return {
    analysisDate: new Date().toISOString(),
    dataSources: ['NCRs', 'CAPAs', 'Audits', 'Customer Feedback', 'Process Metrics'],
    opportunities: [
      {
        id: 'CI-001',
        category: 'Process',
        description: 'Implement automated document review workflow',
        potentialBenefit: 'Reduce document approval time by 40%',
        effort: 'medium',
        impact: 'high',
        roi: 3.5,
        status: 'proposed',
      },
      {
        id: 'CI-002',
        category: 'Training',
        description: 'Develop e-learning modules for common procedures',
        potentialBenefit: 'Reduce training time by 30%, improve consistency',
        effort: 'high',
        impact: 'high',
        roi: 2.8,
        status: 'proposed',
      },
      {
        id: 'CI-003',
        category: 'Technology',
        description: 'Implement mobile inspection app',
        potentialBenefit: 'Real-time data capture, eliminate paper forms',
        effort: 'medium',
        impact: 'medium',
        roi: 2.2,
        status: 'under_review',
      },
    ],
    quickWins: [
      'Standardize NCR categorization',
      'Create CAPA template library',
      'Implement weekly quality huddles',
    ],
    strategicInitiatives: [
      {
        initiative: 'Quality 4.0 Transformation',
        timeline: '12-18 months',
        investment: 150000,
        expectedROI: '200%',
      },
    ],
  };
}
