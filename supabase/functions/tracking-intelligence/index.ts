import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore - Deno ESM import
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface TrackingRequest {
  action: 'fleet_overview' | 'iot_dashboard' | 'telemetry_analysis' | 'geofence_alerts' | 'tracking_ai_analysis';
  params?: Record<string, unknown>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, params }: TrackingRequest = await req.json();
    console.log(`[Tracking-Intelligence] Action: ${action}`);

    let result: Record<string, unknown> = {};

    switch (action) {
      case 'fleet_overview': {
        const [trackingRes, vesselsRes] = await Promise.all([
          supabase.from('vessel_tracking')
            .select('*')
            .order('recorded_at', { ascending: false })
            .limit(200),
          supabase.from('vessels')
            .select('id, name, imo_number, status, vessel_type')
            .limit(50),
        ]);

        const tracking = trackingRes.data || [];
        const vessels = vesselsRes.data || [];

        // Get latest position per vessel
        const vesselMap = new Map<string, any>();
        for (const t of tracking) {
          if (!vesselMap.has(t.vessel_id)) {
            const vessel = vessels.find((v: any) => v.id === t.vessel_id);
            vesselMap.set(t.vessel_id, {
              ...t,
              vesselName: vessel?.name || 'Unknown',
              vesselType: vessel?.vessel_type || 'Unknown',
              imo: vessel?.imo_number || 'N/A',
            });
          }
        }

        result = {
          positions: Array.from(vesselMap.values()),
          totalVessels: vessels.length,
          trackedVessels: vesselMap.size,
          totalPositions: tracking.length,
        };
        break;
      }

      case 'iot_dashboard': {
        const [sensorsRes, alertsRes, readingsRes] = await Promise.all([
          supabase.from('iot_sensors')
            .select('*')
            .order('updated_at', { ascending: false })
            .limit(100),
          supabase.from('iot_sensor_alerts')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50),
          supabase.from('iot_sensor_readings')
            .select('*')
            .order('recorded_at', { ascending: false })
            .limit(200),
        ]);

        const sensors = sensorsRes.data || [];
        const alerts = alertsRes.data || [];

        // Sensor stats
        const sensorsByType = new Map<string, number>();
        const sensorsByStatus = new Map<string, number>();
        for (const s of sensors) {
          sensorsByType.set(s.sensor_type, (sensorsByType.get(s.sensor_type) || 0) + 1);
          sensorsByStatus.set(s.status || 'unknown', (sensorsByStatus.get(s.status || 'unknown') || 0) + 1);
        }

        result = {
          sensors,
          alerts,
          readings: readingsRes.data || [],
          stats: {
            totalSensors: sensors.length,
            activeSensors: sensors.filter((s: any) => s.status === 'active' || s.status === 'online').length,
            criticalAlerts: alerts.filter((a: any) => a.severity === 'critical' && !a.resolved).length,
            byType: Array.from(sensorsByType.entries()).map(([type, count]) => ({ type, count })),
            byStatus: Array.from(sensorsByStatus.entries()).map(([status, count]) => ({ status, count })),
          },
        };
        break;
      }

      case 'telemetry_analysis': {
        const [logsRes, alertsRes, insightsRes] = await Promise.all([
          supabase.from('telemetry_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100),
          supabase.from('telemetry_alerts')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50),
          supabase.from('telemetry_insights')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(30),
        ]);

        result = {
          logs: logsRes.data || [],
          alerts: alertsRes.data || [],
          insights: insightsRes.data || [],
          stats: {
            totalLogs: logsRes.data?.length || 0,
            activeAlerts: (alertsRes.data || []).filter((a: any) => !a.resolved).length,
            pendingInsights: (insightsRes.data || []).filter((i: any) => i.status === 'pending' || i.status === 'active').length,
          },
        };
        break;
      }

      case 'geofence_alerts': {
        // Combine IoT alerts and telemetry alerts for geofencing
        const [iotAlerts, telAlerts] = await Promise.all([
          supabase.from('iot_sensor_alerts')
            .select('*')
            .eq('alert_type', 'geofence')
            .order('created_at', { ascending: false })
            .limit(30),
          supabase.from('telemetry_alerts')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(30),
        ]);

        result = {
          geofenceAlerts: iotAlerts.data || [],
          telemetryAlerts: telAlerts.data || [],
          totalUnresolved: [
            ...(iotAlerts.data || []).filter((a: any) => !a.resolved),
            ...(telAlerts.data || []).filter((a: any) => !a.resolved),
          ].length,
        };
        break;
      }

      case 'tracking_ai_analysis': {
        const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
        if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

        // Gather context
        const [trackRes, sensorsRes, alertsRes] = await Promise.all([
          supabase.from('vessel_tracking').select('vessel_id, latitude, longitude, speed_knots, heading, engine_status, fuel_level').order('recorded_at', { ascending: false }).limit(30),
          supabase.from('iot_sensors').select('sensor_type, status, current_value, unit, location').limit(20),
          supabase.from('telemetry_alerts').select('alert_type, severity, message, resolved').order('created_at', { ascending: false }).limit(15),
        ]);

        const context = {
          positions: trackRes.data?.length || 0,
          sensors: sensorsRes.data?.length || 0,
          alerts: alertsRes.data?.length || 0,
          unresolvedAlerts: (alertsRes.data || []).filter((a: any) => !a.resolved).length,
          sensorTypes: [...new Set((sensorsRes.data || []).map((s: any) => s.sensor_type))],
        };

        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              { 
                role: "system", 
                content: `Você é o especialista em Tracking & Telemetria do Nautilus One, um sistema de gestão marítima. Analise dados de rastreamento de frota e sensores IoT. Forneça: 1) Status geral da frota, 2) Alertas críticos de sensores, 3) Anomalias detectadas, 4) Recomendações operacionais, 5) Previsões de manutenção baseadas em telemetria. Responda em PT-BR com markdown.` 
              },
              { role: "user", content: `Dados de rastreamento e telemetria:\n${JSON.stringify(context, null, 2)}\n\nPosições recentes:\n${JSON.stringify(trackRes.data?.slice(0, 10), null, 2)}\n\nSensores:\n${JSON.stringify(sensorsRes.data?.slice(0, 10), null, 2)}\n\nAlertas:\n${JSON.stringify(alertsRes.data?.slice(0, 10), null, 2)}` },
            ],
            stream: false,
            temperature: 0.5,
            max_tokens: 2000,
          }),
        });

        if (!response.ok) {
          if (response.status === 429) {
            return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
              status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
          throw new Error(`AI Gateway error: ${response.status}`);
        }

        const aiResponse = await response.json();
        result = {
          analysis: aiResponse.choices?.[0]?.message?.content || 'Análise não disponível',
          context,
          generatedAt: new Date().toISOString(),
        };
        break;
      }

      default:
        return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    console.log(`[Tracking-Intelligence] ${action} completed`);
    return new Response(JSON.stringify({ success: true, data: result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("[Tracking-Intelligence] Error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error",
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
