/**
import { useState } from "react";;
 * Career Development - Plano de Carreira e Desenvolvimento
 */

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  Target,
  GraduationCap,
  Award,
  Star,
  ChevronRight,
  Users,
  Briefcase,
  BookOpen,
  Sparkles,
  ArrowUp,
  CheckCircle,
  Clock,
  Zap
} from "lucide-react";
import { motion } from "framer-motion";

interface CareerPath {
  id: string;
  titulo: string;
  nivelAtual: number;
  nivelMax: number;
  progresso: number;
  proximoPasso: string;
  competenciasNecessarias: string[];
  tempoEstimado: string;
}

interface Skill {
  nome: string;
  nivel: number;
  categoria: string;
}

interface Mentoria {
  mentor: string;
  cargo: string;
  proximaSessao: string;
  topico: string;
}

const CareerDevelopment: React.FC = () => {
  const [activeTab, setActiveTab] = useState("trilha");

  const careerPath: CareerPath = {
    id: "1",
    titulo: "Trilha de Engenharia",
    nivelAtual: 3,
    nivelMax: 6,
    progresso: 68,
    proximoPasso: "Engenheiro Sênior",
    competenciasNecessarias: ["Gestão de Projetos", "Liderança Técnica", "Mentoria"],
    tempoEstimado: "12-18 meses"
  };

  const careerLevels = [
    { nivel: 1, titulo: "Trainee", status: "completed", ano: "2020" },
    { nivel: 2, titulo: "Engenheiro Júnior", status: "completed", ano: "2021" },
    { nivel: 3, titulo: "Engenheiro Pleno", status: "current", ano: "2023" },
    { nivel: 4, titulo: "Engenheiro Sênior", status: "next", ano: "" },
    { nivel: 5, titulo: "Especialista", status: "future", ano: "" },
    { nivel: 6, titulo: "Principal Engineer", status: "future", ano: "" }
  ];

  const skills: Skill[] = [
    { nome: "Gestão de Processos", nivel: 85, categoria: "Técnica" },
    { nome: "Lean Manufacturing", nivel: 90, categoria: "Técnica" },
    { nome: "Python", nivel: 70, categoria: "Técnica" },
    { nome: "Comunicação", nivel: 80, categoria: "Soft Skill" },
    { nome: "Liderança", nivel: 65, categoria: "Soft Skill" },
    { nome: "Gestão de Projetos", nivel: 55, categoria: "Gestão" },
    { nome: "Power BI", nivel: 75, categoria: "Técnica" },
    { nome: "Excel Avançado", nivel: 95, categoria: "Técnica" }
  ];

  const trainingRecommendations = [
    {
      titulo: "Gestão de Projetos Avançada",
      provedor: "PMI",
      duracao: "40h",
      match: 95,
      tipo: "Certificação"
    },
    {
      titulo: "Liderança de Equipes Técnicas",
      provedor: "Nautilus Academy",
      duracao: "16h",
      match: 88,
      tipo: "Curso"
    },
    {
      titulo: "Scrum Master",
      provedor: "Scrum.org",
      duracao: "20h",
      match: 82,
      tipo: "Certificação"
    },
    {
      titulo: "Comunicação Executiva",
      provedor: "Dale Carnegie",
      duracao: "12h",
      match: 78,
      tipo: "Workshop"
    }
  ];

  const mentoria: Mentoria = {
    mentor: "Roberto Mendes",
    cargo: "Diretor de Operações",
    proximaSessao: "12/12/2025 às 14:00",
    topico: "Transição para cargo de liderança"
  };

  const successorCandidates = [
    { nome: "Ana Paula", cargo: "Engenheira Júnior", readiness: 75, departamento: "Operações" },
    { nome: "Lucas Silva", cargo: "Engenheiro Trainee", readiness: 60, departamento: "Operações" },
    { nome: "Mariana Costa", cargo: "Técnica Sênior", readiness: 85, departamento: "Manutenção" }
  ];

  const getSkillColor = (nivel: number) => {
    if (nivel >= 80) return "bg-green-500";
    if (nivel >= 60) return "bg-blue-500";
    if (nivel >= 40) return "bg-yellow-500";
    return "bg-orange-500";
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">Nível 3</p>
                <p className="text-sm text-muted-foreground">Engenheiro Pleno</p>
              </div>
              <Award className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">68%</p>
                <p className="text-sm text-muted-foreground">Progresso Carreira</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">12</p>
                <p className="text-sm text-muted-foreground">Competências</p>
              </div>
              <Star className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">5</p>
                <p className="text-sm text-muted-foreground">Certificações</p>
              </div>
              <GraduationCap className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-card/50 border p-1">
          <TabsTrigger value="trilha" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            Trilha de Carreira
          </TabsTrigger>
          <TabsTrigger value="competencias" className="gap-2">
            <Star className="w-4 h-4" />
            Competências
          </TabsTrigger>
          <TabsTrigger value="treinamentos" className="gap-2">
            <GraduationCap className="w-4 h-4" />
            Treinamentos
          </TabsTrigger>
          <TabsTrigger value="mentoria" className="gap-2">
            <Users className="w-4 h-4" />
            Mentoria
          </TabsTrigger>
          <TabsTrigger value="sucessao" className="gap-2">
            <Briefcase className="w-4 h-4" />
            Sucessão
          </TabsTrigger>
        </TabsList>

        {/* Trilha de Carreira Tab */}
        <TabsContent value="trilha" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                {careerPath.titulo}
              </CardTitle>
              <CardDescription>
                Seu progresso na trilha de desenvolvimento profissional
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {/* Career Timeline */}
                <div className="flex items-center justify-between mb-8">
                  {careerLevels.map((level, index) => (
                    <div key={level.nivel} className="flex flex-col items-center relative">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className={`w-12 h-12 rounded-full flex items-center justify-center z-10 ${
                          level.status === "completed" ? "bg-green-500 text-white" :
                            level.status === "current" ? "bg-primary text-primary-foreground ring-4 ring-primary/30" :
                              level.status === "next" ? "bg-blue-500/20 border-2 border-blue-500 text-blue-500" :
                                "bg-muted text-muted-foreground"
                        }`}
                      >
                        {level.status === "completed" ? (
                          <CheckCircle className="w-6 h-6" />
                        ) : (
                          <span className="font-bold">{level.nivel}</span>
                        )}
                      </motion.div>
                      <p className={`text-xs mt-2 text-center max-w-16 ${
                        level.status === "current" ? "font-bold text-primary" : "text-muted-foreground"
                      }`}>
                        {level.titulo}
                      </p>
                      {level.ano && (
                        <p className="text-xs text-muted-foreground">{level.ano}</p>
                      )}
                      {index < careerLevels.length - 1 && (
                        <div className={`absolute top-6 left-12 w-full h-0.5 ${
                          level.status === "completed" ? "bg-green-500" : "bg-muted"
                        }`} style={{ width: "calc(100% - 48px)" }} />
                      )}
                    </div>
                  ))}
                </div>

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progresso Geral</span>
                    <span className="font-medium">{careerPath.progresso}%</span>
                  </div>
                  <Progress value={careerPath.progresso} className="h-3" />
                </div>

                {/* Next Step */}
                <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <ArrowUp className="w-4 h-4 text-blue-500" />
                    <span className="font-medium">Próximo Passo: {careerPath.proximoPasso}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Tempo estimado: {careerPath.tempoEstimado}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {careerPath.competenciasNecessarias.map((comp, idx) => (
                      <Badge key={idx} variant="outline">{comp}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Competências Tab */}
        <TabsContent value="competencias" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mapa de Competências</CardTitle>
              <CardDescription>Suas habilidades e níveis de proficiência</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {skills.map((skill, index) => (
                  <motion.div
                    key={skill.nome}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="font-medium text-sm">{skill.nome}</span>
                        <Badge variant="outline" className="ml-2 text-xs">{skill.categoria}</Badge>
                      </div>
                      <span className="font-bold text-sm">{skill.nivel}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${getSkillColor(skill.nivel)}`}
                        style={{ width: `${skill.nivel}%` }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Gap Analysis */}
          <Card className="bg-gradient-to-r from-orange-500/5 to-red-500/5 border-orange-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-orange-500" />
                Gaps Identificados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {skills.filter(s => s.nivel < 70).map((skill) => (
                  <div key={skill.nome} className="flex items-center justify-between p-3 bg-card rounded-lg border">
                    <div>
                      <span className="font-medium">{skill.nome}</span>
                      <p className="text-xs text-muted-foreground">
                        Necessário para próxima promoção: 80%
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-orange-500 font-bold">{skill.nivel}%</span>
                      <p className="text-xs text-muted-foreground">-{80 - skill.nivel}% gap</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Treinamentos Tab */}
        <TabsContent value="treinamentos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Recomendações Personalizadas (IA)
              </CardTitle>
              <CardDescription>
                Treinamentos sugeridos baseados no seu plano de carreira e gaps
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {trainingRecommendations.map((training, index) => (
                  <motion.div
                    key={training.titulo}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border hover:border-primary/50 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        training.match >= 90 ? "bg-green-500/20 text-green-500" :
                          training.match >= 80 ? "bg-blue-500/20 text-blue-500" :
                            "bg-yellow-500/20 text-yellow-500"
                      }`}>
                        <Zap className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-medium">{training.titulo}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{training.provedor}</span>
                          <span>•</span>
                          <span>{training.duracao}</span>
                          <Badge variant="outline" className="text-xs">{training.tipo}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={
                        training.match >= 90 ? "bg-green-500" :
                          training.match >= 80 ? "bg-blue-500" :
                            "bg-yellow-500"
                      }>
                        {training.match}% match
                      </Badge>
                      <Button variant="ghost" size="sm" className="mt-1">
                        Inscrever <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mentoria Tab */}
        <TabsContent value="mentoria" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Seu Mentor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="w-16 h-16">
                    <AvatarFallback className="text-lg bg-primary/10 text-primary">RM</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg">{mentoria.mentor}</h3>
                    <p className="text-muted-foreground">{mentoria.cargo}</p>
                  </div>
                </div>
                <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>Próxima sessão: {mentoria.proximaSessao}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <BookOpen className="w-4 h-4 text-muted-foreground" />
                    <span>Tópico: {mentoria.topico}</span>
                  </div>
                </div>
                <Button className="w-full mt-4">Agendar Sessão</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Histórico de Mentoria</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[1, 2, 3].map((_, idx) => (
                  <div key={idx} className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-sm">Sessão {3 - idx}</span>
                      <Badge variant="outline" className="text-xs">
                        {new Date(Date.now() - idx * 14 * 24 * 60 * 60 * 1000).toLocaleDateString("pt-BR")}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Discussão sobre desenvolvimento de liderança e gestão de conflitos.
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Sucessão Tab */}
        <TabsContent value="sucessao" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Plano de Sucessão</CardTitle>
              <CardDescription>
                Candidatos identificados para sua posição futura
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {successorCandidates.map((candidate, index) => (
                  <motion.div
                    key={candidate.nome}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {candidate.nome.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{candidate.nome}</p>
                        <p className="text-sm text-muted-foreground">
                          {candidate.cargo} • {candidate.departamento}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm text-muted-foreground">Readiness</span>
                        <Badge className={
                          candidate.readiness >= 80 ? "bg-green-500" :
                            candidate.readiness >= 60 ? "bg-blue-500" :
                              "bg-yellow-500"
                        }>
                          {candidate.readiness}%
                        </Badge>
                      </div>
                      <Progress value={candidate.readiness} className="w-24 h-2" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CareerDevelopment;
