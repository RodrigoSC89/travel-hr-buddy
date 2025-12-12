import { useEffect, useState } from "react";;
import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { RefreshCcw, Cloud, Database } from "lucide-react";
import { publishEvent } from "@/lib/mqtt/publisher";
import { createClient } from "@supabase/supabase-js";

export default function BridgeLinkSync() {
  const [syncStatus, setSyncStatus] = useState("Sincronizando...");
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_KEY || "";
  const supabase = createClient(supabaseUrl, supabaseKey);

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
    });
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
