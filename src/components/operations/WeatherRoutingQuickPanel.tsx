/**
 * Weather Routing Quick Panel - Compact weather + ECA zone overview for Ops Hub
 */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Cloud, Wind, Waves, Thermometer, Navigation, AlertTriangle, ExternalLink } from "lucide-react";
import { getSeaState, detectECAZones, type ECAZone } from "@/services/weather-gfs";

// Quick display conditions (in production, from GFS API)
const CURRENT_CONDITIONS = {
  windSpeed: 18,
  waveHeight: 2.1,
  seaTemp: 22,
  visibility: 12,
};

// Sample ECA zones for display
const SAMPLE_ECA_ZONES = detectECAZones([
  { lat: 55, lon: 10 },   // Baltic
  { lat: 50, lon: -2 },   // North Sea
  { lat: 35, lon: -75 },  // US East Coast
]);

const SEA_STATE_LABELS: Record<string, string> = {
  calm: "Calmo",
  smooth: "Suave",
  slight: "Leve",
  moderate: "Moderado",
  rough: "Agitado",
  very_rough: "Muito Agitado",
  high: "Alto",
  phenomenal: "Fenomenal",
};

export default function WeatherRoutingQuickPanel() {
  const navigate = useNavigate();
  const seaState = getSeaState(CURRENT_CONDITIONS.waveHeight);

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cloud className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Weather & Routing Intelligence</CardTitle>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/weather-routing')} className="gap-1.5">
            <ExternalLink className="h-3.5 w-3.5" />
            Detalhes
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Conditions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 text-center">
            <Wind className="h-4 w-4 mx-auto mb-1 text-primary" />
            <p className="text-lg font-bold text-foreground">{CURRENT_CONDITIONS.windSpeed} kn</p>
            <p className="text-[10px] text-muted-foreground">Vento</p>
          </div>
          <div className="p-3 rounded-lg bg-info/5 border border-info/10 text-center">
            <Waves className="h-4 w-4 mx-auto mb-1 text-info" />
            <p className="text-lg font-bold text-foreground">{CURRENT_CONDITIONS.waveHeight}m</p>
            <p className="text-[10px] text-muted-foreground">{SEA_STATE_LABELS[seaState] || seaState}</p>
          </div>
          <div className="p-3 rounded-lg bg-warning/5 border border-warning/10 text-center">
            <Thermometer className="h-4 w-4 mx-auto mb-1 text-warning" />
            <p className="text-lg font-bold text-foreground">{CURRENT_CONDITIONS.seaTemp}°C</p>
            <p className="text-[10px] text-muted-foreground">Sea Temp</p>
          </div>
          <div className="p-3 rounded-lg bg-success/5 border border-success/10 text-center">
            <Navigation className="h-4 w-4 mx-auto mb-1 text-success" />
            <p className="text-lg font-bold text-foreground">{CURRENT_CONDITIONS.visibility} nm</p>
            <p className="text-[10px] text-muted-foreground">Visibilidade</p>
          </div>
        </div>

        {/* ECA Zones Active */}
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 text-warning" />
            Zonas ECA Monitoradas ({SAMPLE_ECA_ZONES.length})
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {SAMPLE_ECA_ZONES.map((zone: ECAZone) => (
              <Badge key={zone.name} variant="outline" className="text-xs bg-warning/5 border-warning/20 text-warning">
                {zone.name} — {zone.type}
              </Badge>
            ))}
          </div>
        </div>

        {/* CII Advisory */}
        <div className="p-3 rounded-lg bg-accent/5 border border-accent/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">CII Speed Advisory</p>
              <p className="text-xs text-muted-foreground">Velocidade ótima para manter rating B</p>
            </div>
            <Badge className="bg-success/10 text-success border-success/20">
              12.5 kn recomendado
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
