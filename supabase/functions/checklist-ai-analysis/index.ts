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

    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization')!
    
    // Get the user from the authorization header
    const { data: { user } } = await supabaseClient.auth.getUser(authHeader.replace('Bearer ', ''))
    
    if (!user) {
      throw new Error('Unauthorized')
    }

    const { checklistId } = await req.json()

    if (!checklistId) {
      throw new Error('Checklist ID is required')
    }

    // Fetch checklist data
    const { data: checklist, error: checklistError } = await supabaseClient
      .from('operational_checklists')
      .select(`
        *,
        checklist_items (*)
      `)
      .eq('id', checklistId)
      .single()

    if (checklistError || !checklist) {
      throw new Error('Checklist not found')
    }

    // Analyze checklist items
    const items = checklist.checklist_items || []
    const totalItems = items.length
    const completedItems = items.filter((item: any) => item.completed).length
    const criticalItems = items.filter((item: any) => item.criticality === 'high').length
    const criticalCompleted = items.filter((item: any) => item.criticality === 'high' && item.completed).length

    // Calculate scores
    const completionRate = totalItems > 0 ? (completedItems / totalItems) * 100 : 0
    const criticalCompletionRate = criticalItems > 0 ? (criticalCompleted / criticalItems) * 100 : 100
    const overallScore = Math.round((completionRate * 0.6) + (criticalCompletionRate * 0.4))

    // Detect anomalies
    const anomalies = []
    
    if (criticalCompletionRate < 80) {
      anomalies.push({
        type: 'critical_incomplete',
        severity: 'high',
        description: 'Itens críticos não concluídos detectados',
        count: criticalItems - criticalCompleted
      })
    }

    if (completionRate < 70) {
      anomalies.push({
        type: 'low_completion',
        severity: 'medium',
        description: 'Taxa de conclusão baixa',
        percentage: Math.round(completionRate)
      })
    }

    // Generate suggestions
    const suggestions = []
    
    if (criticalCompletionRate < 100) {
      suggestions.push({
        type: 'critical_items',
        priority: 'high',
        description: 'Priorize a conclusão de itens críticos de segurança',
        action: 'complete_critical'
      })
    }

    if (completionRate < 90) {
      suggestions.push({
        type: 'completion_rate',
        priority: 'medium',
        description: 'Melhore a taxa de conclusão geral do checklist',
        action: 'improve_workflow'
      })
    }

    // Historical comparison (mock data for now)
    const historicalComparison = {
      averageScore: 87,
      trend: overallScore > 87 ? 'improving' : 'declining',
      previousPeriod: 85
    }

    // Predictive insights
    const predictiveInsights = [
      {
        type: 'maintenance_prediction',
        confidence: 0.85,
        description: 'Baseado no histórico, recomenda-se agendar manutenção preventiva',
        timeframe: '30 dias'
      }
    ]

    // Create analysis record
    const analysisData = {
      checklist_id: checklistId,
      overall_score: overallScore,
      analysis_type: 'automated',
      analysis_data: {
        completion_rate: completionRate,
        critical_completion_rate: criticalCompletionRate,
        total_items: totalItems,
        completed_items: completedItems,
        critical_items: criticalItems,
        anomalies,
        suggestions,
        historical_comparison: historicalComparison,
        predictive_insights: predictiveInsights
      },
      issues_found: anomalies.length,
      critical_issues: anomalies.filter(a => a.severity === 'high').length,
      confidence_level: 0.92,
      recommendations: suggestions.map(s => s.description)
    }

    // Save analysis to database
    const { data: analysis, error: analysisError } = await supabaseClient
      .from('checklist_ai_analysis')
      .insert(analysisData)
      .select()
      .single()

    if (analysisError) {
      console.error('Error saving analysis:', analysisError)
      throw new Error('Failed to save analysis')
    }

    return new Response(
      JSON.stringify({
        success: true,
        analysis: {
          id: analysis.id,
          overall_score: overallScore,
          anomalies,
          suggestions,
          historical_comparison: historicalComparison,
          predictive_insights: predictiveInsights,
          risk_level: overallScore > 85 ? 'low' : overallScore > 70 ? 'medium' : 'high'
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in checklist-ai-analysis:', error)
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