import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MultiTenantWrapper } from "@/components/layout/multi-tenant-wrapper";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { RoleBasedAccess } from "@/components/auth/role-based-access";
import { 
  Clock, 
  PlayCircle,
  Calendar,
  RefreshCw
} from "lucide-react";
import { CronJobsPanel } from "@/components/admin/cron/CronJobsPanel";
import { CronJobStats as CronStatsPanel } from "@/components/admin/cron/CronJobStats";
import { CronJobExecutions } from "@/components/admin/cron/CronJobExecutions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminCronMonitor = () => {
  const [activeTab, setActiveTab] = useState("jobs");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <RoleBasedAccess roles={["admin", "hr_manager"]}>
      <MultiTenantWrapper>
        <ModulePageWrapper gradient="purple">
          <ModuleHeader
            title="Monitor de Tarefas Agendadas (Cron)"
            description="Visualização e controle de tarefas automáticas do sistema"
            icon={<Clock className="h-8 w-8" />}
            badge={
              <Badge variant="default" className="text-sm">
                <Calendar className="mr-2 h-4 w-4" />
                Tarefas SGSO
              </Badge>
            }
          />

          <div className="container mx-auto p-6 space-y-6">
            {/* Statistics Overview */}
            <CronStatsPanel key={refreshTrigger} />

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={handleRefresh}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Atualizar
              </Button>
            </div>

            {/* Main Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="jobs">
                  <Clock className="mr-2 h-4 w-4" />
                  Tarefas Agendadas
                </TabsTrigger>
                <TabsTrigger value="executions">
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Histórico de Execuções
                </TabsTrigger>
              </TabsList>

              <TabsContent value="jobs" className="space-y-4">
                <CronJobsPanel key={refreshTrigger} />
              </TabsContent>

              <TabsContent value="executions" className="space-y-4">
                <CronJobExecutions key={refreshTrigger} />
              </TabsContent>
            </Tabs>

            {/* Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Sobre as Tarefas Agendadas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="text-muted-foreground">
                  Este painel monitora tarefas automáticas essenciais do sistema, incluindo:
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li>Envio de e-mails e notificações</li>
                  <li>Geração de relatórios periódicos</li>
                  <li>Validação de conformidade SGSO</li>
                  <li>Forecasts de falha preditiva</li>
                  <li>Backup e arquivamento de dados</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </ModulePageWrapper>
      </MultiTenantWrapper>
    </RoleBasedAccess>
  );
};

export default AdminCronMonitor;
