/**
import { useState, useCallback } from "react";;
 * Training Panel - Gestão de Treinamentos de Segurança
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  GraduationCap, 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Users,
  Calendar,
  Award,
  Brain,
  TrendingUp
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { SafetyTraining, CrewTrainingDashboard } from "../types";

interface TrainingPanelProps {
  trainings: SafetyTraining[];
  crewDashboards: CrewTrainingDashboard[];
  loading?: boolean;
  onAssignTraining?: (crewId: string, trainingType: string) => Promise<void>;
}

export const TrainingPanel: React.FC<TrainingPanelProps> = ({ 
  trainings, 
  crewDashboards,
  loading,
  onAssignTraining 
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("overview");

  const pendingTrainings = trainings.filter(t => t.status === "pending");
  const expiredTrainings = trainings.filter(t => t.status === "expired");
  const completedTrainings = trainings.filter(t => t.status === "completed");
  const aiRecommended = trainings.filter(t => t.ai_recommended);

  const filteredTrainings = trainings.filter(t =>
    t.crew_member_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.course_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const overallCompliance = crewDashboards.length > 0
    ? Math.round(crewDashboards.reduce((acc, c) => acc + c.overallCompliance, 0) / crewDashboards.length)
    : 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
    case "completed":
      return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Concluído</Badge>;
    case "in_progress":
      return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Em Andamento</Badge>;
    case "pending":
      return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pendente</Badge>;
    case "expired":
      return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Expirado</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
    case "critical":
      return <Badge className="bg-red-500 text-white">Crítico</Badge>;
    case "high":
      return <Badge className="bg-orange-500 text-white">Alta</Badge>;
    case "medium":
      return <Badge className="bg-yellow-500 text-black">Média</Badge>;
    default:
      return <Badge variant="outline">Baixa</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Compliance Geral</p>
                <p className="text-2xl font-bold">{overallCompliance}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold">{pendingTrainings.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Expirados</p>
                <p className="text-2xl font-bold">{expiredTrainings.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Concluídos</p>
                <p className="text-2xl font-bold">{completedTrainings.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Brain className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">IA Recomenda</p>
                <p className="text-2xl font-bold">{aiRecommended.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por tripulante ou curso..."
          value={searchTerm}
          onChange={handleChange}
          className="pl-10"
        />
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="crew">Por Tripulante</TabsTrigger>
          <TabsTrigger value="ai">Recomendações IA</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Todos os Treinamentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Carregando...</div>
              ) : filteredTrainings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum treinamento encontrado
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTrainings.map((training) => (
                    <div
                      key={training.id}
                      className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{training.course_name}</h4>
                            {training.ai_recommended && (
                              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                                <Brain className="h-3 w-3 mr-1" />
                                IA
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {training.crew_member_name} • {training.training_type}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getPriorityBadge(training.priority)}
                          {getStatusBadge(training.status)}
                        </div>
                      </div>
                      {training.expiry_date && (
                        <div className="mt-2 flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className={
                            differenceInDays(new Date(training.expiry_date), new Date()) < 30
                              ? "text-red-400"
                              : "text-muted-foreground"
                          }>
                            Vence em: {format(new Date(training.expiry_date), "dd/MM/yyyy", { locale: ptBR })}
                          </span>
                        </div>
                      )}
                      {training.score && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span>Nota</span>
                            <span>{training.score}%</span>
                          </div>
                          <Progress value={training.score} className="h-2" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="crew" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {crewDashboards.map((crew) => (
              <Card key={crew.crewMemberId}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{crew.crewMemberName}</CardTitle>
                      <p className="text-sm text-muted-foreground">{crew.role} • {crew.vessel}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{crew.overallCompliance}%</p>
                      <p className="text-xs text-muted-foreground">Compliance</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Progress value={crew.overallCompliance} className="h-2 mb-4" />
                  <div className="grid grid-cols-4 gap-2 text-center text-sm">
                    <div>
                      <p className="font-semibold">{crew.totalTrainings}</p>
                      <p className="text-xs text-muted-foreground">Total</p>
                    </div>
                    <div>
                      <p className="font-semibold text-green-400">{crew.completedTrainings}</p>
                      <p className="text-xs text-muted-foreground">Concluídos</p>
                    </div>
                    <div>
                      <p className="font-semibold text-yellow-400">{crew.pendingTrainings}</p>
                      <p className="text-xs text-muted-foreground">Pendentes</p>
                    </div>
                    <div>
                      <p className="font-semibold text-red-400">{crew.expiredCertifications}</p>
                      <p className="text-xs text-muted-foreground">Expirados</p>
                    </div>
                  </div>
                  {crew.upcomingExpirations > 0 && (
                    <div className="mt-3 p-2 rounded bg-yellow-500/10 border border-yellow-500/20">
                      <p className="text-sm text-yellow-400">
                        <AlertTriangle className="h-4 w-4 inline mr-1" />
                        {crew.upcomingExpirations} certificações vencem em 30 dias
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="ai" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-400" />
                Recomendações da IA
              </CardTitle>
            </CardHeader>
            <CardContent>
              {aiRecommended.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Brain className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhuma recomendação de IA no momento</p>
                  <p className="text-sm">A IA analisa padrões de incidentes e compliance para sugerir treinamentos</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {aiRecommended.map((training) => (
                    <div
                      key={training.id}
                      className="p-4 rounded-lg border border-purple-500/20 bg-purple-500/5"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h4 className="font-medium">{training.course_name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Recomendado para: {training.crew_member_name}
                          </p>
                          <p className="text-xs text-purple-400">
                            Baseado em análise de padrões de incidentes e gaps de competência
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {getPriorityBadge(training.priority)}
                          <Button size="sm" variant="outline">
                            <Award className="h-4 w-4 mr-1" />
                            Atribuir
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
