/**
 * MARPOL Tabs - Full-featured MARPOL Compliance module
 * Restored: separate e-ORB/e-GRB, tank management, Excel/PDF export, Supabase persistence
 */
import { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { exportToCSV, exportTableToPDF } from "@/lib/export-utils";
import {
  Leaf, Waves, Trash2, AlertTriangle, CheckCircle2,
  FileText, Activity, Ship, RefreshCw, Clock, Shield,
  Globe, Droplets, Wind, BookOpen, Plus, Search,
  MapPin, Anchor, AlertOctagon, BarChart3, TrendingDown,
  FileDown, Table2, Gauge, ThermometerSun, Pencil,
  Download, FileSpreadsheet,
} from "lucide-react";
import {
  MARPOL_ANNEXES, WASTE_CATEGORIES, SPECIAL_ZONES,
  getStatusColor, getStatusBadgeConfig,
  type ComplianceScores, type WasteLog, type EmissionsData,
  type TankData, type MARPOLAlert, type MARPOLVessel,
} from "./types";

interface MARPOLTabsProps {
  scores: ComplianceScores;
  wasteLogs: WasteLog[];
  emissionsData: EmissionsData;
  tanks: TankData[];
  alerts: MARPOLAlert[];
  vessels: MARPOLVessel[];
  refetch: () => void;
  onExportORB: () => void;
  onExportGRB: () => void;
}

function StatusBadge({ status }: { status: string }) {
  const c = getStatusBadgeConfig(status);
  return <Badge variant={c.variant}>{c.label}</Badge>;
}

// ─── Excel export helper ───
async function exportToExcel(data: Record<string, unknown>[], filename: string) {
  try {
    toast.info("Gerando Excel...");
    const { getXLSX } = await import("@/lib/excel/lazy-xlsx");
    const XLSX = await getXLSX();
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Dados");
    XLSX.writeFile(wb, `${filename}_${new Date().toISOString().split("T")[0]}.xlsx`);
    toast.success("Excel exportado com sucesso!");
  } catch {
    toast.error("Erro ao exportar Excel");
  }
}

// ─── ORB/GRB columns for export ───
const RECORD_COLUMNS = [
  { key: "date", label: "Data" },
  { key: "type", label: "Tipo" },
  { key: "category", label: "Categoria" },
  { key: "quantity", label: "Quantidade" },
  { key: "unit", label: "Unidade" },
  { key: "method", label: "Método" },
  { key: "location", label: "Localização" },
  { key: "coordinates", label: "Coordenadas" },
  { key: "distanceFromShore", label: "Dist. Costa (nm)" },
  { key: "certificate", label: "Certificado" },
];

export function MARPOLTabs({
  scores, wasteLogs, emissionsData, tanks, alerts, vessels,
  refetch, onExportORB, onExportGRB,
}: MARPOLTabsProps) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedAnnex, setSelectedAnnex] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [orbSearch, setOrbSearch] = useState("");
  const [grbSearch, setGrbSearch] = useState("");

  // ─── Entry dialog state ───
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [entryBook, setEntryBook] = useState<"ORB" | "GRB">("GRB");
  const [entryForm, setEntryForm] = useState({
    type: "", category: "B", quantity: "", unit: "kg",
    method: "port", location: "", coordinates: "", distanceNm: "",
    notes: "",
  });
  const [savingEntry, setSavingEntry] = useState(false);

  // ─── Tank dialog state ───
  const [showTankDialog, setShowTankDialog] = useState(false);
  const [tankEditMode, setTankEditMode] = useState<"add" | "edit">("add");
  const [editingTank, setEditingTank] = useState<TankData | null>(null);
  const [tankForm, setTankForm] = useState({
    name: "", capacity: "", currentLevel: "", unit: "L",
  });
  const [savingTank, setSavingTank] = useState(false);

  // ─── Filtered logs ───
  const orbLogs = useMemo(() => {
    let logs = wasteLogs.filter(l => l.recordBook === "ORB" || l.type.toLowerCase().includes("oil") || l.type.toLowerCase().includes("óleo"));
    if (orbSearch) logs = logs.filter(l => l.type.toLowerCase().includes(orbSearch.toLowerCase()) || l.location.toLowerCase().includes(orbSearch.toLowerCase()));
    return logs;
  }, [wasteLogs, orbSearch]);

  const grbLogs = useMemo(() => {
    let logs = wasteLogs.filter(l => l.recordBook === "GRB" || l.type.toLowerCase().includes("garbage") || l.type.toLowerCase().includes("lixo") || (!l.type.toLowerCase().includes("oil") && !l.type.toLowerCase().includes("óleo")));
    if (grbSearch) logs = logs.filter(l => l.type.toLowerCase().includes(grbSearch.toLowerCase()) || l.location.toLowerCase().includes(grbSearch.toLowerCase()));
    return logs;
  }, [wasteLogs, grbSearch]);

  const criticalTanks = tanks.filter(t => t.status === "critical").length;
  const warningTanks = tanks.filter(t => t.status === "warning").length;

  // ─── Save new waste entry to Supabase ───
  const handleSaveEntry = useCallback(async () => {
    if (!entryForm.type || !entryForm.quantity) {
      toast.error("Preencha tipo e quantidade");
      return;
    }
    setSavingEntry(true);
    try {
      const { error } = await supabase.from("logs").insert({
        module: "waste",
        level: "info",
        message: `${entryBook}: ${entryForm.type}`,
        metadata: {
          type: entryForm.type,
          category: entryForm.category,
          quantity: parseFloat(entryForm.quantity),
          unit: entryForm.unit,
          method: entryForm.method === "port" ? "Port Reception Facility" : entryForm.method === "sea" ? "Descarga ao Mar" : entryForm.method === "incineration" ? "Incineração a Bordo" : "Compactação",
          location: entryForm.location,
          coordinates: entryForm.coordinates,
          distanceNm: parseFloat(entryForm.distanceNm) || 0,
          recordBook: entryBook,
          notes: entryForm.notes,
          certificate: `CERT-${new Date().getFullYear()}-${Date.now().toString(36).slice(-4).toUpperCase()}`,
        },
      });
      if (error) throw error;
      toast.success(`Registro ${entryBook} salvo com sucesso`);
      setShowNewEntry(false);
      setEntryForm({ type: "", category: "B", quantity: "", unit: "kg", method: "port", location: "", coordinates: "", distanceNm: "", notes: "" });
      refetch();
    } catch (err) {
      toast.error("Erro ao salvar registro");
    } finally {
      setSavingEntry(false);
    }
  }, [entryBook, entryForm, refetch]);

  // ─── Save tank to Supabase ───
  const handleSaveTank = useCallback(async () => {
    if (!tankForm.name || !tankForm.capacity) {
      toast.error("Preencha nome e capacidade");
      return;
    }
    setSavingTank(true);
    try {
      if (tankEditMode === "edit" && editingTank) {
        const { error } = await (supabase.from as Function)("equipment_sensors")
          .update({
            value: parseFloat(tankForm.currentLevel) || 0,
            max_threshold: parseFloat(tankForm.capacity),
            unit: tankForm.unit,
            recorded_at: new Date().toISOString(),
          })
          .eq("id", editingTank.id);
        if (error) throw error;
        toast.success("Volume do tanque atualizado");
      } else {
        const { error } = await (supabase.from as Function)("equipment_sensors")
          .insert({
            sensor_type: tankForm.name,
            equipment_id: `tank-${Date.now()}`,
            equipment_name: tankForm.name,
            value: parseFloat(tankForm.currentLevel) || 0,
            max_threshold: parseFloat(tankForm.capacity),
            unit: tankForm.unit,
            status: "active",
            recorded_at: new Date().toISOString(),
          });
        if (error) throw error;
        toast.success("Tanque adicionado com sucesso");
      }
      setShowTankDialog(false);
      setTankForm({ name: "", capacity: "", currentLevel: "", unit: "L" });
      setEditingTank(null);
      refetch();
    } catch {
      toast.error("Erro ao salvar tanque");
    } finally {
      setSavingTank(false);
    }
  }, [tankEditMode, editingTank, tankForm, refetch]);

  const openEditTank = useCallback((tank: TankData) => {
    setTankEditMode("edit");
    setEditingTank(tank);
    setTankForm({
      name: tank.name,
      capacity: String(tank.capacity),
      currentLevel: String(tank.currentLevel),
      unit: tank.unit,
    });
    setShowTankDialog(true);
  }, []);

  const openAddTank = useCallback(() => {
    setTankEditMode("add");
    setEditingTank(null);
    setTankForm({ name: "", capacity: "", currentLevel: "", unit: "L" });
    setShowTankDialog(true);
  }, []);

  // ─── Export helpers ───
  const handleExport = useCallback((data: WasteLog[], bookName: string, format: "csv" | "excel" | "pdf") => {
    const exportData = data.map(l => ({
      date: l.date, type: l.type, category: l.category,
      quantity: l.quantity, unit: l.unit, method: l.method,
      location: l.location, coordinates: l.coordinates,
      distanceFromShore: l.distanceFromShore, certificate: l.certificate,
    })) as unknown as Record<string, unknown>[];

    if (format === "csv") {
      exportToCSV(exportData, `${bookName}_${new Date().toISOString().split("T")[0]}`, { columns: RECORD_COLUMNS });
    } else if (format === "excel") {
      exportToExcel(exportData, bookName);
    } else {
      exportTableToPDF(exportData, `${bookName} — MARPOL Compliance`, bookName, {
        columns: RECORD_COLUMNS, orientation: "landscape",
      });
    }
  }, []);

  // ─── Record Book renderer (shared for ORB/GRB) ───
  const renderRecordBook = (logs: WasteLog[], bookType: "ORB" | "GRB", search: string, setSearch: (v: string) => void) => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              {bookType === "ORB" ? "e-ORB — Oil Record Book" : "e-GRB — Garbage Record Book"}
            </CardTitle>
            <CardDescription>
              {bookType === "ORB"
                ? "MARPOL Anexo I — Registro de operações com óleo e resíduos oleosos"
                : "MARPOL Anexo V — Registro de descarte de lixo (MEPC.295(71))"}
            </CardDescription>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button size="sm" variant="outline" onClick={() => handleExport(logs, `e-${bookType}`, "csv")}>
              <FileDown className="h-4 w-4 mr-1" />CSV
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleExport(logs, `e-${bookType}`, "excel")}>
              <FileSpreadsheet className="h-4 w-4 mr-1" />Excel
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleExport(logs, `e-${bookType}`, "pdf")}>
              <Download className="h-4 w-4 mr-1" />PDF
            </Button>
            <Button size="sm" onClick={() => { setEntryBook(bookType); setShowNewEntry(true); }}>
              <Plus className="h-4 w-4 mr-1" />Nova Entrada
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por tipo ou localização..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <p className="text-xl font-bold">{logs.length}</p>
            <p className="text-xs text-muted-foreground">Total Registros</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <p className="text-xl font-bold">{logs.reduce((s, l) => s + l.quantity, 0).toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">Quantidade Total</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <p className="text-xl font-bold">{new Set(logs.map(l => l.location)).size}</p>
            <p className="text-xs text-muted-foreground">Localizações</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <p className="text-xl font-bold">{new Set(logs.map(l => l.category)).size}</p>
            <p className="text-xs text-muted-foreground">Categorias</p>
          </div>
        </div>

        {logs.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <p className="font-medium">Nenhum registro {bookType} encontrado</p>
            <p className="text-sm mt-1">Clique em "Nova Entrada" para adicionar</p>
          </div>
        ) : (
          <div className="space-y-2">
            {logs.map(log => (
              <motion.div key={log.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                  <Badge variant="outline" className="text-xs w-10 justify-center">{log.category}</Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{log.type}</p>
                    <p className="text-xs text-muted-foreground">{log.method} • {log.location}</p>
                    {log.coordinates && <p className="text-xs text-muted-foreground">📍 {log.coordinates} • {log.distanceFromShore}nm da costa</p>}
                  </div>
                  <div className="text-right text-xs">
                    <span className="font-medium">{log.quantity} {log.unit}</span>
                    <p className="text-muted-foreground">{log.date}</p>
                    <p className="text-primary mt-0.5">{log.certificate}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <>
      {/* KPI CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <Shield className="h-6 w-6 mx-auto mb-1 text-success" />
            <p className="text-2xl font-bold text-success">{scores.overall}%</p>
            <p className="text-xs text-muted-foreground">Score Geral</p>
          </CardContent>
        </Card>
        {MARPOL_ANNEXES.map((annex, i) => {
          const key = `annex${annex.number}`;
          const score = scores[key] || 0;
          return (
            <Card key={annex.number} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => { setSelectedAnnex(i); setActiveTab("annexes"); }}>
              <CardContent className="p-4 text-center">
                <annex.icon className={`h-5 w-5 mx-auto mb-1 ${score >= 90 ? "text-success" : score >= 70 ? "text-warning" : "text-destructive"}`} />
                <p className={`text-xl font-bold ${score >= 90 ? "text-success" : score >= 70 ? "text-warning" : "text-destructive"}`}>{score}%</p>
                <p className="text-xs text-muted-foreground">Anexo {annex.number}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ALERTS BAR */}
      {(alerts.length > 0 || criticalTanks > 0) && (
        <Card className="border-warning/50 bg-warning/5">
          <CardContent className="p-4">
            <div className="space-y-2">
              {criticalTanks > 0 && (
                <div className="flex items-center gap-3 p-2 rounded-lg bg-destructive/10">
                  <AlertOctagon className="h-4 w-4 text-destructive" />
                  <span className="text-sm font-medium">{criticalTanks} tanque(s) em nível crítico — descarte urgente necessário</span>
                </div>
              )}
              {warningTanks > 0 && (
                <div className="flex items-center gap-3 p-2 rounded-lg bg-warning/10">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  <span className="text-sm">{warningTanks} tanque(s) em nível de atenção</span>
                </div>
              )}
              {alerts.map(alert => (
                <div key={alert.id} className={`flex items-center justify-between p-2 rounded-lg ${alert.severity === "critical" ? "bg-destructive/10" : "bg-warning/10"}`}>
                  <div className="flex items-center gap-3">
                    <AlertTriangle className={`h-4 w-4 ${alert.severity === "critical" ? "text-destructive" : "text-warning"}`} />
                    <span className="text-sm">{alert.message}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{alert.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* MAIN TABS */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="dashboard" className="gap-2"><BarChart3 className="h-4 w-4" />Dashboard</TabsTrigger>
          <TabsTrigger value="annexes" className="gap-2"><Globe className="h-4 w-4" />Anexos I-VI</TabsTrigger>
          <TabsTrigger value="tanks" className="gap-2"><Gauge className="h-4 w-4" />Tanques</TabsTrigger>
          <TabsTrigger value="orb" className="gap-2"><Droplets className="h-4 w-4" />e-ORB</TabsTrigger>
          <TabsTrigger value="grb" className="gap-2"><Trash2 className="h-4 w-4" />e-GRB</TabsTrigger>
          <TabsTrigger value="emissions" className="gap-2"><Wind className="h-4 w-4" />Emissões (VI)</TabsTrigger>
          <TabsTrigger value="categories" className="gap-2"><Table2 className="h-4 w-4" />Categorias A-J</TabsTrigger>
          <TabsTrigger value="zones" className="gap-2"><MapPin className="h-4 w-4" />Zonas Especiais</TabsTrigger>
          <TabsTrigger value="vessels" className="gap-2"><Ship className="h-4 w-4" />Embarcações</TabsTrigger>
          <TabsTrigger value="gmp" className="gap-2"><BookOpen className="h-4 w-4" />GMP</TabsTrigger>
        </TabsList>

        {/* DASHBOARD TAB */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-primary" />Compliance Geral MARPOL</CardTitle>
                <CardDescription>Status em tempo real de todos os 6 Anexos da MARPOL 73/78</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {MARPOL_ANNEXES.map((annex, idx) => {
                    const key = `annex${annex.number}`;
                    const score = scores[key] || 0;
                    const Icon = annex.icon;
                    return (
                      <motion.div key={annex.number} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                        <div className={`p-4 rounded-lg border cursor-pointer hover:shadow-md transition-all ${selectedAnnex === idx ? "ring-2 ring-primary" : ""}`}
                          onClick={() => { setSelectedAnnex(idx); setActiveTab("annexes"); }}>
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${score >= 90 ? "bg-success/10 text-success" : score >= 70 ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"}`}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-sm">Anexo {annex.number}</span>
                                <span className={`text-lg font-bold ${score >= 90 ? "text-success" : score >= 70 ? "text-warning" : "text-destructive"}`}>{score}%</span>
                              </div>
                              <p className="text-xs text-muted-foreground truncate">{annex.title}</p>
                              <Progress value={score} className="h-1.5 mt-2" />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><ThermometerSun className="h-5 w-5 text-primary" />Emissões (Anexo VI)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "SOx (Enxofre)", value: emissionsData.sox, unit: "%", limit: 0.50, limitLabel: "IMO 2020" },
                  { label: "NOx (Tier III)", value: emissionsData.nox, unit: "g/kWh", limit: 14.4, limitLabel: "Tier III" },
                  { label: "CO₂ Intensity", value: emissionsData.co2, unit: "kg/nm", limit: 100, limitLabel: "CII" },
                  { label: "Material Particulado", value: emissionsData.pm, unit: "g/kWh", limit: 5, limitLabel: "Limite" },
                ].map(em => (
                  <div key={em.label} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{em.label}</span>
                      <span className={`font-bold ${em.value <= em.limit ? "text-success" : "text-destructive"}`}>
                        {em.value || "—"} {em.unit}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={Math.min((em.value / em.limit) * 100, 100)} className="h-1.5 flex-1" />
                      <span className="text-xs text-muted-foreground">{em.limitLabel}: {em.limit}</span>
                    </div>
                  </div>
                ))}
                <Separator />
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Combustível Atual</span>
                    <Badge variant="outline">{emissionsData.fuelType}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Teor de Enxofre: {emissionsData.sulphurContent}% — {emissionsData.sulphurContent <= 0.50 ? "✅ Conforme IMO 2020" : "⚠️ Acima do limite"}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tank Status Summary */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2"><Gauge className="h-5 w-5 text-primary" />Tanques de Resíduos</CardTitle>
                  <CardDescription>Nível de preenchimento dos tanques — monitoramento em tempo real</CardDescription>
                </div>
                <Button size="sm" variant="outline" onClick={() => setActiveTab("tanks")}>
                  Ver Todos
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {tanks.map(tank => (
                  <div key={tank.id} className={`p-4 rounded-lg border ${tank.status === "critical" ? "border-destructive/50 bg-destructive/5" : tank.status === "warning" ? "border-warning/50 bg-warning/5" : "border-border"}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium truncate">{tank.name}</span>
                      <StatusBadge status={tank.status} />
                    </div>
                    <div className="relative h-20 bg-muted/50 rounded-lg overflow-hidden mb-2">
                      <motion.div
                        className={`absolute bottom-0 left-0 right-0 rounded-b-lg ${tank.status === "critical" ? "bg-destructive/30" : tank.status === "warning" ? "bg-warning/30" : "bg-success/30"}`}
                        initial={{ height: 0 }}
                        animate={{ height: `${tank.percentage}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`text-xl font-bold ${getStatusColor(tank.status)}`}>{tank.percentage}%</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground text-center">{tank.currentLevel}/{tank.capacity} {tank.unit}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ANNEXES TAB */}
        <TabsContent value="annexes" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {MARPOL_ANNEXES.map((annex, idx) => {
                const key = `annex${annex.number}`;
                const score = scores[key] || 0;
                const Icon = annex.icon;
                const isSelected = selectedAnnex === idx;
                return (
                  <motion.div key={annex.number} layout>
                    <Card className={`cursor-pointer transition-all hover:shadow-md ${isSelected ? "ring-2 ring-primary" : ""}`} onClick={() => setSelectedAnnex(idx)}>
                      <CardContent className="p-5">
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-xl ${score >= 90 ? "bg-success/10 text-success" : score >= 70 ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"}`}>
                            <Icon className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-semibold text-lg">Anexo {annex.number} — {annex.title}</h3>
                              <span className={`text-2xl font-bold ${score >= 90 ? "text-success" : score >= 70 ? "text-warning" : "text-destructive"}`}>{score}%</span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">{annex.description}</p>
                            <Progress value={score} className="h-2 mb-3" />
                            {annex.specialAreas.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {annex.specialAreas.slice(0, 4).map(area => (
                                  <Badge key={area} variant="outline" className="text-xs">{area}</Badge>
                                ))}
                                {annex.specialAreas.length > 4 && <Badge variant="outline" className="text-xs">+{annex.specialAreas.length - 4}</Badge>}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
            {selectedAnnex !== null && (
              <Card>
                <CardHeader>
                  <CardTitle>Requisitos — Anexo {MARPOL_ANNEXES[selectedAnnex].number}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {MARPOL_ANNEXES[selectedAnnex].requirements.map(req => (
                      <li key={req} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* TANKS TAB — with add/edit */}
        <TabsContent value="tanks" className="space-y-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-lg font-semibold">Gestão de Tanques de Resíduos</h3>
              <p className="text-sm text-muted-foreground">Adicione, edite volumes e monitore níveis em tempo real</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => handleExport(
                tanks.map(t => ({ id: t.id, type: t.name, category: "", quantity: t.currentLevel, unit: t.unit, location: "", date: t.lastUpdated, method: "", certificate: "", recordBook: "", coordinates: "", distanceFromShore: 0 })),
                "Tanques_MARPOL", "excel"
              )}>
                <FileSpreadsheet className="h-4 w-4 mr-1" />Exportar
              </Button>
              <Button size="sm" onClick={openAddTank}>
                <Plus className="h-4 w-4 mr-1" />Novo Tanque
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tanks.map(tank => (
              <Card key={tank.id} className={tank.status === "critical" ? "border-destructive/50" : tank.status === "warning" ? "border-warning/50" : ""}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold">{tank.name}</h4>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={tank.status} />
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEditTank(tank)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="relative h-32 bg-muted/50 rounded-lg overflow-hidden mb-3">
                    <motion.div
                      className={`absolute bottom-0 left-0 right-0 rounded-b-lg ${tank.status === "critical" ? "bg-destructive/30" : tank.status === "warning" ? "bg-warning/30" : "bg-success/30"}`}
                      initial={{ height: 0 }}
                      animate={{ height: `${tank.percentage}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className={`text-3xl font-bold ${getStatusColor(tank.status)}`}>{tank.percentage}%</span>
                    </div>
                  </div>
                  <p className="text-sm text-center text-muted-foreground">{tank.currentLevel}/{tank.capacity} {tank.unit}</p>
                  <p className="text-xs text-center text-muted-foreground mt-1">Atualizado: {tank.lastUpdated}</p>
                </CardContent>
              </Card>
            ))}
            {tanks.length === 0 && (
              <Card className="col-span-full">
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Gauge className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  <p className="font-medium">Nenhum tanque cadastrado</p>
                  <p className="text-sm mt-1">Adicione tanques para monitoramento</p>
                  <Button className="mt-4" onClick={openAddTank}><Plus className="h-4 w-4 mr-1" />Adicionar Tanque</Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* e-ORB TAB — Oil Record Book */}
        <TabsContent value="orb" className="space-y-6">
          {renderRecordBook(orbLogs, "ORB", orbSearch, setOrbSearch)}
        </TabsContent>

        {/* e-GRB TAB — Garbage Record Book */}
        <TabsContent value="grb" className="space-y-6">
          {renderRecordBook(grbLogs, "GRB", grbSearch, setGrbSearch)}
        </TabsContent>

        {/* EMISSIONS TAB */}
        <TabsContent value="emissions" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Wind className="h-5 w-5" />Monitoramento de Emissões</CardTitle>
                <CardDescription>Dados em tempo real — Conformidade IMO 2020 & Tier III</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {[
                  { label: "SOx (Teor de Enxofre)", value: emissionsData.sox, unit: "%", limit: 0.50, limitECA: 0.10 },
                  { label: "NOx (Óxidos de Nitrogênio)", value: emissionsData.nox, unit: "g/kWh", limit: 14.4, limitECA: 3.4 },
                  { label: "CO₂ (Intensidade de Carbono)", value: emissionsData.co2, unit: "kg/nm", limit: 100, limitECA: 100 },
                  { label: "Material Particulado (PM)", value: emissionsData.pm, unit: "g/kWh", limit: 5, limitECA: 2.5 },
                ].map(em => (
                  <div key={em.label} className="p-4 rounded-lg border">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-medium text-sm">{em.label}</span>
                        <p className="text-xs text-muted-foreground">Global: {em.limit} {em.unit} | ECA: {em.limitECA} {em.unit}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-xl font-bold ${em.value <= em.limit ? "text-success" : "text-destructive"}`}>{em.value || "—"}</span>
                        <span className="text-sm text-muted-foreground ml-1">{em.unit}</span>
                      </div>
                    </div>
                    <Progress value={Math.min((em.value / em.limit) * 100, 100)} className="h-2" />
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-muted-foreground">0</span>
                      <span className="text-xs">{em.value <= em.limit ? "✅ Conforme" : "⚠️ Acima do limite"}</span>
                      <span className="text-xs text-muted-foreground">{em.limit}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <div className="space-y-6">
              <Card>
                <CardHeader><CardTitle>Combustível em Uso</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-success/5 border border-success/20 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">VLSFO 0.50%</span>
                      <CheckCircle2 className="h-5 w-5 text-success" />
                    </div>
                    <p className="text-sm text-muted-foreground">Conforme IMO 2020 Global Sulphur Cap</p>
                    <Progress value={75} className="h-1.5 mt-2" />
                    <p className="text-xs text-muted-foreground mt-1">ROB: ~75% do tanque principal</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">MGO 0.10% (ECA)</span>
                      <Badge variant="outline">Reserva</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Para uso em Emission Control Areas</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><TrendingDown className="h-5 w-5" />CII & EEXI</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-muted/50 text-center">
                      <p className="text-3xl font-bold text-success">B</p>
                      <p className="text-xs text-muted-foreground mt-1">CII Rating</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50 text-center">
                      <p className="text-3xl font-bold text-primary">✓</p>
                      <p className="text-xs text-muted-foreground mt-1">EEXI Conforme</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* CATEGORIES TAB */}
        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Table2 className="h-5 w-5 text-primary" />Categorias de Lixo — MARPOL Anexo V (MEPC.295(71))</CardTitle>
              <CardDescription>Classificação completa A-J com regras de descarga por zona</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {WASTE_CATEGORIES.map(cat => (
                  <motion.div key={cat.code} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                    <div className="p-4 rounded-lg border hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <span className="text-lg font-bold text-primary">{cat.code}</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{cat.name}</h4>
                          <Badge variant={cat.color as "default" | "secondary" | "destructive" | "outline"} className="text-xs mt-0.5">
                            {cat.color === "destructive" ? "Restrição Severa" : cat.color === "warning" ? "Condições Específicas" : "Permitido"}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{cat.discharge}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ZONES TAB */}
        <TabsContent value="zones">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5 text-primary" />Zonas Especiais & ECAs</CardTitle>
              <CardDescription>Áreas com restrições ambientais elevadas — Geofencing ativo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SPECIAL_ZONES.map(zone => (
                  <Card key={zone.name} className={`border ${zone.risk === "critical" ? "border-destructive/50 bg-destructive/5" : zone.risk === "high" ? "border-warning/50 bg-warning/5" : ""}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Globe className={`h-5 w-5 ${zone.risk === "critical" ? "text-destructive" : zone.risk === "high" ? "text-warning" : "text-primary"}`} />
                          <h4 className="font-semibold">{zone.name}</h4>
                        </div>
                        <Badge variant={zone.risk === "critical" ? "destructive" : zone.risk === "high" ? "secondary" : "outline"}>
                          {zone.risk === "critical" ? "Proteção Total" : zone.risk === "high" ? "Restrição Elevada" : "Moderado"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{zone.restrictions}</p>
                      <div className="flex flex-wrap gap-1">
                        {zone.annexes.map(a => (
                          <Badge key={a} variant="outline" className="text-xs">Anexo {a}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* VESSELS TAB */}
        <TabsContent value="vessels">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Ship className="h-5 w-5 text-primary" />Compliance por Embarcação</CardTitle>
            </CardHeader>
            <CardContent>
              {vessels.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Ship className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  <p className="font-medium">Nenhuma embarcação cadastrada</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {vessels.map(vessel => (
                    <Card key={vessel.id} className="border">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Anchor className="h-5 w-5 text-primary" />
                            <div>
                              <h4 className="font-semibold">{vessel.name}</h4>
                              <p className="text-xs text-muted-foreground">{vessel.vessel_type || "Vessel"} {vessel.imo_number ? `• IMO ${vessel.imo_number}` : ""}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right text-sm">
                              <span>{vessel.certificates} certificados</span>
                              {vessel.expiringSoon > 0 && (
                                <p className="text-warning text-xs flex items-center gap-1">
                                  <Clock className="h-3 w-3" />{vessel.expiringSoon} expirando em 90d
                                </p>
                              )}
                            </div>
                            <StatusBadge status={vessel.overallStatus} />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* GMP TAB */}
        <TabsContent value="gmp">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary" />Garbage Management Plan (GMP)</CardTitle>
              <CardDescription>Plano de Gestão de Lixo conforme MARPOL Anexo V — Resolução MEPC.220(63)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg border">
                  <h4 className="font-semibold mb-2 flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" />Procedimentos de Coleta</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Segregação na fonte (10 categorias)</li>
                    <li>• Contêineres identificados por cor</li>
                    <li>• Frequência de coleta definida</li>
                    <li>• Responsáveis designados</li>
                  </ul>
                </div>
                <div className="p-4 rounded-lg border">
                  <h4 className="font-semibold mb-2 flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" />Equipamentos</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Compactador de lixo operacional</li>
                    <li>• Incinerador (quando aplicável)</li>
                    <li>• Triturador de alimentos</li>
                    <li>• Tanques de retenção</li>
                  </ul>
                </div>
                <div className="p-4 rounded-lg border">
                  <h4 className="font-semibold mb-2 flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" />Descarga em Porto</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Port Reception Facilities</li>
                    <li>• Certificados de recebimento</li>
                    <li>• Registro no GRB obrigatório</li>
                    <li>• Manifesto de resíduos</li>
                  </ul>
                </div>
              </div>
              <Separator />
              <div>
                <h4 className="font-semibold mb-3">Placards Obrigatórios (embarcações ≥12m)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    "Placard em cada acomodação com regras de descarte",
                    "Instruções de segregação na galley",
                    "Sinalização nos pontos de coleta no convés",
                    "Regras para zonas especiais visíveis na ponte",
                  ].map(item => (
                    <div key={item} className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                      <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Separator />
              <div>
                <h4 className="font-semibold mb-3">Treinamento da Tripulação</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-4 rounded-lg border bg-success/5">
                    <p className="font-medium">Familiarização Inicial</p>
                    <p className="text-sm text-muted-foreground">Todos os tripulantes — ao embarcar</p>
                    <Badge className="mt-2" variant="default">Obrigatório</Badge>
                  </div>
                  <div className="p-4 rounded-lg border bg-success/5">
                    <p className="font-medium">Reciclagem Periódica</p>
                    <p className="text-sm text-muted-foreground">Responsáveis por resíduos — trimestral</p>
                    <Badge className="mt-2" variant="default">Obrigatório</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ─── NEW ENTRY DIALOG ─── */}
      <Dialog open={showNewEntry} onOpenChange={setShowNewEntry}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nova Entrada — {entryBook === "ORB" ? "Oil Record Book (e-ORB)" : "Garbage Record Book (e-GRB)"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tipo de Registro</Label>
                <Select value={entryBook} onValueChange={v => setEntryBook(v as "ORB" | "GRB")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ORB">e-ORB (Oil Record Book)</SelectItem>
                    <SelectItem value="GRB">e-GRB (Garbage Record Book)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Categoria (A-J)</Label>
                <Select value={entryForm.category} onValueChange={v => setEntryForm(p => ({ ...p, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {WASTE_CATEGORIES.map(c => (
                      <SelectItem key={c.code} value={c.code}>{c.code} — {c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Tipo / Descrição *</Label>
              <Input placeholder="Ex: Descarte de resíduos oleosos" value={entryForm.type} onChange={e => setEntryForm(p => ({ ...p, type: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Quantidade *</Label>
                <Input type="number" placeholder="0" value={entryForm.quantity} onChange={e => setEntryForm(p => ({ ...p, quantity: e.target.value }))} />
              </div>
              <div>
                <Label>Unidade</Label>
                <Select value={entryForm.unit} onValueChange={v => setEntryForm(p => ({ ...p, unit: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="L">Litros</SelectItem>
                    <SelectItem value="m3">m³</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Método de Descarte</Label>
              <Select value={entryForm.method} onValueChange={v => setEntryForm(p => ({ ...p, method: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="port">Port Reception Facility</SelectItem>
                  <SelectItem value="sea">Descarga ao Mar (conforme regras)</SelectItem>
                  <SelectItem value="incineration">Incineração a Bordo</SelectItem>
                  <SelectItem value="compaction">Compactação</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Localização</Label>
                <Input placeholder="Porto de Santos" value={entryForm.location} onChange={e => setEntryForm(p => ({ ...p, location: e.target.value }))} />
              </div>
              <div>
                <Label>Coordenadas</Label>
                <Input placeholder="23°56'S 46°20'W" value={entryForm.coordinates} onChange={e => setEntryForm(p => ({ ...p, coordinates: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label>Distância da Costa (nm)</Label>
              <Input type="number" placeholder="0" value={entryForm.distanceNm} onChange={e => setEntryForm(p => ({ ...p, distanceNm: e.target.value }))} />
            </div>
            <div>
              <Label>Observações</Label>
              <Textarea placeholder="Detalhes adicionais..." rows={2} value={entryForm.notes} onChange={e => setEntryForm(p => ({ ...p, notes: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewEntry(false)}>Cancelar</Button>
            <Button onClick={handleSaveEntry} disabled={savingEntry}>
              {savingEntry ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
              Registrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── TANK ADD/EDIT DIALOG ─── */}
      <Dialog open={showTankDialog} onOpenChange={setShowTankDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{tankEditMode === "edit" ? "Editar Volume do Tanque" : "Adicionar Novo Tanque"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome do Tanque *</Label>
              <Input
                placeholder="Ex: Sludge Tank"
                value={tankForm.name}
                onChange={e => setTankForm(p => ({ ...p, name: e.target.value }))}
                disabled={tankEditMode === "edit"}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Capacidade Total *</Label>
                <Input type="number" placeholder="5000" value={tankForm.capacity} onChange={e => setTankForm(p => ({ ...p, capacity: e.target.value }))} />
              </div>
              <div>
                <Label>Nível Atual</Label>
                <Input type="number" placeholder="0" value={tankForm.currentLevel} onChange={e => setTankForm(p => ({ ...p, currentLevel: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label>Unidade</Label>
              <Select value={tankForm.unit} onValueChange={v => setTankForm(p => ({ ...p, unit: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="L">Litros</SelectItem>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="m3">m³</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {tankForm.capacity && tankForm.currentLevel && (
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="flex justify-between text-sm mb-1">
                  <span>Preenchimento</span>
                  <span className="font-bold">{Math.round((parseFloat(tankForm.currentLevel) / parseFloat(tankForm.capacity)) * 100)}%</span>
                </div>
                <Progress value={Math.min((parseFloat(tankForm.currentLevel) / parseFloat(tankForm.capacity)) * 100, 100)} className="h-2" />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTankDialog(false)}>Cancelar</Button>
            <Button onClick={handleSaveTank} disabled={savingTank}>
              {savingTank ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : tankEditMode === "edit" ? <Pencil className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              {tankEditMode === "edit" ? "Atualizar" : "Adicionar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
