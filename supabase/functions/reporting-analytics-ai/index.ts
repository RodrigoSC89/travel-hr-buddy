import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReportingRequest {
  action: 'generate_report' | 'custom_builder' | 'executive_dashboard' | 'schedule_report' | 'ai_insights';
  data: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, data }: ReportingRequest = await req.json();

    let result;

    switch (action) {
      case 'generate_report':
        result = await generateReport(data);
        break;
      case 'custom_builder':
        result = await buildCustomReport(data);
        break;
      case 'executive_dashboard':
        result = await getExecutiveDashboard(data);
        break;
      case 'schedule_report':
        result = await scheduleReport(data);
        break;
      case 'ai_insights':
        result = await generateAIInsights(data);
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Reporting Analytics AI error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateReport(data: { reportType: string; parameters: any }) {
  const { reportType, parameters } = data;
  
  const reportTemplates: Record<string, any> = {
    'fleet_performance': {
      title: 'Fleet Performance Report',
      sections: ['vessel_utilization', 'fuel_efficiency', 'maintenance_status', 'crew_performance'],
    },
    'financial_summary': {
      title: 'Financial Summary Report',
      sections: ['revenue', 'operating_costs', 'voyage_profitability', 'budget_variance'],
    },
    'compliance_status': {
      title: 'Compliance Status Report',
      sections: ['certifications', 'inspections', 'non_conformities', 'action_items'],
    },
    'safety_report': {
      title: 'Safety Performance Report',
      sections: ['incidents', 'near_misses', 'drills', 'safety_observations', 'kpis'],
    },
    'crew_report': {
      title: 'Crew Management Report',
      sections: ['manning_status', 'certifications', 'training', 'rotations', 'costs'],
    },
  };
  
  const template = reportTemplates[reportType] || reportTemplates['fleet_performance'];
  
  return {
    reportId: `RPT-${Date.now()}`,
    type: reportType,
    title: template.title,
    generatedAt: new Date().toISOString(),
    parameters,
    sections: template.sections.map((section: string) => ({
      id: section,
      title: section.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      data: generateSectionData(section),
      charts: generateChartConfig(section),
    })),
    summary: {
      keyFindings: [
        'Fleet utilization at 92%, above target of 90%',
        'Fuel efficiency improved 3% vs last quarter',
        '2 vessels require attention for upcoming inspections',
      ],
      recommendations: [
        'Schedule drydocking for MV Pacific Voyager',
        'Review fuel procurement strategy',
        'Increase training focus on emergency procedures',
      ],
    },
    exportFormats: ['pdf', 'excel', 'word', 'powerpoint'],
    distribution: {
      scheduled: false,
      recipients: [],
    },
  };
}

function generateSectionData(section: string) {
  const sectionData: Record<string, any> = {
    'vessel_utilization': {
      overall: 92,
      byVessel: [
        { vessel: 'MV Ocean Star', utilization: 95, status: 'operational' },
        { vessel: 'MV Pacific Voyager', utilization: 88, status: 'operational' },
        { vessel: 'MV Atlantic Explorer', utilization: 93, status: 'operational' },
      ],
      trend: [90, 91, 92, 91, 93, 92],
    },
    'fuel_efficiency': {
      averageConsumption: 32.5, // tonnes/day
      efficiency: 0.045, // tonnes per nautical mile
      improvement: 3.2, // percent
      byVessel: [
        { vessel: 'MV Ocean Star', consumption: 30.2, efficiency: 0.042 },
        { vessel: 'MV Pacific Voyager', consumption: 35.1, efficiency: 0.048 },
      ],
    },
    'revenue': {
      total: 4500000,
      byVoyage: 2800000,
      timeCharter: 1700000,
      trend: 'increasing',
      vsLastPeriod: 5.2,
    },
    'operating_costs': {
      total: 3200000,
      crew: 1100000,
      fuel: 1400000,
      maintenance: 400000,
      other: 300000,
      vsLastPeriod: -2.1,
    },
    'incidents': {
      total: 3,
      lti: 0,
      medical: 1,
      nearMiss: 15,
      trir: 0.45,
      ltifr: 0,
    },
  };
  
  return sectionData[section] || { message: 'Section data available' };
}

function generateChartConfig(section: string) {
  const chartConfigs: Record<string, any> = {
    'vessel_utilization': {
      type: 'line',
      title: 'Fleet Utilization Trend',
      xAxis: 'Month',
      yAxis: 'Utilization %',
    },
    'fuel_efficiency': {
      type: 'bar',
      title: 'Fuel Consumption by Vessel',
      xAxis: 'Vessel',
      yAxis: 'Tonnes/Day',
    },
    'revenue': {
      type: 'pie',
      title: 'Revenue Distribution',
    },
    'operating_costs': {
      type: 'donut',
      title: 'Cost Breakdown',
    },
    'incidents': {
      type: 'bar',
      title: 'Incident Trend',
      xAxis: 'Month',
      yAxis: 'Count',
    },
  };
  
  return chartConfigs[section] || null;
}

async function buildCustomReport(data: { name: string; modules: string[]; filters: any }) {
  const { name, modules, filters } = data;
  
  return {
    reportId: `CUSTOM-${Date.now()}`,
    name,
    status: 'draft',
    configuration: {
      modules,
      filters,
      layout: 'auto',
      branding: {
        logo: true,
        colors: 'corporate',
        footer: 'Company confidential',
      },
    },
    preview: {
      estimatedPages: modules.length * 2,
      estimatedGenerationTime: '30 seconds',
    },
    availableModules: [
      { id: 'fleet_overview', name: 'Fleet Overview', category: 'operations' },
      { id: 'voyage_performance', name: 'Voyage Performance', category: 'operations' },
      { id: 'financial_kpis', name: 'Financial KPIs', category: 'finance' },
      { id: 'crew_status', name: 'Crew Status', category: 'hr' },
      { id: 'safety_metrics', name: 'Safety Metrics', category: 'hseq' },
      { id: 'compliance_summary', name: 'Compliance Summary', category: 'compliance' },
      { id: 'maintenance_status', name: 'Maintenance Status', category: 'technical' },
      { id: 'environmental_kpis', name: 'Environmental KPIs', category: 'esg' },
    ],
    availableFilters: [
      { id: 'date_range', type: 'date_range', name: 'Date Range' },
      { id: 'vessels', type: 'multi_select', name: 'Vessels' },
      { id: 'departments', type: 'multi_select', name: 'Departments' },
      { id: 'regions', type: 'multi_select', name: 'Regions' },
    ],
    sharing: {
      permissions: ['view', 'edit', 'schedule'],
      sharedWith: [],
    },
  };
}

async function getExecutiveDashboard(data: { organizationId: string }) {
  return {
    organizationId: data.organizationId,
    lastUpdated: new Date().toISOString(),
    kpis: {
      fleet: {
        totalVessels: 12,
        operational: 11,
        drydock: 1,
        utilization: 92,
      },
      financial: {
        revenue: { value: 45000000, trend: 5.2, unit: 'USD' },
        ebitda: { value: 12500000, margin: 27.8, unit: 'USD' },
        opex: { value: 32500000, trend: -2.1, unit: 'USD' },
      },
      safety: {
        ltifr: 0,
        trir: 0.45,
        nearMissReporting: 95,
        drillCompliance: 100,
      },
      compliance: {
        certificateValidity: 98,
        auditScore: 94,
        openNCRs: 5,
        overdueActions: 2,
      },
      crew: {
        totalCrew: 280,
        onBoard: 264,
        onLeave: 16,
        certificationCompliance: 97,
      },
      environmental: {
        ciiRating: 'B',
        co2Intensity: 12.5,
        trend: -8.3,
      },
    },
    alerts: [
      { type: 'critical', message: 'MV Pacific Voyager - Certificate expiring in 7 days', module: 'compliance' },
      { type: 'warning', message: 'Fuel costs 15% above budget this month', module: 'finance' },
      { type: 'info', message: 'Q4 board report due in 10 days', module: 'reporting' },
    ],
    quickActions: [
      { action: 'View Fleet Map', link: '/fleet-map' },
      { action: 'Download Monthly Report', link: '/reports/monthly' },
      { action: 'Review Open Actions', link: '/actions' },
    ],
    trends: {
      revenue: [42, 43, 44, 43, 45, 45],
      utilization: [90, 91, 92, 91, 93, 92],
      safety: [0.5, 0.4, 0.45, 0.42, 0.45, 0.45],
    },
  };
}

async function scheduleReport(data: { reportId: string; schedule: any; recipients: string[] }) {
  const { reportId, schedule, recipients } = data;
  
  return {
    scheduleId: `SCH-${Date.now()}`,
    reportId,
    schedule: {
      frequency: schedule.frequency || 'monthly',
      dayOfWeek: schedule.dayOfWeek,
      dayOfMonth: schedule.dayOfMonth || 1,
      time: schedule.time || '08:00',
      timezone: schedule.timezone || 'UTC',
      nextRun: calculateNextRun(schedule),
    },
    recipients: recipients.map(email => ({
      email,
      status: 'active',
      format: 'pdf',
    })),
    options: {
      includeExecutiveSummary: true,
      includeCharts: true,
      compressAttachment: false,
      archiveCopy: true,
    },
    status: 'active',
    history: [],
  };
}

function calculateNextRun(schedule: any) {
  const now = new Date();
  const next = new Date(now);
  
  if (schedule.frequency === 'daily') {
    next.setDate(next.getDate() + 1);
  } else if (schedule.frequency === 'weekly') {
    next.setDate(next.getDate() + 7);
  } else if (schedule.frequency === 'monthly') {
    next.setMonth(next.getMonth() + 1);
    next.setDate(schedule.dayOfMonth || 1);
  }
  
  return next.toISOString();
}

async function generateAIInsights(data: { dataScope: string; focus: string[] }) {
  const { dataScope, focus } = data;
  
  return {
    generatedAt: new Date().toISOString(),
    dataScope,
    focus,
    insights: [
      {
        id: 'INS-001',
        category: 'operations',
        type: 'opportunity',
        title: 'Voyage Optimization Opportunity',
        description: 'Analysis of recent voyages shows 12% fuel savings potential through weather routing optimization',
        impact: 'High',
        potentialSaving: 180000,
        confidence: 0.87,
        actions: [
          'Implement advanced weather routing for trans-Pacific routes',
          'Review speed optimization policies',
        ],
        supportingData: {
          voyagesAnalyzed: 45,
          currentAvgConsumption: 32.5,
          optimizedAvgConsumption: 28.6,
        },
      },
      {
        id: 'INS-002',
        category: 'maintenance',
        type: 'risk',
        title: 'Predictive Maintenance Alert',
        description: 'Main engine performance degradation detected on MV Ocean Star - maintenance recommended within 30 days',
        impact: 'Critical',
        potentialCost: 250000, // If not addressed
        confidence: 0.82,
        actions: [
          'Schedule maintenance window',
          'Order spare parts',
          'Arrange class surveyor attendance',
        ],
        supportingData: {
          fuelConsumptionIncrease: 8.5,
          powerOutputDecrease: 5.2,
          vibrationLevelIncrease: 12,
        },
      },
      {
        id: 'INS-003',
        category: 'crew',
        type: 'trend',
        title: 'Crew Retention Improving',
        description: 'Crew retention rate improved 15% YoY following welfare program implementation',
        impact: 'Medium',
        potentialSaving: 120000, // Reduced recruitment costs
        confidence: 0.91,
        actions: [
          'Continue welfare initiatives',
          'Survey crew satisfaction quarterly',
          'Benchmark against industry',
        ],
        supportingData: {
          retentionRate2023: 72,
          retentionRate2024: 87,
          industryAverage: 75,
        },
      },
    ],
    summary: {
      totalInsights: 8,
      byCategory: { operations: 3, maintenance: 2, crew: 2, compliance: 1 },
      byType: { opportunity: 4, risk: 2, trend: 2 },
      totalPotentialImpact: 550000,
    },
    nextAnalysis: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  };
}
