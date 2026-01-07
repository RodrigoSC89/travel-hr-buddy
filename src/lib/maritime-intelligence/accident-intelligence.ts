/**
 * Central de Inteligência de Acidentes e Investigação (CIAI)
 * AI-powered incident analysis and pattern detection
 */

export interface Incident {
  id: string;
  date: Date;
  type: IncidentType;
  subType?: string;
  location: string;
  vesselArea: string;
  severity: 'near_miss' | 'low' | 'medium' | 'high' | 'critical';
  description: string;
  cause: string;
  rootCauses: string[];
  contributingFactors: string[];
  injuries: number;
  fatalities: number;
  propertyDamage: number; // USD
  resolved: boolean;
  correctiveActions: CorrectiveAction[];
  investigation?: Investigation;
}

export type IncidentType = 
  | 'slip_fall'
  | 'equipment_failure'
  | 'fire'
  | 'collision'
  | 'grounding'
  | 'man_overboard'
  | 'chemical_spill'
  | 'structural'
  | 'electrical'
  | 'cargo'
  | 'other';

export interface CorrectiveAction {
  id: string;
  action: string;
  responsible: string;
  dueDate: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  effectiveness?: number; // 0-100
}

export interface Investigation {
  investigator: string;
  startDate: Date;
  endDate?: Date;
  methodology: string;
  findings: string[];
  recommendations: string[];
  status: 'open' | 'in_progress' | 'completed';
}

export interface IncidentPattern {
  id: string;
  name: string;
  type: IncidentType;
  incidentIds: string[];
  frequency: number; // incidents per year
  trend: 'increasing' | 'stable' | 'decreasing';
  commonFactors: { factor: string; percentage: number }[];
  riskScore: number; // 0-100
  predictedAnnualIncidents: number;
  estimatedCost: number;
  recommendations: PatternRecommendation[];
}

export interface PatternRecommendation {
  priority: number;
  action: string;
  expectedReduction: number; // percentage
  estimatedCost: number;
  roi: number;
}

export interface IncidentAnalysis {
  totalIncidents: number;
  byType: Record<IncidentType, number>;
  bySeverity: Record<string, number>;
  trends: { month: string; count: number }[];
  patterns: IncidentPattern[];
  riskAreas: { area: string; riskScore: number }[];
  predictions: IncidentPrediction[];
}

export interface IncidentPrediction {
  type: IncidentType;
  probability: number;
  timeframe: string;
  location?: string;
  preventiveMeasures: string[];
}

// Sample incident database
const incidentDatabase: Incident[] = [
  {
    id: 'inc-001',
    date: new Date('2023-05-15'),
    type: 'slip_fall',
    subType: 'wet_surface',
    location: 'Engine room deck',
    vesselArea: 'Engine Room',
    severity: 'low',
    description: 'Crew member slipped near pump area',
    cause: 'Water pooled near pump (drainage clogged)',
    rootCauses: ['Blocked drainage', 'No anti-slip matting'],
    contributingFactors: ['Poor lighting', 'Time pressure'],
    injuries: 0,
    fatalities: 0,
    propertyDamage: 0,
    resolved: true,
    correctiveActions: [
      { id: 'ca-001', action: 'Clear drainage', responsible: 'Chief Engineer', dueDate: new Date('2023-05-20'), status: 'completed', effectiveness: 85 }
    ]
  },
  {
    id: 'inc-002',
    date: new Date('2023-08-20'),
    type: 'slip_fall',
    subType: 'worn_surface',
    location: 'Stairway A',
    vesselArea: 'Accommodation',
    severity: 'medium',
    description: 'Crew member fell on stairs, minor injury',
    cause: 'Step slippery, insufficient handrails',
    rootCauses: ['Surface degradation', 'Missing handrail section'],
    contributingFactors: ['Carrying items', 'Hurrying'],
    injuries: 1,
    fatalities: 0,
    propertyDamage: 500,
    resolved: true,
    correctiveActions: [
      { id: 'ca-002', action: 'Replace worn treads', responsible: 'Bosun', dueDate: new Date('2023-09-01'), status: 'completed', effectiveness: 90 },
      { id: 'ca-003', action: 'Install handrails', responsible: 'Bosun', dueDate: new Date('2023-09-15'), status: 'completed', effectiveness: 95 }
    ]
  },
  {
    id: 'inc-003',
    date: new Date('2024-02-10'),
    type: 'slip_fall',
    subType: 'weather',
    location: 'Cargo ramp',
    vesselArea: 'Cargo Area',
    severity: 'high',
    description: 'Crew member fell on wet ramp, fractured wrist',
    cause: 'Rain water on worn surface',
    rootCauses: ['Worn non-slip coating', 'No weather protection'],
    contributingFactors: ['Rushing', 'No PPE'],
    injuries: 1,
    fatalities: 0,
    propertyDamage: 2000,
    resolved: true,
    correctiveActions: [
      { id: 'ca-004', action: 'Re-coat ramp surface', responsible: 'Deck Dept', dueDate: new Date('2024-03-01'), status: 'completed', effectiveness: 88 }
    ]
  },
  {
    id: 'inc-004',
    date: new Date('2024-11-05'),
    type: 'slip_fall',
    subType: 'condensation',
    location: 'Engine room deck',
    vesselArea: 'Engine Room',
    severity: 'near_miss',
    description: 'Near miss - crew caught themselves before falling',
    cause: 'Water from condensation on deck plates',
    rootCauses: ['HVAC issue causing condensation', 'Delayed cleaning'],
    contributingFactors: ['Low visibility', 'End of watch fatigue'],
    injuries: 0,
    fatalities: 0,
    propertyDamage: 0,
    resolved: false,
    correctiveActions: [
      { id: 'ca-005', action: 'Fix HVAC condensation', responsible: 'Chief Engineer', dueDate: new Date('2024-12-01'), status: 'in_progress' }
    ]
  },
  {
    id: 'inc-005',
    date: new Date('2024-06-15'),
    type: 'equipment_failure',
    subType: 'electrical',
    location: 'Bridge',
    vesselArea: 'Bridge',
    severity: 'medium',
    description: 'Radar system failure during navigation',
    cause: 'Power supply unit failed',
    rootCauses: ['Age of equipment', 'Voltage fluctuation'],
    contributingFactors: ['Delayed maintenance', 'No backup unit'],
    injuries: 0,
    fatalities: 0,
    propertyDamage: 15000,
    resolved: true,
    correctiveActions: [
      { id: 'ca-006', action: 'Replace radar PSU', responsible: 'ETO', dueDate: new Date('2024-06-20'), status: 'completed', effectiveness: 100 },
      { id: 'ca-007', action: 'Install voltage stabilizer', responsible: 'Chief Engineer', dueDate: new Date('2024-07-15'), status: 'completed', effectiveness: 95 }
    ]
  },
  {
    id: 'inc-006',
    date: new Date('2024-09-22'),
    type: 'equipment_failure',
    subType: 'mechanical',
    location: 'Steering gear room',
    vesselArea: 'Steering',
    severity: 'high',
    description: 'Hydraulic leak in steering system',
    cause: 'Seal failure in hydraulic cylinder',
    rootCauses: ['Seal aging', 'Excessive operating temperature'],
    contributingFactors: ['Missed inspection', 'High sea conditions'],
    injuries: 0,
    fatalities: 0,
    propertyDamage: 45000,
    resolved: true,
    correctiveActions: [
      { id: 'ca-008', action: 'Replace all seals', responsible: 'Chief Engineer', dueDate: new Date('2024-09-25'), status: 'completed', effectiveness: 100 }
    ]
  }
];

/**
 * Accident Intelligence System
 */
export class AccidentIntelligenceSystem {
  private incidents: Incident[] = incidentDatabase;
  private patterns: IncidentPattern[] = [];

  constructor() {
    this.analyzePatterns();
  }

  /**
   * Analyze all incidents to detect patterns
   */
  private analyzePatterns(): void {
    // Group incidents by type
    const byType = new Map<IncidentType, Incident[]>();
    
    for (const incident of this.incidents) {
      const existing = byType.get(incident.type) || [];
      existing.push(incident);
      byType.set(incident.type, existing);
    }

    this.patterns = [];

    // Analyze slip/fall pattern
    const slipFalls = byType.get('slip_fall') || [];
    if (slipFalls.length >= 2) {
      const waterRelated = slipFalls.filter(i => 
        i.cause.toLowerCase().includes('water') || 
        i.subType?.includes('wet') ||
        i.subType?.includes('condensation')
      );
      
      const surfaceDegradation = slipFalls.filter(i =>
        i.cause.toLowerCase().includes('worn') ||
        i.rootCauses.some(rc => rc.toLowerCase().includes('degradation'))
      );

      this.patterns.push({
        id: 'pattern-slip-water',
        name: 'Water-Related Slip Incidents',
        type: 'slip_fall',
        incidentIds: waterRelated.map(i => i.id),
        frequency: waterRelated.length / 2, // per year
        trend: 'stable',
        commonFactors: [
          { factor: 'Wet conditions', percentage: 100 },
          { factor: 'Drainage issues', percentage: 50 },
          { factor: 'Condensation', percentage: 25 }
        ],
        riskScore: 65,
        predictedAnnualIncidents: 3,
        estimatedCost: 50000,
        recommendations: [
          { priority: 1, action: 'Install anti-slip matting in high-water zones', expectedReduction: 60, estimatedCost: 15000, roi: 3.3 },
          { priority: 2, action: 'Improve drainage systems', expectedReduction: 40, estimatedCost: 8000, roi: 2.5 },
          { priority: 3, action: 'Implement wet-weather protocols', expectedReduction: 20, estimatedCost: 1000, roi: 10 }
        ]
      });

      if (surfaceDegradation.length > 0) {
        this.patterns.push({
          id: 'pattern-slip-surface',
          name: 'Surface Degradation Incidents',
          type: 'slip_fall',
          incidentIds: surfaceDegradation.map(i => i.id),
          frequency: surfaceDegradation.length / 2,
          trend: 'increasing',
          commonFactors: [
            { factor: 'Worn non-slip coating', percentage: 80 },
            { factor: 'High traffic areas', percentage: 60 }
          ],
          riskScore: 55,
          predictedAnnualIncidents: 2,
          estimatedCost: 30000,
          recommendations: [
            { priority: 1, action: 'Regular surface condition audits', expectedReduction: 50, estimatedCost: 2000, roi: 7.5 },
            { priority: 2, action: 'Scheduled re-coating program', expectedReduction: 70, estimatedCost: 20000, roi: 1.05 }
          ]
        });
      }
    }

    // Analyze equipment failure pattern
    const equipFailures = byType.get('equipment_failure') || [];
    if (equipFailures.length >= 1) {
      this.patterns.push({
        id: 'pattern-equip-electrical',
        name: 'Electrical Equipment Failures',
        type: 'equipment_failure',
        incidentIds: equipFailures.filter(i => i.subType === 'electrical').map(i => i.id),
        frequency: 1,
        trend: 'stable',
        commonFactors: [
          { factor: 'Aging equipment', percentage: 80 },
          { factor: 'Voltage fluctuations', percentage: 50 },
          { factor: 'Delayed maintenance', percentage: 40 }
        ],
        riskScore: 45,
        predictedAnnualIncidents: 1.5,
        estimatedCost: 25000,
        recommendations: [
          { priority: 1, action: 'Implement predictive maintenance', expectedReduction: 60, estimatedCost: 10000, roi: 1.5 },
          { priority: 2, action: 'Install UPS systems', expectedReduction: 40, estimatedCost: 5000, roi: 2 }
        ]
      });
    }
  }

  /**
   * Add new incident
   */
  addIncident(incident: Omit<Incident, 'id'>): Incident {
    const newIncident: Incident = {
      ...incident,
      id: `inc-${Date.now()}`
    };
    this.incidents.push(newIncident);
    this.analyzePatterns();
    return newIncident;
  }

  /**
   * Get full incident analysis
   */
  getAnalysis(): IncidentAnalysis {
    const byType: Record<IncidentType, number> = {} as Record<IncidentType, number>;
    const bySeverity: Record<string, number> = {};
    const byArea: Record<string, number> = {};

    for (const incident of this.incidents) {
      byType[incident.type] = (byType[incident.type] || 0) + 1;
      bySeverity[incident.severity] = (bySeverity[incident.severity] || 0) + 1;
      byArea[incident.vesselArea] = (byArea[incident.vesselArea] || 0) + 1;
    }

    // Calculate monthly trends
    const trends: { month: string; count: number }[] = [];
    const monthMap = new Map<string, number>();
    
    for (const incident of this.incidents) {
      const monthKey = `${incident.date.getFullYear()}-${String(incident.date.getMonth() + 1).padStart(2, '0')}`;
      monthMap.set(monthKey, (monthMap.get(monthKey) || 0) + 1);
    }
    
    Array.from(monthMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .forEach(([month, count]) => {
        trends.push({ month, count });
      });

    // Risk areas
    const riskAreas = Object.entries(byArea)
      .map(([area, count]) => ({
        area,
        riskScore: Math.min(100, count * 25)
      }))
      .sort((a, b) => b.riskScore - a.riskScore);

    // Predictions
    const predictions: IncidentPrediction[] = [
      {
        type: 'slip_fall',
        probability: 0.65,
        timeframe: 'Next 3 months',
        location: 'Engine Room',
        preventiveMeasures: ['Install anti-slip matting', 'Improve drainage', 'Weekly surface inspections']
      },
      {
        type: 'equipment_failure',
        probability: 0.35,
        timeframe: 'Next 6 months',
        location: 'Bridge',
        preventiveMeasures: ['Predictive maintenance program', 'Component age monitoring', 'Spare parts inventory']
      }
    ];

    return {
      totalIncidents: this.incidents.length,
      byType,
      bySeverity,
      trends,
      patterns: this.patterns,
      riskAreas,
      predictions
    };
  }

  /**
   * Get all incidents
   */
  getIncidents(options?: {
    type?: IncidentType;
    severity?: string;
    resolved?: boolean;
    startDate?: Date;
    endDate?: Date;
  }): Incident[] {
    let filtered = [...this.incidents];

    if (options?.type) {
      filtered = filtered.filter(i => i.type === options.type);
    }
    if (options?.severity) {
      filtered = filtered.filter(i => i.severity === options.severity);
    }
    if (options?.resolved !== undefined) {
      filtered = filtered.filter(i => i.resolved === options.resolved);
    }
    if (options?.startDate) {
      filtered = filtered.filter(i => i.date >= options.startDate!);
    }
    if (options?.endDate) {
      filtered = filtered.filter(i => i.date <= options.endDate!);
    }

    return filtered.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  /**
   * Get patterns
   */
  getPatterns(): IncidentPattern[] {
    return this.patterns;
  }

  /**
   * Get AI root cause analysis
   */
  async analyzeRootCause(incidentId: string): Promise<{
    incident: Incident;
    analysis: string;
    relatedPatterns: IncidentPattern[];
    recommendations: string[];
  }> {
    const incident = this.incidents.find(i => i.id === incidentId);
    if (!incident) {
      throw new Error(`Incident ${incidentId} not found`);
    }

    const relatedPatterns = this.patterns.filter(p => p.type === incident.type);

    const analysis = `
## Root Cause Analysis: ${incident.id}

**Incident Type:** ${incident.type.replace('_', ' ').toUpperCase()}
**Date:** ${incident.date.toLocaleDateString()}
**Severity:** ${incident.severity.toUpperCase()}

### Direct Cause
${incident.cause}

### Root Causes Identified
${incident.rootCauses.map((rc, i) => `${i + 1}. ${rc}`).join('\n')}

### Contributing Factors
${incident.contributingFactors.map((cf, i) => `- ${cf}`).join('\n')}

### Pattern Connection
${relatedPatterns.length > 0 
  ? `This incident is part of a larger pattern: "${relatedPatterns[0].name}" with ${relatedPatterns[0].incidentIds.length} related incidents.`
  : 'No related pattern detected.'}

### Impact Assessment
- Injuries: ${incident.injuries}
- Property Damage: $${incident.propertyDamage.toLocaleString()}
- Trend: ${relatedPatterns[0]?.trend || 'Unknown'}
`;

    const recommendations = incident.correctiveActions
      .filter(ca => ca.status !== 'completed')
      .map(ca => ca.action);

    if (recommendations.length === 0) {
      recommendations.push('Review and verify effectiveness of implemented corrective actions');
      recommendations.push('Schedule follow-up audit in 30 days');
    }

    return {
      incident,
      analysis,
      relatedPatterns,
      recommendations
    };
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalIncidents: number;
    unresolvedCount: number;
    totalInjuries: number;
    totalDamage: number;
    avgSeverity: number;
    patternCount: number;
  } {
    const unresolved = this.incidents.filter(i => !i.resolved).length;
    const injuries = this.incidents.reduce((sum, i) => sum + i.injuries, 0);
    const damage = this.incidents.reduce((sum, i) => sum + i.propertyDamage, 0);
    
    const severityMap: Record<string, number> = {
      'near_miss': 1,
      'low': 2,
      'medium': 3,
      'high': 4,
      'critical': 5
    };
    const avgSeverity = this.incidents.reduce((sum, i) => sum + (severityMap[i.severity] || 0), 0) / this.incidents.length;

    return {
      totalIncidents: this.incidents.length,
      unresolvedCount: unresolved,
      totalInjuries: injuries,
      totalDamage: damage,
      avgSeverity,
      patternCount: this.patterns.length
    };
  }
}

// Export singleton
export const accidentIntelligence = new AccidentIntelligenceSystem();
