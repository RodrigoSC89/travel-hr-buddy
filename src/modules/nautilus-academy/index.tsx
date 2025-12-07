import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { GraduationCap, LayoutDashboard, BookOpen, Users, Award, Brain, Search, Plus, RefreshCw, CheckCircle2, Clock, AlertTriangle, Play, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AcademyDashboard from "./components/AcademyDashboard";

interface Course {
  id: string;
  course_name: string;
  course_description: string | null;
  duration_hours: number | null;
  is_published: boolean | null;
}

interface CrewMember {
  id: string;
  full_name: string;
  position: string;
  status: string | null;
}

interface Certificate {
  id: string;
  certificate_name: string;
  employee_id: string;
  expiry_date: string;
  status: string | null;
}

export default function NautilusAcademy() {
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [coursesRes, crewRes, certsRes] = await Promise.all([
        supabase.from("academy_courses").select("*").order("created_at", { ascending: false }).limit(20),
        supabase.from("crew_members").select("id, full_name, position, status").limit(50),
        supabase.from("employee_certificates").select("*").order("expiry_date", { ascending: true }).limit(50)
      ]);

      // Set courses with demo fallback
      if (coursesRes.data && coursesRes.data.length > 0) {
        setCourses(coursesRes.data);
      } else {
        setCourses([
          { id: "1", course_name: "Segurança Marítima STCW", course_description: "Treinamento completo em segurança marítima conforme STCW", duration_hours: 40, is_published: true },
          { id: "2", course_name: "Operações de Posicionamento Dinâmico", course_description: "Fundamentos e práticas avançadas de DP", duration_hours: 80, is_published: true },
          { id: "3", course_name: "MARPOL Compliance 2024", course_description: "Atualização sobre regulamentações ambientais marítimas", duration_hours: 16, is_published: true },
          { id: "4", course_name: "Combate a Incêndio Avançado", course_description: "Técnicas avançadas de combate a incêndio em embarcações", duration_hours: 24, is_published: true },
          { id: "5", course_name: "Primeiros Socorros Marítimos", course_description: "Atendimento de emergências médicas a bordo", duration_hours: 20, is_published: true }
        ]);
      }

      // Set crew with demo fallback
      if (crewRes.data && crewRes.data.length > 0) {
        setCrewMembers(crewRes.data);
      } else {
        setCrewMembers([
          { id: "1", full_name: "João Silva", position: "Comandante", status: "active" },
          { id: "2", full_name: "Maria Santos", position: "1º Oficial", status: "active" },
          { id: "3", full_name: "Carlos Oliveira", position: "Engenheiro Chefe", status: "active" },
          { id: "4", full_name: "Ana Costa", position: "Oficial de Segurança", status: "on_leave" }
        ]);
      }

      // Set certificates with demo fallback
      if (certsRes.data && certsRes.data.length > 0) {
        setCertificates(certsRes.data);
      } else {
        const today = new Date();
        setCertificates([
          { id: "1", certificate_name: "STCW Basic Safety", employee_id: "1", expiry_date: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(), status: "expiring" },
          { id: "2", certificate_name: "DP Certificate Class 2", employee_id: "2", expiry_date: new Date(today.getTime() + 180 * 24 * 60 * 60 * 1000).toISOString(), status: "valid" },
          { id: "3", certificate_name: "Medical First Aid", employee_id: "3", expiry_date: new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString(), status: "expiring" }
        ]);
      }
    } catch (error) {
      console.error("Error loading academy data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getExpiryStatus = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry <= 0) return { status: "expired", color: "destructive", label: "Vencido" };
    if (daysUntilExpiry <= 30) return { status: "critical", color: "destructive", label: `${daysUntilExpiry} dias` };
    if (daysUntilExpiry <= 90) return { status: "warning", color: "default", label: `${daysUntilExpiry} dias` };
    return { status: "valid", color: "secondary", label: "Válido" };
  };

  const filteredCourses = courses.filter(c => 
    c.course_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.course_description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                <GraduationCap className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  Nautilus Academy
                  <Badge variant="secondary" className="ml-2">
                    <Brain className="h-3 w-3 mr-1" />
                    AI-Powered
                  </Badge>
                </h1>
                <p className="text-muted-foreground">
                  Gestão inteligente de treinamentos e certificações marítimas
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={loadData} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Atualizar
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-5">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="courses" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Cursos</span>
            </TabsTrigger>
            <TabsTrigger value="crew" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Tripulação</span>
            </TabsTrigger>
            <TabsTrigger value="certifications" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              <span className="hidden sm:inline">Certificações</span>
            </TabsTrigger>
            <TabsTrigger value="ai-generator" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">AI Generator</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <AcademyDashboard />
          </TabsContent>

          <TabsContent value="courses">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Buscar cursos..." 
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Curso
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCourses.map((course) => (
                  <Card key={course.id} className="hover:border-primary/50 transition-colors">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{course.course_name}</CardTitle>
                          <CardDescription className="line-clamp-2 mt-1">
                            {course.course_description || "Sem descrição"}
                          </CardDescription>
                        </div>
                        <Badge variant={course.is_published ? "default" : "secondary"}>
                          {course.is_published ? "Publicado" : "Rascunho"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {course.duration_hours || 0}h
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          4.8
                        </span>
                      </div>
                      <Button className="w-full" variant="outline">
                        <Play className="h-4 w-4 mr-2" />
                        Iniciar Curso
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="crew">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {crewMembers.map((member) => (
                  <Card key={member.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {member.full_name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{member.full_name}</p>
                          <p className="text-sm text-muted-foreground">{member.position}</p>
                        </div>
                        <Badge variant={member.status === "active" ? "default" : "secondary"}>
                          {member.status === "active" ? "Ativo" : "Licença"}
                        </Badge>
                      </div>
                      <div className="mt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progresso Geral</span>
                          <span>75%</span>
                        </div>
                        <Progress value={75} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="certifications">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="border-l-4 border-l-green-500">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Certificações Válidas</p>
                    <p className="text-2xl font-bold text-green-600">
                      {certificates.filter(c => getExpiryStatus(c.expiry_date).status === "valid").length}
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-amber-500">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Vencendo em 90 dias</p>
                    <p className="text-2xl font-bold text-amber-600">
                      {certificates.filter(c => ["warning", "critical"].includes(getExpiryStatus(c.expiry_date).status)).length}
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-red-500">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Vencidas</p>
                    <p className="text-2xl font-bold text-red-600">
                      {certificates.filter(c => getExpiryStatus(c.expiry_date).status === "expired").length}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Certificações da Tripulação</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {certificates.map((cert) => {
                      const expiry = getExpiryStatus(cert.expiry_date);
                      const member = crewMembers.find(m => m.id === cert.employee_id);
                      return (
                        <div key={cert.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Award className={`h-5 w-5 ${expiry.status === "valid" ? "text-green-500" : expiry.status === "expired" ? "text-red-500" : "text-amber-500"}`} />
                            <div>
                              <p className="font-medium">{cert.certificate_name}</p>
                              <p className="text-sm text-muted-foreground">{member?.full_name || "Tripulante"}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={expiry.color as "default" | "secondary" | "destructive"}>
                              {expiry.label}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(cert.expiry_date).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="ai-generator">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-purple-500/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    Gerador de Cursos com IA
                  </CardTitle>
                  <CardDescription>
                    Crie treinamentos automaticamente baseados em gaps de auditoria, incidentes ou temas personalizados
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    <Button variant="outline" className="h-auto py-3 flex-col gap-1">
                      <AlertTriangle className="h-5 w-5 text-amber-500" />
                      <span className="text-xs">Gap de Auditoria</span>
                    </Button>
                    <Button variant="outline" className="h-auto py-3 flex-col gap-1">
                      <Clock className="h-5 w-5 text-red-500" />
                      <span className="text-xs">Incidente</span>
                    </Button>
                    <Button variant="outline" className="h-auto py-3 flex-col gap-1">
                      <BookOpen className="h-5 w-5 text-blue-500" />
                      <span className="text-xs">Personalizado</span>
                    </Button>
                  </div>
                  <Input placeholder="Descreva o tema do treinamento..." />
                  <Button className="w-full">
                    <Brain className="h-4 w-4 mr-2" />
                    Gerar Curso com IA
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cursos Gerados por IA</CardTitle>
                  <CardDescription>Últimos treinamentos criados automaticamente</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-xs">IA</Badge>
                        <span className="font-medium">Procedimentos de Emergência</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Baseado em incidente #2024-089</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-xs">IA</Badge>
                        <span className="font-medium">Renovação STCW 2024</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Gap identificado em auditoria PEOTRAM</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-xs">IA</Badge>
                        <span className="font-medium">MARPOL Atualização</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Novas regulamentações ambientais</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
