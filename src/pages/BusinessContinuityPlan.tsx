import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RiskManagementDashboard } from '@/components/bcp/risk-management-dashboard';
import { BackupRecoverySystem } from '@/components/bcp/backup-recovery-system';
import { ComplianceAuditCenter } from '@/components/bcp/compliance-audit-center';
import { ContinuousTestingMonitoring } from '@/components/bcp/continuous-testing-monitoring';
import { Shield } from 'lucide-react';
import VoiceInterface from '@/components/voice/VoiceInterface';

const BusinessContinuityPlan = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 p-6 space-y-6">
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
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="risks">Gestão de Riscos</TabsTrigger>
              <TabsTrigger value="backup">Backup & Recuperação</TabsTrigger>
              <TabsTrigger value="compliance">Compliance & Auditoria</TabsTrigger>
              <TabsTrigger value="testing">Testes & Monitoramento</TabsTrigger>
            </TabsList>

            <TabsContent value="risks">
              <RiskManagementDashboard />
            </TabsContent>

            <TabsContent value="backup">
              <BackupRecoverySystem />
            </TabsContent>

            <TabsContent value="compliance">
              <ComplianceAuditCenter />
            </TabsContent>

            <TabsContent value="testing">
              <ContinuousTestingMonitoring />
            </TabsContent>
          </Tabs>
        </main>
        <VoiceInterface />
      </div>
    </SidebarProvider>
  );
};

export default BusinessContinuityPlan;