/**
 * 🚨 SAFETY & INCIDENT - Types & Logic
 * Incident reporting, root cause analysis, safety drills
 */

// ============================================================================
// TYPES
// ============================================================================

export interface SafetyIncident {
  id: string;
  vesselId: string;
  type: IncidentType;
  severity: 'near_miss' | 'minor' | 'serious' | 'major' | 'catastrophic';
  category: IncidentCategory;
  title: string;
  description: string;
  location: IncidentLocation;
  dateTime: Date;
  reportedBy: string;
  witnesses: string[];
  injuries: InjuryReport[];
  environmentalImpact: EnvironmentalImpact;
  immediateActions: string[];
  rootCauses: RootCause[];
  correctiveActions: CorrectiveAction[];
  status: 'reported' | 'investigating' | 'analyzed' | 'closed';
  lessonsLearned: string[];
}

export type IncidentType =
  | 'collision' | 'grounding' | 'fire' | 'explosion' | 'flooding'
  | 'man_overboard' | 'injury' | 'near_miss' | 'pollution' | 'security'
  | 'cargo_damage' | 'machinery_failure' | 'navigation' | 'mooring';

export type IncidentCategory =
  | 'hull_machinery' | 'navigation' | 'cargo' | 'occupational'
  | 'environmental' | 'security' | 'fire_explosion';

export interface IncidentLocation {
  vesselArea?: string;
  deck?: string;
  compartment?: string;
  coordinates?: { lat: number; lng: number };
  portName?: string;
  seaArea?: string;
}

export interface InjuryReport {
  personName: string;
  personRole: string;
  injuryType: string;
  severity: 'first_aid' | 'medical_treatment' | 'lost_time' | 'permanent' | 'fatality';
  bodyPart: string;
  treatment: string;
  daysLost?: number;
}

export interface EnvironmentalImpact {
  occurred: boolean;
  pollutantType?: 'oil' | 'chemicals' | 'sewage' | 'garbage';
  quantity?: number;
  unit?: string;
  areaAffected?: number;
  mitigationActions?: string[];
}

export interface RootCause {
  id: string;
  category: 'human_factors' | 'equipment' | 'procedural' | 'environmental' | 'organizational';
  subcategory: string;
  description: string;
  contributionLevel: 'primary' | 'contributing' | 'minor';
}

export interface CorrectiveAction {
  id: string;
  title: string;
  description: string;
  type: 'immediate' | 'short_term' | 'long_term' | 'preventive';
  assignedTo: string;
  department: string;
  dueDate: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'verified';
  completedDate?: Date;
  effectiveness?: 'effective' | 'partial' | 'ineffective';
}

export interface SafetyDrill {
  id: string;
  vesselId: string;
  type: DrillType;
  scenario: string;
  scheduledDate: Date;
  conductedDate?: Date;
  participants: string[];
  objectives: string[];
  results: DrillResult;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}

export type DrillType =
  | 'fire' | 'abandon_ship' | 'man_overboard' | 'oil_spill'
  | 'security' | 'medical' | 'damage_control' | 'enclosed_space';

export interface DrillResult {
  score: number;
  mustersTime?: number;
  deficiencies: string[];
  improvements: string[];
  competencies: { crew: string; skill: string; level: 'proficient' | 'needs_improvement' | 'unsatisfactory' }[];
}

export interface SafetyMetrics {
  period: { start: Date; end: Date };
  vesselId?: string;
  incidents: { total: number; byType: Record<string, number>; bySeverity: Record<string, number>; trend: 'improving' | 'stable' | 'worsening' };
  injuries: { total: number; lti: number; ltifr: number; trir: number; daysLost: number };
  nearMisses: { total: number; reportingRate: number; byCategory: Record<string, number> };
  drills: { conducted: number; planned: number; compliance: number; averageScore: number };
  safetyScore: number;
}

export interface HazardAssessment {
  id: string;
  vesselId: string;
  area: string;
  activity: string;
  hazards: Hazard[];
  overallRisk: 'low' | 'medium' | 'high' | 'very_high';
  controls: RiskControl[];
  residualRisk: 'low' | 'medium' | 'high';
  assessedBy: string;
  assessedDate: Date;
  reviewDate: Date;
}

export interface Hazard {
  id: string;
  description: string;
  source: string;
  consequence: string;
  likelihood: 1 | 2 | 3 | 4 | 5;
  severity: 1 | 2 | 3 | 4 | 5;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'very_high';
}

export interface RiskControl {
  id: string;
  hazardId: string;
  type: 'elimination' | 'substitution' | 'engineering' | 'administrative' | 'ppe';
  description: string;
  effectiveness: 'high' | 'medium' | 'low';
}

// ============================================================================
// SAFETY INCIDENT ENGINE
// ============================================================================

export class SafetyIncidentEngine {
  private static instance: SafetyIncidentEngine;

  static getInstance(): SafetyIncidentEngine {
    if (!SafetyIncidentEngine.instance) {
      SafetyIncidentEngine.instance = new SafetyIncidentEngine();
    }
    return SafetyIncidentEngine.instance;
  }

  /**
   * Report a new safety incident
   */
  reportIncident(params: Omit<SafetyIncident, 'id' | 'status' | 'rootCauses' | 'correctiveActions' | 'lessonsLearned'>): SafetyIncident {
    return {
      ...params,
      id: crypto.randomUUID(),
      status: 'reported',
      rootCauses: [],
      correctiveActions: [],
      lessonsLearned: [],
    };
  }

  /**
   * Conduct root cause analysis
   */
  conductRootCauseAnalysis(incident: SafetyIncident, methodology: '5_whys' | 'fishbone' | 'fault_tree'): RootCause[] {
    const causes: RootCause[] = [];

    if (incident.type === 'injury') {
      causes.push({
        id: crypto.randomUUID(),
        category: 'human_factors',
        subcategory: 'Situational Awareness',
        description: 'Inadequate hazard recognition',
        contributionLevel: 'primary',
      });
    }

    if (incident.type === 'machinery_failure') {
      causes.push({
        id: crypto.randomUUID(),
        category: 'equipment',
        subcategory: 'Maintenance',
        description: 'Preventive maintenance not performed',
        contributionLevel: 'primary',
      });
    }

    causes.push({
      id: crypto.randomUUID(),
      category: 'procedural',
      subcategory: 'Work Procedures',
      description: 'Procedure not followed or inadequate',
      contributionLevel: 'contributing',
    });

    return causes;
  }

  /**
   * Generate corrective actions from root causes
   */
  generateCorrectiveActions(rootCauses: RootCause[]): CorrectiveAction[] {
    const actionMap: Record<string, string> = {
      human_factors: 'Conduct additional training',
      equipment: 'Review maintenance procedures',
      procedural: 'Revise relevant procedures',
      environmental: 'Implement environmental controls',
      organizational: 'Review management system',
    };

    return rootCauses.map(cause => ({
      id: crypto.randomUUID(),
      title: `Address ${cause.subcategory}`,
      description: actionMap[cause.category] || 'Investigate and implement corrective measures',
      type: cause.contributionLevel === 'primary' ? 'short_term' as const : 'long_term' as const,
      assignedTo: '',
      department: cause.category === 'equipment' ? 'Technical' : 'Operations',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'pending' as const,
    }));
  }

  /**
   * Schedule safety drill
   */
  scheduleDrill(params: Omit<SafetyDrill, 'id' | 'results' | 'status'>): SafetyDrill {
    return {
      ...params,
      id: crypto.randomUUID(),
      status: 'scheduled',
      results: { score: 0, deficiencies: [], improvements: [], competencies: [] },
    };
  }

  /**
   * Record drill results
   */
  recordDrillResults(drill: SafetyDrill, results: DrillResult): SafetyDrill {
    return { ...drill, conductedDate: new Date(), results, status: 'completed' };
  }

  /**
   * Conduct hazard assessment
   */
  conductHazardAssessment(params: {
    vesselId: string;
    area: string;
    activity: string;
    hazards: Omit<Hazard, 'id' | 'riskScore' | 'riskLevel'>[];
    controls: Omit<RiskControl, 'id'>[];
    assessedBy: string;
  }): HazardAssessment {
    const hazards = params.hazards.map(h => ({
      ...h,
      id: crypto.randomUUID(),
      riskScore: h.likelihood * h.severity,
      riskLevel: this.calculateRiskLevel(h.likelihood * h.severity),
    }));

    const maxRisk = Math.max(...hazards.map(h => h.riskScore));
    const controls = params.controls.map(c => ({ ...c, id: crypto.randomUUID() }));

    return {
      id: crypto.randomUUID(),
      vesselId: params.vesselId,
      area: params.area,
      activity: params.activity,
      hazards,
      overallRisk: this.calculateRiskLevel(maxRisk),
      controls,
      residualRisk: this.calculateResidualRisk(hazards, controls),
      assessedBy: params.assessedBy,
      assessedDate: new Date(),
      reviewDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    };
  }

  /**
   * Calculate safety metrics
   */
  calculateSafetyMetrics(incidents: SafetyIncident[], drills: SafetyDrill[], period: { start: Date; end: Date }): SafetyMetrics {
    const periodIncidents = incidents.filter(i => i.dateTime >= period.start && i.dateTime <= period.end);
    const allInjuries = periodIncidents.flatMap(i => i.injuries);
    const lti = allInjuries.filter(i => i.severity === 'lost_time' || (i.daysLost && i.daysLost > 0)).length;
    const daysLost = allInjuries.reduce((sum, i) => sum + (i.daysLost || 0), 0);

    const days = (period.end.getTime() - period.start.getTime()) / (24 * 60 * 60 * 1000);
    const exposureHours = days * 24 * 20;
    const nearMisses = periodIncidents.filter(i => i.severity === 'near_miss');
    const completedDrills = drills.filter(d => d.status === 'completed');

    return {
      period,
      incidents: {
        total: periodIncidents.length,
        byType: this.countBy(periodIncidents, 'type'),
        bySeverity: this.countBy(periodIncidents, 'severity'),
        trend: 'stable',
      },
      injuries: {
        total: allInjuries.length,
        lti,
        ltifr: exposureHours > 0 ? (lti / exposureHours) * 1000000 : 0,
        trir: exposureHours > 0 ? (allInjuries.length / exposureHours) * 200000 : 0,
        daysLost,
      },
      nearMisses: {
        total: nearMisses.length,
        reportingRate: periodIncidents.length > 0 ? (nearMisses.length / periodIncidents.length) * 100 : 0,
        byCategory: this.countBy(nearMisses, 'category'),
      },
      drills: {
        conducted: completedDrills.length,
        planned: drills.length,
        compliance: drills.length > 0 ? (completedDrills.length / drills.length) * 100 : 0,
        averageScore: completedDrills.length > 0 ? completedDrills.reduce((sum, d) => sum + d.results.score, 0) / completedDrills.length : 0,
      },
      safetyScore: 85,
    };
  }

  private calculateRiskLevel(score: number): 'low' | 'medium' | 'high' | 'very_high' {
    if (score <= 4) return 'low';
    if (score <= 9) return 'medium';
    if (score <= 16) return 'high';
    return 'very_high';
  }

  private calculateResidualRisk(hazards: Hazard[], controls: RiskControl[]): 'low' | 'medium' | 'high' {
    const effectiveness = { high: 0.7, medium: 0.5, low: 0.3 };
    const avgEff = controls.reduce((sum, c) => sum + effectiveness[c.effectiveness], 0) / Math.max(1, controls.length);
    const avgRisk = hazards.reduce((sum, h) => sum + h.riskScore, 0) / Math.max(1, hazards.length);
    const residual = avgRisk * (1 - avgEff);
    if (residual <= 4) return 'low';
    if (residual <= 9) return 'medium';
    return 'high';
  }

  private countBy(items: any[], field: string): Record<string, number> {
    return items.reduce((acc, item) => {
      const key = item[field] || 'unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }
}

export const safetyIncident = SafetyIncidentEngine.getInstance();
