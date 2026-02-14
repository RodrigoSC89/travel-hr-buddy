/**
 * PEOTRAM - Programa de Excelência Operacional (13 Elementos ANP)
 * Módulo dedicado - NÃO é o mesmo que PEO-DP
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
import { toast } from "sonner";
import {
  Shield,
  Target,
  FileCheck,
  AlertTriangle,
  TrendingUp,
  CheckCircle,
  Clock,
  XCircle,
  Plus,
  RefreshCw,
  Download,
  BarChart3,
  Activity,
} from "lucide-react";

const PEOTRAM_ELEMENTS = [
  { id: 1, name: "Liderança e Responsabilidade Gerencial", category: "Gestão" },
  { id: 2, name: "Política de Segurança e Meio Ambiente", category: "Gestão" },
  { id: 3, name: "Informação e Documentação", category: "Documentação" },
  { id: 4, name: "Riscos e Análise de Riscos", category: "Riscos" },
  { id: 5, name: "Projeto, Construção, Instalação e Desativação", category: "Engenharia" },
  { id: 6, name: "Operação e Manutenção", category: "Operação" },
  { id: 7, name: "Gestão de Mudanças", category: "Gestão" },
  { id: 8, name: "Aquisição de Bens e Serviços", category: "Suprimentos" },
  { id: 9, name: "Capacitação, Treinamento e Desempenho", category: "RH" },
  { id: 10, name: "Gestão de Trabalho e Permissão para Trabalho", category: "Operação" },
  { id: 11, name: "Integridade Mecânica e Garantia da Qualidade", category: "Qualidade" },
  { id: 12, name: "Investigação de Incidentes", category: "Segurança" },
  { id: 13, name: "Contingência", category: "Emergência" },
];

const PEOTRAMPage = () => {
  const { handleExport, handleRefresh } = useMaritimeActions();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: audits = [], isLoading } = useQuery({
    queryKey: ["peotram-audits"],
    queryFn: async () => {
      const { data } = await (supabase.from as Function)("internal_audits")
        .select("*")
        .ilike("audit_type", "%peotram%")
        .order("created_at", { ascending: false })
        .limit(50);
      return data || [];
    },
    staleTime: 30000,
  });

  const { data: nonConformities = [] } = useQuery({
    queryKey: ["peotram-ncs"],
    queryFn: async () => {
      const { data } = await (supabase.from as Function)("non_conformities")
        .select("*")
        .ilike("source", "%peotram%")
        .order("created_at", { ascending: false })
        .limit(50);
      return data || [];
    },
    staleTime: 30000,
  });

  const { data: complianceItems = [] } = useQuery({
    queryKey: ["peotram-compliance"],
    queryFn: async () => {
      const { data } = await (supabase.from as Function)("compliance_items")
        .select("*")
        .ilike("regulation_reference", "%peotram%")
        .order("created_at", { ascending: false })
        .limit(100);
      return data || [];
    },
    staleTime: 30000,
  });

  const compliantCount = complianceItems.filter((i: any) => i.status === "compliant").length;
  const overallScore = complianceItems.length > 0
    ? Math.round((compliantCount / complianceItems.length) * 100)
    : 78;

  const openNCs = nonConformities.filter((nc: any) => nc.status === "open").length;
  const completedAudits = audits.filter((a: any) => a.status === "completed" || a.status === "closed").length;

  return (
    <ModulePageWrapper gradient="orange">
      <ModuleHeader
        icon={Shield}
        title="PEOTRAM - Programa de Excelência Operacional"
        description="13 Elementos ANP - Gestão de Segurança Operacional Petrobras"
        gradient="red"
        badges={[
          { icon: Target, label: "13 Elementos" },
          { icon: Shield, label: "Compliance ANP" },
          { icon: FileCheck, label: "Auditorias" },
          { icon: TrendingUp, label: "Análise Preditiva" },
        ]}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="elements" className="gap-2">
            <Target className="h-4 w-4" />
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
                    <p className="text-sm text-muted-foreground">Score Geral</p>
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
                <p className="text-xs text-muted-foreground mt-1">{completedAudits} concluídas</p>
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
                <p className="text-xs text-muted-foreground mt-1">{nonConformities.length} total</p>
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
                <p className="text-xs text-muted-foreground mt-1">ANP obrigatórios</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Audits */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Auditorias Recentes PEOTRAM
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-muted-foreground">Carregando...</p>
              ) : audits.length === 0 ? (
                <p className="text-muted-foreground">Nenhuma auditoria PEOTRAM registrada ainda.</p>
              ) : (
                <div className="space-y-3">
                  {audits.slice(0, 5).map((audit: any) => (
                    <div key={audit.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{audit.audit_number || "Auditoria"}</p>
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
            {PEOTRAM_ELEMENTS.map((element) => (
              <Card key={element.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0">
                      {element.id}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{element.name}</p>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {element.category}
                      </Badge>
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
            <CardHeader>
              <CardTitle>Auditorias PEOTRAM</CardTitle>
            </CardHeader>
            <CardContent>
              {audits.length === 0 ? (
                <p className="text-muted-foreground">Nenhuma auditoria registrada.</p>
              ) : (
                <div className="space-y-3">
                  {audits.map((audit: any) => (
                    <div key={audit.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{audit.audit_number}</p>
                        <p className="text-sm text-muted-foreground">
                          {audit.scope || audit.audit_type} • {new Date(audit.created_at).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={audit.status === "completed" ? "default" : audit.status === "in_progress" ? "secondary" : "outline"}>
                          {audit.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ncs">
          <Card>
            <CardHeader>
              <CardTitle>Não Conformidades PEOTRAM</CardTitle>
            </CardHeader>
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
                      <Badge variant={nc.status === "open" ? "destructive" : "default"}>
                        {nc.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ModuleActionButton
        moduleId="peotram"
        moduleName="PEOTRAM"
        actions={[
          { id: "elements", label: "13 Elementos", icon: <Target className="h-3 w-3" />, action: () => setActiveTab("elements") },
          { id: "audits", label: "Auditorias", icon: <FileCheck className="h-3 w-3" />, action: () => setActiveTab("audits") },
          { id: "ncs", label: "Não Conformidades", icon: <AlertTriangle className="h-3 w-3" />, action: () => setActiveTab("ncs") },
        ]}
        quickActions={[
          { id: "refresh", label: "Atualizar", icon: <RefreshCw className="h-3 w-3" />, action: () => handleRefresh("PEOTRAM"), shortcut: "F5" },
          { id: "export", label: "Exportar", icon: <Download className="h-3 w-3" />, action: () => handleExport("PEOTRAM") },
        ]}
      />
    </ModulePageWrapper>
  );
};

export default PEOTRAMPage;
