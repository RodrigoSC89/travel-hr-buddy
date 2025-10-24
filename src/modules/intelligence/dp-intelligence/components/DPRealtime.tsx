// @ts-nocheck
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { subscribeDP } from "@/lib/mqtt/publisher";
import { Wifi } from "lucide-react";

interface TelemetryData {
  thrusters: number;
  power: number;
  heading: number;
}

export default function DPRealtime() {
  const [telemetry, setTelemetry] = useState<TelemetryData>({ thrusters: 0, power: 0, heading: 0 });

  useEffect(() => {
    const client = subscribeDP((data) => {
      // Safely parse the telemetry data
      const telData = data as TelemetryData;
      setTelemetry(telData);
    });
    return () => client.end();
  }, []);

  return (
    <Card className="shadow-md bg-[var(--nautilus-bg)]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wifi className="text-[var(--nautilus-primary)]" /> DP Realtime Telemetry
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-4">
        <Metric label="Thrusters Ativos" value={`${telemetry.thrusters}`} unit="/ 6" />
        <Metric label="Potência Total" value={`${telemetry.power.toFixed(1)}`} unit="MW" />
        <Metric label="Heading" value={`${telemetry.heading.toFixed(1)}`} unit="°" />
      </CardContent>
    </Card>
  );
}

function Metric({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="flex flex-col items-center">
      <p className="text-sm text-gray-400">{label}</p>
      <p className="text-xl font-semibold text-[var(--nautilus-primary)]">
        {value}
        <span className="text-sm text-gray-400">{unit}</span>
      </p>
    </div>
  );
}
