import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SensorReading {
  sensor_type: string;
  value: number;
  unit: string;
  timestamp: string;
}

interface EquipmentHealth {
  equipment_id: string;
  equipment_name: string;
  health_score: number;
  failure_probability: number;
  recommended_action: string;
  estimated_rul_days: number; // Remaining Useful Life
  anomaly_detected: boolean;
  anomaly_details?: string;
}

interface PredictiveMaintenanceResult {
  vessel_id: string;
  analyzed_at: string;
  equipment_health: EquipmentHealth[];
  overall_health_score: number;
  critical_alerts: string[];
  maintenance_schedule: Array<{
    equipment_id: string;
    recommended_date: string;
    maintenance_type: string;
    priority: "low" | "medium" | "high" | "critical";
    estimated_cost: number;
  }>;
}

// Threshold configurations for different sensor types
const SENSOR_THRESHOLDS: Record<string, { warning: number; critical: number; unit: string }> = {
  engine_temperature: { warning: 85, critical: 95, unit: "°C" },
  engine_pressure: { warning: 8.5, critical: 9.5, unit: "bar" },
  engine_vibration: { warning: 4.5, critical: 6.0, unit: "mm/s" },
  fuel_consumption: { warning: 120, critical: 150, unit: "kg/h" },
  oil_pressure: { warning: 3.0, critical: 2.0, unit: "bar" },
  coolant_temperature: { warning: 75, critical: 85, unit: "°C" },
  exhaust_temperature: { warning: 450, critical: 500, unit: "°C" },
  generator_load: { warning: 85, critical: 95, unit: "%" },
  bearing_temperature: { warning: 65, critical: 80, unit: "°C" },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, ...data } = await req.json();

    // Auth check
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[Digital Twin] Action: ${action}`);

    switch (action) {
      case "get_vessel_state":
        return await getVesselState(supabase, data.vessel_id);
      
      case "ingest_sensor_data":
        return await ingestSensorData(supabase, data.vessel_id, data.readings);
      
      case "analyze_equipment_health":
        return await analyzeEquipmentHealth(supabase, data.vessel_id);
      
      case "predict_maintenance":
        return await predictMaintenance(supabase, data.vessel_id);
      
      case "forecast_state":
        return await forecastState(supabase, data.vessel_id, data.hours_ahead);
      
      case "get_anomalies":
        return await getAnomalies(supabase, data.vessel_id, data.time_range);
      
      case "simulate_scenario":
        return await simulateScenario(supabase, data.vessel_id, data.scenario);
      
      default:
        return new Response(
          JSON.stringify({ error: "Unknown action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[Digital Twin] Error:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function getVesselState(supabase: any, vesselId: string): Promise<Response> {
  // Get vessel info
  const { data: vessel, error: vesselError } = await supabase
    .from("vessels")
    .select("*")
    .eq("id", vesselId)
    .single();

  if (vesselError as Error | null) {
    return new Response(
      JSON.stringify({ error: "Vessel not found" }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Get latest sensor readings
  const { data: sensors } = await supabase
    .from("equipment_sensors")
    .select("*")
    .eq("vessel_id", vesselId)
    .order("recorded_at", { ascending: false })
    .limit(50);

  // Get active crew
  const { data: crew } = await supabase
    .from("crew_rotations")
    .select("*, crew_member:crew_member_id(*)")
    .eq("vessel_id", vesselId)
    .eq("status", "onboard");

  // Get current operations
  const { data: operations } = await supabase
    .from("voyage_operations")
    .select("*")
    .eq("vessel_id", vesselId)
    .eq("status", "in_progress")
    .order("created_at", { ascending: false })
    .limit(1);

  // Calculate overall health
  const healthMetrics = calculateHealthMetrics(sensors || []);

  const digitalTwinState = {
    vessel_id: vesselId,
    vessel_info: vessel,
    state_timestamp: new Date().toISOString(),
    sensors: {
      latest_readings: sensors || [],
      health_metrics: healthMetrics,
    },
    crew: {
      onboard_count: crew?.length || 0,
      crew_members: crew || [],
    },
    operations: {
      current_voyage: operations?.[0] || null,
      status: vessel.status,
    },
    position: vessel.last_known_position || null,
    overall_health_score: healthMetrics.overall_score,
  };

  return new Response(
    JSON.stringify(digitalTwinState),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function ingestSensorData(
  supabase: any,
  vesselId: string,
  readings: SensorReading[]
): Promise<Response> {
  const insertData = readings.map(reading => ({
    vessel_id: vesselId,
    sensor_type: reading.sensor_type,
    sensor_value: reading.value,
    unit: reading.unit,
    recorded_at: reading.timestamp || new Date().toISOString(),
    metadata: { source: "digital_twin_api" },
  }));

  const { data, error } = await supabase
    .from("equipment_sensors")
    .insert(insertData)
    .select();

  if (error) {
    console.error("[Digital Twin] Sensor ingestion error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to ingest sensor data" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Check for anomalies
  const anomalies = detectAnomalies(readings);
  
  if (anomalies.length > 0) {
    // Store anomalies
    await supabase.from("ai_suggestions").insert(
      anomalies.map(a => ({
        vessel_id: vesselId,
        module_name: "digital_twin",
        suggestion_type: "anomaly_detection",
        severity: a.severity,
        issue_description: a.description,
        suggestion_text: a.recommendation,
        confidence: a.confidence,
        status: "pending",
      }))
    );
  }

  return new Response(
    JSON.stringify({
      ingested: data?.length || 0,
      anomalies_detected: anomalies.length,
      anomalies,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function analyzeEquipmentHealth(supabase: any, vesselId: string): Promise<Response> {
  // Get sensor history (last 24 hours)
  const { data: sensorHistory } = await supabase
    .from("equipment_sensors")
    .select("*")
    .eq("vessel_id", vesselId)
    .gte("recorded_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .order("recorded_at", { ascending: true });

  if (!sensorHistory || sensorHistory.length === 0) {
    return new Response(
      JSON.stringify({ 
        vessel_id: vesselId,
        message: "No sensor data available",
        equipment_health: [] 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Group by sensor type and analyze
  const sensorGroups: Record<string, any[]> = {};
  sensorHistory.forEach((reading: any) => {
    if (!sensorGroups[reading.sensor_type]) {
      sensorGroups[reading.sensor_type] = [];
    }
    sensorGroups[reading.sensor_type].push(reading);
  });

  const equipmentHealth: EquipmentHealth[] = [];

  for (const [sensorType, readings] of Object.entries(sensorGroups)) {
    const values = readings.map((r: any) => r.sensor_value);
    const analysis = analyzeTimeSeries(values, sensorType);
    
    equipmentHealth.push({
      equipment_id: sensorType,
      equipment_name: sensorType.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
      health_score: analysis.health_score,
      failure_probability: analysis.failure_probability,
      recommended_action: analysis.recommendation,
      estimated_rul_days: analysis.rul_days,
      anomaly_detected: analysis.anomaly_detected,
      anomaly_details: analysis.anomaly_details,
    });
  }

  const overallHealth = equipmentHealth.length > 0
    ? equipmentHealth.reduce((sum, e) => sum + e.health_score, 0) / equipmentHealth.length
    : 100;

  const criticalAlerts = equipmentHealth
    .filter(e => e.failure_probability > 0.3 || e.health_score < 60)
    .map(e => `${e.equipment_name}: ${e.recommended_action}`);

  return new Response(
    JSON.stringify({
      vessel_id: vesselId,
      analyzed_at: new Date().toISOString(),
      equipment_health: equipmentHealth,
      overall_health_score: Math.round(overallHealth),
      critical_alerts: criticalAlerts,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function predictMaintenance(supabase: any, vesselId: string): Promise<Response> {
  // Get equipment health first
  const healthResponse = await analyzeEquipmentHealth(supabase, vesselId);
  const healthData = await healthResponse.json();

  // Get maintenance history
  const { data: maintenanceHistory } = await supabase
    .from("maintenance_tasks")
    .select("*")
    .eq("vessel_id", vesselId)
    .order("completed_at", { ascending: false })
    .limit(100);

  // Generate maintenance schedule
  const maintenanceSchedule = healthData.equipment_health
    .filter((e: EquipmentHealth) => e.health_score < 80 || e.failure_probability > 0.1)
    .map((e: EquipmentHealth) => {
      const priority = e.health_score < 50 ? "critical" :
                       e.health_score < 70 ? "high" :
                       e.health_score < 85 ? "medium" : "low";
      
      const daysUntilMaintenance = Math.max(1, Math.floor(e.estimated_rul_days * 0.8));
      const recommendedDate = new Date();
      recommendedDate.setDate(recommendedDate.getDate() + daysUntilMaintenance);

      return {
        equipment_id: e.equipment_id,
        equipment_name: e.equipment_name,
        recommended_date: recommendedDate.toISOString().split("T")[0],
        maintenance_type: e.health_score < 50 ? "overhaul" : "preventive",
        priority,
        estimated_cost: estimateMaintenanceCost(e.equipment_id, priority),
        health_score: e.health_score,
        failure_probability: e.failure_probability,
      };
    })
    .sort((a: any, b: any) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority as keyof typeof priorityOrder] - 
             priorityOrder[b.priority as keyof typeof priorityOrder];
    });

  const result: PredictiveMaintenanceResult = {
    vessel_id: vesselId,
    analyzed_at: new Date().toISOString(),
    equipment_health: healthData.equipment_health,
    overall_health_score: healthData.overall_health_score,
    critical_alerts: healthData.critical_alerts,
    maintenance_schedule: maintenanceSchedule,
  };

  // Store prediction for tracking
  await supabase.from("ai_suggestions").insert({
    vessel_id: vesselId,
    module_name: "predictive_maintenance",
    suggestion_type: "maintenance_prediction",
    severity: maintenanceSchedule.some((m: any) => m.priority === "critical") ? "critical" : "info",
    issue_description: `Analyzed ${healthData.equipment_health.length} equipment sensors`,
    suggestion_text: `Generated ${maintenanceSchedule.length} maintenance recommendations`,
    confidence: 0.85,
    metadata: { schedule: maintenanceSchedule },
    status: "pending",
  });

  return new Response(
    JSON.stringify(result),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function forecastState(
  supabase: any,
  vesselId: string,
  hoursAhead: number = 72
): Promise<Response> {
  // Get sensor history for forecasting
  const { data: sensorHistory } = await supabase
    .from("equipment_sensors")
    .select("*")
    .eq("vessel_id", vesselId)
    .gte("recorded_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .order("recorded_at", { ascending: true });

  if (!sensorHistory || sensorHistory.length < 10) {
    return new Response(
      JSON.stringify({ 
        error: "Insufficient data for forecasting",
        minimum_required: 10,
        current_count: sensorHistory?.length || 0
      }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Group by sensor type
  const sensorGroups: Record<string, number[]> = {};
  sensorHistory.forEach((reading: any) => {
    if (!sensorGroups[reading.sensor_type]) {
      sensorGroups[reading.sensor_type] = [];
    }
    sensorGroups[reading.sensor_type].push(reading.sensor_value);
  });

  // Simple linear regression forecast for each sensor
  const forecasts: Record<string, any> = {};
  
  for (const [sensorType, values] of Object.entries(sensorGroups)) {
    const trend = calculateTrend(values);
    const currentValue = values[values.length - 1];
    const forecastedValue = currentValue + (trend * hoursAhead);
    
    const threshold = SENSOR_THRESHOLDS[sensorType];
    let risk = "low";
    if (threshold) {
      if (forecastedValue >= threshold.critical) risk = "critical";
      else if (forecastedValue >= threshold.warning) risk = "warning";
    }

    forecasts[sensorType] = {
      current_value: Math.round(currentValue * 100) / 100,
      forecasted_value: Math.round(forecastedValue * 100) / 100,
      trend: trend > 0 ? "increasing" : trend < 0 ? "decreasing" : "stable",
      trend_rate: Math.round(trend * 1000) / 1000,
      risk_level: risk,
      threshold: threshold || null,
    };
  }

  // Identify risks
  const risks = Object.entries(forecasts)
    .filter(([_, f]: [string, any]) => f.risk_level !== "low")
    .map(([sensor, f]: [string, any]) => ({
      sensor,
      forecasted_value: f.forecasted_value,
      risk_level: f.risk_level,
      hours_until_threshold: f.threshold ? 
        Math.abs((f.threshold.warning - f.current_value) / f.trend_rate) : null,
    }));

  return new Response(
    JSON.stringify({
      vessel_id: vesselId,
      forecast_hours: hoursAhead,
      generated_at: new Date().toISOString(),
      sensor_forecasts: forecasts,
      identified_risks: risks,
      overall_risk: risks.some(r => r.risk_level === "critical") ? "high" :
                    risks.some(r => r.risk_level === "warning") ? "medium" : "low",
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function getAnomalies(
  supabase: any,
  vesselId: string,
  timeRange: string = "24h"
): Promise<Response> {
  const hours = timeRange === "7d" ? 168 : timeRange === "48h" ? 48 : 24;
  const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

  const { data: anomalies } = await supabase
    .from("ai_suggestions")
    .select("*")
    .eq("vessel_id", vesselId)
    .eq("suggestion_type", "anomaly_detection")
    .gte("created_at", since)
    .order("created_at", { ascending: false });

  return new Response(
    JSON.stringify({
      vessel_id: vesselId,
      time_range: timeRange,
      anomalies: anomalies || [],
      total_count: anomalies?.length || 0,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function simulateScenario(
  supabase: any,
  vesselId: string,
  scenario: any
): Promise<Response> {
  // Get current state
  const stateResponse = await getVesselState(supabase, vesselId);
  const currentState = await stateResponse.json();

  // Apply scenario modifications
  const simulationResults = {
    scenario_name: scenario.name || "Custom Scenario",
    base_state: currentState,
    modifications: scenario.modifications || {},
    outcomes: [] as any[],
  };

  // Simulate different outcomes based on scenario type
  if (scenario.type === "speed_change") {
    const newSpeed = scenario.new_speed || 12;
    const fuelImpact = calculateFuelImpact(currentState, newSpeed);
    simulationResults.outcomes.push({
      metric: "fuel_consumption",
      current: currentState.sensors?.health_metrics?.fuel?.average || 100,
      projected: fuelImpact.projected_consumption,
      change_percent: fuelImpact.change_percent,
    });
  }

  if (scenario.type === "route_deviation") {
    const deviationNm = scenario.deviation_nm || 50;
    const timeImpact = deviationNm / 12; // Assuming 12 knots
    simulationResults.outcomes.push({
      metric: "voyage_time",
      additional_hours: timeImpact,
      additional_fuel_cost: timeImpact * 150, // $150/hour fuel cost
    });
  }

  if (scenario.type === "maintenance_delay") {
    const delayDays = scenario.delay_days || 7;
    const healthImpact = delayDays * 2; // 2% health degradation per day
    simulationResults.outcomes.push({
      metric: "equipment_health",
      current_score: currentState.overall_health_score,
      projected_score: Math.max(0, currentState.overall_health_score - healthImpact),
      failure_risk_increase: delayDays * 0.05,
    });
  }

  return new Response(
    JSON.stringify(simulationResults),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

// Helper functions
function calculateHealthMetrics(sensors: any[]): any {
  if (sensors.length === 0) {
    return { overall_score: 100 };
  }

  const grouped: Record<string, number[]> = {};
  sensors.forEach(s => {
    if (!grouped[s.sensor_type]) grouped[s.sensor_type] = [];
    grouped[s.sensor_type].push(s.sensor_value);
  });

  let totalScore = 0;
  let count = 0;

  for (const [type, values] of Object.entries(grouped)) {
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const threshold = SENSOR_THRESHOLDS[type];
    
    if (threshold) {
      const score = avg < threshold.warning ? 100 :
                    avg < threshold.critical ? 70 : 40;
      totalScore += score;
      count++;
    }
  }

  return {
    overall_score: count > 0 ? Math.round(totalScore / count) : 100,
    sensor_count: sensors.length,
    sensor_types: Object.keys(grouped).length,
  };
}

function detectAnomalies(readings: SensorReading[]): any[] {
  const anomalies = [];
  
  for (const reading of readings) {
    const threshold = SENSOR_THRESHOLDS[reading.sensor_type];
    if (!threshold) continue;

    if (reading.value >= threshold.critical) {
      anomalies.push({
        sensor_type: reading.sensor_type,
        value: reading.value,
        threshold: threshold.critical,
        severity: "critical",
        description: `Critical ${reading.sensor_type.replace(/_/g, " ")}: ${reading.value}${threshold.unit} exceeds ${threshold.critical}${threshold.unit}`,
        recommendation: `Immediate inspection required for ${reading.sensor_type.replace(/_/g, " ")}`,
        confidence: 0.95,
      });
    } else if (reading.value >= threshold.warning) {
      anomalies.push({
        sensor_type: reading.sensor_type,
        value: reading.value,
        threshold: threshold.warning,
        severity: "warning",
        description: `Warning ${reading.sensor_type.replace(/_/g, " ")}: ${reading.value}${threshold.unit} exceeds ${threshold.warning}${threshold.unit}`,
        recommendation: `Schedule maintenance check for ${reading.sensor_type.replace(/_/g, " ")}`,
        confidence: 0.85,
      });
    }
  }

  return anomalies;
}

function analyzeTimeSeries(values: number[], sensorType: string): any {
  const n = values.length;
  const avg = values.reduce((a, b) => a + b, 0) / n;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / n;
  const stdDev = Math.sqrt(variance);
  
  // Trend analysis
  const trend = calculateTrend(values);
  
  // Check against thresholds
  const threshold = SENSOR_THRESHOLDS[sensorType];
  let healthScore = 100;
  let failureProbability = 0;
  
  if (threshold) {
    const latestValue = values[values.length - 1];
    if (latestValue >= threshold.critical) {
      healthScore = 30;
      failureProbability = 0.7;
    } else if (latestValue >= threshold.warning) {
      healthScore = 60;
      failureProbability = 0.3;
    } else {
      healthScore = 90;
      failureProbability = 0.05;
    }
  }

  // Adjust for volatility
  const cv = stdDev / avg; // Coefficient of variation
  if (cv > 0.3) {
    healthScore -= 10;
    failureProbability += 0.1;
  }

  const anomalyDetected = cv > 0.5 || (threshold && values[values.length - 1] >= threshold.warning);
  
  return {
    health_score: Math.max(0, Math.min(100, healthScore)),
    failure_probability: Math.min(1, Math.max(0, failureProbability)),
    recommendation: getRecommendation(healthScore, sensorType),
    rul_days: Math.max(1, Math.floor((100 - healthScore) * 3)),
    anomaly_detected: anomalyDetected,
    anomaly_details: anomalyDetected ? `High variability (CV: ${cv.toFixed(2)}) or threshold breach` : undefined,
    statistics: { avg, stdDev, trend },
  };
}

function calculateTrend(values: number[]): number {
  if (values.length < 2) return 0;
  
  const n = values.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += values[i];
    sumXY += i * values[i];
    sumX2 += i * i;
  }
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  return slope;
}

function getRecommendation(healthScore: number, equipmentType: string): string {
  if (healthScore < 50) {
    return `Critical: Schedule immediate overhaul for ${equipmentType.replace(/_/g, " ")}`;
  } else if (healthScore < 70) {
    return `High priority: Plan preventive maintenance within 7 days`;
  } else if (healthScore < 85) {
    return `Normal: Include in next scheduled maintenance window`;
  }
  return `Good condition: Continue regular monitoring`;
}

function estimateMaintenanceCost(equipmentId: string, priority: string): number {
  const baseCosts: Record<string, number> = {
    engine_temperature: 15000,
    engine_pressure: 12000,
    engine_vibration: 8000,
    fuel_consumption: 5000,
    oil_pressure: 3000,
    coolant_temperature: 2500,
    exhaust_temperature: 7000,
    generator_load: 10000,
    bearing_temperature: 4000,
  };

  const multipliers: Record<string, number> = {
    critical: 2.5,
    high: 1.5,
    medium: 1.0,
    low: 0.8,
  };

  const baseCost = baseCosts[equipmentId] || 5000;
  const multiplier = multipliers[priority] || 1.0;

  return Math.round(baseCost * multiplier);
}

function calculateFuelImpact(currentState: any, newSpeed: number): any {
  const currentFuel = currentState.sensors?.health_metrics?.fuel?.average || 100;
  // Fuel consumption roughly proportional to speed cubed
  const currentSpeed = 14; // Assume 14 knots current
  const ratio = Math.pow(newSpeed / currentSpeed, 3);
  const projectedConsumption = currentFuel * ratio;
  
  return {
    projected_consumption: Math.round(projectedConsumption * 10) / 10,
    change_percent: Math.round((ratio - 1) * 100),
  };
}
