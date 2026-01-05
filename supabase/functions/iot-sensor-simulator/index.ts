/**
 * IoT Sensor Simulator Edge Function
 * Simulates IoT sensors sending real-time data to equipment_sensors table
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SensorConfig {
  equipment_id: string;
  equipment_name: string;
  vessel_id: string;
  sensor_type: string;
  unit: string;
  min_threshold: number;
  max_threshold: number;
  base_value: number;
  variance: number;
}

const SENSOR_CONFIGS: SensorConfig[] = [
  { equipment_id: 'eng-001', equipment_name: 'Main Engine #1', vessel_id: 'vessel-001', sensor_type: 'temperature', unit: '°C', min_threshold: 60, max_threshold: 95, base_value: 75, variance: 10 },
  { equipment_id: 'eng-001', equipment_name: 'Main Engine #1', vessel_id: 'vessel-001', sensor_type: 'vibration', unit: 'mm/s', min_threshold: 0, max_threshold: 4.5, base_value: 2.2, variance: 1.5 },
  { equipment_id: 'eng-001', equipment_name: 'Main Engine #1', vessel_id: 'vessel-001', sensor_type: 'rpm', unit: 'RPM', min_threshold: 800, max_threshold: 1800, base_value: 1200, variance: 200 },
  { equipment_id: 'gen-001', equipment_name: 'Generator #1', vessel_id: 'vessel-001', sensor_type: 'voltage', unit: 'V', min_threshold: 380, max_threshold: 420, base_value: 400, variance: 15 },
  { equipment_id: 'gen-001', equipment_name: 'Generator #1', vessel_id: 'vessel-001', sensor_type: 'current', unit: 'A', min_threshold: 0, max_threshold: 100, base_value: 55, variance: 20 },
  { equipment_id: 'gen-001', equipment_name: 'Generator #1', vessel_id: 'vessel-001', sensor_type: 'temperature', unit: '°C', min_threshold: 40, max_threshold: 85, base_value: 62, variance: 12 },
  { equipment_id: 'pump-001', equipment_name: 'Ballast Pump #1', vessel_id: 'vessel-001', sensor_type: 'pressure', unit: 'bar', min_threshold: 2, max_threshold: 8, base_value: 5, variance: 2 },
  { equipment_id: 'pump-001', equipment_name: 'Ballast Pump #1', vessel_id: 'vessel-001', sensor_type: 'flow', unit: 'm³/h', min_threshold: 50, max_threshold: 200, base_value: 120, variance: 40 },
  { equipment_id: 'comp-001', equipment_name: 'Air Compressor', vessel_id: 'vessel-001', sensor_type: 'temperature', unit: '°C', min_threshold: 40, max_threshold: 90, base_value: 65, variance: 15 },
  { equipment_id: 'comp-001', equipment_name: 'Air Compressor', vessel_id: 'vessel-001', sensor_type: 'pressure', unit: 'bar', min_threshold: 6, max_threshold: 10, base_value: 8, variance: 1.5 },
  { equipment_id: 'fuel-001', equipment_name: 'Fuel Tank Main', vessel_id: 'vessel-001', sensor_type: 'fuel', unit: '%', min_threshold: 20, max_threshold: 100, base_value: 75, variance: 5 },
  { equipment_id: 'cool-001', equipment_name: 'Cooling System', vessel_id: 'vessel-001', sensor_type: 'temperature', unit: '°C', min_threshold: 15, max_threshold: 35, base_value: 25, variance: 5 },
];

function generateSensorReading(config: SensorConfig, anomalyChance: number = 0.08): any {
  const variation = (Math.random() - 0.5) * 2 * config.variance;
  let value = config.base_value + variation;
  
  // Simulate anomalies
  const isAnomaly = Math.random() < anomalyChance;
  if (isAnomaly) {
    const direction = Math.random() > 0.5 ? 1 : -1;
    value = direction > 0 
      ? config.max_threshold * (1.05 + Math.random() * 0.15)
      : config.min_threshold * (0.75 + Math.random() * 0.15);
  }

  value = Math.round(value * 100) / 100;

  return {
    equipment_id: config.equipment_id,
    equipment_name: config.equipment_name,
    vessel_id: config.vessel_id,
    sensor_type: config.sensor_type,
    value: value,
    unit: config.unit,
    min_threshold: config.min_threshold,
    max_threshold: config.max_threshold,
    is_anomaly: isAnomaly || value > config.max_threshold || value < config.min_threshold,
    raw_data: {
      timestamp: new Date().toISOString(),
      source: 'iot-simulator',
      quality: Math.random() > 0.05 ? 'good' : 'uncertain',
    },
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'single';
    const count = parseInt(url.searchParams.get('count') || '5', 10);
    const anomalyChance = parseFloat(url.searchParams.get('anomaly') || '0.08');

    console.log(`[IoT Simulator] Action: ${action}, Count: ${count}, Anomaly chance: ${anomalyChance}`);

    if (action === 'bulk') {
      // Generate multiple readings for testing
      const readings = [];
      for (let i = 0; i < count; i++) {
        const config = SENSOR_CONFIGS[Math.floor(Math.random() * SENSOR_CONFIGS.length)];
        readings.push(generateSensorReading(config, anomalyChance));
      }

      const { data, error } = await supabase
        .from('equipment_sensors')
        .insert(readings)
        .select();

      if (error) {
        console.error('[IoT Simulator] Insert error:', error);
        throw error;
      }

      console.log(`[IoT Simulator] Inserted ${readings.length} sensor readings`);
      
      return new Response(JSON.stringify({
        success: true,
        message: `Inserted ${readings.length} sensor readings`,
        data: data,
        anomalies: data?.filter((r: any) => r.is_anomaly).length || 0,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Single reading mode - pick a random sensor
    const config = SENSOR_CONFIGS[Math.floor(Math.random() * SENSOR_CONFIGS.length)];
    const reading = generateSensorReading(config, anomalyChance);

    const { data, error } = await supabase
      .from('equipment_sensors')
      .insert(reading)
      .select()
      .single();

    if (error) {
      console.error('[IoT Simulator] Insert error:', error);
      throw error;
    }

    console.log(`[IoT Simulator] Inserted reading: ${config.equipment_name} ${config.sensor_type} = ${reading.value}${config.unit}`);

    return new Response(JSON.stringify({
      success: true,
      message: 'Sensor reading inserted',
      data: data,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[IoT Simulator] Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
