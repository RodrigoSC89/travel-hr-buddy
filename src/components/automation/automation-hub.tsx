import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Settings, FileText, Lightbulb } from "lucide-react";

import { SmartOnboardingWizard } from "./smart-onboarding-wizard";
import { AISuggestionsPanel } from "./ai-suggestions-panel";
import { AutomationWorkflowsManager } from "./automation-workflows-manager";
import { AutomatedReportsManager } from "./automated-reports-manager";

export const AutomationHub: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Zap className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-bold">Centro de Automação IA</h1>
        </div>
        <p className="text-muted-foreground">
          Gerencie automações inteligentes, sugestões de IA e relatórios automáticos
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Automações Ativas</p>
                <p className="text-2xl font-bold">3</p>
              </div>
              <Settings className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sugestões IA</p>
                <p className="text-2xl font-bold">7</p>
              </div>
              <Lightbulb className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Relatórios Automáticos</p>
                <p className="text-2xl font-bold">5</p>
              </div>
              <FileText className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tempo Economizado</p>
                <p className="text-2xl font-bold">12h</p>
                <p className="text-sm text-green-600">esta semana</p>
              </div>
              <Zap className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="suggestions" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="suggestions">Sugestões IA</TabsTrigger>
          <TabsTrigger value="workflows">Automações</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
          <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
        </TabsList>

        <TabsContent value="suggestions">
          <AISuggestionsPanel />
        </TabsContent>

        <TabsContent value="workflows">
          <AutomationWorkflowsManager />
        </TabsContent>

        <TabsContent value="reports">
          <AutomatedReportsManager />
        </TabsContent>

        <TabsContent value="onboarding">
          <SmartOnboardingWizard />
        </TabsContent>
      </Tabs>
    </div>
  );
};
