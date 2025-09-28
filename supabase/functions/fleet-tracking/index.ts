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

    const { vesselId, location, status, heading, speed } = await req.json()

    if (!vesselId) {
      throw new Error('Vessel ID is required')
    }

    const timestamp = new Date().toISOString()

    // Update vessel position and status
    const { error: vesselError } = await supabaseClient
      .from('vessels')
      .update({
        current_location: location,
        status: status || 'operational',
        last_position_update: timestamp,
        heading: heading || null,
        speed: speed || null
      })
      .eq('id', vesselId)

    if (vesselError) {
      throw new Error('Failed to update vessel position: ' + vesselError.message)
    }

    // Create tracking record
    const trackingData = {
      vessel_id: vesselId,
      latitude: location?.lat || null,
      longitude: location?.lon || null,
      heading: heading || null,
      speed: speed || null,
      status: status || 'operational',
      timestamp: timestamp,
      metadata: {
        source: 'fleet-tracking',
        accuracy: location?.accuracy || null
      }
    }

    // Insert into vessel_tracking table (if exists)
    const { error: trackingError } = await supabaseClient
      .from('vessel_tracking')
      .insert(trackingData)

    if (trackingError) {
      console.warn('Could not insert tracking data:', trackingError)
      // Continue without failing - tracking table might not exist yet
    }

    // Calculate distance from last position for fuel/maintenance estimates
    let distanceTraveled = 0
    if (location && speed) {
      // Simple distance calculation for demonstration
      distanceTraveled = (speed || 0) * 0.1 // Rough estimate
    }

    // Check for alerts based on position and status
    const alerts = []

    // Check if vessel is in restricted area (mock check)
    if (location && location.lat > 50 && location.lat < 60) {
      alerts.push({
        type: 'restricted_area',
        severity: 'warning',
        message: 'Embarcação se aproximando de área restrita'
      })
    }

    // Check for maintenance alerts based on distance
    if (distanceTraveled > 100) {
      alerts.push({
        type: 'maintenance_due',
        severity: 'info',
        message: 'Manutenção preventiva recomendada'
      })
    }

    // Check speed limits
    if (speed && speed > 30) {
      alerts.push({
        type: 'speed_limit',
        severity: 'warning',
        message: 'Velocidade acima do limite recomendado'
      })
    }

    // Get nearby vessels for collision avoidance
    let nearbyVessels: any[] = []
    if (location) {
      const { data: vessels } = await supabaseClient
        .from('vessels')
        .select('id, name, current_location, status')
        .neq('id', vesselId)
        .not('current_location', 'is', null)

      if (vessels) {
        nearbyVessels = vessels.filter(vessel => {
          if (!vessel.current_location) return false
          const distance = calculateDistance(
            location.lat, location.lon,
            vessel.current_location.lat, vessel.current_location.lon
          )
          return distance < 10 // Within 10km
        }).map(vessel => ({
          id: vessel.id,
          name: vessel.name,
          location: vessel.current_location,
          status: vessel.status
        }))
      }
    }

    // Return tracking response
    return new Response(
      JSON.stringify({
        success: true,
        vessel: {
          id: vesselId,
          location,
          status,
          heading,
          speed,
          lastUpdate: timestamp
        },
        alerts,
        nearbyVessels,
        distanceTraveled
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in fleet-tracking:', error)
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

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}