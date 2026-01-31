/**
 * Forecast Panel - Weather and Sea Conditions
 * PATCH CLEANUP: Removed @ts-nocheck, added proper typing
 */
import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Wind, Waves, Thermometer, Cloud } from "lucide-react";
import { subscribeForecast } from "@/lib/mqtt/publisher";

interface ForecastData {
  wind: number;
  wave: number;
  temp: number;
  visibility: number;
}

interface MetricProps {
  label: string;
  value: string;
  icon: React.ReactNode;
}

function Metric({ label, value, icon }: MetricProps) {
  return (
    <div className="flex items-center space-x-2 p-2 bg-muted rounded">
      {icon}
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-lg font-bold text-foreground">{value}</p>
      </div>
    </div>
  );
}

export default function ForecastPanel() {
  const [data, setData] = useState<ForecastData>({ wind: 0, wave: 0, temp: 0, visibility: 0 });

  useEffect(() => {
    const unsubscribe = subscribeForecast((msg: Record<string, unknown>) => {
      setData({
        wind: typeof msg.wind === 'number' ? msg.wind : 0,
        wave: typeof msg.wave === 'number' ? msg.wave : 0,
        temp: typeof msg.temp === 'number' ? msg.temp : 0,
        visibility: typeof msg.visibility === 'number' ? msg.visibility : 0,
      });
    });
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-card-foreground">Condições Atuais</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <Metric label="Vento" value={`${data.wind.toFixed(1)} kn`} icon={<Wind className="text-primary" />} />
        <Metric label="Ondas" value={`${data.wave.toFixed(1)} m`} icon={<Waves className="text-info" />} />
        <Metric label="Temperatura" value={`${data.temp.toFixed(1)} °C`} icon={<Thermometer className="text-warning" />} />
        <Metric label="Visibilidade" value={`${data.visibility.toFixed(1)} km`} icon={<Cloud className="text-muted-foreground" />} />
      </CardContent>
    </Card>
  );
}
