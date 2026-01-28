/**
 * Bunker Optimization Engine
 * ML-based fuel procurement optimization using global price analysis
 */

export interface BunkerPort {
  id: string;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  prices: BunkerPrice[];
  availability: PortAvailability;
  quality: FuelQuality;
  waitingTime: number; // hours
  portCharges: number;
}

export interface BunkerPrice {
  fuelType: 'VLSFO' | 'HSFO' | 'MGO' | 'LSMGO';
  pricePerTon: number;
  currency: string;
  lastUpdated: Date;
  trend: 'rising' | 'stable' | 'falling';
  forecastNextWeek: number;
}

export interface PortAvailability {
  status: 'available' | 'limited' | 'unavailable';
  estimatedWaitTime: number;
  nextAvailableSlot: Date;
  maxQuantity: number;
}

export interface FuelQuality {
  sulphurContent: number;
  densityAt15C: number;
  viscosityAt50C: number;
  flashPoint: number;
  certifications: string[];
}

export interface VesselFuelRequirement {
  vesselId: string;
  vesselName: string;
  currentPosition: { latitude: number; longitude: number };
  currentFuel: number;
  fuelCapacity: number;
  dailyConsumption: number;
  preferredFuelType: 'VLSFO' | 'HSFO' | 'MGO' | 'LSMGO';
  minQualitySpecs: Partial<FuelQuality>;
  routeDestination: { latitude: number; longitude: number; name: string };
  estimatedArrival: Date;
  maxDeviation: number; // nautical miles
}

export interface BunkerRecommendation {
  port: BunkerPort;
  fuelType: 'VLSFO' | 'HSFO' | 'MGO' | 'LSMGO';
  recommendedQuantity: number;
  estimatedCost: number;
  savings: number;
  savingsPercent: number;
  deviation: number;
  arrivalDelay: number; // hours
  confidence: number;
  reasoning: string[];
  risks: string[];
  alternativeOptions: AlternativeOption[];
}

export interface AlternativeOption {
  port: string;
  price: number;
  deviation: number;
  reason: string;
}

export interface MarketAnalysis {
  globalTrend: 'bullish' | 'bearish' | 'neutral';
  avgPriceVLSFO: number;
  avgPriceMGO: number;
  priceVolatility: number;
  supplyOutlook: string;
  geopoliticalRisks: string[];
  recommendedStrategy: 'buy_now' | 'wait' | 'hedge';
  nextMajorPriceMove: {
    direction: 'up' | 'down';
    magnitude: number;
    confidence: number;
    timeframe: string;
  };
}

export interface BunkerPlan {
  vesselId: string;
  generatedAt: Date;
  validUntil: Date;
  primaryRecommendation: BunkerRecommendation;
  alternatives: BunkerRecommendation[];
  marketAnalysis: MarketAnalysis;
  totalPotentialSavings: number;
  executionWindow: { start: Date; end: Date };
  alerts: BunkerAlert[];
}

export interface BunkerAlert {
  type: 'price_drop' | 'price_spike' | 'shortage' | 'quality_issue' | 'weather';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  affectedPorts: string[];
  validUntil: Date;
}

class BunkerOptimizationEngine {
  private readonly EARTH_RADIUS = 6371; // km
  private portDatabase: Map<string, BunkerPort> = new Map();
  private priceHistory: Map<string, { date: Date; price: number }[]> = new Map();
  private alerts: BunkerAlert[] = [];

  async optimizeBunkering(
    requirement: VesselFuelRequirement,
    availablePorts: BunkerPort[]
  ): Promise<BunkerPlan> {
    // Update port database
    for (const port of availablePorts) {
      this.portDatabase.set(port.id, port);
    }

    // Filter eligible ports
    const eligiblePorts = this.filterEligiblePorts(requirement, availablePorts);

    // Score and rank ports
    const rankedOptions = this.rankBunkeringOptions(requirement, eligiblePorts);

    // Generate market analysis
    const marketAnalysis = this.analyzeMarket(availablePorts);

    // Select best options
    const primaryRecommendation = rankedOptions[0];
    const alternatives = rankedOptions.slice(1, 4);

    // Generate alerts
    const alerts = this.generateAlerts(requirement, availablePorts);

    return {
      vesselId: requirement.vesselId,
      generatedAt: new Date(),
      validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000), // Valid for 24 hours
      primaryRecommendation,
      alternatives,
      marketAnalysis,
      totalPotentialSavings: this.calculateTotalSavings(primaryRecommendation, rankedOptions),
      executionWindow: this.calculateExecutionWindow(requirement, primaryRecommendation),
      alerts
    };
  }

  private filterEligiblePorts(
    requirement: VesselFuelRequirement,
    ports: BunkerPort[]
  ): BunkerPort[] {
    return ports.filter(port => {
      // Check distance deviation
      const deviation = this.calculateDeviation(
        requirement.currentPosition,
        requirement.routeDestination,
        { latitude: port.latitude, longitude: port.longitude }
      );
      
      if (deviation > requirement.maxDeviation) return false;

      // Check availability
      if (port.availability.status === 'unavailable') return false;

      // Check fuel type availability
      const hasRequiredFuel = port.prices.some(p => 
        p.fuelType === requirement.preferredFuelType
      );
      if (!hasRequiredFuel) return false;

      // Check quality specs
      if (requirement.minQualitySpecs.sulphurContent) {
        if (port.quality.sulphurContent > requirement.minQualitySpecs.sulphurContent) {
          return false;
        }
      }

      return true;
    });
  }

  private calculateDeviation(
    start: { latitude: number; longitude: number },
    end: { latitude: number; longitude: number },
    port: { latitude: number; longitude: number }
  ): number {
    const directDistance = this.calculateDistance(
      start.latitude, start.longitude,
      end.latitude, end.longitude
    );

    const viaPortDistance = 
      this.calculateDistance(start.latitude, start.longitude, port.latitude, port.longitude) +
      this.calculateDistance(port.latitude, port.longitude, end.latitude, end.longitude);

    return viaPortDistance - directDistance;
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return this.EARTH_RADIUS * c * 0.539957; // nautical miles
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  private rankBunkeringOptions(
    requirement: VesselFuelRequirement,
    ports: BunkerPort[]
  ): BunkerRecommendation[] {
    const recommendations: BunkerRecommendation[] = [];

    // Calculate required quantity
    const daysToDestination = Math.ceil(
      this.calculateDistance(
        requirement.currentPosition.latitude, requirement.currentPosition.longitude,
        requirement.routeDestination.latitude, requirement.routeDestination.longitude
      ) / (12 * 24) // Assuming 12 knots average
    );
    
    const requiredFuel = daysToDestination * requirement.dailyConsumption;
    const safetyBuffer = requiredFuel * 0.2; // 20% safety margin
    const optimalQuantity = Math.max(
      0,
      requiredFuel + safetyBuffer - requirement.currentFuel
    );

    // Get baseline price (average of all ports)
    const baselinePrice = this.calculateBaselinePrice(ports, requirement.preferredFuelType);

    for (const port of ports) {
      const fuelPrice = port.prices.find(p => p.fuelType === requirement.preferredFuelType);
      if (!fuelPrice) continue;

      const deviation = this.calculateDeviation(
        requirement.currentPosition,
        requirement.routeDestination,
        { latitude: port.latitude, longitude: port.longitude }
      );

      const arrivalDelay = (deviation / 12) + port.waitingTime; // hours

      // Calculate total cost including port charges
      const fuelCost = optimalQuantity * fuelPrice.pricePerTon;
      const totalCost = fuelCost + port.portCharges;

      // Calculate savings
      const baselineCost = optimalQuantity * baselinePrice;
      const savings = baselineCost - fuelCost;
      const savingsPercent = (savings / baselineCost) * 100;

      // Score calculation
      const score = this.calculateScore({
        price: fuelPrice.pricePerTon,
        baselinePrice,
        deviation,
        maxDeviation: requirement.maxDeviation,
        waitingTime: port.waitingTime,
        availability: port.availability,
        quality: port.quality,
        priceTrend: fuelPrice.trend
      });

      recommendations.push({
        port,
        fuelType: requirement.preferredFuelType,
        recommendedQuantity: optimalQuantity,
        estimatedCost: totalCost,
        savings: Math.max(0, savings),
        savingsPercent: Math.max(0, savingsPercent),
        deviation,
        arrivalDelay,
        confidence: score,
        reasoning: this.generateReasoning(port, fuelPrice, deviation, savingsPercent),
        risks: this.identifyRisks(port, fuelPrice),
        alternativeOptions: []
      });
    }

    // Sort by score (highest first)
    recommendations.sort((a, b) => b.confidence - a.confidence);

    // Add alternative options to each recommendation
    for (const rec of recommendations) {
      rec.alternativeOptions = recommendations
        .filter(r => r.port.id !== rec.port.id)
        .slice(0, 3)
        .map(r => ({
          port: r.port.name,
          price: r.port.prices.find(p => p.fuelType === requirement.preferredFuelType)?.pricePerTon || 0,
          deviation: r.deviation,
          reason: r.reasoning[0] || ''
        }));
    }

    return recommendations;
  }

  private calculateBaselinePrice(ports: BunkerPort[], fuelType: string): number {
    const prices = ports
      .map(p => p.prices.find(pr => pr.fuelType === fuelType)?.pricePerTon)
      .filter((p): p is number => p !== undefined);

    return prices.length > 0 
      ? prices.reduce((s, p) => s + p, 0) / prices.length 
      : 600; // Default baseline
  }

  private calculateScore(params: {
    price: number;
    baselinePrice: number;
    deviation: number;
    maxDeviation: number;
    waitingTime: number;
    availability: PortAvailability;
    quality: FuelQuality;
    priceTrend: string;
  }): number {
    let score = 1;

    // Price factor (40% weight)
    const priceRatio = params.price / params.baselinePrice;
    score *= 0.6 + 0.4 * (1 - Math.min(priceRatio, 1.5) / 1.5);

    // Deviation factor (25% weight)
    const deviationRatio = params.deviation / params.maxDeviation;
    score *= 0.75 + 0.25 * (1 - deviationRatio);

    // Waiting time factor (15% weight)
    const waitingFactor = Math.max(0, 1 - params.waitingTime / 48);
    score *= 0.85 + 0.15 * waitingFactor;

    // Availability factor (10% weight)
    const availabilityScore = params.availability.status === 'available' ? 1 :
                              params.availability.status === 'limited' ? 0.6 : 0;
    score *= 0.9 + 0.1 * availabilityScore;

    // Price trend factor (10% weight)
    const trendScore = params.priceTrend === 'falling' ? 1.1 :
                       params.priceTrend === 'rising' ? 0.9 : 1;
    score *= trendScore;

    return Math.min(1, Math.max(0, score));
  }

  private generateReasoning(
    port: BunkerPort,
    price: BunkerPrice,
    deviation: number,
    savingsPercent: number
  ): string[] {
    const reasons: string[] = [];

    if (savingsPercent > 5) {
      reasons.push(`${savingsPercent.toFixed(1)}% below average market price`);
    }

    if (deviation < 50) {
      reasons.push('Minimal route deviation required');
    }

    if (port.waitingTime < 4) {
      reasons.push('Low waiting time - quick turnaround');
    }

    if (price.trend === 'falling') {
      reasons.push('Prices trending downward - favorable market timing');
    }

    if (port.quality.certifications.includes('ISO 8217')) {
      reasons.push('ISO certified fuel quality');
    }

    if (reasons.length === 0) {
      reasons.push('Balanced option considering all factors');
    }

    return reasons;
  }

  private identifyRisks(port: BunkerPort, price: BunkerPrice): string[] {
    const risks: string[] = [];

    if (price.trend === 'rising') {
      risks.push('Prices trending upward - may increase before arrival');
    }

    if (port.availability.status === 'limited') {
      risks.push('Limited availability - booking recommended');
    }

    if (port.waitingTime > 12) {
      risks.push('Extended waiting time possible');
    }

    if (port.quality.sulphurContent > 0.1) {
      risks.push('Check ECA compliance if entering emission control areas');
    }

    return risks;
  }

  private analyzeMarket(ports: BunkerPort[]): MarketAnalysis {
    const vlsfoPrices = ports
      .flatMap(p => p.prices.filter(pr => pr.fuelType === 'VLSFO'))
      .map(p => p.pricePerTon);

    const mgoPrices = ports
      .flatMap(p => p.prices.filter(pr => pr.fuelType === 'MGO'))
      .map(p => p.pricePerTon);

    const avgVLSFO = vlsfoPrices.length > 0 
      ? vlsfoPrices.reduce((s, p) => s + p, 0) / vlsfoPrices.length 
      : 600;

    const avgMGO = mgoPrices.length > 0
      ? mgoPrices.reduce((s, p) => s + p, 0) / mgoPrices.length
      : 800;

    // Analyze trends
    const risingCount = ports.flatMap(p => p.prices).filter(p => p.trend === 'rising').length;
    const fallingCount = ports.flatMap(p => p.prices).filter(p => p.trend === 'falling').length;
    const totalPrices = ports.flatMap(p => p.prices).length;

    const globalTrend: 'bullish' | 'bearish' | 'neutral' = 
      risingCount > totalPrices * 0.6 ? 'bullish' :
      fallingCount > totalPrices * 0.6 ? 'bearish' : 'neutral';

    // Calculate volatility
    const variance = vlsfoPrices.reduce((s, p) => s + Math.pow(p - avgVLSFO, 2), 0) / vlsfoPrices.length;
    const volatility = Math.sqrt(variance) / avgVLSFO * 100;

    return {
      globalTrend,
      avgPriceVLSFO: avgVLSFO,
      avgPriceMGO: avgMGO,
      priceVolatility: volatility,
      supplyOutlook: volatility > 10 ? 'Tight supply expected' : 'Adequate supply',
      geopoliticalRisks: this.assessGeopoliticalRisks(),
      recommendedStrategy: globalTrend === 'bullish' ? 'buy_now' :
                          globalTrend === 'bearish' ? 'wait' : 'hedge',
      nextMajorPriceMove: {
        direction: globalTrend === 'bullish' ? 'up' : 'down',
        magnitude: volatility * 0.5,
        confidence: 0.7,
        timeframe: '1-2 weeks'
      }
    };
  }

  private assessGeopoliticalRisks(): string[] {
    // This would typically pull from real-time news/data sources
    return [
      'Monitor Middle East tensions',
      'OPEC+ production decisions pending',
      'EU sanctions affecting certain suppliers'
    ];
  }

  private generateAlerts(
    requirement: VesselFuelRequirement,
    ports: BunkerPort[]
  ): BunkerAlert[] {
    const alerts: BunkerAlert[] = [];

    // Check for price drops
    const lowPricePorts = ports.filter(p => {
      const price = p.prices.find(pr => pr.fuelType === requirement.preferredFuelType);
      return price && price.trend === 'falling' && price.pricePerTon < 550;
    });

    if (lowPricePorts.length > 0) {
      alerts.push({
        type: 'price_drop',
        severity: 'info',
        message: `Price drop opportunity at ${lowPricePorts.length} ports`,
        affectedPorts: lowPricePorts.map(p => p.name),
        validUntil: new Date(Date.now() + 48 * 60 * 60 * 1000)
      });
    }

    // Check for shortages
    const limitedPorts = ports.filter(p => p.availability.status === 'limited');
    if (limitedPorts.length > ports.length * 0.3) {
      alerts.push({
        type: 'shortage',
        severity: 'warning',
        message: 'Limited availability at multiple ports - book in advance',
        affectedPorts: limitedPorts.map(p => p.name),
        validUntil: new Date(Date.now() + 72 * 60 * 60 * 1000)
      });
    }

    // Check fuel levels
    const daysOfFuelRemaining = requirement.currentFuel / requirement.dailyConsumption;
    if (daysOfFuelRemaining < 5) {
      alerts.push({
        type: 'shortage',
        severity: 'critical',
        message: `Low fuel warning: ${daysOfFuelRemaining.toFixed(1)} days remaining`,
        affectedPorts: [],
        validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000)
      });
    }

    return alerts;
  }

  private calculateTotalSavings(
    primary: BunkerRecommendation,
    all: BunkerRecommendation[]
  ): number {
    if (all.length < 2) return primary.savings;
    
    // Compare to worst option
    const worstOption = all[all.length - 1];
    return worstOption.estimatedCost - primary.estimatedCost;
  }

  private calculateExecutionWindow(
    requirement: VesselFuelRequirement,
    recommendation: BunkerRecommendation
  ): { start: Date; end: Date } {
    const travelTime = this.calculateDistance(
      requirement.currentPosition.latitude, requirement.currentPosition.longitude,
      recommendation.port.latitude, recommendation.port.longitude
    ) / 12; // hours at 12 knots

    const start = new Date(Date.now() + travelTime * 60 * 60 * 1000);
    const end = new Date(start.getTime() + 48 * 60 * 60 * 1000); // 48 hour window

    return { start, end };
  }

  // Public method for real-time price updates
  updatePortPrices(portId: string, prices: BunkerPrice[]): void {
    const port = this.portDatabase.get(portId);
    if (port) {
      port.prices = prices;
      
      // Track price history
      for (const price of prices) {
        const key = `${portId}_${price.fuelType}`;
        const history = this.priceHistory.get(key) || [];
        history.push({ date: new Date(), price: price.pricePerTon });
        this.priceHistory.set(key, history.slice(-30)); // Keep 30 days
      }
    }
  }

  // Get price trend analysis
  getPriceTrend(portId: string, fuelType: string): { trend: string; change: number } {
    const key = `${portId}_${fuelType}`;
    const history = this.priceHistory.get(key) || [];
    
    if (history.length < 2) {
      return { trend: 'stable', change: 0 };
    }

    const recent = history.slice(-7);
    const firstPrice = recent[0].price;
    const lastPrice = recent[recent.length - 1].price;
    const change = ((lastPrice - firstPrice) / firstPrice) * 100;

    return {
      trend: change > 2 ? 'rising' : change < -2 ? 'falling' : 'stable',
      change
    };
  }
}

export const bunkerOptimizationEngine = new BunkerOptimizationEngine();
