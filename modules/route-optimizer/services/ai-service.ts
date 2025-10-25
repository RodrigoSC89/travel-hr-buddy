/**
 * AI Service for Route Optimization
 * PATCH 104.0
 */

import type { WeatherWaypoint } from "../types";

interface RouteAnalysisData {
  origin: string;
  destination: string;
  distance: number;
  weatherForecast: WeatherWaypoint[];
  fuelEstimate: number;
  estimatedDuration: number;
}

/**
 * Generate AI-powered route recommendations using OpenAI
 */
export async function generateAIRouteRecommendation(
  data: RouteAnalysisData
): Promise<string> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  if (!apiKey) {
    console.warn("OpenAI API key not configured, using fallback recommendation");
    return generateFallbackRecommendation(data);
  }

  try {
    const prompt = buildRouteAnalysisPrompt(data);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "You are a maritime route optimization expert. Provide concise, actionable recommendations for ship routes based on weather, distance, and fuel efficiency.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      console.error("OpenAI API error:", response.status);
      return generateFallbackRecommendation(data);
    }

    const result = await response.json();
    return result.choices[0]?.message?.content || generateFallbackRecommendation(data);
  } catch (error) {
    console.error("Error generating AI recommendation:", error);
    return generateFallbackRecommendation(data);
  }
}

/**
 * Build prompt for AI route analysis
 */
function buildRouteAnalysisPrompt(data: RouteAnalysisData): string {
  const weatherSummary = summarizeWeather(data.weatherForecast);

  return `
Analyze this maritime route and provide optimization recommendations:

Route Details:
- Origin: ${data.origin}
- Destination: ${data.destination}
- Distance: ${Math.round(data.distance)} nautical miles
- Estimated Duration: ${Math.round(data.estimatedDuration)} hours (${Math.round(data.estimatedDuration / 24)} days)
- Fuel Estimate: ${data.fuelEstimate} tons

Weather Forecast:
${weatherSummary}

Provide:
1. Overall route assessment (1-2 sentences)
2. Key weather considerations
3. Speed and timing recommendations
4. Fuel optimization suggestions
5. Any safety concerns

Keep response concise and actionable.
  `.trim();
}

/**
 * Summarize weather conditions along route
 */
function summarizeWeather(forecast: WeatherWaypoint[]): string {
  if (forecast.length === 0) {
    return "No weather data available";
  }

  const avgWindSpeed =
    forecast.reduce((sum, w) => sum + w.conditions.wind_speed, 0) / forecast.length;
  const maxWindSpeed = Math.max(...forecast.map((w) => w.conditions.wind_speed));
  const conditions = forecast.map((w) => w.conditions.description);

  return `
- Average wind speed: ${avgWindSpeed.toFixed(1)} m/s
- Maximum wind speed: ${maxWindSpeed.toFixed(1)} m/s
- Conditions along route: ${[...new Set(conditions)].join(", ")}
  `.trim();
}

/**
 * Generate fallback recommendation when AI is unavailable
 */
function generateFallbackRecommendation(data: RouteAnalysisData): string {
  const daysAtSea = Math.round(data.estimatedDuration / 24);
  const avgWindSpeed =
    data.weatherForecast.length > 0
      ? data.weatherForecast.reduce((sum, w) => sum + w.conditions.wind_speed, 0) /
        data.weatherForecast.length
      : 0;

  let recommendation = `Route from ${data.origin} to ${data.destination}:\n\n`;

  recommendation += `Distance: ${Math.round(data.distance)} nm over approximately ${daysAtSea} days. `;
  recommendation += `Estimated fuel consumption: ${data.fuelEstimate} tons.\n\n`;

  if (avgWindSpeed > 15) {
    recommendation +=
      "⚠️ High wind speeds expected. Consider adjusting speed and monitoring weather updates closely.\n\n";
  } else if (avgWindSpeed > 10) {
    recommendation +=
      "Moderate wind conditions expected. Maintain standard operational procedures.\n\n";
  } else {
    recommendation += "Favorable weather conditions expected along the route.\n\n";
  }

  recommendation +=
    "Recommendations:\n" +
    "- Monitor weather updates throughout the voyage\n" +
    "- Maintain optimal speed for fuel efficiency (14-16 knots)\n" +
    "- Plan for routine maintenance checks at sea\n" +
    "- Keep communication channels open with shore operations";

  return recommendation;
}

/**
 * Calculate route optimization score
 */
export function calculateRouteScore(data: RouteAnalysisData): {
  fuel_efficiency_score: number;
  safety_score: number;
  time_efficiency_score: number;
  overall_score: number;
} {
  // Simplified scoring algorithm
  const maxWindSpeed = Math.max(...data.weatherForecast.map((w) => w.conditions.wind_speed));

  // Safety score based on weather conditions
  const safetyScore = Math.max(0, 100 - maxWindSpeed * 3);

  // Fuel efficiency score (higher is better, based on optimal consumption)
  const optimalFuel = data.distance * 0.05;
  const fuelEfficiencyScore = Math.max(
    0,
    100 - Math.abs(data.fuelEstimate - optimalFuel) * 10
  );

  // Time efficiency score (assumes 15 knots is optimal)
  const optimalTime = data.distance / 15;
  const timeEfficiencyScore = Math.max(
    0,
    100 - Math.abs(data.estimatedDuration - optimalTime) * 5
  );

  const overallScore = (safetyScore + fuelEfficiencyScore + timeEfficiencyScore) / 3;

  return {
    fuel_efficiency_score: Math.round(fuelEfficiencyScore),
    safety_score: Math.round(safetyScore),
    time_efficiency_score: Math.round(timeEfficiencyScore),
    overall_score: Math.round(overallScore),
  };
}
