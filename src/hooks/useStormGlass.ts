import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface StormGlassData {
  hours?: Array<{
    time: string;
    waveHeight?: { sg: number };
    windSpeed?: { sg: number };
    waterTemperature?: { sg: number };
    airTemperature?: { sg: number };
    pressure?: { sg: number };
    humidity?: { sg: number };
    cloudCover?: { sg: number };
    visibility?: { sg: number };
    currentSpeed?: { sg: number };
    currentDirection?: { sg: number };
  }>;
  meta?: {
    lat: number;
    lng: number;
    requestCount: number;
  };
}

interface UseStormGlassOptions {
  enabled?: boolean;
  refetchInterval?: number;
}

export function useStormGlass(
  lat: number,
  lng: number,
  options: UseStormGlassOptions = {}
) {
  const { enabled = true, refetchInterval = 30 * 60 * 1000 } = options; // 30 min default

  return useQuery({
    queryKey: ["stormglass", lat, lng],
    queryFn: async (): Promise<StormGlassData> => {
      const { data, error } = await supabase.functions.invoke("stormglass-forecast", {
        body: { lat, lng },
      });

      if (error) {
        throw new Error(error.message || "Failed to fetch StormGlass data");
      }

      return data;
    },
    enabled: enabled && !!lat && !!lng,
    refetchInterval,
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    retry: 2,
  });
}

// Helper to get current weather from StormGlass data
export function getCurrentWeather(data: StormGlassData | undefined) {
  if (!data?.hours?.length) return null;
  
  const now = new Date();
  const currentHour = data.hours.find((hour) => {
    const hourTime = new Date(hour.time);
    return hourTime <= now && new Date(hourTime.getTime() + 3600000) > now;
  }) || data.hours[0];

  return {
    waveHeight: currentHour?.waveHeight?.sg ?? null,
    windSpeed: currentHour?.windSpeed?.sg ?? null,
    waterTemperature: currentHour?.waterTemperature?.sg ?? null,
    airTemperature: currentHour?.airTemperature?.sg ?? null,
    pressure: currentHour?.pressure?.sg ?? null,
    humidity: currentHour?.humidity?.sg ?? null,
    cloudCover: currentHour?.cloudCover?.sg ?? null,
    visibility: currentHour?.visibility?.sg ?? null,
    currentSpeed: currentHour?.currentSpeed?.sg ?? null,
    currentDirection: currentHour?.currentDirection?.sg ?? null,
    time: currentHour?.time,
  };
}
