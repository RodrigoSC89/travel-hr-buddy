import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Ship, MapPin, Navigation, Activity, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VesselLocation {
  id: string;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  course: number;
  speed: number;
  status: "active" | "anchored" | "maintenance" | "emergency";
  last_update: string;
  captain: string;
  destination?: string;
}

const VesselTrackingMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [vessels, setVessels] = useState<VesselLocation[]>([]);
  const [selectedVessel, setSelectedVessel] = useState<VesselLocation | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    // Fetch Mapbox token from edge function
    const fetchMapboxToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("mapbox-token");
        if (error) throw error;
        setMapboxToken(data.token);
      } catch (error) {
        console.error("Error fetching Mapbox token:", error);
        toast({
          title: "Erro de Configuração",
          description: "Token do Mapbox não configurado",
          variant: "destructive",
        });
      }
    };

    fetchMapboxToken();
  }, [toast]);

  useEffect(() => {
    if (!mapboxToken || !mapContainer.current) return;

    // Initialize map
    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/satellite-streets-v12",
      projection: "globe",
      zoom: 2,
      center: [-40, -15], // Centro do Brasil
      pitch: 45,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Add scale control
    map.current.addControl(new mapboxgl.ScaleControl(), "bottom-left");

    // Load vessel data
    loadVesselData();

    // Set up real-time updates
    const intervalId = setInterval(loadVesselData, 30000); // Update every 30 seconds

    return () => {
      clearInterval(intervalId);
      map.current?.remove();
    };
  }, [mapboxToken]);

  const loadVesselData = async () => {
    try {
      // Simulate vessel data - in real app, this would come from GPS trackers
      const mockVessels: VesselLocation[] = [
        {
          id: "1",
          name: "Nautilus Explorer",
          type: "Cargo",
          latitude: -23.5505,
          longitude: -46.6333,
          course: 45,
          speed: 12.5,
          status: "active",
          last_update: new Date().toISOString(),
          captain: "Capitão Silva",
          destination: "Porto de Santos",
        },
        {
          id: "2",
          name: "Atlantic Pioneer",
          type: "Tanker",
          latitude: -22.9068,
          longitude: -43.1729,
          course: 180,
          speed: 0,
          status: "anchored",
          last_update: new Date().toISOString(),
          captain: "Capitão Costa",
          destination: "Porto do Rio de Janeiro",
        },
        {
          id: "3",
          name: "Pacific Star",
          type: "Container",
          latitude: -8.0476,
          longitude: -34.877,
          course: 270,
          speed: 15.2,
          status: "active",
          last_update: new Date().toISOString(),
          captain: "Capitão Oliveira",
          destination: "Porto de Recife",
        },
        {
          id: "4",
          name: "Ocean Guardian",
          type: "Fishing",
          latitude: -25.4284,
          longitude: -49.2733,
          course: 90,
          speed: 8.0,
          status: "maintenance",
          last_update: new Date().toISOString(),
          captain: "Capitão Santos",
          destination: "Porto de Paranaguá",
        },
      ];

      setVessels(mockVessels);

      if (map.current) {
        updateVesselMarkers(mockVessels);
      }
    } catch (error) {
      console.error("Error loading vessel data:", error);
      toast({
        title: "Erro",
        description: "Falha ao carregar dados das embarcações",
        variant: "destructive",
      });
    }
  };

  const updateVesselMarkers = (vesselData: VesselLocation[]) => {
    if (!map.current) return;

    // Remove existing markers
    const existingMarkers = document.querySelectorAll(".vessel-marker");
    existingMarkers.forEach(marker => marker.remove());

    // Add new markers
    vesselData.forEach(vessel => {
      const el = document.createElement("div");
      el.className = "vessel-marker";
      el.style.cssText = `
        width: 30px;
        height: 30px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        color: #F0F9FF;
        border: 2px solid #E0F2FE;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        ${getVesselMarkerStyle(vessel.status)}
        transform: rotate(${vessel.course}deg);
      `;

      el.innerHTML = "⛵";
      el.title = vessel.name;

      el.addEventListener("click", () => {
        setSelectedVessel(vessel);
        map.current?.flyTo({
          center: [vessel.longitude, vessel.latitude],
          zoom: 10,
          duration: 2000,
        });
      });

      new mapboxgl.Marker(el).setLngLat([vessel.longitude, vessel.latitude]).addTo(map.current!);
    });
  };

  const getVesselMarkerStyle = (status: string) => {
    switch (status) {
    case "active":
      return "background-color: #10b981;";
    case "anchored":
      return "background-color: #f59e0b;";
    case "maintenance":
      return "background-color: #ef4444;";
    case "emergency":
      return "background-color: #dc2626; animation: pulse 1s infinite;";
    default:
      return "background-color: #6b7280;";
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: "Ativa", variant: "default" as const, color: "bg-green-500" },
      anchored: { label: "Ancorada", variant: "secondary" as const, color: "bg-yellow-500" },
      maintenance: { label: "Manutenção", variant: "destructive" as const, color: "bg-red-500" },
      emergency: { label: "Emergência", variant: "destructive" as const, color: "bg-red-600" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const centerOnVessel = (vessel: VesselLocation) => {
    if (map.current) {
      map.current.flyTo({
        center: [vessel.longitude, vessel.latitude],
        zoom: 12,
        duration: 2000,
      });
      setSelectedVessel(vessel);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-screen">
      {/* Vessel List */}
      <div className="lg:col-span-1 space-y-4 overflow-y-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ship className="h-5 w-5" />
              Embarcações ({vessels.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {vessels.map(vessel => (
              <Card
                key={vessel.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedVessel?.id === vessel.id ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => centerOnVessel(vessel)}
              >
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{vessel.name}</h3>
                      {getStatusBadge(vessel.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">{vessel.type}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Navigation className="h-3 w-3" />
                        {vessel.speed} nós
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {vessel.course}°
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>

        {/* Selected Vessel Details */}
        {selectedVessel && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Detalhes da Embarcação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h3 className="font-medium">{selectedVessel.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedVessel.type}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Capitão:</span>
                  <p className="font-medium">{selectedVessel.captain}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <div className="mt-1">{getStatusBadge(selectedVessel.status)}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Velocidade:</span>
                  <p className="font-medium">{selectedVessel.speed} nós</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Curso:</span>
                  <p className="font-medium">{selectedVessel.course}°</p>
                </div>
              </div>

              {selectedVessel.destination && (
                <div>
                  <span className="text-muted-foreground">Destino:</span>
                  <p className="font-medium">{selectedVessel.destination}</p>
                </div>
              )}

              <div>
                <span className="text-muted-foreground">Última atualização:</span>
                <p className="text-sm">
                  {new Date(selectedVessel.last_update).toLocaleString("pt-BR")}
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <Button size="sm" className="w-full">
                  <MapPin className="h-4 w-4 mr-2" />
                  Ver Histórico de Rota
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Relatório de Status
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Map */}
      <div className="lg:col-span-3 relative">
        <div ref={mapContainer} className="w-full h-full rounded-lg" />

        {/* Map Controls */}
        <div className="absolute top-4 left-4 space-y-2">
          <Card className="p-2">
            <div className="text-sm font-medium">Controles do Mapa</div>
            <div className="flex gap-2 mt-2">
              <Button size="sm" variant="outline" onClick={() => map.current?.flyTo({ zoom: 2 })}>
                Visão Geral
              </Button>
              <Button size="sm" variant="outline" onClick={() => loadVesselData()}>
                Atualizar
              </Button>
            </div>
          </Card>
        </div>

        {/* Legend */}
        <Card className="absolute bottom-4 right-4 p-3">
          <div className="text-sm font-medium mb-2">Legenda</div>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Ativa</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span>Ancorada</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>Manutenção</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-600"></div>
              <span>Emergência</span>
            </div>
          </div>
        </Card>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default VesselTrackingMap;
