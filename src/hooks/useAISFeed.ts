import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface AISVesselData {
  mmsi: string;
  imo?: string;
  name?: string;
  type?: string;
  lat: number;
  lng: number;
  speed?: number;
  course?: number;
  heading?: number;
  destination?: string;
  eta?: string;
  status?: string;
  timestamp?: string;
}

interface AISFeedResponse {
  vessels?: AISVesselData[];
  track?: Array<{
    lat: number;
    lng: number;
    timestamp: string;
    speed?: number;
    course?: number;
  }>;
  error?: string;
}

interface UseAISFeedOptions {
  enabled?: boolean;
  refetchInterval?: number;
}

export function useAISFeed(
  mmsi?: string,
  imo?: string,
  options: UseAISFeedOptions = {}
) {
  const { enabled = true, refetchInterval = 5 * 60 * 1000 } = options; // 5 min default

  return useQuery({
    queryKey: ["ais-feed", mmsi, imo],
    queryFn: async (): Promise<AISFeedResponse> => {
      const { data, error } = await supabase.functions.invoke("marinetraffic-ais", {
        body: { mmsi, imo },
      });

      if (error) {
        throw new Error(error.message || "Failed to fetch AIS data");
      }

      return data;
    },
    enabled: enabled && (!!mmsi || !!imo),
    refetchInterval,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
  });
}

// Hook for earthquake/seismic data
export function useEarthquakeData(
  type: "all_hour" | "all_day" | "all_week" | "all_month" | "significant_month" = "all_day",
  minMagnitude: number = 2.5,
  options: UseAISFeedOptions = {}
) {
  const { enabled = true, refetchInterval = 10 * 60 * 1000 } = options; // 10 min default

  return useQuery({
    queryKey: ["earthquake", type, minMagnitude],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("noaa-earthquake", {
        body: { type, minMagnitude },
      });

      if (error) {
        throw new Error(error.message || "Failed to fetch earthquake data");
      }

      return data;
    },
    enabled,
    refetchInterval,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    retry: 2,
  });
}

// Hook for Slack notifications
export function useSlackNotify() {
  const sendNotification = async (
    message: string,
    options: {
      title?: string;
      severity?: "critical" | "warning" | "info" | "success";
      details?: Record<string, unknown>;
    } = {}
  ) => {
    const { data, error } = await supabase.functions.invoke("notify-slack", {
      body: { message, ...options },
    });

    if (error) {
      throw new Error(error.message || "Failed to send Slack notification");
    }

    return data;
  };

  return { sendNotification };
}
