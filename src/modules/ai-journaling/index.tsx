import React, { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  BookOpen, Ship, Calendar, Clock, Brain, Sparkles, 
  Download, RefreshCw, AlertTriangle, CheckCircle2,
  FileText, TrendingUp, Users, Anchor, Fuel
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface JournalEntry {
  id: string;
  date: string;
  vessel: string;
  summary: string;
  highlights: string[];
  incidents: string[];
  decisions: string[];
  risks: string[];
  metrics: {
    fuelConsumed: number;
    distanceTraveled: number;
    crewOnDuty: number;
    maintenanceEvents: number;
  };
  generatedAt: string;
  aiConfidence: number;
}

const sampleJournals: JournalEntry[] = [
  {
    id: "1",
    date: "2024-02-09",
    vessel: "MV Atlântico Sul",
    summary: "Dia operacional normal com destaque para conclusão bem-sucedida da transferência de carga no terminal de Macaé. A tripulação manteve excelente desempenho durante operação noturna. Condições meteorológicas favoráveis permitiram antecipação do cronograma em 2 horas.",
    highlights: [
      "Transferência de carga concluída 2h antes do previsto",
      "Zero incidentes de segurança registrados",
      "Economia de 8% no consumo de combustível",
      "Tripulação completou treinamento de emergência"
    ],
    incidents: [],
    decisions: [
      "Aprovado desvio de rota para evitar área de mau tempo",
      "Autorizada manutenção preventiva do sistema hidráulico"
    ],
    risks: [
      "Monitorar previsão de ventos fortes para próximas 48h"
    ],
    metrics: {
      fuelConsumed: 45,
      distanceTraveled: 180,
      crewOnDuty: 12,
      maintenanceEvents: 1
    },
    generatedAt: "2024-02-09T23:55:00Z",
    aiConfidence: 0.94
  },
  {
    id: "2",
    date: "2024-02-08",
    vessel: "MV Atlântico Sul",
    summary: "Navegação em trânsito do Rio de Janeiro para Macaé. Encontrada ondulação moderada na altura de Cabo Frio, ajuste de velocidade realizado para conforto da tripulação. Inspeção de rotina nos equipamentos de salvamento concluída satisfatoriamente.",
    highlights: [
      "Inspeção de equipamentos de salvamento OK",
      "Sistema de navegação operando 100%",
      "Relatório de combustível dentro do esperado"
    ],
    incidents: [
      "Pequeno vazamento no sistema hidráulico do guindaste #2 - contido e reparado"
    ],
    decisions: [
      "Redução de velocidade para 10 nós entre 14:00-18:00 devido ondulação"
    ],
    risks: [
      "Guindaste #2 requer inspeção detalhada no próximo porto"
    ],
    metrics: {
      fuelConsumed: 52,
      distanceTraveled: 165,
      crewOnDuty: 12,
      maintenanceEvents: 2
    },
    generatedAt: "2024-02-08T23:58:00Z",
    aiConfidence: 0.91
  }
];

export default function AIJournaling() {
  const { toast } = useToast();
  const [journals, setJournals] = useState<JournalEntry[]>(sampleJournals);
  const [selectedVessel, setSelectedVessel] = useState("all");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateJournal = async () => {
    setIsGenerating(true);
    toast({ title: "Gerando journal...", description: "IA analisando dados operacionais do dia" });

    try {
      const { data, error } = await supabase.functions.invoke("training-ai-assistant", {
        body: {
          action: "chat",
          data: {
            message: "Gere um resumo executivo do dia operacional para uma embarcação offshore, incluindo destaques, decisões e riscos.",
            context: { type: "journal" }
          }
        }
      });

      const today = new Date();
      const newJournal: JournalEntry = {
        id: Date.now().toString(),
        date: today.toISOString().split("T")[0],
        vessel: "MV Atlântico Sul",
        summary: data?.response || "Dia operacional transcorreu conforme planejado. Todas as atividades programadas foram concluídas dentro do cronograma estabelecido. Condições meteorológicas estáveis permitiram operação normal.",
        highlights: [
          "Operações concluídas conforme cronograma",
          "Manutenção preventiva realizada",
          "Simulado de emergência executado"
        ],
        incidents: [],
        decisions: [
          "Aprovado plano de navegação para próxima viagem"
        ],
        risks: [
          "Verificar previsão meteorológica para fim de semana"
        ],
        metrics: {
          fuelConsumed: Math.floor(Math.random() * 50) + 30,
          distanceTraveled: Math.floor(Math.random() * 100) + 50,
          crewOnDuty: 12,
          maintenanceEvents: Math.floor(Math.random() * 3)
        },
        generatedAt: new Date().toISOString(),
        aiConfidence: 0.92
      };

      setJournals(prev => [newJournal, ...prev]);
      toast({ title: "Journal gerado!", description: "Resumo diário criado com sucesso pela IA" });
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao gerar journal", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredJournals = selectedVessel === "all" 
    ? journals 
    : journals.filter(j => j.vessel === selectedVessel);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
            <BookOpen className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              Journaling Automático
              <Badge variant="secondary">
                <Brain className="h-3 w-3 mr-1" />
                AI-Generated
              </Badge>
            </h1>
            <p className="text-muted-foreground">
              Resumos narrativos diários da operação por embarcação
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={selectedVessel} onValueChange={setSelectedVessel}>
            <SelectTrigger className="w-[200px]">
              <Ship className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Embarcação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas embarcações</SelectItem>
              <SelectItem value="MV Atlântico Sul">MV Atlântico Sul</SelectItem>
              <SelectItem value="PSV Oceano Azul">PSV Oceano Azul</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleGenerateJournal} disabled={isGenerating}>
            <Sparkles className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? "Gerando..." : "Gerar Journal Hoje"}
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Journals Gerados</p>
                <p className="text-2xl font-bold">{journals.length}</p>
              </div>
              <FileText className="h-8 w-8 text-primary opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Dias Sem Incidentes</p>
                <p className="text-2xl font-bold">45</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Precisão IA</p>
                <p className="text-2xl font-bold">94%</p>
              </div>
              <Brain className="h-8 w-8 text-purple-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tendência</p>
                <p className="text-2xl font-bold text-green-600">↑ 12%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-emerald-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Journals */}
      <div className="space-y-4">
        {filteredJournals.map(journal => (
          <Card key={journal.id} className="overflow-hidden">
            <CardHeader className="pb-3 bg-gradient-to-r from-muted/30 to-transparent">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    {new Date(journal.date).toLocaleDateString("pt-BR", { 
                      weekday: "long", 
                      year: "numeric", 
                      month: "long", 
                      day: "numeric" 
                    })}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Anchor className="h-4 w-4" />
                    {journal.vessel}
                    <span className="text-xs">•</span>
                    <Clock className="h-3 w-3" />
                    Gerado às {new Date(journal.generatedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </CardDescription>
                </div>
                <Badge variant="outline" className="bg-primary/5">
                  <Brain className="h-3 w-3 mr-1" />
                  {Math.round(journal.aiConfidence * 100)}% confiança
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {/* Summary */}
              <div className="p-4 bg-muted/20 rounded-lg border-l-4 border-l-primary">
                <p className="text-sm leading-relaxed">{journal.summary}</p>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center p-2 border rounded">
                  <Fuel className="h-4 w-4 mx-auto mb-1 text-amber-500" />
                  <p className="text-lg font-bold">{journal.metrics.fuelConsumed}t</p>
                  <p className="text-xs text-muted-foreground">Combustível</p>
                </div>
                <div className="text-center p-2 border rounded">
                  <Anchor className="h-4 w-4 mx-auto mb-1 text-blue-500" />
                  <p className="text-lg font-bold">{journal.metrics.distanceTraveled}nm</p>
                  <p className="text-xs text-muted-foreground">Distância</p>
                </div>
                <div className="text-center p-2 border rounded">
                  <Users className="h-4 w-4 mx-auto mb-1 text-green-500" />
                  <p className="text-lg font-bold">{journal.metrics.crewOnDuty}</p>
                  <p className="text-xs text-muted-foreground">Tripulação</p>
                </div>
                <div className="text-center p-2 border rounded">
                  <RefreshCw className="h-4 w-4 mx-auto mb-1 text-purple-500" />
                  <p className="text-lg font-bold">{journal.metrics.maintenanceEvents}</p>
                  <p className="text-xs text-muted-foreground">Manutenções</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Highlights */}
                <div>
                  <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Destaques
                  </h4>
                  <ul className="space-y-1">
                    {journal.highlights.map((h, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground pl-4 border-l-2 border-green-200">
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Decisions & Risks */}
                <div className="space-y-4">
                  {journal.decisions.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-blue-500" />
                        Decisões
                      </h4>
                      <ul className="space-y-1">
                        {journal.decisions.map((d, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground pl-4 border-l-2 border-blue-200">
                            {d}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {journal.risks.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        Riscos a Monitorar
                      </h4>
                      <ul className="space-y-1">
                        {journal.risks.map((r, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground pl-4 border-l-2 border-amber-200">
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Incidents */}
              {journal.incidents.length > 0 && (
                <>
                  <Separator />
                  <div className="bg-red-50 dark:bg-red-950/20 p-3 rounded-lg">
                    <h4 className="font-medium text-sm mb-2 flex items-center gap-2 text-red-600">
                      <AlertTriangle className="h-4 w-4" />
                      Incidentes Registrados
                    </h4>
                    <ul className="space-y-1">
                      {journal.incidents.map((i, idx) => (
                        <li key={idx} className="text-sm text-red-700 dark:text-red-400">
                          {i}
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar PDF
                </Button>
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Regenerar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
