import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    )

    const { sensorData, vesselId, sensorType } = await req.json()

    if (!sensorData || !vesselId || !sensorType) {
      throw new Error('Sensor data, vessel ID, and sensor type are required')
    }

    const timestamp = new Date().toISOString()

    // Process different types of sensor data
    let processedData = { ...sensorData }
    let alerts = []
    let predictions = []

    switch (sensorType) {
      case 'engine_temperature':
        // Check for overheating
        if (sensorData.value > 85) {
          alerts.push({
            type: 'engine_overheating',
            severity: sensorData.value > 95 ? 'critical' : 'warning',
            message: `Motor superaquecendo: ${sensorData.value}°C`,
            sensorId: sensorData.sensorId,
            threshold: 85
          })
        }
        
        // Predict maintenance needs
        if (sensorData.value > 80) {
          predictions.push({
            type: 'maintenance_prediction',
            component: 'engine_cooling_system',
            probability: Math.min(95, (sensorData.value - 70) * 5),
            timeframe: '7-14 dias',
            recommendation: 'Verificar sistema de resfriamento'
          })
        }
        break

      case 'vibration':
        // Check for unusual vibrations
        if (sensorData.value > 5.0) {
          alerts.push({
            type: 'unusual_vibration',
            severity: sensorData.value > 8.0 ? 'critical' : 'warning',
            message: `Vibração anormal detectada: ${sensorData.value} mm/s`,
            sensorId: sensorData.sensorId,
            threshold: 5.0
          })
        }

        // Predict bearing issues
        if (sensorData.value > 4.0) {
          predictions.push({
            type: 'bearing_wear',
            component: 'main_bearings',
            probability: Math.min(90, (sensorData.value - 2) * 20),
            timeframe: '14-30 dias',
            recommendation: 'Inspeção de rolamentos recomendada'
          })
        }
        break

      case 'fuel_level':
        // Check for low fuel
        if (sensorData.value < 20) {
          alerts.push({
            type: 'low_fuel',
            severity: sensorData.value < 10 ? 'critical' : 'warning',
            message: `Nível de combustível baixo: ${sensorData.value}%`,
            sensorId: sensorData.sensorId,
            threshold: 20
          })
        }

        // Predict fuel consumption
        predictions.push({
          type: 'fuel_consumption',
          component: 'fuel_system',
          estimatedRange: Math.round(sensorData.value * 8.5), // Mock calculation
          hoursRemaining: Math.round(sensorData.value * 0.8),
          recommendation: sensorData.value < 30 ? 'Planejar reabastecimento' : 'Consumo normal'
        })
        break

      case 'oil_pressure':
        // Check for low oil pressure
        if (sensorData.value < 2.5) {
          alerts.push({
            type: 'low_oil_pressure',
            severity: sensorData.value < 1.5 ? 'critical' : 'warning',
            message: `Pressão de óleo baixa: ${sensorData.value} bar`,
            sensorId: sensorData.sensorId,
            threshold: 2.5
          })
        }
        break

      case 'battery_voltage':
        // Check battery health
        if (sensorData.value < 12.0) {
          alerts.push({
            type: 'low_battery',
            severity: sensorData.value < 11.5 ? 'critical' : 'warning',
            message: `Tensão da bateria baixa: ${sensorData.value}V`,
            sensorId: sensorData.sensorId,
            threshold: 12.0
          })
        }
        break
    }

    // Store sensor data
    const { error: sensorError } = await supabaseClient
      .from('iot_sensors')
      .upsert({
        sensor_id: sensorData.sensorId,
        vessel_id: vesselId,
        sensor_type: sensorType,
        value: sensorData.value,
        unit: sensorData.unit || '',
        location: sensorData.location || null,
        timestamp: timestamp,
        metadata: {
          raw_data: sensorData,
          processed_alerts: alerts,
          predictions: predictions
        }
      })

    if (sensorError) {
      console.error('Error storing sensor data:', sensorError)
    }

    // Create alerts if any
    if (alerts.length > 0) {
      for (const alert of alerts) {
        await supabaseClient
          .from('intelligent_notifications')
          .insert({
            user_id: null, // System generated
            type: alert.type,
            title: 'Alerta de Sensor IoT',
            message: alert.message,
            priority: alert.severity === 'critical' ? 'critical' : 'high',
            metadata: {
              vessel_id: vesselId,
              sensor_id: sensorData.sensorId,
              sensor_type: sensorType,
              threshold: alert.threshold,
              current_value: sensorData.value
            }
          })
      }
    }

    // Generate maintenance recommendations
    const maintenanceRecommendations = predictions.filter(p => p.probability && p.probability > 70)

    return new Response(
      JSON.stringify({
        success: true,
        processed: {
          timestamp,
          vesselId,
          sensorType,
          value: sensorData.value,
          status: alerts.length > 0 ? 'alert' : 'normal'
        },
        alerts,
        predictions,
        maintenanceRecommendations,
        analytics: {
          totalSensors: 1,
          alertsGenerated: alerts.length,
          predictionsGenerated: predictions.length
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in iot-sensor-processing:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})