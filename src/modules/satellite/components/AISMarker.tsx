/**
 * AIS Marker Component
 * Displays real-time vessel positions on the satellite tracker map
 * Patch 141.0
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ship, Navigation, Anchor } from "lucide-react";
import type { VesselPosition } from "@/lib/aisClient";

interface AISMarkerProps {
  vessels: VesselPosition[];
  onVesselClick?: (vessel: VesselPosition) => void;
}

export const AISMarker: React.FC<AISMarkerProps> = ({ vessels, onVesselClick }) => {
  const getStatusIcon = (status: VesselPosition['status']) => {
    switch (status) {
      case 'at_anchor':
      case 'moored':
        return <Anchor className="h-4 w-4" />;
      case 'underway':
        return <Navigation className="h-4 w-4" />;
      default:
        return <Ship className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: VesselPosition['status']) => {
    switch (status) {
      case 'underway':
        return 'text-green-500';
      case 'at_anchor':
      case 'moored':
        return 'text-blue-500';
      case 'not_under_command':
      case 'restricted_maneuverability':
        return 'text-orange-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusLabel = (status: VesselPosition['status']) => {
    switch (status) {
      case 'underway':
        return 'Em Navegação';
      case 'at_anchor':
        return 'Ancorado';
      case 'moored':
        return 'Atracado';
      case 'not_under_command':
        return 'Sem Comando';
      case 'restricted_maneuverability':
        return 'Manobra Restrita';
      default:
        return 'Desconhecido';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ship className="h-5 w-5" />
          Embarcações Rastreadas via AIS
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {vessels.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              Nenhuma embarcação detectada na área
            </div>
          ) : (
            vessels.map((vessel) => (
              <div
                key={vessel.mmsi}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                onClick={() => onVesselClick?.(vessel)}
              >
                <div className="flex items-center gap-3">
                  <div className={getStatusColor(vessel.status)}>
                    {getStatusIcon(vessel.status)}
                  </div>
                  <div>
                    <div className="font-medium">{vessel.name}</div>
                    <div className="text-xs text-muted-foreground">
                      MMSI: {vessel.mmsi} • {vessel.type}
                    </div>
                  </div>
                </div>
                <div className="text-right text-sm">
                  <div className={getStatusColor(vessel.status)}>
                    {getStatusLabel(vessel.status)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {vessel.speed.toFixed(1)} kn
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {vessels.length > 0 && (
          <div className="mt-4 text-xs text-muted-foreground text-center">
            Última atualização: {new Date().toLocaleTimeString('pt-BR')}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface AISMapOverlayProps {
  vessel: VesselPosition;
  onClose: () => void;
}

export const AISMapOverlay: React.FC<AISMapOverlayProps> = ({ vessel, onClose }) => {
  return (
    <div className="absolute top-4 right-4 z-10 w-80">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{vessel.name}</CardTitle>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              ✕
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">MMSI:</span>
              <div className="font-medium">{vessel.mmsi}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Tipo:</span>
              <div className="font-medium">{vessel.type}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Velocidade:</span>
              <div className="font-medium">{vessel.speed.toFixed(1)} kn</div>
            </div>
            <div>
              <span className="text-muted-foreground">Rumo:</span>
              <div className="font-medium">{vessel.course.toFixed(0)}°</div>
            </div>
            <div>
              <span className="text-muted-foreground">Posição:</span>
              <div className="font-medium text-xs">
                {vessel.latitude.toFixed(4)}°, {vessel.longitude.toFixed(4)}°
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Status:</span>
              <div className="font-medium capitalize">
                {vessel.status.replace(/_/g, ' ')}
              </div>
            </div>
          </div>
          <div className="pt-2 text-xs text-muted-foreground">
            Atualizado: {new Date(vessel.timestamp).toLocaleString('pt-BR')}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
