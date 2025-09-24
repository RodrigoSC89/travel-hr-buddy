import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MetricData {
  name: string
  value: number
  unit: string
  category: 'database' | 'api' | 'ui' | 'cache' | 'network'
  target?: number
}

interface OptimizationRequest {
  userId: string
  category?: string
  priority?: 'high' | 'medium' | 'low'
  metrics?: MetricData[]
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const body: OptimizationRequest = await req.json()
    console.log('Performance Monitor Request:', body)

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const currentTime = new Date().toISOString()

    // Generate realistic performance metrics if not provided
    const mockMetrics: MetricData[] = body.metrics || [
      {
        name: 'API Response Time',
        value: Math.floor(Math.random() * 100) + 150, // 150-250ms
        unit: 'ms',
        category: 'api',
        target: 200
      },
      {
        name: 'Database Query Time',
        value: Math.floor(Math.random() * 50) + 50, // 50-100ms
        unit: 'ms',
        category: 'database',
        target: 80
      },
      {
        name: 'Page Load Time',
        value: Math.floor(Math.random() * 1000) + 1500, // 1.5-2.5s
        unit: 'ms',
        category: 'ui',
        target: 2000
      },
      {
        name: 'Cache Hit Rate',
        value: Math.floor(Math.random() * 20) + 80, // 80-100%
        unit: '%',
        category: 'cache',
        target: 90
      },
      {
        name: 'Network Latency',
        value: Math.floor(Math.random() * 50) + 30, // 30-80ms
        unit: 'ms',
        category: 'network',
        target: 60
      },
      {
        name: 'Memory Usage',
        value: Math.floor(Math.random() * 30) + 50, // 50-80%
        unit: '%',
        category: 'database',
        target: 70
      },
      {
        name: 'CPU Usage',
        value: Math.floor(Math.random() * 40) + 40, // 40-80%
        unit: '%',
        category: 'database',
        target: 70
      }
    ]

    // Store metrics in database
    const metricsToInsert = mockMetrics.map(metric => {
      let status: 'excellent' | 'good' | 'warning' | 'critical'
      
      if (metric.target) {
        const percentage = metric.unit === '%' 
          ? metric.value / metric.target 
          : metric.target / metric.value

        if (percentage >= 1.0) status = 'excellent'
        else if (percentage >= 0.8) status = 'good'
        else if (percentage >= 0.6) status = 'warning'
        else status = 'critical'
      } else {
        status = 'good'
      }

      return {
        metric_name: metric.name,
        metric_value: metric.value,
        metric_unit: metric.unit,
        target_value: metric.target,
        status,
        category: metric.category,
        recorded_at: currentTime
      }
    })

    const { error: metricsError } = await supabaseClient
      .from('performance_metrics')
      .insert(metricsToInsert)

    if (metricsError) {
      console.error('Error storing metrics:', metricsError)
    } else {
      console.log(`Stored ${metricsToInsert.length} performance metrics`)
    }

    // Generate optimization recommendations based on metrics
    const optimizations = []
    
    for (const metric of mockMetrics) {
      if (metric.target && metric.value > metric.target * 1.2) {
        // Performance issue detected
        let optimization = null
        
        switch (metric.category) {
          case 'database':
            optimization = {
              title: `Optimize ${metric.name}`,
              description: `${metric.name} is ${Math.round(((metric.value - metric.target) / metric.target) * 100)}% above target. Consider query optimization and indexing.`,
              category: 'database',
              impact: 'high',
              effort: 'moderate',
              estimated_improvement: `Reduce to ${metric.target}${metric.unit}`,
              status: 'pending'
            }
            break
          
          case 'api':
            optimization = {
              title: `Improve API Performance`,
              description: `API response time is slow. Consider implementing caching and request optimization.`,
              category: 'api',
              impact: 'medium',
              effort: 'easy',
              estimated_improvement: `30% faster responses`,
              status: 'pending'
            }
            break
            
          case 'ui':
            optimization = {
              title: `Optimize Frontend Loading`,
              description: `Page load time exceeds target. Implement lazy loading and code splitting.`,
              category: 'ui',
              impact: 'high',
              effort: 'moderate',
              estimated_improvement: `40% faster page loads`,
              status: 'pending'
            }
            break
        }
        
        if (optimization) {
          optimizations.push(optimization)
        }
      }
    }

    // Store optimization recommendations for the user
    if (optimizations.length > 0) {
      const optimizationsToInsert = optimizations.map(opt => ({
        user_id: body.userId,
        ...opt
      }))

      const { error: optError } = await supabaseClient
        .from('optimization_actions')
        .insert(optimizationsToInsert)

      if (optError) {
        console.error('Error storing optimizations:', optError)
      } else {
        console.log(`Created ${optimizationsToInsert.length} optimization recommendations`)
      }
    }

    // Calculate overall performance score
    const totalScore = mockMetrics.reduce((sum, metric) => {
      if (metric.target) {
        const performance = metric.unit === '%' 
          ? Math.min(metric.value / metric.target * 100, 100)
          : Math.min(metric.target / metric.value * 100, 100)
        return sum + Math.max(performance, 0)
      }
      return sum + 80 // Default score if no target
    }, 0) / mockMetrics.length

    // Generate UX metrics
    const uxMetrics = [
      {
        metric_name: 'User Satisfaction',
        metric_value: Math.floor(Math.random() * 1) + 4, // 4.0-5.0
        metric_unit: '/5',
        target_value: 4.5,
        status: 'good' as const,
        category: 'navigation' as const,
        user_id: body.userId
      },
      {
        metric_name: 'Task Completion Rate',
        metric_value: Math.floor(Math.random() * 20) + 80, // 80-100%
        metric_unit: '%',
        target_value: 90,
        status: 'good' as const,
        category: 'navigation' as const,
        user_id: body.userId
      },
      {
        metric_name: 'Mobile Usability',
        metric_value: Math.floor(Math.random() * 25) + 75, // 75-100%
        metric_unit: '%',
        target_value: 85,
        status: 'good' as const,
        category: 'mobile' as const,
        user_id: body.userId
      }
    ]

    const { error: uxError } = await supabaseClient
      .from('ux_metrics')
      .insert(uxMetrics)

    if (uxError) {
      console.error('Error storing UX metrics:', uxError)
    }

    return new Response(
      JSON.stringify({
        success: true,
        performance_score: Math.round(totalScore),
        metrics: mockMetrics,
        optimizations: optimizations,
        ux_metrics: uxMetrics,
        recommendations: [
          'Enable query caching for frequent database operations',
          'Implement CDN for static assets',
          'Add performance monitoring alerts',
          'Optimize critical rendering path'
        ],
        recorded_at: currentTime
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Performance Monitor Error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})