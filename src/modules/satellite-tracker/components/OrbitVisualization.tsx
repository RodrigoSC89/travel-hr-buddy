/**
 * PATCH 501: Orbit Visualization Component
 * Displays satellite orbit path
 */

import React from "react";
import { Card } from "@/components/ui/card";
import { Activity } from "lucide-react";

interface OrbitVisualizationProps {
  satellite: {
    id: string;
    name: string;
    position?: {
      altitude: number;
      velocity?: number;
    };
  };
}

export const OrbitVisualization: React.FC<OrbitVisualizationProps> = ({ satellite }) => {
  const { position } = satellite;

  // Calculate orbital parameters
  const orbitalPeriod = position?.altitude 
    ? ((2 * Math.PI * Math.sqrt(Math.pow((6371 + position.altitude), 3) / 398600)) / 60).toFixed(2)
    : "N/A";

  return (
    <div className="space-y-4">
      <div className="bg-muted/50 rounded-lg p-8 flex items-center justify-center min-h-[300px]">
        <div className="text-center space-y-4">
          <Activity className="h-16 w-16 mx-auto text-primary animate-pulse" />
          <div>
            <h3 className="font-semibold text-lg">{satellite.name}</h3>
            <p className="text-sm text-muted-foreground">Visualização de órbita</p>
          </div>
        </div>
      </div>

      {position && (
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Altitude</div>
            <div className="text-2xl font-bold">{position.altitude.toFixed(1)} km</div>
          </Card>
          
          <Card className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Período Orbital</div>
            <div className="text-2xl font-bold">{orbitalPeriod} min</div>
          </Card>
          
          <Card className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Velocidade</div>
            <div className="text-2xl font-bold">
              {position.velocity?.toFixed(2) || "N/A"} km/s
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Tipo de Órbita</div>
            <div className="text-2xl font-bold">
              {position.altitude < 2000 ? "LEO" : position.altitude < 35786 ? "MEO" : "GEO"}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
