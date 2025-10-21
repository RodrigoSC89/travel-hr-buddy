// @ts-nocheck
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud className="text-[var(--nautilus-primary)]" /> Condições Atuais
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Metric label="Vento" value={`${data.wind.toFixed(1)} kn`} icon={<Wind />} />
        <Metric label="Ondas" value={`${data.wave.toFixed(1)} m`} icon={<Waves />} />
        <Metric label="Temperatura" value={`${data.temp.toFixed(1)} °C`} icon={<Thermometer />} />
        <Metric label="Visibilidade" value={`${data.visibility.toFixed(1)} km`} icon={<Cloud />} />
      </CardContent>
    </Card>
  );
}

function Metric({ label, value, icon }) {
  return (
    <div className="flex flex-col items-center text-center p-2 border rounded bg-[var(--nautilus-bg)]">
      <div className="text-[var(--nautilus-primary)] mb-1">{icon}</div>
      <p className="text-sm text-gray-400">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}
