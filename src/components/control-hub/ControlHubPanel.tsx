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
        <CardTitle className="flex items-center gap-2">
          <Activity className="text-[var(--nautilus-primary)]" /> Painel de Operação Integrado
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <Metric label="Potência Total" value={`${dp.power.toFixed(2)} MW`} icon={<Cpu />} />
        <Metric label="Heading" value={`${dp.heading.toFixed(1)}°`} icon={<Activity />} />
        <Metric label="Previsão Oceânica" value={`${forecast.value.toFixed(1)} m`} icon={<CloudLightning />} />
        <Metric label="Thrusters Ativos" value={`${dp.thrusters}/6`} icon={<Cpu />} />
      </CardContent>
    </Card>
  );
}

function Metric({ label, value, icon }) {
  return (
    <div className="p-3 border rounded-lg shadow-sm flex flex-col items-center text-center bg-[var(--nautilus-bg)]">
      <div className="text-[var(--nautilus-primary)] mb-1">{icon}</div>
      <p className="text-sm text-gray-400">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}
