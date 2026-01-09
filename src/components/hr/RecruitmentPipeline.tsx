/**
 * Recruitment Pipeline - People Management v4.0
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
import { 
  Users, 
  FileText, 
  Upload, 
  Search, 
  Star, 
  CheckCircle2, 
  Clock, 
  XCircle,
  Briefcase,
  Award,
  Ship,
  Brain,
  Sparkles,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { useAIRecruitment } from "@/hooks/useAIRecruitment";

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
}

interface JobOpening {
  id: string;
  title: string;
  vessel_type: string;
  rank_required: string;
  certifications_required: string[];
  experience_min: number;
  status: "open" | "closed" | "filled";
  applicants_count: number;
}

// Mock data for demonstration
const mockCandidates: Candidate[] = [
  {
    id: "1",
    name: "Carlos Mendes",
    email: "carlos.mendes@email.com",
    rank_applied: "Chief Officer",
    experience_years: 12,
    certifications: ["STCW", "GMDSS", "Advanced Firefighting", "Medical First Aid"],
    match_score: 94,
    status: "interview"
  },
  {
    id: "2",
    name: "Ana Silva",
    email: "ana.silva@email.com",
    rank_applied: "2nd Engineer",
    experience_years: 8,
    certifications: ["STCW", "Engine Room Simulator", "High Voltage"],
    match_score: 87,
    status: "screening"
  },
  {
    id: "3",
    name: "Pedro Santos",
    email: "pedro.santos@email.com",
    rank_applied: "Master",
    experience_years: 20,
    certifications: ["STCW", "GMDSS", "Ship Security Officer", "ISM Lead Auditor"],
    match_score: 98,
    status: "offer"
  },
  {
    id: "4",
    name: "Maria Costa",
    email: "maria.costa@email.com",
    rank_applied: "Deck Cadet",
    experience_years: 1,
    certifications: ["STCW Basic Safety"],
    match_score: 72,
    status: "new"
  }
];

const mockJobOpenings: JobOpening[] = [
  {
    id: "1",
    title: "Chief Officer - Container Vessel",
    vessel_type: "Container",
    rank_required: "Chief Officer",
    certifications_required: ["STCW", "GMDSS", "Advanced Firefighting"],
    experience_min: 8,
    status: "open",
    applicants_count: 12
  },
  {
    id: "2",
    title: "Master - Tanker Operations",
    vessel_type: "Tanker",
    rank_required: "Master",
    certifications_required: ["STCW", "Tanker Familiarization", "Ship Security Officer"],
    experience_min: 15,
    status: "open",
    applicants_count: 5
  },
  {
    id: "3",
    title: "2nd Engineer - Bulk Carrier",
    vessel_type: "Bulk",
    rank_required: "2nd Engineer",
    certifications_required: ["STCW", "Engine Room Simulator"],
    experience_min: 5,
    status: "open",
    applicants_count: 8
  }
];

const statusColors: Record<Candidate["status"], string> = {
  new: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  screening: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  interview: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  offer: "bg-green-500/10 text-green-500 border-green-500/20",
  hired: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  rejected: "bg-red-500/10 text-red-500 border-red-500/20"
};

const statusLabels: Record<Candidate["status"], string> = {
  new: "Novo",
  screening: "Triagem",
  interview: "Entrevista",
  offer: "Proposta",
  hired: "Contratado",
  rejected: "Rejeitado"
};

export function RecruitmentPipeline() {
  const [candidates, setCandidates] = useState<Candidate[]>(mockCandidates);
  const [jobOpenings] = useState<JobOpening[]>(mockJobOpenings);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("pipeline");
  const [cvText, setCvText] = useState("");
  const [showCVModal, setShowCVModal] = useState(false);

  const { parseCV, isLoading: isParsingCV } = useAIRecruitment();

  const filteredCandidates = candidates.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.rank_applied.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCVParse = async () => {
    if (!cvText.trim()) {
      toast.error("Cole o conteúdo do CV para análise");
      return;
    }

    const result = await parseCV(cvText);
    
    if (result) {
      const newCandidate: Candidate = {
        id: crypto.randomUUID(),
        name: result.name || "Candidato Novo",
        email: result.email || "email@example.com",
        rank_applied: result.targetRank || result.currentRank || "Deck Cadet",
        experience_years: result.experience || 0,
        certifications: result.certifications || [],
        match_score: result.matchScore || 75,
        status: "new"
      };

      setCandidates(prev => [newCandidate, ...prev]);
      setCvText("");
      setShowCVModal(false);
      toast.success(`Candidato adicionado com Match Score: ${newCandidate.match_score}%`);
    }
  };

  const handleCVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      setCvText(text);
      setShowCVModal(true);
    } catch (error) {
      console.error("Error reading file:", error);
      toast.error("Erro ao ler arquivo");
    }
  };

  const updateCandidateStatus = (id: string, newStatus: Candidate["status"]) => {
    setCandidates(prev => 
      prev.map(c => c.id === id ? { ...c, status: newStatus } : c)
    );
    toast.success(`Status atualizado para ${statusLabels[newStatus]}`);
  };

  const pipelineStages = ["new", "screening", "interview", "offer", "hired"] as const;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            Recrutamento Marítimo
          </h1>
          <p className="text-muted-foreground mt-1">
            Pipeline inteligente com IA para gestão de candidatos
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <label className="cursor-pointer">
              <Upload className="h-4 w-4 mr-2" />
              {isParsingCV ? "Processando..." : "Upload CV"}
              <input 
                type="file" 
                className="hidden" 
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleCVUpload}
                disabled={isParsingCV}
              />
            </label>
          </Button>
          <Button onClick={() => setShowCVModal(true)}>
            <Brain className="h-4 w-4 mr-2" />
            Analisar CV com IA
          </Button>
          <Button>
            <Briefcase className="h-4 w-4 mr-2" />
            Nova Vaga
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Candidatos Ativos</p>
                <p className="text-2xl font-bold">{candidates.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Vagas Abertas</p>
                <p className="text-2xl font-bold">{jobOpenings.filter(j => j.status === "open").length}</p>
              </div>
              <Briefcase className="h-8 w-8 text-green-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Em Entrevista</p>
                <p className="text-2xl font-bold">{candidates.filter(c => c.status === "interview").length}</p>
              </div>
              <Clock className="h-8 w-8 text-purple-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Match Score Médio</p>
                <p className="text-2xl font-bold">
                  {Math.round(candidates.reduce((acc, c) => acc + c.match_score, 0) / candidates.length)}%
                </p>
              </div>
              <Brain className="h-8 w-8 text-amber-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="pipeline">Pipeline Kanban</TabsTrigger>
          <TabsTrigger value="candidates">Lista de Candidatos</TabsTrigger>
          <TabsTrigger value="jobs">Vagas</TabsTrigger>
        </TabsList>

        {/* Pipeline Kanban */}
        <TabsContent value="pipeline" className="mt-4">
          <div className="grid grid-cols-5 gap-4 overflow-x-auto">
            {pipelineStages.map(stage => (
              <div key={stage} className="min-w-[250px]">
                <div className="bg-muted/50 rounded-lg p-3 mb-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    {stage === "new" && <FileText className="h-4 w-4" />}
                    {stage === "screening" && <Search className="h-4 w-4" />}
                    {stage === "interview" && <Users className="h-4 w-4" />}
                    {stage === "offer" && <Star className="h-4 w-4" />}
                    {stage === "hired" && <CheckCircle2 className="h-4 w-4" />}
                    {statusLabels[stage]}
                    <Badge variant="secondary" className="ml-auto">
                      {candidates.filter(c => c.status === stage).length}
                    </Badge>
                  </h3>
                </div>
                <div className="space-y-3">
                  {candidates
                    .filter(c => c.status === stage)
                    .map(candidate => (
                      <Card key={candidate.id} className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium">{candidate.name}</h4>
                            <Badge className={statusColors[candidate.status]}>
                              {candidate.match_score}%
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {candidate.rank_applied}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                            <Ship className="h-3 w-3" />
                            {candidate.experience_years} anos exp.
                            <Award className="h-3 w-3 ml-2" />
                            {candidate.certifications.length} certs
                          </div>
                          <Progress value={candidate.match_score} className="h-1.5" />
                          {stage !== "hired" && (
                            <div className="flex gap-1 mt-3">
                              {stage !== "offer" && (
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="flex-1 h-7 text-xs"
                                  onClick={() => {
                                    const nextStage = pipelineStages[pipelineStages.indexOf(stage) + 1];
                                    if (nextStage) updateCandidateStatus(candidate.id, nextStage);
                                  }}
                                >
                                  Avançar
                                </Button>
                              )}
                              {stage === "offer" && (
                                <Button 
                                  size="sm" 
                                  className="flex-1 h-7 text-xs bg-green-600 hover:bg-green-700"
                                  onClick={() => updateCandidateStatus(candidate.id, "hired")}
                                >
                                  Contratar
                                </Button>
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

        {/* Candidates List */}
        <TabsContent value="candidates" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Buscar candidatos..." 
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredCandidates.map(candidate => (
                  <div 
                    key={candidate.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">{candidate.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {candidate.rank_applied} • {candidate.experience_years} anos
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex gap-1">
                        {candidate.certifications.slice(0, 3).map(cert => (
                          <Badge key={cert} variant="outline" className="text-xs">
                            {cert}
                          </Badge>
                        ))}
                        {candidate.certifications.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{candidate.certifications.length - 3}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-amber-500" />
                        <span className="font-medium">{candidate.match_score}%</span>
                      </div>
                      <Badge className={statusColors[candidate.status]}>
                        {statusLabels[candidate.status]}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Job Openings */}
        <TabsContent value="jobs" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobOpenings.map(job => (
              <Card key={job.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{job.title}</CardTitle>
                    <Badge variant={job.status === "open" ? "default" : "secondary"}>
                      {job.status === "open" ? "Aberta" : "Fechada"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Ship className="h-4 w-4 text-muted-foreground" />
                      <span>{job.vessel_type}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <span>{job.rank_required}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>Mín. {job.experience_min} anos</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {job.certifications_required.map(cert => (
                        <Badge key={cert} variant="outline" className="text-xs">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t">
                      <span className="text-sm text-muted-foreground">
                        {job.applicants_count} candidatos
                      </span>
                      <Button size="sm" variant="outline">
                        Ver Candidatos
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default RecruitmentPipeline;
