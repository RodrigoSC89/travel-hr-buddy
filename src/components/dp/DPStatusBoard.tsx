import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Anchor } from "lucide-react";
import { subscribeBridgeStatus } from "@/lib/mqtt/publisher";

interface DPState {
  position: string;
  status: string;
  integrity: number;
}

interface MetricProps {
  label: string;
  value: string;
  color?: string;
}

export default function DPStatusBoard() {
  const [dp, setDP] = useState<DPState>({ position: "—", status: "Offline", integrity: 0 });

  useEffect(() => {
    const unsubscribe = subscribeBridgeStatus((data: { dp?: Partial<DPState> }) => {
      if (data.dp) {
        setDP(prev => ({ ...prev, ...data.dp }));
      }
    });
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Anchor className="text-primary" /> Estado do Sistema DP
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-3 text-center">
        <Metric label="Posição Atual" value={dp.position} />
        <Metric label="Status" value={dp.status} color={dp.status === "OK" ? "green" : "red"} />
        <Metric label="Integridade" value={`${dp.integrity}%`} />
      </CardContent>
    </Card>
  );
}

function Metric({ label, value, color }: MetricProps) {
  return (
    <div className="flex flex-col items-center">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`font-semibold ${color === "green" ? "text-green-500" : color === "red" ? "text-red-500" : "text-blue-500"}`}>
        {value}
      </p>
    </div>
  );
}
