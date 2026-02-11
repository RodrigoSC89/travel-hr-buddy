/**
 * CAPA Manager - Real Supabase Integration
 * Corrective & Preventive Actions with 5 Whys and Fishbone
 */

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  CheckCircle, XCircle, Clock, AlertTriangle, Plus, FileText,
  TrendingUp, Users, Calendar, GitBranch, Target, Zap, Loader2
} from "lucide-react";

interface CAPA {
  id: string;
  nc_number: string;
  nc_title: string;
  practice_id: number;
  status: "planejada" | "executando" | "concluida" | "rejeitada" | "aguardando_validacao";
  acao_corretiva: string;
  acao_preventiva?: string;
  responsavel: string;
  prazo: string;
  created_at: string;
  sla_dias: number;
  dias_restantes: number;
  eficacia?: "eficaz" | "parcialmente_eficaz" | "ineficaz";
  completion_percentage: number;
}

const getStatusConfig = (status: CAPA["status"]) => {
  const configs = {
    planejada: { color: "bg-secondary text-secondary-foreground", label: "Planejada", icon: Clock },
    executando: { color: "bg-blue-600 text-white", label: "Executando", icon: Zap },
    concluida: { color: "bg-green-600 text-white", label: "Concluída", icon: CheckCircle },
    rejeitada: { color: "bg-red-600 text-white", label: "Rejeitada", icon: XCircle },
    aguardando_validacao: { color: "bg-yellow-600 text-white", label: "Aguardando Validação", icon: AlertTriangle }
  };
  return configs[status] || configs.planejada;
};

const getEficaciaConfig = (eficacia?: CAPA["eficacia"]) => {
  if (!eficacia) return null;
  const configs = {
    eficaz: { color: "bg-green-600 text-white", label: "Eficaz" },
    parcialmente_eficaz: { color: "bg-yellow-600 text-white", label: "Parcialmente Eficaz" },
    ineficaz: { color: "bg-red-600 text-white", label: "Ineficaz" }
  };
  return configs[eficacia];
};

export const CAPAManager: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCAPA, setSelectedCAPA] = useState<CAPA | null>(null);
  const [showNewCAPADialog, setShowNewCAPADialog] = useState(false);
  const [activeTab, setActiveTab] = useState("lista");
  const [formData, setFormData] = useState({ nc_number: '', acao_corretiva: '', acao_preventiva: '', responsavel: '', prazo: '', sla_dias: 60 });

  // Fetch CAPAs from corrective_actions table
  const { data: capas = [], isLoading } = useQuery({
    queryKey: ['capas-real'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('corrective_actions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error || !data) return [];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase dynamic row mapping
      return data.map((d: any): CAPA => {
        const prazo = d.due_date || d.target_date || new Date().toISOString();
        const diasRestantes = Math.ceil((new Date(prazo).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        const statusMap: Record<string, CAPA['status']> = {
          open: 'planejada', in_progress: 'executando', closed: 'concluida',
          completed: 'concluida', rejected: 'rejeitada', pending: 'aguardando_validacao'
        };
        return {
          id: d.id,
          nc_number: d.nc_id || d.reference_number || `CA-${d.id.slice(0, 6)}`,
          nc_title: d.title || d.description?.slice(0, 60) || 'Ação Corretiva',
          practice_id: d.practice_id || 0,
          status: statusMap[d.status] || 'planejada',
          acao_corretiva: d.description || d.corrective_action || '',
          acao_preventiva: d.preventive_action,
          responsavel: d.assigned_to || d.responsible || 'Não atribuído',
          prazo: prazo,
          created_at: d.created_at,
          sla_dias: d.sla_days || 60,
          dias_restantes: diasRestantes,
          eficacia: d.effectiveness as CAPA['eficacia'],
          completion_percentage: d.completion_percentage || (d.status === 'completed' || d.status === 'closed' ? 100 : d.status === 'in_progress' ? 50 : 0),
        };
      });
    },
  });

  // Create CAPA mutation
  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('corrective_actions').insert({
        title: formData.acao_corretiva.slice(0, 80),
        description: formData.acao_corretiva,
        preventive_action: formData.acao_preventiva || null,
        assigned_to: formData.responsavel,
        due_date: formData.prazo || null,
        sla_days: formData.sla_dias,
        status: 'open',
        reference_number: formData.nc_number,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['capas-real'] });
      setShowNewCAPADialog(false);
      setFormData({ nc_number: '', acao_corretiva: '', acao_preventiva: '', responsavel: '', prazo: '', sla_dias: 60 });
      toast({ title: "CAPA Criada", description: "Nova ação corretiva/preventiva registrada com sucesso." });
    },
    onError: () => toast({ title: "Erro", description: "Não foi possível criar a CAPA.", variant: "destructive" }),
  });

  // KPIs
  const totalCAPAs = capas.length;
  const emAndamento = capas.filter(c => c.status === "executando").length;
  const atrasadas = capas.filter(c => c.dias_restantes < 0).length;
  const slaMedio = totalCAPAs > 0 ? Math.round(capas.reduce((acc, c) => acc + Math.max(0, c.sla_dias - c.dias_restantes), 0) / totalCAPAs) : 0;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-medium text-blue-700 dark:text-blue-300">Total CAPAs</p><p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{totalCAPAs}</p></div>
              <Target className="h-10 w-10 text-blue-600 opacity-70" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/30 dark:to-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">Em Andamento</p><p className="text-3xl font-bold text-yellow-900 dark:text-yellow-100">{emAndamento}</p></div>
              <Zap className="h-10 w-10 text-yellow-600 opacity-70" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/20 border-red-200 dark:border-red-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-medium text-red-700 dark:text-red-300">Atrasadas</p><p className="text-3xl font-bold text-red-900 dark:text-red-100">{atrasadas}</p></div>
              <AlertTriangle className="h-10 w-10 text-red-600 opacity-70" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20 border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-medium text-green-700 dark:text-green-300">SLA Médio</p><p className="text-3xl font-bold text-green-900 dark:text-green-100">{slaMedio}d</p></div>
              <TrendingUp className="h-10 w-10 text-green-600 opacity-70" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-6 w-6 text-primary" />
              Gestão de CAPA - Ações Corretivas e Preventivas
            </CardTitle>
            <CardDescription>
              SLA, Eficácia e Rastreabilidade Completa
            </CardDescription>
          </div>
          <Dialog open={showNewCAPADialog} onOpenChange={setShowNewCAPADialog}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90"><Plus className="h-4 w-4 mr-2" />Nova CAPA</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Nova CAPA</DialogTitle>
                <DialogDescription>Registre uma nova ação corretiva/preventiva</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Referência NC</Label>
                    <Input placeholder="NC-2026-XXX" value={formData.nc_number} onChange={e => setFormData(p => ({ ...p, nc_number: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Responsável</Label>
                    <Input placeholder="Nome do responsável" value={formData.responsavel} onChange={e => setFormData(p => ({ ...p, responsavel: e.target.value }))} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Ação Corretiva *</Label>
                  <Textarea placeholder="Descreva a ação corretiva..." value={formData.acao_corretiva} onChange={e => setFormData(p => ({ ...p, acao_corretiva: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Ação Preventiva (opcional)</Label>
                  <Textarea placeholder="Descreva a ação preventiva..." value={formData.acao_preventiva} onChange={e => setFormData(p => ({ ...p, acao_preventiva: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Prazo</Label><Input type="date" value={formData.prazo} onChange={e => setFormData(p => ({ ...p, prazo: e.target.value }))} /></div>
                  <div className="space-y-2"><Label>SLA (dias)</Label><Input type="number" value={formData.sla_dias} onChange={e => setFormData(p => ({ ...p, sla_dias: parseInt(e.target.value) || 60 }))} /></div>
                </div>
                <Button onClick={() => createMutation.mutate()} className="w-full" disabled={createMutation.isPending || !formData.acao_corretiva}>
                  {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Criar CAPA
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 w-full max-w-md">
              <TabsTrigger value="lista">Lista</TabsTrigger>
              <TabsTrigger value="sla">SLA & Eficácia</TabsTrigger>
              <TabsTrigger value="stats">Estatísticas</TabsTrigger>
            </TabsList>

            <TabsContent value="lista" className="space-y-4 mt-6">
              {isLoading ? (
                <div className="text-center py-12"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /><p className="text-sm text-muted-foreground mt-2">Carregando CAPAs...</p></div>
              ) : capas.length === 0 ? (
                <div className="text-center py-12">
                  <GitBranch className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                  <h3 className="font-medium mb-2">Nenhuma CAPA registrada</h3>
                  <p className="text-sm text-muted-foreground mb-4">Crie a primeira ação corretiva/preventiva</p>
                  <Button onClick={() => setShowNewCAPADialog(true)}><Plus className="h-4 w-4 mr-2" />Nova CAPA</Button>
                </div>
              ) : (
                capas.map((capa) => {
                  const statusConfig = getStatusConfig(capa.status);
                  const eficaciaConfig = getEficaciaConfig(capa.eficacia);
                  const StatusIcon = statusConfig.icon;

                  return (
                    <Card key={capa.id} className="border-2 hover:shadow-lg transition-all">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-3 flex-wrap">
                              <Badge variant="outline" className="font-mono">{capa.nc_number}</Badge>
                              <h3 className="font-bold text-lg">{capa.nc_title}</h3>
                              <Badge className={statusConfig.color}><StatusIcon className="h-3 w-3 mr-1" />{statusConfig.label}</Badge>
                              {eficaciaConfig && <Badge className={eficaciaConfig.color}>{eficaciaConfig.label}</Badge>}
                            </div>
                            <div className="p-3 bg-muted/50 rounded-lg">
                              <p className="text-sm font-medium text-muted-foreground mb-1">Ação Corretiva:</p>
                              <p className="text-sm">{capa.acao_corretiva}</p>
                            </div>
                            {capa.acao_preventiva && (
                              <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                                <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">Ação Preventiva:</p>
                                <p className="text-sm">{capa.acao_preventiva}</p>
                              </div>
                            )}
                            <div className="grid grid-cols-4 gap-4 text-sm">
                              <div><p className="text-muted-foreground">Responsável</p><p className="font-semibold">{capa.responsavel}</p></div>
                              <div><p className="text-muted-foreground">Prazo</p><p className="font-semibold">{new Date(capa.prazo).toLocaleDateString("pt-BR")}</p></div>
                              <div><p className="text-muted-foreground">SLA</p><p className="font-semibold">{capa.sla_dias} dias</p></div>
                              <div><p className="text-muted-foreground">Restante</p><p className={`font-semibold ${capa.dias_restantes < 7 ? "text-red-600" : "text-green-600"}`}>{capa.dias_restantes} dias</p></div>
                            </div>
                            <div>
                              <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">Progresso</span><span className="font-bold">{capa.completion_percentage}%</span></div>
                              <Progress value={capa.completion_percentage} className="h-2" />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </TabsContent>

            <TabsContent value="sla" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader><CardTitle className="text-lg">Distribuição por Status</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {(["planejada", "executando", "aguardando_validacao", "concluida"] as const).map((status) => {
                        const count = capas.filter(c => c.status === status).length;
                        const config = getStatusConfig(status);
                        return (
                          <div key={status} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge className={config.color}>{config.label}</Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold">{count}</span>
                              <Progress value={totalCAPAs > 0 ? (count / totalCAPAs) * 100 : 0} className="w-24 h-2" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-lg">Eficácia das CAPAs</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {(["eficaz", "parcialmente_eficaz", "ineficaz"] as const).map((eficacia) => {
                        const count = capas.filter(c => c.eficacia === eficacia).length;
                        const config = getEficaciaConfig(eficacia);
                        return config ? (
                          <div key={eficacia} className="flex items-center justify-between">
                            <Badge className={config.color}>{config.label}</Badge>
                            <span className="font-bold">{count}</span>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="stats" className="mt-6">
              <Card>
                <CardContent className="py-8 text-center">
                  <TrendingUp className="h-12 w-12 mx-auto text-primary mb-4" />
                  <h3 className="font-bold text-lg mb-2">Resumo de CAPAs</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div className="p-4 bg-muted rounded-lg"><p className="text-2xl font-bold">{totalCAPAs}</p><p className="text-xs text-muted-foreground">Total</p></div>
                    <div className="p-4 bg-muted rounded-lg"><p className="text-2xl font-bold text-green-600">{capas.filter(c => c.status === 'concluida').length}</p><p className="text-xs text-muted-foreground">Concluídas</p></div>
                    <div className="p-4 bg-muted rounded-lg"><p className="text-2xl font-bold text-red-600">{atrasadas}</p><p className="text-xs text-muted-foreground">Atrasadas</p></div>
                    <div className="p-4 bg-muted rounded-lg"><p className="text-2xl font-bold text-blue-600">{totalCAPAs > 0 ? Math.round(capas.reduce((a, c) => a + c.completion_percentage, 0) / totalCAPAs) : 0}%</p><p className="text-xs text-muted-foreground">Progresso Médio</p></div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};