import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Wifi, Compass, Wind, Waves, Navigation, Activity } from "lucide-react";

interface TelemetryData {
  thrusters: number;
  power: number;
  heading: number;
  pitch: number;
  roll: number;
  heave: number;
  windSpeed: number;
  windDirection: number;
  currentSpeed: number;
  currentDirection: number;
  waveHeight: number;
  wavePeriod: number;
}

export default function DPRealtime() {
  const [telemetry, setTelemetry] = useState<TelemetryData>({
    thrusters: 5,
    power: 4.2,
    heading: 127.5,
    pitch: 0.5,
    roll: 1.2,
    heave: 0.3,
    windSpeed: 18,
    windDirection: 225,
    currentSpeed: 1.2,
    currentDirection: 180,
    waveHeight: 2.1,
    wavePeriod: 8,
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry(prev => ({
        ...prev,
        heading: prev.heading + (Math.random() - 0.5) * 0.5,
        pitch: Math.max(-5, Math.min(5, prev.pitch + (Math.random() - 0.5) * 0.2)),
        roll: Math.max(-5, Math.min(5, prev.roll + (Math.random() - 0.5) * 0.3)),
        heave: Math.max(0, Math.min(2, prev.heave + (Math.random() - 0.5) * 0.1)),
        power: Math.max(0, Math.min(10, prev.power + (Math.random() - 0.5) * 0.2)),
        windSpeed: Math.max(0, Math.min(40, prev.windSpeed + (Math.random() - 0.5) * 2)),
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Main Telemetry */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="text-primary" /> DP Realtime Telemetry
            <Badge className="ml-2 bg-emerald-100 text-emerald-700">Live</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Metric 
              icon={Activity}
              label="Thrusters Ativos" 
              value={`${telemetry.thrusters}`} 
              unit="/ 6"
              color="text-blue-500"
            />
            <Metric 
              icon={Activity}
              label="Potência Total" 
              value={telemetry.power.toFixed(1)} 
              unit="MW"
              color="text-amber-500"
            />
            <Metric 
              icon={Compass}
              label="Heading" 
              value={telemetry.heading.toFixed(1)} 
              unit="°"
              color="text-purple-500"
            />
            <Metric 
              icon={Navigation}
              label="Pitch" 
              value={telemetry.pitch.toFixed(2)} 
              unit="°"
              color="text-cyan-500"
            />
            <Metric 
              icon={Navigation}
              label="Roll" 
              value={telemetry.roll.toFixed(2)} 
              unit="°"
              color="text-pink-500"
            />
            <Metric 
              icon={Waves}
              label="Heave" 
              value={telemetry.heave.toFixed(2)} 
              unit="m"
              color="text-indigo-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Environmental Conditions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Wind className="h-5 w-5 text-blue-500" /> Vento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Velocidade</span>
                <span className="text-xl font-bold">{telemetry.windSpeed.toFixed(0)} knots</span>
              </div>
              <Progress value={(telemetry.windSpeed / 40) * 100} className="h-2" />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Direção</span>
                <span className="text-lg font-semibold">{telemetry.windDirection}°</span>
              </div>
              <div className="flex items-center justify-center">
                <div 
                  className="w-16 h-16 rounded-full border-2 border-primary flex items-center justify-center relative"
                >
                  <div 
                    className="absolute w-1 h-6 bg-primary rounded-full origin-bottom"
                    style={{ transform: `rotate(${telemetry.windDirection}deg)` }}
                  />
                  <span className="text-xs absolute -top-5">N</span>
                  <span className="text-xs absolute -bottom-5">S</span>
                  <span className="text-xs absolute -left-4">W</span>
                  <span className="text-xs absolute -right-4">E</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Navigation className="h-5 w-5 text-cyan-500" /> Corrente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Velocidade</span>
                <span className="text-xl font-bold">{telemetry.currentSpeed.toFixed(1)} knots</span>
              </div>
              <Progress value={(telemetry.currentSpeed / 5) * 100} className="h-2" />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Direção</span>
                <span className="text-lg font-semibold">{telemetry.currentDirection}°</span>
              </div>
              <div className="flex items-center justify-center">
                <div 
                  className="w-16 h-16 rounded-full border-2 border-cyan-500 flex items-center justify-center relative"
                >
                  <div 
                    className="absolute w-1 h-6 bg-cyan-500 rounded-full origin-bottom"
                    style={{ transform: `rotate(${telemetry.currentDirection}deg)` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Waves className="h-5 w-5 text-indigo-500" /> Ondas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Altura</span>
                <span className="text-xl font-bold">{telemetry.waveHeight.toFixed(1)} m</span>
              </div>
              <Progress value={(telemetry.waveHeight / 5) * 100} className="h-2" />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Período</span>
                <span className="text-lg font-semibold">{telemetry.wavePeriod} s</span>
              </div>
              <div className="flex items-center justify-center h-16">
                <svg width="100" height="40" className="text-indigo-500">
                  <path 
                    d="M0,20 Q12.5,5 25,20 T50,20 T75,20 T100,20" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                  />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Metric({ 
  icon: Icon, 
  label, 
  value, 
  unit, 
  color 
}: { 
  icon: React.ElementType;
  label: string; 
  value: string; 
  unit: string;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center p-4 rounded-lg bg-muted/50">
      <Icon className={`h-5 w-5 ${color} mb-2`} />
      <p className="text-xs text-muted-foreground text-center">{label}</p>
      <p className={`text-xl font-semibold ${color}`}>
        {value}
        <span className="text-sm text-muted-foreground">{unit}</span>
      </p>
    </div>
  );
}
