/**
 * Recruitment Pipeline - Full CRUD with job_postings & job_applications
 * AI-powered CV parsing, candidate ranking, job openings
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Users, FileText, Upload, Search, Star, CheckCircle2, Clock, XCircle,
  Briefcase, Award, Ship, Brain, Sparkles, Loader2, Plus
} from "lucide-react";
import { toast } from "sonner";
import { useAIRecruitment } from "@/hooks/useAIRecruitment";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { logger } from '@/lib/logger';

const dynamicFrom = supabase.from as Function;

interface Candidate {
  id: string;
  name: string;
  email: string;
  rank_applied: string;
  experience_years: number;
  certifications: string[];
  match_score: number;
  status: "new" | "screening" | "interview" | "offer" | "hired" | "rejected";
  cv_url?: string;
  job_posting_id?: string;
}

interface JobOpening {
  id: string;
  title: string;
  vessel_type: string;
  rank_required: string;
  certifications_required: string[];
  experience_min: number;
  status: "open" | "closed" | "filled" | "draft";
  applicants_count: number;
}

function useCandidates() {
  return useQuery({
    queryKey: ['recruitment-candidates'],
    queryFn: async () => {
      const { data, error } = await dynamicFrom('job_applications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data || []).map((c: any): Candidate => ({
        id: c.id,
        name: c.candidate_name,
        email: c.candidate_email || '',
        rank_applied: c.rank_applied || 'Deck Cadet',
        experience_years: c.experience_years || 0,
        certifications: c.certifications || [],
        match_score: c.match_score || 0,
        status: c.status || 'new',
        cv_url: c.cv_url,
        job_posting_id: c.job_posting_id,
      }));
    },
    staleTime: 30000,
  });
}

function useJobOpenings() {
  return useQuery({
    queryKey: ['job-openings'],
    queryFn: async () => {
      const { data, error } = await dynamicFrom('job_postings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data || []).map((j: any): JobOpening => ({
        id: j.id,
        title: j.title,
        vessel_type: j.vessel_type || 'PSV',
        rank_required: j.rank_required,
        certifications_required: j.certifications_required || [],
        experience_min: j.experience_min || 0,
        status: j.status || 'open',
        applicants_count: j.applicants_count || 0,
      }));
    },
    staleTime: 30000,
  });
}

const statusColors: Record<Candidate["status"], string> = {
  new: "bg-primary/10 text-primary border-primary/20",
  screening: "bg-warning/10 text-warning border-warning/20",
  interview: "bg-secondary/10 text-secondary border-secondary/20",
  offer: "bg-success/10 text-success border-success/20",
  hired: "bg-success/10 text-success border-success/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20"
};

const statusLabels: Record<Candidate["status"], string> = {
  new: "Novo", screening: "Triagem", interview: "Entrevista",
  offer: "Proposta", hired: "Contratado", rejected: "Rejeitado"
};

export function RecruitmentPipeline() {
  const { data: candidates = [], isLoading: loadingCandidates } = useCandidates();
  const { data: jobOpenings = [], isLoading: loadingJobs } = useJobOpenings();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("pipeline");
  const [cvText, setCvText] = useState("");
  const [showCVModal, setShowCVModal] = useState(false);
  const [addJobDialog, setAddJobDialog] = useState(false);
  const [newJob, setNewJob] = useState({ title: '', rank_required: '', vessel_type: 'PSV', experience_min: '0' });

  const { parseCV, isLoading: isParsingCV } = useAIRecruitment();

  const filteredCandidates = candidates.filter((c: Candidate) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.rank_applied.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Create job posting
  const createJobMutation = useMutation({
    mutationFn: async (data: typeof newJob) => {
      const { error } = await dynamicFrom('job_postings').insert({
        title: data.title, rank_required: data.rank_required,
        vessel_type: data.vessel_type, experience_min: Number(data.experience_min),
        status: 'open',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-openings'] });
      toast.success('Vaga criada com sucesso');
      setAddJobDialog(false);
      setNewJob({ title: '', rank_required: '', vessel_type: 'PSV', experience_min: '0' });
    },
    onError: () => toast.error('Erro ao criar vaga'),
  });

  // Update candidate status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await dynamicFrom('job_applications').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruitment-candidates'] });
    },
  });

  // Add candidate from CV parse
  const addCandidateMutation = useMutation({
    mutationFn: async (candidate: { name: string; email: string; rank: string; experience: number; certifications: string[]; matchScore: number }) => {
      const { error } = await dynamicFrom('job_applications').insert({
        candidate_name: candidate.name, candidate_email: candidate.email,
        rank_applied: candidate.rank, experience_years: candidate.experience,
        certifications: candidate.certifications, match_score: candidate.matchScore,
        status: 'new',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruitment-candidates'] });
      toast.success('Candidato adicionado');
    },
  });

  const handleCVParse = async () => {
    if (!cvText.trim()) { toast.error("Cole o conteúdo do CV"); return; }
    const result = await parseCV(cvText);
    if (result) {
      await addCandidateMutation.mutateAsync({
        name: result.name || "Candidato Novo", email: result.email || "",
        rank: result.targetRank || result.currentRank || "Deck Cadet",
        experience: result.experience || 0, certifications: result.certifications || [],
        matchScore: result.matchScore || 75,
      });
      setCvText(""); setShowCVModal(false);
    }
  };

  const updateCandidateStatus = (id: string, newStatus: Candidate["status"]) => {
    updateStatusMutation.mutate({ id, status: newStatus });
    toast.success(`Status → ${statusLabels[newStatus]}`);
  };

  const pipelineStages = ["new", "screening", "interview", "offer", "hired"] as const;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" /> Recrutamento Marítimo
          </h1>
          <p className="text-muted-foreground mt-1">Pipeline inteligente com IA</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setShowCVModal(true)}>
            <Brain className="h-4 w-4 mr-2" />Analisar CV com IA
          </Button>
          <Button onClick={() => setAddJobDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />Nova Vaga
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Candidatos</p><p className="text-2xl font-bold">{candidates.length}</p></div><Users className="h-8 w-8 text-primary opacity-80" /></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Vagas Abertas</p><p className="text-2xl font-bold">{jobOpenings.filter((j: JobOpening) => j.status === "open").length}</p></div><Briefcase className="h-8 w-8 text-success opacity-80" /></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Em Entrevista</p><p className="text-2xl font-bold">{candidates.filter((c: Candidate) => c.status === "interview").length}</p></div><Clock className="h-8 w-8 text-warning opacity-80" /></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Score Médio</p><p className="text-2xl font-bold">{candidates.length > 0 ? Math.round(candidates.reduce((a: number, c: Candidate) => a + c.match_score, 0) / candidates.length) : 0}%</p></div><Brain className="h-8 w-8 text-accent opacity-80" /></div></CardContent></Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="pipeline">Pipeline Kanban</TabsTrigger>
          <TabsTrigger value="candidates">Candidatos</TabsTrigger>
          <TabsTrigger value="jobs">Vagas ({jobOpenings.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="mt-4">
          <div className="grid grid-cols-5 gap-4 overflow-x-auto">
            {pipelineStages.map(stage => (
              <div key={stage} className="min-w-[250px]">
                <div className="bg-muted/50 rounded-lg p-3 mb-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    {statusLabels[stage]}
                    <Badge variant="secondary" className="ml-auto">{candidates.filter((c: Candidate) => c.status === stage).length}</Badge>
                  </h3>
                </div>
                <div className="space-y-3">
                  {candidates.filter((c: Candidate) => c.status === stage).map((candidate: Candidate) => (
                    <Card key={candidate.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium">{candidate.name}</h4>
                          <Badge className={statusColors[candidate.status]}>{candidate.match_score}%</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{candidate.rank_applied}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                          <Ship className="h-3 w-3" />{candidate.experience_years} anos
                          <Award className="h-3 w-3 ml-2" />{candidate.certifications.length} certs
                        </div>
                        <Progress value={candidate.match_score} className="h-1.5" />
                        {stage !== "hired" && (
                          <div className="flex gap-1 mt-3">
                            {stage === "offer" ? (
                              <Button size="sm" className="flex-1 h-7 text-xs bg-success hover:bg-success/90" onClick={() => updateCandidateStatus(candidate.id, "hired")}>Contratar</Button>
                            ) : (
                              <Button size="sm" variant="ghost" className="flex-1 h-7 text-xs" onClick={() => {
                                const next = pipelineStages[pipelineStages.indexOf(stage) + 1];
                                if (next) updateCandidateStatus(candidate.id, next);
                              }}>Avançar</Button>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="candidates" className="mt-4">
          <Card>
            <CardHeader>
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar..." className="pl-9" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
            </CardHeader>
            <CardContent>
              {loadingCandidates ? (
                <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-muted animate-pulse rounded" />)}</div>
              ) : filteredCandidates.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Nenhum candidato encontrado</p>
              ) : (
                <div className="space-y-3">
                  {filteredCandidates.map((c: Candidate) => (
                    <div key={c.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center"><Users className="h-5 w-5 text-primary" /></div>
                        <div><h4 className="font-medium">{c.name}</h4><p className="text-sm text-muted-foreground">{c.rank_applied} • {c.experience_years} anos</p></div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex gap-1">{c.certifications.slice(0, 3).map((cert: string) => <Badge key={cert} variant="outline" className="text-xs">{cert}</Badge>)}</div>
                        <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-warning" /><span className="font-medium">{c.match_score}%</span></div>
                        <Badge className={statusColors[c.status]}>{statusLabels[c.status]}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobs" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loadingJobs ? (
              [1,2,3].map(i => <div key={i} className="h-40 bg-muted animate-pulse rounded-lg" />)
            ) : jobOpenings.length === 0 ? (
              <Card className="col-span-full"><CardContent className="py-12 text-center"><Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" /><p className="text-muted-foreground">Nenhuma vaga cadastrada</p><Button className="mt-4" onClick={() => setAddJobDialog(true)}><Plus className="h-4 w-4 mr-2" />Criar Vaga</Button></CardContent></Card>
            ) : jobOpenings.map((job: JobOpening) => (
              <Card key={job.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{job.title}</CardTitle>
                    <Badge variant={job.status === "open" ? "default" : "secondary"}>{job.status === "open" ? "Aberta" : job.status === "filled" ? "Preenchida" : "Fechada"}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2"><Ship className="h-4 w-4 text-muted-foreground" />{job.vessel_type}</div>
                    <div className="flex items-center gap-2"><Briefcase className="h-4 w-4 text-muted-foreground" />{job.rank_required}</div>
                    <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-muted-foreground" />Mín. {job.experience_min} anos</div>
                    <div className="flex items-center gap-2"><Users className="h-4 w-4 text-muted-foreground" />{job.applicants_count} candidatos</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* CV Analysis Dialog */}
      <Dialog open={showCVModal} onOpenChange={setShowCVModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Analisar CV com IA</DialogTitle></DialogHeader>
          <Textarea placeholder="Cole o conteúdo do CV aqui..." value={cvText} onChange={e => setCvText(e.target.value)} rows={10} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCVModal(false)}>Cancelar</Button>
            <Button onClick={handleCVParse} disabled={isParsingCV}>{isParsingCV ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Analisando...</> : "Analisar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Job Dialog */}
      <Dialog open={addJobDialog} onOpenChange={setAddJobDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nova Vaga</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Título</Label><Input value={newJob.title} onChange={e => setNewJob(p => ({ ...p, title: e.target.value }))} placeholder="Ex: Capitão de Longo Curso" /></div>
            <div><Label>Posto/Rank</Label><Input value={newJob.rank_required} onChange={e => setNewJob(p => ({ ...p, rank_required: e.target.value }))} placeholder="Ex: Master" /></div>
            <div><Label>Tipo de Embarcação</Label>
              <Select value={newJob.vessel_type} onValueChange={v => setNewJob(p => ({ ...p, vessel_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PSV">PSV</SelectItem><SelectItem value="AHTS">AHTS</SelectItem>
                  <SelectItem value="OSRV">OSRV</SelectItem><SelectItem value="Tanker">Tanker</SelectItem>
                  <SelectItem value="Bulk Carrier">Bulk Carrier</SelectItem><SelectItem value="Container">Container</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Experiência Mínima (anos)</Label><Input type="number" value={newJob.experience_min} onChange={e => setNewJob(p => ({ ...p, experience_min: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddJobDialog(false)}>Cancelar</Button>
            <Button onClick={() => createJobMutation.mutate(newJob)} disabled={!newJob.title || !newJob.rank_required}>Criar Vaga</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
