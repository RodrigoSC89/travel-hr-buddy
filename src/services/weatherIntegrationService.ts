/**
 * Weather Integration Service
 * Provides unified interface for all weather data sources
 */

import { supabase } from '@/integrations/supabase/client';
import type {
  GeoLocation,
  WindyWeatherData,
  MaritimeConditions,
  WeatherAlert,
  AIWeatherAnalysis
} from '@/types/weather';

export class WeatherIntegrationService {
  /**
   * Fetch comprehensive weather data from Windy integration
   */
  static async fetchWindyWeather(
    location: GeoLocation,
    vesselId?: string
  ): Promise<WindyWeatherData | null> {
    try {
      const { data, error } = await supabase.functions.invoke('windy-integration', {
        body: {
          latitude: location.lat,
          longitude: location.lon,
          vessel_id: vesselId,
          include_forecast: true
        }
      });

      if (error) {
        console.error('Error fetching Windy weather:', error);
        return null;
      }

      return data?.data || null;
    } catch (error) {
      console.error('Exception fetching Windy weather:', error);
      return null;
    }
  }

  /**
   * Fetch maritime weather conditions
   */
  static async fetchMaritimeWeather(
    location: GeoLocation,
    vesselId?: string
  ): Promise<MaritimeConditions | null> {
    try {
      const { data, error } = await supabase.functions.invoke('maritime-weather', {
        body: {
          location: {
            lat: location.lat,
            lon: location.lon
          },
          vesselId: vesselId,
          include_forecast: true
        }
      });

      if (error) {
        console.error('Error fetching maritime weather:', error);
        return null;
      }

      return data?.weather || null;
    } catch (error) {
      console.error('Exception fetching maritime weather:', error);
      return null;
    }
  }

  /**
   * Get AI-powered weather analysis
   */
  static async getAIWeatherAnalysis(
    weatherData: any,
    options?: {
      vesselType?: string;
      operationType?: string;
      asogLimits?: any;
    }
  ): Promise<AIWeatherAnalysis | null> {
    try {
      const { data, error } = await supabase.functions.invoke('ai-weather-analysis', {
        body: {
          weatherData,
          vesselType: options?.vesselType,
          operationType: options?.operationType,
          asogLimits: options?.asogLimits
        }
      });

      if (error) {
        console.error('Error fetching AI weather analysis:', error);
        return null;
      }

      return data?.analysis || null;
    } catch (error) {
      console.error('Exception fetching AI weather analysis:', error);
      return null;
    }
  }

  /**
   * Store weather data in the database
   */
  static async storeWeatherData(
    vesselId: string,
    location: GeoLocation,
    weatherData: any
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('weather_data')
        .insert({
          vessel_id: vesselId,
          latitude: location.lat,
          longitude: location.lon,
          weather_data: weatherData,
          recorded_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error storing weather data:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Exception storing weather data:', error);
      return false;
    }
  }

  /**
   * Get weather history for a location
   */
  static async getWeatherHistory(
    vesselId: string,
    startDate: Date,
    endDate: Date
  ): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('weather_data')
        .select('*')
        .eq('vessel_id', vesselId)
        .gte('recorded_at', startDate.toISOString())
        .lte('recorded_at', endDate.toISOString())
        .order('recorded_at', { ascending: false });

      if (error) {
        console.error('Error fetching weather history:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Exception fetching weather history:', error);
      return [];
    }
  }

  /**
   * Create weather alert notification
   */
  static async createWeatherAlert(
    alert: WeatherAlert,
    vesselId?: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('real_time_notifications')
        .insert({
          type: 'weather_alert',
          title: alert.title,
          message: alert.description,
          priority: alert.severity === 'critical' ? 'critical' : 
                   alert.severity === 'severe' ? 'high' : 'medium',
          metadata: {
            vessel_id: vesselId,
            alert_type: alert.type,
            severity: alert.severity,
            recommendation: alert.recommendation,
            affected_operations: alert.affectedOperations
          }
        });

      if (error) {
        console.error('Error creating weather alert:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Exception creating weather alert:', error);
      return false;
    }
  }

  /**
   * Validate weather against ASOG limits
   */
  static validateAgainstASGO(
    weatherData: any,
    asogLimits: {
      maxWindSpeed: number;
      maxWaveHeight: number;
      minVisibility: number;
    }
  ): {
    compliant: boolean;
    violations: Array<{
      parameter: string;
      currentValue: number;
      limitValue: number;
      severity: 'warning' | 'critical';
    }>;
  } {
    const violations = [];

    // Check wind speed
    if (weatherData.windSpeed > asogLimits.maxWindSpeed) {
      violations.push({
        parameter: 'Wind Speed',
        currentValue: weatherData.windSpeed,
        limitValue: asogLimits.maxWindSpeed,
        severity: weatherData.windSpeed > asogLimits.maxWindSpeed * 1.2 ? 'critical' : 'warning'
      });
    }

    // Check wave height
    if (weatherData.waveHeight && weatherData.waveHeight > asogLimits.maxWaveHeight) {
      violations.push({
        parameter: 'Wave Height',
        currentValue: weatherData.waveHeight,
        limitValue: asogLimits.maxWaveHeight,
        severity: weatherData.waveHeight > asogLimits.maxWaveHeight * 1.2 ? 'critical' : 'warning'
      });
    }

    // Check visibility
    if (weatherData.visibility && weatherData.visibility < asogLimits.minVisibility) {
      violations.push({
        parameter: 'Visibility',
        currentValue: weatherData.visibility,
        limitValue: asogLimits.minVisibility,
        severity: weatherData.visibility < asogLimits.minVisibility * 0.5 ? 'critical' : 'warning'
      });
    }

    return {
      compliant: violations.length === 0,
      violations
    };
  }

  /**
   * Generate weather briefing
   */
  static generateWeatherBriefing(weatherData: any): string {
    const current = weatherData.current;
    
    let briefing = `BRIEFING METEOROLÓGICO\n\n`;
    briefing += `Condições Atuais:\n`;
    briefing += `- Vento: ${current.windSpeed?.toFixed(1) || 'N/A'} nós de ${current.windDirection || 'N/A'}°\n`;
    briefing += `- Ondas: ${current.waveHeight?.toFixed(1) || 'N/A'} metros\n`;
    briefing += `- Visibilidade: ${current.visibility?.toFixed(1) || current.visibilityNM?.toFixed(1) || 'N/A'} milhas náuticas\n`;
    briefing += `- Pressão: ${current.pressure || current.barometricPressure || 'N/A'} hPa\n`;
    briefing += `- Temperatura: ${current.temperature?.toFixed(1) || 'N/A'}°C\n`;
    
    if (weatherData.alerts && weatherData.alerts.length > 0) {
      briefing += `\nAlertas Ativos:\n`;
      weatherData.alerts.forEach((alert: any, idx: number) => {
        briefing += `${idx + 1}. ${alert.title || alert.message}\n`;
      });
    }

    if (weatherData.operabilityIndex) {
      briefing += `\nÍndice de Operabilidade: ${weatherData.operabilityIndex.overall}% - ${weatherData.operabilityIndex.status.toUpperCase()}\n`;
    }

    return briefing;
  }
}

export default WeatherIntegrationService;
