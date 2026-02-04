import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Stethoscope, 
  LayoutDashboard, 
  Users, 
  Pill, 
  FileText, 
  Brain, 
  ClipboardList,
  Activity
} from "lucide-react";
import EnhancedInfirmaryDashboard from "./components/EnhancedInfirmaryDashboard";
import CrewHealthTab from "./components/CrewHealthTab";
import SuppliesTab from "./components/SuppliesTab";
import RecordsTab from "./components/RecordsTab";
import ReportsTab from "./components/ReportsTab";
import MedicalConsultationsTab from "./components/MedicalConsultationsTab";

export default function MedicalInfirmary() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-gradient-to-r from-destructive/10 via-destructive/5 to-accent/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-destructive to-destructive/80 text-destructive-foreground">
              <Stethoscope className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                Enfermaria Digital
                <Badge variant="secondary" className="ml-2">
                  <Brain className="h-3 w-3 mr-1" />
                  AI-Powered
                </Badge>
              </h1>
              <p className="text-muted-foreground">
                Gestão de saúde, medicamentos e atendimentos conforme MLC e NORMAM
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full max-w-4xl grid-cols-6">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="consultations" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Atendimentos</span>
            </TabsTrigger>
            <TabsTrigger value="crew" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Tripulação</span>
            </TabsTrigger>
            <TabsTrigger value="supplies" className="flex items-center gap-2">
              <Pill className="h-4 w-4" />
              <span className="hidden sm:inline">Estoque</span>
            </TabsTrigger>
            <TabsTrigger value="records" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              <span className="hidden sm:inline">Prontuários</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Relatórios</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <EnhancedInfirmaryDashboard />
          </TabsContent>

          <TabsContent value="consultations">
            <MedicalConsultationsTab />
          </TabsContent>

          <TabsContent value="crew">
            <CrewHealthTab />
          </TabsContent>

          <TabsContent value="supplies">
            <SuppliesTab />
          </TabsContent>

          <TabsContent value="records">
            <RecordsTab />
          </TabsContent>

          <TabsContent value="reports">
            <ReportsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
