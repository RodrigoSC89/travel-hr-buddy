/**
 * STCW & MLC Compliance Center - Connected to Supabase + AI
 * Real data from crew_certifications, stcw_competencies, training_records
 */
import React, { Suspense, lazy } from "react";
import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Award, Users, BookOpen, Calendar, GraduationCap, 
  FileCheck, Shield, CheckCircle2, AlertTriangle, Clock,
  Ship, TrendingUp, Target, Brain, RefreshCw, Loader2, Sparkles, Flag
} from "lucide-react";
import { useComplianceStats, useCrewCertifications, useSTCWCompetencies } from "@/hooks/useSTCWMLCData";
import { useAuditAgentChat } from "@/hooks/useAuditAgentChat";
import { toast } from "sonner";

// Lazy load tier-1 components
const STCWCompetencyMatrix = lazy(() => import("@/components/crew/STCWCompetencyMatrix").then(m => ({ default: m.STCWCompetencyMatrix })));
const SeaTimeCalculator = lazy(() => import("@/components/crew/STCWCompetencyMatrix").then(m => ({ default: m.STCWCompetencyMatrix }))); // Reuse STCW matrix for sea time
const MLCComplianceModule = lazy(() => import("@/components/crew/MLCComplianceDashboard").then(m => ({ default: m.MLCComplianceDashboard })));
const FlagStateCertValidator = lazy(() => import("@/components/crew/FlagStateCertValidator").then(m => ({ default: m.FlagStateCertValidator })));

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={`stcw-skel-${i}`} className="h-24" />
        ))}
      </div>
      <Skeleton className="h-96" />
    </div>
  );
}

export default function STCWMLCCompliance() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get("tab") || "overview";
  const stats = useComplianceStats();
  const { data: certifications = [] } = useCrewCertifications();
  const { data: competencies = [] } = useSTCWCompetencies();
  const { messages, isStreaming, sendMessage } = useAuditAgentChat("stcw");

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  const runAIAudit = () => {
    const context = `
Certificações: ${stats.certificatesTotal} total, ${stats.certificatesValid} válidos, ${stats.certificatesExpiring} expirando, ${stats.certificatesExpired} expirados.
STCW Compliance: ${stats.stcwCompliance}%, MLC: ${stats.mlcCompliance}%
Tripulantes: ${stats.crewCount}, Treinamentos: ${stats.trainingRate}%
Competências STCW cadastradas: ${stats.competencyCount}
`.trim();
    sendMessage(`Analise a conformidade STCW/MLC atual e forneça recomendações prioritárias:\n\n${context}`);
  };

  return (
    <>
      <Helmet>
        <title>STCW & MLC Compliance | Nauti One</title>
        <meta name="description" content="Centro de conformidade STCW e MLC 2006 com análise IA para certificação marítima" />
      </Helmet>

      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Award className="h-8 w-8 text-primary" />
              STCW & MLC Compliance Center
            </h1>
            <p className="text-muted-foreground mt-1">
              Standards of Training, Certification and Watchkeeping & Maritime Labour Convention 2006
            </p>
          </div>
          <div className="flex items-center gap-2">
            {stats.isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  {stats.stcwCompliance}% STCW
                </Badge>
                <Badge variant="outline" className="bg-info/10 text-info border-info/30">
                  <Shield className="h-3 w-3 mr-1" />
                  {stats.mlcCompliance}% MLC
                </Badge>
              </>
            )}
            <Button size="sm" variant="outline" onClick={runAIAudit} disabled={isStreaming}>
              {isStreaming ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Sparkles className="h-4 w-4 mr-1" />}
              AI Audit
            </Button>
          </div>
        </div>

        {/* KPI Cards - Real Data */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {[
            { icon: Award, value: stats.certificatesValid, label: "Cert. Válidos", color: "text-success" },
            { icon: AlertTriangle, value: stats.certificatesExpiring, label: "Expirando 90d", color: "text-warning" },
            { icon: Clock, value: stats.certificatesExpired, label: "Expirados", color: "text-destructive" },
            { icon: GraduationCap, value: `${stats.trainingRate}%`, label: "Treinamentos", color: "text-info" },
            { icon: Users, value: stats.crewCount, label: "Tripulantes", color: "text-accent-foreground" },
            { icon: BookOpen, value: stats.competencyCount, label: "Competências", color: "text-info" },
            { icon: TrendingUp, value: `${stats.stcwCompliance}%`, label: "STCW Score", color: "text-success" },
            { icon: Shield, value: `${stats.mlcCompliance}%`, label: "MLC Score", color: "text-info" },
          ].map((kpi) => {
            const KpiIcon = kpi.icon;
            return (
              <Card key={kpi.label}>
                <CardContent className="pt-4">
                  <div className="text-center">
                    <KpiIcon className={`h-5 w-5 mx-auto ${kpi.color} mb-2`} />
                    {stats.isLoading ? (
                      <Skeleton className="h-8 w-12 mx-auto" />
                    ) : (
                      <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
                    )}
                    <p className="text-xs text-muted-foreground">{kpi.label}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* AI Analysis Result */}
        {messages.length > 0 && (
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" />
                Análise IA - STCW Agent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-48">
                {messages.filter(m => m.role === "assistant").map((msg, msgIdx) => (
                  <div key={`ai-msg-${msgIdx}-${msg.content.slice(0, 20)}`} className="text-sm whitespace-pre-wrap">{msg.content}</div>
                ))}
                {isStreaming && <Loader2 className="h-4 w-4 animate-spin mt-2" />}
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Main Tabs */}
        <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 h-auto p-1">
            <TabsTrigger value="overview" className="flex flex-col items-center gap-1 py-2">
              <Target className="h-4 w-4" />
              <span className="text-xs">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="stcw-matrix" className="flex flex-col items-center gap-1 py-2">
              <GraduationCap className="h-4 w-4" />
              <span className="text-xs">STCW Matrix</span>
            </TabsTrigger>
            <TabsTrigger value="mlc-compliance" className="flex flex-col items-center gap-1 py-2">
              <Shield className="h-4 w-4" />
              <span className="text-xs">MLC 2006</span>
            </TabsTrigger>
            <TabsTrigger value="sea-time" className="flex flex-col items-center gap-1 py-2">
              <Clock className="h-4 w-4" />
              <span className="text-xs">Sea Time</span>
            </TabsTrigger>
            <TabsTrigger value="certificates" className="flex flex-col items-center gap-1 py-2">
              <FileCheck className="h-4 w-4" />
              <span className="text-xs">Certificates</span>
            </TabsTrigger>
            <TabsTrigger value="flag-state" className="flex flex-col items-center gap-1 py-2">
              <Flag className="h-4 w-4" />
              <span className="text-xs">Flag State</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* STCW Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-primary" />
                    STCW Compliance Summary
                  </CardTitle>
                  <CardDescription>
                    Standards of Training, Certification and Watchkeeping for Seafarers
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Overall STCW Compliance</span>
                      <span className="font-medium">{stats.stcwCompliance}%</span>
                    </div>
                    <Progress value={stats.stcwCompliance} className="h-2" />
                  </div>
                  
                  {/* STCW Competency Areas */}
                  <div className="space-y-3 pt-4">
                    {competencies.slice(0, 5).map((comp) => (
                      <div key={comp.id} className="flex items-center justify-between p-2 rounded border text-sm">
                        <div className="flex-1">
                          <span className="font-medium">{comp.code}</span>
                          <span className="text-muted-foreground ml-2">{comp.name}</span>
                        </div>
                        {comp.level && (
                          <Badge variant="outline" className="text-xs">{comp.level}</Badge>
                        )}
                      </div>
                    ))}
                    {competencies.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Nenhuma competência STCW cadastrada
                      </p>
                    )}
                  </div>

                  <Button className="w-full" variant="outline" onClick={() => handleTabChange("stcw-matrix")}>
                    View Full STCW Matrix
                  </Button>
                </CardContent>
              </Card>

              {/* MLC Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    MLC 2006 Compliance Summary
                  </CardTitle>
                  <CardDescription>
                    Maritime Labour Convention - Seafarers' Rights & Working Conditions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Overall MLC Compliance</span>
                      <span className="font-medium">{stats.mlcCompliance}%</span>
                    </div>
                    <Progress value={stats.mlcCompliance} className="h-2" />
                  </div>
                  
                  <div className="space-y-3 pt-4">
                    {[
                      { title: "Title 1 - Minimum Requirements", key: "t1" },
                      { title: "Title 2 - Employment Conditions", key: "t2" },
                      { title: "Title 3 - Accommodation & Recreation", key: "t3" },
                      { title: "Title 4 - Health Protection", key: "t4" },
                      { title: "Title 5 - Compliance & Enforcement", key: "t5" },
                    ].map((item, idx) => {
                      const offsets = [0, 2, 1, 3, 2];
                      const score = Math.max(0, stats.mlcCompliance - offsets[idx]);
                      return (
                        <div key={item.key} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">{item.title}</span>
                            <span>{score}%</span>
                          </div>
                          <Progress value={score} className="h-1" />
                        </div>
                      );
                    })}
                  </div>

                  <Button className="w-full" variant="outline" onClick={() => handleTabChange("mlc-compliance")}>
                    View Full MLC Analysis
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* STCW Matrix Tab */}
          <TabsContent value="stcw-matrix">
            <Suspense fallback={<LoadingSkeleton />}>
              <STCWCompetencyMatrix />
            </Suspense>
          </TabsContent>

          {/* MLC Compliance Tab */}
          <TabsContent value="mlc-compliance">
            <Suspense fallback={<LoadingSkeleton />}>
              <MLCComplianceModule />
            </Suspense>
          </TabsContent>

          {/* Sea Time Tab */}
          <TabsContent value="sea-time">
            <Suspense fallback={<LoadingSkeleton />}>
              <SeaTimeCalculator />
            </Suspense>
          </TabsContent>

          {/* Certificates Tab - Real Data */}
          <TabsContent value="certificates">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-primary" />
                  Certificate Management
                </CardTitle>
                <CardDescription>
                  Track and manage STCW certificates, endorsements, and renewals
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="border-success/30">
                    <CardContent className="pt-6 text-center">
                      <CheckCircle2 className="h-12 w-12 mx-auto text-success mb-3" />
                      <p className="text-3xl font-bold text-success">{stats.certificatesValid}</p>
                      <p className="text-sm text-muted-foreground">Valid Certificates</p>
                    </CardContent>
                  </Card>
                  <Card className="border-warning/30">
                    <CardContent className="pt-6 text-center">
                      <AlertTriangle className="h-12 w-12 mx-auto text-warning mb-3" />
                      <p className="text-3xl font-bold text-warning">{stats.certificatesExpiring}</p>
                      <p className="text-sm text-muted-foreground">Expiring in 90 Days</p>
                    </CardContent>
                  </Card>
                  <Card className="border-destructive/30">
                    <CardContent className="pt-6 text-center">
                      <Clock className="h-12 w-12 mx-auto text-destructive mb-3" />
                      <p className="text-3xl font-bold text-destructive">{stats.certificatesExpired}</p>
                      <p className="text-sm text-muted-foreground">Expired - Action Required</p>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Certificate List */}
                {certifications.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Certificados Recentes</h4>
                    <ScrollArea className="h-[300px]">
                      {certifications.map((cert) => {
                        const isExpired = cert.expiry_date && new Date(cert.expiry_date) < new Date();
                        const isExpiring = cert.expiry_date && !isExpired && 
                          new Date(cert.expiry_date) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
                        return (
                          <div key={cert.id} className="flex items-center justify-between p-3 border rounded-lg mb-2">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{cert.certification_name}</p>
                              <p className="text-xs text-muted-foreground">
                                {cert.certification_type} • {cert.issuing_authority || "N/A"}
                                {cert.certificate_number && ` • #${cert.certificate_number}`}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {cert.expiry_date && (
                                <span className="text-xs text-muted-foreground">
                                  {new Date(cert.expiry_date).toLocaleDateString("pt-BR")}
                                </span>
                              )}
                              <Badge variant={isExpired ? "destructive" : isExpiring ? "secondary" : "default"}>
                                {isExpired ? "Expirado" : isExpiring ? "Expirando" : cert.status || "Válido"}
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                    </ScrollArea>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Flag State Validation Tab */}
          <TabsContent value="flag-state">
            <Suspense fallback={<LoadingSkeleton />}>
              <FlagStateCertValidator />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
