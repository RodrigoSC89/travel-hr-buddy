import { useEffect, useState, useCallback } from "react";;

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Anchor } from "lucide-react";
import { subscribeBridgeStatus } from "@/lib/mqtt/publisher";

export default function DPStatusBoard() {
  const [dp, setDP] = useState({ position: "—", status: "Offline", integrity: 0 });

  useEffect(() => {
    const client = subscribeBridgeStatus((data) => setDP(data.dp || {}));
    return () => client.end();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Anchor className="text-[var(--nautilus-primary)]" /> Estado do Sistema DP
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

function Metric({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex flex-col items-center">
      <p className="text-sm text-gray-400">{label}</p>
      <p className={`text-${color || "blue"}-400 font-semibold`}>{value}</p>
    </div>
  );
}
