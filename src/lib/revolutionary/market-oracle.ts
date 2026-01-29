/**
 * 📈 Market Oracle - Maritime Market Intelligence AI
 * PATCH REVOLUTION v2.0
 * 
 * Predição de charter rates, bunker prices e tendências de mercado
 * Versão simplificada com dados simulados
 */

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
  | 'bunker_vlsfo' | 'bunker_mgo' | 'bunker_ifo380'
  | 'charter_tanker_vlcc' | 'charter_tanker_suezmax' | 'charter_bulk_capesize'
  | 'charter_bulk_panamax' | 'freight_index_bdi' | 'oil_brent';

export interface MarketAlert {
  id: string;
  metric: MarketMetric;
  alertType: 'price_spike' | 'price_drop' | 'trend_reversal' | 'opportunity' | 'risk';
  title: string;
  description: string;
  recommendation: string;
  createdAt: Date;
}

export interface MarketAnalysis {
  summary: string;
  outlook: 'very_bullish' | 'bullish' | 'neutral' | 'bearish' | 'very_bearish';
  keyFactors: Array<{ factor: string; impact: 'positive' | 'negative' | 'neutral' }>;
  opportunities: string[];
  risks: string[];
  recommendations: string[];
}

// Current market data
const MARKET_DATA: Record<MarketMetric, { value: number; unit: string; name: string }> = {
  bunker_vlsfo: { value: 625, unit: 'USD/MT', name: 'VLSFO' },
  bunker_mgo: { value: 820, unit: 'USD/MT', name: 'MGO' },
  bunker_ifo380: { value: 485, unit: 'USD/MT', name: 'IFO 380' },
  charter_tanker_vlcc: { value: 42500, unit: 'USD/day', name: 'VLCC' },
  charter_tanker_suezmax: { value: 35000, unit: 'USD/day', name: 'Suezmax' },
  charter_bulk_capesize: { value: 18500, unit: 'USD/day', name: 'Capesize' },
  charter_bulk_panamax: { value: 14200, unit: 'USD/day', name: 'Panamax' },
  freight_index_bdi: { value: 1485, unit: 'points', name: 'Baltic Dry Index' },
  oil_brent: { value: 78.50, unit: 'USD/barrel', name: 'Brent Crude' },
};

class MarketOracle {
  // Get current market data
  getCurrentMarketData(): Record<MarketMetric, { value: number; unit: string; name: string }> {
    return MARKET_DATA;
  }

  // Generate prediction for a metric
  async generatePrediction(metric: MarketMetric, timeframe: '1w' | '1m' | '3m' = '1m'): Promise<MarketPrediction> {
    const current = MARKET_DATA[metric];
    const changePercent = (Math.random() - 0.4) * 15; // -6% to +9%
    const predictedValue = current.value * (1 + changePercent / 100);
    
    const trend = changePercent > 2 ? 'bullish' : changePercent < -2 ? 'bearish' : 'neutral';

    return {
      id: `pred-${Date.now()}`,
      metric,
      currentValue: current.value,
      predictedValue: Math.round(predictedValue * 100) / 100,
      changePercent: Math.round(changePercent * 100) / 100,
      confidence: 70 + Math.random() * 25,
      timeframe,
      trend,
      factors: [
        'Demanda global de commodities',
        'Tensões geopolíticas',
        'Variação cambial',
        'Capacidade da frota mundial',
      ],
      generatedAt: new Date(),
    };
  }

  // Get market alerts
  async getMarketAlerts(): Promise<MarketAlert[]> {
    return [
      {
        id: 'alert-1',
        metric: 'bunker_vlsfo',
        alertType: 'price_spike',
        title: 'Alta no preço do VLSFO',
        description: 'Preço do VLSFO subiu 5% na última semana devido a restrições de refino.',
        recommendation: 'Considere antecipação de abastecimentos programados.',
        createdAt: new Date(),
      },
      {
        id: 'alert-2',
        metric: 'charter_bulk_capesize',
        alertType: 'opportunity',
        title: 'Oportunidade em Capesize',
        description: 'Taxas de Capesize em baixa sazonal - bom momento para fixar contratos de longo prazo.',
        recommendation: 'Avalie contratos time charter para Q2 2025.',
        createdAt: new Date(Date.now() - 86400000),
      },
      {
        id: 'alert-3',
        metric: 'freight_index_bdi',
        alertType: 'trend_reversal',
        title: 'BDI em tendência de alta',
        description: 'Baltic Dry Index mostra reversão após 3 semanas de queda.',
        recommendation: 'Monitore posições spot para capturar alta.',
        createdAt: new Date(Date.now() - 172800000),
      },
    ];
  }

  // Get comprehensive market analysis
  async getMarketAnalysis(): Promise<MarketAnalysis> {
    return {
      summary: 'O mercado marítimo apresenta perspectivas mistas para o próximo trimestre. O setor de tankers mostra força com taxas acima da média, enquanto bulk carriers enfrentam pressão sazonal.',
      outlook: 'bullish',
      keyFactors: [
        { factor: 'Demanda chinesa por commodities', impact: 'positive' },
        { factor: 'Tensões no Mar Vermelho', impact: 'positive' },
        { factor: 'Regulamentações ambientais IMO', impact: 'negative' },
        { factor: 'Taxa de novos pedidos de navios', impact: 'neutral' },
      ],
      opportunities: [
        'Contratos de longo prazo em tankers',
        'Mercado spot de bulk durante recuperação',
        'Navios com scrubbers têm vantagem competitiva',
      ],
      risks: [
        'Volatilidade geopolítica',
        'Recessão em economias desenvolvidas',
        'Excesso de oferta em segmentos específicos',
      ],
      recommendations: [
        'Manter exposição diversificada entre segmentos',
        'Aproveitar hedge de combustível com preços atuais',
        'Monitorar closely mudanças regulatórias',
      ],
    };
  }

  // Get historical data (simulated)
  async getHistoricalData(metric: MarketMetric, days: number = 30): Promise<Array<{ date: Date; value: number }>> {
    const current = MARKET_DATA[metric].value;
    const data = [];
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const variance = (Math.random() - 0.5) * current * 0.1;
      data.push({
        date,
        value: Math.round((current + variance) * 100) / 100,
      });
    }
    
    return data;
  }

  // Get market summary stats
  async getMarketSummary(): Promise<{
    bunkerAvg: number;
    charterAvg: number;
    bdiValue: number;
    overallTrend: string;
  }> {
    return {
      bunkerAvg: (MARKET_DATA.bunker_vlsfo.value + MARKET_DATA.bunker_mgo.value) / 2,
      charterAvg: (MARKET_DATA.charter_tanker_vlcc.value + MARKET_DATA.charter_bulk_capesize.value) / 2,
      bdiValue: MARKET_DATA.freight_index_bdi.value,
      overallTrend: 'bullish',
    };
  }
}

export const marketOracle = new MarketOracle();
