/**
 * Inteligência Competitiva de Frota em Tempo Real (ICFT)
 * Real-time fleet competitive analysis via AIS data
 */

export interface VesselAISData {
  mmsi: string;
  imo?: string;
  name: string;
  type: VesselType;
  flag: string;
  owner?: string;
  position: { lat: number; lng: number };
  heading: number;
  speed: number; // knots
  destination?: string;
  eta?: Date;
  lastUpdate: Date;
  status: 'underway' | 'anchored' | 'moored' | 'not_under_command';
}

export type VesselType = 
  | 'container'
  | 'tanker'
  | 'bulker'
  | 'cargo'
  | 'passenger'
  | 'offshore'
  | 'tug'
  | 'other';

export interface CompetitorProfile {
  id: string;
  name: string;
  vessels: string[]; // MMSIs
  fleetSize: number;
  avgSpeed: number;
  avgAge: number;
  marketShare: number;
  primaryRoutes: string[];
  strengths: string[];
  weaknesses: string[];
}

export interface RouteAnalysis {
  origin: string;
  destination: string;
  distance: number; // nm
  avgTransitTime: number; // days
  competitorCount: number;
  marketRate: number; // $/TEU or $/ton
  ratetrend: 'rising' | 'stable' | 'falling';
  demandLevel: 'low' | 'medium' | 'high';
  yourPerformance: {
    avgSpeed: number;
    avgTransitTime: number;
    efficiencyScore: number;
  };
  competitorPerformance: {
    avgSpeed: number;
    avgTransitTime: number;
    efficiencyScore: number;
  };
  gap: number; // percentage difference
}

export interface MarketOpportunity {
  id: string;
  type: 'route_gap' | 'rate_spike' | 'competitor_exit' | 'seasonal';
  description: string;
  route?: string;
  estimatedValue: number;
  confidence: number;
  timeWindow: string;
  recommendation: string;
}

export interface CompetitiveAlert {
  id: string;
  type: 'performance' | 'market' | 'competitor';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  timestamp: Date;
  actionable: boolean;
  suggestedAction?: string;
}

export interface FleetBenchmark {
  metric: string;
  yourValue: number;
  industryAvg: number;
  topPerformer: number;
  percentile: number;
  trend: 'improving' | 'stable' | 'declining';
}

// Simulated AIS data
const aisDatabase: VesselAISData[] = [
  // Your fleet
  { mmsi: '710001', name: 'Nautilus Voyager', type: 'container', flag: 'BR', position: { lat: -23.98, lng: -46.30 }, heading: 45, speed: 18.5, destination: 'SGSIN', status: 'underway', lastUpdate: new Date() },
  { mmsi: '710002', name: 'Nautilus Pioneer', type: 'container', flag: 'BR', position: { lat: 1.29, lng: 103.85 }, heading: 270, speed: 16.2, destination: 'BRSSZ', status: 'underway', lastUpdate: new Date() },
  // Competitors
  { mmsi: '720001', name: 'Competitor Alpha', type: 'container', flag: 'PA', position: { lat: -22.5, lng: -43.5 }, heading: 90, speed: 19.8, destination: 'CNSHA', status: 'underway', lastUpdate: new Date(), owner: 'Alpha Shipping' },
  { mmsi: '720002', name: 'Competitor Beta', type: 'container', flag: 'LR', position: { lat: 0.5, lng: 105.0 }, heading: 180, speed: 17.5, destination: 'BRSSZ', status: 'underway', lastUpdate: new Date(), owner: 'Beta Lines' },
  { mmsi: '730001', name: 'Gamma Trader', type: 'tanker', flag: 'MT', position: { lat: -25.0, lng: -45.0 }, heading: 120, speed: 14.2, destination: 'AEJEA', status: 'underway', lastUpdate: new Date(), owner: 'Gamma Tankers' }
];

const competitorProfiles: CompetitorProfile[] = [
  {
    id: 'comp-001',
    name: 'Alpha Shipping',
    vessels: ['720001', '720003', '720005'],
    fleetSize: 12,
    avgSpeed: 19.2,
    avgAge: 8,
    marketShare: 15,
    primaryRoutes: ['Santos-Shanghai', 'Santos-Singapore'],
    strengths: ['Fast transit times', 'Modern fleet'],
    weaknesses: ['High fuel costs', 'Limited port coverage']
  },
  {
    id: 'comp-002',
    name: 'Beta Lines',
    vessels: ['720002', '720004'],
    fleetSize: 8,
    avgSpeed: 16.8,
    avgAge: 12,
    marketShare: 10,
    primaryRoutes: ['Brazil-SE Asia', 'Brazil-Europe'],
    strengths: ['Reliable schedules', 'Good customer service'],
    weaknesses: ['Older fleet', 'Slower speeds']
  }
];

/**
 * Competitive Intelligence System
 */
export class CompetitiveIntelligenceSystem {
  private aisData: VesselAISData[] = aisDatabase;
  private competitors: CompetitorProfile[] = competitorProfiles;
  private alerts: CompetitiveAlert[] = [];
  private opportunities: MarketOpportunity[] = [];

  constructor() {
    this.initializeData();
  }

  private initializeData(): void {
    // Generate initial opportunities
    this.opportunities = [
      {
        id: 'opp-001',
        type: 'route_gap',
        description: 'Low competition on Santos-Dubai route',
        route: 'Santos-Dubai',
        estimatedValue: 450000,
        confidence: 0.75,
        timeWindow: 'Next 30 days',
        recommendation: 'Consider adding service on this underserved route'
      },
      {
        id: 'opp-002',
        type: 'rate_spike',
        description: 'Container rates Shanghai-Santos up 12%',
        route: 'Shanghai-Santos',
        estimatedValue: 280000,
        confidence: 0.82,
        timeWindow: 'Next 2 weeks',
        recommendation: 'Maximize capacity on Asia-Brazil services'
      },
      {
        id: 'opp-003',
        type: 'seasonal',
        description: 'Agricultural export season starting',
        route: 'Brazil-China',
        estimatedValue: 600000,
        confidence: 0.9,
        timeWindow: 'Feb-May 2025',
        recommendation: 'Position vessels for bulk grain shipments'
      }
    ];

    // Generate alerts
    this.alerts = [
      {
        id: 'alert-001',
        type: 'performance',
        severity: 'warning',
        title: 'Speed Gap Detected',
        message: 'Nautilus Voyager averaging 18.5 kts vs competitor Alpha at 19.8 kts on same route',
        timestamp: new Date(),
        actionable: true,
        suggestedAction: 'Review engine performance and optimize route'
      },
      {
        id: 'alert-002',
        type: 'market',
        severity: 'info',
        title: 'Rate Trend Update',
        message: 'Spot rates on Santos-Singapore route stable at $1,850/TEU',
        timestamp: new Date(),
        actionable: false
      }
    ];
  }

  /**
   * Get real-time AIS data for all tracked vessels
   */
  getAISData(options?: {
    type?: VesselType;
    yourFleet?: boolean;
  }): VesselAISData[] {
    let filtered = [...this.aisData];

    if (options?.type) {
      filtered = filtered.filter(v => v.type === options.type);
    }
    if (options?.yourFleet) {
      filtered = filtered.filter(v => v.mmsi.startsWith('71')); // Your fleet MMSIs
    }

    return filtered;
  }

  /**
   * Analyze route competition
   */
  analyzeRoute(origin: string, destination: string): RouteAnalysis {
    // Simulated analysis
    const isYourRoute = origin.includes('Santos') || destination.includes('Santos');
    
    return {
      origin,
      destination,
      distance: 9500, // nm
      avgTransitTime: 21,
      competitorCount: 8,
      marketRate: 1850,
      ratetrend: 'rising',
      demandLevel: 'high',
      yourPerformance: {
        avgSpeed: 17.5,
        avgTransitTime: 22.5,
        efficiencyScore: 82
      },
      competitorPerformance: {
        avgSpeed: 18.2,
        avgTransitTime: 21.8,
        efficiencyScore: 86
      },
      gap: isYourRoute ? -4.7 : -8.2 // percentage behind
    };
  }

  /**
   * Get competitor profiles
   */
  getCompetitors(): CompetitorProfile[] {
    return this.competitors;
  }

  /**
   * Get market opportunities
   */
  getOpportunities(): MarketOpportunity[] {
    return this.opportunities;
  }

  /**
   * Get competitive alerts
   */
  getAlerts(unacknowledgedOnly = false): CompetitiveAlert[] {
    return this.alerts;
  }

  /**
   * Get fleet benchmarks
   */
  getBenchmarks(): FleetBenchmark[] {
    return [
      {
        metric: 'Average Speed (kts)',
        yourValue: 17.35,
        industryAvg: 16.8,
        topPerformer: 19.5,
        percentile: 65,
        trend: 'stable'
      },
      {
        metric: 'Fuel Efficiency (tons/1000nm)',
        yourValue: 42.5,
        industryAvg: 45.2,
        topPerformer: 38.0,
        percentile: 72,
        trend: 'improving'
      },
      {
        metric: 'Port Turnaround (hours)',
        yourValue: 18.5,
        industryAvg: 22.0,
        topPerformer: 14.0,
        percentile: 78,
        trend: 'improving'
      },
      {
        metric: 'Schedule Reliability (%)',
        yourValue: 87,
        industryAvg: 82,
        topPerformer: 95,
        percentile: 70,
        trend: 'stable'
      },
      {
        metric: 'Capacity Utilization (%)',
        yourValue: 91,
        industryAvg: 85,
        topPerformer: 96,
        percentile: 80,
        trend: 'improving'
      }
    ];
  }

  /**
   * Get market intelligence summary
   */
  getMarketSummary(): {
    totalVesselsTracked: number;
    competitorsMonitored: number;
    activeOpportunities: number;
    pendingAlerts: number;
    marketSentiment: 'bullish' | 'neutral' | 'bearish';
    spotRateIndex: number;
    spotRateTrend: 'up' | 'flat' | 'down';
  } {
    return {
      totalVesselsTracked: this.aisData.length,
      competitorsMonitored: this.competitors.length,
      activeOpportunities: this.opportunities.length,
      pendingAlerts: this.alerts.filter(a => a.actionable).length,
      marketSentiment: 'bullish',
      spotRateIndex: 1850,
      spotRateTrend: 'up'
    };
  }

  /**
   * Compare your vessel to competitor
   */
  compareVessel(yourMMSI: string, competitorMMSI: string): {
    yourVessel: VesselAISData | null;
    competitor: VesselAISData | null;
    speedDiff: number;
    transitTimeDiff: number;
    recommendation: string;
  } {
    const yourVessel = this.aisData.find(v => v.mmsi === yourMMSI) || null;
    const competitor = this.aisData.find(v => v.mmsi === competitorMMSI) || null;

    const speedDiff = (yourVessel?.speed || 0) - (competitor?.speed || 0);
    const transitTimeDiff = speedDiff !== 0 
      ? (9500 / (competitor?.speed || 17)) - (9500 / (yourVessel?.speed || 17))
      : 0;

    let recommendation = 'Performance is comparable';
    if (speedDiff < -1) {
      recommendation = `Your vessel is ${Math.abs(speedDiff).toFixed(1)} kts slower. Consider engine optimization or route adjustments.`;
    } else if (speedDiff > 1) {
      recommendation = `Your vessel is ${speedDiff.toFixed(1)} kts faster. Competitive advantage confirmed.`;
    }

    return {
      yourVessel,
      competitor,
      speedDiff,
      transitTimeDiff: transitTimeDiff / 24, // in days
      recommendation
    };
  }

  /**
   * Get annual competitive intelligence report
   */
  getAnnualInsights(): {
    marketShareChange: number;
    performanceRank: number;
    totalOpportunitiesIdentified: number;
    opportunitiesCaptured: number;
    competitiveGapsIdentified: number;
    estimatedValueGenerated: number;
  } {
    return {
      marketShareChange: 2.3,
      performanceRank: 4,
      totalOpportunitiesIdentified: 45,
      opportunitiesCaptured: 28,
      competitiveGapsIdentified: 12,
      estimatedValueGenerated: 1850000
    };
  }
}

// Export singleton
export const competitiveIntelligence = new CompetitiveIntelligenceSystem();
