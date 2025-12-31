/**
 * SGSO Maturity Curve - PDCA Cycle Tracking
 * Visual maturity assessment aligned with ANP guidelines
 */
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, Target, CheckCircle2, RotateCcw,
  ArrowRight, Award, AlertCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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

interface MaturityData {
  practiceId: string;
  practiceName: string;
  currentLevel: number;
  targetLevel: number;
  pdcaPhase: string;
  trend: "up" | "down" | "stable";
  lastAuditScore: number;
}

export const SGSOMaturityCurve: React.FC = () => {
  const [maturityData, setMaturityData] = useState<MaturityData[]>([]);
  const [overallMaturity, setOverallMaturity] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMaturityData();
  }, []);

  const loadMaturityData = async () => {
    // Simulated data - in production, fetch from sgso_audits
    const mockData: MaturityData[] = [
      { practiceId: "PG-01", practiceName: "Liderança e Comprometimento", currentLevel: 4, targetLevel: 5, pdcaPhase: "check", trend: "up", lastAuditScore: 85 },
      { practiceId: "PG-02", practiceName: "Política de SGSO", currentLevel: 5, targetLevel: 5, pdcaPhase: "act", trend: "stable", lastAuditScore: 95 },
      { practiceId: "PG-03", practiceName: "Objetivos e Metas", currentLevel: 3, targetLevel: 4, pdcaPhase: "do", trend: "up", lastAuditScore: 70 },
      { practiceId: "PG-04", practiceName: "Organização e Responsabilidades", currentLevel: 4, targetLevel: 5, pdcaPhase: "check", trend: "stable", lastAuditScore: 80 },
      { practiceId: "PG-05", practiceName: "Qualificação e Treinamento", currentLevel: 3, targetLevel: 4, pdcaPhase: "plan", trend: "up", lastAuditScore: 65 },
      { practiceId: "PG-06", practiceName: "Comunicação", currentLevel: 4, targetLevel: 4, pdcaPhase: "act", trend: "stable", lastAuditScore: 82 },
      { practiceId: "PG-07", practiceName: "Documentação", currentLevel: 4, targetLevel: 5, pdcaPhase: "do", trend: "up", lastAuditScore: 78 },
      { practiceId: "PG-08", practiceName: "Gestão de Riscos", currentLevel: 3, targetLevel: 5, pdcaPhase: "plan", trend: "up", lastAuditScore: 60 },
      { practiceId: "PG-09", practiceName: "Integridade Mecânica", currentLevel: 4, targetLevel: 5, pdcaPhase: "check", trend: "stable", lastAuditScore: 85 },
      { practiceId: "PG-10", practiceName: "Segurança de Processo", currentLevel: 4, targetLevel: 5, pdcaPhase: "do", trend: "up", lastAuditScore: 88 },
      { practiceId: "PG-11", practiceName: "Gestão de Mudanças", currentLevel: 3, targetLevel: 4, pdcaPhase: "plan", trend: "up", lastAuditScore: 62 },
      { practiceId: "PG-12", practiceName: "Operações e Manutenção", currentLevel: 4, targetLevel: 5, pdcaPhase: "act", trend: "stable", lastAuditScore: 90 },
      { practiceId: "PG-13", practiceName: "Gestão de Contratadas", currentLevel: 3, targetLevel: 4, pdcaPhase: "check", trend: "up", lastAuditScore: 68 },
      { practiceId: "PG-14", practiceName: "Logística e Transporte", currentLevel: 4, targetLevel: 4, pdcaPhase: "act", trend: "stable", lastAuditScore: 84 },
      { practiceId: "PG-15", practiceName: "Investigação de Incidentes", currentLevel: 4, targetLevel: 5, pdcaPhase: "do", trend: "up", lastAuditScore: 75 },
      { practiceId: "PG-16", practiceName: "Auditorias e Verificações", currentLevel: 5, targetLevel: 5, pdcaPhase: "act", trend: "stable", lastAuditScore: 92 },
    ];

    setMaturityData(mockData);
    setOverallMaturity(Math.round(mockData.reduce((acc, d) => acc + d.currentLevel, 0) / mockData.length * 20));
    setIsLoading(false);
  };

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
    return <div className="text-center py-8">Carregando dados de maturidade...</div>;
  }

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
                const count = maturityData.filter(d => d.pdcaPhase === phase.id).length;
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

      {/* Maturity by Practice */}
      <Card>
        <CardHeader>
          <CardTitle>Maturidade por Prática de Gestão</CardTitle>
          <CardDescription>
            Nível atual, meta e fase PDCA de cada prática
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {maturityData.map((data) => {
              const currentLevel = getMaturityLevel(data.currentLevel);
              const targetLevel = getMaturityLevel(data.targetLevel);
              const pdcaPhase = getPDCAPhase(data.pdcaPhase);
              const PhaseIcon = pdcaPhase.icon;
              
              return (
                <div key={data.practiceId} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="font-mono">{data.practiceId}</Badge>
                      <span className="font-medium">{data.practiceName}</span>
                      {getTrendIcon(data.trend)}
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className={`px-3 py-1 rounded-full ${pdcaPhase.bgColor}`}>
                        <div className="flex items-center gap-1">
                          <PhaseIcon className={`h-3 w-3 ${pdcaPhase.color}`} />
                          <span className={`text-xs font-medium ${pdcaPhase.color}`}>
                            {pdcaPhase.name.split(" ")[0]}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${currentLevel.color}`} />
                        <span className="text-sm">Nível {data.currentLevel}</span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <div className={`w-3 h-3 rounded-full ${targetLevel.color} opacity-50`} />
                        <span className="text-sm text-muted-foreground">Meta {data.targetLevel}</span>
                      </div>
                      
                      <Badge variant={data.lastAuditScore >= 80 ? "default" : data.lastAuditScore >= 60 ? "secondary" : "destructive"}>
                        {data.lastAuditScore}%
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <Progress 
                      value={(data.currentLevel / 5) * 100} 
                      className="h-2"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Maturity Levels Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Níveis de Maturidade</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {MATURITY_LEVELS.map((level) => (
              <div key={level.level} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full ${level.color}`} />
                <div>
                  <span className="font-medium">Nível {level.level}: {level.name}</span>
                  <p className="text-xs text-muted-foreground">{level.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
