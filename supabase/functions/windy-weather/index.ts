import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
    const { lat, lon, type = 'maritime' } = await req.json()

    if (!lat || !lon) {
      throw new Error('Latitude and longitude are required')
    }

    const windyApiKey = Deno.env.get('WINDY_API_KEY')
    if (!windyApiKey) {
      throw new Error('Windy API key not configured')
    }

    // Determine parameters based on request type
    let parameters: string[]
    if (type === 'maritime') {
      parameters = ['wind', 'gust', 'waves', 'swell', 'wwaves', 'wspd', 'wdir']
    } else {
      parameters = ['wind', 'temp', 'precip', 'clouds', 'pressure']
    }

    // Fetch forecast from Windy API
    const response = await fetch('https://api.windy.com/api/point-forecast/v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        lat,
        lon,
        model: 'gfs',
        parameters,
        levels: ['surface'],
        key: windyApiKey,
      }),
    })

    if (!response.ok) {
      throw new Error(`Windy API error: ${response.statusText}`)
    }

    const forecastData = await response.json()

    // Format forecast for maritime use
    const timestamps = forecastData.ts || []
    const windSpeed = forecastData['wind-surface'] || []
    const windGust = forecastData['gust-surface'] || []
    const windDir = forecastData['wdir-surface'] || []
    const waves = forecastData['waves-surface'] || []
    const temp = forecastData['temp-surface'] || []

    const formattedForecast = timestamps.map((ts: number, index: number) => {
      const wspd = windSpeed[index] || 0
      const wgust = windGust[index] || 0
      const waveHeight = waves[index] || 0
      
      // Convert m/s to knots for maritime assessment
      const windKnots = wspd * 1.944
      const gustKnots = wgust * 1.944

      let severity: string
      let description: string

      if (windKnots > 34 || gustKnots > 47 || waveHeight > 4) {
        severity = 'danger'
        description = 'Condições perigosas - operação não recomendada'
      } else if (windKnots > 27 || gustKnots > 40 || waveHeight > 3) {
        severity = 'warning'
        description = 'Condições adversas - navegação com cautela'
      } else if (windKnots > 21 || gustKnots > 33 || waveHeight > 2) {
        severity = 'caution'
        description = 'Condições moderadas - atenção redobrada'
      } else {
        severity = 'safe'
        description = 'Condições favoráveis para navegação'
      }

      return {
        datetime: new Date(ts).toISOString(),
        windSpeed: wspd,
        windSpeedKnots: windKnots,
        windGust: wgust,
        windGustKnots: gustKnots,
        windDirection: windDir[index],
        waveHeight: waveHeight,
        temperature: temp[index],
        conditions: {
          severity,
          description,
        },
      }
    })

    // Generate alerts for dangerous conditions
    const alerts = formattedForecast
      .slice(0, 8) // Check next 24 hours (3h intervals)
      .filter((point: any) => 
        point.conditions.severity === 'danger' || 
        point.conditions.severity === 'warning'
      )
      .map((point: any) => ({
        datetime: point.datetime,
        severity: point.conditions.severity,
        description: point.conditions.description,
        windSpeed: point.windSpeed,
        windSpeedKnots: point.windSpeedKnots,
        windGust: point.windGust,
        waveHeight: point.waveHeight,
      }))

    return new Response(
      JSON.stringify({
        success: true,
        location: { lat, lon },
        model: forecastData.model,
        forecast: formattedForecast,
        alerts,
        units: {
          windSpeed: 'm/s',
          windSpeedKnots: 'knots',
          waveHeight: 'm',
          temperature: '°C',
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in windy-weather:', error)
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