// @ts-nocheck
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { subscribeForecast, subscribeDP } from "@/lib/mqtt/publisher";
import { Activity, Cpu, CloudLightning } from "lucide-react";

export default function ControlHubPanel() {
  const [dp, setDP] = useState({ thrusters: 0, power: 0, heading: 0 });
  const [forecast, setForecast] = useState({ value: 0 });

  useEffect(() => {
    const dpClient = subscribeDP((data) => setDP(data));
    const forecastClient = subscribeForecast((data) => setForecast(data));
    return () => {
      dpClient.end();
      forecastClient.end();
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Painel de Operação Integrado</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Metric label="Potência Total" value={`${dp.power.toFixed(2)} MW`} icon={<Cpu className="h-5 w-5 text-blue-500" />} />
          <Metric label="Heading" value={`${dp.heading.toFixed(1)}°`} icon={<Activity className="h-5 w-5 text-green-500" />} />
          <Metric label="Previsão Oceânica" value={`${forecast.value.toFixed(1)} m`} icon={<CloudLightning className="h-5 w-5 text-yellow-500" />} />
          <Metric label="Thrusters Ativos" value={`${dp.thrusters}/6`} icon={<Activity className="h-5 w-5 text-purple-500" />} />
        </div>
      </CardContent>
    </Card>
  );
}

function Metric({ label, value, icon }) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
      {icon}
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}
