/**
 * Human Factors & Emotional Intelligence Panel
 * AI-powered crew safety assessment using HFACS methodology
 */
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain, Heart, AlertTriangle, Activity, Users, 
  Zap, Shield, TrendingUp, Clock, RefreshCw,
  CheckCircle2, XCircle, Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logger } from '@/lib/logger';

interface HumanFactorsAssessment {
  risk_score: number;
  risk_level: 'low' | 'moderate' | 'high' | 'critical';
  hfacs_analysis: Array<{
    category: string;
    subcategories: string[];
    contributing_factors: string[];
  }>;
  ei_scores: Record<string, number>;
  fatigue_assessment: {
    level: string;
    indicators: string[];
    recommendations: string[];
  };
  stress_indicators: string[];
  recommendations: {
    immediate: string[];
    short_term: string[];
    long_term: string[];
  };
  training_gaps: string[];
  team_dynamics_assessment?: string;
}

interface HumanFactorsPanelProps {
  vesselId: string;
  vesselName?: string;
  crewMemberId?: string;
  crewMemberName?: string;
}

export function HumanFactorsPanel({ 
  vesselId, 
  vesselName = "Embarcação",
  crewMemberId,
  crewMemberName
}: HumanFactorsPanelProps) {
  const [loading, setLoading] = useState(false);
  const [assessment, setAssessment] = useState<HumanFactorsAssessment | null>(null);
  const [overallEIScore, setOverallEIScore] = useState(0);

  const runAssessment = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('human-factors-assessment', {
        body: {
          vessel_id: vesselId,
          crew_member_id: crewMemberId,
          assessment_type: crewMemberId ? 'individual' : 'team',
          context: {
            fatigue_indicators: {
              hours_worked_last_24h: 10,
              rest_hours_last_24h: 8,
              consecutive_work_days: 14
            }
          }
        }
      });

      if (error) throw error;

      setAssessment(data.assessment);
      setOverallEIScore(data.overall_ei_score);
      toast.success('Avaliação de fatores humanos concluída');
    } catch (error) {
      logger.error('Assessment error:', error);
      toast.error('Erro ao realizar avaliação');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-success/20 text-success border-success/30';
      case 'moderate': return 'bg-warning/20 text-warning border-warning/30';
      case 'high': return 'bg-destructive/20 text-destructive border-destructive/30';
      case 'critical': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getFatigueColor = (level: string) => {
    switch (level) {
      case 'minimal': case 'low': return 'text-success';
      case 'moderate': return 'text-warning';
      case 'high': case 'severe': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const EI_LABELS: Record<string, string> = {
    self_awareness: 'Autoconsciência',
    self_regulation: 'Autorregulação',
    motivation: 'Motivação',
    empathy: 'Empatia',
    social_skills: 'Habilidades Sociais'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-info/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Fatores Humanos & Inteligência Emocional</CardTitle>
                <CardDescription>
                  {crewMemberName 
                    ? `Avaliação individual: ${crewMemberName}` 
                    : `Avaliação de equipe: ${vesselName}`}
                </CardDescription>
              </div>
            </div>
            <Button 
              onClick={runAssessment} 
              disabled={loading}
              className="gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analisando...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Executar Avaliação IA
                </>
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {assessment && (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="overview" className="gap-2">
              <Activity className="h-4 w-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="hfacs" className="gap-2">
              <Shield className="h-4 w-4" />
              HFACS
            </TabsTrigger>
            <TabsTrigger value="emotional" className="gap-2">
              <Heart className="h-4 w-4" />
              Int. Emocional
            </TabsTrigger>
            <TabsTrigger value="fatigue" className="gap-2">
              <Clock className="h-4 w-4" />
              Fadiga
            </TabsTrigger>
            <TabsTrigger value="actions" className="gap-2">
              <Zap className="h-4 w-4" />
              Ações
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Risk Score */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <AlertTriangle className={`h-8 w-8 mb-2 ${
                      assessment.risk_level === 'low' ? 'text-success' :
                      assessment.risk_level === 'moderate' ? 'text-warning' :
                      'text-destructive'
                    }`} />
                    <span className="text-sm text-muted-foreground">Score de Risco</span>
                    <span className="text-3xl font-bold">{assessment.risk_score}</span>
                    <Badge className={`mt-2 ${getRiskColor(assessment.risk_level)}`}>
                      {assessment.risk_level.toUpperCase()}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* EI Score */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <Heart className="h-8 w-8 mb-2 text-info" />
                    <span className="text-sm text-muted-foreground">Int. Emocional</span>
                    <span className="text-3xl font-bold">{overallEIScore}</span>
                    <Progress value={overallEIScore} className="w-full mt-2" />
                  </div>
                </CardContent>
              </Card>

              {/* Fatigue */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <Clock className={`h-8 w-8 mb-2 ${getFatigueColor(assessment.fatigue_assessment.level)}`} />
                    <span className="text-sm text-muted-foreground">Nível de Fadiga</span>
                    <span className={`text-xl font-bold capitalize ${getFatigueColor(assessment.fatigue_assessment.level)}`}>
                      {assessment.fatigue_assessment.level}
                    </span>
                    <span className="text-xs text-muted-foreground mt-1">
                      {assessment.fatigue_assessment.indicators.length} indicadores
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Training Gaps */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <TrendingUp className="h-8 w-8 mb-2 text-accent" />
                    <span className="text-sm text-muted-foreground">Lacunas</span>
                    <span className="text-3xl font-bold">{assessment.training_gaps.length}</span>
                    <span className="text-xs text-muted-foreground mt-1">treinamentos necessários</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Stress Indicators */}
            {assessment.stress_indicators.length > 0 && (
              <Card className="border-warning/30">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-warning" />
                    Indicadores de Estresse Identificados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {assessment.stress_indicators.map((indicator) => (
                      <Badge key={indicator} variant="outline" className="border-warning/30 text-warning">
                        {indicator}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Team Dynamics */}
            {assessment.team_dynamics_assessment && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5 text-info" />
                    Dinâmica de Equipe
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{assessment.team_dynamics_assessment}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* HFACS Tab */}
          <TabsContent value="hfacs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Análise HFACS (Human Factors Analysis and Classification System)
                </CardTitle>
                <CardDescription>
                  Classificação de fatores humanos conforme metodologia FAA/NASA
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {assessment.hfacs_analysis.length > 0 ? (
                  assessment.hfacs_analysis.map((category) => (
                    <div key={category.category} className="p-4 rounded-lg bg-muted/50 space-y-3">
                      <h4 className="font-semibold text-primary">{category.category}</h4>
                      
                      {category.subcategories.length > 0 && (
                        <div>
                          <span className="text-sm text-muted-foreground">Subcategorias:</span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {category.subcategories.map((sub) => (
                              <Badge key={sub} variant="secondary">{sub}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {category.contributing_factors.length > 0 && (
                        <div>
                          <span className="text-sm text-muted-foreground">Fatores Contribuintes:</span>
                          <ul className="list-disc list-inside mt-1 text-sm">
                            {category.contributing_factors.map((factor) => (
                              <li key={factor}>{factor}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Nenhum fator HFACS crítico identificado
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Emotional Intelligence Tab */}
          <TabsContent value="emotional" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-info" />
                  Inteligência Emocional (Modelo Goleman)
                </CardTitle>
                <CardDescription>
                  Score geral: {overallEIScore}/100
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(assessment.ei_scores).map(([key, score]) => (
                  <div key={key} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{EI_LABELS[key] || key}</span>
                      <span className="font-medium">{score}/100</span>
                    </div>
                    <Progress 
                      value={score} 
                      className={`h-2 ${
                        score >= 70 ? '[&>div]:bg-success' :
                        score >= 50 ? '[&>div]:bg-warning' :
                        '[&>div]:bg-destructive'
                      }`}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fatigue Tab */}
          <TabsContent value="fatigue" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className={`h-5 w-5 ${getFatigueColor(assessment.fatigue_assessment.level)}`} />
                  Gestão de Fadiga (STCW Manila Amendments)
                </CardTitle>
                <CardDescription>
                  Nível atual: <span className={`font-semibold capitalize ${getFatigueColor(assessment.fatigue_assessment.level)}`}>
                    {assessment.fatigue_assessment.level}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {assessment.fatigue_assessment.indicators.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Indicadores Identificados:</h4>
                    <div className="flex flex-wrap gap-2">
                      {assessment.fatigue_assessment.indicators.map((indicator) => (
                        <Badge key={indicator} variant="outline" className="border-warning/30">
                          {indicator}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {assessment.fatigue_assessment.recommendations.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Recomendações:</h4>
                    <ul className="space-y-2">
                      {assessment.fatigue_assessment.recommendations.map((rec, idx) => (
                        <li key={`fatigue-rec-${idx}-${rec.slice(0, 15)}`} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Actions Tab */}
          <TabsContent value="actions" className="space-y-4">
            {/* Immediate Actions */}
            {assessment.recommendations.immediate.length > 0 && (
              <Card className="border-destructive/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-5 w-5" />
                    Ações Imediatas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {assessment.recommendations.immediate.map((action, idx) => (
                      <li key={`immed-${idx}-${action.slice(0, 15)}`} className="flex items-start gap-2 text-sm">
                        <XCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                        {action}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Short-term Actions */}
            {assessment.recommendations.short_term.length > 0 && (
              <Card className="border-warning/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-warning">
                    <Clock className="h-5 w-5" />
                    Ações de Curto Prazo (1-4 semanas)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {assessment.recommendations.short_term.map((action, idx) => (
                      <li key={`short-${idx}-${action.slice(0, 15)}`} className="flex items-start gap-2 text-sm">
                        <Zap className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                        {action}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Long-term Actions */}
            {assessment.recommendations.long_term.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-info" />
                    Ações de Longo Prazo (1-6 meses)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {assessment.recommendations.long_term.map((action, idx) => (
                      <li key={`long-${idx}-${action.slice(0, 15)}`} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-info mt-0.5 flex-shrink-0" />
                        {action}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Training Gaps */}
            {assessment.training_gaps.length > 0 && (
              <Card className="border-accent/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-accent" />
                    Lacunas de Treinamento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {assessment.training_gaps.map((gap) => (
                      <Badge key={gap} className="bg-accent/20 text-accent border-accent/30">
                        {gap}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Empty State */}
      {!assessment && !loading && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Brain className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">Avaliação de Fatores Humanos</h3>
            <p className="text-muted-foreground text-center max-w-md mb-4">
              Execute uma avaliação com IA para analisar fatores humanos, inteligência emocional 
              e níveis de fadiga da tripulação utilizando metodologia HFACS.
            </p>
            <Button onClick={runAssessment} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Iniciar Avaliação
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default HumanFactorsPanel;
