import { useEffect, useState, useCallback } from "react";;

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Wind, Waves, Thermometer, Cloud } from "lucide-react";
import { subscribeForecast } from "@/lib/mqtt/publisher";

export default function ForecastPanel() {
  const [data, setData] = useState({ wind: 0, wave: 0, temp: 0, visibility: 0 });

  useEffect(() => {
    const client = subscribeForecast((msg) => setData(msg));
    return () => client.end();
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

function Metric({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
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
