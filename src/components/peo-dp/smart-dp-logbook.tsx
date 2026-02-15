import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  BookOpen, Clock, User, AlertTriangle, CheckCircle, Activity, Settings,
  Download, Plus, Filter, Search, RefreshCw, Loader2
} from "lucide-react";

interface LogEntry {
  id: string;
  timestamp: string;
  eventType: "mode_change" | "alarm" | "sensor" | "watch_handover" | "operation" | "maintenance" | "incident";
  category: string;
  description: string;
  operator: string;
  dpMode: string;
  severity: "info" | "warning" | "critical";
  acknowledged: boolean;
  notes?: string;
}

const eventTypeConfig = {
  mode_change: { label: "Mudança de Modo", icon: RefreshCw, color: "bg-primary" },
  alarm: { label: "Alarme", icon: AlertTriangle, color: "bg-destructive" },
  sensor: { label: "Sensor", icon: Activity, color: "bg-warning" },
  watch_handover: { label: "Troca de Turno", icon: User, color: "bg-success" },
  operation: { label: "Operação", icon: Settings, color: "bg-accent" },
  maintenance: { label: "Manutenção", icon: Settings, color: "bg-warning" },
  incident: { label: "Incidente", icon: AlertTriangle, color: "bg-destructive" }
};

export const SmartDPLogbook: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [isNewEntryOpen, setIsNewEntryOpen] = useState(false);
  const [newEntry, setNewEntry] = useState<Partial<LogEntry>>({
    eventType: "operation",
    severity: "info",
    dpMode: "Auto DP"
  });

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["peodp-audit-trail"],
    queryFn: async () => {
      const { data, error } = await (supabase.from as Function)("peodp_audit_trail")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data || []).map((row: Record<string, unknown>) => ({
        id: row.id as string,
        timestamp: row.created_at as string,
        eventType: (row.event_type as string) || "operation",
        category: (row.category as string) || "Geral",
        description: (row.description as string) || "",
        operator: (row.performed_by as string) || "",
        dpMode: (row.dp_mode as string) || "Auto DP",
        severity: (row.severity as string) || "info",
        acknowledged: (row.acknowledged as boolean) ?? true,
        notes: row.notes as string | undefined,
      })) as LogEntry[];
    },
  });

  const addMutation = useMutation({
    mutationFn: async (entry: Partial<LogEntry>) => {
      const { error } = await (supabase.from as Function)("peodp_audit_trail").insert({
        event_type: entry.eventType,
        category: eventTypeConfig[entry.eventType as keyof typeof eventTypeConfig]?.label || "Geral",
        description: entry.description,
        performed_by: entry.operator,
        dp_mode: entry.dpMode,
        severity: entry.severity,
        acknowledged: true,
        notes: entry.notes,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["peodp-audit-trail"] });
      setNewEntry({ eventType: "operation", severity: "info", dpMode: "Auto DP" });
      setIsNewEntryOpen(false);
      toast.success("Entrada registrada no logbook");
    },
    onError: () => toast.error("Erro ao registrar entrada"),
  });

  const ackMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase.from as Function)("peodp_audit_trail")
        .update({ acknowledged: true })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["peodp-audit-trail"] });
      toast.success("Entrada reconhecida");
    },
  });

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.operator.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || entry.eventType === filterType;
    const matchesSeverity = filterSeverity === "all" || entry.severity === filterSeverity;
    return matchesSearch && matchesType && matchesSeverity;
  });

  const handleAddEntry = () => {
    if (!newEntry.description || !newEntry.operator) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    addMutation.mutate(newEntry);
  };

  const handleExportCSV = () => {
    const csvRows = [
      "Timestamp;Tipo;Categoria;Descrição;Operador;Modo DP;Severidade;Reconhecido",
      ...entries.map(e =>
        `${e.timestamp};${eventTypeConfig[e.eventType]?.label || e.eventType};${e.category};${e.description};${e.operator};${e.dpMode};${e.severity};${e.acknowledged ? "Sim" : "Não"}`
      )
    ];
    const blob = new Blob(['\uFEFF' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dp-logbook-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Logbook exportado!");
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical": return <Badge variant="destructive">Crítico</Badge>;
      case "warning": return <Badge className="bg-warning text-warning-foreground">Atenção</Badge>;
      default: return <Badge variant="secondary">Info</Badge>;
    }
  };

  const unacknowledgedCount = entries.filter(e => !e.acknowledged).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Carregando logbook...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl">
            <BookOpen className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Smart DP Logbook</h2>
            <p className="text-muted-foreground">Registro automatizado conforme IMCA M117 • Dados reais Supabase</p>
          </div>
        </div>
        <div className="flex gap-2">
          {unacknowledgedCount > 0 && (
            <Badge variant="destructive" className="px-3 py-1">
              {unacknowledgedCount} não reconhecido(s)
            </Badge>
          )}
          <Dialog open={isNewEntryOpen} onOpenChange={setIsNewEntryOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 mr-2" />Nova Entrada</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Nova Entrada no Logbook</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tipo de Evento</label>
                    <Select value={newEntry.eventType} onValueChange={(v) => setNewEntry({ ...newEntry, eventType: v as LogEntry["eventType"] })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(eventTypeConfig).map(([key, config]) => (
                          <SelectItem key={key} value={key}>{config.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Severidade</label>
                    <Select value={newEntry.severity} onValueChange={(v) => setNewEntry({ ...newEntry, severity: v as LogEntry["severity"] })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">Informação</SelectItem>
                        <SelectItem value="warning">Atenção</SelectItem>
                        <SelectItem value="critical">Crítico</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Operador</label>
                    <Input placeholder="Nome - Função" value={newEntry.operator || ""} onChange={(e) => setNewEntry({ ...newEntry, operator: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Modo DP</label>
                    <Select value={newEntry.dpMode} onValueChange={(v) => setNewEntry({ ...newEntry, dpMode: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Auto DP">Auto DP</SelectItem>
                        <SelectItem value="TAM">TAM</SelectItem>
                        <SelectItem value="CAM">CAM</SelectItem>
                        <SelectItem value="Joystick">Joystick</SelectItem>
                        <SelectItem value="Manual">Manual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Descrição do Evento *</label>
                  <Textarea placeholder="Descreva o evento detalhadamente..." value={newEntry.description || ""} onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })} rows={3} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Observações</label>
                  <Textarea placeholder="Notas adicionais..." value={newEntry.notes || ""} onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })} rows={2} />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsNewEntryOpen(false)}>Cancelar</Button>
                  <Button onClick={handleAddEntry} disabled={addMutation.isPending}>
                    {addMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Registrar Entrada
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-2" />Exportar CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Entradas</p>
                <p className="text-2xl font-bold">{entries.length}</p>
              </div>
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-warning/10 to-warning/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Mudanças de Modo</p>
                <p className="text-2xl font-bold">{entries.filter(e => e.eventType === "mode_change").length}</p>
              </div>
              <RefreshCw className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-destructive/10 to-destructive/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Alarmes</p>
                <p className="text-2xl font-bold">{entries.filter(e => e.eventType === "alarm").length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-success/10 to-success/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Reconhecidos</p>
                <p className="text-2xl font-bold">{entries.filter(e => e.acknowledged).length}/{entries.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar por descrição ou operador..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48"><Filter className="w-4 h-4 mr-2" /><SelectValue placeholder="Tipo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                {Object.entries(eventTypeConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>{config.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Severidade" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Atenção</SelectItem>
                <SelectItem value="critical">Crítico</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Log Entries */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Entradas do Logbook
          </CardTitle>
          <CardDescription>Registros de operações DP — dados reais</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="space-y-3">
              {filteredEntries.length === 0 && (
                <p className="text-center text-muted-foreground py-8">Nenhuma entrada encontrada. Adicione a primeira entrada ao logbook.</p>
              )}
              {filteredEntries.map((entry) => {
                const config = eventTypeConfig[entry.eventType] || eventTypeConfig.operation;
                const IconComponent = config.icon;
                return (
                  <div key={entry.id} className={`p-4 rounded-lg border ${!entry.acknowledged ? "border-destructive/50 bg-destructive/5" : "border-border bg-card"}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${config.color}`}>
                          <IconComponent className="h-4 w-4 text-white" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{config.label}</Badge>
                            {getSeverityBadge(entry.severity)}
                            {!entry.acknowledged && <Badge variant="destructive">Não Reconhecido</Badge>}
                          </div>
                          <p className="text-sm text-foreground">{entry.description}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(entry.timestamp).toLocaleString("pt-BR")}</span>
                            <span className="flex items-center gap-1"><User className="h-3 w-3" />{entry.operator}</span>
                            <span>Modo: {entry.dpMode}</span>
                          </div>
                          {entry.notes && <p className="text-xs text-muted-foreground italic mt-1">{entry.notes}</p>}
                        </div>
                      </div>
                      {!entry.acknowledged && (
                        <Button size="sm" variant="outline" onClick={() => ackMutation.mutate(entry.id)}>
                          <CheckCircle className="h-4 w-4 mr-1" />Reconhecer
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default SmartDPLogbook;
