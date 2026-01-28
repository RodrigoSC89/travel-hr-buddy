/**
 * Crew Matching Dashboard
 * Intelligent roster building and crew matching visualization
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, Target, CheckCircle, AlertTriangle, Star, Shuffle } from "lucide-react";
import { useCrewMatching } from "@/hooks/ai/useCrewMatching";

interface MatchCandidate {
  id: string;
  name: string;
  position: string;
  score: number;
  certifications: number;
  experience: number;
  availability: number;
  teamFit: number;
}

export const CrewMatchingDashboard: React.FC = () => {
  const { isProcessing } = useCrewMatching();
  const [selectedVessel, setSelectedVessel] = useState<string | null>(null);

  // Demo data
  const matches: MatchCandidate[] = [
    { id: "1", name: "Carlos Silva", position: "Chief Engineer", score: 94, certifications: 98, experience: 92, availability: 100, teamFit: 88 },
    { id: "2", name: "Maria Santos", position: "2nd Officer", score: 89, certifications: 95, experience: 85, availability: 90, teamFit: 86 },
    { id: "3", name: "João Oliveira", position: "Able Seaman", score: 85, certifications: 88, experience: 82, availability: 95, teamFit: 78 },
    { id: "4", name: "Ana Costa", position: "Cook", score: 82, certifications: 80, experience: 88, availability: 85, teamFit: 75 },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-400";
    if (score >= 75) return "text-yellow-400";
    return "text-orange-400";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return { label: "Excelente", variant: "default" as const };
    if (score >= 75) return { label: "Bom", variant: "secondary" as const };
    return { label: "Regular", variant: "outline" as const };
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Candidatos</p>
                <p className="text-2xl font-bold">247</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Target className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Posições Abertas</p>
                <p className="text-2xl font-bold">12</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <CheckCircle className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Match Rate</p>
                <p className="text-2xl font-bold">87%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Star className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Score Médio</p>
                <p className="text-2xl font-bold">85.2</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Candidate Matches */}
        <Card className="lg:col-span-2 bg-card/50 border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shuffle className="w-5 h-5" />
              Melhores Matches
            </CardTitle>
            <Button variant="outline" size="sm" disabled={isProcessing}>
              {isProcessing ? "Processando..." : "Recalcular"}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {matches.map((candidate, index) => (
                <div
                  key={candidate.id}
                  className="p-4 rounded-lg bg-muted/30 border border-border hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold">
                        #{index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{candidate.name}</p>
                        <p className="text-sm text-muted-foreground">{candidate.position}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-2xl font-bold ${getScoreColor(candidate.score)}`}>
                        {candidate.score}
                      </span>
                      <Badge variant={getScoreBadge(candidate.score).variant}>
                        {getScoreBadge(candidate.score).label}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mt-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Certificações</p>
                      <Progress value={candidate.certifications} className="h-2" />
                      <p className="text-xs mt-1">{candidate.certifications}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Experiência</p>
                      <Progress value={candidate.experience} className="h-2" />
                      <p className="text-xs mt-1">{candidate.experience}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Disponibilidade</p>
                      <Progress value={candidate.availability} className="h-2" />
                      <p className="text-xs mt-1">{candidate.availability}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Team Fit</p>
                      <Progress value={candidate.teamFit} className="h-2" />
                      <p className="text-xs mt-1">{candidate.teamFit}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Matching Criteria */}
        <Card className="bg-card/50 border-border">
          <CardHeader>
            <CardTitle className="text-lg">Critérios de Matching</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-muted/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Certificações</span>
                  <span className="text-sm text-primary font-bold">40%</span>
                </div>
                <Progress value={40} className="h-2" />
              </div>

              <div className="p-3 rounded-lg bg-muted/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Experiência</span>
                  <span className="text-sm text-primary font-bold">30%</span>
                </div>
                <Progress value={30} className="h-2" />
              </div>

              <div className="p-3 rounded-lg bg-muted/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Disponibilidade</span>
                  <span className="text-sm text-primary font-bold">20%</span>
                </div>
                <Progress value={20} className="h-2" />
              </div>

              <div className="p-3 rounded-lg bg-muted/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Team Fit</span>
                  <span className="text-sm text-primary font-bold">10%</span>
                </div>
                <Progress value={10} className="h-2" />
              </div>
            </div>

            <div className="mt-6 p-4 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Algoritmo IA</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    O sistema considera histórico de performance, preferências pessoais e dinâmica de equipe para sugerir os melhores matches.
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
