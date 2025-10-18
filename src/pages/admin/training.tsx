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
  GraduationCap, 
  Users, 
  BookOpen, 
  Award,
  AlertTriangle,
  FileText
} from "lucide-react";
import { TrainingModuleList } from "@/components/admin/training/TrainingModuleList";
import { CrewTrainingRecords } from "@/components/admin/training/CrewTrainingRecords";
import { TrainingStats } from "@/components/admin/training/TrainingStats";
import { CreateTrainingDialog } from "@/components/admin/training/CreateTrainingDialog";
import { ExpiredTrainings } from "@/components/admin/training/ExpiredTrainings";

const AdminTraining = () => {
  const [activeTab, setActiveTab] = useState("records");
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  return (
    <RoleBasedAccess roles={["admin", "hr_manager", "training_coordinator"]}>
      <MultiTenantWrapper>
        <ModulePageWrapper gradient="green">
          <ModuleHeader
            title="Gestão de Treinamento e Capacitação"
            description="Controle de treinamentos e certificações da tripulação"
            icon={<GraduationCap className="h-8 w-8" />}
            badge={
              <Badge variant="default" className="text-sm">
                <Award className="mr-2 h-4 w-4" />
                Compliance IMCA/IBAMA
              </Badge>
            }
          />

          <div className="container mx-auto p-6 space-y-6">
            {/* Statistics Overview */}
            <TrainingStats />

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <Button onClick={() => setShowCreateDialog(true)}>
                <BookOpen className="mr-2 h-4 w-4" />
                Registrar Treinamento
              </Button>
            </div>

            {/* Main Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="records">
                  <FileText className="mr-2 h-4 w-4" />
                  Registros
                </TabsTrigger>
                <TabsTrigger value="modules">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Módulos
                </TabsTrigger>
                <TabsTrigger value="crew">
                  <Users className="mr-2 h-4 w-4" />
                  Por Tripulante
                </TabsTrigger>
                <TabsTrigger value="expired">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Vencidos
                </TabsTrigger>
              </TabsList>

              <TabsContent value="records" className="space-y-4">
                <CrewTrainingRecords />
              </TabsContent>

              <TabsContent value="modules" className="space-y-4">
                <TrainingModuleList />
              </TabsContent>

              <TabsContent value="crew" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Treinamentos por Tripulante</CardTitle>
                    <CardDescription>
                      Status de treinamento e compliance individual
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      Carregando dados de treinamento por tripulante...
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="expired" className="space-y-4">
                <ExpiredTrainings />
              </TabsContent>
            </Tabs>

            {/* Create Training Dialog */}
            <CreateTrainingDialog 
              open={showCreateDialog}
              onOpenChange={setShowCreateDialog}
            />

            {/* Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Integração com RH e Compliance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="text-muted-foreground">
                  O sistema rastreia e valida que tripulantes envolvidos em falhas passaram por:
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li>Capacitação técnica relacionada ao tipo de falha</li>
                  <li>Certificados vinculados ao dossiê do tripulante</li>
                  <li>Prazo automático para revalidação</li>
                  <li>PDF de certificação com QR code de validação</li>
                  <li>Vinculação com incidentes técnicos que motivaram o treinamento</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </ModulePageWrapper>
      </MultiTenantWrapper>
    </RoleBasedAccess>
  );
};

export default AdminTraining;
