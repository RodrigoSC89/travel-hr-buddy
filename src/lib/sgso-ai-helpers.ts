/**
 * SGSO AI Helper Functions
 * Provides AI-powered assistance for Safety Management System (SGSO) operations
 */

export interface Incident {
  id: string;
  description: string;
  location?: string;
  severity?: string;
  date?: string;
  type?: string;
}

export interface IncidentClassification {
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  riskLevel: number; // 0-100
  confidence: number; // 0-1
  reasoning: string;
}

export interface RiskForecast {
  riskScore: number; // 0-100
  trend: 'increasing' | 'stable' | 'decreasing';
  factors: string[];
  recommendations: string[];
  confidenceLevel: number; // 0-1
}

export interface CorrectiveAction {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedDuration: string;
  assignedTo?: string;
  resources: string[];
  steps: string[];
}

export interface NonConformity {
  id: string;
  description: string;
  standard?: string;
  severity?: string;
}

export interface NonConformityProcessing {
  analysis: string;
  rootCause: string[];
  impact: string;
  correctiveActions: CorrectiveAction[];
  preventiveActions: string[];
  timeline: string;
}

export interface IncidentPattern {
  pattern: string;
  frequency: number;
  commonFactors: string[];
  affectedAreas: string[];
  recommendations: string[];
  trendAnalysis: string;
}

/**
 * Classifies an incident using AI-powered analysis
 * @param incident - The incident to classify
 * @returns Classification result with category, severity, and risk level
 */
export async function classifyIncidentWithAI(incident: Incident): Promise<IncidentClassification> {
  // Simulate AI classification logic
  const description = incident.description.toLowerCase();
  
  // Determine category based on keywords
  let category = 'General';
  if (description.includes('fire') || description.includes('explosion')) {
    category = 'Fire Safety';
  } else if (description.includes('fall') || description.includes('height')) {
    category = 'Working at Heights';
  } else if (description.includes('chemical') || description.includes('spill')) {
    category = 'Chemical Safety';
  } else if (description.includes('equipment') || description.includes('machinery')) {
    category = 'Equipment Failure';
  } else if (description.includes('injury') || description.includes('hurt')) {
    category = 'Personal Injury';
  } else if (description.includes('environmental') || description.includes('pollution')) {
    category = 'Environmental';
  }

  // Determine severity based on keywords
  let severity: 'low' | 'medium' | 'high' | 'critical' = 'medium';
  let riskLevel = 50;
  
  if (description.includes('fatal') || description.includes('death') || description.includes('critical')) {
    severity = 'critical';
    riskLevel = 95;
  } else if (description.includes('serious') || description.includes('major') || description.includes('severe')) {
    severity = 'high';
    riskLevel = 75;
  } else if (description.includes('minor') || description.includes('small') || description.includes('negligible')) {
    severity = 'low';
    riskLevel = 25;
  }

  // Override with provided severity if available
  if (incident.severity) {
    const severityMap: Record<string, { level: 'low' | 'medium' | 'high' | 'critical', risk: number }> = {
      'low': { level: 'low', risk: 25 },
      'medium': { level: 'medium', risk: 50 },
      'high': { level: 'high', risk: 75 },
      'critical': { level: 'critical', risk: 95 }
    };
    const mapped = severityMap[incident.severity.toLowerCase()];
    if (mapped) {
      severity = mapped.level;
      riskLevel = mapped.risk;
    }
  }

  const confidence = 0.85 + Math.random() * 0.1; // Simulate 85-95% confidence

  return {
    category,
    severity,
    riskLevel,
    confidence,
    reasoning: `Incident classified as ${category} with ${severity} severity based on description analysis. Key factors: ${description.substring(0, 100)}...`
  };
}

/**
 * Forecasts risk levels based on historical data and patterns
 * @param incidents - Historical incidents to analyze
 * @returns Risk forecast with score, trend, and recommendations
 */
export async function forecastRisk(incidents: Incident[]): Promise<RiskForecast> {
  if (incidents.length === 0) {
    return {
      riskScore: 0,
      trend: 'stable',
      factors: ['No historical data available'],
      recommendations: ['Start collecting incident data for better analysis'],
      confidenceLevel: 0
    };
  }

  // Analyze incident frequency over time
  const recentIncidents = incidents.slice(-30); // Last 30 incidents
  const olderIncidents = incidents.slice(0, -30);
  
  const recentRate = recentIncidents.length / Math.max(1, incidents.length);
  const trend: 'increasing' | 'stable' | 'decreasing' = 
    recentRate > 0.6 ? 'increasing' :
    recentRate < 0.4 ? 'decreasing' : 'stable';

  // Calculate risk score
  let riskScore = 0;
  const highSeverityCount = incidents.filter(i => 
    i.severity === 'high' || i.severity === 'critical'
  ).length;
  
  riskScore = Math.min(100, (incidents.length * 2) + (highSeverityCount * 10));

  // Identify risk factors
  const factors: string[] = [];
  if (highSeverityCount > 0) {
    factors.push(`${highSeverityCount} high or critical severity incidents detected`);
  }
  if (trend === 'increasing') {
    factors.push('Incident frequency is increasing');
  }
  factors.push(`Total of ${incidents.length} incidents in historical data`);

  // Generate recommendations
  const recommendations: string[] = [];
  if (riskScore > 70) {
    recommendations.push('Immediate safety review recommended');
    recommendations.push('Implement additional safety training');
    recommendations.push('Review and update safety procedures');
  } else if (riskScore > 40) {
    recommendations.push('Schedule regular safety audits');
    recommendations.push('Monitor incident trends closely');
  } else {
    recommendations.push('Maintain current safety protocols');
    recommendations.push('Continue proactive safety measures');
  }

  return {
    riskScore,
    trend,
    factors,
    recommendations,
    confidenceLevel: Math.min(0.95, incidents.length / 100)
  };
}

/**
 * Generates corrective actions for an incident
 * @param incident - The incident requiring corrective action
 * @param classification - Optional classification to inform action generation
 * @returns Corrective action plan
 */
export async function generateCorrectiveAction(
  incident: Incident,
  classification?: IncidentClassification
): Promise<CorrectiveAction> {
  const severity = classification?.severity || incident.severity || 'medium';
  const category = classification?.category || 'General';
  
  // Determine priority
  const priorityMap: Record<string, 'low' | 'medium' | 'high' | 'urgent'> = {
    'low': 'low',
    'medium': 'medium',
    'high': 'high',
    'critical': 'urgent'
  };
  const priority = priorityMap[severity] || 'medium';

  // Generate action based on category
  let title = 'General Safety Review';
  let description = 'Conduct comprehensive safety review and implement corrective measures';
  let steps: string[] = [];
  let resources: string[] = ['Safety Officer', 'Documentation'];

  switch (category) {
    case 'Fire Safety':
      title = 'Fire Safety Enhancement';
      description = 'Review fire safety procedures and equipment';
      steps = [
        'Inspect fire safety equipment',
        'Review fire evacuation procedures',
        'Conduct fire drill',
        'Update fire safety training'
      ];
      resources = ['Fire Safety Officer', 'Fire Equipment', 'Training Materials'];
      break;
    
    case 'Working at Heights':
      title = 'Height Safety Protocol Review';
      description = 'Enhance working at heights safety measures';
      steps = [
        'Inspect fall protection equipment',
        'Review height safety procedures',
        'Conduct height safety training',
        'Verify anchor points and guardrails'
      ];
      resources = ['Safety Harnesses', 'Height Safety Inspector', 'Training Materials'];
      break;
    
    case 'Chemical Safety':
      title = 'Chemical Handling Improvement';
      description = 'Review and enhance chemical safety protocols';
      steps = [
        'Review Material Safety Data Sheets (MSDS)',
        'Inspect chemical storage areas',
        'Update chemical handling procedures',
        'Conduct chemical safety training'
      ];
      resources = ['MSDS Documents', 'PPE', 'Chemical Safety Officer'];
      break;
    
    default:
      steps = [
        'Investigate root cause',
        'Implement immediate safety measures',
        'Update safety procedures',
        'Conduct safety training',
        'Monitor effectiveness'
      ];
  }

  // Determine estimated duration based on severity
  const durationMap: Record<string, string> = {
    'low': '1-2 weeks',
    'medium': '2-4 weeks',
    'high': '1-2 months',
    'critical': 'Immediate - 1 month'
  };
  const estimatedDuration = durationMap[severity] || '2-4 weeks';

  return {
    title,
    description,
    priority,
    estimatedDuration,
    resources,
    steps
  };
}

/**
 * Processes non-conformity findings and generates action plans
 * @param nonConformity - The non-conformity to process
 * @returns Processing result with analysis and action plans
 */
export async function processNonConformity(nonConformity: NonConformity): Promise<NonConformityProcessing> {
  const description = nonConformity.description.toLowerCase();
  const standard = nonConformity.standard || 'General Standards';
  
  // Analyze the non-conformity
  const analysis = `Non-conformity identified: ${nonConformity.description}. ` +
    `This represents a deviation from ${standard} requirements. ` +
    `Severity: ${nonConformity.severity || 'Medium'}. Immediate action required to address.`;

  // Identify root causes
  const rootCause: string[] = [];
  if (description.includes('procedure') || description.includes('process')) {
    rootCause.push('Inadequate or unclear procedures');
  }
  if (description.includes('training') || description.includes('knowledge')) {
    rootCause.push('Insufficient training or awareness');
  }
  if (description.includes('equipment') || description.includes('tool')) {
    rootCause.push('Equipment malfunction or inadequacy');
  }
  if (description.includes('communication')) {
    rootCause.push('Communication breakdown');
  }
  if (rootCause.length === 0) {
    rootCause.push('To be determined through detailed investigation');
  }

  // Assess impact
  const impact = `This non-conformity may affect compliance with ${standard} and could lead to ` +
    `operational disruptions, safety risks, or regulatory penalties if not addressed promptly.`;

  // Generate corrective actions
  const correctiveActions: CorrectiveAction[] = [];
  
  // Primary corrective action
  correctiveActions.push({
    title: 'Immediate Corrective Measures',
    description: `Address the non-conformity identified in: ${nonConformity.description}`,
    priority: nonConformity.severity === 'critical' || nonConformity.severity === 'high' ? 'urgent' : 'high',
    estimatedDuration: '1-2 weeks',
    resources: ['Compliance Officer', 'Technical Team', 'Documentation'],
    steps: [
      'Conduct detailed investigation',
      'Implement immediate containment measures',
      'Document findings and actions',
      'Verify effectiveness of corrections'
    ]
  });

  // Secondary corrective action
  correctiveActions.push({
    title: 'Procedure Update and Training',
    description: 'Update relevant procedures and conduct training to prevent recurrence',
    priority: 'medium',
    estimatedDuration: '2-4 weeks',
    resources: ['Training Coordinator', 'Documentation Team', 'Subject Matter Experts'],
    steps: [
      'Review and update relevant procedures',
      'Develop training materials',
      'Conduct training sessions',
      'Verify understanding and competence'
    ]
  });

  // Preventive actions
  const preventiveActions = [
    'Implement regular compliance audits',
    'Enhance monitoring and reporting systems',
    'Strengthen training and awareness programs',
    'Review and update quality management system',
    'Establish continuous improvement processes'
  ];

  // Timeline
  const timeline = 'Immediate action required. Initial corrections: 1-2 weeks. ' +
    'Full implementation and verification: 4-6 weeks. Follow-up review: 3 months.';

  return {
    analysis,
    rootCause,
    impact,
    correctiveActions,
    preventiveActions,
    timeline
  };
}

/**
 * Analyzes patterns in incident data to identify trends (Bonus feature)
 * @param incidents - Historical incidents to analyze
 * @returns Pattern analysis results
 */
export async function analyzeIncidentPatterns(incidents: Incident[]): Promise<IncidentPattern[]> {
  if (incidents.length < 3) {
    return [{
      pattern: 'Insufficient data',
      frequency: 0,
      commonFactors: ['Need more incidents for pattern analysis'],
      affectedAreas: [],
      recommendations: ['Collect more incident data for meaningful pattern analysis'],
      trendAnalysis: 'Not enough data points for trend analysis'
    }];
  }

  const patterns: IncidentPattern[] = [];

  // Analyze by location
  const locationMap = new Map<string, Incident[]>();
  incidents.forEach(incident => {
    if (incident.location) {
      const existing = locationMap.get(incident.location) || [];
      existing.push(incident);
      locationMap.set(incident.location, existing);
    }
  });

  // Find locations with multiple incidents
  locationMap.forEach((locationIncidents, location) => {
    if (locationIncidents.length >= 2) {
      patterns.push({
        pattern: `Recurring incidents at ${location}`,
        frequency: locationIncidents.length,
        commonFactors: ['Location-specific risk factors'],
        affectedAreas: [location],
        recommendations: [
          `Conduct detailed safety assessment of ${location}`,
          'Implement location-specific safety measures',
          'Increase monitoring and supervision'
        ],
        trendAnalysis: `${locationIncidents.length} incidents recorded at this location`
      });
    }
  });

  // Analyze by type
  const typeMap = new Map<string, Incident[]>();
  incidents.forEach(incident => {
    if (incident.type) {
      const existing = typeMap.get(incident.type) || [];
      existing.push(incident);
      typeMap.set(incident.type, existing);
    }
  });

  typeMap.forEach((typeIncidents, type) => {
    if (typeIncidents.length >= 3) {
      patterns.push({
        pattern: `Multiple ${type} incidents`,
        frequency: typeIncidents.length,
        commonFactors: ['Similar incident characteristics'],
        affectedAreas: [...new Set(typeIncidents.map(i => i.location).filter(Boolean))] as string[],
        recommendations: [
          `Review and enhance ${type} safety protocols`,
          'Conduct targeted training sessions',
          'Implement additional preventive measures'
        ],
        trendAnalysis: `${type} incidents represent ${Math.round(typeIncidents.length / incidents.length * 100)}% of total incidents`
      });
    }
  });

  // Analyze by severity
  const highSeverityIncidents = incidents.filter(i => 
    i.severity === 'high' || i.severity === 'critical'
  );
  
  if (highSeverityIncidents.length >= 2) {
    patterns.push({
      pattern: 'High severity incident cluster',
      frequency: highSeverityIncidents.length,
      commonFactors: ['High-risk activities or conditions'],
      affectedAreas: [...new Set(highSeverityIncidents.map(i => i.location).filter(Boolean))] as string[],
      recommendations: [
        'Immediate comprehensive safety review',
        'Implement enhanced risk control measures',
        'Increase safety supervision and monitoring',
        'Review emergency response procedures'
      ],
      trendAnalysis: `${highSeverityIncidents.length} high/critical severity incidents require immediate attention`
    });
  }

  // If no significant patterns found
  if (patterns.length === 0) {
    patterns.push({
      pattern: 'No significant patterns detected',
      frequency: 0,
      commonFactors: ['Incidents appear isolated and unrelated'],
      affectedAreas: [],
      recommendations: [
        'Continue monitoring for emerging patterns',
        'Maintain current safety protocols',
        'Regular safety reviews and updates'
      ],
      trendAnalysis: 'Incident distribution shows no clear trends'
    });
  }

  return patterns;
}
