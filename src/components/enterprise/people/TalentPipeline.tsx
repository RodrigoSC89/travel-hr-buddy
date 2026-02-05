/**
 * Talent Pipeline Component
 * Pipeline visual de recrutamento com matching IA
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  Briefcase,
  Star,
  Clock,
  MapPin,
  Phone,
  Mail,
  ChevronRight,
  Plus,
  Filter,
  Search,
  Brain,
  CheckCircle2,
  XCircle
} from "lucide-react";

interface Candidate {
  id: string;
  name: string;
  rank: string;
  nationality: string;
  experience: number;
  certifications: string[];
  availability: string;
  matchScore: number;
  status: "new" | "screening" | "interview" | "offer" | "hired" | "rejected";
  appliedFor: string;
  appliedDate: string;
  avatar?: string;
}

const mockCandidates: Candidate[] = [
  {
    id: "1",
    name: "Carlos Eduardo Santos",
    rank: "Chief Officer",
    nationality: "Brasil",
    experience: 12,
    certifications: ["STCW", "GMDSS", "Advanced Firefighting"],
    availability: "Imediata",
    matchScore: 95,
    status: "interview",
    appliedFor: "Chief Officer - MV Atlantic Pioneer",
    appliedDate: "2025-01-28"
  },
  {
    id: "2",
    name: "Maria Fernanda Silva",
    rank: "2nd Engineer",
    nationality: "Portugal",
    experience: 8,
    certifications: ["STCW", "Engine Room Resource Management"],
    availability: "30 dias",
    matchScore: 88,
    status: "screening",
    appliedFor: "2nd Engineer - MV Pacific Voyager",
    appliedDate: "2025-02-01"
  },
  {
    id: "3",
    name: "João Pedro Oliveira",
    rank: "AB Seaman",
    nationality: "Brasil",
    experience: 5,
    certifications: ["STCW", "Personal Survival Techniques"],
    availability: "Imediata",
    matchScore: 82,
    status: "new",
    appliedFor: "AB Seaman - MV Nordic Star",
    appliedDate: "2025-02-03"
  },
  {
    id: "4",
    name: "Ana Carolina Mendes",
    rank: "Chief Cook",
    nationality: "Brasil",
    experience: 10,
    certifications: ["Ship's Cook Certificate", "Food Safety"],
    availability: "15 dias",
    matchScore: 91,
    status: "offer",
    appliedFor: "Chief Cook - MV Atlantic Pioneer",
    appliedDate: "2025-01-20"
  }
];

const pipelineStages = [
  { id: "new", label: "Novos", color: "bg-blue-500" },
  { id: "screening", label: "Triagem", color: "bg-yellow-500" },
  { id: "interview", label: "Entrevista", color: "bg-purple-500" },
  { id: "offer", label: "Proposta", color: "bg-orange-500" },
  { id: "hired", label: "Contratado", color: "bg-green-500" }
];

export function TalentPipeline() {
  const [candidates, setCandidates] = useState<Candidate[]>(mockCandidates);

  const getStageCount = (stage: string) => 
    candidates.filter(c => c.status === stage).length;

  const moveCandidate = (candidateId: string, newStatus: Candidate["status"]) => {
    setCandidates(prev => prev.map(c => 
      c.id === candidateId ? { ...c, status: newStatus } : c
    ));
  };

  const getMatchColor = (score: number) => {
    if (score >= 90) return "text-green-500";
    if (score >= 75) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {pipelineStages.map((stage) => (
          <Card key={stage.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stage.label}</p>
                  <p className="text-3xl font-bold">{getStageCount(stage.id)}</p>
                </div>
                <div className={`w-3 h-12 rounded-full ${stage.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pipeline Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {pipelineStages.map((stage) => (
          <div key={stage.id} className="flex-shrink-0 w-80">
            <div className={`h-1 ${stage.color} rounded-t-lg`} />
            <Card className="rounded-t-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span>{stage.label}</span>
                  <Badge variant="secondary">{getStageCount(stage.id)}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
                {candidates
                  .filter(c => c.status === stage.id)
                  .map((candidate) => (
                    <Card key={candidate.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={candidate.avatar} />
                              <AvatarFallback>
                                {candidate.name.split(" ").map(n => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{candidate.name}</p>
                              <p className="text-xs text-muted-foreground">{candidate.rank}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Brain className="h-4 w-4 text-primary" />
                            <span className={`font-bold text-sm ${getMatchColor(candidate.matchScore)}`}>
                              {candidate.matchScore}%
                            </span>
                          </div>
                        </div>

                        <div className="space-y-1 text-xs text-muted-foreground">
                          <p className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {candidate.nationality}
                          </p>
                          <p className="flex items-center gap-1">
                            <Briefcase className="h-3 w-3" />
                            {candidate.experience} anos de experiência
                          </p>
                          <p className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Disponível: {candidate.availability}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {candidate.certifications.slice(0, 2).map((cert, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {cert}
                            </Badge>
                          ))}
                          {candidate.certifications.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{candidate.certifications.length - 2}
                            </Badge>
                          )}
                        </div>

                        <div className="flex gap-2 pt-2 border-t">
                          {stage.id !== "hired" && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="flex-1 h-8"
                              onClick={() => {
                                const nextStage = pipelineStages[
                                  pipelineStages.findIndex(s => s.id === stage.id) + 1
                                ];
                                if (nextStage) {
                                  moveCandidate(candidate.id, nextStage.id as Candidate["status"]);
                                }
                              }}
                            >
                              <ChevronRight className="h-4 w-4" />
                              Avançar
                            </Button>
                          )}
                          {stage.id === "offer" && (
                            <Button 
                              size="sm" 
                              className="flex-1 h-8"
                              onClick={() => moveCandidate(candidate.id, "hired")}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Contratar
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                {getStageCount(stage.id) === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhum candidato</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TalentPipeline;
