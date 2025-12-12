/**
 * PATCH 501: Coverage Map Component
 * Displays satellite coverage area
 */

import React from "react";
import { Card } from "@/components/ui/card";
import { Globe } from "lucide-react";

interface CoverageMapProps {
  satellite: {
    id: string;
    name: string;
    position?: {
      altitude: number;
    };
  };
}

export const CoverageMap: React.FC<CoverageMapProps> = ({ satellite }) => {
  const { position } = satellite;
  
  // Calculate coverage radius (simplified)
  const coverageRadius = position?.altitude 
    ? Math.sqrt(2 * 6371 * position.altitude + position.altitude * position.altitude).toFixed(0)
    : "N/A";

  const coverageArea = position?.altitude
    ? (Math.PI * Math.pow(parseFloat(coverageRadius), 2) / 1000000).toFixed(2)
    : "N/A";

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg p-8 flex items-center justify-center min-h-[300px]">
        <div className="text-center space-y-4">
          <Globe className="h-16 w-16 mx-auto text-primary" />
          <div>
            <h3 className="font-semibold text-lg">{satellite.name}</h3>
            <p className="text-sm text-muted-foreground">Área de Cobertura</p>
          </div>
        </div>
      </div>

      {position && (
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Raio de Cobertura</div>
            <div className="text-2xl font-bold">{coverageRadius} km</div>
          </Card>
          
          <Card className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Área de Cobertura</div>
            <div className="text-2xl font-bold">{coverageArea} M km²</div>
          </Card>
        </div>
      )}
    </div>
  );
});
