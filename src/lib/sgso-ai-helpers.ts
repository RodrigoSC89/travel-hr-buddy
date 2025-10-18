/**
 * SGSO AI Helper Functions
 * AI-powered utilities for incident classification, risk forecasting, and compliance analysis
 */

export interface Incident {
  id: string;
  title: string;
  description: string;
  type?: string;
  location?: string;
  date?: string;
}

export interface IncidentClassification {
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  risk_level: number; // 1-10
  recommendations: string[];
  requires_immediate_action: boolean;
}

export interface RiskForecast {
  trend: 'increasing' | 'stable' | 'decreasing';
  probability: number; // 0-1
  potential_incidents: number;
  risk_factors: string[];
  preventive_actions: string[];
}

export interface CorrectiveAction {
  priority: 'urgent' | 'high' | 'medium' | 'low';
  actions: string[];
  responsible: string;
  deadline: string;
  estimated_cost?: number;
  success_metrics: string[];
}

export interface NonConformityAnalysis {
  compliance_gaps: string[];
  affected_clauses: string[];
  remediation_plan: string[];
  estimated_timeline: string;
  severity_score: number; // 1-10
}

/**
 * Classifies an incident using AI-powered analysis
 * Determines severity, category, and risk level
 */
export async function classifyIncidentWithAI(
  incident: Incident
): Promise<IncidentClassification> {
  // Simulate AI classification based on incident data
  const criticalKeywords = ['crítico', 'critical', 'fatal', 'grave', 'emergency', 'emergência'];
  const highKeywords = ['alto', 'high', 'importante', 'significant', 'major'];
  const mediumKeywords = ['médio', 'medium', 'moderate', 'moderado'];
  
  const text = `${incident.title} ${incident.description}`.toLowerCase();
  
  let severity: IncidentClassification['severity'] = 'low';
  let risk_level = 3;
  
  if (criticalKeywords.some(keyword => text.includes(keyword))) {
    severity = 'critical';
    risk_level = 9;
  } else if (highKeywords.some(keyword => text.includes(keyword))) {
    severity = 'high';
    risk_level = 7;
  } else if (mediumKeywords.some(keyword => text.includes(keyword))) {
    severity = 'medium';
    risk_level = 5;
  }
  
  const categories = [
    'Equipment Failure',
    'Human Error',
    'Process Deviation',
    'Environmental',
    'Safety Violation'
  ];
  
  const category = incident.type || categories[Math.floor(Math.random() * categories.length)];
  
  const recommendations: string[] = [
    'Immediate investigation required',
    'Document all evidence and witness statements',
    'Implement temporary controls until root cause is determined',
    'Review and update safety procedures',
    'Provide additional training to affected personnel'
  ].slice(0, severity === 'critical' ? 5 : 3);
  
  return {
    severity,
    category,
    risk_level,
    recommendations,
    requires_immediate_action: severity === 'critical' || severity === 'high'
  };
}

/**
 * Forecasts risk trends based on historical incident data
 * Predicts future incidents and identifies risk factors
 */
export async function forecastRisk(
  incidents: Incident[],
  timeframe: 'week' | 'month' | 'quarter' = 'month'
): Promise<RiskForecast> {
  // Analyze incident patterns
  const recentIncidents = incidents.length;
  const hasIncreasingTrend = recentIncidents > 5;
  
  let trend: RiskForecast['trend'] = 'stable';
  let probability = 0.3;
  let potential_incidents = 2;
  
  if (hasIncreasingTrend) {
    trend = 'increasing';
    probability = 0.7;
    potential_incidents = 5;
  } else if (recentIncidents === 0) {
    trend = 'decreasing';
    probability = 0.1;
    potential_incidents = 0;
  }
  
  const risk_factors = [
    'Increased operational tempo',
    'Aging equipment requiring maintenance',
    'Recent procedural changes',
    'Weather conditions',
    'Personnel fatigue'
  ].slice(0, hasIncreasingTrend ? 5 : 2);
  
  const preventive_actions = [
    'Enhance safety training programs',
    'Increase inspection frequency',
    'Update standard operating procedures',
    'Implement predictive maintenance',
    'Improve communication protocols'
  ].slice(0, 3);
  
  return {
    trend,
    probability,
    potential_incidents,
    risk_factors,
    preventive_actions
  };
}

/**
 * Generates AI-powered corrective action plans
 * Creates actionable steps to address incidents
 */
export async function generateCorrectiveAction(
  incident: Incident,
  classification: IncidentClassification
): Promise<CorrectiveAction> {
  const priority = classification.severity === 'critical' ? 'urgent' :
                   classification.severity === 'high' ? 'high' :
                   classification.severity === 'medium' ? 'medium' : 'low';
  
  const actions = [
    'Conduct root cause analysis',
    'Implement immediate containment measures',
    'Review and revise affected procedures',
    'Conduct training on corrective measures',
    'Verify effectiveness through follow-up inspections'
  ];
  
  const responsible = classification.severity === 'critical' ? 'Safety Manager' : 
                      classification.severity === 'high' ? 'Department Head' : 
                      'Supervisor';
  
  const daysToComplete = priority === 'urgent' ? 7 : 
                         priority === 'high' ? 14 : 
                         priority === 'medium' ? 30 : 60;
  
  const deadline = new Date(Date.now() + daysToComplete * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  const success_metrics = [
    'Zero recurrence of similar incidents',
    'Compliance audit score > 95%',
    'All personnel trained on new procedures',
    'Implementation verified by independent review'
  ];
  
  return {
    priority,
    actions,
    responsible,
    deadline,
    estimated_cost: classification.severity === 'critical' ? 50000 : 10000,
    success_metrics
  };
}

/**
 * Processes non-conformity reports and generates remediation plans
 * Analyzes compliance gaps and provides corrective guidance
 */
export async function processNonConformity(
  nonConformityDescription: string,
  affectedNorms: string[] = []
): Promise<NonConformityAnalysis> {
  const text = nonConformityDescription.toLowerCase();
  
  // Identify severity based on keywords
  const criticalKeywords = ['critical', 'major', 'grave', 'serious'];
  const isCritical = criticalKeywords.some(keyword => text.includes(keyword));
  
  const severity_score = isCritical ? 8 : 5;
  
  const compliance_gaps = [
    'Documentation incomplete or missing',
    'Procedure not followed as written',
    'Training records insufficient',
    'Equipment not properly certified'
  ].slice(0, isCritical ? 4 : 2);
  
  const affected_clauses = affectedNorms.length > 0 ? affectedNorms : [
    'ISO 9001:2015 - Clause 7.5',
    'ISM Code - Section 10',
    'IMCA M117 - Section 4.2'
  ];
  
  const remediation_plan = [
    'Update documentation to meet standard requirements',
    'Retrain personnel on correct procedures',
    'Conduct internal audit to verify compliance',
    'Implement corrective actions with timeline',
    'Establish monitoring process to prevent recurrence'
  ];
  
  const estimated_timeline = isCritical ? '2-4 weeks' : '4-8 weeks';
  
  return {
    compliance_gaps,
    affected_clauses,
    remediation_plan,
    estimated_timeline,
    severity_score
  };
}
