import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export default function DPOverview() {
  const metrics = [
    { name: "Bus A", status: "OK", color: "green" },
    { name: "Bus B", status: "OK", color: "green" },
    { name: "Gyro Drift", status: "0.02°/min", color: "blue" },
    { name: "DP Confidence", status: "98%", color: "teal" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 /> Resumo Operacional
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        {metrics.map((m) => (
          <div key={m.name} className="flex justify-between border-b pb-1">
            <span className="text-gray-400">{m.name}</span>
            <span className={`text-${m.color}-400 font-semibold`}>{m.status}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
