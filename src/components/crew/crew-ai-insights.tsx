import { useEffect, useState } from "react";;;
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCrewAI, type CrewMember } from "@/hooks/use-crew-ai";
import { Brain, Users, RefreshCw, Award, TrendingUp, AlertTriangle, Loader2, CheckCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

interface CrewAIInsightsProps {
  crew: CrewMember[];
}

export const CrewAIInsights = ({ crew }: CrewAIInsightsProps) => {
  const {
    isAnalyzing,
    generateCrewRecommendations,
    optimizeRotations,
    analyzeSkillGaps,
    generateCrewInsights,
  } = useCrewAI();

  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [rotations, setRotations] = useState<any[]>([]);
  const [skillGaps, setSkillGaps] = useState<any[]>([]);
  const [insights, setInsights] = useState<any>(null);

  const handleGenerateRecommendations = async () => {
    const recs = await generateCrewRecommendations(crew);
    setRecommendations(recs);
  };

  const handleOptimizeRotations = async () => {
    const opts = await optimizeRotations(crew);
    setRotations(opts);
  };

  const handleAnalyzeSkills = async () => {
    const gaps = await analyzeSkillGaps(crew);
    setSkillGaps(gaps);
  };

  const handleGenerateInsights = async () => {
    const ins = await generateCrewInsights(crew);
    setInsights(ins);
  };

  useEffect(() => {
    if (crew.length > 0) {
      handleGenerateInsights();
    }
    // PATCH 549: Remove handleGenerateInsights from deps to prevent loop
  }, [crew.length]);

  const priorityColors = {
    low: "bg-primary",
    medium: "bg-warning",
    high: "bg-orange-500/80",
    critical: "bg-destructive",
  };

  const typeIcons = {
    training: Award,
    rotation: RefreshCw,
    promotion: TrendingUp,
    certificate: CheckCircle,
    performance: Users,
  };

  return (
    <div className="space-y-6">
      {/* AI Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <CardTitle>Análise Inteligente de Tripulação</CardTitle>
            </div>
            {isAnalyzing && (
              <Badge variant="outline" className="gap-2">
                <Loader2 className="h-3 w-3 animate-spin" />
                Analisando...
              </Badge>
            )}
          </div>
          <CardDescription>
            Insights baseados em IA para otimizar gestão de tripulação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button
              onClick={handleGenerateRecommendations}
              disabled={isAnalyzing || crew.length === 0}
              variant="outline"
              className="h-auto py-4 flex-col gap-2"
            >
              <Users className="h-5 w-5" />
              <span className="text-sm">Recomendações</span>
            </Button>

            <Button
              onClick={handleOptimizeRotations}
              disabled={isAnalyzing || crew.length === 0}
              variant="outline"
              className="h-auto py-4 flex-col gap-2"
            >
              <RefreshCw className="h-5 w-5" />
              <span className="text-sm">Otimizar Rotações</span>
            </Button>

            <Button
              onClick={handleAnalyzeSkills}
              disabled={isAnalyzing || crew.length === 0}
              variant="outline"
              className="h-auto py-4 flex-col gap-2"
            >
              <Award className="h-5 w-5" />
              <span className="text-sm">Análise de Skills</span>
            </Button>

            <Button
              onClick={handleGenerateInsights}
              disabled={isAnalyzing || crew.length === 0}
              variant="outline"
              className="h-auto py-4 flex-col gap-2"
            >
              <TrendingUp className="h-5 w-5" />
              <span className="text-sm">Insights Gerais</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Tabs */}
      <Tabs defaultValue="insights" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="recommendations">Recomendações</TabsTrigger>
          <TabsTrigger value="rotations">Rotações</TabsTrigger>
          <TabsTrigger value="skills">Competências</TabsTrigger>
        </TabsList>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          {insights ? (
            <Card>
              <CardHeader>
                <CardTitle>Visão Geral da Tripulação</CardTitle>
                <CardDescription>{insights.summary}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium flex items-center gap-2 mb-3">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Pontos Fortes
                  </h4>
                  <div className="space-y-2">
                    {insights.strengths?.map((strength: string, index: number) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-success/10 rounded-lg">
                        <span className="text-sm">{strength}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {insights.concerns?.length > 0 && (
                  <div>
                    <h4 className="font-medium flex items-center gap-2 mb-3">
                      <AlertTriangle className="h-4 w-4 text-warning" />
                      Pontos de Atenção
                    </h4>
                    <div className="space-y-2">
                      {insights.concerns.map((concern: string, index: number) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-warning/10 rounded-lg">
                          <span className="text-sm">{concern}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="font-medium flex items-center gap-2 mb-3">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Recomendações Estratégicas
                  </h4>
                  <div className="space-y-2">
                    {insights.recommendations?.map((rec: string, index: number) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-accent/50 rounded-lg">
                        <span className="text-sm">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Clique em "Insights Gerais" para gerar análise
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          {recommendations.length > 0 ? (
            recommendations.map((rec) => {
              const Icon = typeIcons[rec.type as keyof typeof typeIcons];
              return (
                <Card key={rec.crewId}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-5 w-5" />
                        <CardTitle className="text-lg">{rec.crewName}</CardTitle>
                      </div>
                      <Badge className={priorityColors[rec.priority as keyof typeof priorityColors]}>
                        {rec.priority.toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-1">{rec.title}</h4>
                      <p className="text-sm text-muted-foreground">{rec.description}</p>
                    </div>

                    <div className="p-3 bg-accent/50 rounded-lg">
                      <span className="text-sm font-medium">Ação Requerida:</span>
                      <p className="text-sm mt-1">{rec.actionRequired}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {rec.deadline && (
                        <div>
                          <span className="text-muted-foreground">Prazo:</span>
                          <p className="font-medium">{new Date(rec.deadline).toLocaleDateString()}</p>
                        </div>
                      )}
                      <div>
                        <span className="text-muted-foreground">Impacto Estimado:</span>
                        <p className="font-medium">{rec.estimatedImpact}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Clique em "Recomendações" para gerar análises individuais
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Rotations Tab */}
        <TabsContent value="rotations" className="space-y-4">
          {rotations.length > 0 ? (
            rotations.map((rot) => (
              <Card key={rot.crewId}>
                <CardHeader>
                  <CardTitle className="text-lg">{rot.crewName}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Embarcação Atual:</span>
                      <p className="font-medium">{rot.currentVessel}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Embarcação Sugerida:</span>
                      <p className="font-medium text-success">{rot.suggestedVessel}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Data de Rotação:</span>
                      <p className="font-medium">{new Date(rot.rotationDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Custo Estimado:</span>
                      <p className="font-medium">R$ {rot.estimatedCost.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="p-3 bg-accent/50 rounded-lg">
                    <span className="text-sm font-medium">Justificativa:</span>
                    <p className="text-sm mt-1">{rot.reason}</p>
                  </div>

                  <div>
                    <span className="text-sm font-medium">Benefícios:</span>
                    <ul className="list-disc list-inside text-sm mt-2 space-y-1 text-muted-foreground">
                      {rot.benefits.map((benefit: string, idx: number) => (
                        <li key={idx}>{benefit}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Clique em "Otimizar Rotações" para gerar sugestões
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Skills Tab */}
        <TabsContent value="skills" className="space-y-4">
          {skillGaps.length > 0 ? (
            skillGaps.map((gap, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{gap.position}</CardTitle>
                    <Badge className={priorityColors[gap.priority as keyof typeof priorityColors]}>
                      {gap.priority.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-muted-foreground">Tripulantes Disponíveis:</span>
                      <p className="text-2xl font-bold">{gap.availableCrewCount}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Lacuna de Competências:</span>
                      <p className="text-2xl font-bold">{gap.gapPercentage.toFixed(0)}%</p>
                    </div>
                  </div>

                  <div>
                    <span className="text-sm text-muted-foreground">Progresso de Preenchimento:</span>
                    <Progress value={100 - gap.gapPercentage} className="mt-2" />
                  </div>

                  <div>
                    <span className="text-sm font-medium">Habilidades Requeridas:</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {gap.requiredSkills.map((skill: string, idx: number) => (
                        <Badge key={idx} variant="secondary">{skill}</Badge>
                      ))}
                    </div>
                  </div>

                  {gap.criticalGaps.length > 0 && (
                    <div className="p-3 bg-destructive/10 rounded-lg">
                      <span className="text-sm font-medium flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                        Lacunas Críticas
                      </span>
                      <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                        {gap.criticalGaps.map((crit: string, idx: number) => (
                          <li key={idx}>{crit}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div>
                    <span className="text-sm font-medium">Treinamentos Recomendados:</span>
                    <ul className="list-disc list-inside text-sm mt-2 space-y-1 text-muted-foreground">
                      {gap.trainingRecommendations.map((rec: string, idx: number) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Clique em "Análise de Skills" para avaliar competências
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
