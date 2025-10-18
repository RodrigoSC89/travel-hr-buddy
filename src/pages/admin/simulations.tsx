import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MultiTenantWrapper } from "@/components/layout/multi-tenant-wrapper";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { RoleBasedAccess } from "@/components/auth/role-based-access";
import { 
  Ship, 
  Calendar, 
  AlertTriangle, 
  CheckCircle,
  FileText
} from "lucide-react";
import { SimulationExerciseList } from "@/components/admin/simulations/SimulationExerciseList";
import { SimulationCalendar } from "@/components/admin/simulations/SimulationCalendar";
import { SimulationStats } from "@/components/admin/simulations/SimulationStats";
import { CreateSimulationDialog } from "@/components/admin/simulations/CreateSimulationDialog";

const AdminSimulations = () => {
  const [activeTab, setActiveTab] = useState("list");
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  return (
    <RoleBasedAccess roles={["admin", "hr_manager", "safety_officer"]}>
      <MultiTenantWrapper>
        <ModulePageWrapper gradient="blue">
          <ModuleHeader
            title="Controle de Simulações Embarcadas"
            description="Gerenciamento de simulações obrigatórias (IMCA, MTS, IBAMA)"
            icon={<Ship className="h-8 w-8" />}
            badge={
              <Badge variant="default" className="text-sm">
                <CheckCircle className="mr-2 h-4 w-4" />
                Compliance IMCA/MTS/IBAMA
              </Badge>
            }
          />

          <div className="container mx-auto p-6 space-y-6">
            {/* Statistics Overview */}
            <SimulationStats />

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <Button onClick={() => setShowCreateDialog(true)}>
                <Calendar className="mr-2 h-4 w-4" />
                Agendar Simulação
              </Button>
            </div>

            {/* Main Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="list">
                  <FileText className="mr-2 h-4 w-4" />
                  Lista de Simulações
                </TabsTrigger>
                <TabsTrigger value="calendar">
                  <Calendar className="mr-2 h-4 w-4" />
                  Calendário
                </TabsTrigger>
                <TabsTrigger value="alerts">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Alertas
                </TabsTrigger>
              </TabsList>

              <TabsContent value="list" className="space-y-4">
                <SimulationExerciseList />
              </TabsContent>

              <TabsContent value="calendar" className="space-y-4">
                <SimulationCalendar />
              </TabsContent>

              <TabsContent value="alerts" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      Simulações Atrasadas
                    </CardTitle>
                    <CardDescription>
                      Simulações que ultrapassaram o prazo previsto
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      Carregando alertas de simulações atrasadas...
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Create Simulation Dialog */}
            <CreateSimulationDialog 
              open={showCreateDialog}
              onOpenChange={setShowCreateDialog}
            />
          </div>
        </ModulePageWrapper>
      </MultiTenantWrapper>
    </RoleBasedAccess>
  );
};

export default AdminSimulations;
