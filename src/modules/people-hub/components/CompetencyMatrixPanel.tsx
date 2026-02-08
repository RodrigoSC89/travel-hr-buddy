/**
 * Competency Matrix Panel - Matriz de Competências STCW
 * ✅ Integrado com Supabase - Zero Mock
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
  GraduationCap, Award, Users, Search, Filter, CheckCircle2,
  AlertTriangle, Clock, TrendingUp, Star, Target, BookOpen,
  Calendar, Download, Plus, RefreshCw, Shield, Anchor,
  Navigation, Settings, Radio, Flame, Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const COMPETENCY_CATEGORIES = [
  { id: "nav", name: "Navegação", icon: Navigation },
  { id: "safety", name: "Segurança", icon: Shield },
  { id: "cargo", name: "Carga", icon: Anchor },
  { id: "fire", name: "Combate a Incêndio", icon: Flame },
  { id: "comm", name: "Comunicações", icon: Radio },
  { id: "engineering", name: "Engenharia", icon: Settings },
];

export default function CompetencyMatrixPanel() {
  const [selectedCrewId, setSelectedCrewId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  // Fetch crew members
  const { data: crewMembers = [], isLoading } = useQuery({
    queryKey: ["competency-crew"],
    queryFn: async () => {
      const { data } = await supabase
        .from("crew_members")
        .select("id, full_name, position, vessel_id, status")
        .eq("status", "active")
        .order("full_name");
      return data || [];
    },
  });

  // Fetch certificates (uses employee_id, not crew_member_id)
  const { data: certificates = [] } = useQuery({
    queryKey: ["competency-certificates"],
    queryFn: async () => {
      const { data } = await supabase
        .from("certificates")
        .select("id, employee_id, certificate_type, certificate_number, issue_date, expiry_date, status")
        .order("expiry_date", { ascending: true });
      return data || [];
    },
  });

  // Fetch training records
  const { data: trainings = [] } = useQuery({
    queryKey: ["competency-training"],
    queryFn: async () => {
      const { data } = await supabase
        .from("training_records")
        .select("id, crew_member_id, training_name, start_date, end_date, score, status, training_type")
        .order("start_date", { ascending: false })
        .limit(100);
      return data || [];
    },
  });

  // Build crew data with computed scores
  const crewWithScores = crewMembers.map((crew) => {
    const crewCerts = certificates.filter((c) => c.employee_id === crew.id);
    const crewTrainings = trainings.filter((t) => t.crew_member_id === crew.id);
    const validCerts = crewCerts.filter((c) => c.status === "active" || c.status === "valid").length;
    const totalCerts = crewCerts.length;
    const avgTrainingScore = crewTrainings.length > 0
      ? Math.round(crewTrainings.reduce((acc, t) => acc + (t.score || 80), 0) / crewTrainings.length)
      : 80;
    const overallScore = totalCerts > 0
      ? Math.round((validCerts / Math.max(totalCerts, 1)) * 50 + avgTrainingScore * 0.5)
      : avgTrainingScore;

    return {
      id: crew.id,
      full_name: crew.full_name,
      position: crew.position,
      department: "",
      vessel_id: crew.vessel_id,
      overallScore: Math.min(100, overallScore),
      certifications: crewCerts,
      trainings: crewTrainings,
    };
  });

  const filteredCrew = crewWithScores.filter(
    (c) =>
      c.full_name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (departmentFilter === "all" || (c.department || "").toLowerCase() === departmentFilter)
  );

  const selectedCrew = crewWithScores.find((c) => c.id === selectedCrewId) || null;

  // Stats
  const totalCrew = crewWithScores.length;
  const avgScore = totalCrew > 0 ? Math.round(crewWithScores.reduce((acc, c) => acc + c.overallScore, 0) / totalCrew) : 0;
  const expiringCerts = certificates.filter((c) => {
    const days = differenceInDays(new Date(c.expiry_date), new Date());
    return days > 0 && days <= 90;
  }).length;
  const expiredCerts = certificates.filter((c) => c.status === "expired").length;

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500";
    if (score >= 75) return "text-amber-500";
    return "text-red-500";
  };

  const getCertStatusBadge = (cert: { expiry_date: string; status: string | null }) => {
    const days = differenceInDays(new Date(cert.expiry_date), new Date());
    if (days < 0) return <Badge className="bg-destructive/10 text-destructive">Expirado</Badge>;
    if (days <= 90) return <Badge className="bg-amber-500/10 text-amber-500">Expirando ({days}d)</Badge>;
    return <Badge className="bg-green-500/10 text-green-500">Válido</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-muted-foreground">Tripulantes</p><p className="text-2xl font-bold">{totalCrew}</p></div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-muted-foreground">Score Médio</p><p className="text-2xl font-bold">{avgScore}%</p></div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-muted-foreground">Cert. Expirando</p><p className="text-2xl font-bold">{expiringCerts}</p></div>
              <Clock className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-muted-foreground">Cert. Expirados</p><p className="text-2xl font-bold">{expiredCerts}</p></div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Crew List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />Tripulação</CardTitle>
            <div className="flex gap-2 mt-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="deck">Deck</SelectItem>
                  <SelectItem value="engine">Engine</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-32"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : filteredCrew.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Nenhum tripulante encontrado</p>
              </div>
            ) : (
              <ScrollArea className="h-[500px]">
                <div className="space-y-2">
                  {filteredCrew.map((crew) => (
                    <motion.div key={crew.id} whileHover={{ scale: 1.02 }} onClick={() => setSelectedCrewId(crew.id)}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedCrewId === crew.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}>
                      <div className="flex items-center gap-3">
                        <Avatar><AvatarFallback>{crew.full_name.split(" ").map((n) => n[0]).slice(0, 2).join("")}</AvatarFallback></Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{crew.full_name}</p>
                          <p className="text-sm text-muted-foreground">{crew.position}</p>
                        </div>
                        <span className={`text-lg font-bold ${getScoreColor(crew.overallScore)}`}>{crew.overallScore}%</span>
                      </div>
                      <Progress value={crew.overallScore} className="h-1.5 mt-2" />
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Details */}
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="flex items-center gap-2"><GraduationCap className="h-5 w-5" />Detalhes de Competência</CardTitle></CardHeader>
          <CardContent>
            {selectedCrew ? (
              <Tabs defaultValue="certs">
                <TabsList className="mb-4">
                  <TabsTrigger value="certs">Certificações ({selectedCrew.certifications.length})</TabsTrigger>
                  <TabsTrigger value="training">Treinamentos ({selectedCrew.trainings.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="certs">
                  {selectedCrew.certifications.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Award className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Nenhuma certificação registrada</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedCrew.certifications.map((cert) => (
                        <div key={cert.id} className={`p-4 border rounded-lg ${cert.status === "expired" ? "border-destructive/50 bg-destructive/5" : ""}`}>
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <Award className="h-4 w-4" />
                                <p className="font-medium">{cert.certificate_type}</p>
                              </div>
                              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                {cert.issue_date && <span>Emissão: {format(new Date(cert.issue_date), "dd/MM/yyyy")}</span>}
                                {cert.expiry_date && <span>Validade: {format(new Date(cert.expiry_date), "dd/MM/yyyy")}</span>}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">Nº: {cert.certificate_number}</p>
                            </div>
                            {getCertStatusBadge(cert)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="training">
                  {selectedCrew.trainings.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Nenhum treinamento registrado</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedCrew.trainings.map((training) => (
                        <div key={training.id} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium">{training.training_name}</p>
                              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                {training.end_date && <span>{format(new Date(training.end_date), "dd/MM/yyyy")}</span>}
                                {training.training_type && <Badge variant="outline">{training.training_type}</Badge>}
                              </div>
                            </div>
                            {training.score != null && (
                              <span className={`text-lg font-bold ${getScoreColor(training.score)}`}>{training.score}%</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <GraduationCap className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg">Selecione um tripulante</p>
                <p className="text-sm">Clique em um membro da tripulação para ver suas competências</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
