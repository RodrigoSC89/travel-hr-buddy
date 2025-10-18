/**
 * SGSO AI Helper Functions
 * Provides AI-powered functions for safety management system operations
 */

export interface IncidentData {
  title: string;
  description: string;
  location?: string;
  severity?: string;
  type?: string;
}

export interface RiskForecast {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  probability: number;
  impact: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  recommendations: string[];
}

export interface CorrectiveAction {
  action: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  deadline: string;
  responsible: string;
  resources: string[];
}

export interface NonConformity {
  type: 'minor' | 'major' | 'critical';
  standard: string;
  description: string;
  evidence: string[];
  correctiveActions: CorrectiveAction[];
}

export interface IncidentPattern {
  pattern: string;
  frequency: number;
  severity: string;
  rootCause: string;
  preventiveMeasures: string[];
}

/**
 * Classifies an incident using AI-based analysis
 * @param incident - Incident data to classify
 * @returns Classified incident with severity and type
 */
export async function classifyIncidentWithAI(incident: IncidentData): Promise<{
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  urgency: 'immediate' | 'urgent' | 'normal' | 'low';
  requiresInvestigation: boolean;
}> {
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 100));

  // AI-based classification logic
  const description = incident.description.toLowerCase();
  const title = incident.title.toLowerCase();
  
  // Determine severity based on keywords
  let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
  if (description.includes('fatal') || description.includes('death') || description.includes('critical injury')) {
    severity = 'critical';
  } else if (description.includes('injury') || description.includes('damage') || description.includes('serious')) {
    severity = 'high';
  } else if (description.includes('risk') || description.includes('hazard') || description.includes('unsafe')) {
    severity = 'medium';
  }

  // Determine incident type
  let type = 'General Incident';
  if (title.includes('fall') || description.includes('fall')) {
    type = 'Fall Incident';
  } else if (title.includes('fire') || description.includes('fire')) {
    type = 'Fire Incident';
  } else if (title.includes('equipment') || description.includes('equipment')) {
    type = 'Equipment Failure';
  } else if (title.includes('environmental') || description.includes('spill')) {
    type = 'Environmental Incident';
  } else if (title.includes('collision') || description.includes('collision')) {
    type = 'Collision';
  }

  // Determine urgency
  const urgency = severity === 'critical' ? 'immediate' : 
                  severity === 'high' ? 'urgent' : 
                  severity === 'medium' ? 'normal' : 'low';

  const requiresInvestigation = severity === 'critical' || severity === 'high';

  return {
    severity,
    type,
    urgency,
    requiresInvestigation
  };
}

/**
 * Forecasts risk based on historical data and trends
 * @param historicalData - Array of past incidents and risk indicators
 * @returns Risk forecast with recommendations
 */
export async function forecastRisk(historicalData: IncidentData[]): Promise<RiskForecast> {
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 150));

  // Analyze trends
  const recentIncidents = historicalData.slice(-10);
  const totalIncidents = historicalData.length;
  
  // Calculate risk level based on incident frequency
  let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
  if (totalIncidents > 20) {
    riskLevel = 'critical';
  } else if (totalIncidents > 10) {
    riskLevel = 'high';
  } else if (totalIncidents > 5) {
    riskLevel = 'medium';
  }

  // Calculate probability and impact
  const probability = Math.min(100, totalIncidents * 5);
  const impact = riskLevel === 'critical' ? 95 : 
                 riskLevel === 'high' ? 75 : 
                 riskLevel === 'medium' ? 50 : 25;

  // Determine trend
  const recentCount = recentIncidents.length;
  const olderCount = Math.max(1, historicalData.slice(0, -10).length);
  const trend = recentCount > olderCount ? 'increasing' : 
                recentCount < olderCount ? 'decreasing' : 'stable';

  // Generate recommendations
  const recommendations = [
    'Implement enhanced safety training programs',
    'Conduct regular safety audits and inspections',
    'Review and update safety procedures',
    'Increase supervision in high-risk areas',
    'Invest in improved safety equipment'
  ];

  return {
    riskLevel,
    probability,
    impact,
    trend,
    recommendations: recommendations.slice(0, 3)
  };
}

/**
 * Generates corrective actions for an incident
 * @param incident - Incident data
 * @returns Array of recommended corrective actions
 */
export async function generateCorrectiveAction(incident: IncidentData): Promise<CorrectiveAction[]> {
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 100));

  const classification = await classifyIncidentWithAI(incident);
  const actions: CorrectiveAction[] = [];

  // Generate immediate actions for critical incidents
  if (classification.severity === 'critical') {
    actions.push({
      action: 'Immediate site inspection and hazard isolation',
      priority: 'critical',
      deadline: 'Within 24 hours',
      responsible: 'Safety Manager',
      resources: ['Inspection team', 'Safety equipment', 'Emergency response kit']
    });
  }

  // Generate investigation action
  if (classification.requiresInvestigation) {
    actions.push({
      action: 'Conduct root cause analysis investigation',
      priority: classification.severity === 'critical' ? 'critical' : 'high',
      deadline: 'Within 7 days',
      responsible: 'Investigation Team',
      resources: ['Investigation tools', 'Documentation templates', 'Expert consultants']
    });
  }

  // Generate training action
  actions.push({
    action: 'Provide targeted safety training to affected personnel',
    priority: classification.severity === 'critical' || classification.severity === 'high' ? 'high' : 'medium',
    deadline: 'Within 30 days',
    responsible: 'Training Coordinator',
    resources: ['Training materials', 'Training venue', 'Qualified instructors']
  });

  // Generate procedure update action
  actions.push({
    action: 'Review and update relevant safety procedures',
    priority: 'medium',
    deadline: 'Within 60 days',
    responsible: 'Safety Officer',
    resources: ['Current procedures', 'Industry standards', 'Best practices documentation']
  });

  return actions;
}

/**
 * Processes a non-conformity and generates remediation plan
 * @param nonConformity - Non-conformity details
 * @returns Enhanced non-conformity with corrective actions
 */
export async function processNonConformity(nonConformity: Partial<NonConformity>): Promise<NonConformity> {
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 120));

  const description = nonConformity.description || '';
  
  // Determine type if not provided
  let type: 'minor' | 'major' | 'critical' = 'minor';
  if (description.toLowerCase().includes('critical') || description.toLowerCase().includes('imminent danger')) {
    type = 'critical';
  } else if (description.toLowerCase().includes('major') || description.toLowerCase().includes('significant')) {
    type = 'major';
  }

  // Determine applicable standard
  const standard = nonConformity.standard || 'ISO 45001:2018';

  // Generate corrective actions based on type
  const correctiveActions: CorrectiveAction[] = [];
  
  if (type === 'critical') {
    correctiveActions.push({
      action: 'Immediate corrective action to eliminate danger',
      priority: 'critical',
      deadline: 'Immediate',
      responsible: 'Site Manager',
      resources: ['Emergency response team', 'Safety equipment']
    });
  }

  correctiveActions.push({
    action: 'Document and report non-conformity',
    priority: type === 'critical' ? 'critical' : type === 'major' ? 'high' : 'medium',
    deadline: 'Within 24 hours',
    responsible: 'Quality Manager',
    resources: ['Documentation system', 'Reporting templates']
  });

  correctiveActions.push({
    action: 'Implement corrective measures',
    priority: type === 'critical' ? 'critical' : type === 'major' ? 'high' : 'medium',
    deadline: type === 'critical' ? 'Within 7 days' : type === 'major' ? 'Within 30 days' : 'Within 60 days',
    responsible: 'Operations Manager',
    resources: ['Technical resources', 'Budget allocation', 'Implementation team']
  });

  correctiveActions.push({
    action: 'Verify effectiveness of corrective actions',
    priority: 'medium',
    deadline: type === 'critical' ? 'Within 14 days' : type === 'major' ? 'Within 45 days' : 'Within 90 days',
    responsible: 'Quality Auditor',
    resources: ['Audit checklist', 'Verification procedures']
  });

  return {
    type,
    standard,
    description: description || 'Non-conformity detected',
    evidence: nonConformity.evidence || [],
    correctiveActions
  };
}

/**
 * Analyzes patterns in incident data to identify trends
 * @param incidents - Array of incident data
 * @returns Array of identified patterns
 */
export async function analyzeIncidentPatterns(incidents: IncidentData[]): Promise<IncidentPattern[]> {
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 200));

  const patterns: IncidentPattern[] = [];
  
  // Analyze by incident type
  const typeMap = new Map<string, IncidentData[]>();
  for (const incident of incidents) {
    const type = incident.type || 'Unknown';
    if (!typeMap.has(type)) {
      typeMap.set(type, []);
    }
    typeMap.get(type)!.push(incident);
  }

  // Generate patterns for each type with multiple occurrences
  for (const [type, incidentList] of typeMap.entries()) {
    if (incidentList.length > 1) {
      // Determine common severity
      const severities = incidentList.map(i => i.severity || 'low');
      const avgSeverity = severities.includes('critical') ? 'critical' :
                         severities.includes('high') ? 'high' :
                         severities.includes('medium') ? 'medium' : 'low';

      patterns.push({
        pattern: `Recurring ${type} incidents`,
        frequency: incidentList.length,
        severity: avgSeverity,
        rootCause: `Potential systemic issue with ${type.toLowerCase()} management`,
        preventiveMeasures: [
          `Implement enhanced controls for ${type.toLowerCase()}`,
          'Conduct targeted training for personnel',
          'Review and update relevant procedures',
          'Increase monitoring and supervision'
        ]
      });
    }
  }

  // Analyze by location if available
  const locationMap = new Map<string, IncidentData[]>();
  for (const incident of incidents) {
    if (incident.location) {
      if (!locationMap.has(incident.location)) {
        locationMap.set(incident.location, []);
      }
      locationMap.get(incident.location)!.push(incident);
    }
  }

  for (const [location, incidentList] of locationMap.entries()) {
    if (incidentList.length > 2) {
      patterns.push({
        pattern: `High incident concentration at ${location}`,
        frequency: incidentList.length,
        severity: 'high',
        rootCause: `Location-specific hazards at ${location}`,
        preventiveMeasures: [
          `Conduct detailed safety assessment of ${location}`,
          'Implement location-specific safety controls',
          'Increase safety monitoring at this location',
          'Consider redesign or modification of work area'
        ]
      });
    }
  }

  // If no patterns found, return a general observation
  if (patterns.length === 0) {
    patterns.push({
      pattern: 'Distributed incident pattern',
      frequency: incidents.length,
      severity: 'low',
      rootCause: 'No significant patterns detected',
      preventiveMeasures: [
        'Continue routine safety monitoring',
        'Maintain current safety protocols',
        'Conduct regular safety reviews'
      ]
    });
  }

  return patterns;
}
