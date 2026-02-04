/**
 * Competency Matrix Panel - Matriz de Competências STCW
 * Visualização e gestão de competências da tripulação
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  GraduationCap,
  Award,
  Users,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingUp,
  Star,
  Target,
  BookOpen,
  Calendar,
  Download,
  Eye,
  Edit,
  Plus,
  RefreshCw,
  Shield,
  Anchor,
  Navigation,
  Settings,
  Radio,
  Flame,
} from "lucide-react";
import { motion } from "framer-motion";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";

interface CrewMember {
  id: string;
  name: string;
  rank: string;
  vessel: string;
  department: string;
  overallScore: number;
  competencies: Competency[];
  certifications: Certification[];
}

interface Competency {
  id: string;
  name: string;
  category: string;
  level: 1 | 2 | 3 | 4 | 5;
  required: 1 | 2 | 3 | 4 | 5;
  lastAssessed: Date;
  trend: "up" | "down" | "stable";
}

interface Certification {
  id: string;
  name: string;
  issueDate: Date;
  expiryDate: Date;
  status: "valid" | "expiring" | "expired";
  isRequired: boolean;
}

const COMPETENCY_CATEGORIES = [
  { id: "nav", name: "Navegação", icon: Navigation },
  { id: "safety", name: "Segurança", icon: Shield },
  { id: "cargo", name: "Carga", icon: Anchor },
  { id: "fire", name: "Combate a Incêndio", icon: Flame },
  { id: "comm", name: "Comunicações", icon: Radio },
  { id: "engineering", name: "Engenharia", icon: Settings },
];

const MOCK_CREW: CrewMember[] = [
  {
    id: "1",
    name: "Carlos Eduardo Silva",
    rank: "Capitão",
    vessel: "MV Atlantic Star",
    department: "Deck",
    overallScore: 95,
    competencies: [
      { id: "1", name: "Navegação Astronômica", category: "nav", level: 5, required: 5, lastAssessed: new Date(2024, 0, 15), trend: "stable" },
      { id: "2", name: "ECDIS Avançado", category: "nav", level: 5, required: 4, lastAssessed: new Date(2024, 0, 15), trend: "up" },
      { id: "3", name: "Gestão de Ponte", category: "nav", level: 5, required: 5, lastAssessed: new Date(2024, 0, 15), trend: "stable" },
      { id: "4", name: "Combate a Incêndio", category: "fire", level: 4, required: 4, lastAssessed: new Date(2023, 10, 20), trend: "stable" },
      { id: "5", name: "Comunicações GMDSS", category: "comm", level: 5, required: 4, lastAssessed: new Date(2024, 0, 10), trend: "stable" },
    ],
    certifications: [
      { id: "1", name: "COC Master Unlimited", issueDate: new Date(2020, 5, 1), expiryDate: new Date(2025, 5, 1), status: "valid", isRequired: true },
      { id: "2", name: "GMDSS GOC", issueDate: new Date(2021, 3, 15), expiryDate: new Date(2024, 3, 15), status: "expiring", isRequired: true },
      { id: "3", name: "Advanced Fire Fighting", issueDate: new Date(2022, 8, 1), expiryDate: new Date(2027, 8, 1), status: "valid", isRequired: true },
    ],
  },
  {
    id: "2",
    name: "Maria Fernanda Santos",
    rank: "1º Oficial",
    vessel: "MV Atlantic Star",
    department: "Deck",
    overallScore: 88,
    competencies: [
      { id: "1", name: "Navegação Astronômica", category: "nav", level: 4, required: 4, lastAssessed: new Date(2024, 0, 10), trend: "up" },
      { id: "2", name: "ECDIS Avançado", category: "nav", level: 4, required: 4, lastAssessed: new Date(2024, 0, 10), trend: "up" },
      { id: "3", name: "Operações de Carga", category: "cargo", level: 4, required: 4, lastAssessed: new Date(2023, 11, 5), trend: "stable" },
      { id: "4", name: "Combate a Incêndio", category: "fire", level: 3, required: 4, lastAssessed: new Date(2023, 9, 15), trend: "down" },
    ],
    certifications: [
      { id: "1", name: "COC Chief Mate", issueDate: new Date(2021, 2, 1), expiryDate: new Date(2026, 2, 1), status: "valid", isRequired: true },
      { id: "2", name: "STCW Basic Safety", issueDate: new Date(2019, 6, 1), expiryDate: new Date(2024, 6, 1), status: "expiring", isRequired: true },
    ],
  },
  {
    id: "3",
    name: "Roberto Lima Costa",
    rank: "Chefe de Máquinas",
    vessel: "MV Atlantic Star",
    department: "Engine",
    overallScore: 92,
    competencies: [
      { id: "1", name: "Manutenção de Motor", category: "engineering", level: 5, required: 5, lastAssessed: new Date(2024, 0, 5), trend: "stable" },
      { id: "2", name: "Sistemas Elétricos", category: "engineering", level: 4, required: 4, lastAssessed: new Date(2023, 11, 20), trend: "stable" },
      { id: "3", name: "Automação", category: "engineering", level: 4, required: 3, lastAssessed: new Date(2023, 10, 10), trend: "up" },
      { id: "4", name: "Combate a Incêndio", category: "fire", level: 4, required: 4, lastAssessed: new Date(2023, 9, 1), trend: "stable" },
    ],
    certifications: [
      { id: "1", name: "COC Chief Engineer", issueDate: new Date(2018, 4, 1), expiryDate: new Date(2023, 4, 1), status: "expired", isRequired: true },
    ],
  },
];

export default function CompetencyMatrixPanel() {
  const [selectedCrew, setSelectedCrew] = useState<CrewMember | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  const filteredCrew = MOCK_CREW.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (departmentFilter === "all" || c.department.toLowerCase() === departmentFilter)
  );

  const getLevelColor = (level: number, required: number) => {
    if (level >= required) return "bg-green-500";
    if (level === required - 1) return "bg-amber-500";
    return "bg-red-500";
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500";
    if (score >= 75) return "text-amber-500";
    return "text-red-500";
  };

  const getCertStatusBadge = (status: Certification["status"]) => {
    switch (status) {
      case "valid":
        return <Badge className="bg-green-500/10 text-green-500">Válido</Badge>;
      case "expiring":
        return <Badge className="bg-amber-500/10 text-amber-500">Expirando</Badge>;
      case "expired":
        return <Badge className="bg-destructive/10 text-destructive">Expirado</Badge>;
    }
  };

  // Stats
  const totalCrew = MOCK_CREW.length;
  const avgScore = Math.round(MOCK_CREW.reduce((acc, c) => acc + c.overallScore, 0) / totalCrew);
  const expiringCerts = MOCK_CREW.flatMap((c) => c.certifications).filter((c) => c.status === "expiring").length;
  const gapCount = MOCK_CREW.flatMap((c) => c.competencies).filter((c) => c.level < c.required).length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tripulantes</p>
                <p className="text-2xl font-bold">{totalCrew}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Score Médio</p>
                <p className="text-2xl font-bold">{avgScore}%</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cert. Expirando</p>
                <p className="text-2xl font-bold">{expiringCerts}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gaps Identificados</p>
                <p className="text-2xl font-bold">{gapCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Crew List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Tripulação
            </CardTitle>
            <div className="flex gap-2 mt-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="deck">Deck</SelectItem>
                  <SelectItem value="engine">Engine</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <div className="space-y-2">
                {filteredCrew.map((crew) => (
                  <motion.div
                    key={crew.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedCrew(crew)}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedCrew?.id === crew.id
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {crew.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{crew.name}</p>
                        <p className="text-sm text-muted-foreground">{crew.rank}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-lg font-bold ${getScoreColor(crew.overallScore)}`}>
                          {crew.overallScore}%
                        </span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <Progress value={crew.overallScore} className="h-1.5" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Competency Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Matriz de Competências
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedCrew ? (
              <Tabs defaultValue="matrix">
                <TabsList className="mb-4">
                  <TabsTrigger value="matrix">Competências</TabsTrigger>
                  <TabsTrigger value="certs">Certificações</TabsTrigger>
                  <TabsTrigger value="training">Treinamentos</TabsTrigger>
                </TabsList>

                <TabsContent value="matrix">
                  <div className="space-y-6">
                    {COMPETENCY_CATEGORIES.map((category) => {
                      const competencies = selectedCrew.competencies.filter(
                        (c) => c.category === category.id
                      );
                      if (competencies.length === 0) return null;
                      
                      return (
                        <div key={category.id}>
                          <h4 className="font-medium flex items-center gap-2 mb-3">
                            <category.icon className="h-4 w-4" />
                            {category.name}
                          </h4>
                          <div className="space-y-3">
                            {competencies.map((comp) => (
                              <div key={comp.id} className="flex items-center gap-4 p-3 border rounded-lg">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium">{comp.name}</p>
                                    {comp.trend === "up" && <TrendingUp className="h-4 w-4 text-green-500" />}
                                    {comp.trend === "down" && <AlertTriangle className="h-4 w-4 text-amber-500" />}
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    Avaliado em {format(comp.lastAssessed, "dd/MM/yyyy")}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((level) => (
                                      <div
                                        key={level}
                                        className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-medium ${
                                          level <= comp.level
                                            ? getLevelColor(comp.level, comp.required) + " text-white"
                                            : "bg-muted text-muted-foreground"
                                        }`}
                                      >
                                        {level}
                                      </div>
                                    ))}
                                  </div>
                                  <span className="text-sm text-muted-foreground w-16">
                                    Req: {comp.required}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </TabsContent>

                <TabsContent value="certs">
                  <div className="space-y-3">
                    {selectedCrew.certifications.map((cert) => (
                      <div
                        key={cert.id}
                        className={`p-4 border rounded-lg ${
                          cert.status === "expired" ? "border-destructive/50 bg-destructive/5" :
                          cert.status === "expiring" ? "border-amber-500/50 bg-amber-500/5" :
                          ""
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <Award className="h-4 w-4" />
                              <p className="font-medium">{cert.name}</p>
                              {cert.isRequired && (
                                <Badge variant="outline" className="text-xs">Obrigatório</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <span>Emissão: {format(cert.issueDate, "dd/MM/yyyy")}</span>
                              <span>Validade: {format(cert.expiryDate, "dd/MM/yyyy")}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            {getCertStatusBadge(cert.status)}
                            {cert.status === "expiring" && (
                              <p className="text-xs text-amber-500 mt-1">
                                Expira em {differenceInDays(cert.expiryDate, new Date())} dias
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="training">
                  <div className="text-center py-12">
                    <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      Histórico de treinamentos disponível em breve
                    </p>
                    <Button variant="outline" className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Agendar Treinamento
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Selecione um tripulante para ver suas competências
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Gap Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Análise de Gaps
          </CardTitle>
          <CardDescription>
            Competências que precisam de desenvolvimento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {MOCK_CREW.flatMap((crew) =>
              crew.competencies
                .filter((c) => c.level < c.required)
                .map((comp) => ({
                  crew,
                  comp,
                  gap: comp.required - comp.level,
                }))
            )
              .sort((a, b) => b.gap - a.gap)
              .slice(0, 6)
              .map((item, index) => (
                <motion.div
                  key={`${item.crew.id}-${item.comp.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 border rounded-lg border-amber-500/30 bg-amber-500/5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{item.comp.name}</p>
                      <p className="text-sm text-muted-foreground">{item.crew.name}</p>
                    </div>
                    <Badge variant="outline" className="text-amber-500">
                      Gap: -{item.gap}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-sm">
                      Atual: <strong>{item.comp.level}</strong> / Requerido: <strong>{item.comp.required}</strong>
                    </span>
                    <Button size="sm" variant="outline">
                      <BookOpen className="h-4 w-4 mr-1" />
                      Treinar
                    </Button>
                  </div>
                </motion.div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
