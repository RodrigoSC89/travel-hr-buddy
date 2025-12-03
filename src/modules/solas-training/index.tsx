import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, LayoutDashboard, Calendar, Users, FileText, Brain } from "lucide-react";
import TrainingDashboard from "./components/TrainingDashboard";

export default function SolasTraining() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-gradient-to-r from-orange-500/10 via-red-500/10 to-amber-500/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 text-white">
              <ShieldAlert className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                SOLAS & ISM Training
                <Badge variant="secondary" className="ml-2">
                  <Brain className="h-3 w-3 mr-1" />
                  AI-Assisted
                </Badge>
              </h1>
              <p className="text-muted-foreground">
                Exercícios de segurança, drills obrigatórios e certificações STCW
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
            <TabsTrigger value="drills" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Drills</span>
            </TabsTrigger>
            <TabsTrigger value="crew" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Tripulação</span>
            </TabsTrigger>
            <TabsTrigger value="certs" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Certificações</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Relatórios</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <TrainingDashboard />
          </TabsContent>

          <TabsContent value="drills">
            <div className="text-center py-12 text-muted-foreground">
              Calendário completo de drills - Em desenvolvimento
            </div>
          </TabsContent>

          <TabsContent value="crew">
            <div className="text-center py-12 text-muted-foreground">
              Histórico de participação da tripulação - Em desenvolvimento
            </div>
          </TabsContent>

          <TabsContent value="certs">
            <div className="text-center py-12 text-muted-foreground">
              Gestão de certificações STCW - Em desenvolvimento
            </div>
          </TabsContent>

          <TabsContent value="reports">
            <div className="text-center py-12 text-muted-foreground">
              Relatórios ISM e Safety Drill Log - Em desenvolvimento
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
