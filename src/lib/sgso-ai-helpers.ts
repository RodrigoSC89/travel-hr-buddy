/**
 * SGSO AI Helper Functions
 * AI-powered functions for SGSO safety system management
 */

export interface Incident {
  id?: string;
  description: string;
  severity?: string;
  type?: string;
  date?: Date;
  location?: string;
  vesselId?: string;
}

export interface RiskForecast {
  trend: 'increasing' | 'decreasing' | 'stable';
  confidence: number;
  predictedIncidents: number;
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface CorrectiveAction {
  priority: 'low' | 'medium' | 'high' | 'critical';
  actions: string[];
  timeline: string;
  responsible: string;
  expectedOutcome: string;
}

export interface NonConformity {
  type: string;
  severity: 'minor' | 'major' | 'critical';
  requiresImmediateAction: boolean;
  suggestedActions: string[];
  complianceStandard: string;
}

/**
 * Classifies incident severity using AI analysis
 * @param incident - The incident data to classify
 * @returns Severity classification with confidence score
 */
export async function classifyIncidentWithAI(incident: Incident): Promise<{
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  reasoning: string;
}> {
  // Simulate AI classification logic
  // In production, this would call OpenAI or similar API
  
  const description = incident.description.toLowerCase();
  
  // Critical keywords
  const criticalKeywords = ['morte', 'death', 'fatal', 'grave', 'serious injury', 'explosion', 'fire'];
  const highKeywords = ['lesão', 'injury', 'acidente', 'accident', 'vazamento', 'leak'];
  const mediumKeywords = ['quase', 'near miss', 'menor', 'minor', 'incidente'];
  
  let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
  let confidence = 0.5;
  let reasoning = 'Based on incident description analysis';
  
  if (criticalKeywords.some(keyword => description.includes(keyword))) {
    severity = 'critical';
    confidence = 0.95;
    reasoning = 'Contains critical safety indicators requiring immediate action';
  } else if (highKeywords.some(keyword => description.includes(keyword))) {
    severity = 'high';
    confidence = 0.85;
    reasoning = 'Contains high-risk safety indicators requiring prompt attention';
  } else if (mediumKeywords.some(keyword => description.includes(keyword))) {
    severity = 'medium';
    confidence = 0.75;
    reasoning = 'Moderate risk incident requiring standard procedures';
  } else {
    severity = 'low';
    confidence = 0.65;
    reasoning = 'Low risk incident for monitoring and preventive action';
  }
  
  return { severity, confidence, reasoning };
}

/**
 * Forecasts risk trends based on historical data
 * @param incidents - Historical incident data
 * @param timeframe - Number of days to analyze
 * @returns Risk forecast with recommendations
 */
export async function forecastRisk(
  incidents: Incident[],
  timeframe: number = 30
): Promise<RiskForecast> {
  // Simulate risk forecasting
  // In production, this would use ML models
  
  if (!incidents || incidents.length === 0) {
    return {
      trend: 'stable',
      confidence: 0.5,
      predictedIncidents: 0,
      recommendations: ['Insufficient data for accurate forecasting'],
      riskLevel: 'low'
    };
  }
  
  const recentIncidents = incidents.filter(inc => {
    if (!inc.date) return false;
    const daysDiff = (new Date().getTime() - new Date(inc.date).getTime()) / (1000 * 3600 * 24);
    return daysDiff <= timeframe;
  });
  
  const incidentRate = recentIncidents.length / timeframe;
  const criticalCount = recentIncidents.filter(inc => 
    inc.severity === 'critical' || inc.severity === 'high'
  ).length;
  
  let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
  let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
  let recommendations: string[] = [];
  
  if (incidentRate > 0.5) {
    trend = 'increasing';
    riskLevel = criticalCount > 2 ? 'critical' : 'high';
    recommendations = [
      'Immediate safety audit recommended',
      'Review and enhance safety protocols',
      'Increase crew safety training',
      'Consider operational restrictions'
    ];
  } else if (incidentRate > 0.2) {
    trend = 'stable';
    riskLevel = 'medium';
    recommendations = [
      'Maintain current safety measures',
      'Regular safety briefings',
      'Monitor trends closely'
    ];
  } else {
    trend = 'decreasing';
    riskLevel = 'low';
    recommendations = [
      'Continue current safety practices',
      'Document successful procedures',
      'Share best practices across fleet'
    ];
  }
  
  return {
    trend,
    confidence: 0.8,
    predictedIncidents: Math.ceil(incidentRate * 30),
    recommendations,
    riskLevel
  };
}

/**
 * Generates corrective action plan for incidents
 * @param incident - The incident requiring corrective action
 * @returns Detailed corrective action plan
 */
export async function generateCorrectiveAction(incident: Incident): Promise<CorrectiveAction> {
  // Simulate AI-generated corrective actions
  // In production, this would use GPT-4 or similar
  
  const classification = await classifyIncidentWithAI(incident);
  
  let priority: 'low' | 'medium' | 'high' | 'critical' = classification.severity;
  let actions: string[] = [];
  let timeline = '';
  let responsible = '';
  
  switch (classification.severity) {
    case 'critical':
      priority = 'critical';
      actions = [
        'Immediate incident investigation',
        'Isolate affected area',
        'Notify authorities and management',
        'Implement emergency procedures',
        'Conduct root cause analysis',
        'Develop prevention plan',
        'Review and update safety protocols'
      ];
      timeline = 'Immediate action required - 24 hours for initial response';
      responsible = 'Safety Manager + Operations Director';
      break;
      
    case 'high':
      priority = 'high';
      actions = [
        'Conduct detailed investigation',
        'Document incident thoroughly',
        'Identify contributing factors',
        'Develop action plan',
        'Implement preventive measures',
        'Train affected personnel'
      ];
      timeline = '48-72 hours for investigation and action plan';
      responsible = 'Safety Officer + Department Manager';
      break;
      
    case 'medium':
      priority = 'medium';
      actions = [
        'Review incident details',
        'Assess risk level',
        'Identify preventive measures',
        'Update procedures if needed',
        'Brief team on lessons learned'
      ];
      timeline = '1 week for complete response';
      responsible = 'Supervisor + Safety Coordinator';
      break;
      
    default:
      priority = 'low';
      actions = [
        'Document incident',
        'Review for patterns',
        'Update safety checklist',
        'Include in safety briefing'
      ];
      timeline = '2 weeks for documentation and review';
      responsible = 'Department Supervisor';
      break;
  }
  
  return {
    priority,
    actions,
    timeline,
    responsible,
    expectedOutcome: 'Prevent recurrence and improve safety culture'
  };
}

/**
 * Processes and analyzes non-conformity reports
 * @param description - Description of the non-conformity
 * @param standard - Compliance standard (SGSO, IMCA, ISO, etc.)
 * @returns Non-conformity analysis and recommendations
 */
export async function processNonConformity(
  description: string,
  standard: string = 'SGSO'
): Promise<NonConformity> {
  // Simulate AI-powered non-conformity analysis
  // In production, this would analyze against compliance databases
  
  const descLower = description.toLowerCase();
  
  let severity: 'minor' | 'major' | 'critical' = 'minor';
  let requiresImmediateAction = false;
  let suggestedActions: string[] = [];
  
  // Analyze severity
  const criticalIndicators = ['safety', 'environmental', 'regulatory', 'legal'];
  const majorIndicators = ['procedure', 'documentation', 'training', 'equipment'];
  
  if (criticalIndicators.some(indicator => descLower.includes(indicator))) {
    severity = 'critical';
    requiresImmediateAction = true;
    suggestedActions = [
      'Immediate corrective action required',
      'Notify compliance officer',
      'Document non-conformity in detail',
      'Implement interim controls',
      'Schedule external audit',
      'Review related procedures'
    ];
  } else if (majorIndicators.some(indicator => descLower.includes(indicator))) {
    severity = 'major';
    requiresImmediateAction = false;
    suggestedActions = [
      'Conduct gap analysis',
      'Develop corrective action plan',
      'Update relevant documentation',
      'Provide additional training',
      'Monitor for recurrence'
    ];
  } else {
    severity = 'minor';
    requiresImmediateAction = false;
    suggestedActions = [
      'Document observation',
      'Review during next audit cycle',
      'Consider process improvement',
      'Update checklist if applicable'
    ];
  }
  
  return {
    type: descLower.includes('documentation') ? 'Documentation' : 
          descLower.includes('procedure') ? 'Procedure' : 
          descLower.includes('training') ? 'Training' : 'General',
    severity,
    requiresImmediateAction,
    suggestedActions,
    complianceStandard: standard
  };
}

/**
 * Analyzes incident patterns and identifies trends
 * @param incidents - Historical incident data
 * @returns Pattern analysis results
 */
export async function analyzeIncidentPatterns(incidents: Incident[]): Promise<{
  commonTypes: string[];
  hotspots: string[];
  timePatterns: string[];
  recommendations: string[];
}> {
  if (!incidents || incidents.length === 0) {
    return {
      commonTypes: [],
      hotspots: [],
      timePatterns: [],
      recommendations: ['Insufficient data for pattern analysis']
    };
  }
  
  // Analyze incident types
  const typeCount: Record<string, number> = {};
  const locationCount: Record<string, number> = {};
  
  incidents.forEach(inc => {
    if (inc.type) {
      typeCount[inc.type] = (typeCount[inc.type] || 0) + 1;
    }
    if (inc.location) {
      locationCount[inc.location] = (locationCount[inc.location] || 0) + 1;
    }
  });
  
  const commonTypes = Object.entries(typeCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([type]) => type);
    
  const hotspots = Object.entries(locationCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([location]) => location);
  
  return {
    commonTypes,
    hotspots,
    timePatterns: ['Pattern analysis requires time-series data'],
    recommendations: [
      `Focus safety measures on: ${commonTypes.join(', ')}`,
      `Increase monitoring in: ${hotspots.join(', ')}`,
      'Conduct targeted training for high-frequency incident types'
    ]
  };
}
