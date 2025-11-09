// StarFix Sync Edge Function
// Automatic synchronization with StarFix API
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
interface SyncStarFixRequest {
  vessel_id?: string
  imo_number?: string
  sync_type: 'inspections' | 'performance' | 'full'
  auto_submit?: boolean
}

interface SyncStarFixResponse {
  success: boolean
  synced_inspections: number
  synced_metrics: boolean
  submitted_inspections: number
  errors: string[]
}

serve(async (req: Request): Promise<Response> => {
  const requestId = crypto.randomUUID()
  
  if (req.method === 'OPTIONS') {
    return handleCORS()
  }

  try {
    const body = safeJSONParse<SyncStarFixRequest>(await req.text())
    validateRequestBody(body as unknown as Record<string, unknown>, ['sync_type'])

    const { vessel_id, imo_number, sync_type, auto_submit = false } = body

    if (!vessel_id && !imo_number) {
      throw new EdgeFunctionError(
        'MISSING_PARAMETER',
        'Either vessel_id or imo_number is required',
        400
      )
    }

    const starfixApiKey = getEnvVar('STARFIX_API_KEY')
    const starfixApiUrl = getEnvVar('STARFIX_API_URL')
    const starfixOrgId = getEnvVar('STARFIX_ORG_ID')
    const supabaseUrl = getEnvVar('SUPABASE_URL')
    const supabaseKey = getEnvVar('SUPABASE_SERVICE_ROLE_KEY')

    const supabase = createClient(supabaseUrl, supabaseKey)

    let syncedInspections = 0
    let syncedMetrics = false
    let submittedInspections = 0
    const errors: string[] = []

    // Get IMO number if vessel_id provided
    let targetImo = imo_number
    if (vessel_id && !imo_number) {
      const { data: vessel } = await supabase
        .from('vessels')
        .select('imo_number')
        .eq('id', vessel_id)
        .single()
      
      if (vessel) {
        targetImo = vessel.imo_number
      }
    }

    if (!targetImo) {
      throw new EdgeFunctionError(
        'VESSEL_NOT_FOUND',
        'Could not determine IMO number for vessel',
        404
      )
    }

    log('info', 'Starting StarFix sync', { 
      imo_number: targetImo, 
      sync_type,
      requestId 
    })

    // Sync inspections
    if (sync_type === 'inspections' || sync_type === 'full') {
      try {
        const response = await fetch(`${starfixApiUrl}/inspections/vessel/${targetImo}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${starfixApiKey}`,
            'X-Organization-ID': starfixOrgId,
          },
        })

        if (!response.ok) {
          throw new Error(`StarFix API returned ${response.status}`)
        }

        const data = await response.json()
        const inspections = data.inspections || []

        // Store inspections in database
        for (const inspection of inspections) {
          const { error } = await supabase
            .from('starfix_inspections')
            .upsert({
              vessel_id: vessel_id || targetImo,
              imo_number: targetImo,
              inspection_date: inspection.date,
              port_name: inspection.port.name,
              port_country: inspection.port.country,
              inspection_type: inspection.type,
              authority: inspection.authority,
              deficiencies_count: inspection.deficiencies?.length || 0,
              detentions: inspection.detention ? 1 : 0,
              inspection_result: inspection.detention ? 'DETENTION' : 
                                 inspection.deficiencies?.length > 0 ? 'DEFICIENCY' : 'CLEAR',
              deficiencies: inspection.deficiencies || [],
              starfix_sync_status: 'synced',
              last_sync_date: new Date().toISOString(),
            })

          if (error) {
            errors.push(`Failed to store inspection: ${error.message}`)
          } else {
            syncedInspections++
          }
        }

        log('info', 'Inspections synced', { count: syncedInspections, requestId })
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        errors.push(`Inspection sync failed: ${errorMsg}`)
        log('error', 'Inspection sync error', { error: errorMsg, requestId })
      }
    }

    // Sync performance metrics
    if (sync_type === 'performance' || sync_type === 'full') {
      try {
        const response = await fetch(`${starfixApiUrl}/performance/vessel/${targetImo}?period_months=12`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${starfixApiKey}`,
            'X-Organization-ID': starfixOrgId,
          },
        })

        if (!response.ok) {
          throw new Error(`StarFix API returned ${response.status}`)
        }

        const data = await response.json()

        const { error } = await supabase
          .from('starfix_performance_metrics')
          .upsert({
            vessel_id: vessel_id || targetImo,
            imo_number: targetImo,
            period_start: data.period.start,
            period_end: data.period.end,
            total_inspections: data.metrics.total_inspections,
            detentions_count: data.metrics.detentions,
            deficiencies_count: data.metrics.deficiencies,
            nil_deficiency_rate: data.metrics.nil_deficiency_rate,
            detention_rate: data.metrics.detention_rate,
            performance_score: data.metrics.performance_score,
            risk_level: calculateRiskLevel(data.metrics.performance_score),
            flag_state_average_score: data.benchmarks.flag_state_average,
            comparison_to_fleet: data.benchmarks.fleet_percentile,
          })

        if (error) {
          errors.push(`Failed to store metrics: ${error.message}`)
        } else {
          syncedMetrics = true
        }

        log('info', 'Performance metrics synced', { requestId })
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        errors.push(`Performance sync failed: ${errorMsg}`)
        log('error', 'Performance sync error', { error: errorMsg, requestId })
      }
    }

    // Auto-submit pending inspections if requested
    if (auto_submit) {
      try {
        const { data: pendingInspections } = await supabase
          .from('starfix_inspections')
          .select('*')
          .eq('vessel_id', vessel_id || targetImo)
          .eq('starfix_sync_status', 'pending')

        if (pendingInspections && pendingInspections.length > 0) {
          for (const inspection of pendingInspections) {
            try {
              const submitResponse = await fetch(`${starfixApiUrl}/inspections/submit`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${starfixApiKey}`,
                  'Content-Type': 'application/json',
                  'X-Organization-ID': starfixOrgId,
                },
                body: JSON.stringify({
                  imo_number: targetImo,
                  inspection_date: inspection.inspection_date,
                  port_name: inspection.port_name,
                  port_country: inspection.port_country,
                  inspection_type: inspection.inspection_type,
                  authority: inspection.authority,
                  deficiencies: inspection.deficiencies,
                  detention: inspection.detentions > 0,
                }),
              })

              if (submitResponse.ok) {
                await supabase
                  .from('starfix_inspections')
                  .update({
                    starfix_sync_status: 'synced',
                    last_sync_date: new Date().toISOString(),
                  })
                  .eq('id', inspection.id)

                submittedInspections++
              } else {
                errors.push(`Failed to submit inspection ${inspection.id}`)
              }
            } catch (error) {
              errors.push(`Error submitting inspection: ${error instanceof Error ? error.message : 'Unknown'}`)
            }
          }

          log('info', 'Pending inspections submitted', { count: submittedInspections, requestId })
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        errors.push(`Auto-submit failed: ${errorMsg}`)
        log('error', 'Auto-submit error', { error: errorMsg, requestId })
      }
    }

    const response: SyncStarFixResponse = {
      success: errors.length === 0,
      synced_inspections: syncedInspections,
      synced_metrics: syncedMetrics,
      submitted_inspections: submittedInspections,
      errors,
    }

    log('info', 'StarFix sync completed', { 
      ...response,
      requestId 
    })

    return createResponse(response, undefined, requestId)

  } catch (error) {
    log('error', 'Error in StarFix sync', { 
      error: error instanceof Error ? error.message : String(error),
      requestId
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

function calculateRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
  if (score >= 85) return 'low'
  if (score >= 70) return 'medium'
  if (score >= 50) return 'high'
  return 'critical'
}
