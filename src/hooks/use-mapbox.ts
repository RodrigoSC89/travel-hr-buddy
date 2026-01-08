/**
 * useMapbox Hook
 * Handles lazy loading of Mapbox GL and token management
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { loadMapboxGL } from "@/lib/performance/heavy-libs-loader";
import { supabase } from "@/integrations/supabase/client";

interface UseMapboxOptions {
  containerId?: string;
  style?: string;
  center?: [number, number];
  zoom?: number;
  pitch?: number;
  projection?: string;
}

interface UseMapboxReturn {
  mapboxgl: any;
  map: any;
  mapContainer: React.RefObject<HTMLDivElement>;
  isLoading: boolean;
  error: string | null;
  token: string;
}

const DEFAULT_OPTIONS: UseMapboxOptions = {
  style: "mapbox://styles/mapbox/dark-v11",
  center: [-40, -15],
  zoom: 2,
  pitch: 0,
  projection: "mercator",
};

export function useMapbox(options: UseMapboxOptions = {}): UseMapboxReturn {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const mapboxRef = useRef<any>(null);
  
  const [token, setToken] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch Mapbox token
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const { data, error: fnError } = await supabase.functions.invoke("mapbox-token");
        if (fnError) throw fnError;
        if (data?.token) {
          setToken(data.token);
        } else {
          setError("Token do Mapbox não encontrado");
        }
      } catch (err) {
        console.error("Failed to fetch Mapbox token:", err);
        setError("Erro ao carregar token do Mapbox");
        setIsLoading(false);
      }
    };

    fetchToken();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!token || !mapContainer.current || map.current) return;

    let mounted = true;

    const initMap = async () => {
      try {
        const mapboxgl = await loadMapboxGL();
        if (!mounted || !mapContainer.current) return;

        mapboxRef.current = mapboxgl;
        mapboxgl.accessToken = token;

        const mapInstance = new mapboxgl.Map({
          container: mapContainer.current,
          style: opts.style,
          center: opts.center,
          zoom: opts.zoom,
          pitch: opts.pitch,
          projection: opts.projection,
        });

        map.current = mapInstance;

        mapInstance.addControl(new mapboxgl.NavigationControl(), "top-right");

        mapInstance.on("load", () => {
          if (mounted) {
            setIsLoading(false);
          }
        });

        mapInstance.on("error", (e: any) => {
          console.error("Mapbox error:", e);
          if (mounted) {
            setError("Erro ao carregar o mapa");
            setIsLoading(false);
          }
        });
      } catch (err) {
        console.error("Failed to initialize map:", err);
        if (mounted) {
          setError("Falha ao inicializar o mapa");
          setIsLoading(false);
        }
      }
    };

    initMap();

    return () => {
      mounted = false;
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [token, opts.style, opts.center, opts.zoom, opts.pitch, opts.projection]);

  return {
    mapboxgl: mapboxRef.current,
    map: map.current,
    mapContainer,
    isLoading,
    error,
    token,
  };
}

export default useMapbox;
