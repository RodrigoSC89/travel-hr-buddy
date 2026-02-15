import React, { useState, useEffect, lazy, Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import ModuleActionButton from "@/components/ui/module-action-button";
import { PeoDpManager } from "@/components/peo-dp/peo-dp-manager";
import { ASOGStatusBoard } from "@/components/peo-dp/ASOGStatusBoard";
import { PeoDPFMEAAnalysis } from "@/components/peo-dp/PeoDPFMEAAnalysis";
import { PeoDPTrialsManager } from "@/components/peo-dp/PeoDPTrialsManager";
import { PeoDPKPIDashboard } from "@/components/peo-dp/PeoDPKPIDashboard";
import { PeoDPAuditPrep } from "@/components/peo-dp/PeoDPAuditPrep";
import { useMaritimeActions } from "@/hooks/useMaritimeActions";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Shield, Anchor, Target, Brain, TrendingUp, Award, Zap, Globe,
  CheckCircle, Plus, RefreshCw, Download, Settings, Activity,
  BarChart3, ClipboardCheck, AlertTriangle, FileText
} from "lucide-react";

const ComplianceInterviewSimulator = lazy(() => import('@/components/compliance/ai/ComplianceInterviewSimulator').then(m => ({ default: m.ComplianceInterviewSimulator })));
const ComplianceOneClickAuditPrep = lazy(() => import('@/components/compliance/ai/ComplianceOneClickAuditPrep').then(m => ({ default: m.ComplianceOneClickAuditPrep })));
const ComplianceAutoChecklistGenerator = lazy(() => import('@/components/compliance/ai/ComplianceAutoChecklistGenerator').then(m => ({ default: m.ComplianceAutoChecklistGenerator })));

const LoadingFallback = () => <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64" /></div>;

const PEODP = () => {
  const { handleCreate, handleGenerateReport, handleExport, handleRefresh } = useMaritimeActions();

  return (
    <ModulePageWrapper gradient="blue">
      <ModuleHeader
        icon={Anchor}
        title="PEO-DP — Plano de Excelência Operacional DP"
        description="Dynamic Positioning • 7 Seções • 54+ Requisitos • IMCA M 190 & Petrobras 2021"
        gradient="indigo"
        badges={[
          { icon: Brain, label: "IA & Validação" },
          { icon: Shield, label: "Compliance IMCA" },
          { icon: Target, label: "7 Seções" },
          { icon: TrendingUp, label: "KPIs & IPCLV" }
        ]}
      />

      <Tabs defaultValue="plan" className="w-full">
        <TabsList className="mb-4 flex-wrap h-auto gap-1">
          <TabsTrigger value="plan" className="gap-1.5"><Target className="h-3.5 w-3.5" /> Plano DP</TabsTrigger>
          <TabsTrigger value="kpis" className="gap-1.5"><BarChart3 className="h-3.5 w-3.5" /> KPIs & IPCLV</TabsTrigger>
          <TabsTrigger value="fmea" className="gap-1.5"><Settings className="h-3.5 w-3.5" /> FMEA</TabsTrigger>
          <TabsTrigger value="trials" className="gap-1.5"><CheckCircle className="h-3.5 w-3.5" /> DP Trials</TabsTrigger>
          <TabsTrigger value="asog" className="gap-1.5"><Activity className="h-3.5 w-3.5" /> ASOG Status</TabsTrigger>
          <TabsTrigger value="audit-prep" className="gap-1.5"><ClipboardCheck className="h-3.5 w-3.5" /> Audit Prep</TabsTrigger>
          <TabsTrigger value="interview" className="gap-1.5"><Brain className="h-3.5 w-3.5" /> Simulador</TabsTrigger>
          <TabsTrigger value="checklist-ia" className="gap-1.5"><Zap className="h-3.5 w-3.5" /> Checklist IA</TabsTrigger>
        </TabsList>

        <TabsContent value="plan">
          <div id="peo-dp-plan"><PeoDpManager /></div>
        </TabsContent>
        <TabsContent value="kpis"><PeoDPKPIDashboard /></TabsContent>
        <TabsContent value="fmea"><PeoDPFMEAAnalysis /></TabsContent>
        <TabsContent value="trials"><PeoDPTrialsManager /></TabsContent>
        <TabsContent value="asog"><ASOGStatusBoard /></TabsContent>
        <TabsContent value="audit-prep"><PeoDPAuditPrep /></TabsContent>
        <Suspense fallback={<LoadingFallback />}>
          <TabsContent value="interview">
            <ComplianceInterviewSimulator
              moduleId="peo-dp" moduleName="PEO-DP"
              standardContext="PEO-DP Petrobras 2021 audit simulation. 7 sections covering DP Management, Resources, Training, Operations, Maintenance, Emergency Preparedness, and Continuous Improvement. Focus on IPCLV indicators, FMEA compliance, ASOG/CAM procedures, DP trials records, and DPO qualifications per IMCA M 117."
            />
          </TabsContent>
          <TabsContent value="checklist-ia">
            <ComplianceAutoChecklistGenerator moduleId="peo-dp" moduleName="PEO-DP" />
          </TabsContent>
        </Suspense>
      </Tabs>

      <ModuleActionButton
        moduleId="peo-dp" moduleName="PEO-DP"
        actions={[
          { id: "plan", label: "Plano DP", icon: <Target className="h-3 w-3" />, action: () => {} },
          { id: "kpis", label: "KPIs", icon: <BarChart3 className="h-3 w-3" />, action: () => {} },
          { id: "fmea", label: "FMEA", icon: <Settings className="h-3 w-3" />, action: () => {} },
          { id: "trials", label: "Trials", icon: <CheckCircle className="h-3 w-3" />, action: () => {} },
        ]}
        quickActions={[
          { id: "refresh", label: "Atualizar", icon: <RefreshCw className="h-3 w-3" />, action: () => handleRefresh("PEO-DP"), shortcut: "F5" },
          { id: "export", label: "Exportar", icon: <Download className="h-3 w-3" />, action: () => handleExport("PEO-DP") },
        ]}
      />
    </ModulePageWrapper>
  );
};

export default PEODP;
