/**
 * PEO-DP FMEA/FMECA Analysis — PEO-DP 2026 (Revisão 5)
 * ✅ INTEGRATED: Full CRUD with Supabase peodp_fmea_items table
 * Compliant with IMCA M 166, includes the 14 mandatory columns (item 1.10.1)
 * NPR = Detecção × Frequência × Severidade
 */
import React, { useState } from "react";
import { quickExport } from "@/lib/export-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { AlertTriangle, CheckCircle, Plus, Download, Shield, Search, Filter, Brain, Loader2, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface FMECAItem {
  id: string;
  sistema: string;
  subsistema: string;
  componente: string;
  funcao: string;
  modo_falha: string;
  causa_falha: string;
  efeitos_locais: string;
  efeitos_globais: string;
  tipo_deteccao: string;
  capacidade_deteccao: number;
  frequencia: number;
  severidade: number;
  npr: number;
  acoes: string | null;
  status: "open" | "mitigated" | "accepted" | "monitoring";
  gap_status?: string | null;
}

const DP_SYSTEMS = [
  { sistema: "Geração de Energia", subsistemas: ["Gerador Principal", "Gerador de Emergência", "UPS", "Painel Principal", "PMS"] },
  { sistema: "Distribuição de Energia", subsistemas: ["Barramento Principal", "Bus Tie", "Disjuntores", "Transformadores", "Quadros de Distribuição"] },
  { sistema: "Propulsão", subsistemas: ["Bow Thruster Tunnel", "Bow Thruster Azimutal", "Stern Thruster", "Propulsores Principais", "Thruster Control"] },
  { sistema: "Referência de Posição", subsistemas: ["DGPS-1", "DGPS-2", "HPR/USBL", "RADius", "Taut Wire", "Laser"] },
  { sistema: "Sensores", subsistemas: ["Girocompasso", "MRU/VRU", "Anemômetro", "Sensor de Calado", "Sensor de Corrente"] },
  { sistema: "Controle DP", subsistemas: ["Computador DP Primário", "Computador DP Backup", "Estação DPO", "Joystick", "Joystick Independente"] },
  { sistema: "Resfriamento", subsistemas: ["Sea Water Cooling", "Fresh Water Cooling", "Bombas Auxiliares", "Trocadores de Calor"] },
  { sistema: "Combustível", subsistemas: ["Tanques", "Bombas Transfer.", "Válvulas Crossover", "Filtros", "Sistema Purificação"] },
];

const SEVERITY_TABLE = [
  { level: 1, desc: "Insignificante", effect: "Sem efeito no DP" },
  { level: 2, desc: "Muito baixa", effect: "Leve degradação" },
  { level: 3, desc: "Baixa", effect: "Pequeno impacto na performance" },
  { level: 4, desc: "Moderada-baixa", effect: "Redundância levemente reduzida" },
  { level: 5, desc: "Moderada", effect: "Redundância reduzida" },
  { level: 6, desc: "Moderada-alta", effect: "Redundância prejudicada" },
  { level: 7, desc: "Alta", effect: "Perda parcial de redundância" },
  { level: 8, desc: "Muito alta", effect: "Perda de redundância" },
  { level: 9, desc: "Extremamente alta", effect: "Possível perda de posição" },
  { level: 10, desc: "Catastrófica", effect: "Perda de posição/aproamento" },
];

const EMPTY_FORM = {
  sistema: "", subsistema: "", componente: "", funcao: "", modo_falha: "",
  causa_falha: "", efeitos_locais: "", efeitos_globais: "", tipo_deteccao: "",
  capacidade_deteccao: 5, frequencia: 5, severidade: 5, acoes: "", status: "open" as "open" | "mitigated" | "accepted" | "monitoring",
};

export function PeoDPFMEAAnalysis() {
  const queryClient = useQueryClient();
  const [filterSystem, setFilterSystem] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);

  // ✅ FETCH from Supabase
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["peodp-fmea-items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("peodp_fmea_items")
        .select("*")
        .order("npr", { ascending: false });
      if (error) throw error;
      return (data || []) as FMECAItem[];
    },
  });

  // ✅ CREATE mutation
  const createMutation = useMutation({
    mutationFn: async (item: typeof EMPTY_FORM) => {
      const { error } = await supabase.from("peodp_fmea_items").insert({
        sistema: item.sistema, subsistema: item.subsistema, componente: item.componente,
        funcao: item.funcao, modo_falha: item.modo_falha, causa_falha: item.causa_falha,
        efeitos_locais: item.efeitos_locais, efeitos_globais: item.efeitos_globais,
        tipo_deteccao: item.tipo_deteccao, capacidade_deteccao: item.capacidade_deteccao,
        frequencia: item.frequencia, severidade: item.severidade,
        acoes: item.acoes, status: item.status,
      });
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["peodp-fmea-items"] }); toast.success("FMECA item criado com sucesso"); setShowAddForm(false); setFormData(EMPTY_FORM); },
    onError: () => toast.error("Erro ao criar item FMECA"),
  });

  // ✅ UPDATE mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<typeof EMPTY_FORM>) => {
      const { error } = await supabase.from("peodp_fmea_items").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["peodp-fmea-items"] }); toast.success("Item atualizado"); setShowAddForm(false); setEditingId(null); setFormData(EMPTY_FORM); },
    onError: () => toast.error("Erro ao atualizar"),
  });

  // ✅ DELETE mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("peodp_fmea_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["peodp-fmea-items"] }); toast.success("Item removido"); },
    onError: () => toast.error("Erro ao remover"),
  });

  // ✅ STATUS UPDATE
  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("peodp_fmea_items").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["peodp-fmea-items"] }); toast.success("Status atualizado"); },
  });

  const filtered = items.filter(i =>
    (filterSystem === "all" || i.sistema === filterSystem) &&
    (filterStatus === "all" || i.status === filterStatus) &&
    (searchTerm === "" || JSON.stringify(i).toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const avgNPR = filtered.length > 0 ? Math.round(filtered.reduce((a, i) => a + (i.npr || 0), 0) / filtered.length) : 0;
  const criticalCount = filtered.filter(i => (i.npr || 0) >= 80).length;
  const mitigatedCount = filtered.filter(i => i.status === "mitigated").length;

  const getNPRColor = (npr: number) => npr >= 100 ? "text-destructive" : npr >= 60 ? "text-warning" : "text-success";
  const getNPRBadge = (npr: number): "destructive" | "secondary" | "outline" => npr >= 100 ? "destructive" : npr >= 60 ? "secondary" : "outline";

  const handleSubmit = () => {
    if (!formData.sistema || !formData.componente || !formData.modo_falha) {
      toast.error("Preencha os campos obrigatórios"); return;
    }
    if (editingId) {
      updateMutation.mutate({ id: editingId, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (item: FMECAItem) => {
    setFormData({
      sistema: item.sistema, subsistema: item.subsistema, componente: item.componente,
      funcao: item.funcao, modo_falha: item.modo_falha, causa_falha: item.causa_falha,
      efeitos_locais: item.efeitos_locais, efeitos_globais: item.efeitos_globais,
      tipo_deteccao: item.tipo_deteccao, capacidade_deteccao: item.capacidade_deteccao,
      frequencia: item.frequencia, severidade: item.severidade,
      acoes: item.acoes || "", status: item.status,
    });
    setEditingId(item.id);
    setShowAddForm(true);
  };

  const selectedSubsystems = DP_SYSTEMS.find(s => s.sistema === formData.sistema)?.subsistemas || [];

  if (isLoading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /><span className="ml-2">Carregando FMECA...</span></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            FMEA/FMECA — PEO-DP 2026
          </h3>
          <p className="text-sm text-muted-foreground">
            14 campos obrigatórios • IMCA M 166 • NPR = Detecção × Frequência × Severidade • <Badge variant="outline" className="text-xs">Supabase Live</Badge>
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
            <Input placeholder="Buscar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-8 w-40 h-9" />
          </div>
          <Select value={filterSystem} onValueChange={setFilterSystem}>
            <SelectTrigger className="w-44 h-9"><SelectValue placeholder="Sistema" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Sistemas</SelectItem>
              {DP_SYSTEMS.map(s => <SelectItem key={s.sistema} value={s.sistema}>{s.sistema}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-36 h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Status</SelectItem>
              <SelectItem value="open">Aberto</SelectItem>
              <SelectItem value="mitigated">Mitigado</SelectItem>
              <SelectItem value="monitoring">Monitorando</SelectItem>
              <SelectItem value="accepted">Aceito</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" onClick={() => { setShowAddForm(true); setEditingId(null); setFormData(EMPTY_FORM); }} className="gap-1 h-9"><Plus className="h-3 w-3" /> Adicionar</Button>
          <Button size="sm" variant="outline" onClick={() => quickExport(items || [], "PEO-DP FMECA", "pdf")} className="gap-1 h-9"><Download className="h-3 w-3" /> PDF</Button>
        </div>
      </div>

      {/* Info Banner */}
      <Card className="bg-gradient-to-r from-amber-500/5 to-amber-600/10 border-amber-500/20">
        <CardContent className="py-3">
          <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">⚡ FMECA como item de excelência (PEO-DP 2026, item 1.10.1):</p>
          <p className="text-xs text-muted-foreground mt-1">14 colunas obrigatórias: Sistema • Subsistema • Componente • Função • Modo de Falha • Causa • Efeitos Locais • Efeitos Globais • Tipo Detecção • Capacidade Detecção • Frequência • Severidade • NPR • Ações/Recomendações</p>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card><CardContent className="pt-4 text-center"><p className="text-xs text-muted-foreground">Total Modos de Falha</p><p className="text-2xl font-bold">{filtered.length}</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-xs text-muted-foreground">NPR Médio</p><p className={`text-2xl font-bold ${getNPRColor(avgNPR)}`}>{avgNPR}</p></CardContent></Card>
        <Card className="border-destructive/20"><CardContent className="pt-4 text-center"><p className="text-xs text-muted-foreground">Críticos (NPR ≥ 80)</p><p className="text-2xl font-bold text-destructive">{criticalCount}</p></CardContent></Card>
        <Card className="border-success/20"><CardContent className="pt-4 text-center"><p className="text-xs text-muted-foreground">Mitigados</p><p className="text-2xl font-bold text-success">{mitigatedCount}/{filtered.length}</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-xs text-muted-foreground">Sistemas Cobertos</p><p className="text-2xl font-bold">{new Set(items.map(i => i.sistema)).size}/{DP_SYSTEMS.length}</p></CardContent></Card>
      </div>

      {/* Empty State */}
      {filtered.length === 0 && !isLoading && (
        <Card><CardContent className="py-12 text-center">
          <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-lg font-medium">Nenhum item FMECA cadastrado</p>
          <p className="text-sm text-muted-foreground mb-4">Clique em "Adicionar" para registrar o primeiro modo de falha</p>
          <Button onClick={() => setShowAddForm(true)}><Plus className="h-4 w-4 mr-2" /> Adicionar Item</Button>
        </CardContent></Card>
      )}

      {/* FMECA Table */}
      {filtered.length > 0 && (
        <Card>
          <CardContent className="pt-4">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-left text-muted-foreground bg-muted/30">
                    <th className="p-2 sticky left-0 bg-background z-10">Sistema</th>
                    <th className="p-2">Subsistema</th>
                    <th className="p-2">Componente</th>
                    <th className="p-2 min-w-[120px]">Função</th>
                    <th className="p-2 min-w-[120px]">Modo Falha</th>
                    <th className="p-2 min-w-[120px]">Causa</th>
                    <th className="p-2 min-w-[120px]">Efeitos Locais</th>
                    <th className="p-2 min-w-[120px]">Efeitos Globais</th>
                    <th className="p-2">Detecção</th>
                    <th className="p-2 text-center">D</th>
                    <th className="p-2 text-center">F</th>
                    <th className="p-2 text-center">S</th>
                    <th className="p-2 text-center font-bold">NPR</th>
                    <th className="p-2 min-w-[150px]">Ações/Recomendações</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(item => (
                    <tr key={item.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="p-2 font-medium sticky left-0 bg-background z-10">{item.sistema}</td>
                      <td className="p-2">{item.subsistema}</td>
                      <td className="p-2 font-medium">{item.componente}</td>
                      <td className="p-2">{item.funcao}</td>
                      <td className="p-2 text-destructive">{item.modo_falha}</td>
                      <td className="p-2">{item.causa_falha}</td>
                      <td className="p-2">{item.efeitos_locais}</td>
                      <td className="p-2 font-medium">{item.efeitos_globais}</td>
                      <td className="p-2">{item.tipo_deteccao}</td>
                      <td className="p-2 text-center">{item.capacidade_deteccao}</td>
                      <td className="p-2 text-center">{item.frequencia}</td>
                      <td className="p-2 text-center">{item.severidade}</td>
                      <td className="p-2 text-center"><Badge variant={getNPRBadge(item.npr || 0)} className="font-bold">{item.npr}</Badge></td>
                      <td className="p-2">{item.acoes}</td>
                      <td className="p-2">
                        <Select value={item.status} onValueChange={(v) => updateStatus.mutate({ id: item.id, status: v })}>
                          <SelectTrigger className="h-7 text-xs w-28">
                            <Badge variant={item.status === "mitigated" ? "outline" : item.status === "open" ? "destructive" : "secondary"} className="text-xs whitespace-nowrap">
                              {item.status === "mitigated" ? "✓ Mitigado" : item.status === "open" ? "⚠ Aberto" : item.status === "monitoring" ? "👁 Monitor." : "Aceito"}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">Aberto</SelectItem>
                            <SelectItem value="mitigated">Mitigado</SelectItem>
                            <SelectItem value="monitoring">Monitorando</SelectItem>
                            <SelectItem value="accepted">Aceito</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-2">
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleEdit(item)} aria-label="Editar item FMEA" title="Editar"><Edit className="h-3 w-3" /></Button>
                          <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={() => deleteMutation.mutate(item.id)} aria-label="Excluir item FMEA" title="Excluir"><Trash2 className="h-3 w-3" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Severity Reference */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Tabela de Severidade — Referência PEO-DP 2026</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {SEVERITY_TABLE.map(s => (
              <div key={s.level} className={`p-2 rounded border text-xs ${s.level >= 8 ? "border-destructive/30 bg-destructive/5" : s.level >= 5 ? "border-warning/30 bg-warning/5" : "border-success/30 bg-success/5"}`}>
                <p className="font-bold">{s.level} - {s.desc}</p>
                <p className="text-muted-foreground">{s.effect}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={showAddForm} onOpenChange={(o) => { setShowAddForm(o); if (!o) { setEditingId(null); setFormData(EMPTY_FORM); } }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingId ? "Editar Item FMECA" : "Novo Item FMECA"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Sistema *</Label>
              <Select value={formData.sistema} onValueChange={v => setFormData(p => ({ ...p, sistema: v, subsistema: "" }))}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>{DP_SYSTEMS.map(s => <SelectItem key={s.sistema} value={s.sistema}>{s.sistema}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Subsistema *</Label>
              <Select value={formData.subsistema} onValueChange={v => setFormData(p => ({ ...p, subsistema: v }))}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>{selectedSubsystems.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs">Componente *</Label><Input value={formData.componente} onChange={e => setFormData(p => ({ ...p, componente: e.target.value }))} /></div>
            <div><Label className="text-xs">Função *</Label><Input value={formData.funcao} onChange={e => setFormData(p => ({ ...p, funcao: e.target.value }))} /></div>
            <div><Label className="text-xs">Modo de Falha *</Label><Input value={formData.modo_falha} onChange={e => setFormData(p => ({ ...p, modo_falha: e.target.value }))} /></div>
            <div><Label className="text-xs">Causa da Falha</Label><Input value={formData.causa_falha} onChange={e => setFormData(p => ({ ...p, causa_falha: e.target.value }))} /></div>
            <div className="col-span-2"><Label className="text-xs">Efeitos Locais</Label><Textarea value={formData.efeitos_locais} onChange={e => setFormData(p => ({ ...p, efeitos_locais: e.target.value }))} rows={2} /></div>
            <div className="col-span-2"><Label className="text-xs">Efeitos Globais</Label><Textarea value={formData.efeitos_globais} onChange={e => setFormData(p => ({ ...p, efeitos_globais: e.target.value }))} rows={2} /></div>
            <div className="col-span-2"><Label className="text-xs">Tipo de Detecção</Label><Input value={formData.tipo_deteccao} onChange={e => setFormData(p => ({ ...p, tipo_deteccao: e.target.value }))} /></div>
            <div>
              <Label className="text-xs">Capacidade Detecção (1-10)</Label>
              <Input type="number" min={1} max={10} value={formData.capacidade_deteccao} onChange={e => setFormData(p => ({ ...p, capacidade_deteccao: Number(e.target.value) }))} />
            </div>
            <div>
              <Label className="text-xs">Frequência (1-10)</Label>
              <Input type="number" min={1} max={10} value={formData.frequencia} onChange={e => setFormData(p => ({ ...p, frequencia: Number(e.target.value) }))} />
            </div>
            <div>
              <Label className="text-xs">Severidade (1-10)</Label>
              <Input type="number" min={1} max={10} value={formData.severidade} onChange={e => setFormData(p => ({ ...p, severidade: Number(e.target.value) }))} />
            </div>
            <div>
              <Label className="text-xs">NPR (calculado)</Label>
              <div className="h-10 flex items-center px-3 rounded-md border bg-muted/50 font-bold text-lg">
                {formData.capacidade_deteccao * formData.frequencia * formData.severidade}
              </div>
            </div>
            <div className="col-span-2"><Label className="text-xs">Ações/Recomendações</Label><Textarea value={formData.acoes} onChange={e => setFormData(p => ({ ...p, acoes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
              {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingId ? "Salvar Alterações" : "Criar Item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
