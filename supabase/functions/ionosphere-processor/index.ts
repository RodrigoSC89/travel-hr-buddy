// Terrastar Ionosphere Processor Edge Function
// Process and store ionospheric correction data
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import {
  createResponse,
  EdgeFunctionError,
  validateRequestBody,
  getEnvVar,
  log,
  handleCORS,
  safeJSONParse,
} from '../_shared/types.ts'

// Request/Response Types
interface ProcessIonosphereRequest {
  vessel_id: string
  latitude: number
  longitude: number
  altitude?: number
  request_correction: boolean
  subscribe_alerts?: boolean
}

interface ProcessIonosphereResponse {
  success: boolean
  ionosphere_data?: any
  correction?: any
  alert_subscription?: string
  errors: string[]
}

serve(async (req: Request): Promise<Response> => {
  const requestId = crypto.randomUUID()
  
  if (req.method === 'OPTIONS') {
    return handleCORS()
  }

  try {
    const body = safeJSONParse<ProcessIonosphereRequest>(await req.text())
    validateRequestBody(body as unknown as Record<string, unknown>, ['vessel_id', 'latitude', 'longitude'])

    const {
      vessel_id,
      latitude,
      longitude,
      altitude = 0,
      request_correction,
      subscribe_alerts = false,
    } = body

    const terrastarApiKey = getEnvVar('TERRASTAR_API_KEY')
    const terrastarApiUrl = getEnvVar('TERRASTAR_API_URL')
    const terrastarServiceLevel = Deno.env.get('TERRASTAR_SERVICE_LEVEL') || 'PREMIUM'
    const supabaseUrl = getEnvVar('SUPABASE_URL')
    const supabaseKey = getEnvVar('SUPABASE_SERVICE_ROLE_KEY')

    const supabase = createClient(supabaseUrl, supabaseKey)

    const errors: string[] = []
    let ionosphereData = null
    let correctionData = null
    let alertSubscriptionId = null

    log('info', 'Processing ionosphere request', {
      vessel_id,
      latitude,
      longitude,
      request_correction,
      subscribe_alerts,
      requestId,
    })

    // Fetch ionospheric data
    try {
      const ionoResponse = await fetch(`${terrastarApiUrl}/ionosphere/data`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${terrastarApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude,
          longitude,
          altitude,
          service_level: terrastarServiceLevel,
        }),
      })

      if (!ionoResponse.ok) {
        throw new Error(`Terrastar API returned ${ionoResponse.status}`)
      }

      const data = await ionoResponse.json()
      ionosphereData = data

      // Store ionosphere data
      const { error: ionoError } = await supabase
        .from('terrastar_ionosphere_data')
        .insert({
          vessel_id,
          timestamp: data.timestamp,
          position_lat: data.position.latitude,
          position_lon: data.position.longitude,
          vtec: data.ionosphere.vtec,
          stec: data.ionosphere.stec,
          ionospheric_delay: data.ionosphere.delay_ms,
          correction_type: data.correction.type,
          quality_indicator: data.quality.indicator,
          satellite_count: data.quality.satellite_count,
        })

      if (ionoError) {
        errors.push(`Failed to store ionosphere data: ${ionoError.message}`)
      }

      log('info', 'Ionosphere data fetched', {
        vtec: data.ionosphere.vtec,
        quality: data.quality.indicator,
        requestId,
      })
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      errors.push(`Ionosphere data fetch failed: ${errorMsg}`)
      log('error', 'Ionosphere data error', { error: errorMsg, requestId })
    }

    // Request position correction if needed
    if (request_correction) {
      try {
        const correctionResponse = await fetch(`${terrastarApiUrl}/corrections/position`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${terrastarApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            latitude,
            longitude,
            altitude,
            service_level: terrastarServiceLevel,
            request_time: new Date().toISOString(),
          }),
        })

        if (!correctionResponse.ok) {
          throw new Error(`Terrastar API returned ${correctionResponse.status}`)
        }

        const data = await correctionResponse.json()
        correctionData = data

        // Store correction
        const { error: correctionError } = await supabase
          .from('terrastar_corrections')
          .insert({
            vessel_id,
            position_lat: data.corrected_position.latitude,
            position_lon: data.corrected_position.longitude,
            timestamp: data.timestamp,
            vtec_correction: data.corrections.vtec,
            horizontal_accuracy: data.accuracy.horizontal,
            vertical_accuracy: data.accuracy.vertical,
            correction_age: data.correction_age_seconds,
            service_level: terrastarServiceLevel,
            signal_quality: data.signal_quality,
          })

        if (correctionError) {
          errors.push(`Failed to store correction: ${correctionError.message}`)
        }

        log('info', 'Position correction received', {
          accuracy: data.accuracy.horizontal,
          correction_age: data.correction_age_seconds,
          requestId,
        })
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        errors.push(`Position correction failed: ${errorMsg}`)
        log('error', 'Correction error', { error: errorMsg, requestId })
      }
    }

    // Subscribe to alerts if requested
    if (subscribe_alerts) {
      try {
        // Create bounding box around vessel (±2 degrees)
        const boundingBox = {
          lat_min: latitude - 2,
          lat_max: latitude + 2,
          lon_min: longitude - 2,
          lon_max: longitude + 2,
        }

        const alertResponse = await fetch(`${terrastarApiUrl}/alerts/subscribe`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${terrastarApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            vessel_id,
            area: boundingBox,
            alert_types: ['IONOSPHERIC_STORM', 'SIGNAL_DEGRADATION', 'CORRECTION_UNAVAILABLE'],
          }),
        })

        if (!alertResponse.ok) {
          throw new Error(`Terrastar API returned ${alertResponse.status}`)
        }

        const data = await alertResponse.json()
        alertSubscriptionId = data.subscription_id

        // Store subscription
        const { error: subError } = await supabase
          .from('terrastar_alert_subscriptions')
          .upsert({
            vessel_id,
            subscription_id: data.subscription_id,
            bounding_box: boundingBox,
            created_at: new Date().toISOString(),
          })

        if (subError) {
          errors.push(`Failed to store subscription: ${subError.message}`)
        }

        log('info', 'Alert subscription created', {
          subscription_id: data.subscription_id,
          requestId,
        })
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        errors.push(`Alert subscription failed: ${errorMsg}`)
        log('error', 'Alert subscription error', { error: errorMsg, requestId })
      }
    }

    const response: ProcessIonosphereResponse = {
      success: errors.length === 0,
      ionosphere_data: ionosphereData,
      correction: correctionData,
      alert_subscription: alertSubscriptionId,
      errors,
    }

    log('info', 'Ionosphere processing completed', {
      success: response.success,
      error_count: errors.length,
      requestId,
    })

    return createResponse(response, undefined, requestId)

  } catch (error) {
    log('error', 'Error in ionosphere processor', {
      error: error instanceof Error ? error.message : String(error),
      requestId,
    })

    if (error instanceof EdgeFunctionError) {
      return createResponse(undefined, error, requestId)
    }

    return createResponse(
      undefined,
      new EdgeFunctionError(
        'INTERNAL_ERROR',
        error instanceof Error ? error.message : 'An unexpected error occurred',
        500,
        { originalError: String(error) }
      ),
      requestId
    )
  }
})
