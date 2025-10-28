/**
 * FuelOptimizationService
 * AI-powered fuel optimization with heuristic consumption model
 * Algorithm: Consumption = Distance × BaseRate × SpeedAdj^2.5 × Weather × Current
 */

interface RouteData {
  distance_nm: number;
  estimated_duration_hours?: number;
  weather_factor?: number;
  current_factor?: number;
  departure_port?: string;
  arrival_port?: string;
}

interface OptimizationResult {
  original_consumption: number;
  optimized_consumption: number;
  savings_liters: number;
  savings_percentage: number;
  recommendations: string[];
  confidence_score: number;
  optimal_speed: number;
  reasoning: string;
}

interface HistoricalData {
  avg_consumption_rate?: number;
  avg_speed?: number;
  efficiency_rating?: number;
}

export class FuelOptimizationService {
  // Base fuel consumption rate (liters per nautical mile at optimal speed)
  private static readonly BASE_CONSUMPTION_RATE = 2.5;
  
  // Optimal speed range (knots)
  private static readonly MIN_SPEED = 10;
  private static readonly MAX_SPEED = 14;
  private static readonly OPTIMAL_SPEED = 12;
  
  // Environmental factor ranges
  private static readonly GOOD_WEATHER_FACTOR = 0.9;
  private static readonly AVERAGE_WEATHER_FACTOR = 1.0;
  private static readonly BAD_WEATHER_FACTOR = 1.3;
  
  /**
   * Optimize a route for fuel efficiency
   */
  static optimizeRoute(
    route: RouteData,
    currentSpeed: number,
    historicalData?: HistoricalData
  ): OptimizationResult {
    const baseRate = historicalData?.avg_consumption_rate || this.BASE_CONSUMPTION_RATE;
    const weatherFactor = route.weather_factor || this.AVERAGE_WEATHER_FACTOR;
    const currentFactor = route.current_factor || 1.0;
    
    // Calculate original consumption at current speed
    const speedAdjustmentOriginal = this.calculateSpeedAdjustment(currentSpeed);
    const originalConsumption = 
      route.distance_nm * 
      baseRate * 
      speedAdjustmentOriginal * 
      weatherFactor * 
      currentFactor;
    
    // Find optimal speed for this route
    const optimalSpeed = this.findOptimalSpeed(
      route.distance_nm,
      baseRate,
      weatherFactor,
      currentFactor
    );
    
    // Calculate optimized consumption
    const speedAdjustmentOptimal = this.calculateSpeedAdjustment(optimalSpeed);
    const optimizedConsumption = 
      route.distance_nm * 
      baseRate * 
      speedAdjustmentOptimal * 
      weatherFactor * 
      currentFactor;
    
    const savings = originalConsumption - optimizedConsumption;
    const savingsPercentage = (savings / originalConsumption) * 100;
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(
      currentSpeed,
      optimalSpeed,
      weatherFactor,
      currentFactor,
      savingsPercentage
    );
    
    // Calculate confidence score based on data quality
    const confidence = this.calculateConfidenceScore(
      historicalData,
      route,
      savingsPercentage
    );
    
    // Generate reasoning
    const reasoning = this.generateReasoning(
      currentSpeed,
      optimalSpeed,
      weatherFactor,
      savingsPercentage
    );
    
    return {
      original_consumption: Math.round(originalConsumption),
      optimized_consumption: Math.round(optimizedConsumption),
      savings_liters: Math.round(savings),
      savings_percentage: Math.round(savingsPercentage * 10) / 10,
      recommendations,
      confidence_score: confidence,
      optimal_speed: Math.round(optimalSpeed * 10) / 10,
      reasoning
    };
  }
  
  /**
   * Calculate speed adjustment factor using exponential model
   * SpeedAdj^2.5 to model non-linear fuel consumption at higher speeds
   */
  private static calculateSpeedAdjustment(speed: number): number {
    const normalizedSpeed = speed / this.OPTIMAL_SPEED;
    return Math.pow(normalizedSpeed, 2.5);
  }
  
  /**
   * Find optimal speed for minimum fuel consumption
   * Searches between MIN_SPEED and MAX_SPEED
   */
  private static findOptimalSpeed(
    distance: number,
    baseRate: number,
    weatherFactor: number,
    currentFactor: number
  ): number {
    let minConsumption = Infinity;
    let optimalSpeed = this.OPTIMAL_SPEED;
    
    // Search for optimal speed in 0.5 knot increments
    for (let speed = this.MIN_SPEED; speed <= this.MAX_SPEED; speed += 0.5) {
      const speedAdj = this.calculateSpeedAdjustment(speed);
      const consumption = distance * baseRate * speedAdj * weatherFactor * currentFactor;
      
      if (consumption < minConsumption) {
        minConsumption = consumption;
        optimalSpeed = speed;
      }
    }
    
    return optimalSpeed;
  }
  
  /**
   * Generate actionable recommendations based on optimization results
   */
  private static generateRecommendations(
    currentSpeed: number,
    optimalSpeed: number,
    weatherFactor: number,
    currentFactor: number,
    savingsPercentage: number
  ): string[] {
    const recommendations: string[] = [];
    
    // Speed recommendation
    if (Math.abs(currentSpeed - optimalSpeed) > 0.5) {
      const speedChange = currentSpeed > optimalSpeed ? "Reduce" : "Increase";
      recommendations.push(
        `${speedChange} vessel speed from ${currentSpeed.toFixed(1)} to ${optimalSpeed.toFixed(1)} knots for optimal fuel efficiency`
      );
    }
    
    // Weather-based recommendations
    if (weatherFactor > this.AVERAGE_WEATHER_FACTOR) {
      recommendations.push(
        "Consider delaying departure or adjusting route to avoid adverse weather conditions"
      );
    } else if (weatherFactor < this.AVERAGE_WEATHER_FACTOR) {
      recommendations.push(
        "Favorable weather conditions detected - maintain current route planning"
      );
    }
    
    // Current-based recommendations
    if (currentFactor > 1.1) {
      recommendations.push(
        "Strong currents detected - consider route adjustments to minimize opposing currents"
      );
    } else if (currentFactor < 0.9) {
      recommendations.push(
        "Favorable currents available - route is well-optimized for current conditions"
      );
    }
    
    // Savings-based recommendations
    if (savingsPercentage > 10) {
      recommendations.push(
        `Significant fuel savings potential: ${savingsPercentage.toFixed(1)}% reduction achievable`
      );
    } else if (savingsPercentage > 5) {
      recommendations.push(
        `Moderate fuel savings opportunity: ${savingsPercentage.toFixed(1)}% reduction possible`
      );
    } else if (savingsPercentage > 0) {
      recommendations.push(
        `Current route is near-optimal: ${savingsPercentage.toFixed(1)}% marginal improvement available`
      );
    }
    
    // General best practices
    if (recommendations.length === 0) {
      recommendations.push("Route is optimally configured for current conditions");
    }
    
    return recommendations;
  }
  
  /**
   * Calculate confidence score (0-100%) based on data quality
   */
  private static calculateConfidenceScore(
    historicalData: HistoricalData | undefined,
    route: RouteData,
    savingsPercentage: number
  ): number {
    let score = 50; // Base confidence
    
    // Increase confidence if we have historical data
    if (historicalData?.avg_consumption_rate) score += 15;
    if (historicalData?.avg_speed) score += 10;
    if (historicalData?.efficiency_rating) score += 10;
    
    // Increase confidence if we have detailed route information
    if (route.weather_factor) score += 5;
    if (route.current_factor) score += 5;
    if (route.departure_port && route.arrival_port) score += 5;
    
    // Realistic savings increase confidence
    if (savingsPercentage > 0 && savingsPercentage < 30) {
      score += 10;
    } else if (savingsPercentage >= 30) {
      // Very high savings might indicate data quality issues
      score -= 10;
    }
    
    return Math.max(0, Math.min(100, score));
  }
  
  /**
   * Generate human-readable reasoning for the optimization
   */
  private static generateReasoning(
    currentSpeed: number,
    optimalSpeed: number,
    weatherFactor: number,
    savingsPercentage: number
  ): string {
    const speedDiff = Math.abs(currentSpeed - optimalSpeed);
    const weatherDesc = 
      weatherFactor > 1.2 ? "challenging" :
        weatherFactor > 1.0 ? "moderate" :
          weatherFactor > 0.9 ? "favorable" : "excellent";
    
    let reasoning = `Analysis of route conditions shows ${weatherDesc} weather patterns. `;
    
    if (speedDiff > 1) {
      const direction = currentSpeed > optimalSpeed ? "reducing" : "increasing";
      reasoning += `By ${direction} speed from ${currentSpeed.toFixed(1)} to ${optimalSpeed.toFixed(1)} knots, `;
      reasoning += `fuel consumption can be reduced by approximately ${savingsPercentage.toFixed(1)}%. `;
    } else {
      reasoning += `Current speed of ${currentSpeed.toFixed(1)} knots is near-optimal. `;
      reasoning += `Minor adjustments could yield ${savingsPercentage.toFixed(1)}% improvement. `;
    }
    
    reasoning += "The optimization algorithm considers vessel speed dynamics, environmental factors, ";
    reasoning += "and historical performance data to provide accurate fuel consumption predictions.";
    
    return reasoning;
  }
  
  /**
   * Batch optimize multiple routes
   */
  static optimizeMultipleRoutes(
    routes: Array<{ route: RouteData; currentSpeed: number }>,
    historicalData?: HistoricalData
  ): OptimizationResult[] {
    return routes.map(({ route, currentSpeed }) => 
      this.optimizeRoute(route, currentSpeed, historicalData)
    );
  }
  
  /**
   * Estimate fuel consumption for a route at given speed
   */
  static estimateFuelConsumption(
    distance_nm: number,
    speed_knots: number,
    weatherFactor: number = 1.0,
    currentFactor: number = 1.0,
    baseRate: number = this.BASE_CONSUMPTION_RATE
  ): number {
    const speedAdj = this.calculateSpeedAdjustment(speed_knots);
    return distance_nm * baseRate * speedAdj * weatherFactor * currentFactor;
  }
}
