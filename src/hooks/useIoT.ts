/**
 * useIoT Hook - React hook for IoT sensor integration
 */

import { useState, useEffect, useCallback } from "react";
import { iotConnector, SensorReading, VesselTelemetry } from "@/lib/iot/IoTConnector";

interface UseIoTOptions {
  vesselId: string;
  autoConnect?: boolean;
}

interface UseIoTReturn {
  isConnected: boolean;
  telemetry: VesselTelemetry | null;
  latestReadings: Map<string, SensorReading>;
  connect: () => Promise<void>;
  disconnect: () => void;
  error: string | null;
}

export function useIoT({ vesselId, autoConnect = true }: UseIoTOptions): UseIoTReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [telemetry, setTelemetry] = useState<VesselTelemetry | null>(null);
  const [latestReadings, setLatestReadings] = useState<Map<string, SensorReading>>(new Map());
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async () => {
    try {
      setError(null);
      const connected = await iotConnector.connect(vesselId);
      setIsConnected(connected);
      
      if (connected) {
        const initialTelemetry = await iotConnector.getVesselTelemetry(vesselId);
        setTelemetry(initialTelemetry);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect to IoT sensors");
      setIsConnected(false);
    }
  }, [vesselId]);

  const disconnect = useCallback(() => {
    iotConnector.disconnect(vesselId);
    setIsConnected(false);
    setTelemetry(null);
    setLatestReadings(new Map());
  }, [vesselId]);

  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    // Subscribe to sensor updates
    const unsubscribe = iotConnector.subscribe(vesselId, (reading) => {
      setLatestReadings(prev => {
        const next = new Map(prev);
        next.set(reading.type, reading);
        return next;
      });

      // Update telemetry with latest readings
      setTelemetry(prev => {
        if (!prev) return null;
        
        const updates: Partial<VesselTelemetry> = {};
        
        switch (reading.type) {
        case "fuel":
          updates.fuelLevel = reading.value;
          break;
        case "speed":
          updates.speed = reading.value;
          break;
        case "heading":
          updates.heading = reading.value;
          break;
        case "engine":
          updates.engineRPM = reading.value;
          break;
        case "temperature":
          updates.temperature = reading.value;
          break;
        }
        
        return { ...prev, ...updates, lastUpdate: new Date() };
      });
    });

    return () => {
      unsubscribe();
      if (autoConnect) {
        disconnect();
      }
    };
  }, [vesselId, autoConnect, connect, disconnect]);

  return {
    isConnected,
    telemetry,
    latestReadings,
    connect,
    disconnect,
    error
  };
}
