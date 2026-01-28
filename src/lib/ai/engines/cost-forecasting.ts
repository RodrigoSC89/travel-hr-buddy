/**
 * Cost Forecasting Engine
 * Previsão de OPEX com 90 dias de antecedência usando séries temporais
 * Nível: Assistivo
 */

export interface HistoricalCost {
  date: Date;
  category: CostCategory;
  amount: number;
  currency: string;
  vesselId: string | null;
  description: string;
  isRecurring: boolean;
}

export type CostCategory = 
  | 'fuel'
  | 'crew_wages'
  | 'maintenance'
  | 'insurance'
  | 'port_fees'
  | 'provisions'
  | 'lubricants'
  | 'spare_parts'
  | 'communication'
  | 'administration'
  | 'other';

export interface CostForecast {
  period: { start: Date; end: Date };
  totalForecast: number;
  byCategory: Array<{
    category: CostCategory;
    forecast: number;
    lowerBound: number;
    upperBound: number;
    trend: 'increasing' | 'stable' | 'decreasing';
    confidence: number;
  }>;
  byMonth: Array<{
    month: string;
    forecast: number;
    breakdown: Record<CostCategory, number>;
  }>;
  risks: CostRisk[];
  savings: SavingsOpportunity[];
  assumptions: string[];
  accuracy: {
    historicalMAE: number;
    historicalMAPE: number;
    modelConfidence: number;
  };
}

export interface CostRisk {
  category: CostCategory;
  risk: string;
  potentialImpact: number;
  probability: 'low' | 'medium' | 'high';
  mitigation: string;
}

export interface SavingsOpportunity {
  category: CostCategory;
  opportunity: string;
  potentialSavings: number;
  effort: 'low' | 'medium' | 'high';
  recommendation: string;
}

export interface BunkerOptimization {
  currentPrice: number;
  forecastedPrice: number;
  priceDirection: 'up' | 'stable' | 'down';
  recommendedPorts: Array<{
    portCode: string;
    portName: string;
    price: number;
    savings: number;
    optimalQuantity: number;
    bestTime: string;
  }>;
  buySignal: 'strong_buy' | 'buy' | 'hold' | 'wait';
  confidence: number;
}

class CostForecastingEngine {
  private readonly CATEGORY_WEIGHTS: Record<CostCategory, number> = {
    fuel: 0.35,
    crew_wages: 0.25,
    maintenance: 0.12,
    insurance: 0.08,
    port_fees: 0.06,
    provisions: 0.05,
    lubricants: 0.03,
    spare_parts: 0.03,
    communication: 0.01,
    administration: 0.01,
    other: 0.01
  };

  async forecastCosts(
    historicalData: HistoricalCost[],
    forecastDays: number = 90
  ): Promise<CostForecast> {
    // Group historical data by category
    const byCategory = this.groupByCategory(historicalData);
    
    // Calculate forecasts for each category
    const categoryForecasts = Object.entries(byCategory).map(([category, costs]) => {
      const forecast = this.forecastCategory(costs as HistoricalCost[], forecastDays);
      return {
        category: category as CostCategory,
        ...forecast
      };
    });

    // Calculate monthly breakdown
    const monthlyForecasts = this.calculateMonthlyBreakdown(categoryForecasts, forecastDays);

    // Identify risks
    const risks = this.identifyRisks(historicalData, categoryForecasts);

    // Identify savings opportunities
    const savings = this.identifySavings(historicalData, categoryForecasts);

    // Calculate total forecast
    const totalForecast = categoryForecasts.reduce((sum, cf) => sum + cf.forecast, 0);

    // Calculate model accuracy metrics
    const accuracy = this.calculateAccuracyMetrics(historicalData);

    return {
      period: {
        start: new Date(),
        end: new Date(Date.now() + forecastDays * 24 * 60 * 60 * 1000)
      },
      totalForecast,
      byCategory: categoryForecasts,
      byMonth: monthlyForecasts,
      risks,
      savings,
      assumptions: this.generateAssumptions(historicalData),
      accuracy
    };
  }

  private groupByCategory(data: HistoricalCost[]): Record<string, HistoricalCost[]> {
    const groups: Record<string, HistoricalCost[]> = {};
    
    for (const cost of data) {
      if (!groups[cost.category]) {
        groups[cost.category] = [];
      }
      groups[cost.category].push(cost);
    }
    
    return groups;
  }

  private forecastCategory(
    costs: HistoricalCost[],
    days: number
  ): {
    forecast: number;
    lowerBound: number;
    upperBound: number;
    trend: 'increasing' | 'stable' | 'decreasing';
    confidence: number;
  } {
    if (costs.length === 0) {
      return {
        forecast: 0,
        lowerBound: 0,
        upperBound: 0,
        trend: 'stable',
        confidence: 0
      };
    }

    // Sort by date
    const sorted = [...costs].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Calculate daily average
    const amounts = sorted.map(c => c.amount);
    const dailyAvg = amounts.reduce((a, b) => a + b, 0) / amounts.length;

    // Calculate trend using linear regression
    const trend = this.calculateTrend(sorted);

    // Project forward
    const projectedDaily = dailyAvg * (1 + trend * 0.01); // Adjust by trend
    const forecast = projectedDaily * days;

    // Calculate confidence interval
    const stdDev = this.calculateStdDev(amounts);
    const margin = stdDev * 1.96; // 95% CI

    // Determine trend direction
    let trendDirection: 'increasing' | 'stable' | 'decreasing';
    if (trend > 5) trendDirection = 'increasing';
    else if (trend < -5) trendDirection = 'decreasing';
    else trendDirection = 'stable';

    // Calculate confidence based on data quality
    const confidence = Math.min(0.95, 0.5 + (sorted.length / 100) * 0.3 + (1 - stdDev / dailyAvg) * 0.15);

    return {
      forecast,
      lowerBound: Math.max(0, forecast - margin * days),
      upperBound: forecast + margin * days,
      trend: trendDirection,
      confidence
    };
  }

  private calculateTrend(costs: HistoricalCost[]): number {
    if (costs.length < 3) return 0;

    // Simple linear regression
    const n = costs.length;
    const xMean = (n - 1) / 2;
    const yMean = costs.reduce((sum, c) => sum + c.amount, 0) / n;

    let numerator = 0;
    let denominator = 0;

    for (let i = 0; i < n; i++) {
      numerator += (i - xMean) * (costs[i].amount - yMean);
      denominator += Math.pow(i - xMean, 2);
    }

    const slope = denominator !== 0 ? numerator / denominator : 0;
    
    // Return as percentage change
    return (slope / yMean) * 100;
  }

  private calculateStdDev(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / values.length);
  }

  private calculateMonthlyBreakdown(
    categoryForecasts: Array<{
      category: CostCategory;
      forecast: number;
      lowerBound: number;
      upperBound: number;
      trend: string;
      confidence: number;
    }>,
    days: number
  ): Array<{
    month: string;
    forecast: number;
    breakdown: Record<CostCategory, number>;
  }> {
    const months: Array<{
      month: string;
      forecast: number;
      breakdown: Record<CostCategory, number>;
    }> = [];

    const startDate = new Date();
    const endDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    
    let currentDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

    while (currentDate <= endDate) {
      const monthName = currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      
      // Calculate days in this month within forecast period
      const monthStart = new Date(Math.max(currentDate.getTime(), startDate.getTime()));
      const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
      const monthEnd = new Date(Math.min(nextMonth.getTime() - 1, endDate.getTime()));
      const daysInMonth = Math.ceil((monthEnd.getTime() - monthStart.getTime()) / (24 * 60 * 60 * 1000)) + 1;
      const fractionOfForecast = daysInMonth / days;

      const breakdown: Record<CostCategory, number> = {} as Record<CostCategory, number>;
      let monthTotal = 0;

      for (const cf of categoryForecasts) {
        const categoryAmount = cf.forecast * fractionOfForecast;
        breakdown[cf.category] = Math.round(categoryAmount);
        monthTotal += categoryAmount;
      }

      months.push({
        month: monthName,
        forecast: Math.round(monthTotal),
        breakdown
      });

      currentDate = nextMonth;
    }

    return months;
  }

  private identifyRisks(
    historicalData: HistoricalCost[],
    forecasts: Array<{ category: CostCategory; trend: string; forecast: number }>
  ): CostRisk[] {
    const risks: CostRisk[] = [];

    // Fuel price volatility risk
    const fuelForecast = forecasts.find(f => f.category === 'fuel');
    if (fuelForecast && fuelForecast.trend === 'increasing') {
      risks.push({
        category: 'fuel',
        risk: 'Tendência de alta nos custos de combustível',
        potentialImpact: fuelForecast.forecast * 0.15,
        probability: 'high',
        mitigation: 'Considerar contratos de hedge de combustível'
      });
    }

    // Maintenance cost spikes
    const maintenanceCosts = historicalData.filter(h => h.category === 'maintenance');
    const maintenanceSpikes = this.detectSpikes(maintenanceCosts);
    if (maintenanceSpikes > 2) {
      risks.push({
        category: 'maintenance',
        risk: 'Histórico de picos inesperados em manutenção',
        potentialImpact: forecasts.find(f => f.category === 'maintenance')?.forecast || 0 * 0.25,
        probability: 'medium',
        mitigation: 'Implementar manutenção preditiva e reserva de contingência'
      });
    }

    // Currency exposure
    const multiCurrency = new Set(historicalData.map(h => h.currency)).size > 1;
    if (multiCurrency) {
      risks.push({
        category: 'other',
        risk: 'Exposição a variação cambial',
        potentialImpact: forecasts.reduce((sum, f) => sum + f.forecast, 0) * 0.05,
        probability: 'medium',
        mitigation: 'Avaliar hedge cambial para despesas em moeda estrangeira'
      });
    }

    return risks;
  }

  private detectSpikes(costs: HistoricalCost[]): number {
    if (costs.length < 5) return 0;

    const amounts = costs.map(c => c.amount);
    const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const stdDev = this.calculateStdDev(amounts);
    
    return amounts.filter(a => a > mean + 2 * stdDev).length;
  }

  private identifySavings(
    historicalData: HistoricalCost[],
    forecasts: Array<{ category: CostCategory; forecast: number; trend: string }>
  ): SavingsOpportunity[] {
    const savings: SavingsOpportunity[] = [];

    // Fuel optimization
    const fuelForecast = forecasts.find(f => f.category === 'fuel');
    if (fuelForecast && fuelForecast.forecast > 100000) {
      savings.push({
        category: 'fuel',
        opportunity: 'Otimização de velocidade e rota',
        potentialSavings: fuelForecast.forecast * 0.08,
        effort: 'medium',
        recommendation: 'Implementar sistema de route optimization baseado em clima e correntes'
      });
    }

    // Preventive maintenance
    const maintenanceForecast = forecasts.find(f => f.category === 'maintenance');
    if (maintenanceForecast) {
      savings.push({
        category: 'maintenance',
        opportunity: 'Transição para manutenção preditiva',
        potentialSavings: maintenanceForecast.forecast * 0.20,
        effort: 'high',
        recommendation: 'Investir em sensores IoT e modelo ML de predição de falhas'
      });
    }

    // Port fee optimization
    const portForecast = forecasts.find(f => f.category === 'port_fees');
    if (portForecast && portForecast.forecast > 20000) {
      savings.push({
        category: 'port_fees',
        opportunity: 'Negociação de tarifas portuárias',
        potentialSavings: portForecast.forecast * 0.10,
        effort: 'medium',
        recommendation: 'Consolidar operações em portos com acordos preferenciais'
      });
    }

    // Provisions optimization
    const provisionsForecast = forecasts.find(f => f.category === 'provisions');
    if (provisionsForecast) {
      savings.push({
        category: 'provisions',
        opportunity: 'Compras consolidadas e planejamento de menu',
        potentialSavings: provisionsForecast.forecast * 0.12,
        effort: 'low',
        recommendation: 'Implementar sistema de gestão de provisões com IA'
      });
    }

    return savings.sort((a, b) => b.potentialSavings - a.potentialSavings);
  }

  private generateAssumptions(historicalData: HistoricalCost[]): string[] {
    return [
      'Previsão baseada em dados históricos dos últimos 12 meses',
      'Assume operação normal sem grandes variações de atividade',
      'Custos de combustível baseados em preços médios recentes',
      'Não considera eventos extraordinários ou força maior',
      'Taxa de câmbio mantida nos níveis atuais',
      'Cronograma de manutenção sem alterações significativas'
    ];
  }

  private calculateAccuracyMetrics(historicalData: HistoricalCost[]): {
    historicalMAE: number;
    historicalMAPE: number;
    modelConfidence: number;
  } {
    if (historicalData.length < 30) {
      return {
        historicalMAE: 0,
        historicalMAPE: 0,
        modelConfidence: 0.5
      };
    }

    // Simulate backtesting (in production, this would use actual backtest results)
    const amounts = historicalData.map(h => h.amount);
    const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    
    const mae = amounts.reduce((sum, a) => sum + Math.abs(a - mean), 0) / amounts.length;
    const mape = (mae / mean) * 100;

    return {
      historicalMAE: Math.round(mae),
      historicalMAPE: Math.round(mape * 10) / 10,
      modelConfidence: Math.max(0.6, Math.min(0.95, 1 - mape / 100))
    };
  }

  async optimizeBunker(
    currentPrice: number,
    historicalPrices: Array<{ date: Date; price: number; port: string }>,
    availablePorts: Array<{ code: string; name: string; price: number }>
  ): Promise<BunkerOptimization> {
    // Analyze price trend
    const sortedPrices = [...historicalPrices].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const recentPrices = sortedPrices.slice(0, 30).map(p => p.price);
    const avgRecent = recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length;
    const trend = this.calculatePriceTrend(sortedPrices);

    // Forecast price
    const forecastedPrice = avgRecent * (1 + trend * 0.01);

    // Determine direction
    let priceDirection: BunkerOptimization['priceDirection'];
    if (trend > 3) priceDirection = 'up';
    else if (trend < -3) priceDirection = 'down';
    else priceDirection = 'stable';

    // Rank ports by value
    const rankedPorts = availablePorts
      .map(port => ({
        portCode: port.code,
        portName: port.name,
        price: port.price,
        savings: (currentPrice - port.price) * 500, // Assume 500 tons
        optimalQuantity: this.calculateOptimalQuantity(port.price, avgRecent, trend),
        bestTime: this.determineBestTime(trend)
      }))
      .sort((a, b) => a.price - b.price);

    // Determine buy signal
    let buySignal: BunkerOptimization['buySignal'];
    const priceVsAvg = (currentPrice - avgRecent) / avgRecent;
    
    if (priceVsAvg < -0.1 && trend < 0) buySignal = 'strong_buy';
    else if (priceVsAvg < -0.05) buySignal = 'buy';
    else if (priceVsAvg > 0.1) buySignal = 'wait';
    else buySignal = 'hold';

    return {
      currentPrice,
      forecastedPrice: Math.round(forecastedPrice * 100) / 100,
      priceDirection,
      recommendedPorts: rankedPorts.slice(0, 5),
      buySignal,
      confidence: 0.75 + (Math.abs(trend) < 5 ? 0.1 : 0)
    };
  }

  private calculatePriceTrend(prices: Array<{ date: Date; price: number }>): number {
    if (prices.length < 5) return 0;

    const recent = prices.slice(0, 10).map(p => p.price);
    const older = prices.slice(10, 20).map(p => p.price);

    if (older.length === 0) return 0;

    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;

    return ((recentAvg - olderAvg) / olderAvg) * 100;
  }

  private calculateOptimalQuantity(portPrice: number, avgPrice: number, trend: number): number {
    const baseQuantity = 500; // tons
    const priceAdvantage = (avgPrice - portPrice) / avgPrice;
    const trendMultiplier = trend < 0 ? 0.8 : trend > 5 ? 1.3 : 1;

    return Math.round(baseQuantity * (1 + priceAdvantage * 0.5) * trendMultiplier);
  }

  private determineBestTime(trend: number): string {
    if (trend > 5) return 'Imediatamente - preços subindo';
    if (trend < -5) return 'Aguardar 1-2 semanas - tendência de queda';
    return 'Flexível - mercado estável';
  }
}

export const costForecastingEngine = new CostForecastingEngine();
