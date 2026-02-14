/**
 * ISPS Security - International Ship and Port Facility Security Code
 * Módulo dedicado - NÃO é o mesmo que Security Center
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
  Lock,
  FileCheck,
  AlertTriangle,
  TrendingUp,
  CheckCircle,
  Eye,
  RefreshCw,
  Download,
  BarChart3,
  Activity,
  ShieldAlert,
  Users,
  MapPin,
} from "lucide-react";

const ISPS_SECTIONS = [
  { id: "A", name: "Part A - Mandatory Requirements", items: [
    { code: "A/1", name: "Introduction" },
    { code: "A/2", name: "Definitions" },
    { code: "A/7", name: "Ship Security" },
    { code: "A/8", name: "Ship Security Assessment (SSA)" },
    { code: "A/9", name: "Ship Security Plan (SSP)" },
    { code: "A/10", name: "Records" },
    { code: "A/11", name: "Company Security Officer (CSO)" },
    { code: "A/12", name: "Ship Security Officer (SSO)" },
    { code: "A/13", name: "Training, Drills and Exercises" },
  ]},
  { id: "B", name: "Part B - Guidance", items: [
    { code: "B/8", name: "SSA Guidelines" },
    { code: "B/9", name: "SSP Guidelines" },
    { code: "B/13", name: "Training Guidelines" },
    { code: "B/15", name: "Port Facility Security" },
    { code: "B/16", name: "Security Level Changes" },
  ]},
];

const SECURITY_LEVELS = [
  { level: 1, name: "Security Level 1 - Normal", description: "Nível mínimo de medidas de proteção mantidas permanentemente", color: "text-success" },
  { level: 2, name: "Security Level 2 - Heightened", description: "Medidas adicionais de proteção por período determinado", color: "text-warning" },
  { level: 3, name: "Security Level 3 - Exceptional", description: "Medidas específicas por período limitado ante ameaça provável", color: "text-destructive" },
];

const ISPSSecurityPage = () => {
  const { handleExport, handleRefresh } = useMaritimeActions();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: audits = [], isLoading } = useQuery({
    queryKey: ["isps-audits"],
    queryFn: async () => {
      const { data } = await (supabase.from as Function)("internal_audits")
        .select("*")
        .or("audit_type.ilike.%isps%,audit_type.ilike.%security%")
        .order("created_at", { ascending: false })
        .limit(50);
      return data || [];
    },
    staleTime: 30000,
  });

  const { data: nonConformities = [] } = useQuery({
    queryKey: ["isps-ncs"],
    queryFn: async () => {
      const { data } = await (supabase.from as Function)("non_conformities")
        .select("*")
        .or("source.ilike.%isps%,source.ilike.%security%")
        .order("created_at", { ascending: false })
        .limit(50);
      return data || [];
    },
    staleTime: 30000,
  });

  const { data: accessLogs = [] } = useQuery({
    queryKey: ["isps-access-logs"],
    queryFn: async () => {
      const { data } = await (supabase.from as Function)("access_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      return data || [];
    },
    staleTime: 30000,
  });

  const openNCs = nonConformities.filter((nc: any) => nc.status === "open").length;
  const currentSecurityLevel = 1;

  return (
    <ModulePageWrapper gradient="purple">
      <ModuleHeader
        icon={ShieldAlert}
        title="ISPS Code - Ship & Port Facility Security"
        description="International Ship and Port Facility Security Code - SOLAS Chapter XI-2"
        gradient="purple"
        badges={[
          { icon: Lock, label: "ISPS Compliant" },
          { icon: Shield, label: "SSP/SSA" },
          { icon: Users, label: "CSO/SSO" },
          { icon: Eye, label: "Security Monitoring" },
        ]}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="levels" className="gap-2">
            <ShieldAlert className="h-4 w-4" />
            Níveis de Segurança
          </TabsTrigger>
          <TabsTrigger value="sections" className="gap-2">
            <FileCheck className="h-4 w-4" />
            ISPS Parts A & B
          </TabsTrigger>
          <TabsTrigger value="audits" className="gap-2">
            <Activity className="h-4 w-4" />
            Auditorias
          </TabsTrigger>
          <TabsTrigger value="access" className="gap-2">
            <MapPin className="h-4 w-4" />
            Controle de Acesso
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="border-success/30 bg-success/5">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Security Level</p>
                    <p className="text-3xl font-bold text-success">{currentSecurityLevel}</p>
                  </div>
                  <ShieldAlert className="h-8 w-8 text-success/40" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Normal Operations</p>
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
                    <p className="text-sm text-muted-foreground">Access Logs</p>
                    <p className="text-3xl font-bold">{accessLogs.length}</p>
                  </div>
                  <Eye className="h-8 w-8 text-muted-foreground/40" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Auditorias Recentes ISPS
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-muted-foreground">Carregando...</p>
              ) : audits.length === 0 ? (
                <p className="text-muted-foreground">Nenhuma auditoria ISPS registrada.</p>
              ) : (
                <div className="space-y-3">
                  {audits.slice(0, 5).map((audit: any) => (
                    <div key={audit.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{audit.audit_number || "Auditoria ISPS"}</p>
                        <p className="text-sm text-muted-foreground">{audit.scope || audit.audit_type}</p>
                      </div>
                      <Badge variant={audit.status === "completed" ? "default" : "secondary"}>{audit.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="levels">
          <div className="space-y-4">
            {SECURITY_LEVELS.map((sl) => (
              <Card key={sl.level} className={sl.level === currentSecurityLevel ? "border-primary ring-2 ring-primary/20" : ""}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className={`flex items-center justify-center w-14 h-14 rounded-full bg-background border-2 font-bold text-xl ${sl.color}`}>
                      {sl.level}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{sl.name}</p>
                      <p className="text-sm text-muted-foreground">{sl.description}</p>
                    </div>
                    {sl.level === currentSecurityLevel && (
                      <Badge className="bg-primary text-primary-foreground">ATIVO</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sections">
          <div className="space-y-6">
            {ISPS_SECTIONS.map((section) => (
              <Card key={section.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{section.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {section.items.map((item) => (
                      <div key={item.code} className="flex items-center gap-3 p-2 rounded hover:bg-muted/50">
                        <Badge variant="outline" className="font-mono text-xs">{item.code}</Badge>
                        <span className="text-sm">{item.name}</span>
                        <CheckCircle className="h-4 w-4 text-success ml-auto" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="audits">
          <Card>
            <CardHeader><CardTitle>Auditorias ISPS Security</CardTitle></CardHeader>
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

        <TabsContent value="access">
          <Card>
            <CardHeader><CardTitle>Controle de Acesso - ISPS</CardTitle></CardHeader>
            <CardContent>
              {accessLogs.length === 0 ? (
                <p className="text-muted-foreground">Nenhum registro de acesso.</p>
              ) : (
                <div className="space-y-3">
                  {accessLogs.map((log: any) => (
                    <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{log.action}</p>
                        <p className="text-sm text-muted-foreground">
                          {log.module_accessed} • {new Date(log.created_at).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <Badge variant={log.result === "success" ? "default" : "destructive"}>{log.result}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ModuleActionButton
        moduleId="isps-security"
        moduleName="ISPS Security"
        actions={[
          { id: "levels", label: "Security Levels", icon: <ShieldAlert className="h-3 w-3" />, action: () => setActiveTab("levels") },
          { id: "sections", label: "ISPS Parts", icon: <FileCheck className="h-3 w-3" />, action: () => setActiveTab("sections") },
          { id: "access", label: "Access Control", icon: <MapPin className="h-3 w-3" />, action: () => setActiveTab("access") },
        ]}
        quickActions={[
          { id: "refresh", label: "Atualizar", icon: <RefreshCw className="h-3 w-3" />, action: () => handleRefresh("ISPS"), shortcut: "F5" },
          { id: "export", label: "Exportar", icon: <Download className="h-3 w-3" />, action: () => handleExport("ISPS") },
        ]}
      />
    </ModulePageWrapper>
  );
};

export default ISPSSecurityPage;
