/**
 * SGSO Maturity Curve - PDCA Cycle Tracking
 * Visual maturity assessment aligned with ANP guidelines
 * REFACTORED: Uses useSGSOMaturityData hook for real data
 */
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, Target, CheckCircle2, RotateCcw,
  ArrowRight, Award, AlertCircle, Loader2
} from "lucide-react";
import { useSGSOMaturityData } from "@/hooks/useSGSOMaturityData";

// Maturity levels
const MATURITY_LEVELS = [
  { level: 1, name: "Inicial", description: "Processos ad hoc, não padronizados", color: "bg-red-500" },
  { level: 2, name: "Gerenciado", description: "Processos planejados e executados", color: "bg-orange-500" },
  { level: 3, name: "Definido", description: "Processos padronizados e documentados", color: "bg-yellow-500" },
  { level: 4, name: "Mensurado", description: "Processos medidos e controlados", color: "bg-blue-500" },
  { level: 5, name: "Otimizado", description: "Melhoria contínua implementada", color: "bg-green-500" },
];

// PDCA phases
const PDCA_PHASES = [
  { id: "plan", name: "Plan (Planejar)", icon: Target, color: "text-blue-500", bgColor: "bg-blue-500/10" },
  { id: "do", name: "Do (Executar)", icon: ArrowRight, color: "text-green-500", bgColor: "bg-green-500/10" },
  { id: "check", name: "Check (Verificar)", icon: CheckCircle2, color: "text-yellow-500", bgColor: "bg-yellow-500/10" },
  { id: "act", name: "Act (Agir)", icon: RotateCcw, color: "text-purple-500", bgColor: "bg-purple-500/10" },
];

export const SGSOMaturityCurve: React.FC = () => {
  const { maturityData, stats, isLoading, error } = useSGSOMaturityData();

  const getTrendIcon = (trend: string) => {
    switch (trend) {
    case "up":
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    case "down":
      return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
    default:
      return <ArrowRight className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getMaturityLevel = (level: number) => {
    return MATURITY_LEVELS.find(m => m.level === level) || MATURITY_LEVELS[0];
  };

  const getPDCAPhase = (phase: string) => {
    return PDCA_PHASES.find(p => p.id === phase) || PDCA_PHASES[0];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Carregando dados de maturidade...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        <AlertCircle className="h-8 w-8 mx-auto mb-2" />
        <p>Erro ao carregar dados: {error.message}</p>
      </div>
    );
  }

  const overallMaturity = stats?.overallMaturity || 0;

  return (
    <div className="space-y-6">
      {/* Overall Maturity Score */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Maturidade Geral do SGSO
            </CardTitle>
            <CardDescription>
              Índice de maturidade baseado nas 16 Práticas de Gestão ANP
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="text-5xl font-bold text-primary">{overallMaturity}%</div>
              <div className="flex-1">
                <Progress value={overallMaturity} className="h-4" />
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  {MATURITY_LEVELS.map((level) => (
                    <span key={level.level}>{level.name}</span>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Ciclo PDCA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {PDCA_PHASES.map((phase) => {
                const count = stats?.practicesByPhase?.[phase.id as keyof typeof stats.practicesByPhase] || 0;
                const IconComponent = phase.icon;
                return (
                  <div key={phase.id} className={`p-3 rounded-lg ${phase.bgColor}`}>
                    <div className="flex items-center gap-2">
                      <IconComponent className={`h-4 w-4 ${phase.color}`} />
                      <span className="text-sm font-medium">{count}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{phase.name.split(" ")[0]}</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Practice Details Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Práticas de Gestão ANP</CardTitle>
          <CardDescription>
            Detalhamento das 16 práticas com níveis de maturidade e fase PDCA
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="all">Todas</TabsTrigger>
              {PDCA_PHASES.map(phase => (
                <TabsTrigger key={phase.id} value={phase.id}>
                  {phase.name.split(" ")[0]}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="all" className="space-y-2">
              {maturityData.map(practice => {
                const maturityLevel = getMaturityLevel(practice.currentLevel);
                const pdcaPhase = getPDCAPhase(practice.pdcaPhase);
                const gap = practice.targetLevel - practice.currentLevel;
                
                return (
                  <div 
                    key={practice.practiceId}
                    className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-16 text-center">
                      <Badge variant="outline" className="font-mono">
                        {practice.practiceId}
                      </Badge>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{practice.practiceName}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className={`w-2 h-2 rounded-full ${maturityLevel.color}`} />
                        <span className="text-xs text-muted-foreground">
                          Nível {practice.currentLevel} - {maturityLevel.name}
                        </span>
                        {gap > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            Gap: {gap}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className={`px-2 py-1 rounded text-xs ${pdcaPhase.bgColor} ${pdcaPhase.color}`}>
                        {pdcaPhase.name.split(" ")[0]}
                      </div>
                      <div className="text-sm font-medium w-12 text-right">
                        {practice.lastAuditScore}%
                      </div>
                      {getTrendIcon(practice.trend)}
                    </div>
                  </div>
                );
              })}
            </TabsContent>

            {PDCA_PHASES.map(phase => (
              <TabsContent key={phase.id} value={phase.id} className="space-y-2">
                {maturityData
                  .filter(p => p.pdcaPhase === phase.id)
                  .map(practice => {
                    const maturityLevel = getMaturityLevel(practice.currentLevel);
                    
                    return (
                      <div 
                        key={practice.practiceId}
                        className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <Badge variant="outline" className="font-mono w-16 justify-center">
                          {practice.practiceId}
                        </Badge>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{practice.practiceName}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className={`w-2 h-2 rounded-full ${maturityLevel.color}`} />
                            <span className="text-xs text-muted-foreground">
                              {maturityLevel.name}
                            </span>
                          </div>
                        </div>
                        <div className="text-sm font-medium">{practice.lastAuditScore}%</div>
                        {getTrendIcon(practice.trend)}
                      </div>
                    );
                  })}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Stats Summary */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{stats.totalAudits}</div>
              <div className="text-sm text-muted-foreground">Auditorias Realizadas</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{stats.avgComplianceScore}%</div>
              <div className="text-sm text-muted-foreground">Score Médio</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-red-500">{stats.nonConformitiesCount}</div>
              <div className="text-sm text-muted-foreground">Não Conformidades</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-green-500">
                {maturityData.filter(p => p.currentLevel >= p.targetLevel).length}
              </div>
              <div className="text-sm text-muted-foreground">Metas Atingidas</div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
