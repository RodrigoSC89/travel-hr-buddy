import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/**
 * AI Weather Analysis Function
 * Uses OpenAI to provide intelligent weather analysis and recommendations
 * for maritime operations
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIKey = Deno.env.get('OPENAI_API_KEY')
    
    if (!openAIKey) {
      throw new Error('OpenAI API key not configured')
    }

    const { weatherData, vesselType, operationType, asogLimits } = await req.json()

    if (!weatherData) {
      throw new Error('Weather data is required')
    }

    // Prepare context for AI analysis
    const weatherContext = `
Análise Meteorológica Marítima:

CONDIÇÕES ATUAIS:
- Vento: ${weatherData.current.windSpeed} nós, direção ${weatherData.current.windDirection}°
- Ondas: ${weatherData.current.waveHeight}m de altura, período ${weatherData.current.wavePeriod}s
- Visibilidade: ${weatherData.current.visibility} milhas náuticas
- Pressão atmosférica: ${weatherData.current.barometricPressure} hPa
- Temperatura do ar: ${weatherData.current.temperature}°C
- Temperatura do mar: ${weatherData.current.seaTemperature}°C
- Cobertura de nuvens: ${weatherData.current.cloudCover}%
- Taxa de precipitação: ${weatherData.current.precipitationRate} mm/h
${weatherData.current.swellHeight > 0 ? `- Swell: ${weatherData.current.swellHeight}m de altura` : ''}

TIPO DE EMBARCAÇÃO: ${vesselType || 'Não especificado'}
TIPO DE OPERAÇÃO: ${operationType || 'Navegação geral'}
${asogLimits ? `LIMITES ASOG: Vento máx ${asogLimits.maxWindSpeed} nós, Ondas máx ${asogLimits.maxWaveHeight}m` : ''}

Como especialista em meteorologia marítima e operações offshore, forneça:
1. Análise detalhada das condições atuais
2. Avaliação de riscos para a operação
3. Recomendações operacionais específicas
4. Previsão de tendências nas próximas 12-24 horas
5. Medidas de segurança recomendadas
`

    // Call OpenAI API
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em meteorologia marítima e operações offshore com ampla experiência em DP (Dynamic Positioning), ASOG (Activity Specific Operating Guidelines) e normas IMCA. Forneça análises precisas, profissionais e acionáveis em português brasileiro.'
          },
          {
            role: 'user',
            content: weatherContext
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      })
    })

    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.json()
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`)
    }

    const aiResult = await openAIResponse.json()
    const analysis = aiResult.choices[0]?.message?.content

    // Extract patterns and insights
    const patterns = extractWeatherPatterns(weatherData)
    
    // Calculate confidence score
    const confidence = calculateConfidence(weatherData)

    const result = {
      summary: analysis?.split('\n\n')[0] || 'Análise não disponível',
      riskAssessment: extractSection(analysis, 'riscos') || 'Avaliação de risco em processamento',
      recommendations: extractRecommendations(analysis) || [],
      patterns: patterns,
      confidence: confidence,
      generatedAt: new Date().toISOString(),
      fullAnalysis: analysis
    }

    return new Response(
      JSON.stringify({
        success: true,
        analysis: result,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error in AI weather analysis:', error)

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})

// Helper functions

function extractWeatherPatterns(weatherData: any): string[] {
  const patterns = []

  // Wind patterns
  if (weatherData.current.windSpeed > 25) {
    patterns.push('Ventos fortes persistentes - padrão de alta pressão ou sistema frontal')
  }

  // Wave patterns
  if (weatherData.current.waveHeight > 3) {
    patterns.push('Mar agitado - ondulação significativa presente')
  }

  // Pressure patterns
  if (weatherData.current.barometricPressure < 1010) {
    patterns.push('Pressão em queda - possível aproximação de sistema de baixa pressão')
  } else if (weatherData.current.barometricPressure > 1020) {
    patterns.push('Alta pressão - condições estáveis esperadas')
  }

  // Temperature patterns
  const tempDiff = Math.abs(weatherData.current.temperature - weatherData.current.seaTemperature)
  if (tempDiff > 5) {
    patterns.push('Diferença significativa entre temperatura do ar e do mar - possível instabilidade')
  }

  // Visibility patterns
  if (weatherData.current.visibility < 3) {
    patterns.push('Visibilidade reduzida - presença de neblina ou precipitação')
  }

  return patterns
}

function extractSection(text: string | undefined, keyword: string): string {
  if (!text) return ''
  
  const lines = text.split('\n')
  const startIdx = lines.findIndex(line => 
    line.toLowerCase().includes(keyword)
  )
  
  if (startIdx === -1) return ''
  
  const section = []
  for (let i = startIdx; i < lines.length && i < startIdx + 5; i++) {
    if (lines[i].trim()) {
      section.push(lines[i])
    }
  }
  
  return section.join('\n')
}

function extractRecommendations(text: string | undefined): string[] {
  if (!text) return []
  
  const recommendations = []
  const lines = text.split('\n')
  
  for (const line of lines) {
    const trimmed = line.trim()
    if (
      trimmed.startsWith('-') || 
      trimmed.startsWith('•') || 
      trimmed.match(/^\d+\./)
    ) {
      const rec = trimmed.replace(/^[-•]\s*/, '').replace(/^\d+\.\s*/, '')
      if (rec.length > 10) {
        recommendations.push(rec)
      }
    }
  }
  
  return recommendations.slice(0, 10) // Limit to top 10 recommendations
}

function calculateConfidence(weatherData: any): number {
  let confidence = 100

  // Reduce confidence for extreme conditions (harder to predict)
  if (weatherData.current.windSpeed > 40) confidence -= 15
  if (weatherData.current.waveHeight > 5) confidence -= 15
  if (weatherData.current.barometricPressure < 995) confidence -= 10
  if (weatherData.current.visibility < 2) confidence -= 10

  // Reduce confidence for rapidly changing conditions
  if (weatherData.current.precipitationRate > 10) confidence -= 10

  return Math.max(60, confidence)
}
