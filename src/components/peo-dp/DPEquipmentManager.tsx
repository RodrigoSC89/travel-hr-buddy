import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Plus, Settings, AlertTriangle, CheckCircle, Wrench, XCircle, Search } from "lucide-react";

const SYSTEM_TYPES = [
  { id: "all", label: "Todos", icon: "⚙️" },
  { id: "power", label: "Energia", icon: "⚡" },
  { id: "propulsion", label: "Propulsão", icon: "🔩" },
  { id: "reference", label: "Referência", icon: "📡" },
  { id: "sensors", label: "Sensores", icon: "🌊" },
  { id: "control", label: "Controle DP", icon: "🖥️" },
  { id: "communication", label: "Comunicação", icon: "📻" },
  { id: "fire_safety", label: "Incêndio", icon: "🧯" },
  { id: "navigation", label: "Navegação", icon: "🧭" },
];

const STATUS_CONFIG = {
  operational: { label: "Operacional", color: "bg-green-500", icon: CheckCircle, badge: "default" as const },
  degraded: { label: "Degradado", color: "bg-amber-500", icon: AlertTriangle, badge: "secondary" as const },
  failed: { label: "Falha", color: "bg-red-500", icon: XCircle, badge: "destructive" as const },
  maintenance: { label: "Manutenção", color: "bg-blue-500", icon: Wrench, badge: "outline" as const },
  critical: { label: "Crítico", color: "bg-red-700", icon: XCircle, badge: "destructive" as const },
};

export function DPEquipmentManager() {
  const [selectedSystem, setSelectedSystem] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  const { data: equipment = [], isLoading } = useQuery({
    queryKey: ["dp-equipment", selectedSystem],
    queryFn: async () => {
      let q = supabase.from("peodp_equipment").select("*").order("system_type");
      if (selectedSystem !== "all") q = q.eq("system_type", selectedSystem);
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("peodp_equipment")
        .update({ status, last_updated: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dp-equipment"] });
      toast.success("Status atualizado");
    },
  });

  const filtered = equipment.filter((eq: any) => {
    const matchSearch = !searchTerm || eq.name?.toLowerCase().includes(searchTerm.toLowerCase()) || eq.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSearch;
  });

  const stats = {
    total: equipment.length,
    operational: equipment.filter((e: any) => e.status === "operational").length,
    degraded: equipment.filter((e: any) => e.status === "degraded").length,
    failed: equipment.filter((e: any) => e.status === "failed" || e.status === "critical").length,
    maintenance: equipment.filter((e: any) => e.status === "maintenance").length,
  };

  const redundancyScore = stats.total > 0 ? Math.round((stats.operational / stats.total) * 100) : 0;

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Carregando equipamentos DP...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-3xl font-bold text-primary">{redundancyScore}%</p>
            <p className="text-xs text-muted-foreground">Redundância DP</p>
          </CardContent>
        </Card>
        {(["operational", "degraded", "failed", "maintenance"] as const).map(s => {
          const cfg = STATUS_CONFIG[s];
          return (
            <Card key={s}>
              <CardContent className="pt-4 pb-3 text-center">
                <p className="text-2xl font-bold">{stats[s]}</p>
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${cfg.color}`} /> {cfg.label}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        {SYSTEM_TYPES.map(s => (
          <Button key={s.id} size="sm" variant={selectedSystem === s.id ? "default" : "outline"}
            onClick={() => setSelectedSystem(s.id)} className="gap-1 text-xs">
            <span>{s.icon}</span> {s.label}
          </Button>
        ))}
        <div className="ml-auto relative">
          <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
          <Input placeholder="Buscar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="pl-8 h-9 w-48 text-sm" />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((eq: any) => {
          const status = (eq.status || "operational") as keyof typeof STATUS_CONFIG;
          const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.operational;
          const IconComp = cfg.icon;
          const daysToCalibration = eq.next_calibration ? Math.ceil((new Date(eq.next_calibration).getTime() - Date.now()) / 86400000) : null;
          const calibrationUrgent = daysToCalibration !== null && daysToCalibration <= 30;

          return (
            <Card key={eq.id} className={`transition-all ${status === "failed" || status === "critical" ? "border-destructive/50 bg-destructive/5" : status === "degraded" ? "border-warning/50 bg-warning/5" : ""}`}>
              <CardContent className="pt-4 pb-3 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-sm">{eq.name}</h4>
                    <p className="text-xs text-muted-foreground">{eq.manufacturer} • {eq.model}</p>
                    <p className="text-xs text-muted-foreground">S/N: {eq.serial_number}</p>
                  </div>
                  <Badge variant={cfg.badge} className="gap-1 text-xs">
                    <IconComp className="h-3 w-3" /> {cfg.label}
                  </Badge>
                </div>

                {eq.status_notes && (
                  <p className="text-xs text-warning bg-warning/10 rounded px-2 py-1">{eq.status_notes}</p>
                )}

                <div className="flex items-center justify-between text-xs">
                  <span className={calibrationUrgent ? "text-destructive font-medium" : "text-muted-foreground"}>
                    {calibrationUrgent ? "⚠️" : "📅"} Próx. calibração: {eq.next_calibration ? new Date(eq.next_calibration).toLocaleDateString("pt-BR") : "N/D"}
                    {daysToCalibration !== null && ` (${daysToCalibration}d)`}
                  </span>
                </div>

                <div className="flex gap-1">
                  {(["operational", "degraded", "failed", "maintenance"] as const).map(s => {
                    const sc = STATUS_CONFIG[s];
                    return (
                      <Button key={s} size="sm" variant={status === s ? "default" : "ghost"}
                        className={`flex-1 text-xs h-7 ${status === s ? sc.color + " text-white" : ""}`}
                        onClick={() => updateStatusMutation.mutate({ id: eq.id, status: s })}>
                        {s === "operational" ? "✅" : s === "degraded" ? "⚠️" : s === "failed" ? "❌" : "🔧"}
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-muted-foreground">
            <Settings className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Nenhum equipamento encontrado</p>
            <p className="text-sm mt-1">Equipamentos serão listados após migração do banco de dados</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
