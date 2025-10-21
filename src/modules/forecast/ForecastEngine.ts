/**
 * Forecast Engine
 * Core prediction engine for maritime operations
 * Generates forecasts for 24h, 72h, and 7 days
 */

import { mqttClient } from "@/utils/mqttClient";
import { ForecastData, ForecastPrediction, ForecastConfig } from "@/types/forecast";

export class ForecastEngine {
  private subscribers: Array<(data: ForecastData) => void> = [];
  private config: ForecastConfig = {
    model: "ARIMA",
    interval: 3600000, // 1 hour in ms
    historicalDays: 30,
  };
  private latestForecast: ForecastData | null = null;

  constructor() {
    // Subscribe to forecast events from BridgeLink
    mqttClient.subscribe("bridge/forecast/events", (msg) => {
      try {
        const data = JSON.parse(msg) as ForecastData;
        this.latestForecast = data;
        this.notify(data);
      } catch (error) {
        console.error("❌ Failed to parse forecast event:", error);
      }
    });

    // Subscribe to DP system events
    mqttClient.subscribe("bridge/dp/events", (msg) => {
      try {
        const data = JSON.parse(msg);
        this.processDPEvent(data);
      } catch (error) {
        console.error("❌ Failed to parse DP event:", error);
      }
    });
  }

  /**
   * Register a callback for forecast updates
   */
  onUpdate(callback: (data: ForecastData) => void): () => void {
    this.subscribers.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  /**
   * Notify all subscribers of new forecast data
   */
  private notify(data: ForecastData): void {
    this.subscribers.forEach((fn) => {
      try {
        fn(data);
      } catch (error) {
        console.error("❌ Error in forecast subscriber:", error);
      }
    });
  }

  /**
   * Get current forecast data
   */
  async getForecast(): Promise<ForecastData> {
    // Return cached forecast if available
    if (this.latestForecast) {
      return this.latestForecast;
    }

    // Generate mock forecast (replace with real API call)
    const forecast: ForecastData = {
      timestamp: new Date().toISOString(),
      forecast: {
        "DP System": "Stable with 5% drift probability",
        "Gyro": "Minor oscillation expected in 36h",
        "Thruster 2": "Potential degradation trend detected",
        "Weather": "Moderate sea state forecasted",
        "Power System": "Normal operation expected",
        "Navigation": "Optimal conditions for next 72h",
      },
    };

    this.latestForecast = forecast;
    return forecast;
  }

  /**
   * Get forecast for specific module
   */
  async getModuleForecast(moduleName: string): Promise<ForecastPrediction | null> {
    const forecast = await this.getForecast();
    
    if (forecast.forecast[moduleName]) {
      return {
        module: moduleName,
        status: forecast.forecast[moduleName],
        trend: this.determineTrend(forecast.forecast[moduleName]),
        timeframe: "24h",
      };
    }
    
    return null;
  }

  /**
   * Process DP system events for predictive analysis
   */
  private processDPEvent(event: unknown): void {
    // Process event and update predictions
    console.log("📊 Processing DP event for forecast update", event);
    // Implementation for real-time event processing
  }

  /**
   * Determine trend from forecast text
   */
  private determineTrend(forecastText: string): "stable" | "degrading" | "improving" {
    const lowerText = forecastText.toLowerCase();
    
    if (lowerText.includes("degradation") || lowerText.includes("degrading")) {
      return "degrading";
    }
    if (lowerText.includes("improving") || lowerText.includes("optimal")) {
      return "improving";
    }
    return "stable";
  }

  /**
   * Update engine configuration
   */
  setConfig(config: Partial<ForecastConfig>): void {
    this.config = { ...this.config, ...config };
    console.log("⚙️ Forecast engine config updated:", this.config);
  }

  /**
   * Get current configuration
   */
  getConfig(): ForecastConfig {
    return { ...this.config };
  }

  /**
   * Clear cached forecast
   */
  clearCache(): void {
    this.latestForecast = null;
  }
}

// Singleton instance
export const forecastEngine = new ForecastEngine();
