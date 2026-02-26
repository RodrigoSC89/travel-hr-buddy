/**
 * Tracking Alerts - ✅ INTEGRATED with Supabase tracking_alerts table
 * Full CRUD: Create, Resolve, Delete alerts
 */
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Bell, Plus, CheckCircle, AlertTriangle, Search, Loader2, MapPin, Ship, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCreateTrackingAlert, useResolveTrackingAlert, useDeleteTrackingAlert } from "@/hooks/useModuleHooks";

const ALERT_TYPES = [
  { value: "geofence", label: "Geofence", icon: "🗺️" },
  { value: "speed", label: "Velocidade", icon: "⚡" },
  { value: "route_deviation", label: "Desvio de Rota", icon: "↗️" },
  { value: "ais_loss", label: "Perda AIS", icon: "📡" },
  { value: "anchor_drag", label: "Âncora Arrastando", icon: "⚓" },
  { value: "weather", label: "Meteorologia", icon: "🌊" },
  { value: "port_approach", label: "Aprox. Porto", icon: "🏗️" },
];

const SEVERITY_MAP: Record<string, { color: string; label: string }> = {
  low: { color: "outline", label: "Baixa" },
  medium: { color: "secondary", label: "Média" },
  high: { color: "default", label: "Alta" },
  critical: { color: "destructive", label: "Crítica" },
};

export default function TrackingAlerts() {
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [filterResolved, setFilterResolved] = useState("active");
  const [searchTerm, setSearchTerm] = useState("");
  const [newAlert, setNewAlert] = useState({
    title: "", description: "", alert_type: "geofence", severity: "medium",
    latitude: "", longitude: "",
  });

  // ✅ FETCH alerts
  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ["tracking-alerts", filterResolved],
    queryFn: async () => {
      let query = supabase.from("tracking_alerts").select("*, vessels(name)").order("created_at", { ascending: false });
      if (filterResolved === "active") query = query.eq("is_resolved", false);
      else if (filterResolved === "resolved") query = query.eq("is_resolved", true);
      const { data, error } = await query.limit(200);
      if (error) throw error;
      return data || [];
    },
  });

  // ✅ Fetch vessels for dropdown
  const { data: vessels = [] } = useQuery({
    queryKey: ["vessels-list"],
    queryFn: async () => {
      const { data } = await supabase.from("vessels").select("id, name").order("name").limit(100);
      return data || [];
    },
  });

  // ✅ CREATE — via integrated domain service (publishes event + audit)
  const createAlertHook = useCreateTrackingAlert();
  const createMutation = {
    mutate: (alert: typeof newAlert & { vessel_id?: string }) => {
      createAlertHook.mutate({
        title: alert.title, description: alert.description,
        alert_type: alert.alert_type, severity: alert.severity,
        latitude: alert.latitude ? parseFloat(alert.latitude) : null,
        longitude: alert.longitude ? parseFloat(alert.longitude) : null,
        vessel_id: alert.vessel_id || null,
      }, { onSuccess: () => setShowCreateDialog(false) });
    },
    isPending: createAlertHook.isPending,
  };

  // ✅ RESOLVE — via integrated hook (publishes tracking.alert.resolved event)
  const resolveAlertHook = useResolveTrackingAlert();
  const resolveMutation = {
    mutate: (id: string) => resolveAlertHook.mutate(id),
  };

  // ✅ DELETE — via integrated hook (publishes tracking.alert.deleted event)
  const deleteAlertHook = useDeleteTrackingAlert();
  const deleteMutation = {
    mutate: (id: string) => deleteAlertHook.mutate(id),
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- dynamic Supabase join rows
  const typedAlerts = alerts as Array<Record<string, unknown>>;
  const filtered = typedAlerts.filter((a) =>
    (filterType === "all" || a.alert_type === filterType) &&
    (searchTerm === "" || String(a.title || "").toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const activeCount = typedAlerts.filter((a) => !a.is_resolved).length;
  const criticalCount = typedAlerts.filter((a) => a.severity === "critical" && !a.is_resolved).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Bell className="h-8 w-8 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">Alertas de Rastreamento</h2>
            <p className="text-muted-foreground">Alertas de posição, geofencing e segurança marítima • <Badge variant="outline" className="text-xs">Supabase Live</Badge></p>
          </div>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}><Plus className="h-4 w-4 mr-2" /> Novo Alerta</Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-4 text-center"><p className="text-xs text-muted-foreground">Total Alertas</p><p className="text-2xl font-bold">{alerts.length}</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-xs text-muted-foreground">Ativos</p><p className="text-2xl font-bold text-warning">{activeCount}</p></CardContent></Card>
        <Card className="border-destructive/20"><CardContent className="pt-4 text-center"><p className="text-xs text-muted-foreground">Críticos</p><p className="text-2xl font-bold text-destructive">{criticalCount}</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-xs text-muted-foreground">Resolvidos</p><p className="text-2xl font-bold text-success">{alerts.length - activeCount}</p></CardContent></Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar alertas..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Tipos</SelectItem>
            {ALERT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.icon} {t.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterResolved} onValueChange={setFilterResolved}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Ativos</SelectItem>
            <SelectItem value="resolved">Resolvidos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Alerts List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-12 text-center">
          <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-lg font-medium">Nenhum alerta encontrado</p>
          <p className="text-sm text-muted-foreground">O sistema está monitorando. Alertas aparecerão aqui automaticamente.</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-3">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {filtered.map((alert: any) => {
            const severity = SEVERITY_MAP[String(alert.severity)] || SEVERITY_MAP.medium;
            const alertType = ALERT_TYPES.find(t => t.value === alert.alert_type);
            const vesselData = alert.vessels as Record<string, unknown> | null;
            return (
              <Card key={String(alert.id)} className={alert.is_resolved ? "opacity-60" : ""}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{alertType?.icon || "🔔"}</span>
                        <h4 className="font-semibold">{String(alert.title)}</h4>
                        <Badge variant={severity.color as "destructive" | "secondary" | "outline" | "default"}>{String(severity.label)}</Badge>
                        <Badge variant="outline">{String(alertType?.label || alert.alert_type)}</Badge>
                        {alert.is_resolved && <Badge variant="outline" className="text-success">{"✓ Resolvido"}</Badge>}
                      </div>
                      {alert.description && <p className="text-sm text-muted-foreground mb-1">{String(alert.description)}</p>}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {vesselData && <span className="flex items-center gap-1"><Ship className="h-3 w-3" />{String((vesselData as Record<string, string>).name)}</span>}
                        {alert.latitude && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{`${Number(alert.latitude).toFixed(4)}, ${Number(alert.longitude).toFixed(4)}`}</span>}
                        <span>{new Date(String(alert.created_at)).toLocaleString("pt-BR")}</span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {!alert.is_resolved && (
                        <Button size="sm" variant="outline" onClick={() => resolveMutation.mutate(String(alert.id))}>
                          <CheckCircle className="h-4 w-4 mr-1" /> Resolver
                        </Button>
                      )}
                      <Button size="icon" variant="ghost" className="text-destructive h-8 w-8" onClick={() => deleteMutation.mutate(String(alert.id))} aria-label="Excluir alerta" title="Excluir">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Novo Alerta de Rastreamento</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Título *</Label><Input value={newAlert.title} onChange={e => setNewAlert(p => ({ ...p, title: e.target.value }))} /></div>
            <div><Label>Descrição</Label><Textarea value={newAlert.description} onChange={e => setNewAlert(p => ({ ...p, description: e.target.value }))} rows={2} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Tipo</Label>
                <Select value={newAlert.alert_type} onValueChange={v => setNewAlert(p => ({ ...p, alert_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{ALERT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.icon} {t.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Severidade</Label>
                <Select value={newAlert.severity} onValueChange={v => setNewAlert(p => ({ ...p, severity: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="critical">Crítica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Latitude</Label><Input value={newAlert.latitude} onChange={e => setNewAlert(p => ({ ...p, latitude: e.target.value }))} type="number" step="0.0001" /></div>
              <div><Label>Longitude</Label><Input value={newAlert.longitude} onChange={e => setNewAlert(p => ({ ...p, longitude: e.target.value }))} type="number" step="0.0001" /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancelar</Button>
            <Button onClick={() => createMutation.mutate(newAlert)} disabled={!newAlert.title || createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Criar Alerta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
