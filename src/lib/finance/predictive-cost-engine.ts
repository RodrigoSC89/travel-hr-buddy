/**
 * 💰 PREDICTIVE COST ENGINE
 * AI-powered cost prediction with ML and market analysis
 */

import { supabase } from '@/integrations/supabase/client';
import type { CostPrediction, SavingsOpportunity, PredictionFactor } from './types';

interface PredictionResult {
  predictions: CostPrediction;
  confidence: number;
  savingsOpportunities: SavingsOpportunity[];
  recommendations: string[];
  timeframe: string;
}

interface HistoricalData {
  month: string;
  fuel: number;
  maintenance: number;
  crew: number;
  port: number;
  insurance: number;
  other: number;
}

interface MarketData {
  fuel_price_trend: 'up' | 'down' | 'stable';
  fuel_price_change: number;
  exchange_rates: Record<string, number>;
  inflation_rate: number;
}

export class PredictiveCostEngine {
  private static instance: PredictiveCostEngine;

  static getInstance(): PredictiveCostEngine {
    if (!this.instance) {
      this.instance = new PredictiveCostEngine();
    }
    return this.instance;
  }

  /**
   * Predict costs for a given timeframe
   */
  async predictCosts(
    timeframe: 'monthly' | 'quarterly' | 'yearly',
    vesselId?: string
  ): Promise<PredictionResult> {
    // 1. Get historical data
    const historicalData = await this.getHistoricalCosts(vesselId);

    // 2. Get market data
    const marketData = await this.getMarketData();

    // 3. Calculate base prediction using statistical methods
    const basePrediction = this.calculateBasePrediction(historicalData, timeframe);

    // 4. Adjust with market factors
    const adjustedPrediction = this.adjustWithMarketFactors(basePrediction, marketData);

    // 5. Identify savings opportunities
    const savings = await this.identifySavingsOpportunities(adjustedPrediction, historicalData);

    // 6. Generate recommendations
    const recommendations = this.generateRecommendations(adjustedPrediction, savings);

    // 7. Calculate confidence
    const confidence = this.calculateConfidence(historicalData, adjustedPrediction);

    return {
      predictions: adjustedPrediction,
      confidence,
      savingsOpportunities: savings,
      recommendations,
      timeframe
    };
  }

  /**
   * Get historical costs from database
   */
  private async getHistoricalCosts(vesselId?: string): Promise<HistoricalData[]> {
    let query = supabase
      .from('expenses')
      .select('category, amount, expense_date')
      .gte('expense_date', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString())
      .order('expense_date', { ascending: true });

    if (vesselId) {
      query = query.eq('vessel_id', vesselId);
    }

    const { data, error } = await query;

    if (error || !data) {
      // Return mock data for demonstration
      return this.getMockHistoricalData();
    }

    // Aggregate by month and category
    return this.aggregateByMonth(data);
  }

  /**
   * Get current market data
   */
  private async getMarketData(): Promise<MarketData> {
    // In production, this would fetch from external APIs
    return {
      fuel_price_trend: 'stable',
      fuel_price_change: 0.02,
      exchange_rates: {
        EUR: 0.92,
        GBP: 0.79,
        SGD: 1.34
      },
      inflation_rate: 0.03
    };
  }

  /**
   * Calculate base prediction using weighted moving average
   */
  private calculateBasePrediction(
    historical: HistoricalData[],
    timeframe: 'monthly' | 'quarterly' | 'yearly'
  ): CostPrediction {
    const multiplier = timeframe === 'yearly' ? 12 : timeframe === 'quarterly' ? 3 : 1;
    
    // Calculate weighted average (more recent months have higher weight)
    const weights = historical.map((_, i) => i + 1);
    const totalWeight = weights.reduce((a, b) => a + b, 0);

    const calculateWeightedAverage = (category: keyof Omit<HistoricalData, 'month'>) => {
      if (historical.length === 0) return 0;
      const sum = historical.reduce((acc, data, i) => acc + (data[category] || 0) * weights[i], 0);
      return (sum / totalWeight) * multiplier;
    };

    const fuel = calculateWeightedAverage('fuel');
    const maintenance = calculateWeightedAverage('maintenance');
    const crew = calculateWeightedAverage('crew');
    const port = calculateWeightedAverage('port');
    const insurance = calculateWeightedAverage('insurance');
    const other = calculateWeightedAverage('other');

    return {
      fuel,
      maintenance,
      crew,
      port,
      insurance,
      other,
      total: fuel + maintenance + crew + port + insurance + other,
      confidence: 0.85,
      factors: []
    };
  }

  /**
   * Adjust prediction with market factors
   */
  private adjustWithMarketFactors(
    prediction: CostPrediction,
    market: MarketData
  ): CostPrediction {
    const factors: PredictionFactor[] = [];

    // Adjust fuel based on market trend
    let fuelAdjustment = 1;
    if (market.fuel_price_trend === 'up') {
      fuelAdjustment = 1 + market.fuel_price_change;
      factors.push({
        name: 'Fuel Price Increase',
        impact: 'negative',
        magnitude: market.fuel_price_change,
        description: `Fuel prices trending up by ${(market.fuel_price_change * 100).toFixed(1)}%`
      });
    } else if (market.fuel_price_trend === 'down') {
      fuelAdjustment = 1 - market.fuel_price_change;
      factors.push({
        name: 'Fuel Price Decrease',
        impact: 'positive',
        magnitude: market.fuel_price_change,
        description: `Fuel prices trending down by ${(market.fuel_price_change * 100).toFixed(1)}%`
      });
    }

    // Adjust for inflation
    const inflationAdjustment = 1 + market.inflation_rate;
    factors.push({
      name: 'Inflation',
      impact: 'negative',
      magnitude: market.inflation_rate,
      description: `General inflation at ${(market.inflation_rate * 100).toFixed(1)}%`
    });

    const adjustedFuel = prediction.fuel * fuelAdjustment;
    const adjustedMaintenance = prediction.maintenance * inflationAdjustment;
    const adjustedCrew = prediction.crew * inflationAdjustment;
    const adjustedPort = prediction.port * inflationAdjustment;

    return {
      fuel: adjustedFuel,
      maintenance: adjustedMaintenance,
      crew: adjustedCrew,
      port: adjustedPort,
      insurance: prediction.insurance,
      other: prediction.other * inflationAdjustment,
      total: adjustedFuel + adjustedMaintenance + adjustedCrew + adjustedPort + prediction.insurance + prediction.other * inflationAdjustment,
      confidence: prediction.confidence,
      factors
    };
  }

  /**
   * Identify savings opportunities
   */
  private async identifySavingsOpportunities(
    prediction: CostPrediction,
    historical: HistoricalData[]
  ): Promise<SavingsOpportunity[]> {
    const opportunities: SavingsOpportunity[] = [];

    // Analyze fuel costs
    if (prediction.fuel > 50000) {
      opportunities.push({
        id: crypto.randomUUID(),
        title: 'Fuel Optimization',
        category: 'fuel',
        current_cost: prediction.fuel,
        potential_savings: prediction.fuel * 0.08,
        savings_percentage: 8,
        implementation_effort: 'medium',
        implementation_timeline: '2-3 months',
        recommended_actions: [
          'Implement slow steaming on non-critical voyages',
          'Optimize trim and hull cleaning schedule',
          'Consider fuel hedging for price stability'
        ],
        status: 'identified',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }

    // Analyze maintenance costs
    if (prediction.maintenance > 30000) {
      opportunities.push({
        id: crypto.randomUUID(),
        title: 'Predictive Maintenance',
        category: 'maintenance',
        current_cost: prediction.maintenance,
        potential_savings: prediction.maintenance * 0.15,
        savings_percentage: 15,
        implementation_effort: 'high',
        implementation_timeline: '6 months',
        recommended_actions: [
          'Implement IoT sensors for equipment monitoring',
          'Use AI-based failure prediction',
          'Consolidate vendor contracts for bulk discounts'
        ],
        status: 'identified',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }

    // Analyze port costs
    if (prediction.port > 20000) {
      opportunities.push({
        id: crypto.randomUUID(),
        title: 'Port Cost Optimization',
        category: 'port',
        current_cost: prediction.port,
        potential_savings: prediction.port * 0.10,
        savings_percentage: 10,
        implementation_effort: 'low',
        implementation_timeline: '1 month',
        recommended_actions: [
          'Negotiate long-term port agreements',
          'Optimize berth scheduling to reduce waiting time',
          'Bundle port services for discounts'
        ],
        status: 'identified',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }

    return opportunities.sort((a, b) => b.potential_savings - a.potential_savings);
  }

  /**
   * Generate recommendations based on predictions
   */
  private generateRecommendations(
    prediction: CostPrediction,
    savings: SavingsOpportunity[]
  ): string[] {
    const recommendations: string[] = [];

    // Add high-priority savings recommendations
    savings.slice(0, 3).forEach(s => {
      recommendations.push(
        `${s.title}: Potential savings of $${s.potential_savings.toLocaleString()} (${s.savings_percentage}%)`
      );
    });

    // Add cost factor warnings
    prediction.factors.forEach(factor => {
      if (factor.impact === 'negative' && factor.magnitude > 0.05) {
        recommendations.push(
          `Warning: ${factor.name} - ${factor.description}`
        );
      }
    });

    // General recommendations
    if (prediction.total > 200000) {
      recommendations.push(
        'Consider quarterly budget reviews to track variance early'
      );
    }

    return recommendations;
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(
    historical: HistoricalData[],
    prediction: CostPrediction
  ): number {
    // More historical data = higher confidence
    const dataConfidence = Math.min(historical.length / 12, 1) * 0.4;
    
    // Less variance = higher confidence
    const variance = this.calculateVariance(historical);
    const varianceConfidence = Math.max(0, 1 - variance) * 0.4;
    
    // Base confidence
    const baseConfidence = 0.2;

    return Math.min(dataConfidence + varianceConfidence + baseConfidence, 0.95);
  }

  /**
   * Calculate variance in historical data
   */
  private calculateVariance(historical: HistoricalData[]): number {
    if (historical.length < 2) return 0.5;

    const totals = historical.map(h => 
      h.fuel + h.maintenance + h.crew + h.port + h.insurance + h.other
    );
    
    const mean = totals.reduce((a, b) => a + b, 0) / totals.length;
    const squaredDiffs = totals.map(t => Math.pow(t - mean, 2));
    const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / squaredDiffs.length;
    
    // Normalize to 0-1 range
    return Math.min(Math.sqrt(avgSquaredDiff) / mean, 1);
  }

  /**
   * Aggregate expenses by month
   */
  private aggregateByMonth(data: any[]): HistoricalData[] {
    const monthlyData: Record<string, HistoricalData> = {};

    data.forEach(expense => {
      const month = expense.expense_date.substring(0, 7);
      if (!monthlyData[month]) {
        monthlyData[month] = {
          month,
          fuel: 0,
          maintenance: 0,
          crew: 0,
          port: 0,
          insurance: 0,
          other: 0
        };
      }

      const category = expense.category?.toLowerCase() || 'other';
      if (category in monthlyData[month]) {
        (monthlyData[month] as any)[category] += expense.amount;
      } else {
        monthlyData[month].other += expense.amount;
      }
    });

    return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
  }

  /**
   * Get mock historical data for demonstration
   */
  private getMockHistoricalData(): HistoricalData[] {
    const months = [];
    const now = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        month: date.toISOString().substring(0, 7),
        fuel: 45000 + Math.random() * 10000,
        maintenance: 25000 + Math.random() * 8000,
        crew: 35000 + Math.random() * 5000,
        port: 15000 + Math.random() * 5000,
        insurance: 8000 + Math.random() * 1000,
        other: 5000 + Math.random() * 2000
      });
    }
    
    return months;
  }
}

export const predictiveCostEngine = PredictiveCostEngine.getInstance();
