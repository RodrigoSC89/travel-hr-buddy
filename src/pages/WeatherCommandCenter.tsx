/**
 * PATCH UNIFY-10.1: Weather Command Center
 * Now renders the Windy-style interface with all advanced features
 * 
 * Features:
 * - Windy-style animated wind map
 * - 6-day forecasts with marine data
 * - Rain radar with playback controls
 * - City comparison (up to 4 cities)
 * - Temperature & precipitation trend charts
 * - City-specific alerts with push notifications
 * - AI Weather Chat assistant
 * - PDF export for comparisons
 */

import { WindyWeatherPage } from "@/components/weather/windy";

export default function WeatherCommandCenter() {
  return <WindyWeatherPage />;
}
