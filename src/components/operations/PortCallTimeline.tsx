/**
 * Port Call Timeline - Interactive Gantt
 * Arrival → Anchorage → Berthing → Operations → Departure
 * Supera Portchain
 */
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Anchor, Ship, Clock, MapPin, ArrowRight, Navigation,
  Fuel, Package, CheckCircle, AlertTriangle, Timer
} from "lucide-react";

interface PortCallStage {
  id: string;
  label: string;
  icon: typeof Anchor;
  start: string | null;
  end: string | null;
  status: "pending" | "active" | "completed" | "delayed";
  duration_hours?: number;
  color: string;
}

const dynamicFrom = supabase.from as Function;

export function PortCallTimeline() {
  const { data: portCalls = [] } = useQuery({
    queryKey: ["port-calls-timeline"],
    queryFn: async () => {
      const { data } = await dynamicFrom("port_calls")
        .select("*")
        .order("eta", { ascending: true })
        .limit(20);
      return data || [];
    },
    staleTime: 30000,
  });

  const getStages = (call: Record<string, unknown>): PortCallStage[] => {
    const eta = call.eta as string | null;
    const ata = call.ata as string | null;
    const atd = call.atd as string | null;
    const status = String(call.status || "planned");

    const stages: PortCallStage[] = [
      {
        id: "approach", label: "Approach", icon: Navigation, start: eta, end: ata,
        status: status === "planned" ? "pending" : ata ? "completed" : status === "approaching" ? "active" : "pending",
        color: "bg-info",
      },
      {
        id: "anchorage", label: "Anchorage", icon: Anchor, start: ata, end: null,
        status: status === "berthed" || status === "operations" || status === "completed" ? "completed" : status === "approaching" ? "active" : "pending",
        color: "bg-warning",
      },
      {
        id: "berthing", label: "Berthing", icon: Ship, start: null, end: null,
        status: status === "berthed" ? "active" : status === "operations" || status === "completed" ? "completed" : "pending",
        color: "bg-primary",
      },
      {
        id: "operations", label: "Cargo Ops", icon: Package, start: null, end: null,
        status: status === "operations" ? "active" : status === "completed" ? "completed" : "pending",
        color: "bg-success",
      },
      {
        id: "departure", label: "Departure", icon: ArrowRight, start: atd, end: atd,
        status: status === "completed" ? "completed" : "pending",
        color: "bg-muted",
      },
    ];

    return stages;
  };

  const statusIcon = (s: string) => {
    switch (s) {
      case "completed": return <CheckCircle className="h-3 w-3 text-success" />;
      case "active": return <Timer className="h-3 w-3 text-warning animate-pulse" />;
      case "delayed": return <AlertTriangle className="h-3 w-3 text-destructive" />;
      default: return <Clock className="h-3 w-3 text-muted-foreground" />;
    }
  };

  if (portCalls.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <Anchor className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>Nenhuma escala registrada. Crie escalas no Port Call Manager.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Timer className="h-5 w-5 text-primary" /> Port Call Timeline
        </h3>
        <Badge variant="outline" className="text-xs">Gantt interativo</Badge>
      </div>

      <ScrollArea className="w-full">
        <div className="space-y-3 min-w-[700px]">
          {/* Header */}
          <div className="grid grid-cols-[200px_1fr] gap-4 px-3 py-2 bg-muted/30 rounded-lg text-xs font-medium text-muted-foreground">
            <span>Vessel / Port</span>
            <div className="grid grid-cols-5 gap-1 text-center">
              <span>Approach</span>
              <span>Anchorage</span>
              <span>Berthing</span>
              <span>Cargo Ops</span>
              <span>Departure</span>
            </div>
          </div>

          {portCalls.map((call: Record<string, unknown>) => {
            const stages = getStages(call);
            return (
              <Card key={String(call.id)} className="border-border/50">
                <CardContent className="py-3 px-3">
                  <div className="grid grid-cols-[200px_1fr] gap-4 items-center">
                    {/* Vessel info */}
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate flex items-center gap-1">
                        <Ship className="h-3.5 w-3.5 text-primary shrink-0" />
                        {String(call.vessel_name || "—")}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {String(call.port_name || "—")}
                        {call.berth ? ` • Berth ${String(call.berth)}` : ""}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        ETA: {call.eta ? new Date(String(call.eta)).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}
                      </p>
                    </div>

                    {/* Timeline stages */}
                    <div className="grid grid-cols-5 gap-1">
                      {stages.map((stage, i) => (
                        <div key={stage.id} className="relative">
                          <div className={`
                            rounded-md px-2 py-2 text-center text-[10px] font-medium transition-all
                            ${stage.status === "completed" ? "bg-success/15 text-success border border-success/20" :
                              stage.status === "active" ? "bg-primary/15 text-primary border border-primary/30 ring-1 ring-primary/20" :
                              stage.status === "delayed" ? "bg-destructive/15 text-destructive border border-destructive/20" :
                              "bg-muted/30 text-muted-foreground border border-border/30"
                            }
                          `}>
                            <div className="flex items-center justify-center gap-1 mb-0.5">
                              {statusIcon(stage.status)}
                              <stage.icon className="h-3 w-3" />
                            </div>
                            <span>{stage.label}</span>
                          </div>
                          {/* Connector line */}
                          {i < stages.length - 1 && (
                            <div className={`absolute top-1/2 -right-0.5 w-1 h-0.5 ${
                              stage.status === "completed" ? "bg-success/50" : "bg-border"
                            }`} />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
