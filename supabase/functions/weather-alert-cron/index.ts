import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WeatherThresholds {
  windSpeedWarning: number;
  windSpeedCritical: number;
  waveHeightWarning: number;
  waveHeightCritical: number;
  pressureLow: number;
}

const DEFAULT_THRESHOLDS: WeatherThresholds = {
  windSpeedWarning: 25,
  windSpeedCritical: 40,
  waveHeightWarning: 3,
  waveHeightCritical: 6,
  pressureLow: 1000,
};

interface WeatherAlert {
  type: string;
  severity: "warning" | "critical";
  title: string;
  message: string;
  value: number;
  threshold: number;
}

/**
 * Weather Alert Cron Edge Function
 * Monitors weather conditions for registered vessels and sends alerts
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const openWeatherKey = Deno.env.get("OPENWEATHER_API_KEY");
    const slackWebhook = Deno.env.get("SLACK_WEBHOOK_URL");
    const discordWebhook = Deno.env.get("DISCORD_WEBHOOK_URL");

    console.log("[WeatherAlertCron] Starting weather check...");

    // Get active vessels with positions
    const { data: vessels, error: vesselsError } = await supabase
      .from("vessels")
      .select("id, name, current_latitude, current_longitude")
      .not("current_latitude", "is", null)
      .not("current_longitude", "is", null);

    if (vesselsError) {
      console.error("[WeatherAlertCron] Failed to fetch vessels:", vesselsError);
      throw vesselsError;
    }

    if (!vessels || vessels.length === 0) {
      console.log("[WeatherAlertCron] No vessels with positions found");
      return new Response(
        JSON.stringify({ success: true, message: "No vessels to check" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[WeatherAlertCron] Checking ${vessels.length} vessels`);

    const alertsSent: Array<{ vessel: string; alerts: WeatherAlert[] }> = [];

    for (const vessel of vessels) {
      try {
        // Fetch weather data
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${vessel.current_latitude}&lon=${vessel.current_longitude}&appid=${openWeatherKey}&units=metric`;
        const weatherRes = await fetch(weatherUrl);
        const weatherData = await weatherRes.json();

        const windSpeedKnots = (weatherData.wind?.speed || 0) * 1.944; // m/s to knots
        const pressure = weatherData.main?.pressure || 1013;
        const visibility = (weatherData.visibility || 10000) / 1000; // meters to km

        // Check thresholds
        const alerts: WeatherAlert[] = [];

        if (windSpeedKnots >= DEFAULT_THRESHOLDS.windSpeedCritical) {
          alerts.push({
            type: "wind",
            severity: "critical",
            title: "🚨 Ventos Extremos",
            message: `Vento de ${windSpeedKnots.toFixed(0)} nós detectado`,
            value: windSpeedKnots,
            threshold: DEFAULT_THRESHOLDS.windSpeedCritical,
          });
        } else if (windSpeedKnots >= DEFAULT_THRESHOLDS.windSpeedWarning) {
          alerts.push({
            type: "wind",
            severity: "warning",
            title: "⚠️ Ventos Fortes",
            message: `Vento de ${windSpeedKnots.toFixed(0)} nós detectado`,
            value: windSpeedKnots,
            threshold: DEFAULT_THRESHOLDS.windSpeedWarning,
          });
        }

        if (pressure < DEFAULT_THRESHOLDS.pressureLow) {
          alerts.push({
            type: "pressure",
            severity: "warning",
            title: "⚠️ Baixa Pressão",
            message: `Pressão de ${pressure} hPa indica possível tempestade`,
            value: pressure,
            threshold: DEFAULT_THRESHOLDS.pressureLow,
          });
        }

        if (visibility < 2) {
          alerts.push({
            type: "visibility",
            severity: "warning",
            title: "⚠️ Visibilidade Reduzida",
            message: `Visibilidade de ${visibility.toFixed(1)} km`,
            value: visibility,
            threshold: 2,
          });
        }

        if (alerts.length > 0) {
          console.log(`[WeatherAlertCron] ${alerts.length} alerts for vessel ${vessel.name}`);
          alertsSent.push({ vessel: vessel.name, alerts });

          // Store alerts in database
          for (const alert of alerts) {
            await supabase.from("real_time_notifications").insert({
              type: "weather_alert",
              title: alert.title,
              message: `${vessel.name}: ${alert.message}`,
              priority: alert.severity === "critical" ? "critical" : "high",
              metadata: {
                vesselId: vessel.id,
                vesselName: vessel.name,
                alertType: alert.type,
                value: alert.value,
                threshold: alert.threshold,
                coordinates: {
                  lat: vessel.current_latitude,
                  lon: vessel.current_longitude,
                },
              },
            });
          }

          // Send Slack notification
          if (slackWebhook) {
            const slackMessage = {
              attachments: [{
                color: alerts.some(a => a.severity === "critical") ? "#dc2626" : "#f59e0b",
                blocks: [
                  {
                    type: "header",
                    text: {
                      type: "plain_text",
                      text: `🌊 Weather Alert - ${vessel.name}`,
                      emoji: true,
                    },
                  },
                  {
                    type: "section",
                    text: {
                      type: "mrkdwn",
                      text: alerts.map(a => `${a.title}: ${a.message}`).join("\n"),
                    },
                  },
                  {
                    type: "context",
                    elements: [{
                      type: "mrkdwn",
                      text: `*Nautilus One* | Lat: ${vessel.current_latitude}, Lon: ${vessel.current_longitude}`,
                    }],
                  },
                ],
              }],
            };

            await fetch(slackWebhook, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(slackMessage),
            });
          }

          // Send Discord notification
          if (discordWebhook) {
            const discordMessage = {
              embeds: [{
                title: `🌊 Weather Alert - ${vessel.name}`,
                description: alerts.map(a => `${a.title}: ${a.message}`).join("\n"),
                color: alerts.some(a => a.severity === "critical") ? 0xdc2626 : 0xf59e0b,
                footer: { text: "Nautilus One Maritime System" },
                timestamp: new Date().toISOString(),
              }],
            };

            await fetch(discordWebhook, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(discordMessage),
            });
          }
        }
      } catch (vesselError) {
        console.error(`[WeatherAlertCron] Error checking vessel ${vessel.name}:`, vesselError);
      }
    }

    console.log(`[WeatherAlertCron] Complete. ${alertsSent.length} vessels with alerts.`);

    return new Response(
      JSON.stringify({
        success: true,
        vesselsChecked: vessels.length,
        alertsSent,
        timestamp: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[WeatherAlertCron] Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
