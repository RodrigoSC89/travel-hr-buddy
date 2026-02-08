/**
 * DEBT-FIX: Removed (supabase as any) - course_enrollments → academy_progress,
 * certifications → crew_certifications
 */

import React, { useState, useEffect } from "react";
import { logger } from "@/lib/logger";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, Award, TrendingUp, Users, CheckCircle, Clock, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";

interface CourseProgress {
  id: string;
  course_id: string | null;
  user_id: string | null;
  status: string | null;
  progress_percent: number | null;
  current_module: number | null;
  started_at: string | null;
  completed_at: string | null;
}

interface Certificate {
  id: string;
  crew_member_id: string | null;
  certification_type: string;
  certificate_number: string | null;
  issue_date: string | null;
  expiry_date: string | null;
  status: string | null;
}

export default function TrainingAcademyEnhanced() {
  const { toast } = useToast();
  const [courseProgress, setCourseProgress] = useState<CourseProgress[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    
    const progressChannel = supabase
      .channel("course-progress-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "academy_progress" }, (payload) => {
        if (payload.eventType === "UPDATE") {
          setCourseProgress(prev => 
            prev.map(cp => cp.id === payload.new.id ? {...cp, ...payload.new} : cp)
          );
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(progressChannel);
    };
  }, []);

  const loadData = async () => {
    try {
      // Use typed tables: academy_progress and crew_certifications
      const [progressData, certificatesData] = await Promise.all([
        supabase
          .from("academy_progress")
          .select("*")
          .order("started_at", { ascending: false })
          .limit(100),
        supabase
          .from("crew_certifications")
          .select("*")
          .order("issue_date", { ascending: false })
          .limit(100),
      ]);

      if (progressData.error) throw progressData.error;
      if (certificatesData.error) throw certificatesData.error;

      setCourseProgress((progressData.data || []) as CourseProgress[]);
      setCertificates((certificatesData.data || []) as Certificate[]);
    } catch (error) {
      logger.error("Error loading data:", error);
      toast({
        title: "Erro",
        description: "Falha ao carregar dados",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadCertificatePDF = (certificate: Certificate) => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4"
    });

    doc.setDrawColor(0, 51, 102);
    doc.setLineWidth(5);
    doc.rect(10, 10, 277, 190);

    doc.setFontSize(40);
    doc.setTextColor(0, 51, 102);
    doc.text("CERTIFICADO", 148.5, 50, { align: "center" });

    doc.setFontSize(16);
    doc.setTextColor(100, 100, 100);
    doc.text("DE CONCLUSÃO", 148.5, 65, { align: "center" });

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("Certificamos que", 148.5, 85, { align: "center" });

    doc.setFontSize(20);
    doc.setTextColor(0, 51, 102);
    doc.text("[Nome do Aluno]", 148.5, 100, { align: "center" });

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("concluiu com êxito o curso", 148.5, 115, { align: "center" });

    doc.setFontSize(18);
    doc.setTextColor(0, 51, 102);
    doc.text(certificate.certificate_type, 148.5, 130, { align: "center" });

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Certificado Nº: ${certificate.certificate_number || "N/A"}`, 148.5, 160, { align: "center" });
    if (certificate.issue_date) {
      doc.text(`Data de Emissão: ${new Date(certificate.issue_date).toLocaleDateString("pt-BR")}`, 148.5, 168, { align: "center" });
    }
    if (certificate.expiry_date) {
      doc.text(`Válido até: ${new Date(certificate.expiry_date).toLocaleDateString("pt-BR")}`, 148.5, 176, { align: "center" });
    }

    doc.setFontSize(8);
    doc.text("Training Academy - Sistema de Gestão de Treinamentos", 148.5, 190, { align: "center" });

    doc.save(`certificate-${certificate.certificate_number || certificate.id}.pdf`);
    
    toast({
      title: "Download Concluído",
      description: "Certificado baixado com sucesso"
    });
  };

  const updateProgress = async (enrollmentId: string, progress: number) => {
    try {
      const { error } = await supabase
        .from("academy_progress")
        .update({
          progress_percent: progress,
          ...(progress >= 100 && { 
            status: "completed",
            completed_at: new Date().toISOString()
          })
        })
        .eq("id", enrollmentId);

      if (error) throw error;

      toast({
        title: "Progresso Atualizado",
        description: `Progresso salvo: ${progress}%`
      });
    } catch (error) {
      logger.error("Error updating progress:", error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar progresso",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
    case "completed": return "default";
    case "in_progress": return "secondary";
    case "not_started": return "outline";
    default: return "outline";
    }
  };

  const inProgressCount = courseProgress.filter(cp => cp.status === "in_progress").length;
  const completedCount = courseProgress.filter(cp => cp.status === "completed").length;
  const avgProgress = courseProgress.length > 0
    ? courseProgress.reduce((sum, cp) => sum + (cp.progress_percent || 0), 0) / courseProgress.length
    : 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BookOpen className="h-8 w-8" />
            Training Academy - Gestão Avançada
          </h1>
          <p className="text-muted-foreground mt-1">
            Acompanhamento de progresso, certificações e histórico de aprendizado
          </p>
        </div>
        <Button onClick={loadData}>
          Atualizar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Em Progresso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressCount}</div>
            <p className="text-xs text-muted-foreground">cursos ativos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Concluídos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedCount}</div>
            <p className="text-xs text-muted-foreground">cursos finalizados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Award className="h-4 w-4" />
              Certificados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{certificates.length}</div>
            <p className="text-xs text-muted-foreground">certificados emitidos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Progresso Médio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(avgProgress)}%</div>
            <Progress value={avgProgress} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="progress">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="progress">Progresso de Cursos</TabsTrigger>
          <TabsTrigger value="certificates">Certificados</TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Progresso dos Alunos</CardTitle>
              <CardDescription>
                Acompanhamento em tempo real do progresso dos cursos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {courseProgress.map((progress) => (
                    <Card key={progress.id}>
                      <CardContent className="pt-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold">Curso #{progress.course_id?.slice(0, 8) || "N/A"}</h3>
                              <p className="text-sm text-muted-foreground">
                                Módulo atual: {progress.current_module || 0}
                              </p>
                            </div>
                            <Badge variant={getStatusColor(progress.status) as any}>
                              {progress.status || "unknown"}
                            </Badge>
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">
                                Progresso: {Math.round(progress.progress_percent || 0)}%
                              </span>
                            </div>
                            <Progress value={progress.progress_percent || 0} />
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            {progress.started_at && (
                              <span>📅 Início: {new Date(progress.started_at).toLocaleDateString("pt-BR")}</span>
                            )}
                            {progress.completed_at && (
                              <span>✅ Concluído em {new Date(progress.completed_at).toLocaleDateString("pt-BR")}</span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certificates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Certificados Emitidos</CardTitle>
              <CardDescription>
                Todos os certificados gerados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {certificates.map((cert) => (
                    <Card key={cert.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <Award className="h-5 w-5 text-yellow-600" />
                              <h3 className="font-semibold">{cert.certificate_type}</h3>
                            </div>
                            <div className="space-y-1 text-sm">
                              <p><strong>Certificado:</strong> {cert.certificate_number || "N/A"}</p>
                              {cert.issue_date && (
                                <p><strong>Emissão:</strong> {new Date(cert.issue_date).toLocaleDateString("pt-BR")}</p>
                              )}
                              {cert.expiry_date && (
                                <p><strong>Validade:</strong> {new Date(cert.expiry_date).toLocaleDateString("pt-BR")}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={cert.status === "active" ? "default" : "secondary"}>
                                {cert.status === "active" ? "Válido" : cert.status || "Desconhecido"}
                              </Badge>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadCertificatePDF(cert)}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            PDF
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
