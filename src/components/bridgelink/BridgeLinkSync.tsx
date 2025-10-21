// @ts-nocheck
import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { RefreshCw, Cloud, Database } from "lucide-react";
import { publishEvent } from "@/lib/mqtt/publisher";
import { createClient } from "@supabase/supabase-js";

export default function BridgeLinkSync() {
  const [syncStatus, setSyncStatus] = useState("Sincronizando...");
  const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_KEY);

  useEffect(() => {
    const channel = supabase
      .channel("nautilus-telemetry")
      .on("postgres_changes", { event: "*", schema: "public", table: "telemetry" }, (payload) => {
        publishEvent("nautilus/bridgelink/update", payload.new);
        setSyncStatus("Última atualização: " + new Date().toLocaleTimeString());
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="text-primary" /> Sincronização em Tempo Real
        </CardTitle>
      </CardHeader>
      <CardContent className="flex justify-around">
        <StatusItem icon={<Cloud />} label="MQTT" value="Ativo" />
        <StatusItem icon={<Database />} label="Supabase" value="Conectado" />
        <StatusItem icon={<RefreshCw />} label="Status" value={syncStatus} />
      </CardContent>
    </Card>
  );
}

function StatusItem({ icon, label, value }) {
  return (
    <div className="flex flex-col items-center">
      <div className="text-primary">{icon}</div>
      <p className="text-gray-400 text-sm">{label}</p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  );
}
