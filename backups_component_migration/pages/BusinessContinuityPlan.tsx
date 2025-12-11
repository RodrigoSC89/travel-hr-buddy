import React, { lazy, Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield } from "lucide-react";

// Lazy load heavy components
const RiskManagementDashboard = lazy(() => import("@/components/bcp/risk-management-dashboard").then(m => ({ default: m.RiskManagementDashboard })));
const BackupRecoverySystem = lazy(() => import("@/components/bcp/backup-recovery-system").then(m => ({ default: m.BackupRecoverySystem })));
const ComplianceAuditCenter = lazy(() => import("@/components/bcp/compliance-audit-center").then(m => ({ default: m.ComplianceAuditCenter })));
const ContinuousTestingMonitoring = lazy(() => import("@/components/bcp/continuous-testing-monitoring").then(m => ({ default: m.ContinuousTestingMonitoring })));

const BusinessContinuityPlan = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 rounded-lg bg-primary/10">
          <Shield className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Business Continuity Plan</h1>
          <p className="text-muted-foreground">
            Plano completo de continuidade operacional e gestão de riscos
          </p>
        </div>
      </div>
      
      <Tabs defaultValue="risks" className="space-y-4">
        <div className="w-full overflow-x-auto pb-2">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-2 md:grid-cols-4 min-w-fit">
            <TabsTrigger value="risks">
              <span className="hidden sm:inline">Gestão de Riscos</span>
              <span className="sm:hidden">Riscos</span>
            </TabsTrigger>
            <TabsTrigger value="backup">
              <span className="hidden sm:inline">Backup & Recuperação</span>
              <span className="sm:hidden">Backup</span>
            </TabsTrigger>
            <TabsTrigger value="compliance">
              <span className="hidden sm:inline">Compliance & Auditoria</span>
              <span className="sm:hidden">Compliance</span>
            </TabsTrigger>
            <TabsTrigger value="testing">
              <span className="hidden sm:inline">Testes & Monitoramento</span>
              <span className="sm:hidden">Testes</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="risks">
          <Suspense fallback={<Skeleton className="h-96 w-full" />}>
            <RiskManagementDashboard />
          </Suspense>
        </TabsContent>

        <TabsContent value="backup">
          <Suspense fallback={<Skeleton className="h-96 w-full" />}>
            <BackupRecoverySystem />
          </Suspense>
        </TabsContent>

        <TabsContent value="compliance">
          <Suspense fallback={<Skeleton className="h-96 w-full" />}>
            <ComplianceAuditCenter />
          </Suspense>
        </TabsContent>

        <TabsContent value="testing">
          <Suspense fallback={<Skeleton className="h-96 w-full" />}>
            <ContinuousTestingMonitoring />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BusinessContinuityPlan;