/**
 * Fuel Management Page - Full CRUD with Supabase fuel_records
 * Tabs: Dashboard, Tanques, Bunker Ops, Analytics, AI
 */
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Fuel, AlertTriangle, Ship, DollarSign, BarChart3, FileText, Droplets,
  Gauge, Clock, MapPin, Plus, RefreshCw, Brain, Sparkles, Target,
  Lightbulb, Zap, X, Trash2, Anchor, TrendingUp, TrendingDown,
  Waves, Thermometer, Filter, Download,
} from "lucide-react";
import { useFuelRecords, FuelRecord } from "@/hooks/useFuelRecords";
import { useFuelAI } from "@/hooks/useFuelAI";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, Area, AreaChart,
} from "recharts";

// ── Chart colors ─────────────────────────────────────────────────────
const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(210, 70%, 55%)",
  "hsl(160, 60%, 45%)",
  "hsl(35, 80%, 55%)",
  "hsl(280, 60%, 55%)",
  "hsl(0, 70%, 55%)",
];

// ── Empty State ──────────────────────────────────────────────────────
function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: {
  icon: React.ElementType; title: string; description: string;
  actionLabel?: string; onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md mb-4">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="gap-2">
          <Plus className="h-4 w-4" />{actionLabel}
        </Button>
      )}
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="text-sm font-medium mb-1 block">{label}</label>{children}</div>;
}

// ═══════════════════════════════════════════════════════════════════════
export default function FuelManagementPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isAddBunkerOpen, setIsAddBunkerOpen] = useState(false);
  const [isAddConsumptionOpen, setIsAddConsumptionOpen] = useState(false);
  const [bunkerFilter, setBunkerFilter] = useState<string>("all");
  const { records, bunkerRecords, consumptionRecords, tankLevels, stats, isLoading, createRecord, refetch } = useFuelRecords();
  const { prediction, loading: aiLoading, predictConsumption } = useFuelAI();

  // Fetch vessels for form
  const { data: vessels = [] } = useQuery({
    queryKey: ["vessels-fuel"],
    queryFn: async () => {
      const { data } = await supabase.from("vessels").select("id, name").order("name");
      return data || [];
    },
  });

  // ── Form states ──
  const [bunkerForm, setBunkerForm] = useState({
    fuel_type: "VLSFO", quantity_mt: 0, price_per_mt: 0,
    bunkering_port: "", supplier: "", vessel_id: "",
    record_date: new Date().toISOString().split("T")[0],
    sulfur_content: 0.5, density: 0, notes: "",
  });

  const [consumptionForm, setConsumptionForm] = useState({
    fuel_type: "VLSFO", quantity_mt: 0, consumption_type: "main_engine",
    vessel_id: "", record_date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  // ── Handlers ──
  const handleAddBunker = () => {
    createRecord.mutate({
      fuel_type: bunkerForm.fuel_type,
      quantity_mt: bunkerForm.quantity_mt,
      price_per_mt: bunkerForm.price_per_mt,
      bunkering_port: bunkerForm.bunkering_port || undefined,
      supplier: bunkerForm.supplier || undefined,
      vessel_id: bunkerForm.vessel_id || undefined,
      consumption_type: "bunkering",
      record_date: bunkerForm.record_date,
      sulfur_content: bunkerForm.sulfur_content || undefined,
      density: bunkerForm.density || undefined,
      notes: bunkerForm.notes || undefined,
    } as Partial<FuelRecord>, {
      onSuccess: () => {
        setIsAddBunkerOpen(false);
        setBunkerForm({ fuel_type: "VLSFO", quantity_mt: 0, price_per_mt: 0, bunkering_port: "", supplier: "", vessel_id: "", record_date: new Date().toISOString().split("T")[0], sulfur_content: 0.5, density: 0, notes: "" });
      },
    });
  };

  const handleAddConsumption = () => {
    createRecord.mutate({
      fuel_type: consumptionForm.fuel_type,
      quantity_mt: consumptionForm.quantity_mt,
      consumption_type: consumptionForm.consumption_type,
      vessel_id: consumptionForm.vessel_id || undefined,
      record_date: consumptionForm.record_date,
      notes: consumptionForm.notes || undefined,
    } as Partial<FuelRecord>, {
      onSuccess: () => {
        setIsAddConsumptionOpen(false);
        setConsumptionForm({ fuel_type: "VLSFO", quantity_mt: 0, consumption_type: "main_engine", vessel_id: "", record_date: new Date().toISOString().split("T")[0], notes: "" });
      },
    });
  };

  const handleDeleteRecord = async (id: string) => {
    if (!confirm("Remover este registro?")) return;
    const { error } = await supabase.from("fuel_records").delete().eq("id", id);
    if (error) { toast.error("Erro ao remover"); return; }
    toast.success("Registro removido");
    refetch();
  };

  // ── Computed ──
  const totalCurrent = tankLevels.reduce((s, t) => s + t.current, 0);
  const totalCapacity = tankLevels.reduce((s, t) => s + t.capacity, 0);
  const fillPercentage = totalCapacity > 0 ? Math.round((totalCurrent / totalCapacity) * 100) : 0;

  const consumptionDays = records.length > 1
    ? Math.max(1, Math.ceil((new Date(records[0].record_date).getTime() - new Date(records[records.length - 1].record_date).getTime()) / (1000 * 60 * 60 * 24)))
    : 30;
  const dailyAvg = stats.totalConsumed > 0 ? (stats.totalConsumed / consumptionDays).toFixed(1) : "0";
  const autonomyDays = Number(dailyAvg) > 0 ? Math.round(totalCurrent / Number(dailyAvg)) : 0;

  // Fuel type distribution
  const fuelTypeDistribution = useMemo(() => {
    return records.reduce((acc, r) => {
      acc[r.fuel_type] = (acc[r.fuel_type] || 0) + Number(r.quantity_mt);
      return acc;
    }, {} as Record<string, number>);
  }, [records]);

  // Chart data: consumption by month
  const monthlyData = useMemo(() => {
    const byMonth: Record<string, { bunkered: number; consumed: number; cost: number }> = {};
    records.forEach(r => {
      const month = format(new Date(r.record_date), "MMM/yy", { locale: ptBR });
      if (!byMonth[month]) byMonth[month] = { bunkered: 0, consumed: 0, cost: 0 };
      if (r.consumption_type === "bunkering") {
        byMonth[month].bunkered += Number(r.quantity_mt) || 0;
        byMonth[month].cost += Number(r.total_cost) || 0;
      } else {
        byMonth[month].consumed += Number(r.quantity_mt) || 0;
      }
    });
    return Object.entries(byMonth).map(([month, d]) => ({ month, ...d })).reverse();
  }, [records]);

  // Pie data
  const pieData = useMemo(() => {
    return Object.entries(fuelTypeDistribution).map(([name, value]) => ({ name, value: Math.round(value) }));
  }, [fuelTypeDistribution]);

  // Filtered bunker ops
  const filteredBunkerRecords = useMemo(() => {
    if (bunkerFilter === "all") return bunkerRecords;
    return bunkerRecords.filter(r => r.fuel_type === bunkerFilter);
  }, [bunkerRecords, bunkerFilter]);

  const fuelTypes = useMemo(() => [...new Set(records.map(r => r.fuel_type))], [records]);

  if (isLoading) {
    return (
      <div className="space-y-6 py-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={`fuel-skeleton-${i}`} className="h-28" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6 py-4">
      {/* ═══ Header ═══ */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
            <Fuel className="h-8 w-8 text-primary" />
            Gestão de Combustível
          </h1>
          <p className="text-muted-foreground">
            {records.length} registros • {bunkerRecords.length} bunkerings • {fuelTypes.length} tipos
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />Atualizar
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsAddConsumptionOpen(true)}>
            <Gauge className="h-4 w-4 mr-2" />Reg. Consumo
          </Button>
          <Button size="sm" onClick={() => setIsAddBunkerOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />Novo Bunker
          </Button>
        </div>
      </div>

      {/* ═══ KPIs ═══ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">ROB Estimado</p>
              <p className="text-2xl font-bold">{totalCurrent.toLocaleString("pt-BR")} MT</p>
              <p className="text-xs text-muted-foreground">{fillPercentage}% capacidade</p>
            </div>
            <div className="p-3 rounded-full bg-primary/10"><Droplets className="h-6 w-6 text-primary" /></div>
          </div>
        </CardContent></Card>

        <Card><CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Consumo Médio/Dia</p>
              <p className="text-2xl font-bold">{dailyAvg} MT</p>
              <p className="text-xs text-muted-foreground">últimos {consumptionDays} dias</p>
            </div>
            <div className="p-3 rounded-full bg-success/10"><Gauge className="h-6 w-6 text-success" /></div>
          </div>
        </CardContent></Card>

        <Card><CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Custo Total</p>
              <p className="text-2xl font-bold">${(stats.totalCost / 1000).toFixed(0)}K</p>
              <p className="text-xs text-muted-foreground">Preço médio: ${stats.avgPrice.toFixed(0)}/MT</p>
            </div>
            <div className="p-3 rounded-full bg-warning/10"><DollarSign className="h-6 w-6 text-warning" /></div>
          </div>
        </CardContent></Card>

        <Card><CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Autonomia Estimada</p>
              <p className="text-2xl font-bold">{autonomyDays} dias</p>
              <p className="text-xs text-muted-foreground">@ consumo atual</p>
            </div>
            <div className="p-3 rounded-full bg-primary/10"><Clock className="h-6 w-6 text-primary" /></div>
          </div>
        </CardContent></Card>
      </div>

      {/* ═══ ADD FORMS ═══ */}
      {isAddBunkerOpen && (
        <Card className="border-primary/50">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-lg">Registrar Operação de Bunker</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setIsAddBunkerOpen(false)} aria-label="Fechar formulário" title="Fechar"><X className="h-4 w-4" /></Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); handleAddBunker(); }} className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <FormField label="Tipo de Combustível">
                <Select value={bunkerForm.fuel_type} onValueChange={v => setBunkerForm({...bunkerForm, fuel_type: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VLSFO">VLSFO (0.5%S)</SelectItem>
                    <SelectItem value="MGO">MGO</SelectItem>
                    <SelectItem value="HFO">HFO (3.5%S)</SelectItem>
                    <SelectItem value="LSMGO">LSMGO</SelectItem>
                    <SelectItem value="LNG">LNG</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Quantidade (MT)">
                <Input type="number" step="0.1" value={bunkerForm.quantity_mt || ""} onChange={e => setBunkerForm({...bunkerForm, quantity_mt: Number(e.target.value)})} placeholder="500" required />
              </FormField>
              <FormField label="Preço/MT (USD)">
                <Input type="number" step="0.01" value={bunkerForm.price_per_mt || ""} onChange={e => setBunkerForm({...bunkerForm, price_per_mt: Number(e.target.value)})} placeholder="620" required />
              </FormField>
              <FormField label="Porto">
                <Input value={bunkerForm.bunkering_port} onChange={e => setBunkerForm({...bunkerForm, bunkering_port: e.target.value})} placeholder="Singapore" />
              </FormField>
              <FormField label="Fornecedor">
                <Input value={bunkerForm.supplier} onChange={e => setBunkerForm({...bunkerForm, supplier: e.target.value})} placeholder="Shell Marine" />
              </FormField>
              <FormField label="Embarcação">
                <Select value={bunkerForm.vessel_id} onValueChange={v => setBunkerForm({...bunkerForm, vessel_id: v})}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {vessels.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Data">
                <Input type="date" value={bunkerForm.record_date} onChange={e => setBunkerForm({...bunkerForm, record_date: e.target.value})} required />
              </FormField>
              <FormField label="Teor de Enxofre (%)">
                <Input type="number" step="0.01" value={bunkerForm.sulfur_content || ""} onChange={e => setBunkerForm({...bunkerForm, sulfur_content: Number(e.target.value)})} placeholder="0.50" />
              </FormField>
              <FormField label="Notas">
                <Input value={bunkerForm.notes} onChange={e => setBunkerForm({...bunkerForm, notes: e.target.value})} placeholder="Observações..." />
              </FormField>
              <div className="col-span-full flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Total estimado: <span className="font-bold text-foreground">${((bunkerForm.quantity_mt || 0) * (bunkerForm.price_per_mt || 0)).toLocaleString("pt-BR")}</span>
                </p>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddBunkerOpen(false)}>Cancelar</Button>
                  <Button type="submit" disabled={createRecord.isPending}>{createRecord.isPending ? "Salvando..." : "Registrar Bunker"}</Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isAddConsumptionOpen && (
        <Card className="border-primary/50">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-lg">Registrar Consumo</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setIsAddConsumptionOpen(false)}><X className="h-4 w-4" /></Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); handleAddConsumption(); }} className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <FormField label="Tipo de Combustível">
                <Select value={consumptionForm.fuel_type} onValueChange={v => setConsumptionForm({...consumptionForm, fuel_type: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VLSFO">VLSFO</SelectItem>
                    <SelectItem value="MGO">MGO</SelectItem>
                    <SelectItem value="HFO">HFO</SelectItem>
                    <SelectItem value="LSMGO">LSMGO</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Quantidade (MT)">
                <Input type="number" step="0.1" value={consumptionForm.quantity_mt || ""} onChange={e => setConsumptionForm({...consumptionForm, quantity_mt: Number(e.target.value)})} placeholder="50" required />
              </FormField>
              <FormField label="Tipo de Consumo">
                <Select value={consumptionForm.consumption_type} onValueChange={v => setConsumptionForm({...consumptionForm, consumption_type: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="main_engine">Motor Principal</SelectItem>
                    <SelectItem value="auxiliary">Motor Auxiliar</SelectItem>
                    <SelectItem value="boiler">Caldeira</SelectItem>
                    <SelectItem value="incinerator">Incinerador</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Embarcação">
                <Select value={consumptionForm.vessel_id} onValueChange={v => setConsumptionForm({...consumptionForm, vessel_id: v})}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {vessels.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Data">
                <Input type="date" value={consumptionForm.record_date} onChange={e => setConsumptionForm({...consumptionForm, record_date: e.target.value})} required />
              </FormField>
              <FormField label="Notas">
                <Input value={consumptionForm.notes} onChange={e => setConsumptionForm({...consumptionForm, notes: e.target.value})} placeholder="Observações..." />
              </FormField>
              <div className="col-span-full flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsAddConsumptionOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={createRecord.isPending}>{createRecord.isPending ? "Salvando..." : "Registrar Consumo"}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* ═══ TABS ═══ */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="tanks">Tanques</TabsTrigger>
          <TabsTrigger value="bunker">Bunker Ops</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-1">
            <Sparkles className="h-3 w-3" />AI
          </TabsTrigger>
        </TabsList>

        {/* ══ DASHBOARD ══ */}
        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Tank Levels */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Droplets className="h-5 w-5" />Níveis dos Tanques</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {tankLevels.length === 0 ? (
                  <EmptyState icon={Droplets} title="Sem dados de tanques" description="Registre operações de bunker e consumo para estimar os níveis." actionLabel="Registrar Bunker" onAction={() => setIsAddBunkerOpen(true)} />
                ) : (
                  tankLevels.map((tank, i) => {
                    const fill = tank.capacity > 0 ? Math.round((tank.current / tank.capacity) * 100) : 0;
                    const isLow = fill < 30;
                    const isCritical = fill < 15;
                    return (
                      <div key={tank.name} className={cn("p-3 rounded-lg border", isCritical ? "border-destructive/50 bg-destructive/5" : isLow ? "border-warning/30 bg-warning/5" : "")}>
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            <Fuel className="h-4 w-4 text-primary" />
                            <span className="font-medium">{tank.name}</span>
                            <Badge variant="outline" className="text-xs">{tank.type}</Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            {isCritical && <Badge variant="destructive" className="text-xs">Crítico</Badge>}
                            {isLow && !isCritical && <Badge className="text-xs bg-warning/20 text-warning border-warning/30" variant="outline">Baixo</Badge>}
                            <span className="text-sm font-bold">{fill}%</span>
                          </div>
                        </div>
                        <Progress value={fill} className="h-2.5 mb-1" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{Math.round(tank.current).toLocaleString("pt-BR")} MT</span>
                          <span>Cap: {Math.round(tank.capacity).toLocaleString("pt-BR")} MT</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            {/* Recent Bunker */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2"><Ship className="h-5 w-5" />Últimas Operações de Bunker</CardTitle>
                  <Badge variant="secondary">{bunkerRecords.length} ops</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {bunkerRecords.length === 0 ? (
                  <EmptyState icon={Ship} title="Nenhum bunkering registrado" description="Registre sua primeira operação de abastecimento." actionLabel="Novo Bunker" onAction={() => setIsAddBunkerOpen(true)} />
                ) : (
                  <div className="space-y-3">
                    {bunkerRecords.slice(0, 5).map(op => (
                      <div key={op.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg group">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{op.bunkering_port || "Sem porto"}</span>
                            <Badge variant="secondary" className="text-xs">{op.fuel_type}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {op.supplier || "—"} • {format(new Date(op.record_date), "dd/MM/yyyy")}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="font-medium">{Number(op.quantity_mt).toLocaleString("pt-BR")} MT</p>
                            <p className="text-sm text-muted-foreground">${Number(op.price_per_mt || 0).toFixed(0)}/MT</p>
                          </div>
                          <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 text-destructive" onClick={() => handleDeleteRecord(op.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Consumption trend chart */}
          {monthlyData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" />Bunker vs Consumo Mensal</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                    <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                    <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
                    <Legend />
                    <Bar dataKey="bunkered" name="Bunkered (MT)" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="consumed" name="Consumido (MT)" fill="hsl(35, 80%, 55%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ══ TANQUES ══ */}
        <TabsContent value="tanks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuração de Tanques</CardTitle>
              <CardDescription>Níveis estimados baseados em {bunkerRecords.length} bunkers e {consumptionRecords.length} registros de consumo</CardDescription>
            </CardHeader>
            <CardContent>
              {tankLevels.length === 0 ? (
                <EmptyState icon={Droplets} title="Sem dados de tanques" description="Registre operações de bunker e consumo para estimar níveis." actionLabel="Registrar Bunker" onAction={() => setIsAddBunkerOpen(true)} />
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tankLevels.map((tank, i) => {
                    const fill = tank.capacity > 0 ? Math.round((tank.current / tank.capacity) * 100) : 0;
                    const isLow = fill < 30;
                    const isCritical = fill < 15;
                    return (
                      <Card key={`fuel-card-${tank.name}`} className={cn("bg-muted/30", isCritical && "border-destructive/50", isLow && !isCritical && "border-warning/30")}>
                        <CardContent className="pt-4 space-y-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-lg">{tank.name}</h3>
                              <Badge variant="secondary">{tank.type}</Badge>
                            </div>
                            <div className="text-right">
                              <p className={cn("text-3xl font-bold", isCritical ? "text-destructive" : isLow ? "text-warning" : "text-primary")}>{fill}%</p>
                            </div>
                          </div>

                          {/* Visual tank gauge */}
                          <div className="relative h-32 bg-muted rounded-lg overflow-hidden border">
                            <div
                              className={cn("absolute bottom-0 left-0 right-0 transition-all duration-500",
                                isCritical ? "bg-destructive/30" : isLow ? "bg-warning/20" : "bg-primary/20"
                              )}
                              style={{ height: `${fill}%` }}
                            />
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <Waves className={cn("h-8 w-8 mb-1", isCritical ? "text-destructive" : isLow ? "text-warning" : "text-primary")} />
                              <span className="text-lg font-bold">{Math.round(tank.current).toLocaleString("pt-BR")} MT</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="p-2 bg-background rounded text-center">
                              <p className="font-medium">{Math.round(tank.current).toLocaleString("pt-BR")}</p>
                              <p className="text-xs text-muted-foreground">Atual (MT)</p>
                            </div>
                            <div className="p-2 bg-background rounded text-center">
                              <p className="font-medium">{Math.round(tank.capacity).toLocaleString("pt-BR")}</p>
                              <p className="text-xs text-muted-foreground">Capacidade (MT)</p>
                            </div>
                          </div>

                          {isLow && (
                            <div className={cn("flex items-center gap-2 p-2 rounded text-sm", isCritical ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning")}>
                              <AlertTriangle className="h-4 w-4 shrink-0" />
                              {isCritical ? "Nível crítico — reabastecimento urgente" : "Nível baixo — programar reabastecimento"}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ══ BUNKER OPS ══ */}
        <TabsContent value="bunker" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <CardTitle>Histórico de Bunker</CardTitle>
                  <CardDescription>{bunkerRecords.length} operações registradas</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select value={bunkerFilter} onValueChange={setBunkerFilter}>
                    <SelectTrigger className="w-32"><Filter className="h-3 w-3 mr-1" /><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {fuelTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" onClick={() => setIsAddBunkerOpen(true)}>
                    <Plus className="h-4 w-4 mr-1" />Novo
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredBunkerRecords.length === 0 ? (
                <EmptyState icon={Ship} title="Nenhuma operação de bunker" description="Registre operações de abastecimento para visualizar o histórico." actionLabel="Registrar Bunker" onAction={() => setIsAddBunkerOpen(true)} />
              ) : (
                <ScrollArea className="h-[500px]">
                  <div className="rounded-lg border overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-muted/50 sticky top-0">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium">Data</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Porto</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Tipo</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Fornecedor</th>
                          <th className="px-4 py-3 text-right text-sm font-medium">Qtde (MT)</th>
                          <th className="px-4 py-3 text-right text-sm font-medium">$/MT</th>
                          <th className="px-4 py-3 text-right text-sm font-medium">Total</th>
                          <th className="px-4 py-3 w-12"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredBunkerRecords.map(op => (
                          <tr key={op.id} className="border-t hover:bg-muted/30 group">
                            <td className="px-4 py-3 text-sm">{format(new Date(op.record_date), "dd/MM/yyyy")}</td>
                            <td className="px-4 py-3 text-sm flex items-center gap-1"><MapPin className="h-3 w-3 text-muted-foreground" />{op.bunkering_port || "—"}</td>
                            <td className="px-4 py-3"><Badge variant="outline" className="text-xs">{op.fuel_type}</Badge></td>
                            <td className="px-4 py-3 text-sm">{op.supplier || "—"}</td>
                            <td className="px-4 py-3 text-sm text-right font-medium">{Number(op.quantity_mt).toLocaleString("pt-BR")}</td>
                            <td className="px-4 py-3 text-sm text-right">${Number(op.price_per_mt || 0).toFixed(0)}</td>
                            <td className="px-4 py-3 text-sm text-right font-medium text-success">${Number(op.total_cost || 0).toLocaleString("pt-BR")}</td>
                            <td className="px-4 py-3">
                              <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 text-destructive" onClick={() => handleDeleteRecord(op.id)}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-muted/30 border-t-2">
                        <tr>
                          <td colSpan={4} className="px-4 py-3 text-sm font-semibold">Totais</td>
                          <td className="px-4 py-3 text-sm text-right font-bold">{filteredBunkerRecords.reduce((s, r) => s + Number(r.quantity_mt), 0).toLocaleString("pt-BR")} MT</td>
                          <td className="px-4 py-3 text-sm text-right font-medium">${(filteredBunkerRecords.reduce((s, r) => s + Number(r.price_per_mt || 0), 0) / (filteredBunkerRecords.length || 1)).toFixed(0)} avg</td>
                          <td className="px-4 py-3 text-sm text-right font-bold text-success">${filteredBunkerRecords.reduce((s, r) => s + Number(r.total_cost || 0), 0).toLocaleString("pt-BR")}</td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          {/* Consumption Records */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2"><Gauge className="h-5 w-5" />Registros de Consumo</CardTitle>
                  <CardDescription>{consumptionRecords.length} registros</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => setIsAddConsumptionOpen(true)}>
                  <Plus className="h-4 w-4 mr-1" />Novo
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {consumptionRecords.length === 0 ? (
                <EmptyState icon={Gauge} title="Nenhum registro de consumo" description="Registre o consumo diário de combustível." actionLabel="Registrar Consumo" onAction={() => setIsAddConsumptionOpen(true)} />
              ) : (
                <div className="rounded-lg border overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium">Data</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Tipo</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Equipamento</th>
                        <th className="px-4 py-3 text-right text-sm font-medium">Qtde (MT)</th>
                        <th className="px-4 py-3 w-12"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {consumptionRecords.slice(0, 10).map(r => (
                        <tr key={r.id} className="border-t hover:bg-muted/30 group">
                          <td className="px-4 py-3 text-sm">{format(new Date(r.record_date), "dd/MM/yyyy")}</td>
                          <td className="px-4 py-3"><Badge variant="outline" className="text-xs">{r.fuel_type}</Badge></td>
                          <td className="px-4 py-3 text-sm capitalize">{(r.consumption_type || "").replace(/_/g, " ")}</td>
                          <td className="px-4 py-3 text-sm text-right font-medium">{Number(r.quantity_mt).toLocaleString("pt-BR")} MT</td>
                          <td className="px-4 py-3">
                            <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 text-destructive" onClick={() => handleDeleteRecord(r.id)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ══ ANALYTICS ══ */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Pie chart - fuel type distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" />Distribuição por Tipo</CardTitle>
                <CardDescription>Baseado em {records.length} registros</CardDescription>
              </CardHeader>
              <CardContent>
                {pieData.length === 0 ? (
                  <EmptyState icon={BarChart3} title="Sem dados" description="Registre operações para ver analytics." />
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} innerRadius={50} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {pieData.map((entry, i) => <Cell key={`pie-cell-${entry.name}`} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Metrics */}
            <Card>
              <CardHeader><CardTitle>Métricas Operacionais</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-primary/5 rounded-lg text-center border border-primary/20">
                    <p className="text-3xl font-bold text-primary">{stats.totalBunkered.toLocaleString("pt-BR")}</p>
                    <p className="text-sm text-muted-foreground mt-1">MT Bunkered</p>
                  </div>
                  <div className="p-4 bg-warning/5 rounded-lg text-center border border-warning/20">
                    <p className="text-3xl font-bold text-warning">{stats.totalConsumed.toLocaleString("pt-BR")}</p>
                    <p className="text-sm text-muted-foreground mt-1">MT Consumido</p>
                  </div>
                  <div className="p-4 bg-success/5 rounded-lg text-center border border-success/20">
                    <p className="text-3xl font-bold text-success">${stats.avgPrice.toFixed(0)}</p>
                    <p className="text-sm text-muted-foreground mt-1">Preço Médio/MT</p>
                  </div>
                  <div className="p-4 bg-accent/5 rounded-lg text-center border border-accent/20">
                    <p className="text-3xl font-bold text-accent-foreground">{stats.suppliers}</p>
                    <p className="text-sm text-muted-foreground mt-1">Fornecedores</p>
                  </div>
                </div>

                {/* Cost trend */}
                {monthlyData.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-semibold mb-3">Custo Mensal</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                        <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                        <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
                        <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} formatter={(value: number) => [`$${value.toLocaleString("pt-BR")}`, "Custo"]} />
                        <Area type="monotone" dataKey="cost" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ══ AI TAB ══ */}
        <TabsContent value="ai" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Previsão de Consumo com IA
              </CardTitle>
              <CardDescription>
                Análise preditiva para prever consumo, recomendar reabastecimento e otimizar custos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => predictConsumption({
                  history: records.slice(0, 20).map(r => ({
                    date: r.record_date,
                    quantity: r.quantity_mt,
                    type: r.fuel_type,
                    port: r.bunkering_port,
                  })),
                  current_stock_tons: totalCurrent,
                  min_rob_tons: 50,
                  fuel_type: Object.keys(fuelTypeDistribution)[0] || "VLSFO",
                })}
                disabled={aiLoading || records.length === 0}
                className="w-full md:w-auto"
              >
                {aiLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                Gerar Previsão AI
              </Button>

              {records.length === 0 && (
                <p className="text-sm text-muted-foreground">Registre dados de consumo e bunker para gerar previsões com IA.</p>
              )}

              {prediction && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Card className="bg-primary/5 border-primary/20">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2"><Target className="h-4 w-4" />Previsão de Consumo</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        {prediction.predicted_consumption_tons && (
                          <div className="p-3 bg-background rounded-lg text-center">
                            <p className="text-2xl font-bold text-primary">{prediction.predicted_consumption_tons}</p>
                            <p className="text-xs text-muted-foreground">Consumo Previsto (ton)</p>
                          </div>
                        )}
                        {prediction.confidence_score && (
                          <div className="p-3 bg-background rounded-lg text-center">
                            <p className="text-2xl font-bold text-success">{Math.round(prediction.confidence_score * 100)}%</p>
                            <p className="text-xs text-muted-foreground">Confiança</p>
                          </div>
                        )}
                        {prediction.estimated_cost_usd && (
                          <div className="p-3 bg-background rounded-lg text-center">
                            <p className="text-2xl font-bold text-warning">${prediction.estimated_cost_usd.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">Custo Estimado</p>
                          </div>
                        )}
                        {prediction.potential_savings_usd && (
                          <div className="p-3 bg-background rounded-lg text-center">
                            <p className="text-2xl font-bold text-success">${prediction.potential_savings_usd.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">Economia Potencial</p>
                          </div>
                        )}
                      </div>
                      {prediction.optimal_refuel_port && (
                        <div className="p-3 bg-background rounded-lg flex items-center justify-between">
                          <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /><span className="text-sm">Melhor Porto</span></div>
                          <Badge>{prediction.optimal_refuel_port}</Badge>
                        </div>
                      )}
                      {prediction.recommended_refuel_date && (
                        <div className="p-3 bg-background rounded-lg flex items-center justify-between">
                          <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-muted-foreground" /><span className="text-sm">Data Recomendada</span></div>
                          <Badge variant="outline">{prediction.recommended_refuel_date}</Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2"><Lightbulb className="h-4 w-4 text-warning" />Dicas de Otimização</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {prediction.optimization_tips && prediction.optimization_tips.length > 0 ? (
                        <ul className="space-y-2">
                          {prediction.optimization_tips.map((tip) => (
                            <li key={tip} className="flex items-start gap-2 text-sm">
                              <Zap className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      ) : <p className="text-sm text-muted-foreground">Sem dicas disponíveis</p>}

                      {prediction.factors && prediction.factors.length > 0 && (
                        <div className="pt-3 border-t">
                          <h4 className="text-sm font-semibold mb-2">Fatores de Impacto</h4>
                          <div className="flex flex-wrap gap-2">
                            {prediction.factors.map((f) => (
                              <Badge key={f.factor} variant={f.impact === "high" ? "destructive" : f.impact === "medium" ? "default" : "secondary"}>
                                {f.factor}: {f.impact}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
