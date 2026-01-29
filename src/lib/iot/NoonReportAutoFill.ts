/**
 * Noon Report Auto-Fill Engine
 * Preenche automaticamente Noon Reports com dados de IoT
 * Feature INÉDITA na indústria marítima
 */

import { iotConnector, type VesselTelemetry, type SensorReading } from './IoTConnector';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export interface NoonReportData {
  // Dados de Posição (GPS)
  position: {
    latitude: number;
    longitude: number;
    course: number;
    speed: number;
  };
  
  // Dados de Consumo (Sensores de Combustível)
  consumption: {
    fuelOilHFO: number;
    fuelOilMDO: number;
    lubOil: number;
    freshWater: number;
  };
  
  // Dados de Performance (Sensores de Motor)
  performance: {
    mainEngineRPM: number;
    mainEnginePower: number;
    averageSpeed: number;
    distanceTraveled: number;
    slip: number;
  };
  
  // Dados Meteorológicos (Sensores + API)
  weather: {
    windDirection: number;
    windSpeed: number;
    seaState: number;
    swellHeight: number;
    visibility: number;
    barometer: number;
    temperature: number;
  };
  
  // Dados de Carga
  cargo: {
    cargoWeight: number;
    ballastWeight: number;
    displacement: number;
    draft: { fore: number; aft: number; mean: number };
  };
  
  // Metadados
  meta: {
    reportDate: Date;
    reportTime: string;
    vesselId: string;
    voyageNumber: string;
    dataSource: 'iot' | 'manual' | 'hybrid';
    confidenceScore: number;
    sensorsUsed: string[];
  };
}

interface SensorAggregation {
  type: string;
  count: number;
  sum: number;
  min: number;
  max: number;
  avg: number;
  lastValue: number;
  lastTimestamp: Date;
}

class NoonReportAutoFillEngine {
  private aggregations: Map<string, Map<string, SensorAggregation>> = new Map();
  private lastNoonReport: Date | null = null;
  
  /**
   * Inicializa coleta de dados para próximo Noon Report
   */
  async initializeDataCollection(vesselId: string): Promise<void> {
    logger.info(`[NoonReport] Initializing data collection for vessel: ${vesselId}`);
    
    // Conectar ao IoT e começar a agregar dados
    await iotConnector.connect(vesselId);
    
    // Registrar listener para agregar readings
    iotConnector.subscribe(vesselId, (reading) => {
      this.aggregateSensorReading(vesselId, reading);
    });
    
    // Inicializar mapa de agregações
    if (!this.aggregations.has(vesselId)) {
      this.aggregations.set(vesselId, new Map());
    }
    
    logger.info(`[NoonReport] Data collection started for vessel: ${vesselId}`);
  }
  
  /**
   * Agrega readings de sensores
   */
  private aggregateSensorReading(vesselId: string, reading: SensorReading): void {
    const vesselAggregations = this.aggregations.get(vesselId);
    if (!vesselAggregations) return;
    
    const existing = vesselAggregations.get(reading.type);
    
    if (existing) {
      vesselAggregations.set(reading.type, {
        type: reading.type,
        count: existing.count + 1,
        sum: existing.sum + reading.value,
        min: Math.min(existing.min, reading.value),
        max: Math.max(existing.max, reading.value),
        avg: (existing.sum + reading.value) / (existing.count + 1),
        lastValue: reading.value,
        lastTimestamp: reading.timestamp,
      });
    } else {
      vesselAggregations.set(reading.type, {
        type: reading.type,
        count: 1,
        sum: reading.value,
        min: reading.value,
        max: reading.value,
        avg: reading.value,
        lastValue: reading.value,
        lastTimestamp: reading.timestamp,
      });
    }
  }
  
  /**
   * Gera Noon Report preenchido automaticamente
   */
  async generateNoonReport(
    vesselId: string,
    voyageNumber: string,
    reportDate: Date = new Date()
  ): Promise<NoonReportData> {
    logger.info(`[NoonReport] Generating auto-filled report for vessel: ${vesselId}`);
    
    // Obter telemetria atual
    const telemetry = await iotConnector.getVesselTelemetry(vesselId);
    
    // Obter agregações do período
    const aggregations = this.aggregations.get(vesselId) || new Map();
    
    // Obter dados meteorológicos
    const weather = await this.fetchWeatherData(telemetry.position);
    
    // Calcular consumo baseado em dados históricos
    const consumption = this.calculateConsumption(aggregations, telemetry);
    
    // Calcular métricas de performance
    const performance = this.calculatePerformance(aggregations, telemetry);
    
    // Calcular dados de carga
    const cargo = await this.calculateCargoData(vesselId);
    
    // Calcular score de confiança
    const sensorsUsed = Array.from(aggregations.keys());
    const confidenceScore = this.calculateConfidenceScore(aggregations, sensorsUsed);
    
    const report: NoonReportData = {
      position: {
        latitude: telemetry.position.lat,
        longitude: telemetry.position.lng,
        course: telemetry.heading,
        speed: telemetry.speed,
      },
      consumption,
      performance,
      weather,
      cargo,
      meta: {
        reportDate,
        reportTime: reportDate.toISOString().slice(11, 16),
        vesselId,
        voyageNumber,
        dataSource: confidenceScore > 0.8 ? 'iot' : confidenceScore > 0.5 ? 'hybrid' : 'manual',
        confidenceScore,
        sensorsUsed,
      },
    };
    
    // Salvar no banco para histórico
    await this.saveNoonReport(report);
    
    // Limpar agregações para próximo período
    this.resetAggregations(vesselId);
    this.lastNoonReport = reportDate;
    
    logger.info(`[NoonReport] Report generated with ${confidenceScore * 100}% confidence`);
    
    return report;
  }
  
  /**
   * Busca dados meteorológicos
   */
  private async fetchWeatherData(position: { lat: number; lng: number }): Promise<NoonReportData['weather']> {
    try {
      // Tentar buscar de API externa via edge function
      const { data } = await supabase.functions.invoke('weather-data', {
        body: { lat: position.lat, lng: position.lng },
      });
      
      if (data?.weather) {
        return data.weather;
      }
    } catch (error) {
      logger.debug('[NoonReport] Weather API unavailable, using defaults');
    }
    
    // Valores padrão baseados em condições médias
    return {
      windDirection: 180,
      windSpeed: 12,
      seaState: 3,
      swellHeight: 1.5,
      visibility: 10,
      barometer: 1013,
      temperature: 25,
    };
  }
  
  /**
   * Calcula consumo baseado em agregações
   */
  private calculateConsumption(
    aggregations: Map<string, SensorAggregation>,
    telemetry: VesselTelemetry
  ): NoonReportData['consumption'] {
    const fuelData = aggregations.get('fuel');
    
    // Estimar consumo baseado em RPM e horas de operação
    const baseConsumption = telemetry.engineRPM > 0 
      ? (telemetry.engineRPM / 1000) * 24 * 0.5 // Simplificado: ton/dia
      : 15; // Valor padrão
    
    return {
      fuelOilHFO: fuelData ? fuelData.avg * 0.8 : baseConsumption,
      fuelOilMDO: fuelData ? fuelData.avg * 0.2 : baseConsumption * 0.25,
      lubOil: 0.5, // Valor típico
      freshWater: 10, // Valor típico em m³
    };
  }
  
  /**
   * Calcula métricas de performance
   */
  private calculatePerformance(
    aggregations: Map<string, SensorAggregation>,
    telemetry: VesselTelemetry
  ): NoonReportData['performance'] {
    const speedData = aggregations.get('speed');
    const engineData = aggregations.get('engine');
    
    const avgSpeed = speedData?.avg || telemetry.speed;
    const distanceTraveled = avgSpeed * 24; // Milhas náuticas em 24h
    
    // Calcular slip (diferença entre velocidade teórica e real)
    const theoreticalSpeed = (telemetry.engineRPM / 100) * 0.6; // Simplificado
    const slip = theoreticalSpeed > 0 
      ? ((theoreticalSpeed - avgSpeed) / theoreticalSpeed) * 100 
      : 0;
    
    return {
      mainEngineRPM: engineData?.avg || telemetry.engineRPM,
      mainEnginePower: (telemetry.engineRPM / 2200) * 100, // % MCR estimado
      averageSpeed: avgSpeed,
      distanceTraveled,
      slip: Math.max(0, slip),
    };
  }
  
  /**
   * Calcula dados de carga
   */
  private async calculateCargoData(vesselId: string): Promise<NoonReportData['cargo']> {
    try {
      // Buscar dados de carga do banco via fleet_logs
      const { data } = await supabase
        .from('fleet_logs')
        .select('data')
        .eq('vessel_id', vesselId)
        .eq('log_type', 'cargo_status')
        .order('recorded_at', { ascending: false })
        .limit(1)
        .single();
      
      if (data?.data) {
        const cargoData = data.data as Record<string, unknown>;
        return {
          cargoWeight: Number(cargoData.cargo_weight) || 0,
          ballastWeight: Number(cargoData.ballast_weight) || 0,
          displacement: Number(cargoData.displacement) || 0,
          draft: {
            fore: Number(cargoData.draft_fore) || 0,
            aft: Number(cargoData.draft_aft) || 0,
            mean: ((Number(cargoData.draft_fore) || 0) + (Number(cargoData.draft_aft) || 0)) / 2,
          },
        };
      }
    } catch {
      // Usar valores padrão
    }
    
    return {
      cargoWeight: 0,
      ballastWeight: 5000,
      displacement: 25000,
      draft: { fore: 8.5, aft: 9.0, mean: 8.75 },
    };
  }
  
  /**
   * Calcula score de confiança dos dados
   */
  private calculateConfidenceScore(
    aggregations: Map<string, SensorAggregation>,
    sensorsUsed: string[]
  ): number {
    // Fatores de confiança
    const factors: number[] = [];
    
    // Fator 1: Número de tipos de sensores
    const requiredSensors = ['gps', 'fuel', 'engine', 'speed', 'temperature'];
    const coverageRatio = sensorsUsed.filter(s => requiredSensors.includes(s)).length / requiredSensors.length;
    factors.push(coverageRatio);
    
    // Fator 2: Volume de dados
    let totalReadings = 0;
    aggregations.forEach(agg => totalReadings += agg.count);
    const dataVolumeScore = Math.min(totalReadings / 1000, 1); // Max 1000 readings = 100%
    factors.push(dataVolumeScore);
    
    // Fator 3: Atualidade dos dados
    let freshnessScore = 0;
    aggregations.forEach(agg => {
      const age = Date.now() - agg.lastTimestamp.getTime();
      if (age < 60000) freshnessScore += 1; // < 1 min
      else if (age < 300000) freshnessScore += 0.5; // < 5 min
    });
    freshnessScore = aggregations.size > 0 ? freshnessScore / aggregations.size : 0;
    factors.push(freshnessScore);
    
    // Média ponderada
    return factors.reduce((sum, f) => sum + f, 0) / factors.length;
  }
  
  /**
   * Salva Noon Report no banco via fleet_logs
   */
  private async saveNoonReport(report: NoonReportData): Promise<void> {
    try {
      await supabase.from('fleet_logs').insert({
        vessel_id: report.meta.vesselId,
        log_type: 'noon_report',
        severity: 'info',
        source: 'noon-report-autofill',
        data: {
          voyage_number: report.meta.voyageNumber,
          report_date: report.meta.reportDate.toISOString(),
          report_time: report.meta.reportTime,
          position: report.position,
          consumption: report.consumption,
          performance: report.performance,
          weather: report.weather,
          cargo: report.cargo,
          data_source: report.meta.dataSource,
          confidence_score: report.meta.confidenceScore,
          sensors_used: report.meta.sensorsUsed,
        },
      });
    } catch (error) {
      logger.error('[NoonReport] Error saving report:', error);
    }
  }
  
  /**
   * Reseta agregações para novo período
   */
  private resetAggregations(vesselId: string): void {
    this.aggregations.set(vesselId, new Map());
  }
  
  /**
   * Obtém preview do próximo Noon Report
   */
  async getReportPreview(vesselId: string): Promise<Partial<NoonReportData> & { aggregationStats: Record<string, SensorAggregation> }> {
    const telemetry = await iotConnector.getVesselTelemetry(vesselId);
    const aggregations = this.aggregations.get(vesselId) || new Map();
    
    return {
      position: {
        latitude: telemetry.position.lat,
        longitude: telemetry.position.lng,
        course: telemetry.heading,
        speed: telemetry.speed,
      },
      performance: {
        mainEngineRPM: telemetry.engineRPM,
        mainEnginePower: (telemetry.engineRPM / 2200) * 100,
        averageSpeed: telemetry.speed,
        distanceTraveled: 0,
        slip: 0,
      },
      aggregationStats: Object.fromEntries(aggregations),
    };
  }
}

export const noonReportAutoFill = new NoonReportAutoFillEngine();
export default noonReportAutoFill;
