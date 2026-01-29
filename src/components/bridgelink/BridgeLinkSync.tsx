import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { RefreshCcw, Cloud, Database } from "lucide-react";
import { publishEvent } from "@/lib/mqtt/publisher";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://vnbptmixvwropvanyhdb.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuYnB0bWl4dndyb3B2YW55aGRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1NzczNTEsImV4cCI6MjA3NDE1MzM1MX0.-LivvlGPJwz_Caj5nVk_dhVeheaXPCROmXc4G8UsJcE";

export default function BridgeLinkSync() {
  const [syncStatus, setSyncStatus] = useState("Sincronizando...");
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  useEffect(() => {
    const channel = supabase
      .channel("nautilus-telemetry")
      .on("postgres_changes", { event: "*", schema: "public", table: "telemetry" }, (payload) => {
        publishEvent("nautilus/bridgelink/update", payload.new as Record<string, unknown>);
        setSyncStatus("Última atualização: " + new Date().toLocaleTimeString());
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCcw className="h-5 w-5" />
          Sincronização em Tempo Real
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <StatusItem icon={<Cloud className="h-4 w-4" />} label="MQTT" value="Ativo" />
        <StatusItem icon={<Database className="h-4 w-4" />} label="Supabase" value="Conectado" />
        <StatusItem icon={<RefreshCcw className="h-4 w-4" />} label="Status" value={syncStatus} />
      </CardContent>
    </Card>
  );
}

function StatusItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}
