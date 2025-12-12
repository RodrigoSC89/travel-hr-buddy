import { useState, useMemo, useCallback } from "react";;
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  BookOpen,
  Clock,
  User,
  AlertTriangle,
  CheckCircle,
  Activity,
  Settings,
  Download,
  Plus,
  Filter,
  Search,
  FileText,
  Ship,
  Anchor,
  Zap,
  RefreshCw,
  Calendar,
  MapPin
} from "lucide-react";

interface LogEntry {
  id: string;
  timestamp: string;
  eventType: "mode_change" | "alarm" | "sensor" | "watch_handover" | "operation" | "maintenance" | "incident";
  category: string;
  description: string;
  operator: string;
  dpMode: string;
  position?: { lat: number; lon: number };
  heading?: number;
  environmentalConditions?: {
    windSpeed: number;
    windDirection: number;
    waveHeight: number;
    current: number;
  };
  relatedAsog?: string;
  severity: "info" | "warning" | "critical";
  acknowledged: boolean;
  notes?: string;
}

const mockLogEntries: LogEntry[] = [
  {
    id: "LOG-001",
    timestamp: "2024-12-04T08:00:00",
    eventType: "watch_handover",
    category: "Operacional",
    description: "Watch handover - SDPO assumiu turno",
    operator: "João Silva - SDPO",
    dpMode: "Auto DP",
    severity: "info",
    acknowledged: true,
    environmentalConditions: { windSpeed: 15, windDirection: 180, waveHeight: 1.2, current: 0.8 }
  },
  {
    id: "LOG-002",
    timestamp: "2024-12-04T08:30:00",
    eventType: "mode_change",
    category: "Sistema DP",
    description: "Mudança de modo: Auto DP → TAM (Thruster Assisted Mooring)",
    operator: "João Silva - SDPO",
    dpMode: "TAM",
    relatedAsog: "ASOG-2024-001",
    severity: "warning",
    acknowledged: true
  },
  {
    id: "LOG-003",
    timestamp: "2024-12-04T09:15:00",
    eventType: "sensor",
    category: "Sensores",
    description: "Perda temporária de sinal MRU#1 - Fallback para MRU#2 ativo",
    operator: "João Silva - SDPO",
    dpMode: "TAM",
    severity: "warning",
    acknowledged: true,
    notes: "Sinal restaurado após 45 segundos. Manutenção preventiva agendada."
  },
  {
    id: "LOG-004",
    timestamp: "2024-12-04T10:00:00",
    eventType: "alarm",
    category: "Alarmes",
    description: "Alarme de corrente excedendo limite ASOG (1.3 kn → 1.5 kn atual)",
    operator: "João Silva - SDPO",
    dpMode: "TAM",
    relatedAsog: "ASOG-2024-001",
    severity: "critical",
    acknowledged: false,
    environmentalConditions: { windSpeed: 18, windDirection: 185, waveHeight: 1.5, current: 1.5 }
  },
  {
    id: "LOG-005",
    timestamp: "2024-12-04T10:30:00",
    eventType: "operation",
    category: "Operação",
    description: "Início de operação ROV - Posição mantida dentro dos limites",
    operator: "Maria Santos - JDPO",
    dpMode: "Auto DP",
    severity: "info",
    acknowledged: true,
    position: { lat: -22.9068, lon: -43.1729 }
  }
];

const eventTypeConfig = {
  mode_change: { label: "Mudança de Modo", icon: RefreshCw, color: "bg-blue-500" },
  alarm: { label: "Alarme", icon: AlertTriangle, color: "bg-red-500" },
  sensor: { label: "Sensor", icon: Activity, color: "bg-yellow-500" },
  watch_handover: { label: "Troca de Turno", icon: User, color: "bg-green-500" },
  operation: { label: "Operação", icon: Anchor, color: "bg-purple-500" },
  maintenance: { label: "Manutenção", icon: Settings, color: "bg-orange-500" },
  incident: { label: "Incidente", icon: Zap, color: "bg-red-600" }
};

export const SmartDPLogbook: React.FC = () => {
  const [entries, setEntries] = useState<LogEntry[]>(mockLogEntries);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [isNewEntryOpen, setIsNewEntryOpen] = useState(false);
  const [newEntry, setNewEntry] = useState<Partial<LogEntry>>({
    eventType: "operation",
    severity: "info",
    dpMode: "Auto DP"
  });

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.operator.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || entry.eventType === filterType;
    const matchesSeverity = filterSeverity === "all" || entry.severity === filterSeverity;
    return matchesSearch && matchesType && matchesSeverity;
  };

  const handleAddEntry = () => {
    if (!newEntry.description || !newEntry.operator) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const entry: LogEntry = {
      id: `LOG-${String(entries.length + 1).padStart(3, "0")}`,
      timestamp: new Date().toISOString(),
      eventType: newEntry.eventType as LogEntry["eventType"],
      category: eventTypeConfig[newEntry.eventType as keyof typeof eventTypeConfig]?.label || "Geral",
      description: newEntry.description || "",
      operator: newEntry.operator || "",
      dpMode: newEntry.dpMode || "Auto DP",
      severity: newEntry.severity as LogEntry["severity"],
      acknowledged: true,
      notes: newEntry.notes
    };

    setEntries([entry, ...entries]);
    setNewEntry({ eventType: "operation", severity: "info", dpMode: "Auto DP" });
    setIsNewEntryOpen(false);
    toast.success("Entrada registrada no logbook");
  };

  const handleAcknowledge = (id: string) => {
    setEntries(entries.map(e => e.id === id ? { ...e, acknowledged: true } : e));
    toast.success("Entrada reconhecida");
  };

  const handleExportPDF = () => {
    toast.success("Exportando logbook para PDF...");
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
    case "critical": return <Badge variant="destructive">Crítico</Badge>;
    case "warning": return <Badge className="bg-warning text-warning-foreground">Atenção</Badge>;
    default: return <Badge variant="secondary">Info</Badge>;
    }
  };

  const unacknowledgedCount = entries.filter(e => !e.acknowledged).length;

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
            <p className="text-muted-foreground">Registro automatizado conforme IMCA M117</p>
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
                    <Input placeholder="Nome - Função" value={newEntry.operator || ""} onChange={handleChange})} />
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
                  <Textarea placeholder="Descreva o evento detalhadamente..." value={newEntry.description || ""} onChange={handleChange})} rows={3} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Observações</label>
                  <Textarea placeholder="Notas adicionais..." value={newEntry.notes || ""} onChange={handleChange})} rows={2} />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={handleSetIsNewEntryOpen}>Cancelar</Button>
                  <Button onClick={handleAddEntry}>Registrar Entrada</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="w-4 h-4 mr-2" />Exportar PDF
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Entradas</p>
                <p className="text-2xl font-bold">{entries.length}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Mudanças de Modo</p>
                <p className="text-2xl font-bold">{entries.filter(e => e.eventType === "mode_change").length}</p>
              </div>
              <RefreshCw className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Alarmes</p>
                <p className="text-2xl font-bold">{entries.filter(e => e.eventType === "alarm").length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Reconhecidos</p>
                <p className="text-2xl font-bold">{entries.filter(e => e.acknowledged).length}/{entries.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
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
              <Input placeholder="Buscar por descrição ou operador..." value={searchTerm} onChange={handleChange} className="pl-10" />
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
          <CardDescription>Últimos registros de operações DP</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="space-y-3">
              {filteredEntries.map((entry) => {
                const config = eventTypeConfig[entry.eventType];
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
                            <span className="font-medium">{entry.id}</span>
                            <Badge variant="outline">{config.label}</Badge>
                            {getSeverityBadge(entry.severity)}
                            {!entry.acknowledged && <Badge variant="destructive">Não Reconhecido</Badge>}
                          </div>
                          <p className="text-sm text-foreground">{entry.description}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(entry.timestamp).toLocaleString("pt-BR")}</span>
                            <span className="flex items-center gap-1"><User className="h-3 w-3" />{entry.operator}</span>
                            <span className="flex items-center gap-1"><Anchor className="h-3 w-3" />{entry.dpMode}</span>
                            {entry.relatedAsog && <span className="flex items-center gap-1"><FileText className="h-3 w-3" />{entry.relatedAsog}</span>}
                          </div>
                          {entry.environmentalConditions && (
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1 p-2 bg-muted/50 rounded">
                              <span>🌊 {entry.environmentalConditions.waveHeight}m</span>
                              <span>💨 {entry.environmentalConditions.windSpeed}kn / {entry.environmentalConditions.windDirection}°</span>
                              <span>🌀 {entry.environmentalConditions.current}kn</span>
                            </div>
                          )}
                          {entry.notes && <p className="text-xs text-muted-foreground italic mt-1">Nota: {entry.notes}</p>}
                        </div>
                      </div>
                      {!entry.acknowledged && (
                        <Button size="sm" variant="outline" onClick={() => handlehandleAcknowledge}>
                          <CheckCircle className="w-4 h-4 mr-1" />Reconhecer
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
