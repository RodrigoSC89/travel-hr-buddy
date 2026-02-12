/**
 * Competency Matrix - Premium People Hub Component
 * Matriz de competências e certificações da tripulação
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Users, 
  Award, 
  GraduationCap, 
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  Calendar,
  FileText,
  Download,
  Filter,
  TrendingUp,
  Target,
  Star,
  Shield,
  Anchor,
  Navigation,
  Radio,
  Wrench,
  Heart,
  BookOpen,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CrewMember {
  id: string;
  name: string;
  rank: string;
  department: string;
  vessel: string;
  avatar?: string;
  competencyScore: number;
  certifications: Certification[];
  trainings: Training[];
  skills: Skill[];
}

interface Certification {
  id: string;
  name: string;
  code: string;
  type: "STCW" | "Flag State" | "Company" | "Specialized";
  issueDate: string;
  expiryDate: string;
  status: "valid" | "expiring" | "expired" | "pending";
  issuingAuthority: string;
  documentNumber: string;
}

interface Training {
  id: string;
  name: string;
  type: string;
  completedDate?: string;
  dueDate: string;
  status: "completed" | "in-progress" | "overdue" | "scheduled";
  progress: number;
  mandatory: boolean;
}

interface Skill {
  id: string;
  name: string;
  category: string;
  level: number;
  maxLevel: number;
  lastAssessed: string;
  trend: "improving" | "stable" | "declining";
}

const fallbackCrew: CrewMember[] = [
  {
    id: "1",
    name: "Carlos Silva",
    rank: "Capitão",
    department: "Deck",
    vessel: "MV Atlantic Pioneer",
    competencyScore: 95,
    certifications: [
      { id: "c1", name: "Master Mariner (Unlimited)", code: "II/2", type: "STCW", issueDate: "2020-06-15", expiryDate: "2025-06-15", status: "valid", issuingAuthority: "DPC Brazil", documentNumber: "MM-2020-12345" },
      { id: "c2", name: "GMDSS Operator", code: "IV/2", type: "STCW", issueDate: "2019-03-20", expiryDate: "2024-03-20", status: "expiring", issuingAuthority: "ANATEL", documentNumber: "GMDSS-2019-54321" },
      { id: "c3", name: "Ship Security Officer", code: "VI/5", type: "STCW", issueDate: "2021-09-10", expiryDate: "2026-09-10", status: "valid", issuingAuthority: "DPC Brazil", documentNumber: "SSO-2021-98765" },
      { id: "c4", name: "Medical First Aid", code: "VI/4", type: "STCW", issueDate: "2022-01-15", expiryDate: "2027-01-15", status: "valid", issuingAuthority: "Red Cross", documentNumber: "MFA-2022-11111" }
    ],
    trainings: [
      { id: "t1", name: "Bridge Team Management", type: "Leadership", completedDate: "2023-11-20", dueDate: "2024-11-20", status: "completed", progress: 100, mandatory: true },
      { id: "t2", name: "ECDIS Advanced", type: "Navigation", dueDate: "2024-02-15", status: "in-progress", progress: 65, mandatory: true },
      { id: "t3", name: "Crisis Management", type: "Safety", dueDate: "2024-03-01", status: "scheduled", progress: 0, mandatory: false }
    ],
    skills: [
      { id: "s1", name: "Navegação", category: "Technical", level: 5, maxLevel: 5, lastAssessed: "2023-12-01", trend: "stable" },
      { id: "s2", name: "Liderança", category: "Soft Skills", level: 4, maxLevel: 5, lastAssessed: "2023-12-01", trend: "improving" },
      { id: "s3", name: "Gestão de Crise", category: "Safety", level: 4, maxLevel: 5, lastAssessed: "2023-12-01", trend: "stable" }
    ]
  },
  {
    id: "2",
    name: "Ana Rodrigues",
    rank: "1º Oficial",
    department: "Deck",
    vessel: "MV Atlantic Pioneer",
    competencyScore: 88,
    certifications: [
      { id: "c1", name: "Chief Mate (Unlimited)", code: "II/2", type: "STCW", issueDate: "2021-08-10", expiryDate: "2026-08-10", status: "valid", issuingAuthority: "DPC Brazil", documentNumber: "CM-2021-22222" },
      { id: "c2", name: "Advanced Firefighting", code: "VI/3", type: "STCW", issueDate: "2020-05-12", expiryDate: "2024-01-15", status: "expired", issuingAuthority: "DPC Brazil", documentNumber: "AFF-2020-33333" }
    ],
    trainings: [
      { id: "t1", name: "Cargo Operations", type: "Operations", completedDate: "2023-10-15", dueDate: "2024-10-15", status: "completed", progress: 100, mandatory: true },
      { id: "t2", name: "Environmental Awareness", type: "Compliance", dueDate: "2024-01-20", status: "overdue", progress: 30, mandatory: true }
    ],
    skills: [
      { id: "s1", name: "Operações de Carga", category: "Technical", level: 4, maxLevel: 5, lastAssessed: "2023-11-15", trend: "improving" },
      { id: "s2", name: "Comunicação", category: "Soft Skills", level: 5, maxLevel: 5, lastAssessed: "2023-11-15", trend: "stable" }
    ]
  }
];

const certificationIcons: Record<string, React.ElementType> = {
  "STCW": Shield,
  "Flag State": Anchor,
  "Company": Award,
  "Specialized": Star
};

const departmentIcons: Record<string, React.ElementType> = {
  "Deck": Navigation,
  "Engine": Wrench,
  "Radio": Radio,
  "Medical": Heart,
  "Catering": BookOpen
};

export default function CompetencyMatrix() {
  const [selectedCrew, setSelectedCrew] = useState<CrewMember | null>(fallbackCrew[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");

  const filteredCrew = fallbackCrew.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.rank.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = departmentFilter === "all" || member.department === departmentFilter;
    return matchesSearch && matchesDepartment;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "valid":
      case "completed":
        return "bg-success";
      case "expiring":
      case "in-progress":
        return "bg-warning";
      case "expired":
      case "overdue":
        return "bg-destructive";
      default:
        return "bg-muted";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "valid":
      case "completed":
        return CheckCircle2;
      case "expiring":
      case "in-progress":
        return Clock;
      case "expired":
      case "overdue":
        return XCircle;
      default:
        return AlertTriangle;
    }
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    const days = Math.ceil((new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days;
  };

  // Calculate summary stats
  const totalCertifications = fallbackCrew.reduce((acc, c) => acc + c.certifications.length, 0);
  const expiringCerts = fallbackCrew.reduce((acc, c) => 
    acc + c.certifications.filter(cert => cert.status === "expiring").length, 0);
  const expiredCerts = fallbackCrew.reduce((acc, c) => 
    acc + c.certifications.filter(cert => cert.status === "expired").length, 0);
  const overdueTrainings = fallbackCrew.reduce((acc, c) => 
    acc + c.trainings.filter(t => t.status === "overdue").length, 0);

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{fallbackCrew.length}</p>
                <p className="text-xs text-muted-foreground">Tripulantes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/20 rounded-lg">
                <Award className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalCertifications}</p>
                <p className="text-xs text-muted-foreground">Certificações</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/20 rounded-lg">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{expiringCerts}</p>
                <p className="text-xs text-muted-foreground">Expirando em 90 dias</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/20 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{expiredCerts + overdueTrainings}</p>
                <p className="text-xs text-muted-foreground">Ações Urgentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Crew List */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Tripulação
            </CardTitle>
            <div className="space-y-2 mt-2">
              <Input 
                placeholder="Buscar tripulante..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Departamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Departamentos</SelectItem>
                  <SelectItem value="Deck">Deck</SelectItem>
                  <SelectItem value="Engine">Máquinas</SelectItem>
                  <SelectItem value="Radio">Rádio</SelectItem>
                  <SelectItem value="Medical">Médico</SelectItem>
                  <SelectItem value="Catering">Hotelaria</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[450px]">
              <div className="space-y-3">
                {filteredCrew.map((member) => {
                  const DeptIcon = departmentIcons[member.department] || Users;
                  const hasIssues = member.certifications.some(c => c.status === "expired" || c.status === "expiring") ||
                                   member.trainings.some(t => t.status === "overdue");
                  return (
                    <div
                      key={member.id}
                      onClick={() => setSelectedCrew(member)}
                      className={cn(
                        "p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md",
                        selectedCrew?.id === member.id 
                          ? "border-primary bg-primary/5" 
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback className="bg-primary/10">
                            {member.name.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold truncate">{member.name}</p>
                            {hasIssues && (
                              <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{member.rank}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              <DeptIcon className="h-3 w-3 mr-1" />
                              {member.department}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span>Competência</span>
                          <span className={cn(
                            "font-medium",
                            member.competencyScore >= 90 ? "text-success" :
                            member.competencyScore >= 70 ? "text-warning" : "text-destructive"
                          )}>{member.competencyScore}%</span>
                        </div>
                        <Progress value={member.competencyScore} className="h-2" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Crew Details */}
        <Card className="lg:col-span-2">
          {selectedCrew ? (
            <>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={selectedCrew.avatar} />
                      <AvatarFallback className="bg-primary/10 text-lg">
                        {selectedCrew.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-xl">{selectedCrew.name}</CardTitle>
                      <CardDescription>
                        {selectedCrew.rank} • {selectedCrew.department} • {selectedCrew.vessel}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Exportar
                    </Button>
                    <Button size="sm">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Atualizar
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="certifications">
                  <TabsList className="mb-4">
                    <TabsTrigger value="certifications">
                      Certificações
                      {selectedCrew.certifications.some(c => c.status === "expired") && (
                        <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 justify-center">!</Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="trainings">
                      Treinamentos
                      {selectedCrew.trainings.some(t => t.status === "overdue") && (
                        <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 justify-center">!</Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="skills">Habilidades</TabsTrigger>
                  </TabsList>

                  <TabsContent value="certifications">
                    <ScrollArea className="h-[350px]">
                      <div className="space-y-3">
                        {selectedCrew.certifications.map((cert) => {
                          const CertIcon = certificationIcons[cert.type] || Award;
                          const StatusIcon = getStatusIcon(cert.status);
                          const daysUntil = getDaysUntilExpiry(cert.expiryDate);
                          
                          return (
                            <div key={cert.id} className="p-4 rounded-lg border">
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3">
                                  <div className={cn(
                                    "p-2 rounded-lg",
                                    cert.status === "valid" ? "bg-success/10" :
                                    cert.status === "expiring" ? "bg-warning/10" :
                                    "bg-destructive/10"
                                  )}>
                                    <CertIcon className={cn(
                                      "h-5 w-5",
                                      cert.status === "valid" ? "text-success" :
                                      cert.status === "expiring" ? "text-warning" :
                                      "text-destructive"
                                    )} />
                                  </div>
                                  <div>
                                    <p className="font-medium">{cert.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {cert.code} • {cert.documentNumber}
                                    </p>
                                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                      <span>Emissão: {formatDate(cert.issueDate)}</span>
                                      <span>Validade: {formatDate(cert.expiryDate)}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <Badge className={cn("text-white", getStatusColor(cert.status))}>
                                    <StatusIcon className="h-3 w-3 mr-1" />
                                    {cert.status === "valid" ? "Válido" :
                                     cert.status === "expiring" ? "Expirando" :
                                     cert.status === "expired" ? "Expirado" : "Pendente"}
                                  </Badge>
                                  {cert.status !== "expired" && daysUntil > 0 && (
                                    <p className={cn(
                                      "text-xs mt-1",
                                      daysUntil <= 30 ? "text-destructive" :
                                      daysUntil <= 90 ? "text-warning" : "text-muted-foreground"
                                    )}>
                                      {daysUntil} dias restantes
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="trainings">
                    <ScrollArea className="h-[350px]">
                      <div className="space-y-3">
                        {selectedCrew.trainings.map((training) => {
                          const StatusIcon = getStatusIcon(training.status);
                          return (
                            <div key={training.id} className="p-4 rounded-lg border">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium">{training.name}</p>
                                    {training.mandatory && (
                                      <Badge variant="outline" className="text-xs">Obrigatório</Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground">{training.type}</p>
                                </div>
                                <Badge className={cn("text-white", getStatusColor(training.status))}>
                                  <StatusIcon className="h-3 w-3 mr-1" />
                                  {training.status === "completed" ? "Concluído" :
                                   training.status === "in-progress" ? "Em Andamento" :
                                   training.status === "overdue" ? "Atrasado" : "Agendado"}
                                </Badge>
                              </div>
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Progresso</span>
                                  <span>{training.progress}%</span>
                                </div>
                                <Progress value={training.progress} className="h-2" />
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Calendar className="h-3 w-3" />
                                  {training.completedDate 
                                    ? `Concluído: ${formatDate(training.completedDate)}`
                                    : `Prazo: ${formatDate(training.dueDate)}`
                                  }
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="skills">
                    <div className="grid md:grid-cols-2 gap-4">
                      {selectedCrew.skills.map((skill) => (
                        <div key={skill.id} className="p-4 rounded-lg border">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="font-medium">{skill.name}</p>
                              <p className="text-sm text-muted-foreground">{skill.category}</p>
                            </div>
                            <div className="flex items-center gap-1">
                              {skill.trend === "improving" && (
                                <TrendingUp className="h-4 w-4 text-success" />
                              )}
                              {skill.trend === "declining" && (
                                <TrendingUp className="h-4 w-4 text-destructive rotate-180" />
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1 mb-2">
                            {Array.from({ length: skill.maxLevel }).map((_, i) => (
                              <Star 
                                key={`star-${skill.id}-${i}`}
                                className={cn(
                                  "h-5 w-5",
                                  i < skill.level 
                                    ? "text-yellow-500 fill-yellow-500" 
                                    : "text-muted-foreground"
                                )} 
                              />
                            ))}
                          </div>
                          
                          <p className="text-xs text-muted-foreground">
                            Avaliado em {formatDate(skill.lastAssessed)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-[500px] text-muted-foreground">
              <div className="text-center">
                <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Selecione um tripulante para ver detalhes</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
