/**
 * Condition-Based Maintenance (CBM) Tab
 * Vibration analysis, oil analysis, thermography for predictive maintenance
 */
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, BarChart, Bar, Cell
} from "recharts";
import {
  Activity, Droplets, Thermometer, AlertTriangle,
  CheckCircle2, TrendingUp, Gauge, Wrench, Download,
  RefreshCw, Eye, Clock
} from "lucide-react";

interface CBMReading {
  id: string;
  equipmentName: string;
  equipmentCode: string;
  type: "vibration" | "oil" | "thermography";
  status: "normal" | "watch" | "alert" | "danger";
  currentValue: number;
  unit: string;
  threshold: number;
  trend: "stable" | "increasing" | "decreasing";
  lastReading: string;
  nextDue: string;
  history: { date: string; value: number }[];
  recommendation?: string;
}

const MOCK_READINGS: CBMReading[] = [
  {
    id: "cbm-1", equipmentName: "Main Engine #1", equipmentCode: "ME-001", type: "vibration",
    status: "watch", currentValue: 7.2, unit: "mm/s RMS", threshold: 11.0,
    trend: "increasing", lastReading: "2026-02-18", nextDue: "2026-03-18",
    history: [
      { date: "Oct", value: 4.5 }, { date: "Nov", value: 5.1 }, { date: "Dec", value: 5.8 },
      { date: "Jan", value: 6.4 }, { date: "Feb", value: 7.2 },
    ],
    recommendation: "Tendência crescente. Agendar inspeção de rolamentos no próximo porto.",
  },
  {
    id: "cbm-2", equipmentName: "Main Engine #1", equipmentCode: "ME-001", type: "oil",
    status: "normal", currentValue: 12, unit: "ppm Fe", threshold: 50,
    trend: "stable", lastReading: "2026-02-15", nextDue: "2026-03-15",
    history: [
      { date: "Oct", value: 10 }, { date: "Nov", value: 11 }, { date: "Dec", value: 13 },
      { date: "Jan", value: 11 }, { date: "Feb", value: 12 },
    ],
    recommendation: "Partículas de ferro dentro do limite. Continuar monitoramento normal.",
  },
  {
    id: "cbm-3", equipmentName: "Turbocharger #1", equipmentCode: "TC-001", type: "vibration",
    status: "alert", currentValue: 14.5, unit: "mm/s RMS", threshold: 11.0,
    trend: "increasing", lastReading: "2026-02-17", nextDue: "2026-02-24",
    history: [
      { date: "Oct", value: 6.0 }, { date: "Nov", value: 8.2 }, { date: "Dec", value: 10.1 },
      { date: "Jan", value: 12.8 }, { date: "Feb", value: 14.5 },
    ],
    recommendation: "ACIMA DO LIMITE. Desbalanceamento detectado. Work Order de overhaul recomendada.",
  },
  {
    id: "cbm-4", equipmentName: "Aux Engine #2", equipmentCode: "AE-002", type: "thermography",
    status: "danger", currentValue: 128, unit: "°C", threshold: 95,
    trend: "increasing", lastReading: "2026-02-18", nextDue: "2026-02-19",
    history: [
      { date: "Oct", value: 72 }, { date: "Nov", value: 78 }, { date: "Dec", value: 89 },
      { date: "Jan", value: 105 }, { date: "Feb", value: 128 },
    ],
    recommendation: "CRÍTICO: Hot spot detectado no alternador. Parada imediata recomendada para inspeção.",
  },
  {
    id: "cbm-5", equipmentName: "Aux Engine #1", equipmentCode: "AE-001", type: "oil",
    status: "normal", currentValue: 8, unit: "ppm Fe", threshold: 50,
    trend: "stable", lastReading: "2026-02-10", nextDue: "2026-03-10",
    history: [
      { date: "Oct", value: 7 }, { date: "Nov", value: 9 }, { date: "Dec", value: 8 },
      { date: "Jan", value: 7 }, { date: "Feb", value: 8 },
    ],
  },
  {
    id: "cbm-6", equipmentName: "Bow Thruster", equipmentCode: "BT-001", type: "vibration",
    status: "normal", currentValue: 3.2, unit: "mm/s RMS", threshold: 11.0,
    trend: "stable", lastReading: "2026-02-12", nextDue: "2026-03-12",
    history: [
      { date: "Oct", value: 3.0 }, { date: "Nov", value: 3.1 }, { date: "Dec", value: 3.3 },
      { date: "Jan", value: 3.1 }, { date: "Feb", value: 3.2 },
    ],
  },
];

export function ConditionBasedMaintenanceTab() {
  const [readings] = useState<CBMReading[]>(MOCK_READINGS);
  const [filterType, setFilterType] = useState("all");
  const [selectedReading, setSelectedReading] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (filterType === "all") return readings;
    return readings.filter(r => r.type === filterType);
  }, [readings, filterType]);

  const stats = useMemo(() => ({
    total: readings.length,
    normal: readings.filter(r => r.status === "normal").length,
    watch: readings.filter(r => r.status === "watch").length,
    alert: readings.filter(r => r.status === "alert").length,
    danger: readings.filter(r => r.status === "danger").length,
  }), [readings]);

  const getStatusBg = (s: string) => {
    if (s === "normal") return "bg-success/20 text-success";
    if (s === "watch") return "bg-primary/20 text-primary";
    if (s === "alert") return "bg-warning/20 text-warning";
    return "bg-destructive/20 text-destructive";
  };

  const getTypeIcon = (t: string) => {
    if (t === "vibration") return Activity;
    if (t === "oil") return Droplets;
    return Thermometer;
  };

  const selected = readings.find(r => r.id === selectedReading);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Total Sensores", value: stats.total, icon: Gauge, color: "text-primary" },
          { label: "Normal", value: stats.normal, icon: CheckCircle2, color: "text-success" },
          { label: "Watch", value: stats.watch, icon: Eye, color: "text-primary" },
          { label: "Alerta", value: stats.alert, icon: AlertTriangle, color: "text-warning" },
          { label: "Perigo", value: stats.danger, icon: AlertTriangle, color: "text-destructive" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="p-3 flex items-center gap-3">
              <Icon className={`h-5 w-5 ${color}`} />
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-xl font-bold">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter */}
      <div className="flex justify-between items-center">
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="vibration">Vibração</SelectItem>
            <SelectItem value="oil">Análise de Óleo</SelectItem>
            <SelectItem value="thermography">Termografia</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={() => toast.info("Exportação em desenvolvimento")}>
          <Download className="h-4 w-4 mr-2" /> Exportar
        </Button>
      </div>

      {/* Readings List */}
      <div className="space-y-2">
        {filtered.map(reading => {
          const TypeIcon = getTypeIcon(reading.type);
          const healthPct = Math.max(0, Math.min(100, Math.round((1 - reading.currentValue / (reading.threshold * 1.5)) * 100)));
          return (
            <Card
              key={reading.id}
              className={`cursor-pointer transition-all hover:border-primary/30 ${selectedReading === reading.id ? "border-primary ring-1 ring-primary/30" : ""}`}
              onClick={() => setSelectedReading(reading.id === selectedReading ? null : reading.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`p-2 rounded-lg ${getStatusBg(reading.status)}`}>
                      <TypeIcon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-medium">{reading.equipmentName}</h4>
                        <Badge variant="outline" className="text-[10px] font-mono">{reading.equipmentCode}</Badge>
                        <Badge className={`text-[10px] ${getStatusBg(reading.status)}`}>
                          {reading.status === "normal" ? "Normal" : reading.status === "watch" ? "Watch" : reading.status === "alert" ? "Alerta" : "PERIGO"}
                        </Badge>
                        {reading.trend === "increasing" && <Badge variant="outline" className="text-[10px] text-warning"><TrendingUp className="h-3 w-3 mr-1" />Crescente</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {reading.type === "vibration" ? "Vibração" : reading.type === "oil" ? "Análise de Óleo" : "Termografia"}
                        {" • "}<Clock className="h-3 w-3 inline" /> Última: {reading.lastReading} • Próxima: {reading.nextDue}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{reading.currentValue} <span className="text-xs font-normal text-muted-foreground">{reading.unit}</span></p>
                    <p className="text-[10px] text-muted-foreground">Limite: {reading.threshold} {reading.unit}</p>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <Progress value={healthPct} className="h-1.5 flex-1" />
                  <span className="text-[10px] text-muted-foreground">{healthPct}% saúde</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Trend Chart */}
      {selected && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Tendência — {selected.equipmentName} ({selected.type === "vibration" ? "Vibração" : selected.type === "oil" ? "Óleo" : "Termografia"})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={selected.history}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))" }} />
              </LineChart>
            </ResponsiveContainer>
            {selected.recommendation && (
              <div className={`mt-3 p-3 rounded-lg border ${getStatusBg(selected.status)}`}>
                <p className="text-sm font-medium flex items-center gap-2">
                  <Wrench className="h-4 w-4" /> Recomendação IA
                </p>
                <p className="text-sm mt-1">{selected.recommendation}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
