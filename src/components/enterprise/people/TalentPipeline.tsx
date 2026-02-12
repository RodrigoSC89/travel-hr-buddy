/**
 * Talent Pipeline Component
 * ✅ P0-002: Real data from ai_crew_matches table
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Briefcase, Clock, MapPin, Brain, ChevronRight, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Candidate {
  id: string; name: string; rank: string; nationality: string; experience: number;
  certifications: string[]; availability: string; matchScore: number;
  status: "new" | "screening" | "interview" | "offer" | "hired" | "rejected";
  appliedFor: string; appliedDate: string;
}

const pipelineStages = [
  { id: "new", label: "Novos", color: "bg-info" },
  { id: "screening", label: "Triagem", color: "bg-warning" },
  { id: "interview", label: "Entrevista", color: "bg-accent" },
  { id: "offer", label: "Proposta", color: "bg-warning/80" },
  { id: "hired", label: "Contratado", color: "bg-success" }
];

export function TalentPipeline() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from("ai_crew_matches")
        .select("*, vessels(name)")
        .order("created_at", { ascending: false })
        .limit(20);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- ai_crew_matches join with vessels needs flexible access
      const mapped: Candidate[] = (data || []).map((m: any) => ({
        id: String(m.id),
        name: String(m.candidate_id || "Candidato"),
        rank: String(m.position_id || "N/A"),
        nationality: "Brasil",
        experience: 0,
        certifications: [],
        availability: "A definir",
        matchScore: Number(m.match_score) || 0,
        status: (m.status === "accepted" ? "hired" : m.status === "pending" ? "new" : m.status || "new") as Candidate["status"],
        appliedFor: m.vessels?.name ? `Vaga - ${m.vessels.name}` : String(m.position_id || "N/A"),
        appliedDate: String(m.created_at || "").split("T")[0] || "",
      }));
      setCandidates(mapped);
      setLoading(false);
    }
    fetch();
  }, []);

  const getStageCount = (stage: string) => candidates.filter(c => c.status === stage).length;
  const moveCandidate = (candidateId: string, newStatus: Candidate["status"]) => {
    setCandidates(prev => prev.map(c => c.id === candidateId ? { ...c, status: newStatus } : c));
  };
  const getMatchColor = (score: number) => score >= 90 ? "text-success" : score >= 75 ? "text-warning" : "text-destructive";

  if (loading) return <div className="space-y-4">{[1,2,3].map(i => <Skeleton key={`talent-skeleton-${i}`} className="h-32 w-full" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {pipelineStages.map((stage) => (
          <Card key={stage.id}><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">{stage.label}</p><p className="text-3xl font-bold">{getStageCount(stage.id)}</p></div><div className={`w-3 h-12 rounded-full ${stage.color}`} /></div></CardContent></Card>
        ))}
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {pipelineStages.map((stage) => (
          <div key={stage.id} className="flex-shrink-0 w-80">
            <div className={`h-1 ${stage.color} rounded-t-lg`} />
            <Card className="rounded-t-none">
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center justify-between"><span>{stage.label}</span><Badge variant="secondary">{getStageCount(stage.id)}</Badge></CardTitle></CardHeader>
              <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
                {candidates.filter(c => c.status === stage.id).map((candidate) => (
                  <Card key={candidate.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar><AvatarFallback>{candidate.name.split(" ").map(n => n[0]).join("").slice(0,2)}</AvatarFallback></Avatar>
                          <div><p className="font-medium text-sm">{candidate.name}</p><p className="text-xs text-muted-foreground">{candidate.rank}</p></div>
                        </div>
                        <div className="flex items-center gap-1"><Brain className="h-4 w-4 text-primary" /><span className={`font-bold text-sm ${getMatchColor(candidate.matchScore)}`}>{candidate.matchScore}%</span></div>
                      </div>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <p className="flex items-center gap-1"><MapPin className="h-3 w-3" />{candidate.nationality}</p>
                        <p className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{candidate.appliedFor}</p>
                        <p className="flex items-center gap-1"><Clock className="h-3 w-3" />Disponível: {candidate.availability}</p>
                      </div>
                      <div className="flex gap-2 pt-2 border-t">
                        {stage.id !== "hired" && (
                          <Button size="sm" variant="outline" className="flex-1 h-8" onClick={() => {
                            const nextStage = pipelineStages[pipelineStages.findIndex(s => s.id === stage.id) + 1];
                            if (nextStage) moveCandidate(candidate.id, nextStage.id as Candidate["status"]);
                          }}><ChevronRight className="h-4 w-4" />Avançar</Button>
                        )}
                        {stage.id === "offer" && <Button size="sm" className="flex-1 h-8" onClick={() => moveCandidate(candidate.id, "hired")}><CheckCircle2 className="h-4 w-4 mr-1" />Contratar</Button>}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {getStageCount(stage.id) === 0 && <div className="text-center py-8 text-muted-foreground"><Users className="h-8 w-8 mx-auto mb-2 opacity-50" /><p className="text-sm">Nenhum candidato</p></div>}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TalentPipeline;
