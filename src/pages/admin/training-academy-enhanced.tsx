import { useEffect, useState, useCallback } from "react";;
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
  course_id: string;
  user_id: string;
  enrollment_status: string;
  overall_progress_percentage: number;
  average_score: number;
  time_spent_minutes: number;
  last_accessed_at: string;
  completed_at: string;
  courses: {
    title: string;
    category: string;
    estimated_duration_hours: number;
  };
}

interface Certificate {
  id: string;
  user_id: string;
  course_id: string;
  certificate_number: string;
  issue_date: string;
  expiry_date: string;
  is_valid: boolean;
  courses: {
    title: string;
  };
}

interface UserLearningHistory {
  user_id: string;
  user_email: string;
  total_courses: number;
  completed_courses: number;
  total_time_hours: number;
  avg_score: number;
  certificates: number;
}

export default function TrainingAcademyEnhanced() {
  const { toast } = useToast();
  const [courseProgress, setCourseProgress] = useState<CourseProgress[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [learningHistory, setLearningHistory] = useState<UserLearningHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    
    // Real-time progress tracking
    const progressChannel = supabase
      .channel("course-progress-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "course_enrollments" }, (payload) => {
        if (payload.eventType === "UPDATE") {
          setCourseProgress(prev => 
            prev.map(cp => cp.id === payload.new.id ? {...cp, ...payload.new} : cp)
          );
          
          // Auto-generate certificate on completion
          if (payload.new.enrollment_status === "completed" && payload.old.enrollment_status !== "completed") {
            generateCertificate(payload.new);
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(progressChannel);
    };
  }, []);

  const loadData = async () => {
    try {
      const [progressData, certificatesData, historyData] = await Promise.all([
        (supabase as unknown)
          .from("course_enrollments")
          .select("*, courses(title, category, estimated_duration_hours)")
          .order("last_accessed_at", { ascending: false })
          .limit(100),
        (supabase as unknown)
          .from("certifications")
          .select("*, courses(title)")
          .order("issue_date", { ascending: false })
          .limit(100),
        loadLearningHistory()
      ]);

      if (progressData.error) throw progressData.error;
      if (certificatesData.error) throw certificatesData.error;

      setCourseProgress(progressData.data || []);
      setCertificates(certificatesData.data || []);
      setLearningHistory(historyData);
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

  const loadLearningHistory = async () => {
    try {
      // Aggregate user learning data
      const { data, error } = await (supabase as unknown)
        .from("course_enrollments")
        .select("user_id, enrollment_status, time_spent_minutes, average_score");
      
      if (error) throw error;

      // Group by user
      const userMap = new Map<string, any>();
      
      data?.forEach((enrollment: unknown) => {
        const userId = enrollment.user_id;
        if (!userMap.has(userId)) {
          userMap.set(userId, {
            user_id: userId,
            user_email: "user@example.com",
            total_courses: 0,
            completed_courses: 0,
            total_time_hours: 0,
            avg_score: 0,
            certificates: 0,
            scores: []
          });
        }
        
        const userData = userMap.get(userId);
        userData.total_courses++;
        if (enrollment.enrollment_status === "completed") {
          userData.completed_courses++;
        }
        userData.total_time_hours += (enrollment.time_spent_minutes || 0) / 60;
        if (enrollment.average_score) {
          userData.scores.push(enrollment.average_score);
        }
      });

      // Calculate averages and format
      const history = Array.from(userMap.values()).map(user => ({
        ...user,
        avg_score: user.scores.length > 0 
          ? user.scores.reduce((a: number, b: number) => a + b, 0) / user.scores.length 
          : 0,
        total_time_hours: Math.round(user.total_time_hours * 10) / 10
      }));

      return history;
    } catch (error) {
      logger.error("Error loading learning history:", error);
      return [];
    }
  };

  const generateCertificate = async (enrollment: unknown: unknown: unknown) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const certificateNumber = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      const { data, error } = await (supabase as unknown)
        .from("certifications")
        .insert({
          user_id: enrollment.user_id,
          course_id: enrollment.course_id,
          certificate_number: certificateNumber,
          issue_date: new Date().toISOString(),
          expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
          is_valid: true,
          certification_type: "course_completion",
          issuer: "Training Academy"
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "🎓 Certificado Gerado",
        description: `Certificado ${certificateNumber} emitido com sucesso!`
      });

      // Refresh certificates
      loadData();
    } catch (error) {
      logger.error("Error generating certificate:", error);
      toast({
        title: "Erro",
        description: "Falha ao gerar certificado",
        variant: "destructive"
      });
    }
  };

  const downloadCertificatePDF = (certificate: Certificate) => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4"
    });

    // Certificate border
    doc.setDrawColor(0, 51, 102);
    doc.setLineWidth(5);
    doc.rect(10, 10, 277, 190);

    // Title
    doc.setFontSize(40);
    doc.setTextColor(0, 51, 102);
    doc.text("CERTIFICADO", 148.5, 50, { align: "center" });

    // Subtitle
    doc.setFontSize(16);
    doc.setTextColor(100, 100, 100);
    doc.text("DE CONCLUSÃO", 148.5, 65, { align: "center" });

    // Body text
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("Certificamos que", 148.5, 85, { align: "center" });

    // Name placeholder
    doc.setFontSize(20);
    doc.setTextColor(0, 51, 102);
    doc.text("[Nome do Aluno]", 148.5, 100, { align: "center" });

    // Course info
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("concluiu com êxito o curso", 148.5, 115, { align: "center" });

    doc.setFontSize(18);
    doc.setTextColor(0, 51, 102);
    doc.text(certificate.courses.title, 148.5, 130, { align: "center" });

    // Certificate number and date
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Certificado Nº: ${certificate.certificate_number}`, 148.5, 160, { align: "center" });
    doc.text(`Data de Emissão: ${new Date(certificate.issue_date).toLocaleDateString("pt-BR")}`, 148.5, 168, { align: "center" });
    doc.text(`Válido até: ${new Date(certificate.expiry_date).toLocaleDateString("pt-BR")}`, 148.5, 176, { align: "center" });

    // Footer
    doc.setFontSize(8);
    doc.text("Training Academy - Sistema de Gestão de Treinamentos", 148.5, 190, { align: "center" });

    doc.save(`certificate-${certificate.certificate_number}.pdf`);
    
    toast({
      title: "Download Concluído",
      description: "Certificado baixado com sucesso"
    });
  };

  const updateProgress = async (enrollmentId: string, progress: number) => {
    try {
      const { error } = await (supabase as unknown)
        .from("course_enrollments")
        .update({
          overall_progress_percentage: progress,
          last_accessed_at: new Date().toISOString(),
          ...(progress >= 100 && { 
            enrollment_status: "completed",
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

  const getStatusColor = (status: string) => {
    switch (status) {
    case "completed": return "default";
    case "in_progress": return "secondary";
    case "not_started": return "outline";
    default: return "outline";
    }
  };

  const inProgressCount = courseProgress.filter(cp => cp.enrollment_status === "in_progress").length;
  const completedCount = courseProgress.filter(cp => cp.enrollment_status === "completed").length;
  const avgProgress = courseProgress.length > 0
    ? courseProgress.reduce((sum, cp) => sum + cp.overall_progress_percentage, 0) / courseProgress.length
    : 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
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

      {/* Statistics Cards */}
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

      {/* Main Content */}
      <Tabs defaultValue="progress">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="progress">Progresso de Cursos</TabsTrigger>
          <TabsTrigger value="certificates">Certificados</TabsTrigger>
          <TabsTrigger value="history">Histórico de Aprendizado</TabsTrigger>
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
                              <h3 className="font-semibold">{progress.courses.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                {progress.courses.category} • {progress.courses.estimated_duration_hours}h
                              </p>
                            </div>
                            <Badge variant={getStatusColor(progress.enrollment_status)}>
                              {progress.enrollment_status}
                            </Badge>
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">
                                Progresso: {Math.round(progress.overall_progress_percentage)}%
                              </span>
                              {progress.average_score > 0 && (
                                <span className="text-sm text-muted-foreground">
                                  Nota: {progress.average_score.toFixed(1)}
                                </span>
                              )}
                            </div>
                            <Progress value={progress.overall_progress_percentage} />
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>⏱️ {progress.time_spent_minutes} minutos</span>
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
                Todos os certificados gerados automaticamente após conclusão
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
                              <h3 className="font-semibold">{cert.courses.title}</h3>
                            </div>
                            <div className="space-y-1 text-sm">
                              <p><strong>Certificado:</strong> {cert.certificate_number}</p>
                              <p><strong>Emissão:</strong> {new Date(cert.issue_date).toLocaleDateString("pt-BR")}</p>
                              <p><strong>Validade:</strong> {new Date(cert.expiry_date).toLocaleDateString("pt-BR")}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={cert.is_valid ? "default" : "secondary"}>
                                {cert.is_valid ? "Válido" : "Expirado"}
                              </Badge>
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            onClick={() => handledownloadCertificatePDF}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Baixar PDF
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

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Aprendizado por Usuário</CardTitle>
              <CardDescription>
                Estatísticas de desempenho e engajamento dos alunos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {learningHistory.map((history) => (
                    <Card key={history.user_id}>
                      <CardContent className="pt-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            <h3 className="font-semibold">{history.user_email}</h3>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Total de Cursos</p>
                              <p className="font-bold text-lg">{history.total_courses}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Concluídos</p>
                              <p className="font-bold text-lg text-green-600">{history.completed_courses}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Tempo Total</p>
                              <p className="font-bold text-lg">{history.total_time_hours}h</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Nota Média</p>
                              <p className="font-bold text-lg">{history.avg_score.toFixed(1)}</p>
                            </div>
                          </div>
                          <Progress value={(history.completed_courses / history.total_courses) * 100} />
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
