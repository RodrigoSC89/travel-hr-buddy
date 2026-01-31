/**
 * ICFT - Inteligência Competitiva de Frota em Tempo Real
 * Dashboard com monitoramento AIS e análise de mercado
 * Integrado com API MarineTraffic via Edge Function
 */

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LazyMapbox, loadMapbox } from "@/components/maps/LazyMapbox";
import {
  Ship,
  Radar,
  TrendingUp,
  TrendingDown,
  MapPin,
  Clock,
  DollarSign,
  Target,
  Eye,
  AlertTriangle,
  Activity,
  Globe,
  Anchor,
  Navigation,
  BarChart3,
  RefreshCw,
  Loader2,
  Download,
  FileSpreadsheet
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

// Types for AIS data
interface VesselPosition {
  mmsi: string;
  imo?: string;
  name: string;
  callsign?: string;
  latitude: number;
  longitude: number;
  course: number;
  speed: number;
  heading: number;
  navStatus: string;
  shipType: string;
  destination?: string;
  eta?: string;
  lastUpdate: string;
  company?: string;
}

interface AISResponse {
  success: boolean;
  vessels: VesselPosition[];
  source: "marinetraffic" | "mock";
  timestamp: string;
  count?: number;
}

const marketOpportunities = [
  {
    id: "opp-1",
    route: "Shanghai → Rotterdam",
    demand: "high",
    currentRate: 2850,
    projectedRate: 3100,
    trend: "up",
    competitorPresence: 45,
    recommendation: "Aumentar capacidade nesta rota"
  },
  {
    id: "opp-2",
    route: "Santos → Hamburg",
    demand: "medium",
    currentRate: 1920,
    projectedRate: 2050,
    trend: "up",
    competitorPresence: 32,
    recommendation: "Monitorar próximas 2 semanas"
  },
  {
    id: "opp-3",
    route: "Miami → Le Havre",
    demand: "low",
    currentRate: 1650,
    projectedRate: 1580,
    trend: "down",
    competitorPresence: 68,
    recommendation: "Evitar - saturação de mercado"
  }
];

const performanceComparison = {
  yourFleet: {
    avgSpeed: 16.8,
    fuelEfficiency: 88,
    onTimeDelivery: 94,
    routeOptimization: 91
  },
  marketAvg: {
    avgSpeed: 15.2,
    fuelEfficiency: 82,
    onTimeDelivery: 87,
    routeOptimization: 78
  }
};

const ratesTrend = [
  { week: "Sem 1", shanghai: 2650, santos: 1800, miami: 1700 },
  { week: "Sem 2", shanghai: 2720, santos: 1850, miami: 1680 },
  { week: "Sem 3", shanghai: 2780, santos: 1890, miami: 1650 },
  { week: "Sem 4", shanghai: 2850, santos: 1920, miami: 1650 }
];

const vesselAvailability = [
  { region: "Ásia", available: 45, waiting: 12 },
  { region: "Europa", available: 38, waiting: 8 },
  { region: "América", available: 28, waiting: 15 },
  { region: "Oriente Médio", available: 18, waiting: 5 }
];

const alerts = [
  { id: 1, type: "opportunity", message: "Taxa Shanghai-Rotterdam subiu 8% - oportunidade de mercado", time: "2h" },
  { id: 2, type: "competitor", message: "Maersk reduziu capacidade na rota Miami-Le Havre", time: "4h" },
  { id: 3, type: "warning", message: "Congestionamento detectado no Porto de Santos", time: "6h" }
];

// Company color mapping
const COMPANY_COLORS: Record<string, string> = {
  "Nautilus Fleet": "#10b981",
  "MSC": "#f59e0b",
  "Maersk": "#3b82f6",
  "CMA CGM": "#8b5cf6",
  "Other": "#6b7280"
};

// Interest zones for competitor alerts
const INTEREST_ZONES = [
  { id: "santos", name: "Porto de Santos", lat: -23.9, lng: -46.3, radius: 50 },
  { id: "rotterdam", name: "Porto de Rotterdam", lat: 51.9, lng: 4.5, radius: 50 },
  { id: "singapore", name: "Estreito de Singapura", lat: 1.3, lng: 103.8, radius: 80 },
  { id: "suez", name: "Canal de Suez", lat: 30.5, lng: 32.3, radius: 60 },
];

export default function CompetitiveIntelligenceDashboard() {
  const [vessels, setVessels] = useState<VesselPosition[]>([]);
  const [filteredVessels, setFilteredVessels] = useState<VesselPosition[]>([]);
  const [selectedVessel, setSelectedVessel] = useState<VesselPosition | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dataSource, setDataSource] = useState<"marinetraffic" | "mock">("mock");
  const [lastUpdate, setLastUpdate] = useState<string>("");
  const [mapboxToken, setMapboxToken] = useState<string>("");
  const [companyFilter, setCompanyFilter] = useState<string>("all");
  const [shipTypeFilter, setShipTypeFilter] = useState<string>("all");
  const [showRoutes, setShowRoutes] = useState(true);
  const [showTrails, setShowTrails] = useState(true);
  const [vesselHistory, setVesselHistory] = useState<Record<string, [number, number][]>>({});
  const [zoneAlerts, setZoneAlerts] = useState<{ vessel: VesselPosition; zone: typeof INTEREST_ZONES[0] }[]>([]);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const routeSourcesRef = useRef<string[]>([]);
  const trailSourcesRef = useRef<string[]>([]);
  const previousVesselsInZones = useRef<Set<string>>(new Set());
  const { toast } = useToast();

  // Calculate distance between two points in km
  const haversineDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  };

  // Check for vessels entering interest zones
  useEffect(() => {
    const competitorVessels = vessels.filter(v => v.company !== "Nautilus Fleet");
    const newAlerts: { vessel: VesselPosition; zone: typeof INTEREST_ZONES[0] }[] = [];
    const currentInZones = new Set<string>();

    competitorVessels.forEach(vessel => {
      INTEREST_ZONES.forEach(zone => {
        const distance = haversineDistance(vessel.latitude, vessel.longitude, zone.lat, zone.lng);
        if (distance <= zone.radius) {
          const key = `${vessel.mmsi}-${zone.id}`;
          currentInZones.add(key);
          
          if (!previousVesselsInZones.current.has(key)) {
            newAlerts.push({ vessel, zone });
            toast({
              title: `🚨 Alerta de Zona: ${zone.name}`,
              description: `${vessel.name} (${vessel.company}) entrou na zona de interesse`,
              variant: "default",
            });
          }
        }
      });
    });

    previousVesselsInZones.current = currentInZones;
    if (newAlerts.length > 0) {
      setZoneAlerts(prev => [...newAlerts, ...prev].slice(0, 10));
    }
  }, [vessels]);

  // Pie chart data for company distribution
  const pieChartData = Object.keys(COMPANY_COLORS).map(company => ({
    name: company,
    value: vessels.filter(v => v.company === company).length,
    color: COMPANY_COLORS[company]
  })).filter(d => d.value > 0);

  // Get unique companies and ship types for filters
  const companies = ["all", ...new Set(vessels.map(v => v.company || "Other"))];
  const shipTypes = ["all", ...new Set(vessels.map(v => v.shipType))];

  // Calculate company statistics
  const companyStats = Object.keys(COMPANY_COLORS).map(company => {
    const companyVessels = vessels.filter(v => v.company === company);
    const avgSpeed = companyVessels.length > 0 
      ? companyVessels.reduce((sum, v) => sum + v.speed, 0) / companyVessels.length 
      : 0;
    const activeRoutes = companyVessels.filter(v => v.destination).length;
    return {
      company,
      color: COMPANY_COLORS[company],
      vesselCount: companyVessels.length,
      avgSpeed,
      activeRoutes,
      underway: companyVessels.filter(v => v.navStatus?.includes("Under way")).length
    };
  }).filter(s => s.vesselCount > 0);

  // Apply filters
  useEffect(() => {
    let result = vessels;
    if (companyFilter !== "all") {
      result = result.filter(v => v.company === companyFilter);
    }
    if (shipTypeFilter !== "all") {
      result = result.filter(v => v.shipType === shipTypeFilter);
    }
    setFilteredVessels(result);
  }, [vessels, companyFilter, shipTypeFilter]);

  // Export to CSV
  const exportToCSV = () => {
    const headers = ["MMSI", "IMO", "Nome", "Companhia", "Tipo", "Latitude", "Longitude", "Velocidade (kn)", "Heading", "Status", "Destino", "ETA", "Última Atualização"];
    const rows = filteredVessels.map(v => [
      v.mmsi,
      v.imo || "",
      v.name,
      v.company || "",
      v.shipType,
      v.latitude.toFixed(4),
      v.longitude.toFixed(4),
      v.speed.toFixed(1),
      v.heading,
      v.navStatus,
      v.destination || "",
      v.eta || "",
      v.lastUpdate
    ]);
    
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ais-data-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Exportação concluída",
      description: `${filteredVessels.length} navios exportados para CSV`,
    });
  };

  // Export to Excel (XLSX)
  const exportToExcel = async () => {
    try {
      const XLSX = await import("xlsx");
      const data = filteredVessels.map(v => ({
        "MMSI": v.mmsi,
        "IMO": v.imo || "",
        "Nome": v.name,
        "Companhia": v.company || "",
        "Tipo": v.shipType,
        "Latitude": v.latitude,
        "Longitude": v.longitude,
        "Velocidade (kn)": v.speed,
        "Heading (°)": v.heading,
        "Status": v.navStatus,
        "Destino": v.destination || "",
        "ETA": v.eta || "",
        "Última Atualização": v.lastUpdate
      }));
      
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "AIS Data");
      XLSX.writeFile(wb, `ais-data-${new Date().toISOString().split("T")[0]}.xlsx`);
      
      toast({
        title: "Exportação concluída",
        description: `${filteredVessels.length} navios exportados para Excel`,
      });
    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: "Falha ao gerar arquivo Excel",
        variant: "destructive",
      });
    }
  };

  // Fetch Mapbox token
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("mapbox-token");
        if (error) throw error;
        if (data?.token) {
          setMapboxToken(data.token);
        }
      } catch {
        // Mapbox token fetch failed - map will use fallback or show error state
      }
    };
    fetchToken();
  }, []);

  // Fly to selected vessel
  const flyToVessel = (vessel: VesselPosition) => {
    setSelectedVessel(vessel);
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [vessel.longitude, vessel.latitude],
        zoom: 8,
        pitch: 45,
        bearing: vessel.heading,
        duration: 2000,
        essential: true
      });
    }
  };

  // Generate route line from vessel to destination (simulated)
  const getRouteCoordinates = (vessel: VesselPosition): [number, number][] => {
    const destCoords: Record<string, [number, number]> = {
      "Santos": [-46.3, -23.9],
      "Rotterdam": [4.5, 51.9],
      "Hamburg": [9.9, 53.5],
      "Shanghai": [121.5, 31.2],
      "Singapore": [103.8, 1.3],
      "Miami": [-80.2, 25.8],
      "Le Havre": [0.1, 49.5],
      "Antwerp": [4.4, 51.2],
    };
    
    const dest = vessel.destination || "";
    const destKey = Object.keys(destCoords).find(k => dest.toLowerCase().includes(k.toLowerCase()));
    
    if (destKey) {
      const destCoord = destCoords[destKey];
      // Create curved route with intermediate points
      const midLng = (vessel.longitude + destCoord[0]) / 2;
      const midLat = (vessel.latitude + destCoord[1]) / 2 + 5; // Curve offset
      return [
        [vessel.longitude, vessel.latitude],
        [midLng, midLat],
        [destCoord[0], destCoord[1]]
      ];
    }
    return [];
  };

  // Update map markers and routes
  const updateMapMarkers = async (map: any) => {
    mapRef.current = map;
    const mb = await loadMapbox();
    
    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Clear existing routes
    routeSourcesRef.current.forEach(id => {
      if (map.getLayer(id)) map.removeLayer(id);
      if (map.getSource(id)) map.removeSource(id);
    });
    routeSourcesRef.current = [];

    // Clear existing trails
    trailSourcesRef.current.forEach(id => {
      if (map.getLayer(id)) map.removeLayer(id);
      if (map.getSource(id)) map.removeSource(id);
    });
    trailSourcesRef.current = [];

    filteredVessels.forEach((vessel) => {
      const companyColor = COMPANY_COLORS[vessel.company || "Other"] || COMPANY_COLORS["Other"];

      // Add trail (position history) if enabled
      if (showTrails && vesselHistory[vessel.mmsi]?.length > 1) {
        const trailSourceId = `trail-${vessel.mmsi}`;
        const trailLayerId = `trail-layer-${vessel.mmsi}`;
        
        if (!map.getSource(trailSourceId)) {
          map.addSource(trailSourceId, {
            type: "geojson",
            data: {
              type: "Feature",
              properties: {},
              geometry: { type: "LineString", coordinates: vesselHistory[vessel.mmsi] }
            }
          });
          
          map.addLayer({
            id: trailLayerId,
            type: "line",
            source: trailSourceId,
            paint: {
              "line-color": companyColor,
              "line-width": 3,
              "line-opacity": 0.8,
              "line-gradient": [
                "interpolate",
                ["linear"],
                ["line-progress"],
                0, "transparent",
                1, companyColor
              ]
            },
            layout: {
              "line-cap": "round",
              "line-join": "round"
            }
          });
          
          trailSourcesRef.current.push(trailSourceId);
        }
      }

      // Add route line if enabled and destination exists
      if (showRoutes) {
        const routeCoords = getRouteCoordinates(vessel);
        if (routeCoords.length > 0) {
          const sourceId = `route-${vessel.mmsi}`;
          const layerId = `route-layer-${vessel.mmsi}`;
          
          if (!map.getSource(sourceId)) {
            map.addSource(sourceId, {
              type: "geojson",
              data: {
                type: "Feature",
                properties: {},
                geometry: { type: "LineString", coordinates: routeCoords }
              }
            });
            
            map.addLayer({
              id: layerId,
              type: "line",
              source: sourceId,
              paint: {
                "line-color": companyColor,
                "line-width": 2,
                "line-opacity": 0.5,
                "line-dasharray": [2, 2]
              }
            });
            
            routeSourcesRef.current.push(sourceId);
          }
        }
      }

      // Create marker with company color
      const el = document.createElement("div");
      el.className = "vessel-marker";
      el.innerHTML = `
        <div class="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-125 shadow-lg" 
             style="background-color: ${companyColor}; transform: rotate(${vessel.heading}deg); box-shadow: 0 0 10px ${companyColor}80;">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <path d="M12 2L4 20l8-4 8 4L12 2z"/>
          </svg>
        </div>
      `;
      
      el.addEventListener("click", () => flyToVessel(vessel));

      const marker = new mb.Marker({ element: el })
        .setLngLat([vessel.longitude, vessel.latitude])
        .setPopup(
          new mb.Popup({ offset: 25 }).setHTML(`
            <div class="p-2">
              <div class="flex items-center gap-2 mb-1">
                <div class="w-3 h-3 rounded-full" style="background-color: ${companyColor}"></div>
                <strong>${vessel.name}</strong>
              </div>
              <span class="text-sm">${vessel.company || vessel.shipType}</span><br/>
              <span class="text-xs text-gray-500">${vessel.speed.toFixed(1)} kn → ${vessel.destination || "N/A"}</span>
            </div>
          `)
        )
        .addTo(map);
      
      markersRef.current.push(marker);
    });

    // Fit bounds to show all vessels
    if (filteredVessels.length > 0) {
      const bounds = filteredVessels.reduce(
        (acc, v) => ({
          minLng: Math.min(acc.minLng, v.longitude),
          maxLng: Math.max(acc.maxLng, v.longitude),
          minLat: Math.min(acc.minLat, v.latitude),
          maxLat: Math.max(acc.maxLat, v.latitude),
        }),
        { minLng: 180, maxLng: -180, minLat: 90, maxLat: -90 }
      );

      map.fitBounds(
        [[bounds.minLng - 5, bounds.minLat - 5], [bounds.maxLng + 5, bounds.maxLat + 5]],
        { padding: 50, maxZoom: 8 }
      );
    }
  };

  // Update markers when filtered vessels change
  useEffect(() => {
    if (mapRef.current && filteredVessels.length > 0) {
      updateMapMarkers(mapRef.current);
    }
  }, [filteredVessels, showRoutes, showTrails, vesselHistory]);

  // Fetch AIS data from Edge Function
  const fetchAISData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ais-tracking", {
        body: {
          operation: "area-search",
          bounds: {
            north: 30,
            south: -35,
            east: -30,
            west: -80
          }
        }
      });

      if (error) throw error;

      if (data?.success && data.vessels) {
        // Add company info based on vessel names (simulation)
        const enrichedVessels = data.vessels.map((v: VesselPosition) => ({
          ...v,
          company: v.name.includes("MSC") ? "MSC" : 
                   v.name.includes("MAERSK") ? "Maersk" :
                   v.name.includes("CMA") ? "CMA CGM" :
                   v.name.includes("NAUTILUS") ? "Nautilus Fleet" : "Other"
        }));
        
        // Update vessel history for trails
        setVesselHistory(prev => {
          const updated = { ...prev };
          enrichedVessels.forEach((v: VesselPosition) => {
            const history = updated[v.mmsi] || [];
            const newPos: [number, number] = [v.longitude, v.latitude];
            // Only add if position changed
            const lastPos = history[history.length - 1];
            if (!lastPos || lastPos[0] !== newPos[0] || lastPos[1] !== newPos[1]) {
              updated[v.mmsi] = [...history.slice(-19), newPos]; // Keep last 20 positions
            }
          });
          return updated;
        });
        
        setVessels(enrichedVessels);
        setDataSource(data.source);
        setLastUpdate(data.timestamp);
        
        if (enrichedVessels.length > 0 && !selectedVessel) {
          setSelectedVessel(enrichedVessels[0]);
        }

        toast({
          title: "AIS Atualizado",
          description: `${enrichedVessels.length} navios rastreados via ${data.source === "marinetraffic" ? "MarineTraffic" : "simulação"}`,
        });
      }
    } catch {
      toast({
        title: "Erro AIS",
        description: "Falha ao carregar dados de rastreamento",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAISData();
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchAISData, 60000);
    return () => clearInterval(interval);
  }, []);

  const getDemandColor = (demand: string) => {
    switch (demand) {
      case "high": return "text-emerald-500 bg-emerald-500/10";
      case "medium": return "text-amber-500 bg-amber-500/10";
      case "low": return "text-red-500 bg-red-500/10";
      default: return "";
    }
  };

  const getNavStatusBadge = (status: string) => {
    if (status.includes("Under way")) return "bg-emerald-500";
    if (status.includes("anchor") || status.includes("Anchor")) return "bg-amber-500";
    if (status.includes("Moored")) return "bg-blue-500";
    return "bg-gray-500";
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Radar className="h-8 w-8 text-cyan-500" />
            ICFT - Inteligência Competitiva
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitoramento AIS e análise de mercado em tempo real
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchAISData}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Atualizar
          </Button>
          <Badge variant="outline" className={dataSource === "marinetraffic" ? "text-emerald-500 border-emerald-500" : "text-cyan-500 border-cyan-500"}>
            <Activity className="h-3 w-3 mr-1" />
            {dataSource === "marinetraffic" ? "MarineTraffic Live" : "AIS Simulado"}
          </Badge>
          <Badge variant="outline" className="text-emerald-500 border-emerald-500">
            <Globe className="h-3 w-3 mr-1" />
            {vessels.length} navios
          </Badge>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border-cyan-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Competidores Rastreados</p>
                <p className="text-2xl font-bold text-cyan-500">127</p>
                <p className="text-xs text-cyan-400">4 operadoras principais</p>
              </div>
              <Ship className="h-10 w-10 text-cyan-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Oportunidades</p>
                <p className="text-2xl font-bold text-emerald-500">3</p>
                <p className="text-xs text-emerald-400 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> +$500k potencial
                </p>
              </div>
              <Target className="h-10 w-10 text-emerald-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Vantagem de Mercado</p>
                <p className="text-2xl font-bold text-purple-500">+12%</p>
                <p className="text-xs text-purple-400">vs média do setor</p>
              </div>
              <BarChart3 className="h-10 w-10 text-purple-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa Média Spot</p>
                <p className="text-2xl font-bold text-amber-500">$2,140</p>
                <p className="text-xs text-amber-400 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> +5% esta semana
                </p>
              </div>
              <DollarSign className="h-10 w-10 text-amber-500/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="ais" className="space-y-4">
        <TabsList>
          <TabsTrigger value="ais">Rastreamento AIS</TabsTrigger>
          <TabsTrigger value="opportunities">Oportunidades</TabsTrigger>
          <TabsTrigger value="benchmark">Benchmark</TabsTrigger>
          <TabsTrigger value="rates">Taxas de Mercado</TabsTrigger>
        </TabsList>

        <TabsContent value="ais" className="space-y-4">
          {/* Company Statistics Panel */}
          {companyStats.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {companyStats.map((stat) => (
                <Card key={stat.company} className="p-3" style={{ borderColor: `${stat.color}40` }}>
                  <div className="flex items-center gap-2 mb-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: stat.color, boxShadow: `0 0 8px ${stat.color}80` }}
                    />
                    <span className="text-sm font-medium truncate">{stat.company}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Navios</p>
                      <p className="font-bold text-lg" style={{ color: stat.color }}>{stat.vesselCount}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Vel. Média</p>
                      <p className="font-bold">{stat.avgSpeed.toFixed(1)} kn</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Rotas Ativas</p>
                      <p className="font-bold">{stat.activeRoutes}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Em Navegação</p>
                      <p className="font-bold text-emerald-500">{stat.underway}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Filters Bar */}
          <Card className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Companhia:</span>
                <select
                  value={companyFilter}
                  onChange={(e) => setCompanyFilter(e.target.value)}
                  className="bg-background border rounded-md px-3 py-1.5 text-sm"
                >
                  {companies.map(c => (
                    <option key={c} value={c}>{c === "all" ? "Todas" : c}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Tipo:</span>
                <select
                  value={shipTypeFilter}
                  onChange={(e) => setShipTypeFilter(e.target.value)}
                  className="bg-background border rounded-md px-3 py-1.5 text-sm"
                >
                  {shipTypes.map(t => (
                    <option key={t} value={t}>{t === "all" ? "Todos" : t}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={showRoutes ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowRoutes(!showRoutes)}
                >
                  <Navigation className="h-4 w-4 mr-1" />
                  Rotas
                </Button>
                <Button
                  variant={showTrails ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowTrails(!showTrails)}
                >
                  <Activity className="h-4 w-4 mr-1" />
                  Trails
                </Button>
              </div>
              
              {/* Export Buttons */}
              <div className="flex items-center gap-2 ml-auto">
                <Button variant="outline" size="sm" onClick={exportToCSV}>
                  <Download className="h-4 w-4 mr-1" />
                  CSV
                </Button>
                <Button variant="outline" size="sm" onClick={exportToExcel}>
                  <FileSpreadsheet className="h-4 w-4 mr-1" />
                  Excel
                </Button>
                <Badge variant="secondary">
                  {filteredVessels.length} de {vessels.length} navios
                </Badge>
              </div>
            </div>
            
            {/* Company Legend */}
            <div className="flex flex-wrap items-center gap-4 mt-3 pt-3 border-t">
              <span className="text-xs text-muted-foreground">Legenda:</span>
              {Object.entries(COMPANY_COLORS).map(([company, color]) => (
                <div key={company} className="flex items-center gap-1.5">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}80` }}
                  />
                  <span className="text-xs">{company}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Distribution Chart + Zone Alerts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Pie Chart - Company Distribution */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Distribuição por Companhia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => [`${value} navios`, "Quantidade"]}
                        contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Zone Alerts */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Alertas de Zona de Interesse
                  {zoneAlerts.length > 0 && (
                    <Badge variant="destructive" className="ml-auto">{zoneAlerts.length}</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[170px]">
                  {zoneAlerts.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                      <div className="text-center">
                        <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>Nenhum competidor nas zonas monitoradas</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {zoneAlerts.map((alert, idx) => (
                        <div 
                          key={idx}
                          className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center gap-3"
                        >
                          <div 
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: COMPANY_COLORS[alert.vessel.company || "Other"] }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{alert.vessel.name}</p>
                            <p className="text-xs text-muted-foreground">{alert.zone.name}</p>
                          </div>
                          <Badge variant="outline" className="text-xs shrink-0">
                            {alert.vessel.company}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Lista de Navios */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ship className="h-5 w-5" />
                  Navios Competidores
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[350px]">
                  <div className="space-y-3">
                    {isLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                    ) : filteredVessels.map((vessel) => (
                      <div
                        key={vessel.mmsi}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedVessel?.mmsi === vessel.mmsi 
                            ? "ring-2 ring-primary bg-primary/5" 
                            : "hover:bg-muted/50"
                        }`}
                        onClick={() => flyToVessel(vessel)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Ship className={`h-4 w-4 ${vessel.company === "Nautilus Fleet" ? "text-emerald-500" : "text-cyan-500"}`} />
                            <span className="font-medium text-sm">{vessel.name}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {vessel.company || vessel.shipType}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Navigation className="h-3 w-3" />
                            {vessel.speed.toFixed(1)} kn
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {vessel.destination || "N/A"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Detalhes do Navio */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    {selectedVessel?.name || "Selecione um navio"}
                  </CardTitle>
                  {selectedVessel && (
                    <Badge className={getNavStatusBadge(selectedVessel.navStatus)}>
                      {selectedVessel.navStatus}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {mapboxToken ? (
                  <LazyMapbox
                    token={mapboxToken}
                    center={selectedVessel ? [selectedVessel.longitude, selectedVessel.latitude] : [-50, -10]}
                    zoom={selectedVessel ? 6 : 3}
                    style="mapbox://styles/mapbox/dark-v11"
                    projection="mercator"
                    onMapLoad={updateMapMarkers}
                    className="h-[300px]"
                  />
                ) : (
                  <div className="h-[300px] rounded-lg bg-gradient-to-br from-cyan-500/5 to-blue-500/10 border border-cyan-500/20 flex items-center justify-center">
                    <div className="text-center">
                      <Globe className="h-12 w-12 text-cyan-500/50 mx-auto mb-2 animate-pulse" />
                      <p className="text-sm text-muted-foreground">Carregando mapa...</p>
                    </div>
                  </div>
                )}

                {selectedVessel && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-3 rounded-lg bg-muted/50 text-center">
                      <Navigation className="h-4 w-4 mx-auto text-muted-foreground" />
                      <p className="text-xs text-muted-foreground mt-1">Velocidade</p>
                      <p className="font-bold">{selectedVessel.speed.toFixed(1)} kn</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50 text-center">
                      <Target className="h-4 w-4 mx-auto text-muted-foreground" />
                      <p className="text-xs text-muted-foreground mt-1">Heading</p>
                      <p className="font-bold">{selectedVessel.heading}°</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50 text-center">
                      <MapPin className="h-4 w-4 mx-auto text-muted-foreground" />
                      <p className="text-xs text-muted-foreground mt-1">Destino</p>
                      <p className="font-bold">{selectedVessel.destination || "N/A"}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50 text-center">
                      <Clock className="h-4 w-4 mx-auto text-muted-foreground" />
                      <p className="text-xs text-muted-foreground mt-1">ETA</p>
                      <p className="font-bold">{selectedVessel.eta ? new Date(selectedVessel.eta).toLocaleDateString("pt-BR") : "N/A"}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Alertas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Alertas de Mercado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {alerts.map((alert) => (
                  <div 
                    key={alert.id}
                    className={`p-3 rounded-lg flex items-center justify-between ${
                      alert.type === "opportunity" 
                        ? "bg-emerald-500/10 border border-emerald-500/20"
                        : alert.type === "competitor"
                        ? "bg-blue-500/10 border border-blue-500/20"
                        : "bg-amber-500/10 border border-amber-500/20"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {alert.type === "opportunity" ? (
                        <Target className="h-5 w-5 text-emerald-500" />
                      ) : alert.type === "competitor" ? (
                        <Eye className="h-5 w-5 text-blue-500" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                      )}
                      <p className="text-sm">{alert.message}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{alert.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="opportunities" className="space-y-4">
          <div className="grid gap-4">
            {marketOpportunities.map((opp) => (
              <Card key={opp.id} className={opp.demand === "high" ? "border-success/50" : ""}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-info/10">
                        <Navigation className="h-5 w-5 text-info" />
                      </div>
                      <div>
                        <h4 className="font-bold">{opp.route}</h4>
                        <Badge className={getDemandColor(opp.demand)}>
                          Demanda {opp.demand === "high" ? "Alta" : opp.demand === "medium" ? "Média" : "Baixa"}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">${opp.currentRate}</p>
                      <p className={`text-sm flex items-center justify-end gap-1 ${
                        opp.trend === "up" ? "text-emerald-500" : "text-red-500"
                      }`}>
                        {opp.trend === "up" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        → ${opp.projectedRate}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span>Presença de Competidores</span>
                      <span>{opp.competitorPresence}%</span>
                    </div>
                    <Progress value={opp.competitorPresence} className="h-2" />
                  </div>

                  <div className={`p-3 rounded-lg ${
                    opp.demand === "high" 
                      ? "bg-emerald-500/10 border border-emerald-500/20" 
                      : opp.demand === "low"
                      ? "bg-red-500/10 border border-red-500/20"
                      : "bg-amber-500/10 border border-amber-500/20"
                  }`}>
                    <p className="text-sm">
                      <strong>Recomendação IA:</strong> {opp.recommendation}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="benchmark" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(performanceComparison.yourFleet).map(([key, value]) => {
              const marketValue = performanceComparison.marketAvg[key as keyof typeof performanceComparison.marketAvg];
              const diff = value - marketValue;
              const labels: Record<string, string> = {
                avgSpeed: "Velocidade Média (kn)",
                fuelEfficiency: "Eficiência de Combustível (%)",
                onTimeDelivery: "Entregas no Prazo (%)",
                routeOptimization: "Otimização de Rota (%)"
              };

              return (
                <Card key={key}>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground mb-2">{labels[key]}</p>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-3xl font-bold">{value}</p>
                        <p className="text-xs text-muted-foreground">Sua frota</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-medium ${diff > 0 ? "text-emerald-500" : "text-red-500"}`}>
                          {diff > 0 ? "+" : ""}{diff.toFixed(1)}
                        </p>
                        <p className="text-xs text-muted-foreground">vs mercado ({marketValue})</p>
                      </div>
                    </div>
                    <Progress value={(value / 100) * 100} className="h-2 mt-3" />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="rates">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Tendência de Taxas por Rota ($/TEU)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={ratesTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))" 
                    }}
                    formatter={(value: number) => [`$${value}`, '']}
                  />
                  <Line type="monotone" dataKey="shanghai" stroke="#10b981" strokeWidth={2} name="Shanghai-Rotterdam" />
                  <Line type="monotone" dataKey="santos" stroke="#3b82f6" strokeWidth={2} name="Santos-Hamburg" />
                  <Line type="monotone" dataKey="miami" stroke="#f59e0b" strokeWidth={2} name="Miami-Le Havre" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
