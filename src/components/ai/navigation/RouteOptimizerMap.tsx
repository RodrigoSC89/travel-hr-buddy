/**
 * Route Optimizer Map - Placeholder for route optimization visualization
 */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Navigation, Fuel, Clock, MapPin, Play, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface OptimizedRoute {
  totalDistance: number;
  estimatedDuration: number;
  fuelConsumption: number;
  fuelSavings: number;
  waypoints: Array<{
    name: string;
    lat: number;
    lon: number;
    eta: Date;
  }>;
  weatherAlerts: number;
  optimizationScore: number;
}

interface RouteOptimizerMapProps {
  route?: OptimizedRoute;
  isLoading?: boolean;
  onOptimize?: () => void;
  className?: string;
}

export function RouteOptimizerMap({ route, isLoading, onOptimize, className }: RouteOptimizerMapProps) {
  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="animate-pulse h-[300px] bg-muted rounded" />
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
              <Navigation className="h-5 w-5" />
              Route Optimizer
            </CardTitle>
            <CardDescription>Otimização weather/fuel/ETA</CardDescription>
          </div>
          {route && (
            <Badge variant="outline" className="bg-green-500/10 text-green-500">
              {route.optimizationScore}% otimizado
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Map Placeholder */}
        <div className="h-[200px] bg-gradient-to-br from-blue-950 to-slate-900 rounded-lg relative overflow-hidden">
          {/* Simple route visualization */}
          <svg className="w-full h-full" viewBox="0 0 400 200">
            {/* Grid lines */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            
            {/* Route line */}
            {route && (
              <>
                <path
                  d="M 50,150 Q 150,50 200,100 T 350,50"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="3"
                  strokeDasharray="5,5"
                  className="animate-pulse"
                />
                {/* Waypoints */}
                <circle cx="50" cy="150" r="6" fill="#22c55e" />
                <circle cx="200" cy="100" r="4" fill="#3b82f6" />
                <circle cx="350" cy="50" r="6" fill="#ef4444" />
              </>
            )}
          </svg>
          
          {/* Legend */}
          <div className="absolute bottom-2 left-2 flex gap-3 text-xs text-white/70">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500" /> Origem
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500" /> Destino
            </span>
          </div>
        </div>

        {/* Route Stats */}
        {route ? (
          <>
            <div className="grid grid-cols-4 gap-2">
              <div className="text-center p-2 bg-muted/50 rounded">
                <MapPin className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                <div className="text-sm font-medium">{route.totalDistance} NM</div>
                <p className="text-xs text-muted-foreground">Distância</p>
              </div>
              <div className="text-center p-2 bg-muted/50 rounded">
                <Clock className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                <div className="text-sm font-medium">{route.estimatedDuration}h</div>
                <p className="text-xs text-muted-foreground">Duração</p>
              </div>
              <div className="text-center p-2 bg-muted/50 rounded">
                <Fuel className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                <div className="text-sm font-medium">{route.fuelConsumption} MT</div>
                <p className="text-xs text-muted-foreground">Combustível</p>
              </div>
              <div className="text-center p-2 bg-muted/50 rounded">
                <Fuel className="h-4 w-4 mx-auto mb-1 text-green-500" />
                <div className="text-sm font-medium text-green-500">-{route.fuelSavings}%</div>
                <p className="text-xs text-muted-foreground">Economia</p>
              </div>
            </div>

            {/* Waypoints */}
            <div className="space-y-1">
              <p className="text-sm font-medium">Waypoints</p>
              {route.waypoints.slice(0, 3).map((wp, i) => (
                <div key={i} className="flex items-center justify-between text-sm p-2 bg-muted/30 rounded">
                  <span className="flex items-center gap-2">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      i === 0 ? "bg-green-500" : 
                      i === route.waypoints.length - 1 ? "bg-red-500" : "bg-blue-500"
                    )} />
                    {wp.name}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {wp.lat.toFixed(2)}°, {wp.lon.toFixed(2)}°
                  </span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            <p>Configure origem e destino para otimizar</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button className="flex-1" onClick={onOptimize}>
            <Play className="h-4 w-4 mr-2" />
            {route ? 'Reotimizar' : 'Otimizar Rota'}
          </Button>
          {route && (
            <Button variant="outline" onClick={onOptimize}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default RouteOptimizerMap;
