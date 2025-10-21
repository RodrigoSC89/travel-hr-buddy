/**
 * Forecast Types
 * Type definitions for the Forecast Global Engine module
 */

export interface ForecastData {
  timestamp: string;
  forecast: {
    [key: string]: string;
  };
}

export interface ForecastPrediction {
  module: string;
  status: string;
  probability?: number;
  trend?: 'stable' | 'degrading' | 'improving';
  timeframe?: string;
}

export interface ForecastConfig {
  model: 'ARIMA' | 'Prophet' | 'LSTM';
  interval: number;
  historicalDays: number;
}
