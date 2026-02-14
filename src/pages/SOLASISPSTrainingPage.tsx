/**
 * SOLAS, ISPS & ISM Training - REAL DATA from Supabase: academy_courses, academy_progress, certificates, smart_drills
 */
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Shield, BookOpen, Award, Users, Clock, CheckCircle2, AlertTriangle, Play, FileText, Download, Target, Loader2 } from "lucide-react";

export default function SOLASISPSTrainingPage() {
  const [selectedTab, setSelectedTab] = useState("courses");

  const { data: courses, isLoading } = useQuery({
    queryKey: ["solas-isps-courses"],
    queryFn: async () => {
      const { data, error } = await supabase.from("academy_courses").select("*").order("course_name");
      if (error) throw error;
      return data || [];
    },
  });

  const { data: progressData } = useQuery({
    queryKey: ["solas-progress"],
    queryFn: async () => {
      const { data, error } = await supabase.from("academy_progress").select("*").limit(100);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: certificates } = useQuery({
    queryKey: ["solas-certificates"],
    queryFn: async () => {
      const { data, error } = await supabase.from("certificates").select("*").or("certificate_type.ilike.%STCW%,certificate_type.ilike.%SOLAS%,certificate_type.ilike.%ISPS%").limit(50);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: drills } = useQuery({
    queryKey: ["solas-drills"],
    queryFn: async () => {
      const { data, error } = await supabase.from("smart_drills").select("*").order("created_at", { ascending: false }).limit(20);
      if (error) throw error;
      return data || [];
    },
  });

  const totalCourses = courses?.length || 0;
  const completedProgress = progressData?.filter((p) => p.status === "completed").length || 0;
  const inProgressCount = progressData?.filter((p) => p.status === "in_progress").length || 0;
  const complianceRate = totalCourses > 0 ? Math.round(((completedProgress) / Math.max(totalCourses, 1)) * 100) : 0;
  const certCount = certificates?.length || 0;

  const getStatusColor = (status: string) => status === "completed" ? "bg-success" : status === "in_progress" ? "bg-info" : "bg-warning";
  const getStatusText = (status: string) => status === "completed" ? "Concluído" : status === "in_progress" ? "Em Andamento" : "Pendente";

  if (isLoading) return <div className="flex items-center justify-center h-96"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-destructive/20 rounded-xl"><Shield className="h-8 w-8 text-destructive" /></div>
          <div><h1 className="text-2xl font-bold flex items-center gap-2">SOLAS, ISPS & ISM Training<Badge variant="secondary" className="bg-destructive/20 text-destructive">IMO Compliance</Badge></h1><p className="text-muted-foreground">Treinamentos obrigatórios de segurança marítima internacional</p></div>
        </div>
        <div className="flex gap-2"><Button variant="outline" className="gap-2"><FileText className="h-4 w-4" />Relatório</Button><Button className="gap-2"><Play className="h-4 w-4" />Novo Treinamento</Button></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Total Cursos</p><p className="text-3xl font-bold">{totalCourses}</p></div><BookOpen className="h-10 w-10 text-muted-foreground/30" /></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Concluídos</p><p className="text-3xl font-bold text-success">{completedProgress}</p></div><CheckCircle2 className="h-10 w-10 text-success/30" /></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Em Andamento</p><p className="text-3xl font-bold text-info">{inProgressCount}</p></div><Clock className="h-10 w-10 text-info/30" /></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Compliance</p><p className="text-3xl font-bold text-primary">{complianceRate}%</p></div><Target className="h-10 w-10 text-primary/30" /></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Certificados</p><p className="text-3xl font-bold">{certCount}</p></div><Award className="h-10 w-10 text-muted-foreground/30" /></div></CardContent></Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList><TabsTrigger value="courses">Cursos</TabsTrigger><TabsTrigger value="certifications">Certificações</TabsTrigger><TabsTrigger value="drills">Simulados</TabsTrigger></TabsList>

        <TabsContent value="courses" className="space-y-4">
          <Card><CardHeader><CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5" />Cursos</CardTitle></CardHeader>
            <CardContent><div className="space-y-4">
              {(courses || []).map((course: any) => (
                <div key={course.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1"><h3 className="font-medium">{course.course_name}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {course.duration_hours && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{course.duration_hours}h</span>}
                      </div>
                    </div>
                    <Badge className={course.is_published ? "bg-success" : "bg-warning"}>{course.is_published ? "Publicado" : "Rascunho"}</Badge>
                  </div>
                  {course.course_description && <p className="text-sm text-muted-foreground">{course.course_description}</p>}
                </div>
              ))}
              {(!courses || courses.length === 0) && <p className="text-muted-foreground text-center py-8">Nenhum curso cadastrado</p>}
            </div></CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certifications" className="space-y-4">
          <Card><CardHeader><CardTitle className="flex items-center gap-2"><Award className="h-5 w-5" />Certificações STCW</CardTitle></CardHeader>
            <CardContent><div className="space-y-4">
              {(certificates || []).map((cert: any) => (
                <div key={cert.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Award className={`h-8 w-8 ${cert.status === "active" ? "text-success" : "text-warning"}`} />
                    <div><h3 className="font-medium">{cert.certificate_type}</h3><p className="text-sm text-muted-foreground">{cert.certificate_number || "N/A"}</p></div>
                  </div>
                  <div className="text-right">
                    <Badge className={cert.status === "active" ? "bg-success" : "bg-warning"}>{cert.status === "active" ? "Válido" : cert.status}</Badge>
                    {cert.expiry_date && <p className="text-sm text-muted-foreground mt-1">Expira: {new Date(cert.expiry_date).toLocaleDateString("pt-BR")}</p>}
                  </div>
                </div>
              ))}
              {(!certificates || certificates.length === 0) && <p className="text-muted-foreground text-center py-8">Nenhum certificado encontrado</p>}
            </div></CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drills" className="space-y-4">
          <Card><CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5" />Simulados de Emergência</CardTitle></CardHeader>
            <CardContent><div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(drills || []).map((drill: any) => (
                <div key={drill.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2"><h3 className="font-medium">{drill.drill_name || drill.drill_type}</h3><Badge variant="outline">{drill.frequency || "N/A"}</Badge></div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    {drill.total_executions > 0 && <p>Execuções: {drill.total_executions}</p>}
                    {drill.average_score && <p>Score médio: {drill.average_score}%</p>}
                  </div>
                  <Button size="sm" variant="outline" className="mt-3 w-full gap-2"><Play className="h-4 w-4" />Agendar Simulado</Button>
                </div>
              ))}
              {(!drills || drills.length === 0) && <p className="text-muted-foreground text-center py-8">Nenhum simulado registrado</p>}
            </div></CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
