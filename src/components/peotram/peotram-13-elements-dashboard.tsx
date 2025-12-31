import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  PEOTRAM_2024_ELEMENTS, 
  getTotalItems, 
  getCriticalElements,
  calculateOverallScore 
} from "./peotram-13-elements-data";
import { 
  BarChart3,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Star,
  TrendingUp,
  FileCheck,
  Clock,
  Target,
  Award,
  Shield,
  Zap
} from "lucide-react";

interface ElementScore {
  elementNumber: number;
  score: number;
  conformantItems: number;
  nonConformantItems: number;
  observationItems: number;
  totalItems: number;
}

interface Peotram13DashboardProps {
  auditId?: string;
  vesselName?: string;
  auditDate?: string;
  auditorName?: string;
  scores?: Record<number, ElementScore>;
  onElementClick?: (elementNumber: number) => void;
  onGenerateReport?: () => void;
}

export const Peotram13Dashboard: React.FC<Peotram13DashboardProps> = ({
  vesselName = "Embarcação",
  auditDate = new Date().toLocaleDateString('pt-BR'),
  auditorName = "Auditor",
  scores = {},
  onElementClick,
  onGenerateReport
}) => {
  const totalItems = getTotalItems();
  const criticalElements = getCriticalElements();
  
  // Calcular estatísticas gerais
  const totalConformant = Object.values(scores).reduce((acc, s) => acc + s.conformantItems, 0);
  const totalNonConformant = Object.values(scores).reduce((acc, s) => acc + s.nonConformantItems, 0);
  const totalObservations = Object.values(scores).reduce((acc, s) => acc + s.observationItems, 0);
  const totalEvaluated = totalConformant + totalNonConformant + totalObservations;
  
  const overallConformity = totalEvaluated > 0 
    ? Math.round((totalConformant / totalEvaluated) * 100) 
    : 0;

  const getConformityColor = (percent: number) => {
    if (percent >= 90) return 'text-success';
    if (percent >= 75) return 'text-info';
    if (percent >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getConformityBg = (percent: number) => {
    if (percent >= 90) return 'bg-success/10 border-success/30';
    if (percent >= 75) return 'bg-info/10 border-info/30';
    if (percent >= 60) return 'bg-warning/10 border-warning/30';
    return 'bg-destructive/10 border-destructive/30';
  };

  const getVerdict = (percent: number): { label: string; color: string; icon: React.ReactNode } => {
    if (percent >= 90) return { 
      label: 'APROVADO', 
      color: 'text-success', 
      icon: <Award className="w-6 h-6 text-success" /> 
    };
    if (percent >= 75) return { 
      label: 'APROVADO COM OBSERVAÇÕES', 
      color: 'text-info', 
      icon: <CheckCircle className="w-6 h-6 text-info" /> 
    };
    if (percent >= 60) return { 
      label: 'PENDENTE DE CORREÇÕES', 
      color: 'text-warning', 
      icon: <AlertTriangle className="w-6 h-6 text-warning" /> 
    };
    return { 
      label: 'NÃO APROVADO', 
      color: 'text-destructive', 
      icon: <XCircle className="w-6 h-6 text-destructive" /> 
    };
  };

  const verdict = getVerdict(overallConformity);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" />
            Dashboard PEOTRAM 2024
          </h2>
          <p className="text-muted-foreground">
            {vesselName} | Data: {auditDate} | Auditor: {auditorName}
          </p>
        </div>
        <Button onClick={onGenerateReport} className="bg-primary">
          <FileCheck className="w-4 h-4 mr-2" />
          Gerar Relatório
        </Button>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Conformidade Geral */}
        <Card className={`border-2 ${getConformityBg(overallConformity)}`}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conformidade Geral</p>
                <p className={`text-4xl font-bold ${getConformityColor(overallConformity)}`}>
                  {overallConformity}%
                </p>
              </div>
              {verdict.icon}
            </div>
            <Badge className={`mt-2 ${verdict.color}`}>
              {verdict.label}
            </Badge>
          </CardContent>
        </Card>

        {/* Itens Conformes */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Itens Conformes</p>
                <p className="text-3xl font-bold text-success">{totalConformant}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-success/30" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              de {totalItems} itens totais
            </p>
          </CardContent>
        </Card>

        {/* Não-Conformidades */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Não-Conformidades</p>
                <p className="text-3xl font-bold text-destructive">{totalNonConformant}</p>
              </div>
              <XCircle className="w-8 h-8 text-destructive/30" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Requerem ação corretiva
            </p>
          </CardContent>
        </Card>

        {/* Observações */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Observações</p>
                <p className="text-3xl font-bold text-warning">{totalObservations}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-warning/30" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Melhorias recomendadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Conformidade por Elemento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Conformidade por Elemento
          </CardTitle>
          <CardDescription>
            Visão detalhada dos 13 elementos da auditoria PEOTRAM
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {PEOTRAM_2024_ELEMENTS.map((element) => {
              const score = scores[element.elementNumber];
              const percent = score 
                ? Math.round((score.conformantItems / score.totalItems) * 100)
                : 0;
              const hasData = !!score;
              
              return (
                <div 
                  key={element.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all hover:border-primary/50 ${
                    element.isCritical ? 'bg-destructive/5 border-destructive/20' : 'bg-muted/20'
                  }`}
                  onClick={() => onElementClick?.(element.elementNumber)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        Elemento {element.elementNumber}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {element.elementName}
                      </span>
                      {element.isCritical && (
                        <Badge variant="destructive" className="text-xs">
                          <Star className="w-3 h-3 mr-1" />
                          Crítico
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">
                        Peso: {element.weightPercentage}%
                      </span>
                      <span className={`font-bold ${getConformityColor(percent)}`}>
                        {hasData ? `${percent}%` : '-'}
                      </span>
                    </div>
                  </div>
                  <Progress 
                    value={percent} 
                    className={`h-2 ${!hasData ? 'opacity-30' : ''}`}
                  />
                  {hasData && score && (
                    <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="text-success">✓ {score.conformantItems} conformes</span>
                      <span className="text-destructive">✗ {score.nonConformantItems} NC</span>
                      <span className="text-warning">! {score.observationItems} obs</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Elementos Críticos */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Shield className="w-5 h-5" />
            Elementos Críticos - Atenção Especial
          </CardTitle>
          <CardDescription>
            Estes elementos têm peso maior na avaliação e requerem atenção redobrada
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {criticalElements.map((element) => {
              const score = scores[element.elementNumber];
              const percent = score 
                ? Math.round((score.conformantItems / score.totalItems) * 100)
                : 0;
              
              return (
                <div 
                  key={element.id}
                  className="p-4 rounded-lg bg-destructive/5 border border-destructive/20 cursor-pointer hover:bg-destructive/10 transition-colors"
                  onClick={() => onElementClick?.(element.elementNumber)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-4 h-4 text-destructive" />
                    <span className="font-semibold">
                      Elemento {element.elementNumber}: {element.elementSigla}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {element.elementName}
                  </p>
                  <div className="flex items-center justify-between">
                    <Progress value={percent} className="flex-1 h-2 mr-4" />
                    <span className={`font-bold ${getConformityColor(percent)}`}>
                      {score ? `${percent}%` : 'Pendente'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Ações rápidas */}
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1">
          <Clock className="w-4 h-4 mr-2" />
          Ver Histórico
        </Button>
        <Button variant="outline" className="flex-1">
          <TrendingUp className="w-4 h-4 mr-2" />
          Comparar Auditorias
        </Button>
        <Button variant="outline" className="flex-1">
          <Zap className="w-4 h-4 mr-2" />
          Análise IA
        </Button>
      </div>
    </div>
  );
};

export default Peotram13Dashboard;
