// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Weather Integration Edge Function
 * Supports both OpenWeather and Windy APIs
 */
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openWeatherApiKey = Deno.env.get("OPENWEATHER_API_KEY");
    const windyApiKey = Deno.env.get("WINDY_API_KEY");
    
    if (!openWeatherApiKey && !windyApiKey) {
      throw new Error("No weather API key configured (OPENWEATHER_API_KEY or WINDY_API_KEY)");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { latitude, longitude, vessel_id, source = "auto" } = await req.json();

    console.log(`Fetching weather data for vessel: ${vessel_id} at coordinates: ${latitude}, ${longitude} (source: ${source})`);

    let weatherData: any = {};
    let forecastData: any = {};
    let windyData: any = null;

    // Fetch OpenWeather data
    if (openWeatherApiKey && (source === "auto" || source === "openweather")) {
      console.log("Fetching OpenWeather data...");
      
      // Current weather
      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${openWeatherApiKey}&units=metric&lang=pt_br`;
      const weatherResponse = await fetch(weatherUrl);
      weatherData = await weatherResponse.json();

      // 5-day forecast
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${openWeatherApiKey}&units=metric&lang=pt_br`;
      const forecastResponse = await fetch(forecastUrl);
      forecastData = await forecastResponse.json();
    }

    // Fetch Windy data (Point Forecast API)
    if (windyApiKey && (source === "auto" || source === "windy")) {
      console.log("Fetching Windy data...");
      
      try {
        const windyUrl = "https://api.windy.com/api/point-forecast/v2";
        const windyResponse = await fetch(windyUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            lat: latitude,
            lon: longitude,
            model: "gfs", // Global Forecast System
            parameters: ["wind", "waves", "dewpoint", "rh", "pressure", "temp"],
            levels: ["surface"],
            key: windyApiKey,
          }),
        });

        if (windyResponse.ok) {
          windyData = await windyResponse.json();
          console.log("Windy data received successfully");
        } else {
          console.log(`Windy API error: ${windyResponse.status} ${windyResponse.statusText}`);
        }
      } catch (windyError) {
        console.log("Windy API call failed:", windyError instanceof Error ? windyError.message : "Unknown error");
      }
    }

    // Process and structure the weather data
    const processedWeather = {
      sources: {
        openweather: openWeatherApiKey ? true : false,
        windy: windyApiKey && windyData ? true : false,
      },
      current: {
        temperature: weatherData.main?.temp ?? windyData?.temp?.[0] ?? null,
        feels_like: weatherData.main?.feels_like ?? null,
        humidity: weatherData.main?.humidity ?? windyData?.rh?.[0] ?? null,
        pressure: weatherData.main?.pressure ?? windyData?.pressure?.[0] ?? null,
        visibility: weatherData.visibility ?? null,
        wind_speed: weatherData.wind?.speed ?? (windyData?.wind?.[0] ? Math.sqrt(windyData.wind_u?.[0]**2 + windyData.wind_v?.[0]**2) : null),
        wind_direction: weatherData.wind?.deg ?? (windyData?.wind_u?.[0] ? Math.atan2(windyData.wind_u[0], windyData.wind_v[0]) * 180 / Math.PI : null),
        wind_gust: weatherData.wind?.gust ?? null,
        weather_condition: weatherData.weather?.[0]?.description ?? "Dados do Windy",
        weather_icon: weatherData.weather?.[0]?.icon ?? null,
        clouds: weatherData.clouds?.all ?? null,
        uv_index: null,
        sea_level_pressure: weatherData.main?.sea_level ?? null,
        dewpoint: windyData?.dewpoint?.[0] ?? null,
      },
      // Windy-specific marine data
      waves: windyData ? {
        height: windyData.waves_height?.[0] ?? null,
        direction: windyData.waves_direction?.[0] ?? null,
        period: windyData.waves_period?.[0] ?? null,
      } : null,
      forecast: forecastData.list?.slice(0, 8).map((item: any) => ({
        datetime: item.dt_txt,
        temperature: item.main.temp,
        wind_speed: item.wind.speed,
        wind_direction: item.wind.deg,
        weather_condition: item.weather[0].description,
        precipitation: item.rain?.["3h"] || 0,
      })) ?? [],
      // Windy hourly forecast
      windy_forecast: windyData ? {
        timestamps: windyData.ts ?? [],
        temperature: windyData.temp ?? [],
        wind_speed: windyData.wind ?? [],
        pressure: windyData.pressure ?? [],
        waves_height: windyData.waves_height ?? [],
      } : null,
      alerts: [] as any[],
      marine_conditions: {
        wave_height: windyData?.waves_height?.[0] ?? null,
        wave_direction: windyData?.waves_direction?.[0] ?? null,
        swell_height: windyData?.swell_height?.[0] ?? null,
        tide_level: null
      }
    };

    // Check for weather alerts
    const alerts = [];
    
    const windSpeed = processedWeather.current.wind_speed;
    if (windSpeed && windSpeed > 15) { // 15 m/s = ~30 knots
      alerts.push({
        type: "high_wind",
        severity: windSpeed > 25 ? "severe" : "moderate",
        title: "Ventos Fortes",
        description: `Ventos de ${(windSpeed * 1.944).toFixed(1)} nós detectados`,
        recommendation: "Considerar alteração de rota ou redução de velocidade"
      });
    }

    const pressure = processedWeather.current.pressure;
    if (pressure && pressure < 1000) {
      alerts.push({
        type: "low_pressure",
        severity: "moderate",
        title: "Baixa Pressão Atmosférica",
        description: `Pressão de ${pressure} hPa indica possível tempestade`,
        recommendation: "Monitorar condições meteorológicas de perto"
      });
    }

    const visibility = processedWeather.current.visibility;
    if (visibility && visibility < 5000) {
      alerts.push({
        type: "poor_visibility",
        severity: "moderate",
        title: "Visibilidade Reduzida",
        description: `Visibilidade de apenas ${(visibility / 1000).toFixed(1)} km`,
        recommendation: "Ativar equipamentos de navegação e reduzir velocidade"
      });
    }

    // Wave height alert (from Windy)
    const waveHeight = processedWeather.waves?.height;
    if (waveHeight && waveHeight > 3) { // 3 meters
      alerts.push({
        type: "high_waves",
        severity: waveHeight > 5 ? "severe" : "moderate",
        title: "Ondas Altas",
        description: `Altura de onda de ${waveHeight.toFixed(1)} metros detectada`,
        recommendation: "Reduzir velocidade e preparar para mar agitado"
      });
    }

    processedWeather.alerts = alerts;

    // Store weather data in database for historical tracking
    try {
      await supabaseClient
        .from("weather_data")
        .insert({
          vessel_id,
          latitude,
          longitude,
          weather_data: processedWeather,
          alerts_count: alerts.length,
          recorded_at: new Date().toISOString()
        });
    } catch (dbError) {
      console.log("Failed to store weather data:", dbError instanceof Error ? dbError.message : "Unknown error");
    }

    // Create notifications for severe weather
    if (alerts.some(alert => alert.severity === "severe")) {
      try {
        await supabaseClient
          .from("real_time_notifications")
          .insert({
            type: "weather_alert",
            title: "Alerta Meteorológico Severo",
            message: `Condições meteorológicas severas detectadas para embarcação ${vessel_id}`,
            priority: "critical",
            metadata: { vessel_id, alerts, coordinates: { latitude, longitude } }
          });
      } catch (notifError) {
        console.log("Failed to create notification:", notifError instanceof Error ? notifError.message : "Unknown error");
      }
    }

    console.log(`Weather data processed successfully for vessel: ${vessel_id} (sources: OpenWeather=${processedWeather.sources.openweather}, Windy=${processedWeather.sources.windy})`);

    return new Response(
      JSON.stringify({
        success: true,
        weather: processedWeather,
        alerts_count: alerts.length,
        location: {
          latitude,
          longitude,
          city: weatherData.name || "Oceano"
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );

  } catch (error) {
    console.error("Error fetching weather data:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
