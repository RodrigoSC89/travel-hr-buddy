/**
 * OPEX Forecasting Engine
 * Time-series based operational expense prediction with 90-day horizon
 */

export interface HistoricalExpense {
  date: Date;
  category: string;
  amount: number;
  vesselId: string;
  vesselName: string;
  currency: string;
}

export interface ForecastResult {
  period: Date;
  predictedAmount: number;
  lowerBound: number;
  upperBound: number;
  confidence: number;
  category: string;
  trend: 'increasing' | 'stable' | 'decreasing';
  seasonalFactor: number;
  anomalyRisk: number;
}

export interface CategoryForecast {
  category: string;
  currentMonth: number;
  next30Days: number;
  next60Days: number;
  next90Days: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  percentChange: number;
  insights: string[];
}

export interface OPEXForecast {
  generatedAt: Date;
  vesselId: string;
  vesselName: string;
  currency: string;
  totalNext30Days: number;
  totalNext60Days: number;
  totalNext90Days: number;
  categoryBreakdown: CategoryForecast[];
  dailyForecasts: ForecastResult[];
  seasonalPatterns: SeasonalPattern[];
  anomalies: ForecastAnomaly[];
  recommendations: BudgetRecommendation[];
  accuracy: {
    mape: number; // Mean Absolute Percentage Error
    rmse: number; // Root Mean Square Error
    confidence: number;
  };
}

export interface SeasonalPattern {
  pattern: string;
  description: string;
  peakMonths: number[];
  impact: number;
  category: string;
}

export interface ForecastAnomaly {
  date: Date;
  category: string;
  expectedAmount: number;
  actualAmount: number;
  deviation: number;
  possibleCause: string;
}

export interface BudgetRecommendation {
  category: string;
  currentBudget: number;
  recommendedBudget: number;
  reason: string;
  priority: 'low' | 'medium' | 'high';
  potentialSavings: number;
}

class OPEXForecastingEngine {
  private readonly CATEGORIES = [
    'Crew Wages',
    'Fuel/Bunker',
    'Port Charges',
    'Maintenance',
    'Provisions',
    'Insurance',
    'Lubricants',
    'Stores & Spares',
    'Communications',
    'Miscellaneous'
  ];

  private categoryBaselines: Map<string, { avg: number; stdDev: number; trend: number }> = new Map();
  private seasonalFactors: Map<string, number[]> = new Map();

  generateForecast(
    historicalData: HistoricalExpense[],
    vesselId: string,
    vesselName: string,
    horizon: number = 90
  ): OPEXForecast {
    // Group by category
    const byCategory = this.groupByCategory(historicalData);
    
    // Calculate baselines and trends for each category
    this.calculateBaselines(byCategory);
    
    // Detect seasonal patterns
    const seasonalPatterns = this.detectSeasonalPatterns(byCategory);
    
    // Generate daily forecasts
    const dailyForecasts = this.generateDailyForecasts(byCategory, horizon);
    
    // Aggregate category forecasts
    const categoryBreakdown = this.aggregateCategoryForecasts(byCategory, dailyForecasts);
    
    // Detect anomalies in historical data
    const anomalies = this.detectAnomalies(historicalData);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(categoryBreakdown, historicalData);
    
    // Calculate accuracy metrics
    const accuracy = this.calculateAccuracy(historicalData, byCategory);

    // Calculate totals
    const totals = this.calculateTotals(dailyForecasts);

    return {
      generatedAt: new Date(),
      vesselId,
      vesselName,
      currency: 'USD',
      totalNext30Days: totals.next30,
      totalNext60Days: totals.next60,
      totalNext90Days: totals.next90,
      categoryBreakdown,
      dailyForecasts,
      seasonalPatterns,
      anomalies,
      recommendations,
      accuracy
    };
  }

  private groupByCategory(data: HistoricalExpense[]): Map<string, HistoricalExpense[]> {
    const grouped = new Map<string, HistoricalExpense[]>();
    
    for (const expense of data) {
      const category = this.normalizeCategory(expense.category);
      const existing = grouped.get(category) || [];
      existing.push(expense);
      grouped.set(category, existing);
    }

    return grouped;
  }

  private normalizeCategory(category: string): string {
    const normalized = category.toLowerCase();
    
    if (normalized.includes('wage') || normalized.includes('salary') || normalized.includes('crew')) {
      return 'Crew Wages';
    }
    if (normalized.includes('fuel') || normalized.includes('bunker')) {
      return 'Fuel/Bunker';
    }
    if (normalized.includes('port') || normalized.includes('dock')) {
      return 'Port Charges';
    }
    if (normalized.includes('maint') || normalized.includes('repair')) {
      return 'Maintenance';
    }
    if (normalized.includes('provision') || normalized.includes('food')) {
      return 'Provisions';
    }
    if (normalized.includes('insurance')) {
      return 'Insurance';
    }
    if (normalized.includes('lubric') || normalized.includes('oil')) {
      return 'Lubricants';
    }
    if (normalized.includes('store') || normalized.includes('spare')) {
      return 'Stores & Spares';
    }
    if (normalized.includes('comm') || normalized.includes('satell')) {
      return 'Communications';
    }
    
    return 'Miscellaneous';
  }

  private calculateBaselines(byCategory: Map<string, HistoricalExpense[]>): void {
    for (const [category, expenses] of byCategory) {
      if (expenses.length === 0) continue;

      // Sort by date
      const sorted = [...expenses].sort((a, b) => a.date.getTime() - b.date.getTime());
      
      // Calculate monthly averages
      const monthlyTotals = new Map<string, number>();
      for (const exp of sorted) {
        const monthKey = `${exp.date.getFullYear()}-${exp.date.getMonth()}`;
        monthlyTotals.set(monthKey, (monthlyTotals.get(monthKey) || 0) + exp.amount);
      }

      const monthlyValues = Array.from(monthlyTotals.values());
      const avg = monthlyValues.reduce((s, v) => s + v, 0) / monthlyValues.length;
      const stdDev = Math.sqrt(
        monthlyValues.reduce((s, v) => s + Math.pow(v - avg, 2), 0) / monthlyValues.length
      );

      // Calculate trend (linear regression slope)
      const trend = this.calculateTrend(monthlyValues);

      this.categoryBaselines.set(category, { avg, stdDev, trend });
    }
  }

  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;

    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((s, v) => s + v, 0);
    const sumXY = values.reduce((s, v, i) => s + v * i, 0);
    const sumX2 = values.reduce((s, _, i) => s + i * i, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    
    // Normalize to percentage per month
    const avgY = sumY / n;
    return (slope / avgY) * 100;
  }

  private detectSeasonalPatterns(byCategory: Map<string, HistoricalExpense[]>): SeasonalPattern[] {
    const patterns: SeasonalPattern[] = [];

    for (const [category, expenses] of byCategory) {
      // Group by month
      const monthlyAvg = new Array(12).fill(0);
      const monthlyCounts = new Array(12).fill(0);

      for (const exp of expenses) {
        const month = exp.date.getMonth();
        monthlyAvg[month] += exp.amount;
        monthlyCounts[month]++;
      }

      // Calculate monthly averages
      for (let i = 0; i < 12; i++) {
        if (monthlyCounts[i] > 0) {
          monthlyAvg[i] /= monthlyCounts[i];
        }
      }

      const overallAvg = monthlyAvg.reduce((s, v) => s + v, 0) / 12;
      
      // Store seasonal factors
      this.seasonalFactors.set(category, monthlyAvg.map(v => v / overallAvg || 1));

      // Detect patterns
      const peakMonths = monthlyAvg
        .map((v, i) => ({ month: i, value: v }))
        .filter(m => m.value > overallAvg * 1.2)
        .map(m => m.month);

      if (peakMonths.length > 0) {
        const maxMonth = monthlyAvg.indexOf(Math.max(...monthlyAvg));
        const impact = (Math.max(...monthlyAvg) - overallAvg) / overallAvg * 100;

        patterns.push({
          pattern: `${category} peaks`,
          description: this.describeSeasonalPattern(category, peakMonths),
          peakMonths,
          impact,
          category
        });
      }
    }

    return patterns;
  }

  private describeSeasonalPattern(category: string, peakMonths: number[]): string {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const peaks = peakMonths.map(m => monthNames[m]).join(', ');

    switch (category) {
      case 'Fuel/Bunker':
        return `Fuel expenses peak in ${peaks}, likely due to winter heating and adverse weather`;
      case 'Maintenance':
        return `Maintenance costs increase in ${peaks}, common for scheduled overhauls`;
      case 'Port Charges':
        return `Port charges higher in ${peaks}, possibly due to peak shipping season`;
      default:
        return `${category} expenses typically higher in ${peaks}`;
    }
  }

  private generateDailyForecasts(
    byCategory: Map<string, HistoricalExpense[]>,
    horizon: number
  ): ForecastResult[] {
    const forecasts: ForecastResult[] = [];
    const today = new Date();

    for (const category of this.CATEGORIES) {
      const baseline = this.categoryBaselines.get(category);
      const seasonal = this.seasonalFactors.get(category) || new Array(12).fill(1);

      if (!baseline) continue;

      // Generate daily forecast
      for (let day = 0; day < horizon; day++) {
        const forecastDate = new Date(today.getTime() + day * 24 * 60 * 60 * 1000);
        const month = forecastDate.getMonth();
        
        // Base prediction with trend and seasonality
        const dailyBase = baseline.avg / 30; // Convert monthly to daily
        const trendFactor = 1 + (baseline.trend / 100) * (day / 30);
        const seasonalFactor = seasonal[month];
        
        const predicted = dailyBase * trendFactor * seasonalFactor;
        
        // Calculate confidence interval
        const dailyStdDev = baseline.stdDev / Math.sqrt(30);
        const confidenceMultiplier = 1.96; // 95% confidence
        
        forecasts.push({
          period: forecastDate,
          predictedAmount: predicted,
          lowerBound: Math.max(0, predicted - dailyStdDev * confidenceMultiplier),
          upperBound: predicted + dailyStdDev * confidenceMultiplier,
          confidence: Math.max(0.6, 1 - (day / horizon) * 0.3), // Decreases with horizon
          category,
          trend: baseline.trend > 2 ? 'increasing' : baseline.trend < -2 ? 'decreasing' : 'stable',
          seasonalFactor,
          anomalyRisk: this.calculateAnomalyRisk(predicted, baseline.avg / 30, baseline.stdDev / 30)
        });
      }
    }

    return forecasts;
  }

  private calculateAnomalyRisk(predicted: number, mean: number, stdDev: number): number {
    if (stdDev === 0) return 0;
    const zScore = Math.abs(predicted - mean) / stdDev;
    return Math.min(1, zScore / 3);
  }

  private aggregateCategoryForecasts(
    byCategory: Map<string, HistoricalExpense[]>,
    dailyForecasts: ForecastResult[]
  ): CategoryForecast[] {
    const categoryForecasts: CategoryForecast[] = [];
    const today = new Date();

    for (const category of this.CATEGORIES) {
      const categoryDaily = dailyForecasts.filter(f => f.category === category);
      const baseline = this.categoryBaselines.get(category);

      if (categoryDaily.length === 0 || !baseline) continue;

      const next30 = categoryDaily
        .filter(f => (f.period.getTime() - today.getTime()) < 30 * 24 * 60 * 60 * 1000)
        .reduce((s, f) => s + f.predictedAmount, 0);

      const next60 = categoryDaily
        .filter(f => (f.period.getTime() - today.getTime()) < 60 * 24 * 60 * 60 * 1000)
        .reduce((s, f) => s + f.predictedAmount, 0);

      const next90 = categoryDaily.reduce((s, f) => s + f.predictedAmount, 0);

      const trend: 'increasing' | 'stable' | 'decreasing' = 
        baseline.trend > 2 ? 'increasing' : baseline.trend < -2 ? 'decreasing' : 'stable';

      categoryForecasts.push({
        category,
        currentMonth: baseline.avg,
        next30Days: next30,
        next60Days: next60,
        next90Days: next90,
        trend,
        percentChange: baseline.trend,
        insights: this.generateCategoryInsights(category, baseline, trend)
      });
    }

    return categoryForecasts.sort((a, b) => b.next90Days - a.next90Days);
  }

  private generateCategoryInsights(
    category: string,
    baseline: { avg: number; stdDev: number; trend: number },
    trend: string
  ): string[] {
    const insights: string[] = [];

    if (trend === 'increasing' && baseline.trend > 5) {
      insights.push(`${category} costs increasing ${baseline.trend.toFixed(1)}% monthly - review for optimization`);
    }

    if (baseline.stdDev / baseline.avg > 0.3) {
      insights.push(`High variability in ${category} - consider budget buffer`);
    }

    // Category-specific insights
    switch (category) {
      case 'Fuel/Bunker':
        insights.push('Monitor global fuel prices for potential savings');
        break;
      case 'Maintenance':
        insights.push('Review preventive maintenance schedule to optimize timing');
        break;
      case 'Crew Wages':
        insights.push('Consider roster optimization for cost efficiency');
        break;
    }

    return insights;
  }

  private detectAnomalies(data: HistoricalExpense[]): ForecastAnomaly[] {
    const anomalies: ForecastAnomaly[] = [];
    const byCategory = this.groupByCategory(data);

    for (const [category, expenses] of byCategory) {
      const baseline = this.categoryBaselines.get(category);
      if (!baseline) continue;

      const monthlyAvg = baseline.avg / 30;
      const threshold = baseline.stdDev / 30 * 2;

      for (const exp of expenses) {
        const deviation = Math.abs(exp.amount - monthlyAvg) / monthlyAvg;
        
        if (deviation > 0.5) { // More than 50% deviation
          anomalies.push({
            date: exp.date,
            category,
            expectedAmount: monthlyAvg,
            actualAmount: exp.amount,
            deviation,
            possibleCause: this.guessCause(category, exp.amount > monthlyAvg)
          });
        }
      }
    }

    return anomalies.slice(-10); // Return most recent 10
  }

  private guessCause(category: string, isHigh: boolean): string {
    if (isHigh) {
      switch (category) {
        case 'Fuel/Bunker': return 'Possible extended voyage or price spike';
        case 'Maintenance': return 'Unplanned repair or major overhaul';
        case 'Port Charges': return 'Extended port stay or premium berth';
        default: return 'Unusual operational requirement';
      }
    } else {
      return 'Reduced operations or delayed expense';
    }
  }

  private generateRecommendations(
    categoryForecasts: CategoryForecast[],
    historicalData: HistoricalExpense[]
  ): BudgetRecommendation[] {
    const recommendations: BudgetRecommendation[] = [];

    for (const forecast of categoryForecasts) {
      const historicalAvg = this.categoryBaselines.get(forecast.category)?.avg || 0;
      const forecasted = forecast.next30Days;
      
      if (forecast.trend === 'increasing' && forecast.percentChange > 5) {
        recommendations.push({
          category: forecast.category,
          currentBudget: historicalAvg,
          recommendedBudget: forecasted * 1.1,
          reason: `${forecast.category} trending up ${forecast.percentChange.toFixed(1)}% - increase budget buffer`,
          priority: forecast.percentChange > 10 ? 'high' : 'medium',
          potentialSavings: 0
        });
      }

      if (forecast.trend === 'decreasing' && forecast.percentChange < -5) {
        recommendations.push({
          category: forecast.category,
          currentBudget: historicalAvg,
          recommendedBudget: forecasted * 0.95,
          reason: `${forecast.category} trending down - opportunity to reduce budget allocation`,
          priority: 'low',
          potentialSavings: historicalAvg - forecasted * 0.95
        });
      }
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  private calculateAccuracy(
    data: HistoricalExpense[],
    byCategory: Map<string, HistoricalExpense[]>
  ): { mape: number; rmse: number; confidence: number } {
    // Use last 20% of data for validation
    const validationSize = Math.floor(data.length * 0.2);
    if (validationSize < 10) {
      return { mape: 15, rmse: 1000, confidence: 0.7 }; // Default for small datasets
    }

    let totalError = 0;
    let totalSquaredError = 0;
    let count = 0;

    for (const [category, expenses] of byCategory) {
      const baseline = this.categoryBaselines.get(category);
      if (!baseline) continue;

      const validation = expenses.slice(-Math.ceil(expenses.length * 0.2));
      const dailyAvg = baseline.avg / 30;

      for (const exp of validation) {
        const error = Math.abs(exp.amount - dailyAvg) / dailyAvg;
        totalError += error;
        totalSquaredError += Math.pow(exp.amount - dailyAvg, 2);
        count++;
      }
    }

    const mape = (totalError / count) * 100;
    const rmse = Math.sqrt(totalSquaredError / count);
    const confidence = Math.max(0.5, 1 - mape / 100);

    return { mape, rmse, confidence };
  }

  private calculateTotals(forecasts: ForecastResult[]): { next30: number; next60: number; next90: number } {
    const today = new Date();
    
    const next30 = forecasts
      .filter(f => (f.period.getTime() - today.getTime()) < 30 * 24 * 60 * 60 * 1000)
      .reduce((s, f) => s + f.predictedAmount, 0);

    const next60 = forecasts
      .filter(f => (f.period.getTime() - today.getTime()) < 60 * 24 * 60 * 60 * 1000)
      .reduce((s, f) => s + f.predictedAmount, 0);

    const next90 = forecasts.reduce((s, f) => s + f.predictedAmount, 0);

    return { next30, next60, next90 };
  }
}

export const opexForecastingEngine = new OPEXForecastingEngine();
