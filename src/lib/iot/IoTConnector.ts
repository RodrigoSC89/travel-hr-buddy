/**
 * IoT Connector - Real-time sensor data integration
 * PRODUCTION: Uses MQTT + Supabase Realtime for actual sensor data
 * FALLBACK: Mock data when no IoT infrastructure is available
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import { mqttClient } from "@/utils/mqttClient";

export interface SensorReading {
  sensorId: string;
  vesselId: string;
  type: 'fuel' | 'engine' | 'gps' | 'temperature' | 'pressure' | 'speed' | 'heading';
  value: number;
  unit: string;
  timestamp: Date;
  quality?: number;
  source?: 'mqtt' | 'realtime' | 'mock';
  metadata?: Record<string, unknown>;
}

export interface VesselTelemetry {
  vesselId: string;
  position: { lat: number; lng: number };
  speed: number;
  heading: number;
  fuelLevel: number;
  engineHours: number;
  engineRPM: number;
  temperature: number;
  lastUpdate: Date;
  dataSource: 'live' | 'cached' | 'mock';
}

type IoTListener = (data: SensorReading) => void;

// MQTT topics for vessel telemetry
const MQTT_TOPICS = {
  SENSOR_DATA: (vesselId: string) => `nautilus/vessels/${vesselId}/sensors`,
  TELEMETRY: (vesselId: string) => `nautilus/vessels/${vesselId}/telemetry`,
  ALERTS: (vesselId: string) => `nautilus/vessels/${vesselId}/alerts`,
};

class IoTConnectorService {
  private listeners: Map<string, Set<IoTListener>> = new Map();
  private mockIntervals: Map<string, NodeJS.Timeout> = new Map();
  private realtimeChannels: Map<string, ReturnType<typeof supabase.channel>> = new Map();
  private telemetryCache: Map<string, VesselTelemetry> = new Map();
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private useMockData: boolean = false;

  /**
   * Initialize IoT connection for a vessel
   * Attempts: MQTT → Supabase Realtime → Mock fallback
   */
  async connect(vesselId: string): Promise<boolean> {
    try {
      logger.info(`[IoT] Connecting to sensors for vessel: ${vesselId}`);

      // Try MQTT first (production IoT infrastructure)
      const mqttConnected = await this.connectMQTT(vesselId);
      if (mqttConnected) {
        this.isConnected = true;
        this.useMockData = false;
        logger.info(`[IoT] Connected via MQTT for vessel: ${vesselId}`);
        return true;
      }

      // Fallback to Supabase Realtime
      const realtimeConnected = await this.connectSupabaseRealtime(vesselId);
      if (realtimeConnected) {
        this.isConnected = true;
        this.useMockData = false;
        logger.info(`[IoT] Connected via Supabase Realtime for vessel: ${vesselId}`);
        return true;
      }

      // Final fallback: mock data for development
      logger.warn(`[IoT] No live IoT source available, using mock data for vessel: ${vesselId}`);
      this.startMockDataStream(vesselId);
      this.isConnected = true;
      this.useMockData = true;
      this.reconnectAttempts = 0;
      
      return true;
    } catch (error) {
      logger.error('[IoT] Connection failed:', error);
      return this.handleReconnect(vesselId);
    }
  }

  /**
   * Connect to MQTT broker for real sensor data
   */
  private async connectMQTT(vesselId: string): Promise<boolean> {
    const mqttUrl = import.meta.env.VITE_MQTT_URL;
    
    if (!mqttUrl) {
      logger.debug('[IoT] MQTT URL not configured, skipping MQTT connection');
      return false;
    }

    try {
      // Connect to MQTT broker
      mqttClient.connect(mqttUrl);
      
      // Subscribe to vessel sensor topics
      mqttClient.subscribe(MQTT_TOPICS.SENSOR_DATA(vesselId), (message) => {
        this.handleMQTTMessage(vesselId, message, 'sensor');
      });

      mqttClient.subscribe(MQTT_TOPICS.TELEMETRY(vesselId), (message) => {
        this.handleMQTTMessage(vesselId, message, 'telemetry');
      });

      return mqttClient.isConnected();
    } catch (error) {
      logger.error('[IoT] MQTT connection error:', error);
      return false;
    }
  }

  /**
   * Handle incoming MQTT messages
   */
  private handleMQTTMessage(vesselId: string, message: string, type: 'sensor' | 'telemetry'): void {
    try {
      const data = JSON.parse(message);
      
      if (type === 'sensor') {
        const reading: SensorReading = {
          sensorId: data.sensor_id || `mqtt-${data.type}`,
          vesselId,
          type: data.type,
          value: data.value,
          unit: data.unit || this.getDefaultUnit(data.type),
          timestamp: new Date(data.timestamp || Date.now()),
          quality: data.quality || 1.0,
          source: 'mqtt',
          metadata: data.metadata,
        };
        this.notifyListeners(vesselId, reading);
        this.updateTelemetryCache(vesselId, reading);
      } else if (type === 'telemetry') {
        // Full telemetry update
        const telemetry: VesselTelemetry = {
          vesselId,
          position: data.position || { lat: 0, lng: 0 },
          speed: data.speed || 0,
          heading: data.heading || 0,
          fuelLevel: data.fuel_level || 0,
          engineHours: data.engine_hours || 0,
          engineRPM: data.engine_rpm || 0,
          temperature: data.temperature || 0,
          lastUpdate: new Date(),
          dataSource: 'live',
        };
        this.telemetryCache.set(vesselId, telemetry);
      }
    } catch (error) {
      logger.error('[IoT] Error parsing MQTT message:', error);
    }
  }

  /**
   * Connect to Supabase Realtime for sensor data
   */
  private async connectSupabaseRealtime(vesselId: string): Promise<boolean> {
    try {
      const channel = supabase
        .channel(`iot-sensors-${vesselId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'sensor_readings',
            filter: `vessel_id=eq.${vesselId}`,
          },
          (payload) => {
            const data = payload.new as Record<string, unknown>;
            const reading: SensorReading = {
              sensorId: String(data.sensor_id || ''),
              vesselId,
              type: data.sensor_type as SensorReading['type'],
              value: Number(data.value),
              unit: String(data.unit || ''),
              timestamp: new Date(String(data.created_at)),
              quality: Number(data.quality_score || 1.0),
              source: 'realtime',
            };
            this.notifyListeners(vesselId, reading);
            this.updateTelemetryCache(vesselId, reading);
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'fleet_logs',
            filter: `vessel_id=eq.${vesselId}`,
          },
          (payload) => {
            const data = payload.new as Record<string, unknown>;
            if (data.log_type === 'telemetry') {
              const logData = data.data as Record<string, unknown>;
              this.processTelemetryLog(vesselId, logData);
            }
          }
        )
        .subscribe();

      this.realtimeChannels.set(vesselId, channel);
      
      // Check if there's recent data in the database
      const { data: recentData } = await supabase
        .from('fleet_logs')
        .select('*')
        .eq('vessel_id', vesselId as string)
        .eq('log_type', 'telemetry')
        .order('recorded_at', { ascending: false })
        .limit(1);

      return !!(recentData && recentData.length > 0);
    } catch (error) {
      logger.error('[IoT] Supabase Realtime connection error:', error);
      return false;
    }
  }

  /**
   * Process telemetry log from Supabase
   */
  private processTelemetryLog(vesselId: string, data: Record<string, unknown>): void {
    const telemetry: VesselTelemetry = {
      vesselId,
      position: (data.position as { lat: number; lng: number }) || { lat: 0, lng: 0 },
      speed: Number(data.speed) || 0,
      heading: Number(data.heading) || 0,
      fuelLevel: Number(data.fuel_level) || 0,
      engineHours: Number(data.engine_hours) || 0,
      engineRPM: Number(data.engine_rpm) || 0,
      temperature: Number(data.temperature) || 0,
      lastUpdate: new Date(),
      dataSource: 'live',
    };
    this.telemetryCache.set(vesselId, telemetry);
  }

  /**
   * Update telemetry cache with individual sensor reading
   */
  private updateTelemetryCache(vesselId: string, reading: SensorReading): void {
    const existing = this.telemetryCache.get(vesselId) || this.getDefaultTelemetry(vesselId);
    
    const updates: Partial<VesselTelemetry> = {};
    switch (reading.type) {
      case 'fuel':
        updates.fuelLevel = reading.value;
        break;
      case 'speed':
        updates.speed = reading.value;
        break;
      case 'heading':
        updates.heading = reading.value;
        break;
      case 'engine':
        updates.engineRPM = reading.value;
        break;
      case 'temperature':
        updates.temperature = reading.value;
        break;
      case 'gps':
        // GPS reading format: value is lat, metadata contains lng
        if (reading.metadata?.lng) {
          updates.position = { lat: reading.value, lng: Number(reading.metadata.lng) };
        }
        break;
    }

    this.telemetryCache.set(vesselId, {
      ...existing,
      ...updates,
      lastUpdate: new Date(),
      dataSource: reading.source === 'mock' ? 'mock' : 'live',
    });
  }

  /**
   * Get default telemetry structure
   */
  private getDefaultTelemetry(vesselId: string): VesselTelemetry {
    return {
      vesselId,
      position: { lat: 0, lng: 0 },
      speed: 0,
      heading: 0,
      fuelLevel: 0,
      engineHours: 0,
      engineRPM: 0,
      temperature: 0,
      lastUpdate: new Date(),
      dataSource: 'mock',
    };
  }

  /**
   * Disconnect from IoT sensors
   */
  disconnect(vesselId: string): void {
    // Clear mock interval
    const interval = this.mockIntervals.get(vesselId);
    if (interval) {
      clearInterval(interval);
      this.mockIntervals.delete(vesselId);
    }

    // Unsubscribe from MQTT
    if (mqttClient.isConnected()) {
      mqttClient.unsubscribe(MQTT_TOPICS.SENSOR_DATA(vesselId));
      mqttClient.unsubscribe(MQTT_TOPICS.TELEMETRY(vesselId));
    }

    // Unsubscribe from Supabase Realtime
    const channel = this.realtimeChannels.get(vesselId);
    if (channel) {
      supabase.removeChannel(channel);
      this.realtimeChannels.delete(vesselId);
    }

    this.listeners.delete(vesselId);
    this.telemetryCache.delete(vesselId);
    logger.info(`[IoT] Disconnected from sensors for vessel: ${vesselId}`);
  }

  /**
   * Subscribe to sensor updates
   */
  subscribe(vesselId: string, listener: IoTListener): () => void {
    if (!this.listeners.has(vesselId)) {
      this.listeners.set(vesselId, new Set());
    }
    this.listeners.get(vesselId)!.add(listener);
    
    return () => {
      this.listeners.get(vesselId)?.delete(listener);
    };
  }

  /**
   * Get current telemetry for a vessel
   * Returns cached live data or fetches from database
   */
  async getVesselTelemetry(vesselId: string): Promise<VesselTelemetry> {
    // Return cached live data if available and fresh (< 30 seconds old)
    const cached = this.telemetryCache.get(vesselId);
    if (cached && Date.now() - cached.lastUpdate.getTime() < 30000) {
      return cached;
    }

    // Try to fetch from database
    try {
      const { data } = await supabase
        .from('fleet_logs')
        .select('data')
        .eq('vessel_id', vesselId)
        .eq('log_type', 'telemetry')
        .order('recorded_at', { ascending: false })
        .limit(1)
        .single();

      if (data?.data) {
        const logData = data.data as Record<string, unknown>;
        const telemetry: VesselTelemetry = {
          vesselId,
          position: (logData.position as { lat: number; lng: number }) || { lat: -23.9618, lng: -46.3322 },
          speed: Number(logData.speed) || 12,
          heading: Number(logData.heading) || 180,
          fuelLevel: Number(logData.fuel_level) || 75,
          engineHours: Number(logData.engine_hours) || 12500,
          engineRPM: Number(logData.engine_rpm) || 1800,
          temperature: Number(logData.temperature) || 78,
          lastUpdate: new Date(),
          dataSource: 'cached',
        };
        this.telemetryCache.set(vesselId, telemetry);
        return telemetry;
      }
    } catch {
      // Database fetch failed, use mock
    }

    // Fallback to mock data
    return this.generateMockTelemetry(vesselId);
  }

  /**
   * Generate mock telemetry with realistic variance
   */
  private generateMockTelemetry(vesselId: string): VesselTelemetry {
    // Use deterministic seed based on vesselId for consistent base values
    const seed = vesselId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const baseVariance = (seed % 100) / 100;

    return {
      vesselId,
      position: { 
        lat: -23.9618 + (baseVariance * 0.1 - 0.05), 
        lng: -46.3322 + (baseVariance * 0.1 - 0.05) 
      },
      speed: 10 + baseVariance * 8,
      heading: Math.floor(baseVariance * 360),
      fuelLevel: 60 + baseVariance * 30,
      engineHours: 12000 + Math.floor(baseVariance * 1000),
      engineRPM: 1700 + Math.floor(baseVariance * 500),
      temperature: 70 + baseVariance * 20,
      lastUpdate: new Date(),
      dataSource: 'mock',
    };
  }

  /**
   * Save sensor reading to database
   */
  async saveSensorReading(reading: SensorReading): Promise<void> {
    try {
      await supabase.from('fleet_logs').insert({
        vessel_id: reading.vesselId,
        log_type: 'sensor_reading',
        data: {
          sensor_id: reading.sensorId,
          type: reading.type,
          value: reading.value,
          unit: reading.unit,
          quality: reading.quality,
          source: reading.source,
        },
        severity: 'info',
        source: 'iot-connector',
      });
    } catch (error) {
      logger.debug('[IoT] Could not save sensor reading:', { error: String(error) });
    }
  }

  /**
   * Get historical sensor data
   */
  async getHistoricalData(
    vesselId: string,
    sensorType: string,
    startDate: Date,
    endDate: Date
  ): Promise<SensorReading[]> {
    try {
      const { data } = await supabase
        .from('fleet_logs')
        .select('*')
        .eq('vessel_id', vesselId)
        .eq('log_type', 'sensor_reading')
        .gte('recorded_at', startDate.toISOString())
        .lte('recorded_at', endDate.toISOString())
        .order('recorded_at', { ascending: true });

      if (!data) return [];

      return data
        .filter((log) => {
          const logData = log.data as Record<string, unknown>;
          return logData.type === sensorType;
        })
        .map((log) => {
          const logData = log.data as Record<string, unknown>;
          return {
            sensorId: String(logData.sensor_id || ''),
            vesselId,
            type: logData.type as SensorReading['type'],
            value: Number(logData.value),
            unit: String(logData.unit || ''),
            timestamp: new Date(log.recorded_at || Date.now()),
            quality: Number(logData.quality || 1.0),
            source: logData.source as SensorReading['source'],
          };
        });
    } catch (error) {
      logger.debug('[IoT] Error fetching historical data:', { error: String(error) });
      return [];
    }
  }

  /**
   * Start mock data stream for development
   */
  private startMockDataStream(vesselId: string): void {
    const interval = setInterval(() => {
      const sensorTypes: SensorReading['type'][] = ['fuel', 'engine', 'gps', 'temperature', 'speed', 'heading'];
      
      sensorTypes.forEach(type => {
        const reading = this.generateMockReading(vesselId, type);
        this.notifyListeners(vesselId, reading);
        this.updateTelemetryCache(vesselId, reading);
      });
    }, 5000);

    this.mockIntervals.set(vesselId, interval);
  }

  /**
   * Generate mock sensor reading with realistic patterns
   */
  private generateMockReading(vesselId: string, type: SensorReading['type']): SensorReading {
    // Get cached telemetry to maintain consistency
    const cached = this.telemetryCache.get(vesselId);
    
    // Small random walk from current values for realism
    const walkAmount = () => (Math.random() - 0.5) * 2;
    
    const sensorConfigs: Record<string, { base: number; variance: number; unit: string }> = {
      fuel: { base: cached?.fuelLevel || 70, variance: 0.1, unit: '%' },
      engine: { base: cached?.engineRPM || 1850, variance: 50, unit: 'RPM' },
      gps: { base: cached?.position.lat || -23.9618, variance: 0.001, unit: 'degrees' },
      temperature: { base: cached?.temperature || 78, variance: 2, unit: '°C' },
      speed: { base: cached?.speed || 12, variance: 0.5, unit: 'knots' },
      heading: { base: cached?.heading || 180, variance: 5, unit: 'degrees' },
      pressure: { base: 1013, variance: 5, unit: 'hPa' },
    };

    const config = sensorConfigs[type] || { base: 0, variance: 1, unit: '' };
    const value = config.base + walkAmount() * config.variance;

    return {
      sensorId: `sensor-${type}-${vesselId.slice(0, 8)}`,
      vesselId,
      type,
      value: Math.round(value * 100) / 100,
      unit: config.unit,
      timestamp: new Date(),
      quality: 0.95 + Math.random() * 0.05,
      source: 'mock',
      metadata: type === 'gps' ? { lng: (cached?.position.lng || -46.3322) + walkAmount() * 0.001 } : undefined,
    };
  }

  /**
   * Get default unit for sensor type
   */
  private getDefaultUnit(type: string): string {
    const units: Record<string, string> = {
      fuel: '%',
      engine: 'RPM',
      gps: 'degrees',
      temperature: '°C',
      speed: 'knots',
      heading: 'degrees',
      pressure: 'hPa',
    };
    return units[type] || '';
  }

  /**
   * Notify all listeners of new sensor data
   */
  private notifyListeners(vesselId: string, reading: SensorReading): void {
    const listeners = this.listeners.get(vesselId);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(reading);
        } catch (err) {
          logger.error('[IoT] Error in listener:', { error: String(err) });
        }
      });
    }
  }

  /**
   * Handle reconnection attempts
   */
  private async handleReconnect(vesselId: string): Promise<boolean> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logger.error('[IoT] Max reconnection attempts reached');
      return false;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    
    logger.info(`[IoT] Attempting reconnection in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    await new Promise(resolve => setTimeout(resolve, delay));
    return this.connect(vesselId);
  }

  /**
   * Check connection status
   */
  isIoTConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Check if using mock data
   */
  isUsingMockData(): boolean {
    return this.useMockData;
  }

  /**
   * Get data source status
   */
  getDataSourceStatus(): 'mqtt' | 'realtime' | 'mock' | 'disconnected' {
    if (!this.isConnected) return 'disconnected';
    if (this.useMockData) return 'mock';
    if (mqttClient.isConnected()) return 'mqtt';
    return 'realtime';
  }
}

// Export singleton instance
export const iotConnector = new IoTConnectorService();
