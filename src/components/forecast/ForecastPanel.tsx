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
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="text-white">Condições Atuais</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <Metric label="Vento" value={`${data.wind.toFixed(1)} kn`} icon={<Wind className="text-blue-400" />} />
        <Metric label="Ondas" value={`${data.wave.toFixed(1)} m`} icon={<Waves className="text-cyan-400" />} />
        <Metric label="Temperatura" value={`${data.temp.toFixed(1)} °C`} icon={<Thermometer className="text-orange-400" />} />
        <Metric label="Visibilidade" value={`${data.visibility.toFixed(1)} km`} icon={<Cloud className="text-gray-400" />} />
      </CardContent>
    </Card>
  );
}

function Metric({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center space-x-2 p-2 bg-gray-800 rounded">
      {icon}
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-lg font-bold text-white">{value}</p>
      </div>
    </div>
  );
}
