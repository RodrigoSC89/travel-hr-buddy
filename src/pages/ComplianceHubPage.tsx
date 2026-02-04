/**
 * Compliance Hub - Centro Unificado de Compliance
 * Unified hub for all compliance and audit modules
 * 
 * FUSION - MODERATE STRATEGY
 * Consolidates compliance modules into 1 hub with tabs:
 * - Dashboard (overview, KPIs, alerts)
 * - Auditorias (PEO-DP, PEOTRAM, SGSO, MLC, IMCA)
 * - Certificações (certificates, renewals)
 * - Regulamentos (SOLAS, ISPS, ISM, MARPOL)
 * - Gestão de Riscos (risk matrix, mitigations)
 * - Não Conformidades (NCs, CAPAs)
 * - Agentes IA (10 compliance agents)
 * 
 * All original functionality is 100% preserved via lazy loading
 */

import React, { Suspense, lazy, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Helmet } from "react-helmet-async";
import { 
  Shield, BarChart3, FileText, AlertTriangle, Bot,
  ClipboardCheck, Award, BookOpen, Loader2, Sparkles
} from "lucide-react";

// Lazy load compliance pages
const DiagnosticDashboardPage = lazy(() => import("@/pages/DiagnosticDashboardPage"));
const AuditAgentsDashboard = lazy(() => import("@/pages/audit-agents/AgentsDashboard"));
const DiagnosticCertificatesPage = lazy(() => import("@/pages/DiagnosticCertificatesPage"));
const DiagnosticNCsPage = lazy(() => import("@/pages/DiagnosticNCsPage"));
const DiagnosticReportsPage = lazy(() => import("@/pages/DiagnosticReportsPage"));
const ComplianceRoadmapPage = lazy(() => import("@/pages/ComplianceRoadmapPage"));
const RiskMatrixV2 = lazy(() => import("@/pages/RiskMatrixV2"));
const RegulationsV2 = lazy(() => import("@/pages/RegulationsV2"));
const ComplianceCommandCenter = lazy(() => import("@/modules/compliance-hub/components/ComplianceCommandCenter"));
const SafetyCommandCenter = lazy(() => import("@/modules/safety-guardian/components/SafetyCommandCenter"));

// Legacy audit pages (preserved)
const PEODP = lazy(() => import("@/pages/PEODP"));
const PEOTRAM = lazy(() => import("@/pages/PEOTRAM"));
const SGSO = lazy(() => import("@/pages/SGSO"));
const MLCInspection = lazy(() => import("@/pages/MLCInspection"));
const IMCAAudit = lazy(() => import("@/pages/IMCAAudit"));
const PreOVIDInspection = lazy(() => import("@/pages/PreOVIDInspection"));

// Loading skeleton
function TabLoadingSkeleton() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="ml-2 text-muted-foreground">Carregando módulo de compliance...</span>
    </div>
  );
}

// Tab configuration
const TABS = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: BarChart3,
    description: "Visão geral e KPIs",
  },
  {
    id: "command",
    label: "Centro de Controle",
    icon: Shield,
    description: "Compliance Premium",
    badge: "NOVO",
  },
  {
    id: "safety",
    label: "Segurança",
    icon: AlertTriangle,
    description: "Safety Guardian",
    badge: "NOVO",
  },
  {
    id: "agents",
    label: "Agentes IA",
    icon: Bot,
    description: "10 agentes especializados",
    badge: "10 AGENTS",
  },
  {
    id: "audits",
    label: "Auditorias",
    icon: ClipboardCheck,
    description: "PEO-DP, PEOTRAM, SGSO",
  },
  {
    id: "certificates",
    label: "Certificações",
    icon: Award,
    description: "Alertas e renovações",
  },
  {
    id: "ncs",
    label: "NCs & CAPAs",
    icon: AlertTriangle,
    description: "Não conformidades",
  },
  {
    id: "regulations",
    label: "Regulamentos",
    icon: BookOpen,
    description: "SOLAS, ISPS, MLC",
  },
  {
    id: "risks",
    label: "Riscos",
    icon: Shield,
    description: "Matriz de riscos",
  },
  {
    id: "reports",
    label: "Relatórios",
    icon: FileText,
    description: "Relatórios automáticos",
  },
];

// Sub-tabs for Auditorias section
const AUDIT_SUBTABS = [
  { id: "peo-dp", label: "PEO-DP" },
  { id: "peotram", label: "PEOTRAM" },
  { id: "sgso", label: "SGSO" },
  { id: "mlc", label: "MLC" },
  { id: "imca", label: "IMCA" },
  { id: "pre-ovid", label: "Pre-OVID" },
];

export default function ComplianceHubPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "dashboard";
  const initialSubtab = searchParams.get("subtab") || "peo-dp";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [auditSubtab, setAuditSubtab] = useState(initialSubtab);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams({ tab: value });
  };

  const handleAuditSubtabChange = (value: string) => {
    setAuditSubtab(value);
    setSearchParams({ tab: "audits", subtab: value });
  };

  return (
    <>
      <Helmet>
        <title>Compliance Hub | Nautilus One</title>
        <meta name="description" content="Centro unificado de compliance e auditorias marítimas" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto py-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                  Compliance Hub
                  <Badge variant="secondary" className="ml-2">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Unificado
                  </Badge>
                </h1>
                <p className="text-muted-foreground">
                  Centro de auditorias, certificações e conformidade regulatória
                </p>
              </div>
            </div>
          </div>

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <ScrollArea className="w-full whitespace-nowrap">
              <TabsList className="inline-flex h-auto p-1 bg-muted/50">
                {TABS.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="flex items-center gap-2 px-4 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    <tab.icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                    {tab.badge && (
                      <Badge variant="secondary" className="text-xs">{tab.badge}</Badge>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>

            {/* Tab Content */}
            <div className="mt-6">
              <TabsContent value="dashboard" className="m-0">
                <Suspense fallback={<TabLoadingSkeleton />}>
                  <DiagnosticDashboardPage />
                </Suspense>
              </TabsContent>

              <TabsContent value="command" className="m-0">
                <Suspense fallback={<TabLoadingSkeleton />}>
                  <ComplianceCommandCenter />
                </Suspense>
              </TabsContent>

              <TabsContent value="safety" className="m-0">
                <Suspense fallback={<TabLoadingSkeleton />}>
                  <SafetyCommandCenter />
                </Suspense>
              </TabsContent>

              <TabsContent value="agents" className="m-0">
                <Suspense fallback={<TabLoadingSkeleton />}>
                  <AuditAgentsDashboard />
                </Suspense>
              </TabsContent>

              <TabsContent value="audits" className="m-0">
                {/* Sub-tabs for specific audit types */}
                <Card className="p-4 mb-4">
                  <Tabs value={auditSubtab} onValueChange={handleAuditSubtabChange}>
                    <TabsList className="grid grid-cols-6 w-full max-w-2xl">
                      {AUDIT_SUBTABS.map((subtab) => (
                        <TabsTrigger key={subtab.id} value={subtab.id}>
                          {subtab.label}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </Card>

                <Suspense fallback={<TabLoadingSkeleton />}>
                  {auditSubtab === "peo-dp" && <PEODP />}
                  {auditSubtab === "peotram" && <PEOTRAM />}
                  {auditSubtab === "sgso" && <SGSO />}
                  {auditSubtab === "mlc" && <MLCInspection />}
                  {auditSubtab === "imca" && <IMCAAudit />}
                  {auditSubtab === "pre-ovid" && <PreOVIDInspection />}
                </Suspense>
              </TabsContent>

              <TabsContent value="certificates" className="m-0">
                <Suspense fallback={<TabLoadingSkeleton />}>
                  <DiagnosticCertificatesPage />
                </Suspense>
              </TabsContent>

              <TabsContent value="ncs" className="m-0">
                <Suspense fallback={<TabLoadingSkeleton />}>
                  <DiagnosticNCsPage />
                </Suspense>
              </TabsContent>

              <TabsContent value="regulations" className="m-0">
                <Suspense fallback={<TabLoadingSkeleton />}>
                  <RegulationsV2 />
                </Suspense>
              </TabsContent>

              <TabsContent value="risks" className="m-0">
                <Suspense fallback={<TabLoadingSkeleton />}>
                  <RiskMatrixV2 />
                </Suspense>
              </TabsContent>

              <TabsContent value="reports" className="m-0">
                <Suspense fallback={<TabLoadingSkeleton />}>
                  <DiagnosticReportsPage />
                </Suspense>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </>
  );
}
