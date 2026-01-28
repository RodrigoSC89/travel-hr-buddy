/**
 * Digital Twin Viewer - 3D vessel visualization placeholder
 */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Box, Activity, Gauge, Thermometer, Droplets, Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface TwinState {
  vesselId: string;
  vesselName: string;
  position: { lat: number; lon: number; heading: number };
  speed: number;
  fuel: number;
  components: Array<{
    id: string;
    name: string;
    type: string;
    health: number;
    temperature?: number;
    pressure?: number;
  }>;
  lastSync: Date;
}

interface DigitalTwinViewerProps {
  twinState?: TwinState;
  isLoading?: boolean;
  onRunSimulation?: () => void;
  className?: string;
}

export function DigitalTwinViewer({ 
  twinState, 
  isLoading,
  onRunSimulation,
  className 
}: DigitalTwinViewerProps) {
  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="animate-pulse h-[300px] bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  if (!twinState) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-center py-12 text-muted-foreground">
            <Box className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Digital Twin Engine</p>
            <p className="text-sm">Selecione uma embarcação para visualizar</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Box className="h-5 w-5" />
              {twinState.vesselName}
            </CardTitle>
            <CardDescription>Digital Twin - Réplica Virtual</CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-green-500/10 text-green-500">
              <Activity className="h-3 w-3 mr-1" />
              Sync
            </Badge>
            {onRunSimulation && (
              <Button size="sm" variant="outline" onClick={onRunSimulation}>
                <Play className="h-4 w-4 mr-1" />
                Simular
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 3D Viewer Placeholder */}
        <div className="h-[200px] bg-gradient-to-br from-blue-950 to-slate-900 rounded-lg flex items-center justify-center relative overflow-hidden">
          {/* Simple vessel representation */}
          <div className="relative">
            <div className="w-32 h-12 bg-slate-700 rounded-full transform rotate-12 relative">
              <div className="absolute top-1 left-4 w-4 h-4 bg-slate-600 rounded" />
              <div className="absolute top-0 left-12 w-3 h-8 bg-slate-600 rounded-t" />
            </div>
          </div>
          
          {/* Position overlay */}
          <div className="absolute bottom-2 left-2 text-xs text-white/70">
            {twinState.position.lat.toFixed(4)}°, {twinState.position.lon.toFixed(4)}°
          </div>
          <div className="absolute bottom-2 right-2 text-xs text-white/70">
            HDG: {twinState.position.heading}° | SPD: {twinState.speed} kn
          </div>
        </div>

        {/* Tabs for different views */}
        <Tabs defaultValue="components" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="components">Componentes</TabsTrigger>
            <TabsTrigger value="sensors">Sensores</TabsTrigger>
            <TabsTrigger value="metrics">Métricas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="components" className="mt-4">
            <div className="space-y-2">
              {twinState.components.slice(0, 5).map((component) => (
                <div 
                  key={component.id}
                  className="flex items-center justify-between p-2 bg-muted/50 rounded"
                >
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      component.health >= 80 ? "bg-green-500" :
                      component.health >= 50 ? "bg-yellow-500" : "bg-red-500"
                    )} />
                    <span className="text-sm">{component.name}</span>
                  </div>
                  <Badge variant="outline">{component.health}%</Badge>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="sensors" className="mt-4">
            <div className="grid grid-cols-3 gap-3">
              {twinState.components.filter(c => c.temperature !== undefined).slice(0, 3).map((c) => (
                <div key={c.id} className="text-center p-3 bg-muted/50 rounded">
                  <Thermometer className="h-4 w-4 mx-auto mb-1 text-orange-500" />
                  <div className="text-lg font-medium">{c.temperature}°C</div>
                  <p className="text-xs text-muted-foreground truncate">{c.name}</p>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="metrics" className="mt-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-muted/50 rounded">
                <Gauge className="h-4 w-4 mx-auto mb-1" />
                <div className="text-lg font-medium">{twinState.speed} kn</div>
                <p className="text-xs text-muted-foreground">Velocidade</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded">
                <Droplets className="h-4 w-4 mx-auto mb-1 text-blue-500" />
                <div className="text-lg font-medium">{twinState.fuel}%</div>
                <p className="text-xs text-muted-foreground">Combustível</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <p className="text-[10px] text-muted-foreground text-center">
          Última sincronização: {twinState.lastSync.toLocaleString('pt-BR')}
        </p>
      </CardContent>
    </Card>
  );
}

export default DigitalTwinViewer;
