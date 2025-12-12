import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  GraduationCap,
  Award,
  Clock,
  User,
  BookOpen,
  Target,
  TrendingUp,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Play,
  Users,
  Star,
  MessageSquare,
  FileText,
  Download,
  Search,
  Filter,
  Plus,
  RefreshCw,
  Zap,
  Brain,
  Ship
} from "lucide-react";

interface CrewMember {
  id: string;
  name: string;
  role: "DPO" | "SDPO" | "JDPO" | "C/E" | "ETO" | "Master";
  vessel: string;
  dpHours: number;
  targetDpHours: number;
  certifications: Certification[];
  trainings: Training[];
  cpdScore: number;
  mentoringStatus?: "mentor" | "mentee" | null;
  mentorId?: string;
  avatar?: string;
}

interface Certification {
  id: string;
  name: string;
  issuer: "NI" | "IMCA" | "STCW" | "DNV";
  issueDate: string;
  expiryDate: string;
  status: "valid" | "expiring" | "expired";
  type: "Induction" | "Simulator" | "Refresher" | "Advanced" | "Unlimited";
}

interface Training {
  id: string;
  name: string;
  type: "online" | "simulator" | "practical" | "assessment";
  status: "completed" | "in_progress" | "pending" | "overdue";
  completedDate?: string;
  dueDate?: string;
  score?: number;
  passScore: number;
}

interface Assessment {
  id: string;
  name: string;
  type: "fault_response" | "tam_cam" | "gain_bias" | "asog" | "wcf";
  difficulty: "basic" | "intermediate" | "advanced";
  duration: number;
  questions: number;
  passScore: number;
}

const mockCrewMembers: CrewMember[] = [
  {
    id: "CREW-001",
    name: "João Silva",
    role: "SDPO",
    vessel: "MV Atlantic Explorer",
    dpHours: 4500,
    targetDpHours: 5000,
    cpdScore: 85,
    mentoringStatus: "mentor",
    certifications: [
      { id: "CERT-001", name: "NI DP Unlimited Certificate", issuer: "NI", issueDate: "2022-03-15", expiryDate: "2027-03-15", status: "valid", type: "Unlimited" },
      { id: "CERT-002", name: "DP Simulator Course", issuer: "NI", issueDate: "2023-06-20", expiryDate: "2025-06-20", status: "expiring", type: "Simulator" },
      { id: "CERT-003", name: "STCW Basic Safety", issuer: "STCW", issueDate: "2021-01-10", expiryDate: "2026-01-10", status: "valid", type: "Induction" }
    ],
    trainings: [
      { id: "TRN-001", name: "Fault Response Avançado", type: "simulator", status: "completed", completedDate: "2024-11-15", score: 92, passScore: 80 },
      { id: "TRN-002", name: "TAM/CAM Procedures", type: "online", status: "completed", completedDate: "2024-10-20", score: 88, passScore: 75 },
      { id: "TRN-003", name: "ASOG Review 2024", type: "assessment", status: "pending", dueDate: "2024-12-31", passScore: 80 }
    ]
  },
  {
    id: "CREW-002",
    name: "Maria Santos",
    role: "JDPO",
    vessel: "MV Atlantic Explorer",
    dpHours: 1200,
    targetDpHours: 2500,
    cpdScore: 72,
    mentoringStatus: "mentee",
    mentorId: "CREW-001",
    certifications: [
      { id: "CERT-004", name: "NI DP Induction", issuer: "NI", issueDate: "2023-08-01", expiryDate: "2024-08-01", status: "expired", type: "Induction" },
      { id: "CERT-005", name: "DP Simulator Course", issuer: "NI", issueDate: "2023-09-15", expiryDate: "2025-09-15", status: "valid", type: "Simulator" }
    ],
    trainings: [
      { id: "TRN-004", name: "DP Fundamentals", type: "online", status: "completed", completedDate: "2024-09-10", score: 85, passScore: 70 },
      { id: "TRN-005", name: "Gain & Bias Configuration", type: "simulator", status: "in_progress", dueDate: "2024-12-15", passScore: 80 },
      { id: "TRN-006", name: "Emergency Procedures", type: "practical", status: "overdue", dueDate: "2024-11-30", passScore: 85 }
    ]
  },
  {
    id: "CREW-003",
    name: "Carlos Eduardo",
    role: "DPO",
    vessel: "OSV Petrobras XXI",
    dpHours: 3200,
    targetDpHours: 4000,
    cpdScore: 78,
    mentoringStatus: null,
    certifications: [
      { id: "CERT-006", name: "NI DP Certificate", issuer: "NI", issueDate: "2021-05-20", expiryDate: "2026-05-20", status: "valid", type: "Advanced" },
      { id: "CERT-007", name: "DP Refresher", issuer: "NI", issueDate: "2024-02-10", expiryDate: "2025-02-10", status: "expiring", type: "Refresher" }
    ],
    trainings: [
      { id: "TRN-007", name: "WCF Analysis", type: "online", status: "completed", completedDate: "2024-08-05", score: 90, passScore: 75 },
      { id: "TRN-008", name: "SIMOPS Procedures", type: "assessment", status: "pending", dueDate: "2025-01-15", passScore: 80 }
    ]
  }
];

const mockAssessments: Assessment[] = [
  { id: "ASS-001", name: "Fault Response Básico", type: "fault_response", difficulty: "basic", duration: 30, questions: 20, passScore: 70 },
  { id: "ASS-002", name: "TAM/CAM Procedures", type: "tam_cam", difficulty: "intermediate", duration: 45, questions: 30, passScore: 75 },
  { id: "ASS-003", name: "Gain & Bias Configuration", type: "gain_bias", difficulty: "intermediate", duration: 40, questions: 25, passScore: 80 },
  { id: "ASS-004", name: "ASOG Compliance", type: "asog", difficulty: "advanced", duration: 60, questions: 40, passScore: 85 },
  { id: "ASS-005", name: "WCF Analysis", type: "wcf", difficulty: "advanced", duration: 50, questions: 35, passScore: 80 }
];

export const DPCompetenceHub: React.FC = () => {
  const [crewMembers] = useState<CrewMember[]>(mockCrewMembers);
  const [assessments] = useState<Assessment[]>(mockAssessments);
  const [selectedMember, setSelectedMember] = useState<CrewMember | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("cpd");

  const filteredMembers = crewMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.vessel.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || member.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const getExpiringCerts = () => {
    return crewMembers.flatMap(m => m.certifications.filter(c => c.status === "expiring" || c.status === "expired").map(c => ({ ...c, crewName: m.name, crewRole: m.role })));
  };

  const getOverdueTrainings = () => {
    return crewMembers.flatMap(m => m.trainings.filter(t => t.status === "overdue").map(t => ({ ...t, crewName: m.name, crewRole: m.role })));
  };

  const handleStartAssessment = (assessment: Assessment) => {
    toast.success(`Iniciando avaliação: ${assessment.name}`);
  };

  const getCertStatusBadge = (status: string) => {
    switch (status) {
    case "valid": return <Badge className="bg-green-500">Válido</Badge>;
    case "expiring": return <Badge className="bg-yellow-500 text-black">Vencendo</Badge>;
    case "expired": return <Badge variant="destructive">Expirado</Badge>;
    default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTrainingStatusBadge = (status: string) => {
    switch (status) {
    case "completed": return <Badge className="bg-green-500">Concluído</Badge>;
    case "in_progress": return <Badge className="bg-blue-500">Em Progresso</Badge>;
    case "pending": return <Badge className="bg-yellow-500 text-black">Pendente</Badge>;
    case "overdue": return <Badge variant="destructive">Atrasado</Badge>;
    default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const expiringCerts = getExpiringCerts();
  const overdueTrainings = getOverdueTrainings();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl">
            <GraduationCap className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">DP Competence Hub</h2>
            <p className="text-muted-foreground">Centro de Treinamento Digital - IMCA M117</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Download className="w-4 h-4 mr-2" />Relatório CPD</Button>
          <Button><Plus className="w-4 h-4 mr-2" />Novo Treinamento</Button>
        </div>
      </div>

      {/* Alerts */}
      {(expiringCerts.length > 0 || overdueTrainings.length > 0) && (
        <div className="grid grid-cols-2 gap-4">
          {expiringCerts.length > 0 && (
            <Card className="border-yellow-500/50 bg-yellow-500/5">
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-8 w-8 text-yellow-500" />
                  <div>
                    <p className="font-medium text-yellow-600">Certificações Vencendo/Expiradas</p>
                    <p className="text-sm text-muted-foreground">{expiringCerts.length} certificações precisam de atenção</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          {overdueTrainings.length > 0 && (
            <Card className="border-red-500/50 bg-red-500/5">
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                  <div>
                    <p className="font-medium text-red-600">Treinamentos Atrasados</p>
                    <p className="text-sm text-muted-foreground">{overdueTrainings.length} treinamentos em atraso</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Tripulantes</p>
                <p className="text-2xl font-bold">{crewMembers.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Score CPD Médio</p>
                <p className="text-2xl font-bold">{Math.round(crewMembers.reduce((acc, m) => acc + m.cpdScore, 0) / crewMembers.length)}%</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Mentores Ativos</p>
                <p className="text-2xl font-bold">{crewMembers.filter(m => m.mentoringStatus === "mentor").length}</p>
              </div>
              <Star className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avaliações Disponíveis</p>
                <p className="text-2xl font-bold">{assessments.length}</p>
              </div>
              <BookOpen className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Alertas Ativos</p>
                <p className="text-2xl font-bold">{expiringCerts.length + overdueTrainings.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="cpd" className="flex items-center gap-2"><TrendingUp className="w-4 h-4" />CPD Tracker</TabsTrigger>
          <TabsTrigger value="assessments" className="flex items-center gap-2"><Brain className="w-4 h-4" />Avaliações</TabsTrigger>
          <TabsTrigger value="certifications" className="flex items-center gap-2"><Award className="w-4 h-4" />Certificações</TabsTrigger>
          <TabsTrigger value="mentoring" className="flex items-center gap-2"><Users className="w-4 h-4" />Mentoring</TabsTrigger>
        </TabsList>

        <TabsContent value="cpd" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Buscar por nome ou embarcação..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                </div>
                <select className="border rounded-md px-3 py-2 text-sm" value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
                  <option value="all">Todas as Funções</option>
                  <option value="SDPO">SDPO</option>
                  <option value="DPO">DPO</option>
                  <option value="JDPO">JDPO</option>
                  <option value="C/E">C/E</option>
                  <option value="ETO">ETO</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Crew List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMembers.map((member) => (
              <Card key={member.id} className="hover:shadow-lg transition-all cursor-pointer" onClick={() => setSelectedMember(member)}>
                <CardContent className="pt-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback className="bg-primary/10 text-primary text-lg">{member.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{member.name}</h3>
                          <p className="text-sm text-muted-foreground">{member.role} - {member.vessel}</p>
                        </div>
                        {member.mentoringStatus === "mentor" && <Badge className="bg-purple-500"><Star className="w-3 h-3 mr-1" />Mentor</Badge>}
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Horas DP</span>
                          <span className="font-medium">{member.dpHours.toLocaleString()} / {member.targetDpHours.toLocaleString()}</span>
                        </div>
                        <Progress value={(member.dpHours / member.targetDpHours) * 100} className="h-2" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          <Badge variant="outline" className={member.cpdScore >= 80 ? "border-green-500 text-green-500" : member.cpdScore >= 60 ? "border-yellow-500 text-yellow-500" : "border-red-500 text-red-500"}>
                            CPD: {member.cpdScore}%
                          </Badge>
                          <Badge variant="outline">{member.certifications.length} Certs</Badge>
                        </div>
                        {member.certifications.some(c => c.status !== "valid") && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="assessments" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assessments.map((assessment) => (
              <Card key={assessment.id} className="hover:shadow-lg transition-all">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{assessment.name}</CardTitle>
                    <Badge variant={assessment.difficulty === "basic" ? "secondary" : assessment.difficulty === "intermediate" ? "default" : "destructive"}>
                      {assessment.difficulty === "basic" ? "Básico" : assessment.difficulty === "intermediate" ? "Intermediário" : "Avançado"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{assessment.duration} min</span>
                    <span className="flex items-center gap-1"><FileText className="h-4 w-4" />{assessment.questions} questões</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Nota de Aprovação</span>
                    <span className="font-medium">{assessment.passScore}%</span>
                  </div>
                  <Button className="w-full" onClick={() => handleStartAssessment(assessment)}>
                    <Play className="w-4 h-4 mr-2" />Iniciar Avaliação
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="certifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Certificações da Equipe</CardTitle>
              <CardDescription>Controle de vencimentos NI, IMCA, STCW</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {crewMembers.flatMap(member =>
                    member.certifications.map(cert => (
                      <div key={cert.id} className="p-3 rounded-lg border bg-card flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Award className={`h-8 w-8 ${cert.status === "valid" ? "text-green-500" : cert.status === "expiring" ? "text-yellow-500" : "text-red-500"}`} />
                          <div>
                            <p className="font-medium">{cert.name}</p>
                            <p className="text-sm text-muted-foreground">{member.name} ({member.role})</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <span className="text-muted-foreground">Vence: {new Date(cert.expiryDate).toLocaleDateString("pt-BR")}</span>
                          {getCertStatusBadge(cert.status)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mentoring" className="space-y-4">
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Star className="h-5 w-5 text-purple-500" />Mentores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {crewMembers.filter(m => m.mentoringStatus === "mentor").map(mentor => (
                    <div key={mentor.id} className="p-3 rounded-lg border bg-card flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-purple-500/20 text-purple-500">{mentor.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{mentor.name}</p>
                        <p className="text-sm text-muted-foreground">{mentor.role} - {mentor.dpHours.toLocaleString()}h DP</p>
                      </div>
                      <Badge className="bg-purple-500">{crewMembers.filter(m => m.mentorId === mentor.id).length} mentees</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-blue-500" />Mentees</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {crewMembers.filter(m => m.mentoringStatus === "mentee").map(mentee => {
                    const mentor = crewMembers.find(m => m.id === mentee.mentorId);
                    return (
                      <div key={mentee.id} className="p-3 rounded-lg border bg-card flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-blue-500/20 text-blue-500">{mentee.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium">{mentee.name}</p>
                          <p className="text-sm text-muted-foreground">{mentee.role} - Mentor: {mentor?.name}</p>
                        </div>
                        <Button size="sm" variant="outline"><MessageSquare className="w-3 h-3 mr-1" />Chat</Button>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      <Dialog open={!!selectedMember} onOpenChange={() => setSelectedMember(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedMember && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary">{selectedMember.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                  </Avatar>
                  <div>
                    <span>{selectedMember.name}</span>
                    <p className="text-sm font-normal text-muted-foreground">{selectedMember.role} - {selectedMember.vessel}</p>
                  </div>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4">
                {/* CPD Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progresso CPD</span>
                    <span className="font-medium">{selectedMember.cpdScore}%</span>
                  </div>
                  <Progress value={selectedMember.cpdScore} className="h-3" />
                </div>

                {/* Certifications */}
                <div>
                  <h4 className="font-semibold mb-3">Certificações</h4>
                  <div className="space-y-2">
                    {selectedMember.certifications.map(cert => (
                      <div key={cert.id} className="p-3 rounded-lg border flex items-center justify-between">
                        <div>
                          <p className="font-medium">{cert.name}</p>
                          <p className="text-xs text-muted-foreground">{cert.issuer} - {cert.type}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{new Date(cert.expiryDate).toLocaleDateString("pt-BR")}</span>
                          {getCertStatusBadge(cert.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Trainings */}
                <div>
                  <h4 className="font-semibold mb-3">Treinamentos</h4>
                  <div className="space-y-2">
                    {selectedMember.trainings.map(training => (
                      <div key={training.id} className="p-3 rounded-lg border flex items-center justify-between">
                        <div>
                          <p className="font-medium">{training.name}</p>
                          <p className="text-xs text-muted-foreground">{training.type}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {training.score && <span className="text-sm font-medium">{training.score}%</span>}
                          {getTrainingStatusBadge(training.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DPCompetenceHub;
