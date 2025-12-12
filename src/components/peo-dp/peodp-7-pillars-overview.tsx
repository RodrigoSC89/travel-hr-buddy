/**
import { useState } from "react";;
 * PEO-DP 7 Pillars Overview Component
 * Visão geral dos 7 pilares estratégicos do Programa de Excelência em Operações DP
 * Baseado no documento Petrobras DC&L/LOEP/LOFF/EO - 15/09/2021
 */

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Users,
  GraduationCap,
  FileText,
  Radio,
  Wrench,
  TestTube,
  Shield,
  CheckCircle,
  AlertTriangle,
  Clock,
  Eye,
  Target,
  BookOpen,
  ClipboardCheck,
  Anchor
} from "lucide-react";

interface PillarData {
  id: string;
  name: string;
  code: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  description: string;
  objectives: string[];
  keyRequirements: Array<{
    code: string;
    title: string;
    description: string;
    mandatory: boolean;
  }>;
  references: string[];
  complianceScore?: number;
  status: "pending" | "in_progress" | "completed" | "review_needed";
}

const PILLARS: PillarData[] = [
  {
    id: "gestao",
    name: "Gestão",
    code: "3.2",
    icon: Users,
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-950/20",
    description: "Gestão de riscos, plano de ação, indicadores e abrangência de falhas",
    objectives: [
      "Alinhar Gestão de Riscos com objetivos e cultura organizacional",
      "Integrar Gestão de Riscos em todas as atividades",
      "Estabelecer segurança operacional como valor principal",
      "Nomear Company DP Authority conforme IMCA M 117"
    ],
    keyRequirements: [
      { code: "3.2.1.1", title: "Gestão de Riscos alinhada com objetivos", description: "Descrever alinhamento com estratégias e cultura", mandatory: true },
      { code: "3.2.2", title: "Estudo de riscos das operações", description: "Cópia atualizada entregue quando solicitada", mandatory: true },
      { code: "3.2.3", title: "Plano de Ação aprovado pela direção", description: "Aprovação pela mais alta direção", mandatory: true },
      { code: "3.2.17", title: "Indicador IPCLV", description: "Índice de Preenchimento Correto das Listas de Verificação - Meta 100%", mandatory: true },
      { code: "3.2.24", title: "Company DP Authority nomeado", description: "Responsável pela implementação conforme IMCA M 117", mandatory: true }
    ],
    references: ["PE-2LEP-00001", "ISO 31000", "ISO 9001", "IMCA M 117"],
    complianceScore: 85,
    status: "in_progress"
  },
  {
    id: "treinamentos",
    name: "Treinamentos",
    code: "3.3",
    icon: GraduationCap,
    color: "text-green-600",
    bgColor: "bg-green-50 dark:bg-green-950/20",
    description: "Capacitação em DP, bow-ties, FMEA e competências técnicas/comportamentais",
    objectives: [
      "Levantar e tratar lacunas em treinamentos",
      "Capacitar força de trabalho em Análises de Riscos DP",
      "Treinar em bow-ties e ferramentas equivalentes",
      "Manter familiarização contínua em sistemas DP"
    ],
    keyRequirements: [
      { code: "3.3.1", title: "Levantamento de lacunas em treinamentos", description: "Desenvolver e tratar lacunas da força de trabalho", mandatory: true },
      { code: "3.3.2", title: "Treinamentos em Análises de Riscos DP", description: "Toda força de trabalho treinada em análises de riscos", mandatory: true },
      { code: "3.3.3", title: "Treinamentos em Bow-ties", description: "Treinamento em bow-ties ou ferramentas equivalentes", mandatory: true },
      { code: "3.3.5", title: "Atualização em procedimentos de blackout", description: "Oficiais atualizados em recuperação de blackout", mandatory: true },
      { code: "3.3.6", title: "Manual do Sistema DP a bordo", description: "Cópia do Manual disponível a bordo", mandatory: true }
    ],
    references: ["IMCA M 117", "STCW", "IMO MSC/Circ.645"],
    complianceScore: 72,
    status: "in_progress"
  },
  {
    id: "procedimentos",
    name: "Procedimentos",
    code: "3.4",
    icon: FileText,
    color: "text-purple-600",
    bgColor: "bg-purple-50 dark:bg-purple-950/20",
    description: "Análise de desvios, incidentes, bow-ties e manual de operações",
    objectives: [
      "Elaborar procedimento de análise de desvios e incidentes",
      "Desenvolver bow-ties específicos por tipo de embarcação",
      "Configurar sistemas de referências em modo DP",
      "Assegurar listas de verificação pré-operacional completas"
    ],
    keyRequirements: [
      { code: "3.4.1", title: "Procedimento de análise de desvios e incidentes", description: "Análise e tratamento com devida abrangência", mandatory: true },
      { code: "3.4.2", title: "Bow-ties por tipo de embarcação", description: "Elaboração e atualização constante por projeto", mandatory: true },
      { code: "3.4.4", title: "Manual de Operações com configuração de referências DP", description: "Especificar melhor configuração dos sistemas", mandatory: true },
      { code: "3.4.6", title: "Lista de verificação pré-operacional completa", description: "Todos os testes previstos realizados", mandatory: true }
    ],
    references: ["IMCA M 109", "IMCA M 166", "PE-2LEP-00001"],
    complianceScore: 90,
    status: "completed"
  },
  {
    id: "operacao",
    name: "Operação",
    code: "3.5",
    icon: Radio,
    color: "text-orange-600",
    bgColor: "bg-orange-50 dark:bg-orange-950/20",
    description: "Sistema DP, FMEA, configuração UTC, exercícios de blackout e ASOG",
    objectives: [
      "Identificar e tratar problemas no sistema de energia",
      "Atender normas IMO, IMCA, OCIMF, MTS",
      "Manter FMEA atualizado e conhecido pelos Oficiais",
      "Realizar exercícios de blackout semestrais"
    ],
    keyRequirements: [
      { code: "3.5.1", title: "Identificação de problemas no sistema de energia", description: "Identificar e tratar problemas de geração/distribuição", mandatory: true },
      { code: "3.5.2", title: "Atendimento às normas IMO, IMCA, OCIMF, MTS", description: "Normas da Autoridade Marítima e padrões Petrobras", mandatory: true },
      { code: "3.5.4", title: "FMEA atualizado a bordo", description: "FMEA atualizado e do conhecimento dos Oficiais", mandatory: true },
      { code: "3.5.6", title: "Exercícios de recuperação de blackout semestrais", description: "Exercícios simulados a cada 6 meses", mandatory: true },
      { code: "3.5.7", title: "Configuração FMEA e ASOG", description: "ASOG elaborado com base no FMEA testado", mandatory: true }
    ],
    references: ["IMO MSC/Circ.1580", "IMCA M 166", "OCIMF DP Framework"],
    complianceScore: 88,
    status: "in_progress"
  },
  {
    id: "manutencao",
    name: "Manutenção",
    code: "3.6",
    icon: Wrench,
    color: "text-red-600",
    bgColor: "bg-red-50 dark:bg-red-950/20",
    description: "Plano anual de manutenção, software/hardware e sistemas críticos",
    objectives: [
      "Elaborar plano anual de manutenção preventiva",
      "Manter software e hardware atualizados",
      "Assegurar manutenção de sistemas críticos DP"
    ],
    keyRequirements: [
      { code: "3.6.1", title: "Plano de manutenção anual", description: "Plano preventiva com base em recomendações de fabricantes", mandatory: true },
      { code: "3.6.2", title: "Cópia atualizada do plano de manutenção", description: "Cópia sempre disponível para Petrobras", mandatory: true },
      { code: "3.6.3", title: "Software/hardware atualizados", description: "Sistemas DP com últimas atualizações", mandatory: true },
      { code: "3.6.4", title: "Manutenção de sistemas críticos", description: "Sistemas de segurança e controle crítico mantidos", mandatory: true }
    ],
    references: ["IMCA M 103", "IMCA M 182", "IMO MSC/Circ.645"],
    complianceScore: 78,
    status: "in_progress"
  },
  {
    id: "testes_anuais",
    name: "Testes Anuais DP",
    code: "3.7",
    icon: TestTube,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50 dark:bg-indigo-950/20",
    description: "DP Annual Trials, CAMO, ASOG e cronograma de testes de 5 anos",
    objectives: [
      "Realizar DP Annual Trials conforme IMCA M 190",
      "Definir escopo de testes baseado no FMEA",
      "Estabelecer cronograma de testes de 5 anos",
      "Manter CAMO/ASOG/FMEA atualizados após testes"
    ],
    keyRequirements: [
      { code: "3.7.1", title: "DP Annual Trials", description: "Testes anuais de DP conforme IMCA M 190", mandatory: true },
      { code: "3.7.2", title: "Escopo baseado no FMEA", description: "Testes alinhados com análise de modos de falha", mandatory: true },
      { code: "3.7.3", title: "Cronograma 5 anos", description: "Planejamento de testes para 5 anos", mandatory: true },
      { code: "3.7.4", title: "Relatórios de testes", description: "Documentação completa dos resultados", mandatory: true },
      { code: "3.7.5", title: "CAMO/ASOG/FMEA atualizados", description: "Atualização pós-testes obrigatória", mandatory: true }
    ],
    references: ["IMCA M 190", "IMCA M 166", "IMCA M 206"],
    complianceScore: 45,
    status: "pending"
  }
];

export const PEODP7PillarsOverview = memo(function() {
  const [selectedPillar, setSelectedPillar] = useState<PillarData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const getStatusBadge = (status: PillarData["status"]) => {
    const variants = {
      pending: { label: "Pendente", className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200" },
      in_progress: { label: "Em Andamento", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
      completed: { label: "Concluído", className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
      review_needed: { label: "Revisão Necessária", className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" }
    };
    const variant = variants[status];
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const handleViewDetails = (pillar: PillarData) => {
    setSelectedPillar(pillar);
    setIsDialogOpen(true);
  };

  const overallScore = Math.round(PILLARS.reduce((sum, p) => sum + (p.complianceScore || 0), 0) / PILLARS.length);

  return (
    <div className="space-y-6">
      {/* Header with Overall Score */}
      <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Anchor className="h-8 w-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  PEO-DP: Programa de Excelência em Operações DP
                  <Badge variant="outline">Petrobras 2021</Badge>
                </CardTitle>
                <CardDescription className="mt-1">
                  7 Pilares Estratégicos para Prevenção de Abalroações e Colisões com Unidades Marítimas
                </CardDescription>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Compliance Geral</p>
              <p className={`text-4xl font-bold ${getScoreColor(overallScore)}`}>{overallScore}%</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {PILLARS.map((pillar) => {
          const Icon = pillar.icon;
          return (
            <Card 
              key={pillar.id} 
              className="hover:shadow-lg transition-all duration-200 cursor-pointer group"
              onClick={() => handleViewDetails(pillar)}
            >
              <CardHeader className={`${pillar.bgColor} border-b`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className={`h-6 w-6 ${pillar.color}`} />
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {pillar.name}
                        <Badge variant="outline" className="text-xs">{pillar.code}</Badge>
                      </CardTitle>
                    </div>
                  </div>
                  {getStatusBadge(pillar.status)}
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {pillar.description}
                </p>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Conformidade</span>
                    <span className={`font-bold ${getScoreColor(pillar.complianceScore || 0)}`}>
                      {pillar.complianceScore}%
                    </span>
                  </div>
                  <Progress value={pillar.complianceScore || 0} className="h-2" />
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{pillar.keyRequirements.length} requisitos</span>
                  <span>{pillar.references.length} referências</span>
                </div>

                <Button variant="outline" size="sm" className="w-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <Eye className="h-4 w-4 mr-2" /> Ver Detalhes
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh]">
          {selectedPillar && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${selectedPillar.bgColor}`}>
                    <selectedPillar.icon className={`h-6 w-6 ${selectedPillar.color}`} />
                  </div>
                  <div>
                    <DialogTitle className="flex items-center gap-2">
                      {selectedPillar.name}
                      <Badge variant="outline">{selectedPillar.code}</Badge>
                      {getStatusBadge(selectedPillar.status)}
                    </DialogTitle>
                    <DialogDescription>{selectedPillar.description}</DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              
              <ScrollArea className="max-h-[60vh]">
                <div className="space-y-6 p-1">
                  {/* Objectives */}
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Target className="h-4 w-4" /> Objetivos
                    </h4>
                    <ul className="space-y-1">
                      {selectedPillar.objectives.map((obj, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                          {obj}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Key Requirements */}
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <ClipboardCheck className="h-4 w-4" /> Requisitos Principais
                    </h4>
                    <div className="space-y-2">
                      {selectedPillar.keyRequirements.map((req, i) => (
                        <div key={i} className="p-3 border rounded-lg bg-muted/50">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">{req.code}</Badge>
                              <span className="font-medium text-sm">{req.title}</span>
                            </div>
                            {req.mandatory && (
                              <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 text-xs">
                                Obrigatório
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{req.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* References */}
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <BookOpen className="h-4 w-4" /> Referências Normativas
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedPillar.references.map((ref, i) => (
                        <Badge key={i} variant="secondary">{ref}</Badge>
                      ))}
                    </div>
                  </div>

                  {/* Score */}
                  <div className="p-4 border rounded-lg bg-muted/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Score de Conformidade</span>
                      <span className={`text-2xl font-bold ${getScoreColor(selectedPillar.complianceScore || 0)}`}>
                        {selectedPillar.complianceScore}%
                      </span>
                    </div>
                    <Progress value={selectedPillar.complianceScore || 0} className="h-3" />
                  </div>
                </div>
              </ScrollArea>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Fechar
                </Button>
                <Button>
                  <ClipboardCheck className="h-4 w-4 mr-2" /> Iniciar Auditoria
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default PEODP7PillarsOverview;
