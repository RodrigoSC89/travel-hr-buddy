/**
 * Fuel Optimization Service
 * 
 * Provides intelligent fuel consumption analysis and route optimization
 * using heuristic algorithms and historical data patterns.
 */

export interface RouteData {
  id: string;
  origin: string;
  destination: string;
  distance_nm: number;
  estimated_duration_hours: number;
  weather_factor?: number;
  current_factor?: number;
}

export interface FuelConsumptionData {
  vessel_id: string;
  fuel_consumed: number;
  distance_covered: number;
  avg_speed: number;
  weather_conditions?: string;
}

export interface OptimizationResult {
  original_consumption: number;
  optimized_consumption: number;
  savings_liters: number;
  savings_percentage: number;
  recommendations: string[];
  confidence_score: number;
}

export interface RouteOptimizationSuggestion {
  route_id: string;
  recommended_speed: number;
  recommended_departure_time: string;
  estimated_savings: number;
  reasoning: string;
}

export class FuelOptimizationService {
  // Base consumption rates (liters per nautical mile at different speeds)
  private static BASE_CONSUMPTION_RATES: { [key: number]: number } = {
    10: 15,  // 10 knots = 15 L/nm
    12: 18,  // 12 knots = 18 L/nm
    14: 22,  // 14 knots = 22 L/nm
    16: 28,  // 16 knots = 28 L/nm
    18: 35,  // 18 knots = 35 L/nm
  };

  /**
   * Calculate fuel consumption for a given route using heuristic model
   */
  static calculateFuelConsumption(
    distance_nm: number,
    speed_knots: number,
    weather_factor: number = 1.0,
    current_factor: number = 1.0
  ): number {
    // Find closest speed in our base rates
    const speeds = Object.keys(this.BASE_CONSUMPTION_RATES).map(Number);
    const closestSpeed = speeds.reduce((prev, curr) =>
      Math.abs(curr - speed_knots) < Math.abs(prev - speed_knots) ? curr : prev
    );

    const baseRate = this.BASE_CONSUMPTION_RATES[closestSpeed];

    // Apply speed adjustment for intermediate speeds
    const speedAdjustment = speed_knots / closestSpeed;
    const adjustedRate = baseRate * Math.pow(speedAdjustment, 2.5);

    // Apply environmental factors
    const totalConsumption = distance_nm * adjustedRate * weather_factor * current_factor;

    return Math.round(totalConsumption * 100) / 100;
  }

  /**
   * Optimize route for fuel efficiency using heuristic approach
   */
  static optimizeRoute(
    route: RouteData,
    currentSpeed: number,
    historicalData: FuelConsumptionData[]
  ): OptimizationResult {
    const weatherFactor = route.weather_factor || 1.0;
    const currentFactor = route.current_factor || 1.0;

    // Calculate current consumption
    const originalConsumption = this.calculateFuelConsumption(
      route.distance_nm,
      currentSpeed,
      weatherFactor,
      currentFactor
    );

    // Find optimal speed (usually between 10-14 knots for best efficiency)
    const optimalSpeed = this.findOptimalSpeed(
      route.distance_nm,
      weatherFactor,
      currentFactor
    );

    // Calculate optimized consumption
    const optimizedConsumption = this.calculateFuelConsumption(
      route.distance_nm,
      optimalSpeed,
      weatherFactor,
      currentFactor
    );

    const savingsLiters = originalConsumption - optimizedConsumption;
    const savingsPercentage = (savingsLiters / originalConsumption) * 100;

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      currentSpeed,
      optimalSpeed,
      weatherFactor,
      currentFactor,
      savingsPercentage
    );

    // Calculate confidence score based on data quality
    const confidenceScore = this.calculateConfidenceScore(
      historicalData,
      route,
      weatherFactor,
      currentFactor
    );

    return {
      original_consumption: Math.round(originalConsumption * 100) / 100,
      optimized_consumption: Math.round(optimizedConsumption * 100) / 100,
      savings_liters: Math.round(savingsLiters * 100) / 100,
      savings_percentage: Math.round(savingsPercentage * 100) / 100,
      recommendations,
      confidence_score: Math.round(confidenceScore * 100) / 100,
    };
  }

  /**
   * Find optimal speed for fuel efficiency
   */
  private static findOptimalSpeed(
    distance_nm: number,
    weather_factor: number,
    current_factor: number
  ): number {
    const speedsToTest = [10, 11, 12, 13, 14];
    let minConsumption = Infinity;
    let optimalSpeed = 12;

    for (const speed of speedsToTest) {
      const consumption = this.calculateFuelConsumption(
        distance_nm,
        speed,
        weather_factor,
        current_factor
      );

      if (consumption < minConsumption) {
        minConsumption = consumption;
        optimalSpeed = speed;
      }
    }

    return optimalSpeed;
  }

  /**
   * Generate actionable recommendations
   */
  private static generateRecommendations(
    currentSpeed: number,
    optimalSpeed: number,
    weatherFactor: number,
    currentFactor: number,
    savingsPercentage: number
  ): string[] {
    const recommendations: string[] = [];

    if (savingsPercentage > 5) {
      recommendations.push(
        `Reduce speed from ${currentSpeed} to ${optimalSpeed} knots for ${savingsPercentage.toFixed(1)}% fuel savings`
      );
    }

    if (weatherFactor > 1.2) {
      recommendations.push(
        'Consider delaying departure - adverse weather conditions increasing fuel consumption by ' +
        `${((weatherFactor - 1) * 100).toFixed(0)}%`
      );
    }

    if (currentFactor > 1.15) {
      recommendations.push(
        'Adjust route to take advantage of favorable currents - current conditions adding ' +
        `${((currentFactor - 1) * 100).toFixed(0)}% to fuel consumption`
      );
    }

    if (currentSpeed > 16) {
      recommendations.push(
        'High speed significantly increases fuel consumption - consider slower speed unless time-critical'
      );
    }

    if (recommendations.length === 0) {
      recommendations.push('Current route parameters are already well-optimized for fuel efficiency');
    }

    return recommendations;
  }

  /**
   * Calculate confidence score based on data quality and conditions
   */
  private static calculateConfidenceScore(
    historicalData: FuelConsumptionData[],
    route: RouteData,
    weatherFactor: number,
    currentFactor: number
  ): number {
    let score = 70; // Base confidence

    // More historical data = higher confidence
    if (historicalData.length > 20) score += 15;
    else if (historicalData.length > 10) score += 10;
    else if (historicalData.length > 5) score += 5;

    // Good weather conditions = higher confidence
    if (weatherFactor <= 1.1) score += 10;
    else if (weatherFactor > 1.3) score -= 10;

    // Favorable currents = higher confidence
    if (currentFactor <= 1.1) score += 5;
    else if (currentFactor > 1.2) score -= 5;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Compare multiple routes and rank by fuel efficiency
   */
  static compareRoutes(
    routes: RouteData[],
    currentSpeed: number,
    historicalData: FuelConsumptionData[]
  ): Array<{ route: RouteData; optimization: OptimizationResult }> {
    return routes
      .map((route) => ({
        route,
        optimization: this.optimizeRoute(route, currentSpeed, historicalData),
      }))
      .sort((a, b) => b.optimization.savings_percentage - a.optimization.savings_percentage);
  }

  /**
   * Generate route optimization suggestions
   */
  static generateRouteSuggestions(
    route: RouteData,
    historicalData: FuelConsumptionData[]
  ): RouteOptimizationSuggestion[] {
    const suggestions: RouteOptimizationSuggestion[] = [];

    // Optimal speed suggestion
    const optimalSpeed = this.findOptimalSpeed(
      route.distance_nm,
      route.weather_factor || 1.0,
      route.current_factor || 1.0
    );

    const speedOptimization = this.optimizeRoute(route, 14, historicalData);

    suggestions.push({
      route_id: route.id,
      recommended_speed: optimalSpeed,
      recommended_departure_time: this.calculateOptimalDepartureTime(route),
      estimated_savings: speedOptimization.savings_liters,
      reasoning: `Optimal speed of ${optimalSpeed} knots balances fuel efficiency with transit time`,
    });

    return suggestions;
  }

  /**
   * Calculate optimal departure time based on weather and tidal conditions
   */
  private static calculateOptimalDepartureTime(route: RouteData): string {
    // In a real implementation, this would consider weather forecasts and tidal data
    // For now, we return a heuristic suggestion
    const now = new Date();
    const optimalTime = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours from now
    return optimalTime.toISOString();
  }

  /**
   * Analyze historical fuel consumption patterns
   */
  static analyzeConsumptionPatterns(data: FuelConsumptionData[]): {
    averageConsumption: number;
    bestEfficiency: number;
    worstEfficiency: number;
    trend: 'improving' | 'stable' | 'declining';
  } {
    if (data.length === 0) {
      return {
        averageConsumption: 0,
        bestEfficiency: 0,
        worstEfficiency: 0,
        trend: 'stable',
      };
    }

    const consumptionRates = data.map((d) => d.fuel_consumed / d.distance_covered);
    const avgConsumption = consumptionRates.reduce((a, b) => a + b, 0) / consumptionRates.length;
    const bestEfficiency = Math.min(...consumptionRates);
    const worstEfficiency = Math.max(...consumptionRates);

    // Determine trend by comparing first and second half of data
    const mid = Math.floor(data.length / 2);
    const firstHalfAvg =
      consumptionRates.slice(0, mid).reduce((a, b) => a + b, 0) / mid;
    const secondHalfAvg =
      consumptionRates.slice(mid).reduce((a, b) => a + b, 0) / (data.length - mid);

    let trend: 'improving' | 'stable' | 'declining';
    if (secondHalfAvg < firstHalfAvg * 0.95) trend = 'improving';
    else if (secondHalfAvg > firstHalfAvg * 1.05) trend = 'declining';
    else trend = 'stable';

    return {
      averageConsumption: Math.round(avgConsumption * 100) / 100,
      bestEfficiency: Math.round(bestEfficiency * 100) / 100,
      worstEfficiency: Math.round(worstEfficiency * 100) / 100,
      trend,
    };
  }
}
