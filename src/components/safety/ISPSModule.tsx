/**
 * ISPS Module - Ship Security Plan, Assessments, Drills, Cybersecurity
 * Full CRUD with Supabase persistence
 */

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Shield, Lock, AlertTriangle, CheckCircle, FileText, Users, Clock,
  Calendar, Ship, Wifi, Server, Eye, Target, Zap, RefreshCw, Download,
  Plus, Settings
} from "lucide-react";
import { toast } from "sonner";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { format } from "date-fns";

const COLORS = ["#22c55e", "#eab308", "#f97316", "#ef4444"];

const SECURITY_LEVELS = [
  { level: 1, name: "Normal", description: "Operações normais, medidas mínimas de segurança", color: "bg-success" },
  { level: 2, name: "Elevado", description: "Medidas de segurança adicionais por período prolongado", color: "bg-warning" },
  { level: 3, name: "Excepcional", description: "Medidas de segurança intensificadas por ameaça provável", color: "bg-destructive" }
];

const ASSESSMENT_AREAS = [
  "Access Control", "Cargo Handling", "Ship's Stores", "Unaccompanied Baggage",
  "Ship Security Alert System", "Cybersecurity", "Communications", "Monitoring Equipment"
];

export function ISPSModule() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [addAssessmentDialog, setAddAssessmentDialog] = useState(false);
  const [addThreatDialog, setAddThreatDialog] = useState(false);
  const [changeLevelDialog, setChangeLevelDialog] = useState(false);

  // Fetch assessments from Supabase
  const { data: assessments = [], isLoading: assessmentsLoading } = useQuery({
    queryKey: ["isps-assessments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("isps_assessments")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch security levels
  const { data: securityLevels = [] } = useQuery({
    queryKey: ["isps-security-levels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("isps_security_levels")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
  });

  // Fetch cyber threats
  const { data: cyberThreats = [], isLoading: threatsLoading } = useQuery({
    queryKey: ["isps-cyber-threats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("isps_cyber_threats")
        .select("*")
        .order("detected_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const currentSecurityLevel = securityLevels[0]?.security_level || 1;

  // Mutations
  const addAssessment = useMutation({
    mutationFn: async (data: { area: string; status: string; score: number; findings: number; assessor_name: string; notes: string }) => {
      const { error } = await supabase.from("isps_assessments").insert({
        area: data.area,
        status: data.status,
        score: data.score,
        findings: data.findings,
        assessor_name: data.assessor_name,
        notes: data.notes,
        last_assessment_date: new Date().toISOString(),
        next_assessment_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["isps-assessments"] });
      toast.success("Avaliação registrada com sucesso");
      setAddAssessmentDialog(false);
    },
  });

  const changeSecurityLevel = useMutation({
    mutationFn: async (data: { security_level: number; reason: string; ordered_by: string }) => {
      const { error } = await supabase.from("isps_security_levels").insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["isps-security-levels"] });
      toast.success("Nível de segurança alterado");
      setChangeLevelDialog(false);
    },
  });

  const addThreat = useMutation({
    mutationFn: async (data: { threat_type: string; severity: string; source: string; description: string }) => {
      const { error } = await supabase.from("isps_cyber_threats").insert({ ...data, status: "detected" });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["isps-cyber-threats"] });
      toast.success("Ameaça registrada");
      setAddThreatDialog(false);
    },
  });

  const resolveThreat = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("isps_cyber_threats").update({ status: "resolved", resolved_at: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["isps-cyber-threats"] });
      toast.success("Ameaça resolvida");
    },
  });

  // Computed
  const overallScore = assessments.length ? Math.round(assessments.reduce((s, a) => s + Number(a.score || 0), 0) / assessments.length) : 0;
  const complianceData = [
    { name: "Conforme", value: assessments.filter(a => a.status === "compliant").length },
    { name: "Menor", value: assessments.filter(a => a.status === "minor").length },
    { name: "Maior", value: assessments.filter(a => a.status === "major").length },
    { name: "Crítico", value: assessments.filter(a => a.status === "critical").length },
  ].filter(d => d.value > 0);

  const activeThreatCount = cyberThreats.filter(t => t.status !== "resolved").length;

  const getStatusBadge = (status: string) => {
    const map: Record<string, React.ReactNode> = {
      compliant: <Badge className="bg-success/20 text-success">Conforme</Badge>,
      minor: <Badge className="bg-warning/20 text-warning">Menor</Badge>,
      major: <Badge className="bg-orange-500/20 text-orange-500">Maior</Badge>,
      critical: <Badge variant="destructive">Crítico</Badge>,
      pending: <Badge variant="secondary">Pendente</Badge>,
    };
    return map[status] || <Badge variant="secondary">{status}</Badge>;
  };

  const getSeverityBadge = (severity: string) => {
    const map: Record<string, React.ReactNode> = {
      critical: <Badge variant="destructive">Crítico</Badge>,
      high: <Badge className="bg-orange-500/20 text-orange-500">Alto</Badge>,
      medium: <Badge className="bg-warning/20 text-warning">Médio</Badge>,
      low: <Badge className="bg-success/20 text-success">Baixo</Badge>,
    };
    return map[severity] || <Badge variant="secondary">{severity}</Badge>;
  };

  const getThreatStatusBadge = (status: string) => {
    const map: Record<string, React.ReactNode> = {
      detected: <Badge variant="destructive">Detectado</Badge>,
      investigating: <Badge className="bg-warning/20 text-warning">Investigando</Badge>,
      mitigated: <Badge className="bg-primary/20 text-primary">Mitigado</Badge>,
      resolved: <Badge className="bg-success/20 text-success">Resolvido</Badge>,
    };
    return map[status] || <Badge variant="secondary">{status}</Badge>;
  };

  // Form states
  const [newAssessment, setNewAssessment] = useState({ area: ASSESSMENT_AREAS[0], status: "compliant", score: "90", findings: "0", assessor_name: "", notes: "" });
  const [newLevel, setNewLevel] = useState({ security_level: "1", reason: "", ordered_by: "" });
  const [newThreat, setNewThreat] = useState({ threat_type: "Phishing Attempt", severity: "medium", source: "", description: "" });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-destructive/20 to-warning/20 rounded-xl">
            <Shield className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              ISPS Code Compliance
              <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white">
                Security Level {currentSecurityLevel}
              </Badge>
            </h2>
            <p className="text-sm text-muted-foreground">Ship Security Plan & Cybersecurity Management</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setChangeLevelDialog(true)}>
            <Settings className="h-4 w-4 mr-1" /> Alterar Nível
          </Button>
          <Button size="sm" onClick={() => queryClient.invalidateQueries({ queryKey: ["isps-assessments"] })}>
            <RefreshCw className="h-4 w-4 mr-1" /> Atualizar
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center">
          <Shield className="h-8 w-8 mx-auto mb-2 text-primary" />
          <div className="text-2xl font-bold">{overallScore}%</div>
          <div className="text-xs text-muted-foreground">Score Geral</div>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <CheckCircle className="h-8 w-8 mx-auto mb-2 text-success" />
          <div className="text-2xl font-bold">{assessments.filter(a => a.status === "compliant").length}</div>
          <div className="text-xs text-muted-foreground">Áreas Conformes</div>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-warning" />
          <div className="text-2xl font-bold">{assessments.filter(a => a.status !== "compliant").length}</div>
          <div className="text-xs text-muted-foreground">Não-Conformidades</div>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <Wifi className="h-8 w-8 mx-auto mb-2 text-destructive" />
          <div className="text-2xl font-bold">{activeThreatCount}</div>
          <div className="text-xs text-muted-foreground">Ameaças Ativas</div>
        </CardContent></Card>
      </div>

      {/* Security Level Status */}
      <div className="grid grid-cols-3 gap-3">
        {SECURITY_LEVELS.map(sl => (
          <Card key={sl.level} className={currentSecurityLevel === sl.level ? "ring-2 ring-primary" : "opacity-50"}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-3 h-3 rounded-full ${sl.color}`} />
                <span className="font-bold">Nível {sl.level} - {sl.name}</span>
              </div>
              <p className="text-xs text-muted-foreground">{sl.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="overview">Avaliações</TabsTrigger>
          <TabsTrigger value="cyber">Cybersecurity</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        {/* Assessments Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Avaliações de Segurança</h3>
            <Button size="sm" onClick={() => setAddAssessmentDialog(true)}><Plus className="h-4 w-4 mr-1" /> Nova Avaliação</Button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Chart */}
            {complianceData.length > 0 && (
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Distribuição de Conformidade</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={complianceData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                        {complianceData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip /><Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* List */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Áreas Avaliadas ({assessments.length})</CardTitle></CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2">
                    {assessments.map(a => (
                      <div key={a.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                        <div>
                          <div className="font-medium text-sm">{a.area}</div>
                          <div className="text-xs text-muted-foreground">Score: {a.score}% | {a.findings} findings</div>
                        </div>
                        {getStatusBadge(a.status)}
                      </div>
                    ))}
                    {assessments.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Nenhuma avaliação registrada</p>}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Cybersecurity Tab */}
        <TabsContent value="cyber" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Ameaças Cibernéticas</h3>
            <Button size="sm" onClick={() => setAddThreatDialog(true)}><Plus className="h-4 w-4 mr-1" /> Registrar Ameaça</Button>
          </div>
          <div className="space-y-3">
            {cyberThreats.map(t => (
              <Card key={t.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Server className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{t.threat_type}</div>
                        <div className="text-xs text-muted-foreground">Fonte: {t.source || "N/A"} | {t.detected_at ? format(new Date(t.detected_at), "dd/MM/yyyy HH:mm") : ""}</div>
                        {t.description && <div className="text-xs text-muted-foreground mt-1">{t.description}</div>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getSeverityBadge(t.severity)}
                      {getThreatStatusBadge(t.status)}
                      {t.status !== "resolved" && (
                        <Button variant="outline" size="sm" onClick={() => resolveThreat.mutate(t.id)}>Resolver</Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {cyberThreats.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Nenhuma ameaça registrada</p>}
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <h3 className="font-semibold">Histórico de Níveis de Segurança</h3>
          <div className="space-y-2">
            {securityLevels.map(sl => (
              <Card key={sl.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${SECURITY_LEVELS[sl.security_level - 1]?.color || "bg-muted"}`} />
                    <div>
                      <div className="font-medium">Nível {sl.security_level} - {SECURITY_LEVELS[sl.security_level - 1]?.name}</div>
                      <div className="text-xs text-muted-foreground">{sl.reason || "Sem motivo informado"}</div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">{format(new Date(sl.effective_from), "dd/MM/yyyy HH:mm")}</div>
                </CardContent>
              </Card>
            ))}
            {securityLevels.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Sem histórico de alterações</p>}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Assessment Dialog */}
      <Dialog open={addAssessmentDialog} onOpenChange={setAddAssessmentDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nova Avaliação de Segurança</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Área</Label>
              <Select value={newAssessment.area} onValueChange={v => setNewAssessment(p => ({ ...p, area: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{ASSESSMENT_AREAS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Status</Label>
              <Select value={newAssessment.status} onValueChange={v => setNewAssessment(p => ({ ...p, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="compliant">Conforme</SelectItem>
                  <SelectItem value="minor">Não-Conformidade Menor</SelectItem>
                  <SelectItem value="major">Não-Conformidade Maior</SelectItem>
                  <SelectItem value="critical">Crítico</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Score (%)</Label><Input type="number" value={newAssessment.score} onChange={e => setNewAssessment(p => ({ ...p, score: e.target.value }))} /></div>
              <div><Label>Findings</Label><Input type="number" value={newAssessment.findings} onChange={e => setNewAssessment(p => ({ ...p, findings: e.target.value }))} /></div>
            </div>
            <div><Label>Avaliador</Label><Input value={newAssessment.assessor_name} onChange={e => setNewAssessment(p => ({ ...p, assessor_name: e.target.value }))} /></div>
            <div><Label>Notas</Label><Textarea value={newAssessment.notes} onChange={e => setNewAssessment(p => ({ ...p, notes: e.target.value }))} /></div>
            <Button className="w-full" onClick={() => addAssessment.mutate({ ...newAssessment, score: Number(newAssessment.score), findings: Number(newAssessment.findings) })} disabled={addAssessment.isPending}>
              {addAssessment.isPending ? "Salvando..." : "Registrar Avaliação"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Change Security Level Dialog */}
      <Dialog open={changeLevelDialog} onOpenChange={setChangeLevelDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Alterar Nível de Segurança</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Nível</Label>
              <Select value={newLevel.security_level} onValueChange={v => setNewLevel(p => ({ ...p, security_level: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SECURITY_LEVELS.map(sl => <SelectItem key={sl.level} value={String(sl.level)}>Nível {sl.level} - {sl.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Motivo</Label><Textarea value={newLevel.reason} onChange={e => setNewLevel(p => ({ ...p, reason: e.target.value }))} /></div>
            <div><Label>Ordenado por</Label><Input value={newLevel.ordered_by} onChange={e => setNewLevel(p => ({ ...p, ordered_by: e.target.value }))} /></div>
            <Button className="w-full" onClick={() => changeSecurityLevel.mutate({ security_level: Number(newLevel.security_level), reason: newLevel.reason, ordered_by: newLevel.ordered_by })} disabled={changeSecurityLevel.isPending}>
              {changeSecurityLevel.isPending ? "Salvando..." : "Confirmar Alteração"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Threat Dialog */}
      <Dialog open={addThreatDialog} onOpenChange={setAddThreatDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Registrar Ameaça Cibernética</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Tipo</Label>
              <Select value={newThreat.threat_type} onValueChange={v => setNewThreat(p => ({ ...p, threat_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Phishing Attempt">Phishing</SelectItem>
                  <SelectItem value="Port Scan">Port Scan</SelectItem>
                  <SelectItem value="Malware Detection">Malware</SelectItem>
                  <SelectItem value="Unauthorized Login">Login Não Autorizado</SelectItem>
                  <SelectItem value="DDoS Attack">DDoS</SelectItem>
                  <SelectItem value="Ransomware">Ransomware</SelectItem>
                  <SelectItem value="Man-in-the-Middle">Man-in-the-Middle</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Severidade</Label>
              <Select value={newThreat.severity} onValueChange={v => setNewThreat(p => ({ ...p, severity: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixo</SelectItem>
                  <SelectItem value="medium">Médio</SelectItem>
                  <SelectItem value="high">Alto</SelectItem>
                  <SelectItem value="critical">Crítico</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Fonte</Label><Input value={newThreat.source} onChange={e => setNewThreat(p => ({ ...p, source: e.target.value }))} placeholder="Ex: Email, VPN, USB" /></div>
            <div><Label>Descrição</Label><Textarea value={newThreat.description} onChange={e => setNewThreat(p => ({ ...p, description: e.target.value }))} /></div>
            <Button className="w-full" onClick={() => addThreat.mutate(newThreat)} disabled={addThreat.isPending}>
              {addThreat.isPending ? "Salvando..." : "Registrar Ameaça"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
