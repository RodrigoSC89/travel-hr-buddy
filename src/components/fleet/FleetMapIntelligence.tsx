/**
 * FleetMapIntelligence - Interactive fleet positioning map
 * Shows vessel positions, routes, weather overlay, and geospatial alerts
 */
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  MapPin, Ship, Anchor, Navigation, Wind, AlertTriangle, 
  Thermometer, Waves, Eye, Filter, RefreshCw, Maximize2 
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface VesselPosition {
  id: string;
  name: string;
  imo: string;
  status: string;
  lat: number;
  lng: number;
  heading: number;
  speed: number;
  destination: string;
  eta: string;
  lastUpdate: string;
}

// SVG-based world map with vessel markers
const OCEAN_REGIONS = [
  { name: "North Atlantic", bounds: { x: 150, y: 60, w: 180, h: 120 }, weather: "Moderate" },
  { name: "Mediterranean", bounds: { x: 320, y: 120, w: 100, h: 50 }, weather: "Calm" },
  { name: "Arabian Sea", bounds: { x: 450, y: 150, w: 100, h: 80 }, weather: "Rough" },
  { name: "South China Sea", bounds: { x: 560, y: 160, w: 80, h: 60 }, weather: "Storm Warning" },
  { name: "Gulf of Mexico", bounds: { x: 100, y: 140, w: 80, h: 50 }, weather: "Calm" },
];

const STATUS_COLORS: Record<string, string> = {
  "At Sea": "hsl(var(--chart-2))",
  "In Port": "hsl(var(--chart-1))",
  "Maintenance": "hsl(var(--chart-4))",
  "Anchored": "hsl(var(--chart-3))",
  "Emergency": "hsl(var(--destructive))",
};

function generateMockPositions(vessels: Array<{ id: string; name: string; imo_number?: string; status?: string }>): VesselPosition[] {
  const positions = [
    { lat: 25.7, lng: -80.1, dest: "Houston, TX", heading: 270 },
    { lat: 51.9, lng: 1.3, dest: "Rotterdam, NL", heading: 45 },
    { lat: 1.3, lng: 103.8, dest: "Singapore", heading: 180 },
    { lat: 29.4, lng: 48.0, dest: "Kuwait City", heading: 90 },
    { lat: 35.6, lng: 139.7, dest: "Tokyo, JP", heading: 315 },
    { lat: -33.9, lng: 18.4, dest: "Cape Town, ZA", heading: 200 },
    { lat: 22.3, lng: 114.2, dest: "Hong Kong", heading: 160 },
    { lat: 59.3, lng: 18.1, dest: "Stockholm, SE", heading: 30 },
  ];
  const statuses = ["At Sea", "In Port", "At Sea", "Anchored", "At Sea", "Maintenance", "At Sea", "In Port"];

  return vessels.slice(0, 8).map((v, i) => ({
    id: v.id,
    name: v.name,
    imo: v.imo_number || `IMO${9000000 + i}`,
    status: statuses[i % statuses.length],
    lat: positions[i % positions.length].lat,
    lng: positions[i % positions.length].lng,
    heading: positions[i % positions.length].heading,
    speed: 10 + (i * 1.3) % 8,
    destination: positions[i % positions.length].dest,
    eta: new Date(Date.now() + (1 + (i * 2.7) % 10) * 86400000).toLocaleDateString("pt-BR"),
    lastUpdate: new Date(Date.now() - (i * 720000) % 3600000).toLocaleTimeString("pt-BR"),
  }));
}

// Convert lat/lng to SVG coordinates (Mercator-like projection)
function toSVG(lat: number, lng: number): { x: number; y: number } {
  const x = ((lng + 180) / 360) * 700;
  const y = ((90 - lat) / 180) * 350;
  return { x, y };
}

export function FleetMapIntelligence() {
  const [selectedVessel, setSelectedVessel] = useState<VesselPosition | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showWeather, setShowWeather] = useState(true);

  const { data: vessels = [] } = useQuery({
    queryKey: ["fleet-map-vessels"],
    queryFn: async () => {
      const { data } = await supabase.from("vessels").select("id, name, imo_number, status").limit(20);
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const positions = useMemo(() => generateMockPositions(vessels.length > 0 ? vessels.map(v => ({ ...v, imo_number: v.imo_number ?? undefined, status: v.status ?? undefined })) : [
    { id: "1", name: "MV Nautilus One" },
    { id: "2", name: "MV Atlantic Star" },
    { id: "3", name: "MT Pacific Voyager" },
    { id: "4", name: "MV Gulf Pioneer" },
    { id: "5", name: "MV Nordic Spirit" },
  ]), [vessels]);

  const filtered = filterStatus === "all" ? positions : positions.filter(v => v.status === filterStatus);

  const alerts = useMemo(() => [
    { vessel: "MT Pacific Voyager", type: "Weather", message: "Storm warning na rota - desvio recomendado", severity: "critical" },
    { vessel: "MV Gulf Pioneer", type: "Speed", message: "Velocidade abaixo do esperado - possível avaria", severity: "warning" },
    { vessel: "MV Atlantic Star", type: "ETA", message: "ETA atrasado em 6h devido a correntes", severity: "info" },
  ], []);

  const stats = useMemo(() => ({
    atSea: positions.filter(v => v.status === "At Sea").length,
    inPort: positions.filter(v => v.status === "In Port").length,
    anchored: positions.filter(v => v.status === "Anchored").length,
    maintenance: positions.filter(v => v.status === "Maintenance").length,
  }), [positions]);

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Navigation className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Fleet Map Intelligence</CardTitle>
            <Badge variant="outline" className="text-xs">{positions.length} navios</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="At Sea">No Mar</SelectItem>
                <SelectItem value="In Port">No Porto</SelectItem>
                <SelectItem value="Anchored">Fundeado</SelectItem>
                <SelectItem value="Maintenance">Manutenção</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setShowWeather(!showWeather)}>
              <Wind className={`h-4 w-4 ${showWeather ? "text-primary" : "text-muted-foreground"}`} />
            </Button>
          </div>
        </div>

        {/* Status bar */}
        <div className="flex flex-wrap gap-3 mt-2">
          {[
            { label: "No Mar", value: stats.atSea, color: "hsl(var(--chart-2))" },
            { label: "No Porto", value: stats.inPort, color: "hsl(var(--chart-1))" },
            { label: "Fundeado", value: stats.anchored, color: "hsl(var(--chart-3))" },
            { label: "Manutenção", value: stats.maintenance, color: "hsl(var(--chart-4))" },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
              {s.label}: <span className="font-semibold text-foreground">{s.value}</span>
            </div>
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* SVG Map */}
        <div className="relative rounded-lg overflow-hidden bg-muted/30 border border-border/30">
          <svg viewBox="0 0 700 350" className="w-full h-auto" style={{ minHeight: 250 }}>
            {/* Ocean background */}
            <rect width="700" height="350" fill="hsl(var(--muted))" opacity="0.3" />

            {/* Simplified continents */}
            <path d="M80,50 L150,30 L200,50 L220,80 L180,120 L200,160 L180,200 L150,240 L120,280 L100,320 L80,280 L60,200 L50,150 L60,100 Z" fill="hsl(var(--accent))" opacity="0.4" />
            <path d="M280,30 L400,20 L450,60 L500,40 L600,50 L650,80 L630,120 L580,100 L500,110 L450,130 L400,120 L350,150 L320,180 L380,200 L400,250 L350,300 L300,280 L280,200 L260,150 L280,100 Z" fill="hsl(var(--accent))" opacity="0.4" />
            <path d="M500,200 L580,180 L650,200 L680,250 L650,320 L580,330 L520,300 L500,260 Z" fill="hsl(var(--accent))" opacity="0.4" />

            {/* Weather overlays */}
            {showWeather && OCEAN_REGIONS.map((r, i) => (
              <g key={i}>
                <rect
                  x={r.bounds.x} y={r.bounds.y} width={r.bounds.w} height={r.bounds.h}
                  rx="8"
                  fill={r.weather === "Storm Warning" ? "hsl(var(--destructive))" :
                        r.weather === "Rough" ? "hsl(var(--chart-4))" : "hsl(var(--chart-2))"}
                  opacity={0.08}
                  stroke={r.weather === "Storm Warning" ? "hsl(var(--destructive))" : "transparent"}
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text x={r.bounds.x + 4} y={r.bounds.y + 12} fontSize="7" fill="hsl(var(--muted-foreground))" opacity="0.7">
                  {r.name}
                </text>
              </g>
            ))}

            {/* Vessel markers */}
            {filtered.map(v => {
              const pos = toSVG(v.lat, v.lng);
              const isSelected = selectedVessel?.id === v.id;
              const color = STATUS_COLORS[v.status] || "hsl(var(--primary))";
              return (
                <g key={v.id} onClick={() => setSelectedVessel(isSelected ? null : v)} className="cursor-pointer">
                  {/* Pulse ring */}
                  {v.status === "At Sea" && (
                    <circle cx={pos.x} cy={pos.y} r="10" fill={color} opacity="0.15">
                      <animate attributeName="r" values="6;14;6" dur="3s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.2;0;0.2" dur="3s" repeatCount="indefinite" />
                    </circle>
                  )}
                  {/* Selection ring */}
                  {isSelected && <circle cx={pos.x} cy={pos.y} r="12" fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeDasharray="3 2" />}
                  {/* Vessel dot */}
                  <circle cx={pos.x} cy={pos.y} r="5" fill={color} stroke="hsl(var(--background))" strokeWidth="1.5" />
                  {/* Heading indicator */}
                  <line
                    x1={pos.x} y1={pos.y}
                    x2={pos.x + Math.sin(v.heading * Math.PI / 180) * 10}
                    y2={pos.y - Math.cos(v.heading * Math.PI / 180) * 10}
                    stroke={color} strokeWidth="1.5" opacity="0.6"
                  />
                  {/* Label */}
                  <text x={pos.x + 8} y={pos.y + 3} fontSize="7" fill="hsl(var(--foreground))" fontWeight={isSelected ? "bold" : "normal"}>
                    {v.name.replace(/^(MV|MT)\s/, "")}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Selected vessel detail */}
        {selectedVessel && (
          <div className="p-3 rounded-lg bg-muted/40 border border-border/30 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <p className="text-muted-foreground">Navio</p>
              <p className="font-semibold text-foreground">{selectedVessel.name}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Status</p>
              <Badge variant="outline" className="text-xs mt-0.5">{selectedVessel.status}</Badge>
            </div>
            <div>
              <p className="text-muted-foreground">Velocidade</p>
              <p className="font-semibold text-foreground">{selectedVessel.speed.toFixed(1)} kn</p>
            </div>
            <div>
              <p className="text-muted-foreground">Destino / ETA</p>
              <p className="font-semibold text-foreground">{selectedVessel.destination} — {selectedVessel.eta}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Posição</p>
              <p className="font-mono text-foreground">{selectedVessel.lat.toFixed(2)}°, {selectedVessel.lng.toFixed(2)}°</p>
            </div>
            <div>
              <p className="text-muted-foreground">Heading</p>
              <p className="font-semibold text-foreground">{selectedVessel.heading}°</p>
            </div>
            <div>
              <p className="text-muted-foreground">IMO</p>
              <p className="font-mono text-foreground">{selectedVessel.imo}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Última Atualização</p>
              <p className="text-foreground">{selectedVessel.lastUpdate}</p>
            </div>
          </div>
        )}

        {/* Geospatial Alerts */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <AlertTriangle className="h-4 w-4 text-destructive" /> Alertas Geoespaciais
          </h4>
          {alerts.map((a, i) => (
            <div key={i} className={`flex items-start gap-2 p-2 rounded text-xs border ${
              a.severity === "critical" ? "border-destructive/30 bg-destructive/5" :
              a.severity === "warning" ? "border-chart-4/30 bg-chart-4/5" : "border-border/30 bg-muted/20"
            }`}>
              <Badge variant={a.severity === "critical" ? "destructive" : "outline"} className="text-[10px] shrink-0">{a.type}</Badge>
              <div>
                <span className="font-medium text-foreground">{a.vessel}:</span>{" "}
                <span className="text-muted-foreground">{a.message}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default FleetMapIntelligence;
