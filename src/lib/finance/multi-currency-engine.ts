/**
 * 💱 MULTI-CURRENCY ENGINE
 * Intelligent currency management and hedging
 */

import type { CurrencyAllocation } from './types';

interface CurrencyRate {
  from: string;
  to: string;
  rate: number;
  timestamp: Date;
  source: string;
}

interface CurrencyExposure {
  currency: string;
  amount: number;
  exposureType: 'receivable' | 'payable';
  dueDate: Date;
}

interface HedgeStrategy {
  hedgeNeeded: boolean;
  hedgeAmount: number;
  hedgeType: 'forward' | 'option' | 'natural';
  reasoning: string;
  expectedCost: number;
  riskReduction: number;
}

interface CurrencyOptimization {
  allocation: CurrencyAllocation[];
  expectedSavings: number;
  riskLevel: 'low' | 'medium' | 'high';
  rationale: string;
}

interface RatePrediction {
  currency: string;
  currentRate: number;
  predictedRate: number;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
  factors: string[];
}

export class MultiCurrencyEngine {
  private static instance: MultiCurrencyEngine;
  private exchangeRates: Map<string, number> = new Map();

  static getInstance(): MultiCurrencyEngine {
    if (!this.instance) {
      this.instance = new MultiCurrencyEngine();
    }
    return this.instance;
  }

  constructor() {
    this.initializeRates();
  }

  /**
   * Initialize exchange rates
   */
  private initializeRates(): void {
    // Base currency: USD
    this.exchangeRates.set('EUR', 0.92);
    this.exchangeRates.set('GBP', 0.79);
    this.exchangeRates.set('SGD', 1.34);
    this.exchangeRates.set('JPY', 149.50);
    this.exchangeRates.set('NOK', 10.85);
    this.exchangeRates.set('AED', 3.67);
    this.exchangeRates.set('CNY', 7.24);
    this.exchangeRates.set('AUD', 1.53);
  }

  /**
   * Get current exchange rate
   */
  getRate(from: string, to: string): number {
    if (from === to) return 1;
    if (from === 'USD') return this.exchangeRates.get(to) || 1;
    if (to === 'USD') return 1 / (this.exchangeRates.get(from) || 1);
    
    // Cross rate
    const fromUSD = this.exchangeRates.get(from) || 1;
    const toUSD = this.exchangeRates.get(to) || 1;
    return toUSD / fromUSD;
  }

  /**
   * Convert amount between currencies
   */
  convert(amount: number, from: string, to: string): number {
    return amount * this.getRate(from, to);
  }

  /**
   * Optimize currency allocation
   */
  async optimizeCurrencyAllocation(
    amount: number,
    currencies: string[]
  ): Promise<CurrencyOptimization> {
    // Get rate predictions
    const predictions = await this.predictRates(currencies, 30);
    
    // Calculate optimal allocation
    const allocation = this.calculateOptimalAllocation(amount, predictions);
    
    // Calculate expected savings
    const savings = this.calculateExpectedSavings(allocation, predictions);
    
    // Assess risk level
    const riskLevel = this.assessRiskLevel(predictions);

    return {
      allocation,
      expectedSavings: savings,
      riskLevel,
      rationale: this.generateRationale(allocation, predictions)
    };
  }

  /**
   * Auto-hedge against currency fluctuations
   */
  async autoHedge(exposures: CurrencyExposure[]): Promise<HedgeStrategy> {
    // Calculate net exposure by currency
    const netExposure = this.calculateNetExposure(exposures);
    
    // Analyze risk for each currency
    const riskAnalysis = await this.analyzeExposureRisk(netExposure);
    
    // Determine if hedging is needed
    if (riskAnalysis.totalRisk < 0.05) {
      return {
        hedgeNeeded: false,
        hedgeAmount: 0,
        hedgeType: 'natural',
        reasoning: 'Currency exposure is within acceptable risk tolerance',
        expectedCost: 0,
        riskReduction: 0
      };
    }

    // Calculate hedge strategy
    const hedgeAmount = riskAnalysis.highRiskAmount * 0.7; // Hedge 70% of high-risk exposure
    
    return {
      hedgeNeeded: true,
      hedgeAmount,
      hedgeType: this.selectHedgeType(riskAnalysis),
      reasoning: `High currency volatility detected. Recommend hedging ${(hedgeAmount / riskAnalysis.totalExposure * 100).toFixed(1)}% of exposure`,
      expectedCost: hedgeAmount * 0.015, // Approximate 1.5% hedging cost
      riskReduction: 0.6 // 60% risk reduction
    };
  }

  /**
   * Predict exchange rates
   */
  async predictRates(currencies: string[], days: number): Promise<RatePrediction[]> {
    const predictions: RatePrediction[] = [];

    for (const currency of currencies) {
      const currentRate = this.exchangeRates.get(currency) || 1;
      
      // Simple prediction model (in production would use ML)
      const volatility = this.getVolatility(currency);
      const trend = this.getTrend(currency);
      const change = trend * volatility * (days / 30);
      const predictedRate = currentRate * (1 + change);

      predictions.push({
        currency,
        currentRate,
        predictedRate,
        confidence: 0.7 - (days / 365 * 0.3), // Confidence decreases with time
        trend: change > 0.01 ? 'up' : change < -0.01 ? 'down' : 'stable',
        factors: this.getInfluencingFactors(currency)
      });
    }

    return predictions;
  }

  /**
   * Get all supported currencies
   */
  getSupportedCurrencies(): string[] {
    return ['USD', ...Array.from(this.exchangeRates.keys())];
  }

  /**
   * Calculate optimal allocation
   */
  private calculateOptimalAllocation(
    amount: number,
    predictions: RatePrediction[]
  ): CurrencyAllocation[] {
    const allocations: CurrencyAllocation[] = [];
    
    // Score currencies by expected appreciation
    const scored = predictions.map(p => ({
      ...p,
      score: (p.predictedRate - p.currentRate) / p.currentRate * p.confidence
    })).sort((a, b) => b.score - a.score);

    // Allocate more to currencies expected to appreciate
    let remaining = amount;
    const totalScore = scored.reduce((sum, s) => sum + Math.max(0, s.score + 0.1), 0);

    for (const currency of scored) {
      const weight = Math.max(0, currency.score + 0.1) / totalScore;
      const allocation = Math.min(remaining, amount * weight);
      
      if (allocation > 0) {
        allocations.push({
          currency: currency.currency,
          amount: allocation,
          percentage: (allocation / amount) * 100,
          expected_rate: currency.predictedRate
        });
        remaining -= allocation;
      }
    }

    // Allocate any remaining to USD
    if (remaining > 0) {
      const usdAlloc = allocations.find(a => a.currency === 'USD');
      if (usdAlloc) {
        usdAlloc.amount += remaining;
        usdAlloc.percentage = (usdAlloc.amount / amount) * 100;
      } else {
        allocations.push({
          currency: 'USD',
          amount: remaining,
          percentage: (remaining / amount) * 100,
          expected_rate: 1
        });
      }
    }

    return allocations;
  }

  /**
   * Calculate expected savings
   */
  private calculateExpectedSavings(
    allocation: CurrencyAllocation[],
    predictions: RatePrediction[]
  ): number {
    let savings = 0;

    for (const alloc of allocation) {
      const prediction = predictions.find(p => p.currency === alloc.currency);
      if (prediction && prediction.currency !== 'USD') {
        const appreciation = (prediction.predictedRate - prediction.currentRate) / prediction.currentRate;
        savings += alloc.amount * appreciation * prediction.confidence;
      }
    }

    return Math.max(0, savings);
  }

  /**
   * Assess risk level
   */
  private assessRiskLevel(predictions: RatePrediction[]): 'low' | 'medium' | 'high' {
    const avgConfidence = predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length;
    const hasVolatile = predictions.some(p => Math.abs(p.predictedRate - p.currentRate) / p.currentRate > 0.1);

    if (avgConfidence < 0.5 || hasVolatile) return 'high';
    if (avgConfidence < 0.7) return 'medium';
    return 'low';
  }

  /**
   * Generate rationale
   */
  private generateRationale(
    allocation: CurrencyAllocation[],
    predictions: RatePrediction[]
  ): string {
    const parts: string[] = [];

    for (const alloc of allocation.slice(0, 3)) {
      const prediction = predictions.find(p => p.currency === alloc.currency);
      if (prediction) {
        parts.push(
          `${alloc.currency} (${alloc.percentage.toFixed(1)}%): ${prediction.trend} trend with ${(prediction.confidence * 100).toFixed(0)}% confidence`
        );
      }
    }

    return parts.join('; ');
  }

  /**
   * Calculate net exposure
   */
  private calculateNetExposure(exposures: CurrencyExposure[]): Map<string, number> {
    const net = new Map<string, number>();

    for (const exp of exposures) {
      const current = net.get(exp.currency) || 0;
      const amount = exp.exposureType === 'receivable' ? exp.amount : -exp.amount;
      net.set(exp.currency, current + amount);
    }

    return net;
  }

  /**
   * Analyze exposure risk
   */
  private async analyzeExposureRisk(netExposure: Map<string, number>): Promise<{
    totalRisk: number;
    totalExposure: number;
    highRiskAmount: number;
    riskByCurrency: Map<string, number>;
  }> {
    const riskByCurrency = new Map<string, number>();
    let totalExposure = 0;
    let highRiskAmount = 0;

    for (const [currency, amount] of netExposure) {
      const absAmount = Math.abs(amount);
      totalExposure += absAmount;
      
      const volatility = this.getVolatility(currency);
      const risk = volatility * absAmount;
      riskByCurrency.set(currency, risk);
      
      if (volatility > 0.1) {
        highRiskAmount += absAmount;
      }
    }

    const totalRisk = Array.from(riskByCurrency.values()).reduce((sum, r) => sum + r, 0) / totalExposure;

    return { totalRisk, totalExposure, highRiskAmount, riskByCurrency };
  }

  /**
   * Select hedge type
   */
  private selectHedgeType(riskAnalysis: { totalRisk: number }): 'forward' | 'option' | 'natural' {
    if (riskAnalysis.totalRisk > 0.15) return 'option'; // High volatility - use options for flexibility
    if (riskAnalysis.totalRisk > 0.08) return 'forward'; // Moderate - use forwards for certainty
    return 'natural'; // Low - natural hedging sufficient
  }

  /**
   * Get currency volatility
   */
  private getVolatility(currency: string): number {
    const volatilities: Record<string, number> = {
      EUR: 0.06,
      GBP: 0.08,
      SGD: 0.04,
      JPY: 0.09,
      NOK: 0.10,
      AED: 0.01,
      CNY: 0.05,
      AUD: 0.08
    };
    return volatilities[currency] || 0.05;
  }

  /**
   * Get currency trend
   */
  private getTrend(currency: string): number {
    // Mock trends (-1 to 1)
    const trends: Record<string, number> = {
      EUR: -0.02,
      GBP: 0.01,
      SGD: 0.03,
      JPY: -0.05,
      NOK: 0.02,
      AED: 0,
      CNY: -0.01,
      AUD: 0.01
    };
    return trends[currency] || 0;
  }

  /**
   * Get influencing factors
   */
  private getInfluencingFactors(currency: string): string[] {
    const factors: Record<string, string[]> = {
      EUR: ['ECB monetary policy', 'European economic outlook', 'Energy prices'],
      GBP: ['Bank of England rates', 'Brexit trade impacts', 'UK inflation'],
      SGD: ['Regional trade flows', 'MAS policy', 'Asian market trends'],
      JPY: ['BoJ yield curve control', 'Risk sentiment', 'Trade balance'],
      NOK: ['Oil prices', 'Norges Bank policy', 'European outlook'],
      AED: ['USD peg stability', 'Oil revenues', 'Regional stability'],
      CNY: ['PBOC policy', 'Trade tensions', 'Capital flows'],
      AUD: ['RBA rates', 'Commodity prices', 'China demand']
    };
    return factors[currency] || ['Market conditions', 'Interest rate differentials'];
  }
}

export const multiCurrencyEngine = MultiCurrencyEngine.getInstance();
