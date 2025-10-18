/**
 * AI Helper Functions for SGSO (Sistema de Gestão de Segurança Operacional)
 * These functions use AI to analyze incidents, forecast risks, generate corrective actions,
 * and process non-conformities.
 */

export interface Incident {
  id: string;
  title: string;
  description: string;
  severity?: string;
  category?: string;
  date?: Date;
}

export interface IncidentClassification {
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  risk_level: number;
  recommendations: string[];
  confidence: number;
}

export interface RiskForecast {
  risk_score: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  predicted_incidents: number;
  timeframe: string;
  factors: string[];
}

export interface CorrectiveAction {
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actions: string[];
  responsible: string;
  deadline: string;
  resources_needed: string[];
}

export interface NonConformity {
  id: string;
  norm: string;
  clause: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved';
}

export interface NonConformityProcessing {
  severity: string;
  impact_assessment: string;
  corrective_plan: string[];
  preventive_measures: string[];
  compliance_gap: number;
}

/**
 * Classifies an incident using AI analysis
 * Analyzes the incident description and determines severity, category, and risk level
 */
export async function classifyIncidentWithAI(incident: Incident): Promise<IncidentClassification> {
  // Simulate AI classification
  // In production, this would call OpenAI API
  
  const description = incident.description.toLowerCase();
  
  // Simple heuristic-based classification
  let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
  let risk_level = 1;
  
  if (description.includes('fatal') || description.includes('death') || description.includes('critical')) {
    severity = 'critical';
    risk_level = 10;
  } else if (description.includes('injury') || description.includes('damage') || description.includes('serious')) {
    severity = 'high';
    risk_level = 7;
  } else if (description.includes('minor') || description.includes('near miss')) {
    severity = 'medium';
    risk_level = 4;
  }
  
  // Determine category
  let category = 'General';
  if (description.includes('equipment') || description.includes('machinery')) {
    category = 'Equipment Failure';
  } else if (description.includes('personnel') || description.includes('crew')) {
    category = 'Human Factor';
  } else if (description.includes('environment') || description.includes('weather')) {
    category = 'Environmental';
  } else if (description.includes('procedure') || description.includes('protocol')) {
    category = 'Procedural';
  }
  
  const recommendations = [
    'Conduct thorough investigation',
    'Review and update safety procedures',
    'Provide additional training to crew',
    'Implement preventive measures',
  ].slice(0, severity === 'critical' ? 4 : 2);
  
  return {
    severity,
    category,
    risk_level,
    recommendations,
    confidence: 0.85,
  };
}

/**
 * Forecasts risk levels based on historical incident data
 * Uses AI to predict future incidents and risk trends
 */
export async function forecastRisk(incidents: Incident[], timeframe: string = '30 days'): Promise<RiskForecast> {
  // Simulate AI risk forecasting
  // In production, this would use machine learning models
  
  if (!incidents || incidents.length === 0) {
    return {
      risk_score: 0,
      trend: 'stable',
      predicted_incidents: 0,
      timeframe,
      factors: ['No historical data available'],
    };
  }
  
  // Calculate trend based on incident frequency
  // Compare most recent third with oldest third (ignore middle third)
  const thirdSize = Math.max(1, Math.floor(incidents.length / 3));
  const recentPeriod = incidents.slice(0, thirdSize);
  const olderPeriod = incidents.slice(-thirdSize);
  
  // Compare counts to determine trend (should be equal by design, so use rate over time)
  // Since we're comparing equal-sized windows, more recent density = increasing
  // For simplicity, just compare if we have more incidents in first half vs second half
  const halfPoint = Math.ceil(incidents.length / 2);
  const firstHalf = incidents.slice(0, halfPoint);
  const secondHalf = incidents.slice(halfPoint);
  
  const trend = firstHalf.length > secondHalf.length ? 'increasing' : 
                firstHalf.length < secondHalf.length ? 'decreasing' : 'stable';
  
  // Calculate risk score (0-100)
  const risk_score = Math.min(100, (incidents.length / 10) * 50 + (firstHalf.length * 5));
  
  // Predict future incidents based on trend
  const predicted_incidents = trend === 'increasing' ? Math.ceil(firstHalf.length * 1.2) :
                             trend === 'decreasing' ? Math.floor(firstHalf.length * 0.8) :
                             firstHalf.length;
  
  const factors = [
    'Historical incident frequency',
    'Recent incident trends',
    'Seasonal patterns',
    'Operational complexity',
  ];
  
  return {
    risk_score: Math.round(risk_score),
    trend,
    predicted_incidents,
    timeframe,
    factors,
  };
}

/**
 * Generates corrective actions based on incident analysis
 * Uses AI to recommend specific actions to prevent recurrence
 */
export async function generateCorrectiveAction(incident: Incident, classification: IncidentClassification): Promise<CorrectiveAction> {
  // Simulate AI-generated corrective actions
  // In production, this would call OpenAI API with specific prompts
  
  const actions: string[] = [];
  const resources_needed: string[] = [];
  
  // Generate actions based on severity
  if (classification.severity === 'critical' || classification.severity === 'high') {
    actions.push('Immediate investigation by safety committee');
    actions.push('Suspend similar operations until review is complete');
    actions.push('Implement emergency safety protocols');
    resources_needed.push('Safety investigation team');
    resources_needed.push('External audit if necessary');
  }
  
  actions.push('Document incident with detailed evidence');
  actions.push('Update safety procedures and protocols');
  actions.push('Conduct crew training on identified risks');
  actions.push('Schedule follow-up inspections');
  
  resources_needed.push('Training materials');
  resources_needed.push('Updated safety documentation');
  
  // Determine priority and deadline
  const priority = classification.severity === 'critical' ? 'urgent' :
                  classification.severity === 'high' ? 'high' :
                  classification.severity === 'medium' ? 'medium' : 'low';
  
  const deadline = priority === 'urgent' ? '24 hours' :
                  priority === 'high' ? '7 days' :
                  priority === 'medium' ? '30 days' : '90 days';
  
  return {
    priority,
    actions,
    responsible: 'Safety Manager',
    deadline,
    resources_needed,
  };
}

/**
 * Processes non-conformity reports and generates compliance plans
 * Uses AI to assess impact and create action plans
 */
export async function processNonConformity(nonConformity: NonConformity): Promise<NonConformityProcessing> {
  // Simulate AI processing of non-conformity
  // In production, this would analyze against specific norms (IMCA, ISO, etc.)
  
  const description = nonConformity.description.toLowerCase();
  
  // Assess severity
  let severity = 'Minor';
  if (description.includes('critical') || description.includes('major')) {
    severity = 'Major';
  } else if (description.includes('significant') || description.includes('important')) {
    severity = 'Significant';
  }
  
  // Generate impact assessment
  const impact_assessment = `Non-conformity with ${nonConformity.norm} clause ${nonConformity.clause} ` +
    `has been identified. This is classified as ${severity} and requires immediate attention to maintain compliance.`;
  
  // Generate corrective plan
  const corrective_plan = [
    `Review requirements of ${nonConformity.norm} clause ${nonConformity.clause}`,
    'Conduct gap analysis between current and required state',
    'Develop detailed action plan with timelines',
    'Assign responsible parties for each action item',
    'Implement corrective measures',
    'Verify effectiveness of corrections',
  ];
  
  // Generate preventive measures
  const preventive_measures = [
    'Establish regular compliance audits',
    'Update standard operating procedures',
    'Provide training on compliance requirements',
    'Implement monitoring and reporting system',
    'Schedule periodic reviews of compliance status',
  ];
  
  // Calculate compliance gap (0-100, where 0 is fully compliant)
  const compliance_gap = severity === 'Major' ? 75 : severity === 'Significant' ? 50 : 25;
  
  return {
    severity,
    impact_assessment,
    corrective_plan,
    preventive_measures,
    compliance_gap,
  };
}
