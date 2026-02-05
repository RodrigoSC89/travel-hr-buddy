/**
 * Compliance Hub Premium - Centro de Conformidade Completo
 * Integra todos os componentes de compliance com abas
 * ENTERPRISE UPGRADE - Phase 5
 */

import React, { Suspense, lazy } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  LayoutDashboard, Shield, ClipboardCheck, Award, 
  FileText, Users, AlertTriangle, Brain, Target, CheckCircle
} from "lucide-react";

// Lazy load original components
const ComplianceDashboard = lazy(() => import("@/modules/compliance-hub/ComplianceHubPremium"));
const AuditWorkflow = lazy(() => import("@/modules/compliance-hub/components/AuditWorkflow"));
const ComplianceIntelligence = lazy(() => import("@/components/premium/ComplianceIntelligence"));
const ComplianceAuditIntelligence = lazy(() => import("@/components/premium/ComplianceAuditIntelligence"));

// Enterprise Components - Phase 5
import { 
  ComplianceScorecard,
  AuditManagement,
  CertificateTracker,
  RiskMatrix
} from "@/components/enterprise";

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <Skeleton className="h-96" />
    </div>
  );
}

export default function ComplianceHubPremiumPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Shield className="h-8 w-8 text-violet-500" />
            Compliance Hub
          </h1>
          <p className="text-muted-foreground mt-1">
            Centro de conformidade MLC 2006, STCW, ISM/ISPS
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-success/10 text-success">
            98% Conforme
          </Badge>
          <Badge variant="outline" className="bg-purple-500/10 text-purple-600">
            <Brain className="h-3 w-3 mr-1" />
            IA Preditiva
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="intelligence" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10 h-auto p-1">
          <TabsTrigger value="intelligence" className="flex flex-col items-center gap-1 py-2">
            <Brain className="h-4 w-4" />
            <span className="text-xs">Intelligence</span>
          </TabsTrigger>
          <TabsTrigger value="scorecard" className="flex flex-col items-center gap-1 py-2">
            <CheckCircle className="h-4 w-4" />
            <span className="text-xs">Scorecard</span>
          </TabsTrigger>
          <TabsTrigger value="audits" className="flex flex-col items-center gap-1 py-2">
            <ClipboardCheck className="h-4 w-4" />
            <span className="text-xs">Auditorias</span>
          </TabsTrigger>
          <TabsTrigger value="audit-mgmt" className="flex flex-col items-center gap-1 py-2">
            <FileText className="h-4 w-4" />
            <span className="text-xs">Gestão</span>
          </TabsTrigger>
          <TabsTrigger value="certificates" className="flex flex-col items-center gap-1 py-2">
            <Award className="h-4 w-4" />
            <span className="text-xs">Certificados</span>
          </TabsTrigger>
          <TabsTrigger value="cert-tracker" className="flex flex-col items-center gap-1 py-2">
            <Award className="h-4 w-4" />
            <span className="text-xs">Tracker</span>
          </TabsTrigger>
          <TabsTrigger value="mlc" className="flex flex-col items-center gap-1 py-2">
            <Users className="h-4 w-4" />
            <span className="text-xs">MLC 2006</span>
          </TabsTrigger>
          <TabsTrigger value="ism" className="flex flex-col items-center gap-1 py-2">
            <Shield className="h-4 w-4" />
            <span className="text-xs">ISM/ISPS</span>
          </TabsTrigger>
          <TabsTrigger value="risk" className="flex flex-col items-center gap-1 py-2">
            <Target className="h-4 w-4" />
            <span className="text-xs">Riscos</span>
          </TabsTrigger>
          <TabsTrigger value="risk-matrix" className="flex flex-col items-center gap-1 py-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-xs">Matriz</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="intelligence">
          <Suspense fallback={<LoadingSkeleton />}>
            <ComplianceAuditIntelligence />
          </Suspense>
        </TabsContent>

        {/* Enterprise Components */}
        <TabsContent value="scorecard">
          <ComplianceScorecard />
        </TabsContent>

        <TabsContent value="audits">
          <Suspense fallback={<LoadingSkeleton />}>
            <AuditWorkflow />
          </Suspense>
        </TabsContent>

        <TabsContent value="audit-mgmt">
          <AuditManagement />
        </TabsContent>

        <TabsContent value="certificates">
          <Suspense fallback={<LoadingSkeleton />}>
            <ComplianceDashboard />
          </Suspense>
        </TabsContent>

        <TabsContent value="cert-tracker">
          <CertificateTracker />
        </TabsContent>

        <TabsContent value="mlc">
          <div className="text-center py-12 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">MLC 2006 Compliance</p>
            <p className="text-sm">Maritime Labour Convention - Condições de trabalho e vida a bordo</p>
          </div>
        </TabsContent>

        <TabsContent value="ism">
          <div className="text-center py-12 text-muted-foreground">
            <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">ISM/ISPS Code</p>
            <p className="text-sm">Gestão de segurança e proteção marítima</p>
          </div>
        </TabsContent>

        <TabsContent value="risk">
          <div className="text-center py-12 text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">Análise de Riscos</p>
            <p className="text-sm">Identificação e mitigação de riscos operacionais</p>
          </div>
        </TabsContent>

        <TabsContent value="risk-matrix">
          <RiskMatrix />
        </TabsContent>
      </Tabs>
    </div>
  );
}
