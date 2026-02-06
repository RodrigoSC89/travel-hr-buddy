import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * Marine Weather Edge Function
 * Uses Open-Meteo Marine API (FREE, no API key required)
 * Provides: wave height, wind, temperature, pressure, visibility, currents
 * Fallback-safe: always works without configuration
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { lat, lng, forecast_days = 3 } = await req.json();

    if (!lat || !lng) {
      return new Response(
        JSON.stringify({ error: "lat and lng are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[marine-weather] Fetching for lat=${lat}, lng=${lng}`);

    // Open-Meteo Marine API — FREE, no key needed
    const marineUrl = new URL("https://marine-api.open-meteo.com/v1/marine");
    marineUrl.searchParams.set("latitude", String(lat));
    marineUrl.searchParams.set("longitude", String(lng));
    marineUrl.searchParams.set("hourly", [
      "wave_height", "wave_direction", "wave_period",
      "wind_wave_height", "wind_wave_direction", "wind_wave_period",
      "swell_wave_height", "swell_wave_direction", "swell_wave_period",
      "ocean_current_velocity", "ocean_current_direction"
    ].join(","));
    marineUrl.searchParams.set("forecast_days", String(Math.min(forecast_days, 7)));
    marineUrl.searchParams.set("timezone", "auto");

    // Open-Meteo Weather API — FREE, no key needed
    const weatherUrl = new URL("https://api.open-meteo.com/v1/forecast");
    weatherUrl.searchParams.set("latitude", String(lat));
    weatherUrl.searchParams.set("longitude", String(lng));
    weatherUrl.searchParams.set("current", [
      "temperature_2m", "relative_humidity_2m", "apparent_temperature",
      "pressure_msl", "surface_pressure", "wind_speed_10m", "wind_direction_10m",
      "wind_gusts_10m", "cloud_cover", "visibility", "precipitation"
    ].join(","));
    weatherUrl.searchParams.set("hourly", [
      "temperature_2m", "wind_speed_10m", "wind_direction_10m",
      "pressure_msl", "precipitation", "cloud_cover", "visibility"
    ].join(","));
    weatherUrl.searchParams.set("forecast_days", String(Math.min(forecast_days, 7)));
    weatherUrl.searchParams.set("timezone", "auto");

    // Fetch both in parallel
    const [marineRes, weatherRes] = await Promise.all([
      fetch(marineUrl.toString()),
      fetch(weatherUrl.toString()),
    ]);

    const marineData = marineRes.ok ? await marineRes.json() : null;
    const weatherData = weatherRes.ok ? await weatherRes.json() : null;

    if (!marineData && !weatherData) {
      throw new Error("Both Open-Meteo APIs failed");
    }

    // Build current conditions
    const current = weatherData?.current || {};
    const marineHourly = marineData?.hourly || {};
    const weatherHourly = weatherData?.hourly || {};

    // Find current hour index
    const now = new Date();
    const currentHourISO = now.toISOString().slice(0, 13);
    const marineTimeIdx = (marineHourly.time || []).findIndex((t: string) => t.startsWith(currentHourISO));
    const idx = marineTimeIdx >= 0 ? marineTimeIdx : 0;

    const result = {
      success: true,
      source: "open-meteo",
      location: { lat, lng },
      current: {
        time: current.time || now.toISOString(),
        airTemperature: current.temperature_2m ?? null,
        feelsLike: current.apparent_temperature ?? null,
        humidity: current.relative_humidity_2m ?? null,
        pressure: current.pressure_msl ?? null,
        surfacePressure: current.surface_pressure ?? null,
        windSpeed: current.wind_speed_10m ?? null, // km/h
        windSpeedKnots: current.wind_speed_10m ? +(current.wind_speed_10m * 0.539957).toFixed(1) : null,
        windDirection: current.wind_direction_10m ?? null,
        windGusts: current.wind_gusts_10m ?? null,
        cloudCover: current.cloud_cover ?? null,
        visibility: current.visibility ? +(current.visibility / 1000).toFixed(1) : null, // km
        precipitation: current.precipitation ?? null,
        // Marine data for current hour
        waveHeight: marineHourly.wave_height?.[idx] ?? null,
        waveDirection: marineHourly.wave_direction?.[idx] ?? null,
        wavePeriod: marineHourly.wave_period?.[idx] ?? null,
        swellHeight: marineHourly.swell_wave_height?.[idx] ?? null,
        swellDirection: marineHourly.swell_wave_direction?.[idx] ?? null,
        swellPeriod: marineHourly.swell_wave_period?.[idx] ?? null,
        currentSpeed: marineHourly.ocean_current_velocity?.[idx] ?? null,
        currentDirection: marineHourly.ocean_current_direction?.[idx] ?? null,
      },
      // Build 24h forecast
      forecast: (marineHourly.time || weatherHourly.time || []).slice(idx, idx + 24).map((time: string, i: number) => ({
        time,
        waveHeight: marineHourly.wave_height?.[idx + i] ?? null,
        wavePeriod: marineHourly.wave_period?.[idx + i] ?? null,
        swellHeight: marineHourly.swell_wave_height?.[idx + i] ?? null,
        windSpeed: weatherHourly.wind_speed_10m?.[idx + i] ?? null,
        windDirection: weatherHourly.wind_direction_10m?.[idx + i] ?? null,
        temperature: weatherHourly.temperature_2m?.[idx + i] ?? null,
        pressure: weatherHourly.pressure_msl?.[idx + i] ?? null,
        precipitation: weatherHourly.precipitation?.[idx + i] ?? null,
        visibility: weatherHourly.visibility?.[idx + i] ? +(weatherHourly.visibility[idx + i] / 1000).toFixed(1) : null,
      })),
      // Generate alerts
      alerts: generateAlerts(current, marineHourly, idx),
    };

    console.log(`[marine-weather] Success — wave=${result.current.waveHeight}m, wind=${result.current.windSpeedKnots}kt`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[marine-weather] Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        source: "open-meteo",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function generateAlerts(current: any, marine: any, idx: number) {
  const alerts: Array<{ type: string; severity: string; title: string; description: string }> = [];

  const windKmh = current.wind_speed_10m;
  if (windKmh && windKmh > 50) {
    alerts.push({
      type: "high_wind",
      severity: windKmh > 90 ? "severe" : "moderate",
      title: "Ventos Fortes",
      description: `Ventos de ${(windKmh * 0.539957).toFixed(0)} nós detectados`,
    });
  }

  const waveH = marine.wave_height?.[idx];
  if (waveH && waveH > 3) {
    alerts.push({
      type: "high_waves",
      severity: waveH > 5 ? "severe" : "moderate",
      title: "Ondas Altas",
      description: `Altura de onda de ${waveH.toFixed(1)}m`,
    });
  }

  const pressure = current.pressure_msl;
  if (pressure && pressure < 1000) {
    alerts.push({
      type: "low_pressure",
      severity: pressure < 990 ? "severe" : "moderate",
      title: "Baixa Pressão",
      description: `Pressão de ${pressure.toFixed(0)} hPa indica instabilidade`,
    });
  }

  const vis = current.visibility;
  if (vis && vis < 5000) {
    alerts.push({
      type: "low_visibility",
      severity: vis < 1000 ? "severe" : "moderate",
      title: "Visibilidade Reduzida",
      description: `Visibilidade de ${(vis / 1000).toFixed(1)} km`,
    });
  }

  return alerts;
}
