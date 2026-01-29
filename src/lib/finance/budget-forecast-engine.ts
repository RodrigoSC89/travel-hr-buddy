/**
 * 📊 BUDGET FORECAST ENGINE
 * AI-powered budget creation and real-time monitoring
 */

import type { Budget, CostPrediction } from './types';

interface AnnualBudget {
  year: number;
  totalBudget: number;
  byCategory: Record<string, CategoryBudget>;
  byMonth: MonthlyBudget[];
  assumptions: string[];
  risks: BudgetRisk[];
  scenarios: BudgetScenario[];
}

interface CategoryBudget {
  allocated: number;
  spent: number;
  committed: number;
  forecast: number;
  variance: number;
  variancePercentage: number;
}

interface MonthlyBudget {
  month: string;
  allocated: number;
  forecast: number;
  actual: number;
}

interface BudgetRisk {
  category: string;
  description: string;
  probability: 'low' | 'medium' | 'high';
  impact: number;
  mitigation: string;
}

interface BudgetScenario {
  name: string;
  description: string;
  totalBudget: number;
  probability: number;
  assumptions: string[];
}

interface VarianceAlert {
  category: string;
  budgeted: number;
  actual: number;
  variance: number;
  variancePercentage: number;
  severity: 'info' | 'warning' | 'critical';
  recommendation: string;
}

export class BudgetForecastEngine {
  private static instance: BudgetForecastEngine;

  static getInstance(): BudgetForecastEngine {
    if (!this.instance) {
      this.instance = new BudgetForecastEngine();
    }
    return this.instance;
  }

  /**
   * Create annual budget with AI predictions
   */
  async createAnnualBudget(year: number): Promise<AnnualBudget> {
    // Get historical data (mock for now)
    const historicalBudgets = await this.getHistoricalBudgets(year - 3, year - 1);
    
    // Calculate base budget using trend analysis
    const baseBudget = this.calculateBaseBudget(historicalBudgets);
    
    // Generate category budgets
    const byCategory = this.generateCategoryBudgets(baseBudget);
    
    // Generate monthly distribution
    const byMonth = this.generateMonthlyBudgets(baseBudget, year);
    
    // Identify risks
    const risks = this.identifyBudgetRisks(byCategory);
    
    // Create scenarios
    const scenarios = this.createScenarios(baseBudget);

    return {
      year,
      totalBudget: baseBudget.total,
      byCategory,
      byMonth,
      assumptions: [
        'Fuel prices remain stable within 10% of current levels',
        'Exchange rates follow current trends',
        'No major regulatory changes expected',
        'Fleet size remains constant',
        'Inflation rate of 3% applied to operational costs'
      ],
      risks,
      scenarios
    };
  }

  /**
   * Monitor budget in real-time and detect variances
   */
  async monitorBudgetRealtime(): Promise<VarianceAlert[]> {
    const alerts: VarianceAlert[] = [];
    
    // Get current budget vs actual (mock data)
    const categories = ['fuel', 'maintenance', 'crew', 'port', 'insurance', 'other'];
    
    for (const category of categories) {
      const budgeted = this.getMockBudgetedAmount(category);
      const actual = this.getMockActualAmount(category);
      const variance = actual - budgeted;
      const variancePercentage = (variance / budgeted) * 100;

      if (Math.abs(variancePercentage) > 5) {
        alerts.push({
          category,
          budgeted,
          actual,
          variance,
          variancePercentage,
          severity: Math.abs(variancePercentage) > 15 ? 'critical' : 
                   Math.abs(variancePercentage) > 10 ? 'warning' : 'info',
          recommendation: this.generateRecommendation(category, variancePercentage)
        });
      }
    }

    return alerts.sort((a, b) => Math.abs(b.variancePercentage) - Math.abs(a.variancePercentage));
  }

  /**
   * Update forecast based on current actuals
   */
  async updateForecast(currentMonth: number): Promise<CostPrediction> {
    // Calculate year-to-date actual
    const ytdActual = this.calculateYTDActual(currentMonth);
    
    // Extrapolate to year-end
    const remainingMonths = 12 - currentMonth;
    const avgMonthly = ytdActual / currentMonth;
    const projected = ytdActual + (avgMonthly * remainingMonths);

    // Apply adjustments based on known factors
    const adjustedProjection = this.applySeasonalAdjustments(projected, currentMonth);

    return {
      fuel: adjustedProjection * 0.35,
      maintenance: adjustedProjection * 0.20,
      crew: adjustedProjection * 0.25,
      port: adjustedProjection * 0.10,
      insurance: adjustedProjection * 0.05,
      other: adjustedProjection * 0.05,
      total: adjustedProjection,
      confidence: 0.85 - (remainingMonths * 0.02), // Confidence decreases further into future
      factors: [
        {
          name: 'Year-to-Date Trend',
          impact: 'neutral',
          magnitude: 0,
          description: `Based on ${currentMonth} months of actual data`
        }
      ]
    };
  }

  /**
   * Get historical budgets
   */
  private async getHistoricalBudgets(startYear: number, endYear: number): Promise<Budget[]> {
    // Return mock historical data
    const budgets: Budget[] = [];
    
    for (let year = startYear; year <= endYear; year++) {
      const baseAmount = 1500000 * (1 + (year - startYear) * 0.05); // 5% annual increase
      
      budgets.push({
        id: crypto.randomUUID(),
        year,
        category: 'total',
        allocated_amount: baseAmount,
        spent_amount: baseAmount * (0.9 + Math.random() * 0.15),
        committed_amount: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
    
    return budgets;
  }

  /**
   * Calculate base budget from historical data
   */
  private calculateBaseBudget(historical: Budget[]): { total: number; growth: number } {
    if (historical.length === 0) {
      return { total: 2000000, growth: 0.05 }; // Default
    }

    const sorted = historical.sort((a, b) => a.year - b.year);
    const latest = sorted[sorted.length - 1];
    
    // Calculate average growth rate
    let totalGrowth = 0;
    for (let i = 1; i < sorted.length; i++) {
      const growth = (sorted[i].allocated_amount - sorted[i-1].allocated_amount) / sorted[i-1].allocated_amount;
      totalGrowth += growth;
    }
    const avgGrowth = sorted.length > 1 ? totalGrowth / (sorted.length - 1) : 0.05;

    return {
      total: latest.allocated_amount * (1 + avgGrowth),
      growth: avgGrowth
    };
  }

  /**
   * Generate category budgets
   */
  private generateCategoryBudgets(baseBudget: { total: number }): Record<string, CategoryBudget> {
    const allocations: Record<string, number> = {
      fuel: 0.35,
      maintenance: 0.20,
      crew: 0.25,
      port: 0.10,
      insurance: 0.05,
      other: 0.05
    };

    const result: Record<string, CategoryBudget> = {};

    for (const [category, allocation] of Object.entries(allocations)) {
      const allocated = baseBudget.total * allocation;
      const spent = allocated * (0.3 + Math.random() * 0.4); // 30-70% spent so far
      const committed = allocated * 0.1; // 10% committed
      const forecast = spent + committed + (allocated - spent - committed) * 0.9;
      const variance = forecast - allocated;

      result[category] = {
        allocated,
        spent,
        committed,
        forecast,
        variance,
        variancePercentage: (variance / allocated) * 100
      };
    }

    return result;
  }

  /**
   * Generate monthly budget distribution
   */
  private generateMonthlyBudgets(baseBudget: { total: number }, year: number): MonthlyBudget[] {
    const monthlyBudgets: MonthlyBudget[] = [];
    const monthlyBase = baseBudget.total / 12;

    // Seasonal adjustments (higher in summer months)
    const seasonalFactors = [0.9, 0.85, 0.95, 1.0, 1.05, 1.1, 1.15, 1.1, 1.05, 1.0, 0.95, 0.9];

    for (let i = 0; i < 12; i++) {
      const month = new Date(year, i, 1).toISOString().substring(0, 7);
      const allocated = monthlyBase * seasonalFactors[i];
      
      // For past months, generate actual data
      const now = new Date();
      const isHistorical = new Date(year, i, 1) < now;
      
      monthlyBudgets.push({
        month,
        allocated,
        forecast: allocated * (1 + (Math.random() - 0.5) * 0.1),
        actual: isHistorical ? allocated * (0.9 + Math.random() * 0.2) : 0
      });
    }

    return monthlyBudgets;
  }

  /**
   * Identify budget risks
   */
  private identifyBudgetRisks(categories: Record<string, CategoryBudget>): BudgetRisk[] {
    const risks: BudgetRisk[] = [];

    for (const [category, budget] of Object.entries(categories)) {
      if (budget.variancePercentage > 10) {
        risks.push({
          category,
          description: `${category} costs trending ${budget.variancePercentage.toFixed(1)}% above budget`,
          probability: budget.variancePercentage > 20 ? 'high' : 'medium',
          impact: budget.variance,
          mitigation: this.generateMitigation(category)
        });
      }
    }

    // Add general risks
    risks.push({
      category: 'fuel',
      description: 'Fuel price volatility due to geopolitical factors',
      probability: 'medium',
      impact: categories.fuel?.allocated * 0.15 || 0,
      mitigation: 'Consider fuel hedging contracts'
    });

    return risks;
  }

  /**
   * Create budget scenarios
   */
  private createScenarios(baseBudget: { total: number }): BudgetScenario[] {
    return [
      {
        name: 'Optimistic',
        description: 'Lower fuel prices, efficient operations',
        totalBudget: baseBudget.total * 0.9,
        probability: 0.25,
        assumptions: ['Fuel prices drop 10%', 'Maintenance costs reduced through predictive maintenance']
      },
      {
        name: 'Base Case',
        description: 'Current trends continue',
        totalBudget: baseBudget.total,
        probability: 0.5,
        assumptions: ['All costs follow historical trends', 'No major disruptions']
      },
      {
        name: 'Pessimistic',
        description: 'Higher costs, operational challenges',
        totalBudget: baseBudget.total * 1.15,
        probability: 0.25,
        assumptions: ['Fuel prices increase 15%', 'Unexpected maintenance required']
      }
    ];
  }

  /**
   * Generate recommendation for variance
   */
  private generateRecommendation(category: string, variancePercentage: number): string {
    if (variancePercentage > 0) {
      switch (category) {
        case 'fuel':
          return 'Consider slow steaming and route optimization to reduce fuel consumption';
        case 'maintenance':
          return 'Review maintenance schedule and prioritize critical items';
        case 'crew':
          return 'Analyze overtime costs and optimize crew rotation';
        case 'port':
          return 'Negotiate port tariffs and optimize berth scheduling';
        default:
          return 'Review spending and identify cost reduction opportunities';
      }
    }
    return 'Budget underrun - consider reallocating to higher priority areas';
  }

  /**
   * Generate mitigation strategy
   */
  private generateMitigation(category: string): string {
    const mitigations: Record<string, string> = {
      fuel: 'Implement fuel consumption monitoring and optimize routes',
      maintenance: 'Prioritize critical maintenance and defer non-essential work',
      crew: 'Review manning levels and optimize rotation schedules',
      port: 'Renegotiate port contracts and consolidate port calls',
      insurance: 'Review coverage and negotiate premiums',
      other: 'Conduct detailed expense analysis and eliminate waste'
    };
    return mitigations[category] || 'Review and optimize spending in this category';
  }

  /**
   * Get mock budgeted amount
   */
  private getMockBudgetedAmount(category: string): number {
    const amounts: Record<string, number> = {
      fuel: 700000,
      maintenance: 400000,
      crew: 500000,
      port: 200000,
      insurance: 100000,
      other: 100000
    };
    return amounts[category] || 100000;
  }

  /**
   * Get mock actual amount
   */
  private getMockActualAmount(category: string): number {
    const budgeted = this.getMockBudgetedAmount(category);
    return budgeted * (0.85 + Math.random() * 0.3); // -15% to +15% variance
  }

  /**
   * Calculate year-to-date actual
   */
  private calculateYTDActual(currentMonth: number): number {
    const monthlyAverage = 166667; // ~$2M annual / 12
    return monthlyAverage * currentMonth * (0.95 + Math.random() * 0.1);
  }

  /**
   * Apply seasonal adjustments
   */
  private applySeasonalAdjustments(projection: number, currentMonth: number): number {
    // Higher costs in summer months (Q2-Q3)
    const seasonalFactor = currentMonth >= 4 && currentMonth <= 9 ? 1.05 : 0.95;
    return projection * seasonalFactor;
  }
}

export const budgetForecastEngine = BudgetForecastEngine.getInstance();
