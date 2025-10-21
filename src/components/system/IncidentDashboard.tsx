import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL!, import.meta.env.VITE_SUPABASE_ANON_KEY!);

type Incident = {
  id: string;
  module: string;
  severity: "info" | "warning" | "critical";
  message: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
};

export default function IncidentDashboard() {
  const [incidents, setIncidents] = useState<Incident[]>([]);

  useEffect(() => {
    // carga inicial
    supabase.from("incidents").select("*").order("created_at", { ascending: false }).limit(50).then(({ data }) => {
      setIncidents((data as Incident[]) ?? []);
    });
    // realtime stream (Supabase Realtime)
    const channel = supabase
      // @ts-ignore
      .channel("incidents")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "incidents" }, (payload: any) => {
        setIncidents((prev) => [payload.new as Incident, ...prev]);
      })
      .subscribe();
    return () => {
      // @ts-ignore
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <Card className="m-4">
      <CardHeader>
        <CardTitle>📊 Incident Response — Nautilus One</CardTitle>
      </CardHeader>
      <CardContent>
        {incidents.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum incidente recente.</p>
        ) : (
          <div className="space-y-2">
            {incidents.map((i) => (
              <div key={i.id} className="flex items-start justify-between border-b pb-2">
                <div>
                  <div className="font-medium">{i.module}</div>
                  <div className="text-sm text-muted-foreground">{i.message}</div>
                  <div className="text-xs text-muted-foreground">{new Date(i.timestamp).toLocaleString()}</div>
                </div>
                <Badge variant={i.severity === "critical" ? "destructive" : i.severity === "warning" ? "secondary" : "default"}>
                  {i.severity.toUpperCase()}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
