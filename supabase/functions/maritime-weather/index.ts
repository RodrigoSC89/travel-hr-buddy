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

    const { location, vesselId } = await req.json()

    if (!location || !location.lat || !location.lon) {
      throw new Error('Location coordinates are required')
    }

    const weatherApiKey = Deno.env.get('OPENWEATHER_API_KEY')
    if (!weatherApiKey) {
      throw new Error('Weather API key not configured')
    }

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

    // Process weather data for maritime use
    const maritimeWeather = {
      current: {
        temperature: weatherData.main.temp,
        humidity: weatherData.main.humidity,
        pressure: weatherData.main.pressure,
        windSpeed: weatherData.wind?.speed || 0,
        windDirection: weatherData.wind?.deg || 0,
        visibility: weatherData.visibility || 10000,
        weather: weatherData.weather[0],
        seaLevel: weatherData.main.sea_level || weatherData.main.pressure,
        feelsLike: weatherData.main.feels_like
      },
      forecast: marineData?.list?.slice(0, 8).map((item: any) => ({
        datetime: item.dt_txt,
        temperature: item.main.temp,
        windSpeed: item.wind?.speed || 0,
        windDirection: item.wind?.deg || 0,
        weather: item.weather[0],
        precipitation: item.rain?.['3h'] || 0
      })) || [],
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
        severity: 'warning',
        message: 'Ventos fortes detectados - Velocidade: ' + Math.round(maritimeWeather.current.windSpeed) + ' m/s'
      })
    }

    if (maritimeWeather.current.visibility < 1000) {
      maritimeWeather.alerts.push({
        type: 'low_visibility',
        severity: 'danger',
        message: 'Visibilidade reduzida - ' + (maritimeWeather.current.visibility/1000).toFixed(1) + ' km'
      })
    }

    if (maritimeWeather.current.weather.main === 'Thunderstorm') {
      maritimeWeather.alerts.push({
        type: 'thunderstorm',
        severity: 'danger',
        message: 'Tempestade detectada na área'
      })
    }

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
        weather: maritimeWeather
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in weather-integration:', error)
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