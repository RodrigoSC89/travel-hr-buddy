/**
 * PATCH 597 - Situational Signal Collector
 * 
 * Collects operational situational signals (voice, climate, sensors, navigation)
 * Implements:
 * - Integration with sensors (mock or real)
 * - Signal normalization
 * - Continuous logging with timestamps
 * - Real-time streaming support
 */

import { supabase } from "@/integrations/supabase/client";

export type SignalType = "voice" | "climate" | "sensor" | "navigation";

export interface RawSignal {
  type: SignalType;
  data: any;
  metadata?: Record<string, any>;
}

export interface NormalizedSignal {
  type: SignalType;
  value: number | string | boolean;
  unit?: string;
  quality: number; // 0-1 scale
  source: string;
}

export interface SignalRecord {
  id: string;
  mission_id: string;
  signal_type: SignalType;
  raw_data: any;
  normalized_data: NormalizedSignal;
  timestamp: string;
  metadata: Record<string, any>;
}

/**
 * Situational Signal Collector Class
 */
export class SituationalSignalCollector {
  private streamingCallbacks: Map<SignalType, ((signal: SignalRecord) => void)[]> = new Map();
  private isStreaming: boolean = false;
  private streamingInterval: NodeJS.Timeout | null = null;

  /**
   * Collect and store a signal
   */
  async collectSignal(
    missionId: string,
    rawSignal: RawSignal
  ): Promise<SignalRecord | null> {
    console.log(`📡 [Signal Collector] Collecting ${rawSignal.type} signal for mission ${missionId}`);

    try {
      // Normalize the signal
      const normalizedData = this.normalizeSignal(rawSignal);

      // Store in Supabase
      const { data, error } = await supabase
        .from("situational_signals")
        .insert({
          mission_id: missionId,
          signal_type: rawSignal.type,
          raw_data: rawSignal.data,
          normalized_data: normalizedData,
          metadata: rawSignal.metadata || {},
          timestamp: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error("❌ [Signal Collector] Error storing signal:", error);
        return null;
      }

      const signalRecord = data as SignalRecord;
      console.log(`✅ [Signal Collector] Signal stored with ID: ${signalRecord.id}`);

      // Notify streaming listeners
      this.notifyStreamingListeners(signalRecord);

      return signalRecord;
    } catch (err) {
      console.error("❌ [Signal Collector] Exception collecting signal:", err);
      return null;
    }
  }

  /**
   * Normalize raw signal data
   */
  private normalizeSignal(rawSignal: RawSignal): NormalizedSignal {
    switch (rawSignal.type) {
      case "voice":
        return this.normalizeVoiceSignal(rawSignal.data);
      case "climate":
        return this.normalizeClimateSignal(rawSignal.data);
      case "sensor":
        return this.normalizeSensorSignal(rawSignal.data);
      case "navigation":
        return this.normalizeNavigationSignal(rawSignal.data);
      default:
        return {
          type: rawSignal.type,
          value: rawSignal.data,
          quality: 0.5,
          source: "unknown",
        };
    }
  }

  /**
   * Normalize voice signal
   */
  private normalizeVoiceSignal(data: any): NormalizedSignal {
    const volume = typeof data.volume === "number" ? data.volume : 50;
    const clarity = typeof data.clarity === "number" ? data.clarity : 0.7;

    return {
      type: "voice",
      value: data.transcript || data.text || "",
      unit: "text",
      quality: clarity,
      source: data.source || "microphone",
    };
  }

  /**
   * Normalize climate signal
   */
  private normalizeClimateSignal(data: any): NormalizedSignal {
    const temperature = typeof data.temperature === "number" ? data.temperature : 20;
    const humidity = typeof data.humidity === "number" ? data.humidity : 50;
    const quality = (temperature >= -10 && temperature <= 40) ? 1.0 : 0.5;

    return {
      type: "climate",
      value: temperature,
      unit: data.unit || "celsius",
      quality,
      source: data.source || "weather-api",
    };
  }

  /**
   * Normalize sensor signal
   */
  private normalizeSensorSignal(data: any): NormalizedSignal {
    const value = typeof data.value === "number" ? data.value : 0;
    const maxValue = data.max_value || 100;
    const quality = Math.min(1, Math.abs(value) / maxValue);

    return {
      type: "sensor",
      value: value,
      unit: data.unit || "units",
      quality: data.quality || quality,
      source: data.sensor_id || "sensor-generic",
    };
  }

  /**
   * Normalize navigation signal
   */
  private normalizeNavigationSignal(data: any): NormalizedSignal {
    const latitude = typeof data.latitude === "number" ? data.latitude : 0;
    const longitude = typeof data.longitude === "number" ? data.longitude : 0;
    
    // Check if coordinates are valid
    const isValidLat = latitude >= -90 && latitude <= 90;
    const isValidLon = longitude >= -180 && longitude <= 180;
    const quality = (isValidLat && isValidLon) ? 1.0 : 0.0;

    return {
      type: "navigation",
      value: JSON.stringify({ latitude, longitude, altitude: data.altitude }),
      unit: "coordinates",
      quality,
      source: data.source || "gps",
    };
  }

  /**
   * Fetch signals for a mission
   */
  async getSignals(
    missionId: string,
    signalType?: SignalType,
    limit: number = 100
  ): Promise<SignalRecord[]> {
    console.log(`📊 [Signal Collector] Fetching signals for mission ${missionId}`);

    try {
      let query = supabase
        .from("situational_signals")
        .select("*")
        .eq("mission_id", missionId)
        .order("timestamp", { ascending: false })
        .limit(limit);

      if (signalType) {
        query = query.eq("signal_type", signalType);
      }

      const { data, error } = await query;

      if (error) {
        console.error("❌ [Signal Collector] Error fetching signals:", error);
        return [];
      }

      return (data || []) as SignalRecord[];
    } catch (err) {
      console.error("❌ [Signal Collector] Exception fetching signals:", err);
      return [];
    }
  }

  /**
   * Get signal statistics
   */
  async getSignalStats(missionId: string): Promise<Record<SignalType, number>> {
    console.log(`📈 [Signal Collector] Getting signal stats for mission ${missionId}`);

    const signals = await this.getSignals(missionId, undefined, 1000);

    const stats: Record<string, number> = {
      voice: 0,
      climate: 0,
      sensor: 0,
      navigation: 0,
    };

    signals.forEach((signal) => {
      stats[signal.signal_type] = (stats[signal.signal_type] || 0) + 1;
    });

    return stats as Record<SignalType, number>;
  }

  /**
   * Start streaming signals in real-time
   */
  startStreaming(intervalMs: number = 5000): void {
    if (this.isStreaming) {
      console.warn("⚠️ [Signal Collector] Streaming already active");
      return;
    }

    console.log(`🔴 [Signal Collector] Starting streaming (interval: ${intervalMs}ms)`);
    this.isStreaming = true;

    // Mock streaming - in production, this would connect to real sensors
    this.streamingInterval = setInterval(() => {
      this.generateMockSignals();
    }, intervalMs);
  }

  /**
   * Stop streaming
   */
  stopStreaming(): void {
    if (!this.isStreaming) {
      console.warn("⚠️ [Signal Collector] Streaming not active");
      return;
    }

    console.log("⏹️ [Signal Collector] Stopping streaming");
    this.isStreaming = false;

    if (this.streamingInterval) {
      clearInterval(this.streamingInterval);
      this.streamingInterval = null;
    }
  }

  /**
   * Subscribe to signal type updates
   */
  onSignal(signalType: SignalType, callback: (signal: SignalRecord) => void): () => void {
    if (!this.streamingCallbacks.has(signalType)) {
      this.streamingCallbacks.set(signalType, []);
    }

    this.streamingCallbacks.get(signalType)!.push(callback);
    console.log(`📻 [Signal Collector] Subscribed to ${signalType} signals`);

    // Return unsubscribe function
    return () => {
      const callbacks = this.streamingCallbacks.get(signalType);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  /**
   * Notify streaming listeners
   */
  private notifyStreamingListeners(signal: SignalRecord): void {
    const callbacks = this.streamingCallbacks.get(signal.signal_type);
    if (callbacks && callbacks.length > 0) {
      callbacks.forEach((callback) => callback(signal));
    }
  }

  /**
   * Generate mock signals for demonstration
   */
  private async generateMockSignals(): Promise<void> {
    const missionId = "demo-mission";
    const signalTypes: SignalType[] = ["voice", "climate", "sensor", "navigation"];

    for (const type of signalTypes) {
      await this.collectSignal(missionId, this.generateMockSignalData(type));
    }
  }

  /**
   * Generate mock signal data
   */
  private generateMockSignalData(type: SignalType): RawSignal {
    switch (type) {
      case "voice":
        return {
          type: "voice",
          data: {
            transcript: "All systems operational",
            volume: Math.random() * 100,
            clarity: 0.8 + Math.random() * 0.2,
            source: "radio",
          },
        };

      case "climate":
        return {
          type: "climate",
          data: {
            temperature: 15 + Math.random() * 20,
            humidity: 40 + Math.random() * 30,
            pressure: 1000 + Math.random() * 50,
            unit: "celsius",
            source: "weather-station",
          },
        };

      case "sensor":
        return {
          type: "sensor",
          data: {
            value: Math.random() * 100,
            unit: "percent",
            sensor_id: "sensor-001",
            quality: 0.9,
          },
        };

      case "navigation":
        return {
          type: "navigation",
          data: {
            latitude: -23.5505 + (Math.random() - 0.5) * 0.1,
            longitude: -46.6333 + (Math.random() - 0.5) * 0.1,
            altitude: 760 + Math.random() * 50,
            speed: Math.random() * 60,
            heading: Math.random() * 360,
            source: "gps",
          },
        };
    }
  }
}

// Singleton instance
export const signalCollector = new SituationalSignalCollector();

// Demo/Example usage
export async function demonstrateSituationalCollector() {
  console.log("🚀 [Demo] Starting Signal Collector demonstration...");

  const missionId = `mission-signals-${Date.now()}`;

  // Collect voice signal
  await signalCollector.collectSignal(missionId, {
    type: "voice",
    data: {
      transcript: "Mission control, ready for deployment",
      volume: 75,
      clarity: 0.9,
      source: "radio-alpha",
    },
  });

  // Collect climate signal
  await signalCollector.collectSignal(missionId, {
    type: "climate",
    data: {
      temperature: 22,
      humidity: 65,
      pressure: 1013,
      unit: "celsius",
      source: "weather-api",
    },
  });

  // Collect sensor signal
  await signalCollector.collectSignal(missionId, {
    type: "sensor",
    data: {
      value: 85,
      unit: "percent",
      sensor_id: "fuel-sensor-01",
      quality: 0.95,
    },
  });

  // Collect navigation signal
  await signalCollector.collectSignal(missionId, {
    type: "navigation",
    data: {
      latitude: -23.5505,
      longitude: -46.6333,
      altitude: 760,
      speed: 45,
      heading: 270,
      source: "gps-primary",
    },
  });

  // Get statistics
  const stats = await signalCollector.getSignalStats(missionId);
  console.log("📊 Signal Statistics:", stats);

  // Get all signals
  const signals = await signalCollector.getSignals(missionId, undefined, 10);
  console.log(`📡 Collected ${signals.length} signals`);

  console.log("✅ [Demo] Signal Collector demonstration complete!");
}
