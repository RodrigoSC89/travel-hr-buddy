/**
 * PSC Score Calculator
 * Calculates compliance scores based on PSC checklist findings
 */

export interface PSCFinding {
  category: string;
  item: string;
  status: 'compliant' | 'non-compliant' | 'observation' | 'not-applicable';
  severity?: 'low' | 'medium' | 'high' | 'critical';
  description?: string;
}

export interface PSCScoreResult {
  overallScore: number;
  categoryScores: Record<string, number>;
  totalItems: number;
  compliantItems: number;
  nonCompliantItems: number;
  criticalFindings: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
}

/**
 * Weight factors for different severity levels
 */
const SEVERITY_WEIGHTS = {
  low: 1,
  medium: 2,
  high: 4,
  critical: 10,
};

/**
 * Risk thresholds based on score
 */
const RISK_THRESHOLDS = {
  low: 90,
  medium: 75,
  high: 60,
};

/**
 * Calculate PSC compliance score from findings
 */
export function calculatePSCScore(findings: PSCFinding[]): PSCScoreResult {
  const applicableFindings = findings.filter(f => f.status !== 'not-applicable');
  const totalItems = applicableFindings.length;
  
  if (totalItems === 0) {
    return {
      overallScore: 100,
      categoryScores: {},
      totalItems: 0,
      compliantItems: 0,
      nonCompliantItems: 0,
      criticalFindings: 0,
      riskLevel: 'low',
      recommendations: ['No findings to evaluate'],
    };
  }

  // Count compliant and non-compliant items
  const compliantItems = applicableFindings.filter(f => f.status === 'compliant').length;
  const nonCompliantItems = applicableFindings.filter(f => f.status === 'non-compliant').length;
  const criticalFindings = applicableFindings.filter(
    f => f.status === 'non-compliant' && f.severity === 'critical'
  ).length;

  // Calculate weighted score
  let totalWeight = 0;
  let achievedWeight = 0;

  applicableFindings.forEach(finding => {
    const severity = finding.severity || 'low';
    const weight = SEVERITY_WEIGHTS[severity];
    totalWeight += weight;
    
    if (finding.status === 'compliant') {
      achievedWeight += weight;
    } else if (finding.status === 'observation') {
      achievedWeight += weight * 0.5; // Partial credit for observations
    }
  });

  const overallScore = totalWeight > 0 ? Math.round((achievedWeight / totalWeight) * 100) : 100;

  // Calculate category scores
  const categoryScores: Record<string, number> = {};
  const categoriesMap = new Map<string, PSCFinding[]>();

  applicableFindings.forEach(finding => {
    if (!categoriesMap.has(finding.category)) {
      categoriesMap.set(finding.category, []);
    }
    categoriesMap.get(finding.category)!.push(finding);
  });

  categoriesMap.forEach((categoryFindings, category) => {
    let catWeight = 0;
    let catAchieved = 0;

    categoryFindings.forEach(finding => {
      const severity = finding.severity || 'low';
      const weight = SEVERITY_WEIGHTS[severity];
      catWeight += weight;
      
      if (finding.status === 'compliant') {
        catAchieved += weight;
      } else if (finding.status === 'observation') {
        catAchieved += weight * 0.5;
      }
    });

    categoryScores[category] = catWeight > 0 ? Math.round((catAchieved / catWeight) * 100) : 100;
  });

  // Determine risk level
  let riskLevel: 'low' | 'medium' | 'high' | 'critical';
  
  if (criticalFindings > 0) {
    riskLevel = 'critical';
  } else if (overallScore >= RISK_THRESHOLDS.low) {
    riskLevel = 'low';
  } else if (overallScore >= RISK_THRESHOLDS.medium) {
    riskLevel = 'medium';
  } else if (overallScore >= RISK_THRESHOLDS.high) {
    riskLevel = 'high';
  } else {
    riskLevel = 'critical';
  }

  // Generate recommendations
  const recommendations = generateRecommendations(
    findings,
    overallScore,
    criticalFindings,
    nonCompliantItems
  );

  return {
    overallScore,
    categoryScores,
    totalItems,
    compliantItems,
    nonCompliantItems,
    criticalFindings,
    riskLevel,
    recommendations,
  };
}

/**
 * Generate actionable recommendations based on findings
 */
function generateRecommendations(
  findings: PSCFinding[],
  score: number,
  criticalFindings: number,
  nonCompliantItems: number
): string[] {
  const recommendations: string[] = [];

  // Critical findings recommendations
  if (criticalFindings > 0) {
    recommendations.push(
      `URGENT: ${criticalFindings} critical finding(s) detected. Immediate corrective action required before PSC inspection.`
    );
  }

  // Score-based recommendations
  if (score < 60) {
    recommendations.push(
      'Score is below acceptable threshold. Comprehensive review and remediation required across all categories.'
    );
  } else if (score < 75) {
    recommendations.push(
      'Score indicates moderate risk. Focus on addressing high-priority non-compliant items.'
    );
  } else if (score < 90) {
    recommendations.push(
      'Score is acceptable but can be improved. Review and address remaining non-compliant items.'
    );
  }

  // Category-specific recommendations
  const categoryIssues = new Map<string, number>();
  findings
    .filter(f => f.status === 'non-compliant' && f.status !== 'not-applicable')
    .forEach(finding => {
      const count = categoryIssues.get(finding.category) || 0;
      categoryIssues.set(finding.category, count + 1);
    });

  const sortedCategories = Array.from(categoryIssues.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  if (sortedCategories.length > 0) {
    recommendations.push(
      `Priority areas for improvement: ${sortedCategories.map(([cat, count]) => `${cat} (${count} issues)`).join(', ')}`
    );
  }

  // General recommendations
  if (nonCompliantItems > 0) {
    recommendations.push(
      'Ensure all documentation is up-to-date and readily available for inspection.'
    );
    recommendations.push(
      'Conduct crew briefing on PSC procedures and common inspection focus areas.'
    );
  }

  if (recommendations.length === 0) {
    recommendations.push(
      'Excellent compliance score! Maintain current standards and continue regular audits.'
    );
  }

  return recommendations;
}

/**
 * Get risk color for UI display
 */
export function getRiskColor(riskLevel: string): string {
  switch (riskLevel) {
    case 'low':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'medium':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'high':
      return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'critical':
      return 'text-red-600 bg-red-50 border-red-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
}

/**
 * Get score display color
 */
export function getScoreColor(score: number): string {
  if (score >= 90) return 'text-green-600';
  if (score >= 75) return 'text-yellow-600';
  if (score >= 60) return 'text-orange-600';
  return 'text-red-600';
}
