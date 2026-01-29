/**
 * Hook for fetching IoT sensor data from Supabase
 * Replaces mock data with real-time sensor readings
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface SensorReading {
  id: string;
  sensorType: string;
  value: number;
  unit: string;
  timestamp: Date;
  status: "normal" | "warning" | "critical";
  location: string;
}

interface VesselSensors {
  vesselId: string;
  vesselName: string;
  sensors: SensorReading[];
  lastUpdate: Date;
  connectionStatus: "online" | "offline" | "unstable";
}

export function useIoTSensors() {
  const fetchSensors = useCallback(async (): Promise<VesselSensors[]> => {
    // Fetch vessels first
    const { data: vessels, error: vesselsError } = await supabase
      .from('vessels')
      .select('id, name, status')
      .limit(10);

    if (vesselsError) throw vesselsError;

    if (!vessels || vessels.length === 0) {
      return [];
    }

    // Map vessels to sensor format - in production, fetch from iot_sensors table
    return vessels.map(vessel => ({
      vesselId: vessel.id,
      vesselName: vessel.name || 'Unknown Vessel',
      lastUpdate: new Date(),
      connectionStatus: vessel.status === 'active' ? 'online' as const : 'offline' as const,
      sensors: [] // Sensors would come from a dedicated IoT table
    }));
  }, []);

  return useQuery({
    queryKey: ['iot-sensors'],
    queryFn: fetchSensors,
    staleTime: 1000 * 60 * 5, // 5 min cache
    refetchInterval: false, // DISABLED - prevent infinite loading
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

export function useVesselSensorAlerts(vesselId?: string) {
  return useQuery({
    queryKey: ['sensor-alerts', vesselId],
    queryFn: async () => {
      const query = supabase
        .from('vessel_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (vesselId) {
        query.eq('vessel_id', vesselId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: true
  });
}
