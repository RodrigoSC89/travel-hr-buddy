import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CrewingRequest {
  action: 'calculate_payroll' | 'rotation_planning' | 'leave_management' | 'visa_tracking' | 'crew_costs';
  data: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, data }: CrewingRequest = await req.json();

    let result;

    switch (action) {
      case 'calculate_payroll':
        result = await calculatePayroll(data);
        break;
      case 'rotation_planning':
        result = await planRotation(data);
        break;
      case 'leave_management':
        result = await manageLeave(data);
        break;
      case 'visa_tracking':
        result = await trackVisas(data);
        break;
      case 'crew_costs':
        result = await analyzeCrewCosts(data);
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Crewing Payroll AI error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function calculatePayroll(data: { crewMemberId: string; period: string }) {
  const { crewMemberId, period } = data;
  
  // Simulated crew member data
  const crewMember = {
    id: crewMemberId,
    name: 'John Santos',
    rank: 'Chief Officer',
    nationality: 'Philippines',
    baseSalary: 6500, // USD
    currency: 'USD',
    contractType: 'ILO MLC 2006',
    embarkedDate: '2024-01-15',
    vessel: 'MV Ocean Star',
  };
  
  // Calculate earnings
  const daysOnBoard = 45;
  const basicWage = crewMember.baseSalary;
  const overtimeHours = 52;
  const overtimeRate = (basicWage / 30 / 8) * 1.25; // Daily rate / 8 hours * 1.25
  const overtimePay = overtimeHours * overtimeRate;
  
  // Allowances
  const allowances = {
    subsistence: 150,
    leave: basicWage * 0.0833, // 1/12 of basic (MLC requirement)
    tanker: 500, // Tanker allowance if applicable
    hardship: 0,
  };
  
  const totalAllowances = Object.values(allowances).reduce((a, b) => a + b, 0);
  
  // Deductions
  const deductions = {
    allotment: 3000, // Family allotment
    socialSecurity: basicWage * 0.05, // Home country contribution
    tax: 0, // Flag state dependent
    advance: 500,
  };
  
  const totalDeductions = Object.values(deductions).reduce((a, b) => a + b, 0);
  
  // Final calculations
  const grossPay = basicWage + overtimePay + totalAllowances;
  const netPay = grossPay - totalDeductions;
  
  return {
    payrollId: `PAY-${Date.now()}`,
    period,
    crewMember,
    earnings: {
      basicWage,
      overtimeHours,
      overtimeRate: Math.round(overtimeRate * 100) / 100,
      overtimePay: Math.round(overtimePay * 100) / 100,
      allowances,
      totalAllowances: Math.round(totalAllowances * 100) / 100,
      grossPay: Math.round(grossPay * 100) / 100,
    },
    deductions: {
      ...deductions,
      totalDeductions: Math.round(totalDeductions * 100) / 100,
    },
    summary: {
      netPay: Math.round(netPay * 100) / 100,
      currency: 'USD',
      paymentMethod: 'Bank Transfer',
      paymentDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
    disbursement: {
      crewBankAccount: Math.round((netPay - deductions.allotment) * 100) / 100,
      allotmentAccount: deductions.allotment,
    },
    mlcCompliance: {
      minimumWage: 'Compliant',
      workingHours: 'Compliant',
      leaveAccrual: 'Compliant',
      overtimeCalculation: 'Compliant',
    },
    taxReporting: {
      flagState: 'Panama',
      taxLiability: 0,
      homeCountryReporting: true,
    },
  };
}

async function planRotation(data: { vesselId: string; planningHorizon: number }) {
  const { vesselId, planningHorizon } = data;
  
  const currentCrew = [
    { id: 'C001', name: 'Capt. Rodriguez', rank: 'Master', embarkedDate: '2023-11-01', maxTour: 120, nationality: 'Spain' },
    { id: 'C002', name: 'John Santos', rank: 'Chief Officer', embarkedDate: '2024-01-15', maxTour: 180, nationality: 'Philippines' },
    { id: 'C003', name: 'Peter Chen', rank: 'Second Officer', embarkedDate: '2023-12-01', maxTour: 180, nationality: 'China' },
    { id: 'C004', name: 'Viktor Petrov', rank: 'Chief Engineer', embarkedDate: '2023-10-15', maxTour: 120, nationality: 'Russia' },
    { id: 'C005', name: 'Maria Garcia', rank: 'Third Officer', embarkedDate: '2024-01-01', maxTour: 180, nationality: 'Philippines' },
  ];
  
  const today = new Date();
  
  const rotationPlan = currentCrew.map(crew => {
    const embarked = new Date(crew.embarkedDate);
    const daysOnBoard = Math.floor((today.getTime() - embarked.getTime()) / (1000 * 60 * 60 * 24));
    const daysRemaining = crew.maxTour - daysOnBoard;
    const reliefDate = new Date(embarked.getTime() + crew.maxTour * 24 * 60 * 60 * 1000);
    
    return {
      ...crew,
      daysOnBoard,
      daysRemaining,
      reliefDate: reliefDate.toISOString().split('T')[0],
      status: daysRemaining < 14 ? 'critical' : daysRemaining < 30 ? 'attention' : 'normal',
      reliefReady: false, // Would check relief pool
    };
  });
  
  // Sort by relief urgency
  rotationPlan.sort((a, b) => a.daysRemaining - b.daysRemaining);
  
  return {
    vesselId,
    vesselName: 'MV Ocean Star',
    planningDate: today.toISOString(),
    planningHorizon: `${planningHorizon} days`,
    currentCrew: rotationPlan,
    upcomingRotations: rotationPlan.filter(c => c.daysRemaining <= planningHorizon).map(crew => ({
      crewMember: crew.name,
      rank: crew.rank,
      reliefDate: crew.reliefDate,
      reliefLocation: 'Singapore', // Would be determined by vessel schedule
      reliefCandidate: 'TBD', // Would match from relief pool
      travelArrangements: 'Pending',
      handoverDays: 2,
    })),
    crewPool: {
      masters: 2,
      chiefOfficers: 3,
      secondOfficers: 4,
      thirdOfficers: 5,
      chiefEngineers: 2,
    },
    recommendations: [
      {
        priority: 'high',
        crew: 'Capt. Rodriguez',
        action: 'Identify relief Master immediately - only 15 days remaining',
      },
      {
        priority: 'high',
        crew: 'Viktor Petrov',
        action: 'Chief Engineer relief overdue - arrange urgent relief',
      },
      {
        priority: 'medium',
        crew: 'General',
        action: 'Book flights for Singapore crew change in advance',
      },
    ],
    costs: {
      estimatedTravelCosts: 12500,
      handoverCosts: 3000,
      totalRotationCosts: 15500,
    },
  };
}

async function manageLeave(data: { crewMemberId: string }) {
  return {
    crewMemberId: data.crewMemberId,
    crewName: 'John Santos',
    rank: 'Chief Officer',
    leaveEntitlement: {
      annual: {
        entitled: 45, // days per year (MLC minimum: 2.5 days per month)
        accrued: 32,
        taken: 15,
        balance: 17,
        pending: 10,
      },
      compensatory: {
        accrued: 5,
        taken: 0,
        balance: 5,
      },
      maternity: {
        entitled: 14, // weeks (MLC requirement)
        applicable: false,
      },
    },
    leaveHistory: [
      { type: 'Annual', from: '2023-12-01', to: '2023-12-15', days: 15, status: 'completed' },
      { type: 'Sick', from: '2023-08-10', to: '2023-08-12', days: 3, status: 'completed', medical: true },
    ],
    upcomingLeave: [
      { type: 'Annual', from: '2024-03-15', to: '2024-03-25', days: 10, status: 'pending', reliefRequired: true },
    ],
    recommendations: {
      nextLeaveWindow: 'After current tour completion',
      suggestedDuration: '30 days',
      reason: 'Extended tour compensation',
    },
    mlcCompliance: {
      minimumLeave: 30, // days per year
      currentAccrual: 32,
      status: 'compliant',
      paidLeave: true,
      repatriationEntitled: true,
    },
  };
}

async function trackVisas(data: { organizationId: string }) {
  const crewVisas = [
    {
      crewId: 'C001',
      name: 'Capt. Rodriguez',
      nationality: 'Spain',
      visas: [
        { country: 'USA', type: 'C1/D', validUntil: '2025-06-15', status: 'valid' },
        { country: 'Australia', type: 'MCV', validUntil: '2024-03-01', status: 'expiring_soon' },
        { country: 'China', type: 'Crew', validUntil: '2024-08-20', status: 'valid' },
      ],
      seamanBook: { country: 'Spain', validUntil: '2026-01-15', status: 'valid' },
    },
    {
      crewId: 'C002',
      name: 'John Santos',
      nationality: 'Philippines',
      visas: [
        { country: 'USA', type: 'C1/D', validUntil: '2024-02-15', status: 'expired' },
        { country: 'Australia', type: 'MCV', validUntil: '2024-05-20', status: 'valid' },
        { country: 'Schengen', type: 'Crew', validUntil: '2024-12-01', status: 'valid' },
      ],
      seamanBook: { country: 'Philippines', validUntil: '2025-08-10', status: 'valid' },
    },
  ];
  
  const alerts: Array<{ crewId: string; name: string; document: string; status: string; expiredDays?: number; daysRemaining?: number; action: string; priority: string }> = [];
  const today = new Date();
  
  crewVisas.forEach(crew => {
    crew.visas.forEach(visa => {
      const validUntil = new Date(visa.validUntil);
      const daysUntil = Math.floor((validUntil.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntil < 0) {
        alerts.push({
          crewId: crew.crewId,
          name: crew.name,
          document: `${visa.country} ${visa.type} Visa`,
          status: 'expired',
          expiredDays: Math.abs(daysUntil),
          action: 'Immediate renewal required',
          priority: 'critical',
        });
      } else if (daysUntil < 30) {
        alerts.push({
          crewId: crew.crewId,
          name: crew.name,
          document: `${visa.country} ${visa.type} Visa`,
          status: 'expiring',
          daysRemaining: daysUntil,
          action: 'Schedule visa renewal',
          priority: daysUntil < 14 ? 'high' : 'medium',
        });
      }
    });
  });
  
  return {
    organizationId: data.organizationId,
    summary: {
      totalCrew: crewVisas.length,
      validVisas: 8,
      expiringVisas: 2,
      expiredVisas: 1,
    },
    crewVisas,
    alerts: alerts.sort((a, b) => {
      const priority = { critical: 0, high: 1, medium: 2, low: 3 };
      return priority[a.priority as keyof typeof priority] - priority[b.priority as keyof typeof priority];
    }),
    voyageRequirements: {
      upcomingPorts: ['Singapore', 'Rotterdam', 'Houston'],
      requiredVisas: [
        { port: 'Houston', country: 'USA', crewNeedingVisa: ['John Santos'] },
      ],
    },
    recommendations: [
      'Urgently renew USA C1/D visa for John Santos',
      'Schedule Australia MCV renewal for Capt. Rodriguez',
      'Review visa requirements for upcoming voyage to Houston',
    ],
  };
}

async function analyzeCrewCosts(data: { vesselId: string; period: string }) {
  return {
    vesselId: data.vesselId,
    vesselName: 'MV Ocean Star',
    period: data.period,
    crewComplement: 22,
    costAnalysis: {
      wages: {
        officers: 85000,
        ratings: 45000,
        total: 130000,
        percentOfTotal: 65,
      },
      travel: {
        flights: 8500,
        hotels: 2000,
        visas: 1500,
        total: 12000,
        percentOfTotal: 6,
      },
      training: {
        mandatory: 5000,
        competency: 3000,
        total: 8000,
        percentOfTotal: 4,
      },
      insurance: {
        piClub: 3500,
        health: 2000,
        total: 5500,
        percentOfTotal: 2.75,
      },
      victualling: {
        provisions: 18000,
        total: 18000,
        percentOfTotal: 9,
      },
      other: {
        uniforms: 2000,
        communications: 1500,
        welfare: 3000,
        total: 6500,
        percentOfTotal: 3.25,
      },
    },
    totalMonthlyCost: 180000,
    costPerDay: 6000,
    costPerCrew: 8182,
    benchmark: {
      industryAverage: 190000,
      variance: -5.3, // percent below average
      rating: 'efficient',
    },
    trends: {
      previousPeriod: 175000,
      change: 2.86,
      changeReason: 'Increased travel costs due to crew rotations',
    },
    optimization: [
      {
        area: 'Travel',
        current: 12000,
        target: 9000,
        saving: 3000,
        action: 'Consolidate crew changes, book flights earlier',
      },
      {
        area: 'Training',
        current: 8000,
        target: 6500,
        saving: 1500,
        action: 'Implement more e-learning modules',
      },
    ],
    forecast: {
      nextQuarter: 185000,
      factors: ['Planned crew change', 'Training certifications due'],
    },
  };
}
