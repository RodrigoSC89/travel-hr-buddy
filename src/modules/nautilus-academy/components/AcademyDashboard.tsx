import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  GraduationCap,
  BookOpen,
  Award,
  Users,
  Clock,
  TrendingUp,
  Brain,
  Target,
  CheckCircle2,
  AlertTriangle,
  Play,
  FileText,
  Video,
  Sparkles,
  BarChart3,
  Calendar,
  Star,
} from "lucide-react";

interface Course {
  id: string;
  title: string;
  category: string;
  duration: string;
  enrolled: number;
  completed: number;
  rating: number;
  status: "active" | "draft" | "archived";
  aiGenerated: boolean;
}

interface CrewTraining {
  id: string;
  name: string;
  role: string;
  vessel: string;
  completedCourses: number;
  totalCourses: number;
  certifications: number;
  expiringCerts: number;
  lastActivity: string;
}

const mockCourses: Course[] = [
  { id: "1", title: "STCW - Basic Safety Training", category: "Segurança", duration: "40h", enrolled: 156, completed: 142, rating: 4.8, status: "active", aiGenerated: false },
  { id: "2", title: "DP Operator - Advanced", category: "DP", duration: "80h", enrolled: 45, completed: 38, rating: 4.9, status: "active", aiGenerated: false },
  { id: "3", title: "MARPOL Compliance 2024", category: "Ambiental", duration: "16h", enrolled: 234, completed: 198, rating: 4.6, status: "active", aiGenerated: true },
  { id: "4", title: "Emergency Response Procedures", category: "Segurança", duration: "24h", enrolled: 189, completed: 167, rating: 4.7, status: "active", aiGenerated: false },
  { id: "5", title: "ISM Code Implementation", category: "Compliance", duration: "32h", enrolled: 78, completed: 65, rating: 4.5, status: "active", aiGenerated: true },
];

const mockCrewTraining: CrewTraining[] = [
  { id: "1", name: "Carlos Silva", role: "Comandante", vessel: "OSV Atlantic", completedCourses: 24, totalCourses: 26, certifications: 12, expiringCerts: 2, lastActivity: "2024-01-14" },
  { id: "2", name: "Ana Santos", role: "DPO", vessel: "PSV Brasil", completedCourses: 18, totalCourses: 20, certifications: 8, expiringCerts: 1, lastActivity: "2024-01-15" },
  { id: "3", name: "Roberto Lima", role: "Chefe de Máquinas", vessel: "AHTS Power", completedCourses: 22, totalCourses: 24, certifications: 10, expiringCerts: 0, lastActivity: "2024-01-13" },
  { id: "4", name: "Marina Costa", role: "Oficial de Náutica", vessel: "OSV Atlantic", completedCourses: 15, totalCourses: 22, certifications: 6, expiringCerts: 3, lastActivity: "2024-01-10" },
];

export default function AcademyDashboard() {
  const [aiSuggestions] = useState([
    { type: "gap", message: "15 tripulantes precisam renovar STCW nos próximos 90 dias", priority: "high" },
    { type: "recommendation", message: "Baseado em incidentes recentes, sugerimos treinamento extra em procedimentos de emergência", priority: "medium" },
    { type: "optimization", message: "Módulo de DP pode ser condensado - 85% dos alunos completam em 60h", priority: "low" },
  ]);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tripulantes Ativos</p>
                <p className="text-2xl font-bold">487</p>
                <p className="text-xs text-green-600">↑ 12 este mês</p>
              </div>
              <Users className="h-8 w-8 text-primary opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Conclusão</p>
                <p className="text-2xl font-bold">87.3%</p>
                <p className="text-xs text-green-600">↑ 3.2% vs mês anterior</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Certificações Vencendo</p>
                <p className="text-2xl font-bold">23</p>
                <p className="text-xs text-amber-600">Próximos 90 dias</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-amber-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cursos Ativos</p>
                <p className="text-2xl font-bold">34</p>
                <p className="text-xs text-purple-600">8 gerados por IA</p>
              </div>
              <GraduationCap className="h-8 w-8 text-purple-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights Panel */}
      <Card className="bg-gradient-to-r from-primary/5 to-purple-500/5 border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="h-5 w-5 text-primary" />
            AI Training Insights
            <Badge variant="secondary" className="ml-2">
              <Sparkles className="h-3 w-3 mr-1" />
              Powered by AI
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {aiSuggestions.map((suggestion, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  suggestion.priority === "high"
                    ? "bg-destructive/10 border border-destructive/20"
                    : suggestion.priority === "medium"
                    ? "bg-amber-500/10 border border-amber-500/20"
                    : "bg-muted/50 border border-border"
                }`}
              >
                {suggestion.type === "gap" && <AlertTriangle className="h-5 w-5 text-destructive" />}
                {suggestion.type === "recommendation" && <Target className="h-5 w-5 text-amber-500" />}
                {suggestion.type === "optimization" && <TrendingUp className="h-5 w-5 text-muted-foreground" />}
                <span className="flex-1 text-sm">{suggestion.message}</span>
                <Button size="sm" variant="outline">
                  Ação
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Courses Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Cursos em Destaque
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockCourses.slice(0, 4).map((course) => (
                <div key={course.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="p-2 rounded-lg bg-primary/10">
                    {course.aiGenerated ? (
                      <Sparkles className="h-5 w-5 text-primary" />
                    ) : (
                      <Video className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm truncate">{course.title}</p>
                      {course.aiGenerated && (
                        <Badge variant="outline" className="text-xs">IA</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {course.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {course.enrolled}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        {course.rating}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-600">
                      {Math.round((course.completed / course.enrolled) * 100)}%
                    </p>
                    <p className="text-xs text-muted-foreground">concluído</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              Ver Todos os Cursos
            </Button>
          </CardContent>
        </Card>

        {/* Crew Training Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Status de Treinamento da Tripulação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockCrewTraining.map((crew) => (
                <div key={crew.id} className="p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-sm">{crew.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {crew.role} • {crew.vessel}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {crew.expiringCerts > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {crew.expiringCerts} vencendo
                        </Badge>
                      )}
                      <Badge variant="secondary" className="text-xs">
                        <Award className="h-3 w-3 mr-1" />
                        {crew.certifications}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Progresso</span>
                      <span>{crew.completedCourses}/{crew.totalCourses} cursos</span>
                    </div>
                    <Progress 
                      value={(crew.completedCourses / crew.totalCourses) * 100} 
                      className="h-2"
                    />
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              Gerenciar Tripulação
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* AI Course Generator */}
      <Card className="border-2 border-dashed border-primary/30">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="inline-flex p-4 rounded-full bg-primary/10">
              <Brain className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Gerador de Cursos com IA</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Crie micro-treinamentos personalizados baseados em gaps de auditoria, 
                incidentes ou requisitos regulatórios
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <Button>
                <Sparkles className="h-4 w-4 mr-2" />
                Gerar de Gap de Auditoria
              </Button>
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Gerar de Incidente
              </Button>
              <Button variant="outline">
                <Target className="h-4 w-4 mr-2" />
                Criar Treinamento Custom
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Certification Calendar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Calendário de Certificações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <span className="font-medium">Vencendo em 30 dias</span>
              </div>
              <p className="text-2xl font-bold text-destructive">8</p>
              <p className="text-sm text-muted-foreground">certificações</p>
            </div>
            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-amber-500" />
                <span className="font-medium">Vencendo em 60 dias</span>
              </div>
              <p className="text-2xl font-bold text-amber-600">15</p>
              <p className="text-sm text-muted-foreground">certificações</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 border">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Vencendo em 90 dias</span>
              </div>
              <p className="text-2xl font-bold">23</p>
              <p className="text-sm text-muted-foreground">certificações</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
