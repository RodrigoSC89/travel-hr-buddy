/**
 * Crew Deployment Panel - Advanced Crew Management & Deployment
 * Painel de Gestão e Deployment de Tripulação
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Users,
  UserPlus,
  UserCheck,
  UserX,
  Ship,
  Calendar,
  Clock,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Search,
  Filter,
  Download,
  RefreshCw,
  ArrowRight,
  ArrowLeftRight,
  Plane,
  FileText,
  Award,
  Star,
  Heart,
  Phone,
  Mail,
  Globe,
  Shield,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { toast } from "sonner";

interface CrewMember {
  id: string;
  name: string;
  rank: string;
  department: string;
  status: "onboard" | "ashore" | "leave" | "training" | "medical";
  vessel?: string;
  joinDate?: Date;
  signOffDate?: Date;
  nationality: string;
  certifications: number;
  certificationsValid: number;
  performance: number;
  contractEnd: Date;
  nextRotation?: Date;
  contact: { phone: string; email: string };
  avatar?: string;
}

interface RotationPlan {
  id: string;
  crewMember: string;
  fromVessel?: string;
  toVessel: string;
  rotationType: "sign_on" | "sign_off" | "transfer";
  scheduledDate: Date;
  flightBooked: boolean;
  documentsReady: boolean;
  status: "pending" | "confirmed" | "in_transit" | "completed" | "cancelled";
}

export default function CrewDeploymentPanel() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");

  // Fetch crew data
  const { data: crewData = [], isLoading, refetch } = useQuery({
    queryKey: ["crew-deployment-data"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crew_members")
        .select("*")
        .order("full_name", { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 30000,
  });

  // Mock crew for UI demonstration
  const crew: CrewMember[] = [
    {
      id: "c1",
      name: "Carlos Eduardo Silva",
      rank: "Capitão",
      department: "Deck",
      status: "onboard",
      vessel: "MV Atlântico Sul",
      joinDate: new Date("2025-12-01"),
      signOffDate: new Date("2026-04-01"),
      nationality: "Brasil",
      certifications: 12,
      certificationsValid: 12,
      performance: 95,
      contractEnd: new Date("2027-12-31"),
      nextRotation: new Date("2026-04-01"),
      contact: { phone: "+55 13 99999-0001", email: "carlos.silva@nautilus.com" },
    },
    {
      id: "c2",
      name: "Maria Santos Costa",
      rank: "Chefe de Máquinas",
      department: "Engine",
      status: "onboard",
      vessel: "MV Atlântico Sul",
      joinDate: new Date("2025-11-15"),
      signOffDate: new Date("2026-03-15"),
      nationality: "Brasil",
      certifications: 15,
      certificationsValid: 14,
      performance: 92,
      contractEnd: new Date("2028-06-30"),
      nextRotation: new Date("2026-03-15"),
      contact: { phone: "+55 13 99999-0002", email: "maria.costa@nautilus.com" },
    },
    {
      id: "c3",
      name: "Pedro Oliveira",
      rank: "Imediato",
      department: "Deck",
      status: "ashore",
      nationality: "Portugal",
      certifications: 10,
      certificationsValid: 10,
      performance: 88,
      contractEnd: new Date("2026-12-31"),
      nextRotation: new Date("2026-02-15"),
      contact: { phone: "+351 91 234-5678", email: "pedro.oliveira@nautilus.com" },
    },
    {
      id: "c4",
      name: "Ana Luiza Ferreira",
      rank: "Oficial de Navegação",
      department: "Deck",
      status: "training",
      nationality: "Brasil",
      certifications: 8,
      certificationsValid: 8,
      performance: 90,
      contractEnd: new Date("2027-06-30"),
      contact: { phone: "+55 21 99888-7766", email: "ana.ferreira@nautilus.com" },
    },
    {
      id: "c5",
      name: "Roberto Lima",
      rank: "2º Engenheiro",
      department: "Engine",
      status: "leave",
      nationality: "Brasil",
      certifications: 9,
      certificationsValid: 8,
      performance: 85,
      contractEnd: new Date("2026-09-30"),
      nextRotation: new Date("2026-03-01"),
      contact: { phone: "+55 11 97654-3210", email: "roberto.lima@nautilus.com" },
    },
    {
      id: "c6",
      name: "João Mendes",
      rank: "Eletricista",
      department: "Engine",
      status: "medical",
      nationality: "Brasil",
      certifications: 6,
      certificationsValid: 5,
      performance: 78,
      contractEnd: new Date("2026-08-31"),
      contact: { phone: "+55 13 98765-4321", email: "joao.mendes@nautilus.com" },
    },
  ];

  const rotations: RotationPlan[] = [
    {
      id: "r1",
      crewMember: "Pedro Oliveira",
      toVessel: "MV Horizonte",
      rotationType: "sign_on",
      scheduledDate: new Date("2026-02-15"),
      flightBooked: true,
      documentsReady: true,
      status: "confirmed",
    },
    {
      id: "r2",
      crewMember: "Maria Santos Costa",
      fromVessel: "MV Atlântico Sul",
      toVessel: "",
      rotationType: "sign_off",
      scheduledDate: new Date("2026-03-15"),
      flightBooked: false,
      documentsReady: false,
      status: "pending",
    },
    {
      id: "r3",
      crewMember: "Roberto Lima",
      toVessel: "MV Oceano",
      rotationType: "sign_on",
      scheduledDate: new Date("2026-03-01"),
      flightBooked: true,
      documentsReady: false,
      status: "pending",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "onboard":
        return "bg-success/10 text-success border-success/20";
      case "ashore":
        return "bg-primary/10 text-primary border-primary/20";
      case "leave":
        return "bg-warning/10 text-warning border-warning/20";
      case "training":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "medical":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-muted";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "onboard":
        return "A Bordo";
      case "ashore":
        return "Em Terra";
      case "leave":
        return "Licença";
      case "training":
        return "Treinamento";
      case "medical":
        return "Médico";
      default:
        return status;
    }
  };

  const departments = ["all", "Deck", "Engine", "Catering", "Safety"];

  const filteredCrew = crew.filter(c => {
    const matchesDepartment = selectedDepartment === "all" || c.department === selectedDepartment;
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         c.rank.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDepartment && matchesSearch;
  });

  const crewStats = {
    onboard: crew.filter(c => c.status === "onboard").length,
    ashore: crew.filter(c => c.status === "ashore").length,
    leave: crew.filter(c => c.status === "leave").length,
    training: crew.filter(c => c.status === "training").length,
    medical: crew.filter(c => c.status === "medical").length,
    expiringCerts: crew.filter(c => c.certificationsValid < c.certifications).length,
  };

  const departmentData = [
    { name: "Deck", value: crew.filter(c => c.department === "Deck").length, color: "hsl(217, 91%, 60%)" },
    { name: "Engine", value: crew.filter(c => c.department === "Engine").length, color: "hsl(142, 71%, 45%)" },
    { name: "Catering", value: crew.filter(c => c.department === "Catering").length, color: "hsl(280, 87%, 65%)" },
    { name: "Safety", value: crew.filter(c => c.department === "Safety").length, color: "hsl(38, 92%, 50%)" },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <UserCheck className="h-4 w-4 text-success" />
              <span className="text-xs text-muted-foreground">A Bordo</span>
            </div>
            <p className="text-2xl font-bold text-success">{crewStats.onboard}</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Em Terra</span>
            </div>
            <p className="text-2xl font-bold text-primary">{crewStats.ashore}</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-4 w-4 text-warning" />
              <span className="text-xs text-muted-foreground">Licença</span>
            </div>
            <p className="text-2xl font-bold text-warning">{crewStats.leave}</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Award className="h-4 w-4 text-purple-500" />
              <span className="text-xs text-muted-foreground">Treinamento</span>
            </div>
            <p className="text-2xl font-bold text-purple-500">{crewStats.training}</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Heart className="h-4 w-4 text-destructive" />
              <span className="text-xs text-muted-foreground">Médico</span>
            </div>
            <p className="text-2xl font-bold text-destructive">{crewStats.medical}</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <span className="text-xs text-muted-foreground">Certs. Vencendo</span>
            </div>
            <p className="text-2xl font-bold text-warning">{crewStats.expiringCerts}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar tripulante..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {departments.map(dept => (
            <Button
              key={dept}
              variant={selectedDepartment === dept ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedDepartment(dept)}
            >
              {dept === "all" ? "Todos" : dept}
            </Button>
          ))}
        </div>
        <div className="flex gap-2 ml-auto">
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
          <Button size="sm" className="gap-2">
            <UserPlus className="h-4 w-4" />
            Adicionar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Crew List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Tripulação ({filteredCrew.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {filteredCrew.map((member, idx) => (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback>
                            {member.name.split(" ").map(n => n[0]).join("").substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium">{member.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {member.rank} • {member.department}
                              </p>
                            </div>
                            <Badge variant="outline" className={getStatusColor(member.status)}>
                              {getStatusLabel(member.status)}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3 text-xs">
                            {member.vessel && (
                              <div className="flex items-center gap-1">
                                <Ship className="h-3 w-3 text-muted-foreground" />
                                <span>{member.vessel}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Globe className="h-3 w-3 text-muted-foreground" />
                              <span>{member.nationality}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Award className="h-3 w-3 text-muted-foreground" />
                              <span className={member.certificationsValid < member.certifications ? "text-warning" : ""}>
                                {member.certificationsValid}/{member.certifications} certs
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-warning" />
                              <span>{member.performance}%</span>
                            </div>
                          </div>

                          {member.nextRotation && (
                            <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                              <ArrowLeftRight className="h-3 w-3" />
                              <span>Próxima rotação: {member.nextRotation.toLocaleDateString("pt-BR")}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Rotations & Stats */}
        <div className="space-y-6">
          {/* Upcoming Rotations */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ArrowLeftRight className="h-4 w-4" />
                Próximas Rotações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {rotations.map((rotation) => (
                  <div key={rotation.id} className="p-3 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{rotation.crewMember}</span>
                      <Badge variant="secondary" className="text-xs">
                        {rotation.rotationType === "sign_on" ? "Embarque" :
                         rotation.rotationType === "sign_off" ? "Desembarque" : "Transferência"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <Ship className="h-3 w-3" />
                      {rotation.fromVessel && (
                        <>
                          <span>{rotation.fromVessel}</span>
                          <ArrowRight className="h-3 w-3" />
                        </>
                      )}
                      <span>{rotation.toVessel || "Terra"}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        {rotation.scheduledDate.toLocaleDateString("pt-BR")}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className={rotation.flightBooked ? "text-success" : "text-warning"}>
                          <Plane className="h-3 w-3" />
                        </span>
                        <span className={rotation.documentsReady ? "text-success" : "text-warning"}>
                          <FileText className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-3 gap-2" size="sm">
                Ver Todas
                <ArrowRight className="h-3 w-3" />
              </Button>
            </CardContent>
          </Card>

          {/* Department Distribution */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Por Departamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[150px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={departmentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {departmentData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {departmentData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2 text-xs">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span>{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
