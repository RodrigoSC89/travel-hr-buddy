import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openWeatherApiKey = Deno.env.get('OPENWEATHER_API_KEY')
    
    if (!openWeatherApiKey) {
      throw new Error('OpenWeather API key not configured')
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { latitude, longitude, vessel_id } = await req.json()

    console.log('Fetching weather data for vessel:', vessel_id, 'at coordinates:', latitude, longitude)

    // Fetch current weather
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${openWeatherApiKey}&units=metric&lang=pt_br`
    const weatherResponse = await fetch(weatherUrl)
    const weatherData = await weatherResponse.json()

    // Fetch 5-day forecast
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${openWeatherApiKey}&units=metric&lang=pt_br`
    const forecastResponse = await fetch(forecastUrl)
    const forecastData = await forecastResponse.json()

    // Fetch marine weather (if available)
    const marineUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&appid=${openWeatherApiKey}&units=metric&lang=pt_br`
    let marineData = null
    try {
      const marineResponse = await fetch(marineUrl)
      marineData = await marineResponse.json()
    } catch (error) {
      console.log('Marine data not available:', error.message)
    }

    // Process and structure the weather data
    const processedWeather = {
      current: {
        temperature: weatherData.main.temp,
        feels_like: weatherData.main.feels_like,
        humidity: weatherData.main.humidity,
        pressure: weatherData.main.pressure,
        visibility: weatherData.visibility,
        wind_speed: weatherData.wind.speed,
        wind_direction: weatherData.wind.deg,
        wind_gust: weatherData.wind.gust,
        weather_condition: weatherData.weather[0].description,
        weather_icon: weatherData.weather[0].icon,
        clouds: weatherData.clouds.all,
        uv_index: marineData?.current?.uvi || null,
        sea_level_pressure: weatherData.main.sea_level
      },
      forecast: forecastData.list.slice(0, 8).map((item: any) => ({
        datetime: item.dt_txt,
        temperature: item.main.temp,
        wind_speed: item.wind.speed,
        wind_direction: item.wind.deg,
        weather_condition: item.weather[0].description,
        precipitation: item.rain?.['3h'] || 0,
        wave_height: null // Would need specialized marine API
      })),
      alerts: [],
      marine_conditions: {
        wave_height: null, // Would need specialized marine API
        wave_direction: null,
        swell_height: null,
        tide_level: null
      }
    }

    // Check for weather alerts
    const alerts = []
    
    if (weatherData.wind.speed > 15) { // 15 m/s = ~30 knots
      alerts.push({
        type: 'high_wind',
        severity: weatherData.wind.speed > 25 ? 'severe' : 'moderate',
        title: 'Ventos Fortes',
        description: `Ventos de ${(weatherData.wind.speed * 1.944).toFixed(1)} nós detectados`,
        recommendation: 'Considerar alteração de rota ou redução de velocidade'
      })
    }

    if (weatherData.main.pressure < 1000) {
      alerts.push({
        type: 'low_pressure',
        severity: 'moderate',
        title: 'Baixa Pressão Atmosférica',
        description: `Pressão de ${weatherData.main.pressure} hPa indica possível tempestade`,
        recommendation: 'Monitorar condições meteorológicas de perto'
      })
    }

    if (weatherData.visibility < 5000) {
      alerts.push({
        type: 'poor_visibility',
        severity: 'moderate',
        title: 'Visibilidade Reduzida',
        description: `Visibilidade de apenas ${(weatherData.visibility / 1000).toFixed(1)} km`,
        recommendation: 'Ativar equipamentos de navegação e reduzir velocidade'
      })
    }

    processedWeather.alerts = alerts

    // Store weather data in database for historical tracking
    await supabaseClient
      .from('weather_data')
      .insert({
        vessel_id,
        latitude,
        longitude,
        weather_data: processedWeather,
        alerts_count: alerts.length,
        recorded_at: new Date().toISOString()
      })

    // Create notifications for severe weather
    if (alerts.some(alert => alert.severity === 'severe')) {
      await supabaseClient
        .from('real_time_notifications')
        .insert({
          type: 'weather_alert',
          title: 'Alerta Meteorológico Severo',
          message: `Condições meteorológicas severas detectadas para embarcação ${vessel_id}`,
          priority: 'critical',
          metadata: { vessel_id, alerts, coordinates: { latitude, longitude } }
        })
    }

    console.log('Weather data processed successfully for vessel:', vessel_id)

    return new Response(
      JSON.stringify({
        success: true,
        weather: processedWeather,
        alerts_count: alerts.length,
        location: {
          latitude,
          longitude,
          city: weatherData.name || 'Oceano'
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error fetching weather data:', error)

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})