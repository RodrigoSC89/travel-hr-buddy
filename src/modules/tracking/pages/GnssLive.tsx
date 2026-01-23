/**
 * GNSS Live Tracking - Simplified
 */
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  MapPin, Satellite, Navigation, Signal, 
  Crosshair, Activity, Eye, Map, Target
} from "lucide-react";

// Simulated positions
const DEMO_POSITIONS = [
  { id: 1, name: "DGPS Alpha", lat: -23.5505, lng: -46.6333, accuracy: 0.8, type: "dgps", speed: 12.5 },
  { id: 2, name: "RTK Beta", lat: -22.9068, lng: -43.1729, accuracy: 0.02, type: "rtk", speed: 8.2 },
  { id: 3, name: "PPP Delta", lat: -25.4284, lng: -49.2733, accuracy: 0.05, type: "ppp", speed: 15.8 },
  { id: 4, name: "Marine Gamma", lat: -3.1190, lng: -60.0217, accuracy: 1.5, type: "dgps", speed: 22.3 },
];

const DEMO_LOGS = [
  { id: "log-1", latitude: -23.5505, longitude: -46.6333, accuracy: 0.8, fix_type: "RTK_FIXED", satellites_used: 14, hdop: 0.8, correction_source: "RBMC" },
  { id: "log-2", latitude: -22.9068, longitude: -43.1729, accuracy: 0.02, fix_type: "RTK_FIXED", satellites_used: 18, hdop: 0.5, correction_source: "IBGE-PPP" },
  { id: "log-3", latitude: -25.4284, longitude: -49.2733, accuracy: 0.05, fix_type: "PPP", satellites_used: 22, hdop: 0.6, correction_source: "Oceanix" },
  { id: "log-4", latitude: -3.1190, longitude: -60.0217, accuracy: 1.5, fix_type: "DGPS", satellites_used: 8, hdop: 1.8, correction_source: "GPS" },
];

export default function GnssLive() {
  const [selectedPosition, setSelectedPosition] = useState<typeof DEMO_POSITIONS[0] | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const positions = DEMO_POSITIONS;
  const logs = DEMO_LOGS;

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const getSignalQuality = (accuracy: number) => {
    if (accuracy <= 0.05) return { level: "Excelente", color: "text-success", percent: 95 };
    if (accuracy <= 0.5) return { level: "Ótimo", color: "text-primary", percent: 80 };
    if (accuracy <= 2) return { level: "Bom", color: "text-warning", percent: 60 };
    return { level: "Regular", color: "text-destructive", percent: 40 };
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-primary to-primary/60 rounded-xl shadow-lg">
            <Navigation className="h-8 w-8 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">GNSS Live Tracking</h1>
            <p className="text-muted-foreground">Posicionamento em Tempo Real</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted border">
            <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
            <span className="text-sm font-medium">Live</span>
            <span className="text-xs text-muted-foreground">
              {currentTime.toLocaleTimeString('pt-BR')}
            </span>
          </div>
          <Badge variant="outline">Tempo Real</Badge>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Placeholder */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Map className="h-5 w-5" />
              Mapa de Posições
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] rounded-lg overflow-hidden border bg-muted/30 flex items-center justify-center">
              {selectedPosition ? (
                <div className="text-center space-y-4">
                  <MapPin className="h-16 w-16 mx-auto text-primary" />
                  <div>
                    <p className="font-bold text-xl">{selectedPosition.name}</p>
                    <p className="text-muted-foreground font-mono">
                      {selectedPosition.lat.toFixed(6)}°, {selectedPosition.lng.toFixed(6)}°
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Velocidade: {selectedPosition.speed} nós | Precisão: ±{selectedPosition.accuracy}m
                    </p>
                  </div>
                  <Badge variant="secondary" className="uppercase">{selectedPosition.type}</Badge>
                </div>
              ) : (
                <div className="text-center space-y-2">
                  <Satellite className="h-16 w-16 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">Selecione um dispositivo abaixo</p>
                </div>
              )}
            </div>
            
            {/* Position buttons */}
            <div className="flex flex-wrap gap-2 mt-4">
              {positions.map((pos) => (
                <Button 
                  key={pos.id} 
                  size="sm" 
                  variant={selectedPosition?.id === pos.id ? "default" : "outline"}
                  onClick={() => setSelectedPosition(pos)}
                >
                  <Crosshair className="h-3 w-3 mr-1" />
                  {pos.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Side Panel */}
        <div className="space-y-4">
          {selectedPosition ? (
            <Card className="border-primary/30">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Target className="h-5 w-5 text-primary" />
                  {selectedPosition.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Latitude</p>
                    <p className="font-mono font-semibold">{selectedPosition.lat.toFixed(6)}°</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Longitude</p>
                    <p className="font-mono font-semibold">{selectedPosition.lng.toFixed(6)}°</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Precisão</p>
                    <p className={`font-semibold ${getSignalQuality(selectedPosition.accuracy).color}`}>
                      ±{selectedPosition.accuracy}m
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Velocidade</p>
                    <p className="font-semibold">{selectedPosition.speed} nós</p>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Qualidade do Sinal</span>
                    <span className={getSignalQuality(selectedPosition.accuracy).color}>
                      {getSignalQuality(selectedPosition.accuracy).level}
                    </span>
                  </div>
                  <Progress value={getSignalQuality(selectedPosition.accuracy).percent} className="h-2" />
                </div>
                
                <Badge variant="secondary" className="w-full justify-center uppercase">
                  {selectedPosition.type}
                </Badge>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-8 text-center text-muted-foreground">
                <Eye className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Selecione um dispositivo</p>
              </CardContent>
            </Card>
          )}

          {/* Last Positions */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Últimas Posições
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {logs.map((log) => (
                  <div 
                    key={log.id}
                    className="text-sm p-3 border rounded-lg bg-muted/30 hover:bg-muted/50"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-mono text-xs">
                          {log.latitude.toFixed(6)}, {log.longitude.toFixed(6)}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-[10px] h-5">
                            {log.fix_type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {log.satellites_used} sats
                          </span>
                        </div>
                      </div>
                      <span className={`font-semibold text-xs ${getSignalQuality(log.accuracy).color}`}>
                        ±{log.accuracy.toFixed(2)}m
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Signal Quality */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Signal className="h-5 w-5" />
                Qualidade do Sinal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Satélites Visíveis</span>
                <Badge>{logs[0]?.satellites_used ?? 14}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">HDOP</span>
                <Badge variant="outline">{logs[0]?.hdop?.toFixed(2) ?? '0.80'}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Fonte de Correção</span>
                <Badge variant="secondary">{logs[0]?.correction_source ?? 'RBMC'}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Fix Type</span>
                <Badge className="bg-success">{logs[0]?.fix_type ?? 'RTK_FIXED'}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
