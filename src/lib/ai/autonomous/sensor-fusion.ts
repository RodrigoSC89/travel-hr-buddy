/**
 * Sensor Fusion Engine
 * Multi-source data fusion for vessel intelligence
 * NAUTILUS ONE v4.0 - Autonomous Platform
 */

// Simple browser-compatible EventEmitter
class SimpleEventEmitter {
  private listeners: Map<string, ((data: unknown) => void)[]> = new Map();

  on(event: string, callback: (data: unknown) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  emit(event: string, data?: unknown) {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach(cb => cb(data));
  }

  off(event: string, callback: (data: unknown) => void) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }
}

export interface SensorReading {
  sensorId: string;
  sensorType: SensorType;
  value: number;
  unit: string;
  timestamp: Date;
  quality: number; // 0-1
  source: string;
}

export type SensorType = 
  | 'gps'
  | 'ais'
  | 'radar'
  | 'gyro'
  | 'speed_log'
  | 'depth_sounder'
  | 'wind_sensor'
  | 'fuel_flow'
  | 'engine_rpm'
  | 'temperature'
  | 'pressure'
  | 'vibration'
  | 'hull_stress'
  | 'ballast'
  | 'cargo_weight';

export interface FusedData {
  timestamp: Date;
  position: FusedPosition;
  navigation: FusedNavigation;
  propulsion: FusedPropulsion;
  environment: FusedEnvironment;
  structural: FusedStructural;
  confidence: number;
}

export interface FusedPosition {
  latitude: number;
  longitude: number;
  altitude: number;
  accuracy: number;
  sources: string[];
}

export interface FusedNavigation {
  heading: number;
  courseOverGround: number;
  speedOverGround: number;
  speedThroughWater: number;
  rateOfTurn: number;
}

export interface FusedPropulsion {
  mainEngineRPM: number[];
  fuelConsumption: number;
  power: number;
  efficiency: number;
  thrustVector: { x: number; y: number };
}

export interface FusedEnvironment {
  windSpeed: number;
  windDirection: number;
  waterTemperature: number;
  airTemperature: number;
  barometricPressure: number;
  humidity: number;
  waveHeight: number;
  currentSpeed: number;
  currentDirection: number;
}

export interface FusedStructural {
  hullStress: number[];
  vibrationLevels: Map<string, number>;
  ballastStatus: BallastTank[];
  draft: { fore: number; aft: number; mean: number };
  trim: number;
  heel: number;
}

export interface BallastTank {
  id: string;
  name: string;
  capacity: number;
  currentLevel: number;
  temperature: number;
}

interface SensorConfig {
  id: string;
  type: SensorType;
  weight: number;
  maxAge: number; // max age in ms before considered stale
  outlierThreshold: number;
}

class SensorFusionEngine extends SimpleEventEmitter {
  private sensors: Map<string, SensorConfig> = new Map();
  private readings: Map<string, SensorReading[]> = new Map();
  private fusedData: FusedData | null = null;
  private fusionInterval: ReturnType<typeof setInterval> | null = null;
  private readonly maxReadingsPerSensor = 100;
  private readonly fusionRate = 100; // ms

  constructor() {
    super();
    this.initializeDefaultSensors();
  }

  private initializeDefaultSensors(): void {
    const defaultSensors: SensorConfig[] = [
      { id: 'gps_primary', type: 'gps', weight: 1.0, maxAge: 2000, outlierThreshold: 3 },
      { id: 'gps_secondary', type: 'gps', weight: 0.8, maxAge: 2000, outlierThreshold: 3 },
      { id: 'ais_receiver', type: 'ais', weight: 0.7, maxAge: 5000, outlierThreshold: 3 },
      { id: 'radar_arpa', type: 'radar', weight: 0.9, maxAge: 3000, outlierThreshold: 2 },
      { id: 'gyro_main', type: 'gyro', weight: 1.0, maxAge: 500, outlierThreshold: 2 },
      { id: 'speed_log', type: 'speed_log', weight: 0.9, maxAge: 1000, outlierThreshold: 2 },
      { id: 'depth_sounder', type: 'depth_sounder', weight: 1.0, maxAge: 2000, outlierThreshold: 3 },
      { id: 'wind_sensor', type: 'wind_sensor', weight: 0.95, maxAge: 1000, outlierThreshold: 2 },
      { id: 'fuel_flow_me1', type: 'fuel_flow', weight: 1.0, maxAge: 5000, outlierThreshold: 2 },
      { id: 'engine_rpm_me1', type: 'engine_rpm', weight: 1.0, maxAge: 500, outlierThreshold: 2 },
    ];

    defaultSensors.forEach(sensor => {
      this.sensors.set(sensor.id, sensor);
      this.readings.set(sensor.id, []);
    });
  }

  /**
   * Register a new sensor
   */
  registerSensor(config: SensorConfig): void {
    this.sensors.set(config.id, config);
    this.readings.set(config.id, []);
    this.emit('sensor-registered', config);
  }

  /**
   * Ingest sensor reading
   */
  ingestReading(reading: SensorReading): void {
    const sensorReadings = this.readings.get(reading.sensorId);
    if (!sensorReadings) {
      // Unknown sensor silently ignored - not registered
      return;
    }

    // Filter outliers
    if (this.isOutlier(reading)) {
      this.emit('outlier-detected', reading);
      return;
    }

    // Add reading and maintain buffer size
    sensorReadings.push(reading);
    if (sensorReadings.length > this.maxReadingsPerSensor) {
      sensorReadings.shift();
    }

    this.emit('reading-ingested', reading);
  }

  /**
   * Check if reading is an outlier
   */
  private isOutlier(reading: SensorReading): boolean {
    const sensorConfig = this.sensors.get(reading.sensorId);
    const sensorReadings = this.readings.get(reading.sensorId);
    
    if (!sensorConfig || !sensorReadings || sensorReadings.length < 5) {
      return false;
    }

    // Calculate mean and std dev of recent readings
    const recentValues = sensorReadings.slice(-20).map(r => r.value);
    const mean = recentValues.reduce((a, b) => a + b, 0) / recentValues.length;
    const variance = recentValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / recentValues.length;
    const stdDev = Math.sqrt(variance);

    // Check if new reading is beyond threshold
    const zScore = Math.abs((reading.value - mean) / (stdDev || 1));
    return zScore > sensorConfig.outlierThreshold;
  }

  /**
   * Start fusion processing
   */
  start(): void {
    if (this.fusionInterval) return;

    this.fusionInterval = setInterval(() => {
      this.performFusion();
    }, this.fusionRate);

    this.emit('started');
  }

  /**
   * Stop fusion processing
   */
  stop(): void {
    if (this.fusionInterval) {
      clearInterval(this.fusionInterval);
      this.fusionInterval = null;
    }
    this.emit('stopped');
  }

  /**
   * Perform sensor fusion
   */
  private performFusion(): void {
    const now = new Date();
    
    // Collect valid readings
    const validReadings = this.collectValidReadings(now);
    
    // Fuse position data
    const position = this.fusePosition(validReadings);
    
    // Fuse navigation data
    const navigation = this.fuseNavigation(validReadings);
    
    // Fuse propulsion data
    const propulsion = this.fusePropulsion(validReadings);
    
    // Fuse environment data
    const environment = this.fuseEnvironment(validReadings);
    
    // Fuse structural data
    const structural = this.fuseStructural(validReadings);
    
    // Calculate overall confidence
    const confidence = this.calculateConfidence(validReadings);

    this.fusedData = {
      timestamp: now,
      position,
      navigation,
      propulsion,
      environment,
      structural,
      confidence
    };

    this.emit('fusion-complete', this.fusedData);
  }

  /**
   * Collect valid (non-stale) readings
   */
  private collectValidReadings(now: Date): Map<SensorType, SensorReading[]> {
    const validReadings = new Map<SensorType, SensorReading[]>();

    for (const [sensorId, readings] of this.readings) {
      const config = this.sensors.get(sensorId);
      if (!config) continue;

      const validForSensor = readings.filter(r => 
        now.getTime() - r.timestamp.getTime() < config.maxAge
      );

      if (validForSensor.length > 0) {
        const existing = validReadings.get(config.type) || [];
        validReadings.set(config.type, [...existing, ...validForSensor]);
      }
    }

    return validReadings;
  }

  /**
   * Fuse position from GPS, AIS, and radar
   */
  private fusePosition(readings: Map<SensorType, SensorReading[]>): FusedPosition {
    const gpsReadings = readings.get('gps') || [];
    const aisReadings = readings.get('ais') || [];
    
    // Weighted average fusion with Kalman-like approach
    let totalWeight = 0;
    let weightedLat = 0;
    let weightedLng = 0;
    const sources: string[] = [];

    for (const reading of [...gpsReadings, ...aisReadings]) {
      const config = this.sensors.get(reading.sensorId);
      const weight = (config?.weight || 0.5) * reading.quality;
      
      // Assuming value contains encoded lat/lng
      const lat = Math.floor(reading.value / 1000) / 1000;
      const lng = (reading.value % 1000) / 1000;
      
      weightedLat += lat * weight;
      weightedLng += lng * weight;
      totalWeight += weight;
      
      if (!sources.includes(reading.source)) {
        sources.push(reading.source);
      }
    }

    return {
      latitude: totalWeight > 0 ? weightedLat / totalWeight : 0,
      longitude: totalWeight > 0 ? weightedLng / totalWeight : 0,
      altitude: 0,
      accuracy: totalWeight > 0 ? 1 / totalWeight : 100,
      sources
    };
  }

  /**
   * Fuse navigation data
   */
  private fuseNavigation(readings: Map<SensorType, SensorReading[]>): FusedNavigation {
    const gyroReadings = readings.get('gyro') || [];
    const speedLogReadings = readings.get('speed_log') || [];
    const gpsReadings = readings.get('gps') || [];

    return {
      heading: this.weightedAverage(gyroReadings),
      courseOverGround: this.weightedAverage(gpsReadings) || 0,
      speedOverGround: this.calculateSOG(gpsReadings),
      speedThroughWater: this.weightedAverage(speedLogReadings),
      rateOfTurn: this.calculateROT(gyroReadings)
    };
  }

  /**
   * Fuse propulsion data
   */
  private fusePropulsion(readings: Map<SensorType, SensorReading[]>): FusedPropulsion {
    const rpmReadings = readings.get('engine_rpm') || [];
    const fuelReadings = readings.get('fuel_flow') || [];

    const rpm = this.weightedAverage(rpmReadings);
    const fuelFlow = this.weightedAverage(fuelReadings);

    return {
      mainEngineRPM: [rpm],
      fuelConsumption: fuelFlow,
      power: rpm * 0.5, // Simplified power calculation
      efficiency: fuelFlow > 0 ? (rpm * 0.5) / fuelFlow : 0,
      thrustVector: { x: 1, y: 0 }
    };
  }

  /**
   * Fuse environment data
   */
  private fuseEnvironment(readings: Map<SensorType, SensorReading[]>): FusedEnvironment {
    const windReadings = readings.get('wind_sensor') || [];
    const tempReadings = readings.get('temperature') || [];
    const pressureReadings = readings.get('pressure') || [];

    return {
      windSpeed: this.weightedAverage(windReadings),
      windDirection: 0, // Would need separate direction sensor
      waterTemperature: this.weightedAverage(tempReadings.filter(r => r.source.includes('water'))),
      airTemperature: this.weightedAverage(tempReadings.filter(r => r.source.includes('air'))),
      barometricPressure: this.weightedAverage(pressureReadings),
      humidity: 70, // Would need humidity sensor
      waveHeight: 1.5, // Would need wave sensor
      currentSpeed: 0.5, // Would need current sensor
      currentDirection: 0
    };
  }

  /**
   * Fuse structural data
   */
  private fuseStructural(readings: Map<SensorType, SensorReading[]>): FusedStructural {
    const stressReadings = readings.get('hull_stress') || [];
    const vibrationReadings = readings.get('vibration') || [];

    const vibrationMap = new Map<string, number>();
    vibrationReadings.forEach(r => {
      vibrationMap.set(r.sensorId, r.value);
    });

    return {
      hullStress: stressReadings.map(r => r.value),
      vibrationLevels: vibrationMap,
      ballastStatus: [
        { id: 'fpt', name: 'Fore Peak Tank', capacity: 500, currentLevel: 250, temperature: 20 },
        { id: 'apt', name: 'Aft Peak Tank', capacity: 400, currentLevel: 200, temperature: 21 }
      ],
      draft: { fore: 8.5, aft: 9.0, mean: 8.75 },
      trim: 0.5,
      heel: 0.2
    };
  }

  /**
   * Calculate weighted average of readings
   */
  private weightedAverage(readings: SensorReading[]): number {
    if (readings.length === 0) return 0;

    let totalWeight = 0;
    let weightedSum = 0;

    for (const reading of readings) {
      const config = this.sensors.get(reading.sensorId);
      const weight = (config?.weight || 0.5) * reading.quality;
      weightedSum += reading.value * weight;
      totalWeight += weight;
    }

    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }

  /**
   * Calculate speed over ground from GPS readings
   */
  private calculateSOG(readings: SensorReading[]): number {
    if (readings.length < 2) return 0;
    
    const sorted = [...readings].sort((a, b) => 
      a.timestamp.getTime() - b.timestamp.getTime()
    );
    
    const last = sorted[sorted.length - 1];
    const prev = sorted[sorted.length - 2];
    
    // Simplified SOG calculation
    const timeDiff = (last.timestamp.getTime() - prev.timestamp.getTime()) / 1000 / 3600; // hours
    const distance = Math.abs(last.value - prev.value) * 60; // nautical miles (simplified)
    
    return timeDiff > 0 ? distance / timeDiff : 0;
  }

  /**
   * Calculate rate of turn from gyro readings
   */
  private calculateROT(readings: SensorReading[]): number {
    if (readings.length < 2) return 0;
    
    const sorted = [...readings].sort((a, b) => 
      a.timestamp.getTime() - b.timestamp.getTime()
    );
    
    const last = sorted[sorted.length - 1];
    const prev = sorted[sorted.length - 2];
    
    const timeDiff = (last.timestamp.getTime() - prev.timestamp.getTime()) / 1000 / 60; // minutes
    const headingChange = last.value - prev.value;
    
    return timeDiff > 0 ? headingChange / timeDiff : 0;
  }

  /**
   * Calculate overall fusion confidence
   */
  private calculateConfidence(readings: Map<SensorType, SensorReading[]>): number {
    const criticalTypes: SensorType[] = ['gps', 'gyro', 'speed_log', 'engine_rpm'];
    let availableCritical = 0;
    let totalQuality = 0;
    let readingCount = 0;

    for (const type of criticalTypes) {
      const typeReadings = readings.get(type);
      if (typeReadings && typeReadings.length > 0) {
        availableCritical++;
        typeReadings.forEach(r => {
          totalQuality += r.quality;
          readingCount++;
        });
      }
    }

    const coverageScore = availableCritical / criticalTypes.length;
    const qualityScore = readingCount > 0 ? totalQuality / readingCount : 0;

    return (coverageScore * 0.6 + qualityScore * 0.4) * 100;
  }

  /**
   * Get current fused data
   */
  getFusedData(): FusedData | null {
    return this.fusedData;
  }

  /**
   * Get sensor status
   */
  getSensorStatus(): Map<string, { lastReading: Date | null; quality: number; status: string }> {
    const status = new Map();
    const now = new Date();

    for (const [sensorId, config] of this.sensors) {
      const readings = this.readings.get(sensorId) || [];
      const lastReading = readings.length > 0 ? readings[readings.length - 1] : null;
      
      let sensorStatus = 'offline';
      if (lastReading) {
        const age = now.getTime() - lastReading.timestamp.getTime();
        if (age < config.maxAge) {
          sensorStatus = lastReading.quality > 0.8 ? 'optimal' : 
                         lastReading.quality > 0.5 ? 'degraded' : 'poor';
        } else {
          sensorStatus = 'stale';
        }
      }

      status.set(sensorId, {
        lastReading: lastReading?.timestamp || null,
        quality: lastReading?.quality || 0,
        status: sensorStatus
      });
    }

    return status;
  }

  /**
   * Simulate sensor data for testing
   */
  simulateData(): void {
    const now = new Date();
    
    // GPS data
    this.ingestReading({
      sensorId: 'gps_primary',
      sensorType: 'gps',
      value: -23.5505 * 1000 + (-46.6333), // São Paulo encoded
      unit: 'deg',
      timestamp: now,
      quality: 0.95,
      source: 'GPS Primary'
    });

    // Gyro data
    this.ingestReading({
      sensorId: 'gyro_main',
      sensorType: 'gyro',
      value: 145 + (Math.random() - 0.5) * 2,
      unit: 'deg',
      timestamp: now,
      quality: 0.98,
      source: 'Main Gyrocompass'
    });

    // Speed log
    this.ingestReading({
      sensorId: 'speed_log',
      sensorType: 'speed_log',
      value: 12.5 + (Math.random() - 0.5),
      unit: 'kts',
      timestamp: now,
      quality: 0.92,
      source: 'Doppler Speed Log'
    });

    // Engine RPM
    this.ingestReading({
      sensorId: 'engine_rpm_me1',
      sensorType: 'engine_rpm',
      value: 85 + (Math.random() - 0.5) * 5,
      unit: 'rpm',
      timestamp: now,
      quality: 0.99,
      source: 'Main Engine 1'
    });

    // Fuel flow
    this.ingestReading({
      sensorId: 'fuel_flow_me1',
      sensorType: 'fuel_flow',
      value: 2.5 + (Math.random() - 0.5) * 0.2,
      unit: 'm³/h',
      timestamp: now,
      quality: 0.95,
      source: 'Fuel Flow Meter ME1'
    });

    // Wind sensor
    this.ingestReading({
      sensorId: 'wind_sensor',
      sensorType: 'wind_sensor',
      value: 15 + (Math.random() - 0.5) * 5,
      unit: 'kts',
      timestamp: now,
      quality: 0.90,
      source: 'Anemometer'
    });
  }
}

// Singleton instance
export const sensorFusionEngine = new SensorFusionEngine();
