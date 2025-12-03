import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Stethoscope, LayoutDashboard, Users, Pill, FileText, Brain } from "lucide-react";
import InfirmaryDashboard from "./components/InfirmaryDashboard";

export default function MedicalInfirmary() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-gradient-to-r from-red-500/10 via-pink-500/10 to-rose-500/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 text-white">
              <Stethoscope className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                Enfermaria Digital
                <Badge variant="secondary" className="ml-2">
                  <Brain className="h-3 w-3 mr-1" />
                  AI-Assisted
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
          <TabsList className="grid w-full max-w-2xl grid-cols-5">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
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
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Prontuários</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Relatórios</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <InfirmaryDashboard />
          </TabsContent>

          <TabsContent value="crew">
            <div className="text-center py-12 text-muted-foreground">
              Fichas médicas da tripulação - Em desenvolvimento
            </div>
          </TabsContent>

          <TabsContent value="supplies">
            <div className="text-center py-12 text-muted-foreground">
              Gestão completa de estoque médico - Em desenvolvimento
            </div>
          </TabsContent>

          <TabsContent value="records">
            <div className="text-center py-12 text-muted-foreground">
              Prontuários e histórico de atendimentos - Em desenvolvimento
            </div>
          </TabsContent>

          <TabsContent value="reports">
            <div className="text-center py-12 text-muted-foreground">
              Relatórios MLC e Port State - Em desenvolvimento
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
