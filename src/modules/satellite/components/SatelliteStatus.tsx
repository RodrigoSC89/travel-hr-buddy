import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Satellite, Signal, Battery, Thermometer } from "lucide-react";

interface SatelliteData {
  id: string;
  name: string;
  status: "active" | "standby" | "offline";
  signalStrength: number;
  battery: number;
  temperature: number;
  lastContact: string;
}

interface SatelliteStatusProps {
  satellites: SatelliteData[];
}

export const SatelliteStatus = memo(function({ satellites }: SatelliteStatusProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
    case "active": return "default";
    case "standby": return "secondary";
    case "offline": return "destructive";
    default: return "secondary";
    }
  };

  const getSignalColor = (strength: number) => {
    if (strength >= 80) return "text-success";
    if (strength >= 50) return "text-warning";
    return "text-destructive";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {satellites.map((satellite) => (
        <Card key={satellite.id}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Satellite className="h-5 w-5" />
                {satellite.name}
              </CardTitle>
              <Badge variant={getStatusColor(satellite.status)}>
                {satellite.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Signal className={`h-4 w-4 ${getSignalColor(satellite.signalStrength)}`} />
                  <span className="text-sm">Sinal</span>
                </div>
                <span className={`font-medium ${getSignalColor(satellite.signalStrength)}`}>
                  {satellite.signalStrength}%
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Battery className="h-4 w-4" />
                  <span className="text-sm">Bateria</span>
                </div>
                <span className="font-medium">{satellite.battery}%</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Thermometer className="h-4 w-4" />
                  <span className="text-sm">Temperatura</span>
                </div>
                <span className="font-medium">{satellite.temperature}°C</span>
              </div>

              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  Último contato: {new Date(satellite.lastContact).toLocaleString("pt-BR")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
