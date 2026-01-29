/**
 * 📈 Market Oracle - Maritime Market Intelligence AI
 * PATCH REVOLUTION v2.0
 * 
 * Predição de charter rates, bunker prices e tendências de mercado
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export interface MarketPrediction {
  id: string;
  metric: MarketMetric;
  currentValue: number;
  predictedValue: number;
  changePercent: number;
  confidence: number;
  timeframe: '1w' | '1m' | '3m' | '6m' | '1y';
  trend: 'bullish' | 'bearish' | 'neutral';
  factors: string[];
  generatedAt: Date;
}

export type MarketMetric = 
  | 'bunker_ifo380'
  | 'bunker_vlsfo'
  | 'bunker_mgo'
  | 'charter_tanker_vlcc'
  | 'charter_tanker_suezmax'
  | 'charter_tanker_aframax'
  | 'charter_bulk_capesize'
  | 'charter_bulk_panamax'
  | 'charter_bulk_supramax'
  | 'charter_container_large'
  | 'charter_container_feeder'
  | 'freight_index_bdi'
  | 'freight_index_bdti'
  | 'usd_brl'
  | 'oil_brent'
  | 'oil_wti';

export interface MarketAlert {
  id: string;
  metric: MarketMetric;
  alertType: 'price_spike' | 'price_drop' | 'trend_reversal' | 'opportunity' | 'risk';
  title: string;
  description: string;
  impact: string;
  recommendation: string;
  createdAt: Date;
}

export interface MarketAnalysis {
  summary: string;
  outlook: 'very_bullish' | 'bullish' | 'neutral' | 'bearish' | 'very_bearish';
  keyFactors: Array<{ factor: string; impact: 'positive' | 'negative' | 'neutral'; weight: number }>;
  opportunities: string[];
  risks: string[];
  recommendations: string[];
}

export interface HistoricalDataPoint {
  date: Date;
  value: number;
  volume?: number;
}

// Mock current market data (in production, this would come from real APIs)
const CURRENT_MARKET_DATA: Record<MarketMetric, { value: number; unit: string; name: string }> = {
  bunker_ifo380: { value: 485, unit: 'USD/MT', name: 'IFO 380' },
  bunker_vlsfo: { value: 625, unit: 'USD/MT', name: 'VLSFO' },
  bunker_mgo: { value: 820, unit: 'USD/MT', name: 'MGO' },
  charter_tanker_vlcc: { value: 42500, unit: 'USD/day', name: 'VLCC' },
  charter_tanker_suezmax: { value: 35000, unit: 'USD/day', name: 'Suezmax' },
  charter_tanker_aframax: { value: 28000, unit: 'USD/day', name: 'Aframax' },
  charter_bulk_capesize: { value: 18500, unit: 'USD/day', name: 'Capesize' },
  charter_bulk_panamax: { value: 14200, unit: 'USD/day', name: 'Panamax' },
  charter_bulk_supramax: { value: 12800, unit: 'USD/day', name: 'Supramax' },
  charter_container_large: { value: 45000, unit: 'USD/day', name: 'Container (Large)' },
  charter_container_feeder: { value: 22000, unit: 'USD/day', name: 'Container (Feeder)' },
  freight_index_bdi: { value: 1485, unit: 'points', name: 'Baltic Dry Index' },
  freight_index_bdti: { value: 892, unit: 'points', name: 'Baltic Dirty Tanker Index' },
  usd_brl: { value: 5.12, unit: 'BRL', name: 'USD/BRL' },
  oil_brent: { value: 78.50, unit: 'USD/barrel', name: 'Brent Crude' },
  oil_wti: { value: 74.20, unit: 'USD/barrel', name: 'WTI Crude' },
};

// Market factors that influence prices
const MARKET_FACTORS = {
  geopolitical: [
    'Tensões no Oriente Médio',
    'Sanções à Rússia',
    'Disputas comerciais EUA-China',
    'Instabilidade no Mar Vermelho',
    'Eleições em economias-chave',
  ],
  economic: [
    'Taxas de juros do Fed',
    'Crescimento do PIB chinês',
    'Inflação global',
    'Força do dólar',
    'Demanda industrial',
  ],
  supply: [
    'Capacidade de frota global',
    'Entregas de navios novos',
    'Taxa de demolição',
    'Congestionamento portuário',
    'Capacidade de refinarias',
  ],
  seasonal: [
    'Demanda sazonal de aquecimento',
    'Temporada de furacões',
    'Ano Novo Chinês',
    'Safra de grãos',
    'Período de manutenção de refinarias',
  ],
  regulatory: [
    'Regulações IMO de emissões',
    'ECA zones expansion',
    'Carbon pricing schemes',
    'Bállast water requirements',
  ],
};

class MarketOracle {
  
  // Get current market data
  getCurrentMarketData(): Record<MarketMetric, { value: number; unit: string; name: string }> {
    return CURRENT_MARKET_DATA;
  }

  // Generate market prediction
  async generatePrediction(
    metric: MarketMetric,
    timeframe: MarketPrediction['timeframe'] = '1m'
  ): Promise<MarketPrediction> {
    const current = CURRENT_MARKET_DATA[metric];
    
    // Simulate prediction based on historical patterns and factors
    const { predictedChange, confidence, factors } = this.calculatePrediction(metric, timeframe);
    
    const predictedValue = current.value * (1 + predictedChange / 100);
    const trend: MarketPrediction['trend'] = 
      predictedChange > 3 ? 'bullish' : predictedChange < -3 ? 'bearish' : 'neutral';

    const prediction: MarketPrediction = {
      id: crypto.randomUUID(),
      metric,
      currentValue: current.value,
      predictedValue: Math.round(predictedValue * 100) / 100,
      changePercent: Math.round(predictedChange * 100) / 100,
      confidence,
      timeframe,
      trend,
      factors,
      generatedAt: new Date(),
    };

    // Store prediction for tracking
    await this.storePrediction(prediction);

    return prediction;
  }

  // Calculate prediction based on simulated model
  private calculatePrediction(
    metric: MarketMetric,
    timeframe: string
  ): { predictedChange: number; confidence: number; factors: string[] } {
    // Base volatility by metric type
    const volatility = this.getVolatility(metric);
    
    // Time multiplier
    const timeMultiplier = {
      '1w': 0.3,
      '1m': 1,
      '3m': 1.8,
      '6m': 2.5,
      '1y': 3.5,
    }[timeframe] || 1;

    // Random walk with drift (simplified model)
    const drift = this.getDrift(metric);
    const randomComponent = (Math.random() - 0.5) * volatility * timeMultiplier;
    const predictedChange = drift * timeMultiplier + randomComponent;

    // Confidence decreases with time
    const baseConfidence = 85;
    const confidence = Math.max(50, baseConfidence - (timeMultiplier - 1) * 8);

    // Select relevant factors
    const factors = this.selectRelevantFactors(metric, predictedChange);

    return { predictedChange, confidence, factors };
  }

  // Get volatility for a metric
  private getVolatility(metric: MarketMetric): number {
    if (metric.startsWith('bunker')) return 15;
    if (metric.startsWith('charter')) return 25;
    if (metric.startsWith('freight')) return 20;
    if (metric.startsWith('oil')) return 12;
    if (metric === 'usd_brl') return 8;
    return 15;
  }

  // Get drift (long-term trend) for a metric
  private getDrift(metric: MarketMetric): number {
    // Simulated current market outlook
    const drifts: Partial<Record<MarketMetric, number>> = {
      bunker_vlsfo: 3,
      charter_tanker_vlcc: 5,
      charter_bulk_capesize: -2,
      freight_index_bdi: 2,
      oil_brent: 4,
    };
    return drifts[metric] || 0;
  }

  // Select factors relevant to the prediction
  private selectRelevantFactors(metric: MarketMetric, change: number): string[] {
    const factors: string[] = [];
    const allFactors = Object.values(MARKET_FACTORS).flat();
    
    // Select 3-5 random relevant factors
    const numFactors = Math.floor(Math.random() * 3) + 3;
    
    for (let i = 0; i < numFactors && factors.length < numFactors; i++) {
      const factor = allFactors[Math.floor(Math.random() * allFactors.length)];
      if (!factors.includes(factor)) {
        factors.push(factor);
      }
    }

    return factors;
  }

  // Store prediction for accuracy tracking
  private async storePrediction(prediction: MarketPrediction): Promise<void> {
    try {
      await supabase.from('market_predictions').insert({
        metric: prediction.metric,
        current_value: prediction.currentValue,
        predicted_value: prediction.predictedValue,
        change_percent: prediction.changePercent,
        confidence: prediction.confidence,
        timeframe: prediction.timeframe,
        trend: prediction.trend,
        factors: prediction.factors,
        generated_at: prediction.generatedAt.toISOString(),
      });
    } catch (error) {
      logger.warn('Failed to store prediction', { error });
    }
  }

  // Generate comprehensive market analysis
  async generateMarketAnalysis(
    segment: 'tanker' | 'bulk' | 'container' | 'bunker' | 'all' = 'all'
  ): Promise<MarketAnalysis> {
    const metrics = this.getMetricsForSegment(segment);
    const predictions = await Promise.all(
      metrics.map(m => this.generatePrediction(m, '3m'))
    );

    // Calculate overall outlook
    const avgChange = predictions.reduce((sum, p) => sum + p.changePercent, 0) / predictions.length;
    const outlook: MarketAnalysis['outlook'] = 
      avgChange > 8 ? 'very_bullish' :
      avgChange > 3 ? 'bullish' :
      avgChange > -3 ? 'neutral' :
      avgChange > -8 ? 'bearish' : 'very_bearish';

    // Collect all factors with weights
    const factorMap = new Map<string, { count: number; impact: 'positive' | 'negative' | 'neutral' }>();
    predictions.forEach(p => {
      p.factors.forEach(f => {
        const existing = factorMap.get(f) || { count: 0, impact: 'neutral' as const };
        factorMap.set(f, {
          count: existing.count + 1,
          impact: p.changePercent > 3 ? 'positive' : p.changePercent < -3 ? 'negative' : 'neutral',
        });
      });
    });

    const keyFactors = Array.from(factorMap.entries())
      .map(([factor, data]) => ({
        factor,
        impact: data.impact,
        weight: data.count / predictions.length,
      }))
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 5);

    // Generate opportunities
    const opportunities: string[] = [];
    const bullishPredictions = predictions.filter(p => p.trend === 'bullish');
    bullishPredictions.forEach(p => {
      const data = CURRENT_MARKET_DATA[p.metric];
      opportunities.push(`${data.name}: Potencial alta de ${p.changePercent.toFixed(1)}% em 3 meses`);
    });

    // Generate risks
    const risks: string[] = [];
    const bearishPredictions = predictions.filter(p => p.trend === 'bearish');
    bearishPredictions.forEach(p => {
      const data = CURRENT_MARKET_DATA[p.metric];
      risks.push(`${data.name}: Risco de queda de ${Math.abs(p.changePercent).toFixed(1)}%`);
    });

    // Generate recommendations
    const recommendations = this.generateRecommendations(predictions, segment);

    // Generate summary
    const summary = this.generateSummary(segment, outlook, avgChange, predictions);

    return {
      summary,
      outlook,
      keyFactors,
      opportunities: opportunities.slice(0, 3),
      risks: risks.slice(0, 3),
      recommendations,
    };
  }

  // Get metrics for a segment
  private getMetricsForSegment(segment: string): MarketMetric[] {
    switch (segment) {
      case 'tanker':
        return ['charter_tanker_vlcc', 'charter_tanker_suezmax', 'charter_tanker_aframax', 'freight_index_bdti'];
      case 'bulk':
        return ['charter_bulk_capesize', 'charter_bulk_panamax', 'charter_bulk_supramax', 'freight_index_bdi'];
      case 'container':
        return ['charter_container_large', 'charter_container_feeder'];
      case 'bunker':
        return ['bunker_ifo380', 'bunker_vlsfo', 'bunker_mgo', 'oil_brent'];
      default:
        return Object.keys(CURRENT_MARKET_DATA) as MarketMetric[];
    }
  }

  // Generate actionable recommendations
  private generateRecommendations(
    predictions: MarketPrediction[],
    segment: string
  ): string[] {
    const recommendations: string[] = [];

    // Fuel hedging recommendation
    const bunkerPreds = predictions.filter(p => p.metric.startsWith('bunker'));
    const avgBunkerChange = bunkerPreds.reduce((sum, p) => sum + p.changePercent, 0) / (bunkerPreds.length || 1);
    
    if (avgBunkerChange > 5) {
      recommendations.push('Considere hedge de combustível para próximos 6 meses - tendência de alta');
    } else if (avgBunkerChange < -5) {
      recommendations.push('Evite contratos de combustível de longo prazo - preços em queda');
    }

    // Charter rate recommendations
    const charterPreds = predictions.filter(p => p.metric.startsWith('charter'));
    const bullishCharters = charterPreds.filter(p => p.trend === 'bullish');
    
    if (bullishCharters.length > charterPreds.length / 2) {
      recommendations.push('Momento favorável para renegociar contratos de afretamento');
    }

    // Segment-specific recommendations
    if (segment === 'tanker' || segment === 'all') {
      const vlccPred = predictions.find(p => p.metric === 'charter_tanker_vlcc');
      if (vlccPred && vlccPred.changePercent > 10) {
        recommendations.push('Mercado VLCC aquecido - explorar spot market para maximizar receita');
      }
    }

    if (segment === 'bulk' || segment === 'all') {
      const bdiPred = predictions.find(p => p.metric === 'freight_index_bdi');
      if (bdiPred && bdiPred.changePercent < -5) {
        recommendations.push('BDI em queda - considerar contratos de longo prazo para estabilidade');
      }
    }

    // General recommendations
    const avgConfidence = predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length;
    if (avgConfidence < 65) {
      recommendations.push('Alta incerteza no mercado - manter posição conservadora');
    }

    return recommendations.slice(0, 5);
  }

  // Generate analysis summary
  private generateSummary(
    segment: string,
    outlook: MarketAnalysis['outlook'],
    avgChange: number,
    predictions: MarketPrediction[]
  ): string {
    const segmentName = {
      tanker: 'Tanker',
      bulk: 'Granéis (Bulk)',
      container: 'Container',
      bunker: 'Bunker/Combustível',
      all: 'Marítimo Global',
    }[segment];

    const outlookText = {
      very_bullish: 'muito otimista',
      bullish: 'otimista',
      neutral: 'neutro',
      bearish: 'pessimista',
      very_bearish: 'muito pessimista',
    }[outlook];

    const direction = avgChange > 0 ? 'alta' : 'queda';
    const highConfidencePreds = predictions.filter(p => p.confidence > 75);

    return `O mercado ${segmentName} apresenta perspectiva ${outlookText} para os próximos 3 meses, ` +
           `com expectativa de ${direction} média de ${Math.abs(avgChange).toFixed(1)}%. ` +
           `${highConfidencePreds.length} de ${predictions.length} previsões têm alta confiança (>75%).`;
  }

  // Get historical data for charting
  async getHistoricalData(
    metric: MarketMetric,
    days: number = 90
  ): Promise<HistoricalDataPoint[]> {
    const current = CURRENT_MARKET_DATA[metric];
    const volatility = this.getVolatility(metric) / 100;
    const data: HistoricalDataPoint[] = [];

    // Generate synthetic historical data
    let value = current.value;
    const now = new Date();

    for (let i = days; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // Random walk backward
      const change = (Math.random() - 0.5) * volatility * value * 0.1;
      value = value - change; // Going backward, so subtract

      data.push({
        date,
        value: Math.round(value * 100) / 100,
        volume: Math.floor(Math.random() * 1000000),
      });
    }

    // Ensure last value matches current
    data[data.length - 1].value = current.value;

    return data;
  }

  // Check for market alerts
  async checkMarketAlerts(): Promise<MarketAlert[]> {
    const alerts: MarketAlert[] = [];
    const metrics = Object.keys(CURRENT_MARKET_DATA) as MarketMetric[];

    for (const metric of metrics) {
      const prediction = await this.generatePrediction(metric, '1w');
      
      // Check for significant movements
      if (Math.abs(prediction.changePercent) > 8) {
        const isPositive = prediction.changePercent > 0;
        const data = CURRENT_MARKET_DATA[metric];

        alerts.push({
          id: crypto.randomUUID(),
          metric,
          alertType: isPositive ? 'price_spike' : 'price_drop',
          title: `${data.name}: ${isPositive ? 'Alta' : 'Queda'} Significativa Esperada`,
          description: `Previsão de ${isPositive ? 'alta' : 'queda'} de ${Math.abs(prediction.changePercent).toFixed(1)}% na próxima semana.`,
          impact: isPositive && metric.startsWith('bunker') 
            ? 'Aumento nos custos operacionais'
            : isPositive && metric.startsWith('charter')
            ? 'Aumento potencial de receita'
            : 'Revisar orçamento e contratos',
          recommendation: prediction.factors[0] || 'Monitorar situação',
          createdAt: new Date(),
        });
      }
    }

    return alerts;
  }

  // Get price comparison across ports (for bunker)
  getBunkerPricesByPort(): Array<{ port: string; region: string; ifo380: number; vlsfo: number; mgo: number }> {
    // Simulated port prices with regional variations
    return [
      { port: 'Singapore', region: 'Ásia', ifo380: 478, vlsfo: 618, mgo: 815 },
      { port: 'Rotterdam', region: 'Europa', ifo380: 492, vlsfo: 635, mgo: 828 },
      { port: 'Fujairah', region: 'Oriente Médio', ifo380: 465, vlsfo: 605, mgo: 798 },
      { port: 'Houston', region: 'América do Norte', ifo380: 502, vlsfo: 642, mgo: 835 },
      { port: 'Santos', region: 'América do Sul', ifo380: 525, vlsfo: 668, mgo: 862 },
      { port: 'Durban', region: 'África', ifo380: 515, vlsfo: 655, mgo: 848 },
      { port: 'Hong Kong', region: 'Ásia', ifo380: 485, vlsfo: 622, mgo: 818 },
      { port: 'Piraeus', region: 'Europa', ifo380: 488, vlsfo: 630, mgo: 822 },
    ];
  }
}

export const marketOracle = new MarketOracle();
