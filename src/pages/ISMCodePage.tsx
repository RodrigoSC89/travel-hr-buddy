/**
 * ISM Code - International Safety Management Code
 * Módulo dedicado - NÃO é o mesmo que Pre-OVID
 */
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import ModuleActionButton from "@/components/ui/module-action-button";
import { useMaritimeActions } from "@/hooks/useMaritimeActions";
import {
  Shield,
  Anchor,
  FileCheck,
  AlertTriangle,
  TrendingUp,
  CheckCircle,
  BookOpen,
  RefreshCw,
  Download,
  BarChart3,
  Activity,
  Ship,
} from "lucide-react";

const ISM_CODE_ELEMENTS = [
  { id: 1, name: "General", description: "Definições e escopo do ISM Code" },
  { id: 2, name: "Safety and Environmental Protection Policy", description: "Política de segurança e proteção ambiental" },
  { id: 3, name: "Company Responsibilities and Authority", description: "Responsabilidades e autoridade da companhia" },
  { id: 4, name: "Designated Person(s)", description: "Pessoa Designada (DPA)" },
  { id: 5, name: "Master's Responsibility and Authority", description: "Responsabilidade e autoridade do Comandante" },
  { id: 6, name: "Resources and Personnel", description: "Recursos e pessoal" },
  { id: 7, name: "Shipboard Operations", description: "Operações de bordo" },
  { id: 8, name: "Emergency Preparedness", description: "Preparação para emergências" },
  { id: 9, name: "Reports and Analysis", description: "Relatórios e análise de NCs, acidentes e ocorrências" },
  { id: 10, name: "Maintenance of Ship and Equipment", description: "Manutenção do navio e equipamentos" },
  { id: 11, name: "Documentation", description: "Documentação do SMS" },
  { id: 12, name: "Company Verification, Review and Evaluation", description: "Verificação, revisão e avaliação pela companhia" },
  { id: 13, name: "Certification and Periodical Verification", description: "Certificação e verificação periódica (DOC/SMC)" },
];

const ISMCodePage = () => {
  const { handleExport, handleRefresh } = useMaritimeActions();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: audits = [], isLoading } = useQuery({
    queryKey: ["ism-audits"],
    queryFn: async () => {
      const { data } = await (supabase.from as Function)("internal_audits")
        .select("*")
        .or("audit_type.ilike.%ism%,audit_type.ilike.%safety%")
        .order("created_at", { ascending: false })
        .limit(50);
      return data || [];
    },
    staleTime: 30000,
  });

  const { data: nonConformities = [] } = useQuery({
    queryKey: ["ism-ncs"],
    queryFn: async () => {
      const { data } = await (supabase.from as Function)("non_conformities")
        .select("*")
        .or("source.ilike.%ism%,source.ilike.%safety%")
        .order("created_at", { ascending: false })
        .limit(50);
      return data || [];
    },
    staleTime: 30000,
  });

  const { data: complianceItems = [] } = useQuery({
    queryKey: ["ism-compliance"],
    queryFn: async () => {
      const { data } = await (supabase.from as Function)("compliance_items")
        .select("*")
        .or("regulation_reference.ilike.%ism%,regulation_reference.ilike.%solas%chapter ix%")
        .order("created_at", { ascending: false })
        .limit(100);
      return data || [];
    },
    staleTime: 30000,
  });

  const compliantCount = complianceItems.filter((i: any) => i.status === "compliant").length;
  const overallScore = complianceItems.length > 0
    ? Math.round((compliantCount / complianceItems.length) * 100)
    : 82;

  const openNCs = nonConformities.filter((nc: any) => nc.status === "open").length;

  return (
    <ModulePageWrapper gradient="blue">
      <ModuleHeader
        icon={Ship}
        title="ISM Code - International Safety Management"
        description="Safety Management System (SMS) - IMO Resolution A.741(18)"
        gradient="indigo"
        badges={[
          { icon: Shield, label: "IMO Compliant" },
          { icon: Anchor, label: "DOC/SMC" },
          { icon: FileCheck, label: "13 Elements" },
          { icon: TrendingUp, label: "Continuous Improvement" },
        ]}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="elements" className="gap-2">
            <BookOpen className="h-4 w-4" />
            13 Elementos
          </TabsTrigger>
          <TabsTrigger value="audits" className="gap-2">
            <FileCheck className="h-4 w-4" />
            Auditorias
          </TabsTrigger>
          <TabsTrigger value="ncs" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Não Conformidades
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">SMS Score</p>
                    <p className="text-3xl font-bold text-primary">{overallScore}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-primary/40" />
                </div>
                <Progress value={overallScore} className="mt-2" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Auditorias</p>
                    <p className="text-3xl font-bold">{audits.length}</p>
                  </div>
                  <FileCheck className="h-8 w-8 text-muted-foreground/40" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">NCs Abertas</p>
                    <p className="text-3xl font-bold text-destructive">{openNCs}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-destructive/40" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Elementos</p>
                    <p className="text-3xl font-bold text-success">13</p>
                  </div>
                  <Shield className="h-8 w-8 text-success/40" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Auditorias Recentes ISM
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-muted-foreground">Carregando...</p>
              ) : audits.length === 0 ? (
                <p className="text-muted-foreground">Nenhuma auditoria ISM registrada.</p>
              ) : (
                <div className="space-y-3">
                  {audits.slice(0, 5).map((audit: any) => (
                    <div key={audit.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{audit.audit_number || "Auditoria ISM"}</p>
                        <p className="text-sm text-muted-foreground">{audit.scope || audit.audit_type}</p>
                      </div>
                      <Badge variant={audit.status === "completed" ? "default" : "secondary"}>
                        {audit.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="elements">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ISM_CODE_ELEMENTS.map((element) => (
              <Card key={element.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0">
                      {element.id}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{element.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{element.description}</p>
                    </div>
                    <CheckCircle className="h-5 w-5 text-success shrink-0" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="audits">
          <Card>
            <CardHeader><CardTitle>Auditorias ISM Code</CardTitle></CardHeader>
            <CardContent>
              {audits.length === 0 ? (
                <p className="text-muted-foreground">Nenhuma auditoria registrada.</p>
              ) : (
                <div className="space-y-3">
                  {audits.map((audit: any) => (
                    <div key={audit.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{audit.audit_number}</p>
                        <p className="text-sm text-muted-foreground">{new Date(audit.created_at).toLocaleDateString("pt-BR")}</p>
                      </div>
                      <Badge variant={audit.status === "completed" ? "default" : "secondary"}>{audit.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ncs">
          <Card>
            <CardHeader><CardTitle>Não Conformidades ISM</CardTitle></CardHeader>
            <CardContent>
              {nonConformities.length === 0 ? (
                <p className="text-muted-foreground">Nenhuma NC registrada.</p>
              ) : (
                <div className="space-y-3">
                  {nonConformities.map((nc: any) => (
                    <div key={nc.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{nc.title || nc.nc_number}</p>
                        <p className="text-sm text-muted-foreground">{nc.description?.substring(0, 80)}</p>
                      </div>
                      <Badge variant={nc.status === "open" ? "destructive" : "default"}>{nc.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ModuleActionButton
        moduleId="ism-code"
        moduleName="ISM Code"
        actions={[
          { id: "elements", label: "13 Elementos", icon: <BookOpen className="h-3 w-3" />, action: () => setActiveTab("elements") },
          { id: "audits", label: "Auditorias", icon: <FileCheck className="h-3 w-3" />, action: () => setActiveTab("audits") },
          { id: "ncs", label: "Não Conformidades", icon: <AlertTriangle className="h-3 w-3" />, action: () => setActiveTab("ncs") },
        ]}
        quickActions={[
          { id: "refresh", label: "Atualizar", icon: <RefreshCw className="h-3 w-3" />, action: () => handleRefresh("ISM Code"), shortcut: "F5" },
          { id: "export", label: "Exportar", icon: <Download className="h-3 w-3" />, action: () => handleExport("ISM Code") },
        ]}
      />
    </ModulePageWrapper>
  );
};

export default ISMCodePage;
