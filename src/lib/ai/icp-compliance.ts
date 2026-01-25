/**
 * ICP - Intelligent Compliance Predictor
 * Machine learning-based compliance prediction and risk assessment
 * NAUTILUS ONE v4.0 - Autonomous Platform
 */

export interface ComplianceRecord {
  id: string;
  vesselId: string;
  checkType: 'MLC' | 'STCW' | 'ISM' | 'ISPS' | 'MARPOL' | 'SOLAS';
  status: 'compliant' | 'non_compliant' | 'pending' | 'expired';
  score: number; // 0-100
  findings: ComplianceFinding[];
  inspectionDate: Date;
  expirationDate: Date;
  metadata: Record<string, unknown>;
}

export interface ComplianceFinding {
  id: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  resolvedAt?: Date;
}

export interface RiskPrediction {
  vesselId: string;
  overallRisk: number; // 0-1
  categoryRisks: Map<string, number>;
  predictedIssues: PredictedIssue[];
  confidence: number;
  validUntil: Date;
}

export interface PredictedIssue {
  category: string;
  probability: number;
  timeframe: string;
  suggestedAction: string;
  estimatedImpact: 'low' | 'medium' | 'high';
}

export interface ComplianceTrend {
  period: string;
  avgScore: number;
  issueCount: number;
  resolvedCount: number;
  trend: 'improving' | 'stable' | 'declining';
}

/**
 * ICP - Intelligent Compliance Predictor
 */
export class ICPCompliancePredictor {
  private complianceHistory: ComplianceRecord[] = [];
  private modelWeights: Map<string, number[]> = new Map();
  private categoryBaselines: Map<string, number> = new Map();

  constructor() {
    this.initializeBaselines();
    this.loadState();
  }

  /**
   * Initialize category baselines from industry standards
   */
  private initializeBaselines(): void {
    this.categoryBaselines.set('MLC', 0.92);
    this.categoryBaselines.set('STCW', 0.95);
    this.categoryBaselines.set('ISM', 0.90);
    this.categoryBaselines.set('ISPS', 0.93);
    this.categoryBaselines.set('MARPOL', 0.88);
    this.categoryBaselines.set('SOLAS', 0.91);
  }

  /**
   * Add compliance record for training/analysis
   */
  addComplianceRecord(record: ComplianceRecord): void {
    this.complianceHistory.push(record);
    this.updateModel(record);
    this.saveState();
  }

  /**
   * Update predictive model with new data
   */
  private updateModel(record: ComplianceRecord): void {
    const { checkType, score, findings } = record;
    
    let weights = this.modelWeights.get(checkType);
    if (!weights) {
      weights = [0.3, 0.3, 0.2, 0.2]; // [historical_weight, severity_weight, time_weight, pattern_weight]
      this.modelWeights.set(checkType, weights);
    }

    // Adjust weights based on prediction accuracy
    const baseline = this.categoryBaselines.get(checkType) || 0.9;
    const normalizedScore = score / 100;
    const error = Math.abs(baseline - normalizedScore);

    // Simple weight adjustment
    if (error > 0.1) {
      weights[0] *= 0.98; // Reduce historical weight if error is high
      weights[1] *= 1.02; // Increase severity weight
    }

    // Normalize weights
    const sum = weights.reduce((a, b) => a + b, 0);
    this.modelWeights.set(checkType, weights.map(w => w / sum));
  }

  /**
   * Predict compliance risk for a vessel
   */
  predictRisk(vesselId: string): RiskPrediction {
    const vesselRecords = this.complianceHistory
      .filter(r => r.vesselId === vesselId)
      .sort((a, b) => b.inspectionDate.getTime() - a.inspectionDate.getTime());

    if (vesselRecords.length === 0) {
      return this.getDefaultPrediction(vesselId);
    }

    const categoryRisks = new Map<string, number>();
    const predictedIssues: PredictedIssue[] = [];

    // Calculate risk per category
    const categories: Array<ComplianceRecord['checkType']> = ['MLC', 'STCW', 'ISM', 'ISPS', 'MARPOL', 'SOLAS'];
    
    categories.forEach(category => {
      const categoryRecords = vesselRecords.filter(r => r.checkType === category);
      
      if (categoryRecords.length > 0) {
        const risk = this.calculateCategoryRisk(categoryRecords);
        categoryRisks.set(category, risk);

        if (risk > 0.3) {
          predictedIssues.push(this.generatePredictedIssue(category, risk, categoryRecords));
        }
      } else {
        // No history - moderate risk assumed
        categoryRisks.set(category, 0.5);
      }
    });

    // Calculate overall risk
    const risks = Array.from(categoryRisks.values());
    const overallRisk = risks.reduce((a, b) => a + b, 0) / risks.length;

    // Calculate confidence based on data quantity
    const confidence = Math.min(vesselRecords.length / 20, 1);

    return {
      vesselId,
      overallRisk,
      categoryRisks,
      predictedIssues: predictedIssues.sort((a, b) => b.probability - a.probability),
      confidence,
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Valid for 7 days
    };
  }

  /**
   * Calculate risk for a specific category
   */
  private calculateCategoryRisk(records: ComplianceRecord[]): number {
    if (records.length === 0) return 0.5;

    const weights = this.modelWeights.get(records[0].checkType) || [0.3, 0.3, 0.2, 0.2];
    
    // Historical score component
    const recentScores = records.slice(0, 5).map(r => r.score);
    const avgScore = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
    const historicalRisk = 1 - (avgScore / 100);

    // Severity component
    const recentFindings = records.slice(0, 3).flatMap(r => r.findings);
    const criticalCount = recentFindings.filter(f => f.severity === 'critical').length;
    const highCount = recentFindings.filter(f => f.severity === 'high').length;
    const severityRisk = Math.min((criticalCount * 0.3 + highCount * 0.15), 1);

    // Time decay component
    const latestRecord = records[0];
    const daysSinceInspection = (Date.now() - latestRecord.inspectionDate.getTime()) / (1000 * 60 * 60 * 24);
    const timeRisk = Math.min(daysSinceInspection / 365, 1);

    // Pattern component (trend analysis)
    const patternRisk = this.analyzePatternRisk(records);

    // Weighted combination
    const risk = 
      weights[0] * historicalRisk +
      weights[1] * severityRisk +
      weights[2] * timeRisk +
      weights[3] * patternRisk;

    return Math.min(Math.max(risk, 0), 1);
  }

  /**
   * Analyze risk patterns over time
   */
  private analyzePatternRisk(records: ComplianceRecord[]): number {
    if (records.length < 3) return 0.3;

    // Check for declining trend
    const scores = records.slice(0, 5).map(r => r.score);
    let decliningCount = 0;
    
    for (let i = 1; i < scores.length; i++) {
      if (scores[i] < scores[i - 1]) {
        decliningCount++;
      }
    }

    // Check for recurring issues
    const allFindings = records.flatMap(r => r.findings);
    const categoryCount = new Map<string, number>();
    
    allFindings.forEach(f => {
      categoryCount.set(f.category, (categoryCount.get(f.category) || 0) + 1);
    });

    const recurringIssues = Array.from(categoryCount.values()).filter(c => c >= 3).length;

    return (decliningCount / Math.max(scores.length - 1, 1)) * 0.5 + 
           Math.min(recurringIssues * 0.1, 0.5);
  }

  /**
   * Generate a predicted issue entry
   */
  private generatePredictedIssue(
    category: string,
    risk: number,
    records: ComplianceRecord[]
  ): PredictedIssue {
    const recentFindings = records.slice(0, 3).flatMap(r => r.findings);
    const categoryCounts = new Map<string, number>();
    
    recentFindings.forEach(f => {
      categoryCounts.set(f.category, (categoryCounts.get(f.category) || 0) + 1);
    });

    const topIssue = Array.from(categoryCounts.entries())
      .sort((a, b) => b[1] - a[1])[0];

    const issueCategory = topIssue?.[0] || 'General';
    
    return {
      category: `${category} - ${issueCategory}`,
      probability: risk,
      timeframe: risk > 0.7 ? '30 days' : risk > 0.5 ? '90 days' : '180 days',
      suggestedAction: this.getSuggestedAction(category, issueCategory, risk),
      estimatedImpact: risk > 0.7 ? 'high' : risk > 0.4 ? 'medium' : 'low'
    };
  }

  /**
   * Get suggested action based on category and risk
   */
  private getSuggestedAction(checkType: string, issueCategory: string, risk: number): string {
    const actions: Record<string, string> = {
      'MLC': 'Review crew contracts and living conditions documentation',
      'STCW': 'Verify crew certifications and training records',
      'ISM': 'Audit safety management system procedures',
      'ISPS': 'Review ship security plan and access controls',
      'MARPOL': 'Inspect waste management and emission systems',
      'SOLAS': 'Check life-saving equipment and fire safety systems'
    };

    const baseAction = actions[checkType] || 'Conduct comprehensive compliance review';
    
    if (risk > 0.7) {
      return `URGENT: ${baseAction}. Schedule immediate inspection.`;
    } else if (risk > 0.5) {
      return `${baseAction}. Plan corrective actions within 30 days.`;
    }
    
    return `${baseAction}. Monitor and document progress.`;
  }

  /**
   * Get default prediction for vessels without history
   */
  private getDefaultPrediction(vesselId: string): RiskPrediction {
    const categoryRisks = new Map<string, number>();
    ['MLC', 'STCW', 'ISM', 'ISPS', 'MARPOL', 'SOLAS'].forEach(cat => {
      categoryRisks.set(cat, 0.5);
    });

    return {
      vesselId,
      overallRisk: 0.5,
      categoryRisks,
      predictedIssues: [{
        category: 'General',
        probability: 0.5,
        timeframe: '90 days',
        suggestedAction: 'Establish baseline compliance records through initial audit',
        estimatedImpact: 'medium'
      }],
      confidence: 0.1,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    };
  }

  /**
   * Get compliance trends over time
   */
  getComplianceTrends(vesselId?: string): ComplianceTrend[] {
    const records = vesselId 
      ? this.complianceHistory.filter(r => r.vesselId === vesselId)
      : this.complianceHistory;

    if (records.length === 0) return [];

    // Group by month
    const monthlyData = new Map<string, ComplianceRecord[]>();
    
    records.forEach(r => {
      const month = r.inspectionDate.toISOString().slice(0, 7);
      const existing = monthlyData.get(month) || [];
      monthlyData.set(month, [...existing, r]);
    });

    const trends: ComplianceTrend[] = [];
    let previousAvg = 0;

    Array.from(monthlyData.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-12)
      .forEach(([period, recs]) => {
        const avgScore = recs.reduce((a, r) => a + r.score, 0) / recs.length;
        const issueCount = recs.flatMap(r => r.findings).length;
        const resolvedCount = recs.flatMap(r => r.findings).filter(f => f.resolvedAt).length;

        let trend: 'improving' | 'stable' | 'declining' = 'stable';
        if (previousAvg > 0) {
          if (avgScore > previousAvg + 2) trend = 'improving';
          else if (avgScore < previousAvg - 2) trend = 'declining';
        }

        trends.push({
          period,
          avgScore: Math.round(avgScore * 10) / 10,
          issueCount,
          resolvedCount,
          trend
        });

        previousAvg = avgScore;
      });

    return trends;
  }

  /**
   * Get upcoming deadlines
   */
  getUpcomingDeadlines(days: number = 90): ComplianceRecord[] {
    const cutoff = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    
    return this.complianceHistory
      .filter(r => r.expirationDate <= cutoff && r.expirationDate > new Date())
      .sort((a, b) => a.expirationDate.getTime() - b.expirationDate.getTime());
  }

  /**
   * Save state to localStorage
   */
  private saveState(): void {
    try {
      const state = {
        complianceHistory: this.complianceHistory.slice(-200),
        modelWeights: Array.from(this.modelWeights.entries())
      };
      localStorage.setItem('icp_compliance_state', JSON.stringify(state));
    } catch (e) {
      // Silent fail for localStorage operations in compliance predictor
    }
  }

  /**
   * Load state from localStorage
   */
  private loadState(): void {
    try {
      const saved = localStorage.getItem('icp_compliance_state');
      if (saved) {
        const state = JSON.parse(saved);
        this.complianceHistory = (state.complianceHistory || []).map((r: ComplianceRecord) => ({
          ...r,
          inspectionDate: new Date(r.inspectionDate),
          expirationDate: new Date(r.expirationDate),
          findings: r.findings.map((f: ComplianceFinding) => ({
            ...f,
            resolvedAt: f.resolvedAt ? new Date(f.resolvedAt) : undefined
          }))
        }));
        this.modelWeights = new Map(state.modelWeights || []);
      }
    } catch (e) {
      // Silent fail for localStorage operations in compliance predictor
    }
  }

  /**
   * Reset state
   */
  reset(): void {
    this.complianceHistory = [];
    this.modelWeights.clear();
    localStorage.removeItem('icp_compliance_state');
  }
}

export const icpPredictor = new ICPCompliancePredictor();
