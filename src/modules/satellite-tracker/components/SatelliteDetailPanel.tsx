/**
 * Satellite Detail Panel Component
 * Shows detailed information about a selected satellite
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Satellite, 
  MapPin, 
  Zap, 
  Globe, 
  Clock, 
  Radio,
  Eye,
  Flag,
  Target,
  Calendar
} from "lucide-react";
import type { DemoSatellite } from "../data/demo-satellites";

interface SatelliteDetailPanelProps {
  satellite: DemoSatellite;
}

export const SatelliteDetailPanel: React.FC<SatelliteDetailPanelProps> = ({ satellite }) => {
  const getOrbitColor = (orbit: string) => {
    switch (orbit) {
    case "LEO": return "bg-blue-500";
    case "MEO": return "bg-green-500";
    case "GEO": return "bg-purple-500";
    case "HEO": return "bg-orange-500";
    default: return "bg-gray-500";
    }
  };

  const getVisibilityStatus = (visibility: string) => {
    switch (visibility) {
    case "visible": return { label: "Visível", color: "text-green-500" };
    case "eclipsed": return { label: "Eclipsado", color: "text-gray-500" };
    case "daylight": return { label: "Luz do dia", color: "text-yellow-500" };
    default: return { label: visibility, color: "text-muted-foreground" };
    }
  };

  const visibilityStatus = getVisibilityStatus(satellite.visibility);

  // Calculate signal strength based on altitude and visibility
  const signalStrength = satellite.visibility === "visible" 
    ? Math.min(100, Math.max(60, 100 - (satellite.altitude_km / 500)))
    : Math.min(80, Math.max(40, 80 - (satellite.altitude_km / 500)));

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Satellite className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{satellite.satellite_name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={getOrbitColor(satellite.orbit_type)}>
                  {satellite.orbit_type}
                </Badge>
                <Badge variant={satellite.status === "active" ? "default" : "secondary"}>
                  {satellite.status === "active" ? "Ativo" : satellite.status}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Position Info */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <MapPin className="h-3 w-3" />
              Latitude
            </div>
            <div className="text-lg font-semibold">{satellite.latitude.toFixed(4)}°</div>
          </div>
          
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <MapPin className="h-3 w-3" />
              Longitude
            </div>
            <div className="text-lg font-semibold">{satellite.longitude.toFixed(4)}°</div>
          </div>
          
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Globe className="h-3 w-3" />
              Altitude
            </div>
            <div className="text-lg font-semibold">{satellite.altitude_km.toFixed(0)} km</div>
          </div>
          
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Zap className="h-3 w-3" />
              Velocidade
            </div>
            <div className="text-lg font-semibold">{satellite.velocity_kmh.toFixed(0)} km/h</div>
          </div>
        </div>

        {/* Orbital Parameters */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Parâmetros Orbitais</h4>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-xs text-muted-foreground">Período</div>
                <div className="text-sm font-medium">{satellite.period_min.toFixed(1)} min</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-xs text-muted-foreground">Inclinação</div>
                <div className="text-sm font-medium">{satellite.inclination_deg}°</div>
              </div>
            </div>
          </div>
        </div>

        {/* Visibility & Signal */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Status de Comunicação</h4>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className={`h-4 w-4 ${visibilityStatus.color}`} />
              <span className="text-sm">{visibilityStatus.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <Radio className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Sinal: {signalStrength.toFixed(0)}%</span>
            </div>
          </div>
          
          <Progress value={signalStrength} className="h-2" />
        </div>

        {/* Mission Info */}
        <div className="space-y-3 border-t pt-3">
          <h4 className="text-sm font-medium">Informações da Missão</h4>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Flag className="h-4 w-4 text-muted-foreground" />
              <div>
                <span className="text-xs text-muted-foreground">País/Operador:</span>
                <span className="text-sm ml-2">{satellite.country}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <div>
                <span className="text-xs text-muted-foreground">Missão:</span>
                <span className="text-sm ml-2">{satellite.purpose}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <span className="text-xs text-muted-foreground">Lançamento:</span>
                <span className="text-sm ml-2">
                  {new Date(satellite.launch_date).toLocaleDateString("pt-BR")}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Radio className="h-4 w-4 text-muted-foreground" />
              <div>
                <span className="text-xs text-muted-foreground">NORAD ID:</span>
                <span className="text-sm ml-2">{satellite.norad_id}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Last Update */}
        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          Última atualização: {new Date(satellite.timestamp).toLocaleString("pt-BR")}
        </div>
      </CardContent>
    </Card>
  );
};
