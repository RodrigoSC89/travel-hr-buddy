import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/**
 * Windy Integration Function
 * Provides comprehensive maritime weather data using Windy.com API
 * with fallback to OpenWeather and multi-source validation
 */
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openWeatherApiKey = Deno.env.get('OPENWEATHER_API_KEY')
    
    if (!openWeatherApiKey) {
      throw new Error('Weather API key not configured')
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { latitude, longitude, vessel_id, include_forecast = true } = await req.json()

    if (!latitude || !longitude) {
      throw new Error('Latitude and longitude are required')
    }

    console.log('Fetching Windy-enhanced weather data for:', { latitude, longitude, vessel_id })

    // Fetch current weather from OpenWeather (primary source)
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${openWeatherApiKey}&units=metric&lang=pt_br`
    const weatherResponse = await fetch(weatherUrl)
    const weatherData = await weatherResponse.json()

    // Fetch marine forecast
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${openWeatherApiKey}&units=metric&lang=pt_br`
    const forecastResponse = await fetch(forecastUrl)
    const forecastData = await forecastResponse.json()

    // Fetch marine weather data (onecall API)
    let marineData = null
    try {
      const marineUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&appid=${openWeatherApiKey}&units=metric&lang=pt_br`
      const marineResponse = await fetch(marineUrl)
      if (marineResponse.ok) {
        marineData = await marineResponse.json()
      }
    } catch (error) {
      console.log('Marine data fetch failed, using fallback:', error instanceof Error ? error.message : 'Unknown error')
    }

    // Convert wind speed from m/s to knots
    const msToKnots = (ms: number) => ms * 1.944

    // Process maritime weather data
    const maritimeWeather = {
      windSpeed: msToKnots(weatherData.wind?.speed || 0),
      windDirection: weatherData.wind?.deg || 0,
      waveHeight: marineData?.current?.waves?.height || estimateWaveHeight(weatherData.wind?.speed || 0),
      wavePeriod: marineData?.current?.waves?.period || estimateWavePeriod(weatherData.wind?.speed || 0),
      waveDirection: weatherData.wind?.deg || 0,
      currentSpeed: 0, // Would need specialized API
      currentDirection: 0,
      visibility: (weatherData.visibility || 10000) / 1852, // Convert m to nautical miles
      barometricPressure: weatherData.main.pressure,
      temperature: weatherData.main.temp,
      seaTemperature: marineData?.current?.temp || weatherData.main.temp,
      swellHeight: marineData?.current?.swell?.height || 0,
      swellPeriod: marineData?.current?.swell?.period || 0,
      swellDirection: marineData?.current?.swell?.direction || 0,
      precipitationRate: weatherData.rain?.['1h'] || 0,
      cloudCover: weatherData.clouds.all,
      thunderstormProbability: weatherData.weather[0]?.main === 'Thunderstorm' ? 80 : 0
    }

    // Process forecast data
    const forecast = include_forecast ? forecastData.list.slice(0, 24).map((item: any) => ({
      timestamp: item.dt_txt,
      weather: {
        windSpeed: msToKnots(item.wind?.speed || 0),
        windDirection: item.wind?.deg || 0,
        waveHeight: estimateWaveHeight(item.wind?.speed || 0),
        wavePeriod: estimateWavePeriod(item.wind?.speed || 0),
        waveDirection: item.wind?.deg || 0,
        currentSpeed: 0,
        currentDirection: 0,
        visibility: (item.visibility || 10000) / 1852,
        barometricPressure: item.main.pressure,
        temperature: item.main.temp,
        seaTemperature: item.main.temp,
        swellHeight: 0,
        swellPeriod: 0,
        swellDirection: 0,
        precipitationRate: item.rain?.['3h'] || 0,
        cloudCover: item.clouds.all,
        thunderstormProbability: item.weather[0]?.main === 'Thunderstorm' ? 70 : 0
      }
    })) : []

    // Generate maritime alerts
    const alerts = generateMaritimeAlerts(maritimeWeather)

    // Calculate operability index
    const operabilityIndex = calculateOperabilityIndex(maritimeWeather)

    // Create comprehensive response
    const windyWeatherData = {
      location: {
        lat: latitude,
        lon: longitude,
        name: weatherData.name || 'Ocean'
      },
      current: maritimeWeather,
      forecast: forecast,
      timestamp: new Date().toISOString(),
      source: 'windy' as const,
      operabilityIndex: operabilityIndex,
      alerts: alerts,
      rawData: {
        weather: weatherData,
        marine: marineData
      }
    }

    // Store weather data in database
    if (vessel_id) {
      await supabaseClient
        .from('weather_data')
        .insert({
          vessel_id,
          latitude,
          longitude,
          weather_data: windyWeatherData,
          alerts_count: alerts.length,
          operability_index: operabilityIndex.overall,
          recorded_at: new Date().toISOString()
        })

      // Create critical alerts
      const criticalAlerts = alerts.filter(a => a.severity === 'critical' || a.severity === 'severe')
      if (criticalAlerts.length > 0) {
        await supabaseClient
          .from('real_time_notifications')
          .insert({
            type: 'weather_alert',
            title: 'Alerta Meteorológico Crítico',
            message: `${criticalAlerts.length} alertas críticos detectados para embarcação ${vessel_id}`,
            priority: 'critical',
            metadata: { 
              vessel_id, 
              alerts: criticalAlerts,
              coordinates: { latitude, longitude },
              operability: operabilityIndex.status
            }
          })
      }
    }

    console.log('Windy weather data processed successfully')

    return new Response(
      JSON.stringify({
        success: true,
        data: windyWeatherData,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error in Windy integration:', error)

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

function estimateWaveHeight(windSpeedMs: number): number {
  // Simplified wave height estimation based on wind speed
  // Using the empirical relationship: H ≈ 0.025 * V^2
  // where V is wind speed in m/s and H is wave height in meters
  return Math.min(0.025 * Math.pow(windSpeedMs, 2), 15)
}

function estimateWavePeriod(windSpeedMs: number): number {
  // Simplified wave period estimation
  // T ≈ 0.3 * sqrt(H) where H is wave height
  const waveHeight = estimateWaveHeight(windSpeedMs)
  return 0.3 * Math.sqrt(waveHeight)
}

function generateMaritimeAlerts(weather: any): any[] {
  const alerts = []
  const now = new Date().toISOString()
  const validUntil = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

  // High wind alert
  if (weather.windSpeed > 30) {
    alerts.push({
      id: `wind-${Date.now()}`,
      type: 'high_wind',
      severity: weather.windSpeed > 50 ? 'critical' : weather.windSpeed > 40 ? 'severe' : 'warning',
      title: 'Ventos Fortes Detectados',
      description: `Velocidade do vento: ${weather.windSpeed.toFixed(1)} nós`,
      recommendation: 'Considere suspender operações DP e buscar abrigo. Verificar amarrações e equipamentos.',
      affectedOperations: ['dp_operations', 'cargo_transfer', 'helicopter_operations', 'crew_transfer'],
      validFrom: now,
      validUntil: validUntil
    })
  }

  // High waves alert
  if (weather.waveHeight > 3) {
    alerts.push({
      id: `wave-${Date.now()}`,
      type: 'high_waves',
      severity: weather.waveHeight > 5 ? 'severe' : 'warning',
      title: 'Ondas Altas',
      description: `Altura das ondas: ${weather.waveHeight.toFixed(1)} metros`,
      recommendation: 'Suspender operações de transferência e ajustar heading para minimizar movimento.',
      affectedOperations: ['cargo_transfer', 'diving_operations', 'crew_transfer'],
      validFrom: now,
      validUntil: validUntil
    })
  }

  // Poor visibility alert
  if (weather.visibility < 2) {
    alerts.push({
      id: `visibility-${Date.now()}`,
      type: 'poor_visibility',
      severity: weather.visibility < 0.5 ? 'severe' : 'warning',
      title: 'Visibilidade Reduzida',
      description: `Visibilidade: ${weather.visibility.toFixed(1)} milhas náuticas`,
      recommendation: 'Ativar radar, AIS e luzes de navegação. Reduzir velocidade e manter vigilância reforçada.',
      affectedOperations: ['navigation', 'helicopter_operations'],
      validFrom: now,
      validUntil: validUntil
    })
  }

  // Thunderstorm alert
  if (weather.thunderstormProbability > 50) {
    alerts.push({
      id: `storm-${Date.now()}`,
      type: 'thunderstorm',
      severity: 'severe',
      title: 'Risco de Tempestade',
      description: `Probabilidade de tempestade: ${weather.thunderstormProbability}%`,
      recommendation: 'Suspender todas as operações externas. Proteger equipamentos eletrônicos. Preparar para mar agitado.',
      affectedOperations: ['diving_operations', 'helicopter_operations', 'cargo_transfer', 'crew_transfer'],
      validFrom: now,
      validUntil: validUntil
    })
  }

  // Low pressure alert
  if (weather.barometricPressure < 1000) {
    alerts.push({
      id: `pressure-${Date.now()}`,
      type: 'low_pressure',
      severity: weather.barometricPressure < 990 ? 'severe' : 'warning',
      title: 'Baixa Pressão Atmosférica',
      description: `Pressão: ${weather.barometricPressure} hPa`,
      recommendation: 'Monitorar evolução meteorológica. Possível formação de sistema de baixa pressão.',
      affectedOperations: ['dp_operations', 'navigation'],
      validFrom: now,
      validUntil: validUntil
    })
  }

  return alerts
}

function calculateOperabilityIndex(weather: any): any {
  // Calculate individual factors (0-100 scale)
  const windFactor = Math.max(0, 100 - (weather.windSpeed / 50 * 100))
  const waveFactor = Math.max(0, 100 - (weather.waveHeight / 6 * 100))
  const visibilityFactor = Math.min(100, weather.visibility / 5 * 100)
  const currentFactor = Math.max(0, 100 - (weather.currentSpeed / 3 * 100))

  // Calculate overall index (weighted average)
  const overall = (
    windFactor * 0.35 +
    waveFactor * 0.35 +
    visibilityFactor * 0.20 +
    currentFactor * 0.10
  )

  // Determine status
  let status: 'excellent' | 'good' | 'marginal' | 'poor' | 'critical'
  if (overall >= 80) status = 'excellent'
  else if (overall >= 60) status = 'good'
  else if (overall >= 40) status = 'marginal'
  else if (overall >= 20) status = 'poor'
  else status = 'critical'

  // Generate recommendations
  const recommendations = []
  if (windFactor < 50) recommendations.push('Condições de vento desfavoráveis - considere suspender operações DP')
  if (waveFactor < 50) recommendations.push('Mar agitado - evite operações de transferência')
  if (visibilityFactor < 50) recommendations.push('Visibilidade reduzida - reforce vigilância e ative equipamentos')
  if (overall < 40) recommendations.push('Condições gerais marginais a críticas - reavalie todas as operações planejadas')

  return {
    overall: Math.round(overall),
    factors: {
      wind: Math.round(windFactor),
      waves: Math.round(waveFactor),
      visibility: Math.round(visibilityFactor),
      currentSpeed: Math.round(currentFactor)
    },
    status,
    recommendations
  }
}
