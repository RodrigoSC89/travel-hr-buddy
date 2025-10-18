/**
 * SGSO AI Helper Functions
 * Provides AI-powered analysis and recommendations for safety management
 */

export interface Incident {
  id: string;
  title: string;
  description: string;
  severity?: string;
  category?: string;
  [key: string]: any;
}

export interface IncidentClassification {
  severity: 'low' | 'medium' | 'high' | 'critical';
  risk_level: number; // 1-10
  category: string;
  recommendations: string[];
}

export interface RiskForecast {
  trend: 'increasing' | 'stable' | 'decreasing';
  confidence: number; // 0-1
  predicted_incidents: number;
  risk_factors: string[];
}

export interface CorrectiveAction {
  action: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimated_time: string;
  responsible_party: string;
  resources_needed: string[];
}

export interface NonConformity {
  gap: string;
  severity: 'minor' | 'major' | 'critical';
  compliance_standard: string;
  remediation_steps: string[];
}

/**
 * Classifies an incident using AI-powered analysis
 * @param incident - The incident to classify
 * @returns Classification with severity, risk level, and recommendations
 */
export async function classifyIncidentWithAI(incident: Incident): Promise<IncidentClassification> {
  // In a real implementation, this would call an AI service
  // For now, we'll use rule-based logic as fallback
  
  const description = incident.description?.toLowerCase() || '';
  const title = incident.title?.toLowerCase() || '';
  
  let severity: IncidentClassification['severity'] = 'low';
  let risk_level = 1;
  let category = 'General';
  const recommendations: string[] = [];

  // Critical keywords
  if (description.includes('fatal') || description.includes('death') || 
      description.includes('critical') || title.includes('critical')) {
    severity = 'critical';
    risk_level = 10;
    category = 'Critical Safety';
    recommendations.push('Immediate investigation required');
    recommendations.push('Notify management and authorities');
    recommendations.push('Implement emergency protocols');
  }
  // High severity keywords
  else if (description.includes('injury') || description.includes('damage') || 
           description.includes('failure') || title.includes('equipment failure')) {
    severity = 'high';
    risk_level = 7;
    category = 'Safety Incident';
    recommendations.push('Conduct thorough investigation');
    recommendations.push('Review safety procedures');
    recommendations.push('Provide additional training');
  }
  // Medium severity keywords
  else if (description.includes('risk') || description.includes('hazard') || 
           description.includes('near miss')) {
    severity = 'medium';
    risk_level = 5;
    category = 'Near Miss';
    recommendations.push('Document incident details');
    recommendations.push('Assess preventive measures');
    recommendations.push('Update risk assessment');
  }
  // Low severity (default)
  else {
    severity = 'low';
    risk_level = 2;
    category = 'Minor Incident';
    recommendations.push('Record for future reference');
    recommendations.push('Monitor for patterns');
  }

  return {
    severity,
    risk_level,
    category,
    recommendations,
  };
}

/**
 * Forecasts risk trends based on historical data
 * @param historicalData - Array of past incidents
 * @returns Risk forecast with trend and predictions
 */
export async function forecastRisk(historicalData: Incident[]): Promise<RiskForecast> {
  // Analyze historical data to predict future risk
  const recentIncidents = historicalData.slice(-30); // Last 30 incidents
  const olderIncidents = historicalData.slice(-60, -30); // Previous 30 incidents
  
  let trend: RiskForecast['trend'] = 'stable';
  let predicted_incidents = recentIncidents.length;
  const risk_factors: string[] = [];

  if (recentIncidents.length > olderIncidents.length * 1.2) {
    trend = 'increasing';
    predicted_incidents = Math.ceil(recentIncidents.length * 1.3);
    risk_factors.push('Increasing incident frequency');
    risk_factors.push('Consider enhanced safety measures');
  } else if (recentIncidents.length < olderIncidents.length * 0.8) {
    trend = 'decreasing';
    predicted_incidents = Math.floor(recentIncidents.length * 0.8);
    risk_factors.push('Positive trend in safety');
    risk_factors.push('Maintain current protocols');
  } else {
    trend = 'stable';
    risk_factors.push('Consistent incident rate');
    risk_factors.push('Continue monitoring');
  }

  const confidence = Math.min(0.95, 0.5 + (historicalData.length / 100) * 0.45);

  return {
    trend,
    confidence,
    predicted_incidents,
    risk_factors,
  };
}

/**
 * Generates corrective actions based on incident analysis
 * @param incident - The incident requiring corrective action
 * @returns Corrective action plan
 */
export async function generateCorrectiveAction(incident: Incident): Promise<CorrectiveAction> {
  const classification = await classifyIncidentWithAI(incident);
  
  let action = 'Review incident and implement corrective measures';
  let priority: CorrectiveAction['priority'] = 'low';
  let estimated_time = '1 week';
  let responsible_party = 'Safety Officer';
  const resources_needed: string[] = [];

  if (classification.severity === 'critical') {
    action = 'Immediate safety intervention and root cause analysis';
    priority = 'urgent';
    estimated_time = '24 hours';
    responsible_party = 'Management Team';
    resources_needed.push('Emergency response team');
    resources_needed.push('Investigation specialists');
    resources_needed.push('Legal consultation');
  } else if (classification.severity === 'high') {
    action = 'Comprehensive investigation and preventive measures';
    priority = 'high';
    estimated_time = '3 days';
    responsible_party = 'Safety Manager';
    resources_needed.push('Safety inspection team');
    resources_needed.push('Training resources');
  } else if (classification.severity === 'medium') {
    action = 'Assess risks and implement preventive controls';
    priority = 'medium';
    estimated_time = '1 week';
    responsible_party = 'Safety Officer';
    resources_needed.push('Risk assessment tools');
  } else {
    action = 'Document and monitor for patterns';
    priority = 'low';
    estimated_time = '2 weeks';
    responsible_party = 'Safety Coordinator';
    resources_needed.push('Documentation system');
  }

  return {
    action,
    priority,
    estimated_time,
    responsible_party,
    resources_needed,
  };
}

/**
 * Processes non-conformity and suggests remediation
 * @param description - Description of the non-conformity
 * @param standard - Compliance standard reference
 * @returns Non-conformity analysis with remediation steps
 */
export async function processNonConformity(
  description: string, 
  standard: string
): Promise<NonConformity> {
  const lowerDesc = description.toLowerCase();
  
  let severity: NonConformity['severity'] = 'minor';
  let gap = 'Non-conformity identified';
  const remediation_steps: string[] = [];

  // Determine severity based on description
  if (lowerDesc.includes('critical') || lowerDesc.includes('major violation') || 
      lowerDesc.includes('safety breach')) {
    severity = 'critical';
    gap = 'Critical compliance gap requiring immediate attention';
    remediation_steps.push('Immediate corrective action required');
    remediation_steps.push('Notify regulatory authorities if required');
    remediation_steps.push('Implement emergency compliance measures');
    remediation_steps.push('Conduct root cause analysis');
    remediation_steps.push('Develop comprehensive action plan');
  } else if (lowerDesc.includes('significant') || lowerDesc.includes('repeated') || 
             lowerDesc.includes('major')) {
    severity = 'major';
    gap = 'Significant compliance gap identified';
    remediation_steps.push('Develop corrective action plan');
    remediation_steps.push('Allocate necessary resources');
    remediation_steps.push('Implement monitoring procedures');
    remediation_steps.push('Provide staff training');
  } else {
    severity = 'minor';
    gap = 'Minor compliance gap requiring attention';
    remediation_steps.push('Review compliance requirements');
    remediation_steps.push('Update procedures as needed');
    remediation_steps.push('Document corrective actions');
  }

  return {
    gap,
    severity,
    compliance_standard: standard,
    remediation_steps,
  };
}
