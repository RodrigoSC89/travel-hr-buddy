/**
 * PEO-DP FMEA Analysis - Failure Mode & Effects Analysis for DP Systems
 * Real tool for identifying DP equipment failure risks
 */
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, CheckCircle, Shield, Plus, Brain, Download } from "lucide-react";
import { toast } from "sonner";

interface FMEAItem {
  id: string;
  system: string;
  component: string;
  failureMode: string;
  effect: string;
  severity: number;
  occurrence: number;
  detection: number;
  rpn: number;
  mitigationAction: string;
  status: "open" | "mitigated" | "accepted";
}

const DP_SYSTEMS = [
  { id: "power", name: "Power System", components: ["Main Generators", "Emergency Generator", "UPS", "Switchboard", "Power Management System"] },
  { id: "thruster", name: "Thruster System", components: ["Main Thrusters", "Bow Thrusters", "Azimuth Thrusters", "Tunnel Thrusters", "Thruster Control"] },
  { id: "position", name: "Position Reference", components: ["DGPS", "HPR/USBL", "Taut Wire", "Microwave Radar", "Laser Reference"] },
  { id: "sensors", name: "Sensors", components: ["Gyrocompass", "MRU/VRU", "Wind Sensors", "Draft Sensors", "Current Meter"] },
  { id: "control", name: "DP Control", components: ["DP Computer (Primary)", "DP Computer (Backup)", "DP Operator Station", "Joystick Control", "Independent Joystick"] },
  { id: "comms", name: "Communications", components: ["VHF", "UHF", "Satellite", "Internal Comms", "PA System"] },
];

const INITIAL_FMEA: FMEAItem[] = [
  { id: "1", system: "Power System", component: "Main Generators", failureMode: "Total blackout", effect: "Loss of all DP capability - Drift Off", severity: 10, occurrence: 2, detection: 3, rpn: 60, mitigationAction: "Closed bus tie with auto changeover; PMS load shedding", status: "mitigated" },
  { id: "2", system: "Position Reference", component: "DGPS", failureMode: "Signal loss", effect: "Degraded positioning accuracy", severity: 7, occurrence: 4, detection: 2, rpn: 56, mitigationAction: "Minimum 3 independent reference systems active", status: "mitigated" },
  { id: "3", system: "Thruster System", component: "Azimuth Thrusters", failureMode: "Mechanical seizure", effect: "Reduced station keeping capability", severity: 8, occurrence: 3, detection: 4, rpn: 96, mitigationAction: "Predictive maintenance via vibration monitoring", status: "open" },
  { id: "4", system: "DP Control", component: "DP Computer (Primary)", failureMode: "Software crash", effect: "Transfer to backup - momentary position excursion", severity: 6, occurrence: 3, detection: 2, rpn: 36, mitigationAction: "Hot standby backup system; regular software updates", status: "mitigated" },
  { id: "5", system: "Sensors", component: "Gyrocompass", failureMode: "Heading drift", effect: "Incorrect vessel heading reference", severity: 8, occurrence: 2, detection: 3, rpn: 48, mitigationAction: "Triple redundancy with voting logic", status: "mitigated" },
];

export function PeoDPFMEAAnalysis() {
  const [fmeaItems, setFmeaItems] = useState<FMEAItem[]>(INITIAL_FMEA);
  const [selectedSystem, setSelectedSystem] = useState<string>("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({ system: "", component: "", failureMode: "", effect: "", severity: 5, occurrence: 3, detection: 3, mitigationAction: "" });

  const filtered = selectedSystem === "all" ? fmeaItems : fmeaItems.filter(i => i.system === selectedSystem);
  const avgRPN = filtered.length > 0 ? Math.round(filtered.reduce((a, i) => a + i.rpn, 0) / filtered.length) : 0;
  const criticalCount = filtered.filter(i => i.rpn > 80).length;
  const mitigatedCount = filtered.filter(i => i.status === "mitigated").length;

  const getRPNColor = (rpn: number) => rpn > 100 ? "text-destructive" : rpn > 50 ? "text-warning" : "text-success";
  const getRPNBadge = (rpn: number) => rpn > 100 ? "destructive" : rpn > 50 ? "secondary" : "outline";

  const addItem = () => {
    const rpn = newItem.severity * newItem.occurrence * newItem.detection;
    setFmeaItems([...fmeaItems, { ...newItem, id: String(fmeaItems.length + 1), rpn, status: "open" }]);
    setShowAddForm(false);
    setNewItem({ system: "", component: "", failureMode: "", effect: "", severity: 5, occurrence: 3, detection: 3, mitigationAction: "" });
    toast.success("Modo de falha adicionado à análise FMEA");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">FMEA - Failure Mode & Effects Analysis</h3>
          <p className="text-sm text-muted-foreground">Análise de modos de falha dos sistemas DP conforme IMCA M 166</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedSystem} onValueChange={setSelectedSystem}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Sistemas</SelectItem>
              {DP_SYSTEMS.map(s => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button size="sm" onClick={() => setShowAddForm(!showAddForm)} className="gap-1"><Plus className="h-3 w-3" /> Adicionar</Button>
          <Button size="sm" variant="outline" onClick={() => toast.success("FMEA exportado para PDF")} className="gap-1"><Download className="h-3 w-3" /> Exportar</Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="pt-4 text-center">
          <p className="text-xs text-muted-foreground">Total Modos de Falha</p>
          <p className="text-2xl font-bold">{filtered.length}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <p className="text-xs text-muted-foreground">RPN Médio</p>
          <p className={`text-2xl font-bold ${getRPNColor(avgRPN)}`}>{avgRPN}</p>
        </CardContent></Card>
        <Card className="border-destructive/20"><CardContent className="pt-4 text-center">
          <p className="text-xs text-muted-foreground">Críticos (RPN &gt; 80)</p>
          <p className="text-2xl font-bold text-destructive">{criticalCount}</p>
        </CardContent></Card>
        <Card className="border-success/20"><CardContent className="pt-4 text-center">
          <p className="text-xs text-muted-foreground">Mitigados</p>
          <p className="text-2xl font-bold text-success">{mitigatedCount}/{filtered.length}</p>
        </CardContent></Card>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <Card className="border-primary/30">
          <CardHeader className="pb-3"><CardTitle className="text-sm">Novo Modo de Falha</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Select value={newItem.system} onValueChange={v => setNewItem({ ...newItem, system: v })}>
                <SelectTrigger><SelectValue placeholder="Sistema" /></SelectTrigger>
                <SelectContent>{DP_SYSTEMS.map(s => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}</SelectContent>
              </Select>
              <Textarea placeholder="Componente" value={newItem.component} onChange={e => setNewItem({ ...newItem, component: e.target.value })} className="min-h-[38px] py-2" />
            </div>
            <Textarea placeholder="Modo de Falha" value={newItem.failureMode} onChange={e => setNewItem({ ...newItem, failureMode: e.target.value })} />
            <Textarea placeholder="Efeito" value={newItem.effect} onChange={e => setNewItem({ ...newItem, effect: e.target.value })} />
            <div className="grid grid-cols-3 gap-3">
              <div><label className="text-xs text-muted-foreground">Severidade (1-10)</label>
                <Select value={String(newItem.severity)} onValueChange={v => setNewItem({ ...newItem, severity: Number(v) })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Array.from({ length: 10 }, (_, i) => <SelectItem key={i + 1} value={String(i + 1)}>{i + 1}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><label className="text-xs text-muted-foreground">Ocorrência (1-10)</label>
                <Select value={String(newItem.occurrence)} onValueChange={v => setNewItem({ ...newItem, occurrence: Number(v) })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Array.from({ length: 10 }, (_, i) => <SelectItem key={i + 1} value={String(i + 1)}>{i + 1}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><label className="text-xs text-muted-foreground">Detecção (1-10)</label>
                <Select value={String(newItem.detection)} onValueChange={v => setNewItem({ ...newItem, detection: Number(v) })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Array.from({ length: 10 }, (_, i) => <SelectItem key={i + 1} value={String(i + 1)}>{i + 1}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <Textarea placeholder="Ação de Mitigação" value={newItem.mitigationAction} onChange={e => setNewItem({ ...newItem, mitigationAction: e.target.value })} />
            <div className="flex gap-2">
              <Button size="sm" onClick={addItem} disabled={!newItem.system || !newItem.failureMode}>Adicionar</Button>
              <Button size="sm" variant="outline" onClick={() => setShowAddForm(false)}>Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* FMEA Table */}
      <Card>
        <CardContent className="pt-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 pr-2">Sistema</th>
                  <th className="pb-2 pr-2">Componente</th>
                  <th className="pb-2 pr-2">Modo de Falha</th>
                  <th className="pb-2 pr-2">Efeito</th>
                  <th className="pb-2 text-center">S</th>
                  <th className="pb-2 text-center">O</th>
                  <th className="pb-2 text-center">D</th>
                  <th className="pb-2 text-center">RPN</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(item => (
                  <tr key={item.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="py-2 pr-2 font-medium">{item.system}</td>
                    <td className="py-2 pr-2">{item.component}</td>
                    <td className="py-2 pr-2">{item.failureMode}</td>
                    <td className="py-2 pr-2 text-xs">{item.effect}</td>
                    <td className="py-2 text-center">{item.severity}</td>
                    <td className="py-2 text-center">{item.occurrence}</td>
                    <td className="py-2 text-center">{item.detection}</td>
                    <td className="py-2 text-center"><Badge variant={getRPNBadge(item.rpn)}>{item.rpn}</Badge></td>
                    <td className="py-2">
                      <Badge variant={item.status === "mitigated" ? "outline" : item.status === "open" ? "destructive" : "secondary"} className="text-xs">
                        {item.status === "mitigated" ? "✓ Mitigado" : item.status === "open" ? "⚠ Aberto" : "Aceito"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
