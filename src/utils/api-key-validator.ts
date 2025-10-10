/**
 * Comprehensive API Key Validation Utility
 * 
 * This utility tests and validates all external API keys and integrations
 * configured in the Nautilus One Travel HR Buddy system.
 * 
 * Usage:
 *   import { validateAllAPIKeys } from '@/utils/api-key-validator';
 *   const report = await validateAllAPIKeys();
 */

import { testOpenAIConnection } from "@/services/openai";
import { testMapboxConnection } from "@/services/mapbox";
import { testAmadeusConnection } from "@/services/amadeus";
import { testSupabaseConnection } from "@/services/supabase";
import { testWindyConnection } from "@/services/windy";
import { testSkyscannerConnection } from "@/services/skyscanner";
import { testBookingConnection } from "@/services/booking";
import { testMarineTrafficConnection } from "@/services/marinetraffic";
import { testWhisperConnection } from "@/services/whisper";

export interface APIKeyStatus {
  name: string;
  key: string;
  status: "valid" | "invalid" | "expired" | "unauthorized" | "rate_limited" | "not_configured" | "unknown";
  configured: boolean;
  responseTime?: number;
  message: string;
  error?: string;
  data?: Record<string, unknown>;
  recommendation?: string;
}

export interface APIValidationReport {
  timestamp: Date;
  totalAPIs: number;
  validCount: number;
  invalidCount: number;
  notConfiguredCount: number;
  results: APIKeyStatus[];
  summary: string;
}

/**
 * Determine status from test result
 */
function determineStatus(result: { success: boolean; error?: string; message?: string; status?: string }): APIKeyStatus["status"] {
  if (!result.success) {
    const errorLower = (result.error || result.message || "").toLowerCase();
    
    if (errorLower.includes("not configured") || errorLower.includes("missing")) {
      return "not_configured";
    }
    if (errorLower.includes("401") || errorLower.includes("unauthorized") || errorLower.includes("invalid")) {
      return "unauthorized";
    }
    if (errorLower.includes("403") || errorLower.includes("expired") || errorLower.includes("forbidden")) {
      return "expired";
    }
    if (errorLower.includes("429") || errorLower.includes("rate limit")) {
      return "rate_limited";
    }
    
    return "invalid";
  }
  
  return "valid";
}

/**
 * Generate recommendation based on status
 */
function getRecommendation(status: APIKeyStatus["status"], apiName: string): string {
  switch (status) {
  case "valid":
    return "API key is active and working correctly";
  case "not_configured":
    return `Configure ${apiName} API key in environment variables`;
  case "unauthorized":
    return "Invalid API key - verify credentials and rotate if necessary";
  case "expired":
    return "API key has expired - rotate immediately";
  case "rate_limited":
    return "Rate limit reached - consider upgrading plan or reducing usage";
  case "invalid":
    return "API connection failed - check credentials and network connectivity";
  default:
    return "Unknown status - manual inspection required";
  }
}

/**
 * Check if an API key is configured in environment
 */
function isConfigured(...keys: (string | undefined)[]): boolean {
  return keys.some(key => key !== undefined && key !== "" && key !== "undefined");
}

/**
 * Validate all API keys and integrations
 */
export async function validateAllAPIKeys(): Promise<APIValidationReport> {
  const results: APIKeyStatus[] = [];
  

  // 1. OpenAI
  const openAIResult = await testOpenAIConnection();
  const openAIStatus = determineStatus(openAIResult);
  results.push({
    name: "OpenAI",
    key: "VITE_OPENAI_API_KEY",
    status: openAIStatus,
    configured: isConfigured(import.meta.env.VITE_OPENAI_API_KEY),
    responseTime: openAIResult.responseTime,
    message: openAIResult.message,
    error: openAIResult.error,
    data: openAIResult.data,
    recommendation: getRecommendation(openAIStatus, "OpenAI"),
  });

  // 2. Mapbox
  const mapboxResult = await testMapboxConnection();
  const mapboxStatus = determineStatus(mapboxResult);
  results.push({
    name: "Mapbox",
    key: "VITE_MAPBOX_ACCESS_TOKEN / VITE_MAPBOX_TOKEN",
    status: mapboxStatus,
    configured: isConfigured(
      import.meta.env.VITE_MAPBOX_ACCESS_TOKEN,
      import.meta.env.VITE_MAPBOX_TOKEN
    ),
    responseTime: mapboxResult.responseTime,
    message: mapboxResult.message,
    error: mapboxResult.error,
    data: mapboxResult.data,
    recommendation: getRecommendation(mapboxStatus, "Mapbox"),
  });

  // 3. Amadeus
  const amadeusResult = await testAmadeusConnection();
  const amadeusStatus = determineStatus(amadeusResult);
  results.push({
    name: "Amadeus",
    key: "VITE_AMADEUS_API_KEY / VITE_AMADEUS_API_SECRET",
    status: amadeusStatus,
    configured: isConfigured(
      import.meta.env.VITE_AMADEUS_API_KEY,
      import.meta.env.VITE_AMADEUS_API_SECRET
    ),
    responseTime: amadeusResult.responseTime,
    message: amadeusResult.message,
    error: amadeusResult.error,
    data: amadeusResult.data,
    recommendation: getRecommendation(amadeusStatus, "Amadeus"),
  });

  // 4. Supabase
  const supabaseResult = await testSupabaseConnection();
  const supabaseStatus = determineStatus(supabaseResult);
  results.push({
    name: "Supabase",
    key: "VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY",
    status: supabaseStatus,
    configured: isConfigured(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
    ),
    responseTime: supabaseResult.responseTime,
    message: supabaseResult.message,
    error: supabaseResult.error,
    data: supabaseResult.data,
    recommendation: getRecommendation(supabaseStatus, "Supabase"),
  });

  // 5. Windy / OpenWeather
  console.log("Testing Weather API (Windy/OpenWeather)...");
  const windyResult = await testWindyConnection();
  const windyStatus = determineStatus(windyResult);
  results.push({
    name: "Weather (Windy/OpenWeather)",
    key: "VITE_WINDY_API_KEY / VITE_OPENWEATHER_API_KEY",
    status: windyStatus,
    configured: isConfigured(
      import.meta.env.VITE_WINDY_API_KEY,
      import.meta.env.VITE_OPENWEATHER_API_KEY
    ),
    responseTime: windyResult.responseTime,
    message: windyResult.message,
    error: windyResult.error,
    data: windyResult.data,
    recommendation: getRecommendation(windyStatus, "Weather"),
  });

  // 6. Skyscanner
  const skyscannerResult = await testSkyscannerConnection();
  const skyscannerStatus = determineStatus(skyscannerResult);
  results.push({
    name: "Skyscanner",
    key: "VITE_SKYSCANNER_API_KEY / VITE_RAPIDAPI_KEY",
    status: skyscannerStatus,
    configured: isConfigured(
      import.meta.env.VITE_SKYSCANNER_API_KEY,
      import.meta.env.VITE_RAPIDAPI_KEY
    ),
    responseTime: skyscannerResult.responseTime,
    message: skyscannerResult.message,
    error: skyscannerResult.error,
    data: skyscannerResult.data,
    recommendation: getRecommendation(skyscannerStatus, "Skyscanner"),
  });

  // 7. Booking.com
  const bookingResult = await testBookingConnection();
  const bookingStatus = determineStatus(bookingResult);
  results.push({
    name: "Booking.com",
    key: "VITE_BOOKING_API_KEY / VITE_RAPIDAPI_KEY",
    status: bookingStatus,
    configured: isConfigured(
      import.meta.env.VITE_BOOKING_API_KEY,
      import.meta.env.VITE_RAPIDAPI_KEY
    ),
    responseTime: bookingResult.responseTime,
    message: bookingResult.message,
    error: bookingResult.error,
    data: bookingResult.data,
    recommendation: getRecommendation(bookingStatus, "Booking.com"),
  });

  // 8. MarineTraffic
  const marineTrafficResult = await testMarineTrafficConnection();
  const marineTrafficStatus = determineStatus(marineTrafficResult);
  results.push({
    name: "MarineTraffic",
    key: "VITE_MARINETRAFFIC_API_KEY",
    status: marineTrafficStatus,
    configured: isConfigured(import.meta.env.VITE_MARINETRAFFIC_API_KEY),
    responseTime: marineTrafficResult.responseTime,
    message: marineTrafficResult.message,
    error: marineTrafficResult.error,
    data: marineTrafficResult.data,
    recommendation: getRecommendation(marineTrafficStatus, "MarineTraffic"),
  });

  // 9. Whisper (OpenAI)
  const whisperResult = await testWhisperConnection();
  const whisperStatus = determineStatus(whisperResult);
  results.push({
    name: "Whisper (OpenAI Audio)",
    key: "VITE_OPENAI_API_KEY",
    status: whisperStatus,
    configured: isConfigured(import.meta.env.VITE_OPENAI_API_KEY),
    responseTime: whisperResult.responseTime,
    message: whisperResult.message,
    error: whisperResult.error,
    data: whisperResult.data,
    recommendation: getRecommendation(whisperStatus, "Whisper"),
  });

  // Calculate summary statistics
  const validCount = results.filter(r => r.status === "valid").length;
  const invalidCount = results.filter(r => 
    r.status === "invalid" || 
    r.status === "unauthorized" || 
    r.status === "expired" ||
    r.status === "rate_limited"
  ).length;
  const notConfiguredCount = results.filter(r => r.status === "not_configured").length;

  const summary = generateSummary(results, validCount, invalidCount, notConfiguredCount);


  return {
    timestamp: new Date(),
    totalAPIs: results.length,
    validCount,
    invalidCount,
    notConfiguredCount,
    results,
    summary,
  };
}

/**
 * Generate a human-readable summary
 */
function generateSummary(
  results: APIKeyStatus[],
  validCount: number,
  invalidCount: number,
  notConfiguredCount: number
): string {
  const lines: string[] = [];
  
  lines.push("=".repeat(60));
  lines.push("API KEY VALIDATION REPORT");
  lines.push("=".repeat(60));
  lines.push("");
  lines.push(`Total APIs Tested: ${results.length}`);
  lines.push(`✅ Valid: ${validCount}`);
  lines.push(`❌ Invalid/Failed: ${invalidCount}`);
  lines.push(`⚠️  Not Configured: ${notConfiguredCount}`);
  lines.push("");
  lines.push("=".repeat(60));
  lines.push("DETAILED RESULTS");
  lines.push("=".repeat(60));
  lines.push("");

  results.forEach((result, index) => {
    const statusIcon = {
      valid: "✅",
      invalid: "❌",
      expired: "🔴",
      unauthorized: "🚫",
      rate_limited: "⏱️",
      not_configured: "⚠️",
      unknown: "❓",
    }[result.status];

    lines.push(`${index + 1}. ${result.name}`);
    lines.push(`   Status: ${statusIcon} ${result.status.toUpperCase()}`);
    lines.push(`   Key: ${result.key}`);
    lines.push(`   Configured: ${result.configured ? "Yes" : "No"}`);
    if (result.responseTime) {
      lines.push(`   Response Time: ${result.responseTime}ms`);
    }
    lines.push(`   Message: ${result.message}`);
    if (result.error) {
      lines.push(`   Error: ${result.error}`);
    }
    lines.push(`   Recommendation: ${result.recommendation}`);
    lines.push("");
  });

  lines.push("=".repeat(60));
  lines.push("SUMMARY");
  lines.push("=".repeat(60));
  
  if (invalidCount > 0) {
    lines.push("⚠️  WARNING: Some API keys are invalid or expired!");
    lines.push("   Please review and rotate the affected keys.");
  }
  
  if (notConfiguredCount > 0) {
    lines.push(`ℹ️  INFO: ${notConfiguredCount} API(s) not configured.`);
    lines.push("   Configure them if needed for full functionality.");
  }
  
  if (validCount === results.length) {
    lines.push("🎉 SUCCESS: All configured APIs are valid and working!");
  }
  
  lines.push("");
  lines.push("=".repeat(60));

  return lines.join("\n");
}

/**
 * Print the validation report to console
 */
export function printValidationReport(report: APIValidationReport): void {
}

/**
 * Export validation report as JSON
 */
export function exportReportAsJSON(report: APIValidationReport): string {
  return JSON.stringify(report, null, 2);
}
