/**
 * Performance Reviews Component
 * Avaliações 360° com metas OKR
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Target,
  Star,
  TrendingUp,
  TrendingDown,
  User,
  Calendar,
  MessageSquare,
  Award,
  BarChart3,
  CheckCircle2,
  Clock
} from "lucide-react";

interface CrewMember {
  id: string;
  name: string;
  rank: string;
  vessel: string;
  avatar?: string;
  overallScore: number;
  reviews: {
    reviewer: string;
    relationship: "superior" | "peer" | "subordinate" | "self";
    score: number;
    date: string;
    feedback?: string;
  }[];
  okrs: {
    objective: string;
    progress: number;
    status: "on-track" | "at-risk" | "behind";
    keyResults: {
      title: string;
      current: number;
      target: number;
    }[];
  }[];
  competencies: {
    name: string;
    score: number;
    trend: "up" | "down" | "stable";
  }[];
}

const mockCrewMember: CrewMember = {
  id: "1",
  name: "Carlos Eduardo Santos",
  rank: "Chief Officer",
  vessel: "MV Atlantic Pioneer",
  overallScore: 4.2,
  reviews: [
    { reviewer: "Cap. João Silva", relationship: "superior", score: 4.5, date: "2025-01-15", feedback: "Excelente desempenho em navegação e liderança da equipe de convés." },
    { reviewer: "Maria Santos", relationship: "peer", score: 4.0, date: "2025-01-18", feedback: "Bom trabalho em equipe, sempre disponível para ajudar." },
    { reviewer: "Pedro Oliveira", relationship: "subordinate", score: 4.3, date: "2025-01-20", feedback: "Ótimo líder, comunica bem e é justo nas decisões." },
    { reviewer: "Auto-avaliação", relationship: "self", score: 4.0, date: "2025-01-22" }
  ],
  okrs: [
    {
      objective: "Melhorar segurança das operações de carga",
      progress: 85,
      status: "on-track",
      keyResults: [
        { title: "Zero incidentes em operações de carga", current: 0, target: 0 },
        { title: "100% dos toolbox talks realizados", current: 45, target: 52 },
        { title: "Treinamento de 100% da equipe", current: 12, target: 15 }
      ]
    },
    {
      objective: "Otimizar consumo de combustível",
      progress: 65,
      status: "at-risk",
      keyResults: [
        { title: "Redução de 5% no consumo", current: 3.2, target: 5 },
        { title: "Implementar voyage optimization", current: 1, target: 1 }
      ]
    }
  ],
  competencies: [
    { name: "Liderança", score: 4.5, trend: "up" },
    { name: "Comunicação", score: 4.2, trend: "stable" },
    { name: "Conhecimento Técnico", score: 4.8, trend: "up" },
    { name: "Trabalho em Equipe", score: 4.0, trend: "stable" },
    { name: "Gestão de Crises", score: 4.3, trend: "up" },
    { name: "Compliance", score: 4.1, trend: "down" }
  ]
};

export function PerformanceReviews() {
  const [member] = useState<CrewMember>(mockCrewMember);

  const getRelationshipBadge = (relationship: string) => {
    switch (relationship) {
      case "superior":
        return <Badge className="bg-purple-500/10 text-purple-500">Superior</Badge>;
      case "peer":
        return <Badge className="bg-blue-500/10 text-blue-500">Par</Badge>;
      case "subordinate":
        return <Badge className="bg-green-500/10 text-green-500">Subordinado</Badge>;
      case "self":
        return <Badge variant="outline">Auto-avaliação</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "on-track":
        return <Badge className="bg-green-500/10 text-green-500">No prazo</Badge>;
      case "at-risk":
        return <Badge className="bg-yellow-500/10 text-yellow-500">Em risco</Badge>;
      case "behind":
        return <Badge variant="destructive">Atrasado</Badge>;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <div className="h-4 w-4 border-t-2 border-muted-foreground" />;
    }
  };

  const averageScore = member.reviews.reduce((a, b) => a + b.score, 0) / member.reviews.length;

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={member.avatar} />
                <AvatarFallback className="text-lg">
                  {member.name.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-bold">{member.name}</h2>
                <p className="text-muted-foreground">{member.rank} - {member.vessel}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2">
                <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                <span className="text-3xl font-bold">{averageScore.toFixed(1)}</span>
                <span className="text-muted-foreground">/5.0</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Baseado em {member.reviews.length} avaliações
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="reviews" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="reviews" className="gap-2">
            <Star className="h-4 w-4" />
            Avaliações 360°
          </TabsTrigger>
          <TabsTrigger value="okrs" className="gap-2">
            <Target className="h-4 w-4" />
            OKRs
          </TabsTrigger>
          <TabsTrigger value="competencies" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Competências
          </TabsTrigger>
        </TabsList>

        {/* Reviews Tab */}
        <TabsContent value="reviews" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {["superior", "peer", "subordinate", "self"].map((type) => {
              const review = member.reviews.find(r => r.relationship === type);
              return (
                <Card key={type}>
                  <CardContent className="pt-6 text-center">
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                      <span className="text-2xl font-bold">{review?.score || "-"}</span>
                    </div>
                    {getRelationshipBadge(type)}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Feedback Detalhado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {member.reviews.filter(r => r.feedback).map((review, i) => (
                <div key={i} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{review.reviewer}</span>
                      {getRelationshipBadge(review.relationship)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-bold">{review.score}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{review.feedback}</p>
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(review.date).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* OKRs Tab */}
        <TabsContent value="okrs" className="space-y-4">
          {member.okrs.map((okr, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    {okr.objective}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(okr.status)}
                    <span className="font-bold">{okr.progress}%</span>
                  </div>
                </div>
                <Progress value={okr.progress} className="h-2" />
              </CardHeader>
              <CardContent className="space-y-3">
                {okr.keyResults.map((kr, j) => (
                  <div key={j} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className={`h-4 w-4 ${kr.current >= kr.target ? "text-green-500" : "text-muted-foreground"}`} />
                      <span className="text-sm">{kr.title}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold">{kr.current}</span>
                      <span className="text-muted-foreground"> / {kr.target}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Competencies Tab */}
        <TabsContent value="competencies">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Radar de Competências</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {member.competencies.map((comp, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-32 text-sm font-medium">{comp.name}</div>
                  <div className="flex-1">
                    <Progress value={comp.score * 20} className="h-3" />
                  </div>
                  <div className="flex items-center gap-2 w-20">
                    <span className="font-bold">{comp.score}</span>
                    {getTrendIcon(comp.trend)}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default PerformanceReviews;
