import { useState, useMemo, useCallback } from "react";;
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
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Plus,
  FileText,
  TrendingUp,
  Users,
  Calendar,
  GitBranch,
  Target,
  Zap
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
  cinco_porques: string[];
  fishbone: {
    metodo: string;
    maquina: string;
    mao_obra: string;
    material: string;
    meio_ambiente: string;
    medicao: string;
  };
  completion_percentage: number;
}

const SAMPLE_CAPAS: CAPA[] = [
  {
    id: "1",
    nc_number: "NC-2024-001",
    nc_title: "Ausência de matriz de competências atualizada",
    practice_id: 4,
    status: "executando",
    acao_corretiva: "Criar matriz de competências completa para todas as funções críticas",
    acao_preventiva: "Implementar revisão trimestral da matriz",
    responsavel: "Ana Paula - RH",
    prazo: "2024-11-15",
    created_at: "2024-09-15",
    sla_dias: 60,
    dias_restantes: 12,
    cinco_porques: [
      "Por que não há matriz? Porque nunca foi criada formalmente.",
      "Por que nunca foi criada? Porque não havia procedimento definido.",
      "Por que não havia procedimento? Porque a prática 4 não estava bem implementada.",
      "Por que não estava implementada? Falta de recursos dedicados.",
      "Por que falta recursos? Priorização inadequada de SGSO."
    ],
    fishbone: {
      metodo: "Procedimento de gestão de competências inexistente",
      maquina: "Sistema HR sem módulo de competências",
      mao_obra: "Equipe RH sem treinamento em SGSO",
      material: "Templates de matriz não disponíveis",
      meio_ambiente: "Cultura de compliance baixa",
      medicao: "Indicadores de competência não definidos"
    },
    completion_percentage: 65
  },
  {
    id: "2",
    nc_number: "NC-2024-002",
    nc_title: "Procedimento MOC não implementado",
    practice_id: 13,
    status: "planejada",
    acao_corretiva: "Desenvolver e implementar procedimento completo de MOC",
    responsavel: "Eng. Roberto Santos",
    prazo: "2024-12-01",
    created_at: "2024-10-01",
    sla_dias: 60,
    dias_restantes: 28,
    cinco_porques: [
      "Por que não há MOC? Processo não foi formalizado.",
      "Por que não foi formalizado? Desconhecimento da exigência ANP.",
      "Por que desconhecimento? Treinamento SGSO incompleto.",
      "Por que incompleto? Rotatividade de pessoal.",
      "Por que rotatividade? Condições de trabalho offshore."
    ],
    fishbone: {
      metodo: "Fluxo de gestão de mudanças inexistente",
      maquina: "Software de workflow não configurado",
      mao_obra: "Engenheiros sem capacitação em MOC",
      material: "Formulários MOC não padronizados",
      meio_ambiente: "Pressão por produção vs segurança",
      medicao: "Mudanças não rastreadas"
    },
    completion_percentage: 0
  },
  {
    id: "3",
    nc_number: "NC-2024-003",
    nc_title: "Plano de integridade mecânica desatualizado",
    practice_id: 17,
    status: "aguardando_validacao",
    acao_corretiva: "Atualizar plano com novos equipamentos críticos",
    acao_preventiva: "Revisar plano a cada novo equipamento instalado",
    responsavel: "Eng. João Oliveira",
    prazo: "2024-11-20",
    created_at: "2024-09-20",
    sla_dias: 60,
    dias_restantes: 5,
    eficacia: "parcialmente_eficaz",
    cinco_porques: [
      "Por que desatualizado? Novos equipamentos não foram incluídos.",
      "Por que não incluídos? Processo de atualização não definido.",
      "Por que não definido? Falta de integração entre Compras e Manutenção.",
      "Por que falta integração? Sistemas não conectados.",
      "Por que não conectados? Investimento em TI não priorizado."
    ],
    fishbone: {
      metodo: "Processo de atualização de plano não definido",
      maquina: "PMS não integrado com compras",
      mao_obra: "Técnicos focados em corretiva",
      material: "Manuais de novos equipamentos pendentes",
      meio_ambiente: "Alta demanda operacional",
      medicao: "Cobertura do plano não medida"
    },
    completion_percentage: 90
  }
];

const getStatusConfig = (status: CAPA["status"]) => {
  const configs = {
    planejada: { color: "bg-secondary text-secondary-foreground", label: "Planejada", icon: Clock },
    executando: { color: "bg-blue-600 text-white", label: "Executando", icon: Zap },
    concluida: { color: "bg-green-600 text-white", label: "Concluída", icon: CheckCircle },
    rejeitada: { color: "bg-red-600 text-white", label: "Rejeitada", icon: XCircle },
    aguardando_validacao: { color: "bg-yellow-600 text-white", label: "Aguardando Validação", icon: AlertTriangle }
  };
  return configs[status];
});

const getEficaciaConfig = (eficacia?: CAPA["eficacia"]) => {
  if (!eficacia) return null;
  const configs = {
    eficaz: { color: "bg-green-600 text-white", label: "Eficaz" },
    parcialmente_eficaz: { color: "bg-yellow-600 text-white", label: "Parcialmente Eficaz" },
    ineficaz: { color: "bg-red-600 text-white", label: "Ineficaz" }
  };
  return configs[eficacia];
});

export const CAPAManager: React.FC = () => {
  const { toast } = useToast();
  const [selectedCAPA, setSelectedCAPA] = useState<CAPA | null>(null);
  const [showNewCAPADialog, setShowNewCAPADialog] = useState(false);
  const [activeTab, setActiveTab] = useState("lista");

  // KPIs
  const totalCAPAs = SAMPLE_CAPAS.length;
  const emAndamento = SAMPLE_CAPAS.filter(c => c.status === "executando").length;
  const atrasadas = SAMPLE_CAPAS.filter(c => c.dias_restantes < 0).length;
  const slaMedio = Math.round(SAMPLE_CAPAS.reduce((acc, c) => acc + (c.sla_dias - c.dias_restantes), 0) / totalCAPAs);

  const handleCreateCAPA = () => {
    toast({
      title: "CAPA Criada",
      description: "Nova ação corretiva/preventiva registrada com sucesso."
    };
    setShowNewCAPADialog(false);
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Total CAPAs</p>
                <p className="text-3xl font-bold text-blue-900">{totalCAPAs}</p>
              </div>
              <Target className="h-10 w-10 text-blue-600 opacity-70" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-700">Em Andamento</p>
                <p className="text-3xl font-bold text-yellow-900">{emAndamento}</p>
              </div>
              <Zap className="h-10 w-10 text-yellow-600 opacity-70" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700">Atrasadas</p>
                <p className="text-3xl font-bold text-red-900">{atrasadas}</p>
              </div>
              <AlertTriangle className="h-10 w-10 text-red-600 opacity-70" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">SLA Médio</p>
                <p className="text-3xl font-bold text-green-900">{slaMedio}d</p>
              </div>
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
              5 Porquês, Diagrama de Ishikawa (Fishbone), SLA e Eficácia
            </CardDescription>
          </div>
          <Dialog open={showNewCAPADialog} onOpenChange={setShowNewCAPADialog}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Nova CAPA
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Nova CAPA</DialogTitle>
                <DialogDescription>
                  Registre uma nova ação corretiva/preventiva vinculada a uma NC
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>NC Vinculada</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a NC" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nc-001">NC-2024-001 - Matriz de competências</SelectItem>
                        <SelectItem value="nc-002">NC-2024-002 - Procedimento MOC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Responsável</Label>
                    <Input placeholder="Nome do responsável" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Ação Corretiva</Label>
                  <Textarea placeholder="Descreva a ação corretiva..." />
                </div>
                <div className="space-y-2">
                  <Label>Ação Preventiva (opcional)</Label>
                  <Textarea placeholder="Descreva a ação preventiva..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Prazo</Label>
                    <Input type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label>SLA (dias)</Label>
                    <Input type="number" placeholder="60" />
                  </div>
                </div>
                <Button onClick={handleCreateCAPA} className="w-full">
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
              <TabsTrigger value="analise">Análise de Causa</TabsTrigger>
              <TabsTrigger value="sla">SLA & Eficácia</TabsTrigger>
            </TabsList>

            <TabsContent value="lista" className="space-y-4 mt-6">
              {SAMPLE_CAPAS.map((capa) => {
                const statusConfig = getStatusConfig(capa.status);
                const eficaciaConfig = getEficaciaConfig(capa.eficacia);
                const StatusIcon = statusConfig.icon;

                return (
                  <Card key={capa.id} className="border-2 hover:shadow-lg transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="font-mono">
                              {capa.nc_number}
                            </Badge>
                            <h3 className="font-bold text-lg">{capa.nc_title}</h3>
                            <Badge className={statusConfig.color}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusConfig.label}
                            </Badge>
                            {eficaciaConfig && (
                              <Badge className={eficaciaConfig.color}>
                                {eficaciaConfig.label}
                              </Badge>
                            )}
                          </div>

                          <div className="p-3 bg-muted/50 rounded-lg">
                            <p className="text-sm font-medium text-muted-foreground mb-1">Ação Corretiva:</p>
                            <p className="text-sm">{capa.acao_corretiva}</p>
                          </div>

                          {capa.acao_preventiva && (
                            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                              <p className="text-sm font-medium text-green-700 mb-1">Ação Preventiva:</p>
                              <p className="text-sm text-green-900">{capa.acao_preventiva}</p>
                            </div>
                          )}

                          <div className="grid grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Responsável</p>
                              <p className="font-semibold">{capa.responsavel}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Prazo</p>
                              <p className="font-semibold">{new Date(capa.prazo).toLocaleDateString("pt-BR")}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">SLA</p>
                              <p className="font-semibold">{capa.sla_dias} dias</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Restante</p>
                              <p className={`font-semibold ${capa.dias_restantes < 7 ? "text-red-600" : "text-green-600"}`}>
                                {capa.dias_restantes} dias
                              </p>
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-muted-foreground">Progresso</span>
                              <span className="font-bold">{capa.completion_percentage}%</span>
                            </div>
                            <Progress value={capa.completion_percentage} className="h-2" />
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 ml-4">
                          <Button variant="outline" size="sm" onClick={handleSetSelectedCAPA}>
                            <FileText className="h-4 w-4 mr-1" />
                            Detalhes
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => {
                            setSelectedCAPA(capa);
                            setActiveTab("analise");
                          }}>
                            <GitBranch className="h-4 w-4 mr-1" />
                            5 Porquês
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>

            <TabsContent value="analise" className="space-y-6 mt-6">
              {selectedCAPA ? (
                <div className="space-y-6">
                  <Card className="border-2 border-primary/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        5 Porquês - {selectedCAPA.nc_number}
                      </CardTitle>
                      <CardDescription>Análise de causa raiz através da técnica dos 5 Porquês</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {selectedCAPA.cinco_porques.map((porque, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                            <Badge className="bg-primary text-primary-foreground shrink-0">
                              {index + 1}º
                            </Badge>
                            <p className="text-sm">{porque}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-orange-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-orange-700">
                        <GitBranch className="h-5 w-5" />
                        Diagrama de Ishikawa (Fishbone) - 6M
                      </CardTitle>
                      <CardDescription>Análise de causas por categoria</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {Object.entries(selectedCAPA.fishbone).map(([key, value]) => {
                          const labels: Record<string key={string.id || index}, string> = {
                            metodo: "📋 Método",
                            maquina: "⚙️ Máquina",
                            mao_obra: "👷 Mão de Obra",
                            material: "📦 Material",
                            meio_ambiente: "🌍 Meio Ambiente",
                            medicao: "📏 Medição"
                          };
                          return (
                            <Card key={key} className="bg-orange-50 border-orange-200">
                              <CardContent className="p-4">
                                <p className="text-sm font-bold text-orange-800 mb-2">{labels[key]}</p>
                                <p className="text-sm text-orange-900">{value}</p>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <GitBranch className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-semibold">Selecione uma CAPA para ver a análise de causa</p>
                  <p className="text-sm">Clique em "5 Porquês" na lista de CAPAs</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="sla" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">SLA por Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {["planejada", "executando", "aguardando_validacao", "concluida"].map((status) => {
                        const count = SAMPLE_CAPAS.filter(c => c.status === status as CAPA["status"]).length;
                        const config = getStatusConfig(status as CAPA["status"]);
                        return (
                          <div key={status} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge className={config.color}>{config.label}</Badge>
                            </div>
                            <span className="font-bold text-lg">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Eficácia das CAPAs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {["eficaz", "parcialmente_eficaz", "ineficaz"].map((eficacia) => {
                        const count = SAMPLE_CAPAS.filter(c => c.eficacia === eficacia as CAPA["eficacia"]).length;
                        const config = getEficaciaConfig(eficacia as CAPA["eficacia"]);
                        if (!config) return null;
                        return (
                          <div key={eficacia} className="flex items-center justify-between">
                            <Badge className={config.color}>{config.label}</Badge>
                            <span className="font-bold text-lg">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">CAPAs Próximas do Vencimento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {SAMPLE_CAPAS.filter(c => c.dias_restantes <= 14 && c.status !== "concluida").map((capa) => (
                      <div key={capa.id} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div>
                          <p className="font-semibold">{capa.nc_number} - {capa.nc_title}</p>
                          <p className="text-sm text-muted-foreground">{capa.responsavel}</p>
                        </div>
                        <Badge className={capa.dias_restantes < 7 ? "bg-red-600 text-white" : "bg-yellow-600 text-white"}>
                          {capa.dias_restantes} dias restantes
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
});

export default CAPAManager;
