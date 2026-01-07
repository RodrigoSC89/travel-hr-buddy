/**
 * Vessel Digital Twin 2D Fallback
 * Pure CSS/SVG visualization when 3D is not available
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Ship, 
  Activity,
  Gauge,
  Fuel,
  Anchor,
  Navigation,
  CheckCircle
} from 'lucide-react';
import type { VesselState } from '@/lib/ai/autonomous';
import { cn } from '@/lib/utils';

interface VesselDigitalTwin2DProps {
  vesselState?: Partial<VesselState>;
}

export const VesselDigitalTwin2D: React.FC<VesselDigitalTwin2DProps> = ({
  vesselState
}) => {
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Use actual VesselState properties
  const speed = vesselState?.speed ?? 12.5;
  const heading = vesselState?.heading ?? 245;
  const fuelOnBoard = vesselState?.fuelOnBoard ?? 850000;
  const initialFuel = vesselState?.initialFuel ?? 1000000;
  const fuelPercent = initialFuel > 0 ? Math.round((fuelOnBoard / initialFuel) * 100) : 0;
  const position = vesselState?.position ?? { lat: 25.7617, lng: -80.1918 };
  const equipment = vesselState?.equipment ?? [];
  
  // Derive engine status from equipment
  const mainEngine = equipment.find(e => e.type === 'Main Engine' || e.name.includes('Engine'));
  const engineStatus = mainEngine?.status ?? 'operational';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'text-green-500';
      case 'degraded': return 'text-yellow-500';
      case 'critical': return 'text-orange-500';
      case 'offline': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'operational': return 'default';
      case 'degraded': return 'secondary';
      case 'critical': return 'outline';
      case 'offline': return 'destructive';
      default: return 'secondary';
    }
  };

  const isEngineRunning = engineStatus === 'operational' || engineStatus === 'degraded';

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Ship className="h-5 w-5 text-primary" />
            Digital Twin 2D
          </CardTitle>
          <Badge variant={getStatusBadge(engineStatus)}>
            {engineStatus.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Vessel Visualization */}
        <div className="relative bg-gradient-to-b from-blue-900/20 to-blue-950/40 rounded-lg p-8 min-h-[300px] overflow-hidden">
          {/* Animated Water Background */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="absolute w-full h-8 opacity-20"
                style={{
                  bottom: `${i * 20}%`,
                  background: 'linear-gradient(90deg, transparent 0%, hsl(var(--primary)) 50%, transparent 100%)',
                  transform: `translateX(${Math.sin((animationPhase + i * 30) * Math.PI / 180) * 20}px)`,
                  transition: 'transform 0.5s ease-out'
                }}
              />
            ))}
          </div>

          {/* Vessel SVG */}
          <svg 
            viewBox="0 0 200 100" 
            className="relative z-10 w-full max-w-md mx-auto"
            style={{
              transform: `rotate(${Math.sin(animationPhase * Math.PI / 180) * 2}deg)`,
              transition: 'transform 0.3s ease-out'
            }}
          >
            {/* Hull */}
            <path
              d="M20 60 L40 80 L160 80 L180 60 L170 40 L30 40 Z"
              fill="hsl(var(--primary))"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              opacity="0.9"
            />
            {/* Bridge */}
            <rect x="70" y="25" width="60" height="35" rx="5" fill="hsl(var(--secondary))" />
            {/* Windows */}
            <rect x="80" y="30" width="10" height="8" rx="2" fill="hsl(var(--background))" />
            <rect x="95" y="30" width="10" height="8" rx="2" fill="hsl(var(--background))" />
            <rect x="110" y="30" width="10" height="8" rx="2" fill="hsl(var(--background))" />
            {/* Smoke Stack */}
            <rect x="140" y="15" width="10" height="25" fill="hsl(var(--muted))" />
            {/* Engine Glow */}
            {isEngineRunning && (
              <circle
                cx="30"
                cy="60"
                r="8"
                fill="hsl(var(--chart-1))"
                opacity={0.5 + Math.sin(animationPhase * Math.PI / 30) * 0.3}
              />
            )}
            {/* Propeller Animation */}
            {isEngineRunning && (
              <g transform={`translate(20, 70) rotate(${animationPhase * 3})`}>
                <line x1="-8" y1="0" x2="8" y2="0" stroke="hsl(var(--foreground))" strokeWidth="2" />
                <line x1="0" y1="-8" x2="0" y2="8" stroke="hsl(var(--foreground))" strokeWidth="2" />
              </g>
            )}
          </svg>

          {/* Status Indicators */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <div className={cn(
              "flex items-center gap-1 text-xs",
              isEngineRunning ? "text-green-500" : "text-muted-foreground"
            )}>
              <CheckCircle className="h-3 w-3" />
              Engine
            </div>
            <div className={cn(
              "flex items-center gap-1 text-xs",
              fuelPercent > 20 ? "text-green-500" : "text-yellow-500"
            )}>
              <Fuel className="h-3 w-3" />
              Fuel OK
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="p-3 bg-muted/50">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Gauge className="h-3 w-3" />
              Velocidade
            </div>
            <div className="text-lg font-bold">{speed.toFixed(1)} kts</div>
          </Card>

          <Card className="p-3 bg-muted/50">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Navigation className="h-3 w-3" />
              Heading
            </div>
            <div className="text-lg font-bold">{heading}°</div>
          </Card>

          <Card className="p-3 bg-muted/50">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Fuel className="h-3 w-3" />
              Combustível
            </div>
            <div className="text-lg font-bold">{fuelPercent}%</div>
            <Progress value={fuelPercent} className="h-1 mt-1" />
          </Card>

          <Card className="p-3 bg-muted/50">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Activity className="h-3 w-3" />
              Status
            </div>
            <div className={cn("text-lg font-bold capitalize", getStatusColor(engineStatus))}>
              {engineStatus}
            </div>
          </Card>
        </div>

        {/* Position Info */}
        <div className="flex items-center justify-between text-sm text-muted-foreground bg-muted/30 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <Anchor className="h-4 w-4" />
            <span>Posição:</span>
          </div>
          <span className="font-mono">
            {position.lat.toFixed(4)}°N, {Math.abs(position.lng).toFixed(4)}°W
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default VesselDigitalTwin2D;
