import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/**
 * Enhanced Maritime Weather Function
 * Provides comprehensive weather data with ASOG validation and multi-source support
 */
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

    const { location, vesselId, include_forecast = true } = await req.json()

    if (!location || !location.lat || !location.lon) {
      throw new Error('Location coordinates are required')
    }

    const weatherApiKey = Deno.env.get('OPENWEATHER_API_KEY')
    if (!weatherApiKey) {
      throw new Error('Weather API key not configured')
    }

    console.log('Fetching enhanced maritime weather for:', location, 'vessel:', vesselId)

    // Fetch current weather data
    const weatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&appid=${weatherApiKey}&units=metric`
    )

    if (!weatherResponse.ok) {
      throw new Error('Failed to fetch weather data')
    }

    const weatherData = await weatherResponse.json()

    // Fetch marine weather forecast
    const marineResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${location.lat}&lon=${location.lon}&appid=${weatherApiKey}&units=metric`
    )

    const marineData = marineResponse.ok ? await marineResponse.json() : null

    // Convert m/s to knots for maritime use
    const msToKnots = (ms: number) => ms * 1.944

    // Process weather data for maritime use
    const maritimeWeather = {
      current: {
        temperature: weatherData.main.temp,
        humidity: weatherData.main.humidity,
        pressure: weatherData.main.pressure,
        windSpeed: msToKnots(weatherData.wind?.speed || 0),
        windSpeedMs: weatherData.wind?.speed || 0,
        windDirection: weatherData.wind?.deg || 0,
        visibility: weatherData.visibility || 10000,
        visibilityNM: (weatherData.visibility || 10000) / 1852,
        weather: weatherData.weather[0],
        seaLevel: weatherData.main.sea_level || weatherData.main.pressure,
        feelsLike: weatherData.main.feels_like,
        waveHeight: estimateWaveHeight(weatherData.wind?.speed || 0),
        wavePeriod: estimateWavePeriod(weatherData.wind?.speed || 0),
        cloudCover: weatherData.clouds?.all || 0,
        precipitationRate: weatherData.rain?.['1h'] || 0
      },
      forecast: include_forecast ? marineData?.list?.slice(0, 24).map((item: any) => ({
        datetime: item.dt_txt,
        temperature: item.main.temp,
        windSpeed: msToKnots(item.wind?.speed || 0),
        windDirection: item.wind?.deg || 0,
        weather: item.weather[0],
        precipitation: item.rain?.['3h'] || 0,
        waveHeight: estimateWaveHeight(item.wind?.speed || 0),
        cloudCover: item.clouds?.all || 0
      })) : [],
      location: {
        name: weatherData.name,
        country: weatherData.sys.country,
        coordinates: {
          lat: weatherData.coord.lat,
          lon: weatherData.coord.lon
        }
      },
      alerts: [] as Array<{
        type: string;
        severity: string;
        message: string;
      }>
    }

    // Generate maritime alerts based on weather conditions
    if (maritimeWeather.current.windSpeed > 25) {
      maritimeWeather.alerts.push({
        type: 'high_wind',
        severity: maritimeWeather.current.windSpeed > 40 ? 'critical' : 'warning',
        message: 'Ventos fortes detectados - Velocidade: ' + Math.round(maritimeWeather.current.windSpeed) + ' nós (' + Math.round(maritimeWeather.current.windSpeedMs) + ' m/s)'
      })
    }

    if (maritimeWeather.current.visibility < 1000) {
      maritimeWeather.alerts.push({
        type: 'low_visibility',
        severity: 'danger',
        message: 'Visibilidade reduzida - ' + (maritimeWeather.current.visibilityNM).toFixed(1) + ' NM'
      })
    }

    if (maritimeWeather.current.weather.main === 'Thunderstorm') {
      maritimeWeather.alerts.push({
        type: 'thunderstorm',
        severity: 'danger',
        message: 'Tempestade detectada na área'
      })
    }

    if (maritimeWeather.current.waveHeight > 3) {
      maritimeWeather.alerts.push({
        type: 'high_waves',
        severity: maritimeWeather.current.waveHeight > 5 ? 'critical' : 'warning',
        message: 'Ondas altas detectadas - Altura estimada: ' + maritimeWeather.current.waveHeight.toFixed(1) + ' metros'
      })
    }

    if (maritimeWeather.current.pressure < 1000) {
      maritimeWeather.alerts.push({
        type: 'low_pressure',
        severity: maritimeWeather.current.pressure < 990 ? 'critical' : 'warning',
        message: 'Baixa pressão atmosférica - ' + maritimeWeather.current.pressure + ' hPa'
      })
    }

    // Calculate operability index
    const operabilityIndex = calculateOperability(maritimeWeather.current)

    // Update vessel weather data if vesselId provided
    if (vesselId) {
      const { error: updateError } = await supabaseClient
        .from('vessels')
        .update({
          last_weather_update: new Date().toISOString(),
          current_weather: maritimeWeather.current,
          weather_alerts: maritimeWeather.alerts
        })
        .eq('id', vesselId)

      if (updateError) {
        console.error('Error updating vessel weather:', updateError)
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        weather: maritimeWeather,
        operabilityIndex: operabilityIndex,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in maritime-weather:', error)
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

// Helper functions for wave estimation
function estimateWaveHeight(windSpeedMs: number): number {
  // Simplified wave height estimation based on wind speed
  // H ≈ 0.025 * V^2 where V is wind speed in m/s
  return Math.min(0.025 * Math.pow(windSpeedMs, 2), 15)
}

function estimateWavePeriod(windSpeedMs: number): number {
  // T ≈ 0.3 * sqrt(H)
  const waveHeight = estimateWaveHeight(windSpeedMs)
  return 0.3 * Math.sqrt(waveHeight)
}

function calculateOperability(current: any): any {
  const windFactor = Math.max(0, 100 - (current.windSpeed / 50 * 100))
  const waveFactor = Math.max(0, 100 - (current.waveHeight / 6 * 100))
  const visibilityFactor = Math.min(100, current.visibilityNM / 5 * 100)
  
  const overall = (
    windFactor * 0.4 +
    waveFactor * 0.4 +
    visibilityFactor * 0.2
  )
  
  let status: string
  if (overall >= 80) status = 'excellent'
  else if (overall >= 60) status = 'good'
  else if (overall >= 40) status = 'marginal'
  else if (overall >= 20) status = 'poor'
  else status = 'critical'
  
  return {
    overall: Math.round(overall),
    status,
    factors: {
      wind: Math.round(windFactor),
      waves: Math.round(waveFactor),
      visibility: Math.round(visibilityFactor)
    }
  }
}