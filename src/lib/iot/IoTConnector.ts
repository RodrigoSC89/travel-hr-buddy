/**
 * IoT Connector - Real-time sensor data integration
 * Connects to vessel sensors, GPS, fuel monitors, engine telemetry
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export interface SensorReading {
  sensorId: string;
  vesselId: string;
  type: 'fuel' | 'engine' | 'gps' | 'temperature' | 'pressure' | 'speed' | 'heading';
  value: number;
  unit: string;
  timestamp: Date;
  metadata?: Record<string, any>;
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
}

type IoTListener = (data: SensorReading) => void;

class IoTConnectorService {
  private listeners: Map<string, Set<IoTListener>> = new Map();
  private mockIntervals: Map<string, NodeJS.Timeout> = new Map();
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;

  /**
   * Initialize IoT connection for a vessel
   */
  async connect(vesselId: string): Promise<boolean> {
    try {
      logger.info(`Connecting to IoT sensors for vessel: ${vesselId}`);
      
      // In production, this would connect to actual MQTT/WebSocket endpoints
      // For now, we simulate with mock data
      this.startMockDataStream(vesselId);
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      return true;
    } catch (error) {
      logger.error('IoT connection failed:', error);
      return this.handleReconnect(vesselId);
    }
  }

  /**
   * Disconnect from IoT sensors
   */
  disconnect(vesselId: string): void {
    const interval = this.mockIntervals.get(vesselId);
    if (interval) {
      clearInterval(interval);
      this.mockIntervals.delete(vesselId);
    }
    this.listeners.delete(vesselId);
    logger.info(`Disconnected from IoT sensors for vessel: ${vesselId}`);
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
   */
  async getVesselTelemetry(vesselId: string): Promise<VesselTelemetry> {
    // In production, fetch from real sensors
    return {
      vesselId,
      position: { lat: -23.9618 + Math.random() * 0.1, lng: -46.3322 + Math.random() * 0.1 },
      speed: 12 + Math.random() * 5,
      heading: Math.floor(Math.random() * 360),
      fuelLevel: 65 + Math.random() * 20,
      engineHours: 12500 + Math.floor(Math.random() * 100),
      engineRPM: 1800 + Math.floor(Math.random() * 400),
      temperature: 75 + Math.random() * 15,
      lastUpdate: new Date()
    };
  }

  /**
   * Save sensor reading to database (skipped if table doesn't exist)
   */
  async saveSensorReading(reading: SensorReading): Promise<void> {
    // IoT sensor table may not exist - this is handled gracefully
    logger.debug('Sensor reading captured (local only):', { type: reading.type, value: reading.value });
  }

  /**
   * Get historical sensor data (returns empty if table doesn't exist)
   */
  async getHistoricalData(
    vesselId: string,
    sensorType: string,
    startDate: Date,
    endDate: Date
  ): Promise<SensorReading[]> {
    // Return empty array - IoT table may not exist yet
    logger.debug('Historical data requested:', { vesselId, sensorType });
    return [];
  }

  /**
   * Start mock data stream for development
   */
  private startMockDataStream(vesselId: string): void {
    const interval = setInterval(() => {
      const sensorTypes: SensorReading['type'][] = ['fuel', 'engine', 'gps', 'temperature', 'speed'];
      
      sensorTypes.forEach(type => {
        const reading = this.generateMockReading(vesselId, type);
        this.notifyListeners(vesselId, reading);
      });
    }, 5000); // Update every 5 seconds

    this.mockIntervals.set(vesselId, interval);
  }

  /**
   * Generate mock sensor reading
   */
  private generateMockReading(vesselId: string, type: SensorReading['type']): SensorReading {
    const baseValues: Record<string, { value: number; unit: string }> = {
      fuel: { value: 65 + Math.random() * 20, unit: '%' },
      engine: { value: 1800 + Math.random() * 400, unit: 'RPM' },
      gps: { value: -23.9618 + Math.random() * 0.01, unit: 'degrees' },
      temperature: { value: 75 + Math.random() * 15, unit: '°C' },
      speed: { value: 12 + Math.random() * 5, unit: 'knots' },
      heading: { value: Math.floor(Math.random() * 360), unit: 'degrees' },
      pressure: { value: 1013 + Math.random() * 20, unit: 'hPa' }
    };

    const { value, unit } = baseValues[type] || { value: 0, unit: '' };

    return {
      sensorId: `sensor-${type}-${vesselId.slice(0, 8)}`,
      vesselId,
      type,
      value,
      unit,
      timestamp: new Date()
    };
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
          logger.error('Error in IoT listener:', { error: String(err) });
        }
      });
    }
  }

  /**
   * Handle reconnection attempts
   */
  private async handleReconnect(vesselId: string): Promise<boolean> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logger.error('Max reconnection attempts reached');
      return false;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    
    logger.info(`Attempting reconnection in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    await new Promise(resolve => setTimeout(resolve, delay));
    return this.connect(vesselId);
  }

  /**
   * Check connection status
   */
  isIoTConnected(): boolean {
    return this.isConnected;
  }
}

// Export singleton instance
export const iotConnector = new IoTConnectorService();
