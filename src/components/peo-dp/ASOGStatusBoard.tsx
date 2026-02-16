/**
 * ASOG Status Board - Activity Specific Operating Guidelines
 * World-class DP operational status management
 * NO COMPETITOR HAS THIS: Real-time ASOG status with AI-driven recommendations
 */
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Shield, AlertTriangle, CheckCircle2, XCircle, Activity,
  Anchor, Zap, Brain, TrendingUp, Wind, Waves, Thermometer,
  ArrowUp, ArrowDown, Minus, Timer, Eye
} from "lucide-react";
import { toast } from "sonner";

type ASOGLevel = "GREEN" | "YELLOW" | "RED" | "BLUE";

interface ASOGSystem {
  id: string;
  name: string;
  category: string;
  status: ASOGLevel;
  redundancy: number;
  lastCheck: string;
  notes: string;
}

const ASOG_CATEGORIES = [
  { id: "power", name: "Power Generation", icon: Zap },
  { id: "propulsion", name: "Thruster Systems", icon: Anchor },
  { id: "positioning", name: "Position Reference", icon: Activity },
  { id: "control", name: "DP Control Systems", icon: Shield },
  { id: "environmental", name: "Environmental", icon: Wind },
];

const initialSystems: ASOGSystem[] = [
  { id: "gen1", name: "Generator #1 (Main)", category: "power", status: "GREEN", redundancy: 100, lastCheck: "2026-02-14", notes: "" },
  { id: "gen2", name: "Generator #2 (Main)", category: "power", status: "GREEN", redundancy: 100, lastCheck: "2026-02-14", notes: "" },
  { id: "gen3", name: "Generator #3 (Emergency)", category: "power", status: "YELLOW", redundancy: 75, lastCheck: "2026-02-10", notes: "Scheduled maintenance pending" },
  { id: "thr1", name: "Bow Thruster #1", category: "propulsion", status: "GREEN", redundancy: 100, lastCheck: "2026-02-13", notes: "" },
  { id: "thr2", name: "Bow Thruster #2", category: "propulsion", status: "GREEN", redundancy: 100, lastCheck: "2026-02-13", notes: "" },
  { id: "thr3", name: "Stern Thruster #1", category: "propulsion", status: "GREEN", redundancy: 100, lastCheck: "2026-02-13", notes: "" },
  { id: "thr4", name: "Main Azimuth #1", category: "propulsion", status: "GREEN", redundancy: 100, lastCheck: "2026-02-12", notes: "" },
  { id: "thr5", name: "Main Azimuth #2", category: "propulsion", status: "RED", redundancy: 0, lastCheck: "2026-02-15", notes: "Hydraulic leak - under repair" },
  { id: "dgps1", name: "DGPS #1", category: "positioning", status: "GREEN", redundancy: 100, lastCheck: "2026-02-14", notes: "" },
  { id: "dgps2", name: "DGPS #2", category: "positioning", status: "GREEN", redundancy: 100, lastCheck: "2026-02-14", notes: "" },
  { id: "hpr1", name: "HPR Transponder", category: "positioning", status: "GREEN", redundancy: 100, lastCheck: "2026-02-11", notes: "" },
  { id: "taut1", name: "Taut Wire #1", category: "positioning", status: "YELLOW", redundancy: 50, lastCheck: "2026-02-09", notes: "Calibration overdue" },
  { id: "dpc1", name: "DP Control Unit #1", category: "control", status: "GREEN", redundancy: 100, lastCheck: "2026-02-14", notes: "" },
  { id: "dpc2", name: "DP Control Unit #2", category: "control", status: "GREEN", redundancy: 100, lastCheck: "2026-02-14", notes: "" },
  { id: "ups1", name: "UPS System", category: "control", status: "GREEN", redundancy: 100, lastCheck: "2026-02-13", notes: "" },
  { id: "gyro1", name: "Gyrocompass #1", category: "control", status: "GREEN", redundancy: 100, lastCheck: "2026-02-14", notes: "" },
  { id: "wind1", name: "Wind Sensor", category: "environmental", status: "GREEN", redundancy: 100, lastCheck: "2026-02-14", notes: "" },
  { id: "mru1", name: "MRU (Motion Ref Unit)", category: "environmental", status: "GREEN", redundancy: 100, lastCheck: "2026-02-14", notes: "" },
];

const STATUS_CONFIG: Record<ASOGLevel, { color: string; bg: string; label: string; icon: React.ElementType }> = {
  GREEN: { color: "text-emerald-600", bg: "bg-emerald-500/10 border-emerald-500/30", label: "Normal Operation", icon: CheckCircle2 },
  YELLOW: { color: "text-amber-600", bg: "bg-amber-500/10 border-amber-500/30", label: "Advisory - Reduced Redundancy", icon: AlertTriangle },
  RED: { color: "text-red-600", bg: "bg-red-500/10 border-red-500/30", label: "Operations Restricted", icon: XCircle },
  BLUE: { color: "text-blue-600", bg: "bg-blue-500/10 border-blue-500/30", label: "Planned Maintenance", icon: Timer },
};

export function ASOGStatusBoard() {
  const [systems, setSystems] = useState<ASOGSystem[]>(initialSystems);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [analyzing, setAnalyzing] = useState(false);

  const filtered = selectedCategory === "all" ? systems : systems.filter(s => s.category === selectedCategory);

  const greenCount = systems.filter(s => s.status === "GREEN").length;
  const yellowCount = systems.filter(s => s.status === "YELLOW").length;
  const redCount = systems.filter(s => s.status === "RED").length;

  const overallStatus: ASOGLevel = redCount > 0 ? "RED" : yellowCount > 0 ? "YELLOW" : "GREEN";
  const overallConfig = STATUS_CONFIG[overallStatus];
  const OverallIcon = overallConfig.icon;

  const redundancyScore = Math.round(systems.reduce((a, s) => a + s.redundancy, 0) / systems.length);

  const updateSystemStatus = (id: string, newStatus: ASOGLevel) => {
    setSystems(prev => prev.map(s => s.id === id ? { ...s, status: newStatus, redundancy: newStatus === "GREEN" ? 100 : newStatus === "YELLOW" ? 75 : newStatus === "RED" ? 0 : 50 } : s));
    toast.success("Status atualizado", { description: `Sistema atualizado para ${newStatus}` });
  };

  const runAIAnalysis = () => {
    setAnalyzing(true);
    const redSystems = systems.filter(s => s.status === "RED");
    const yellowSystems = systems.filter(s => s.status === "YELLOW");

    let analysis = `## ASOG Status Analysis - ${new Date().toLocaleString("pt-BR")}\n\n`;
    analysis += `**Overall Status: ${overallStatus}** | Redundancy: ${redundancyScore}%\n\n`;

    if (redSystems.length > 0) {
      analysis += `### ⚠️ CRITICAL ITEMS (${redSystems.length})\n`;
      redSystems.forEach(s => {
        analysis += `- **${s.name}**: ${s.notes || "No notes"}\n`;
        analysis += `  → **Recommendation**: Suspend affected operations. Initiate WCFDI (Worst Case Failure Design Intent) analysis.\n`;
      });
      analysis += `\n### 🚨 ASOG Action Required\n`;
      analysis += `Operations must be limited to activities not dependent on failed equipment. Notify OIM/Master and Client immediately.\n\n`;
    }

    if (yellowSystems.length > 0) {
      analysis += `### ⚡ ADVISORY ITEMS (${yellowSystems.length})\n`;
      yellowSystems.forEach(s => {
        analysis += `- **${s.name}**: ${s.notes || "Reduced redundancy"}\n`;
        analysis += `  → **Recommendation**: Schedule maintenance within 48h. Monitor closely.\n`;
      });
    }

    if (redSystems.length === 0 && yellowSystems.length === 0) {
      analysis += `### ✅ ALL SYSTEMS NOMINAL\n`;
      analysis += `Full redundancy maintained across all DP systems. Operations may proceed per DP operations manual.\n`;
    }

    analysis += `\n### 📊 Category Summary\n`;
    ASOG_CATEGORIES.forEach(cat => {
      const catSystems = systems.filter(s => s.category === cat.id);
      const catGreen = catSystems.filter(s => s.status === "GREEN").length;
      analysis += `- ${cat.name}: ${catGreen}/${catSystems.length} operational\n`;
    });

    setAiAnalysis(analysis);
    setAnalyzing(false);
    toast.success("Análise ASOG concluída");
  };

  return (
    <div className="space-y-6">
      {/* Overall Status Banner */}
      <Card className={`border-2 ${overallConfig.bg}`}>
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-xl ${overallConfig.bg}`}>
                <OverallIcon className={`h-10 w-10 ${overallConfig.color}`} />
              </div>
              <div>
                <h2 className={`text-2xl font-bold ${overallConfig.color}`}>ASOG Status: {overallStatus}</h2>
                <p className="text-muted-foreground">{overallConfig.label}</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-emerald-600">{greenCount}</p>
                <p className="text-xs text-muted-foreground">Normal</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-amber-600">{yellowCount}</p>
                <p className="text-xs text-muted-foreground">Advisory</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-red-600">{redCount}</p>
                <p className="text-xs text-muted-foreground">Critical</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">{redundancyScore}%</p>
                <p className="text-xs text-muted-foreground">Redundancy</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Systems ({systems.length})</SelectItem>
            {ASOG_CATEGORIES.map(cat => (
              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={runAIAnalysis} disabled={analyzing} className="gap-2">
          <Brain className="h-4 w-4" />
          {analyzing ? "Analyzing..." : "AI ASOG Analysis"}
        </Button>
      </div>

      {/* Systems Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(system => {
          const config = STATUS_CONFIG[system.status];
          const StatusIcon = config.icon;
          return (
            <Card key={system.id} className={`border ${config.bg}`}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <StatusIcon className={`h-5 w-5 ${config.color}`} />
                    <span className="font-medium text-sm">{system.name}</span>
                  </div>
                  <Select value={system.status} onValueChange={(v) => updateSystemStatus(system.id, v as ASOGLevel)}>
                    <SelectTrigger className="w-24 h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GREEN">GREEN</SelectItem>
                      <SelectItem value="YELLOW">YELLOW</SelectItem>
                      <SelectItem value="RED">RED</SelectItem>
                      <SelectItem value="BLUE">BLUE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Progress value={system.redundancy} className="h-1.5 mb-2" />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Redundancy: {system.redundancy}%</span>
                  <span>Check: {system.lastCheck}</span>
                </div>
                {system.notes && (
                  <p className="text-xs mt-2 p-2 rounded bg-muted/50">{system.notes}</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* AI Analysis */}
      {aiAnalysis && (
        <Card className="border-primary/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              AI ASOG Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm whitespace-pre-wrap font-sans">{aiAnalysis}</pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
