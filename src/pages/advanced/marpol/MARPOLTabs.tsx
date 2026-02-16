/**
 * MARPOL Tabs - All tab contents extracted from MARPOLTrackerPage
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Leaf, Waves, Trash2, AlertTriangle, CheckCircle2,
  FileText, Activity, Ship, RefreshCw, Clock, Shield,
  Globe, Droplets, Wind, BookOpen, Plus, Search,
  MapPin, Anchor, AlertOctagon, BarChart3, TrendingDown,
  FileDown, Table2, Gauge, ThermometerSun,
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

export function MARPOLTabs({
  scores, wasteLogs, emissionsData, tanks, alerts, vessels,
  refetch, onExportORB, onExportGRB,
}: MARPOLTabsProps) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedAnnex, setSelectedAnnex] = useState<number | null>(null);
  const [wasteFilter, setWasteFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewEntry, setShowNewEntry] = useState(false);

  const filteredLogs = useMemo(() => {
    let logs = wasteLogs;
    if (wasteFilter !== "all") logs = logs.filter((l) => l.recordBook === wasteFilter);
    if (searchTerm) logs = logs.filter((l) => l.type.toLowerCase().includes(searchTerm.toLowerCase()) || l.location.toLowerCase().includes(searchTerm.toLowerCase()));
    return logs;
  }, [wasteLogs, wasteFilter, searchTerm]);

  const criticalTanks = tanks.filter((t) => t.status === "critical").length;
  const warningTanks = tanks.filter((t) => t.status === "warning").length;

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
              {alerts.map((alert) => (
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
          <TabsTrigger value="waste" className="gap-2"><Trash2 className="h-4 w-4" />e-GRB / e-ORB</TabsTrigger>
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
                ].map((em) => (
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
              <CardTitle className="flex items-center gap-2"><Gauge className="h-5 w-5 text-primary" />Tanques de Resíduos</CardTitle>
              <CardDescription>Nível de preenchimento dos tanques — monitoramento em tempo real</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {tanks.map((tank) => (
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
                                {annex.specialAreas.slice(0, 4).map((area) => (
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
                    {MARPOL_ANNEXES[selectedAnnex].requirements.map((req) => (
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

        {/* TANKS TAB */}
        <TabsContent value="tanks" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tanks.map((tank) => (
              <Card key={tank.id} className={tank.status === "critical" ? "border-destructive/50" : tank.status === "warning" ? "border-warning/50" : ""}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold">{tank.name}</h4>
                    <StatusBadge status={tank.status} />
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
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* WASTE TAB */}
        <TabsContent value="waste" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" />Registros e-GRB / e-ORB</CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={onExportORB}><FileDown className="h-4 w-4 mr-2" />e-ORB</Button>
                  <Button size="sm" variant="outline" onClick={onExportGRB}><FileDown className="h-4 w-4 mr-2" />e-GRB</Button>
                  <Button size="sm" onClick={() => setShowNewEntry(true)}><Plus className="h-4 w-4 mr-2" />Nova Entrada</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                </div>
                <Select value={wasteFilter} onValueChange={setWasteFilter}>
                  <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="ORB">e-ORB</SelectItem>
                    <SelectItem value="GRB">e-GRB</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {filteredLogs.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">Nenhum registro encontrado</p>
              ) : (
                <div className="space-y-2">
                  {filteredLogs.map((log) => (
                    <motion.div key={log.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <div className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                        <Badge variant="outline" className="text-xs w-10 justify-center">{log.category}</Badge>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{log.type}</p>
                          <p className="text-xs text-muted-foreground">{log.method} • {log.location}</p>
                        </div>
                        <div className="text-right text-xs">
                          <div className="flex items-center gap-1">
                            <span className="font-medium">{log.quantity} {log.unit}</span>
                            <Badge variant="secondary" className="text-[10px]">{log.recordBook}</Badge>
                          </div>
                          <p className="text-muted-foreground">{log.date}</p>
                          <p className="text-xs text-primary mt-0.5">{log.certificate}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
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
                ].map((em) => (
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
                {WASTE_CATEGORIES.map((cat) => (
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
                {SPECIAL_ZONES.map((zone) => (
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
                        {zone.annexes.map((a) => (
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
                  {vessels.map((vessel) => (
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
                  ].map((item) => (
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

      {/* New Entry Dialog */}
      <Dialog open={showNewEntry} onOpenChange={setShowNewEntry}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nova Entrada — Registro de Descarte</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tipo de Registro</Label>
                <Select defaultValue="GRB">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ORB">e-ORB (Oil Record Book)</SelectItem>
                    <SelectItem value="GRB">e-GRB (Garbage Record Book)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Categoria (A-J)</Label>
                <Select defaultValue="B">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {WASTE_CATEGORIES.map((c) => (
                      <SelectItem key={c.code} value={c.code}>{c.code} — {c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Quantidade</Label><Input type="number" placeholder="0" /></div>
              <div>
                <Label>Unidade</Label>
                <Select defaultValue="kg">
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
              <Select defaultValue="port">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="port">Port Reception Facility</SelectItem>
                  <SelectItem value="sea">Descarga ao Mar (conforme regras)</SelectItem>
                  <SelectItem value="incineration">Incineração a Bordo</SelectItem>
                  <SelectItem value="compaction">Compactação</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Localização</Label><Input placeholder="Porto de Santos" /></div>
            <div><Label>Observações</Label><Textarea placeholder="Detalhes adicionais..." rows={2} /></div>
            <Button className="w-full" onClick={() => { setShowNewEntry(false); toast.success("Registro adicionado"); }}>
              <Plus className="h-4 w-4 mr-2" />Registrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
