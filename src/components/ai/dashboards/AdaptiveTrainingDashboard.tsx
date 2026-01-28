/**
 * Adaptive Training Dashboard
 * AI-powered personalized training visualization
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { GraduationCap, Brain, TrendingUp, Clock, BookOpen, Award, Target, Zap } from "lucide-react";

interface TrainingModule {
  id: string;
  title: string;
  type: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  progress: number;
  aiRecommended: boolean;
  estimatedTime: string;
  competencyGap: number;
}

export const AdaptiveTrainingDashboard: React.FC = () => {
  const modules: TrainingModule[] = [
    { id: "1", title: "STCW Atualização 2024", type: "Certificação", difficulty: "intermediate", progress: 45, aiRecommended: true, estimatedTime: "4h", competencyGap: 35 },
    { id: "2", title: "Liderança Marítima", type: "Soft Skills", difficulty: "advanced", progress: 20, aiRecommended: true, estimatedTime: "6h", competencyGap: 28 },
    { id: "3", title: "Segurança em Espaços Confinados", type: "Segurança", difficulty: "intermediate", progress: 75, aiRecommended: false, estimatedTime: "2h", competencyGap: 15 },
    { id: "4", title: "ECDIS Avançado", type: "Navegação", difficulty: "advanced", progress: 0, aiRecommended: true, estimatedTime: "8h", competencyGap: 42 },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-500/20 text-green-400";
      case "intermediate": return "bg-yellow-500/20 text-yellow-400";
      case "advanced": return "bg-red-500/20 text-red-400";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <GraduationCap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cursos Ativos</p>
                <p className="text-2xl font-bold">12</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Award className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Certificações</p>
                <p className="text-2xl font-bold">8</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Brain className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gaps Identificados</p>
                <p className="text-2xl font-bold">5</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <TrendingUp className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Progresso Geral</p>
                <p className="text-2xl font-bold">67%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recommended Modules */}
        <Card className="lg:col-span-2 bg-card/50 border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Módulos Recomendados pela IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {modules.map((module) => (
                <div
                  key={module.id}
                  className={`p-4 rounded-lg border transition-colors ${
                    module.aiRecommended 
                      ? "bg-primary/5 border-primary/30 hover:border-primary/50" 
                      : "bg-muted/30 border-border hover:border-primary/30"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{module.title}</h4>
                        {module.aiRecommended && (
                          <Badge variant="default" className="text-xs">
                            <Brain className="w-3 h-3 mr-1" />
                            IA
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          {module.type}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {module.estimatedTime}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${getDifficultyColor(module.difficulty)}`}>
                          {module.difficulty}
                        </span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      {module.progress > 0 ? "Continuar" : "Iniciar"}
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Progresso</span>
                        <span>{module.progress}%</span>
                      </div>
                      <Progress value={module.progress} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Gap de Competência</span>
                        <span className="text-orange-400">{module.competencyGap}%</span>
                      </div>
                      <Progress value={module.competencyGap} className="h-2 bg-orange-500/20" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Competency Profile */}
        <Card className="bg-card/50 border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Perfil de Competências
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Navegação", level: 85 },
                { name: "Segurança", level: 78 },
                { name: "Liderança", level: 62 },
                { name: "Técnico", level: 90 },
                { name: "Comunicação", level: 70 },
                { name: "Compliance", level: 88 },
              ].map((competency) => (
                <div key={competency.name}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>{competency.name}</span>
                    <span className="font-medium">{competency.level}%</span>
                  </div>
                  <Progress value={competency.level} className="h-2" />
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-start gap-2">
                <Brain className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Análise IA</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Baseado no seu perfil, recomendamos focar em Liderança e Comunicação para maximizar seu potencial de carreira.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
