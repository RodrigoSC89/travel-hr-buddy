import { useState } from "react";;
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import {
  Users,
  MessageSquare,
  FileText,
  Calendar,
  Brain,
  Shield,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Ship,
  Award
} from "lucide-react";

// Import crew components
import { CrewRealtimeWorkspace } from "@/components/crew/crew-realtime-workspace";
import { CrewScheduleManager } from "@/components/crew/crew-schedule-manager";
import { CrewDossierManager } from "@/components/crew/crew-dossier-manager";
import { CrewAIInsights } from "@/components/crew/crew-ai-insights";
import { CrewCertificationsManager } from "@/components/crew/crew-certifications-manager";

const CrewModuleProfessional = () => {
  const [activeTab, setActiveTab] = useState("workspace");

  // Mock stats
  const stats = {
    totalCrew: 156,
    activeCrew: 134,
    onShore: 22,
    certExpiring: 8,
    embarkedToday: 5,
    complianceRate: 94
  };

  return (
    <ModulePageWrapper gradient="blue">
      <ModuleHeader
        icon={Users}
        title="Gestão de Tripulação"
        description="Sistema completo de gestão de tripulação com IA integrada, comunicação em tempo real e dossiês digitais"
        gradient="blue"
        badges={[
          { icon: Brain, label: "IA Integrada" },
          { icon: MessageSquare, label: "Tempo Real" },
          { icon: Shield, label: "Compliance" }
        ]}
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        <Card className="p-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-lg font-semibold">{stats.totalCrew}</p>
            </div>
          </div>
        </Card>

        <Card className="p-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-success/10 rounded-lg">
              <Ship className="h-4 w-4 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Embarcados</p>
              <p className="text-lg font-semibold text-success">{stats.activeCrew}</p>
            </div>
          </div>
        </Card>

        <Card className="p-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-info/10 rounded-lg">
              <Clock className="h-4 w-4 text-info" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Em Terra</p>
              <p className="text-lg font-semibold text-info">{stats.onShore}</p>
            </div>
          </div>
        </Card>

        <Card className="p-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-warning/10 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Cert. Expirando</p>
              <p className="text-lg font-semibold text-warning">{stats.certExpiring}</p>
            </div>
          </div>
        </Card>

        <Card className="p-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Embarques Hoje</p>
              <p className="text-lg font-semibold">{stats.embarkedToday}</p>
            </div>
          </div>
        </Card>

        <Card className="p-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-success/10 rounded-lg">
              <CheckCircle className="h-4 w-4 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Compliance</p>
              <p className="text-lg font-semibold text-success">{stats.complianceRate}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="workspace" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden md:inline">Workspace</span>
          </TabsTrigger>
          <TabsTrigger value="dossier" className="gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden md:inline">Dossiês</span>
          </TabsTrigger>
          <TabsTrigger value="schedules" className="gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden md:inline">Escalas</span>
          </TabsTrigger>
          <TabsTrigger value="certifications" className="gap-2">
            <Award className="h-4 w-4" />
            <span className="hidden md:inline">Certificações</span>
          </TabsTrigger>
          <TabsTrigger value="ai-insights" className="gap-2 bg-gradient-to-r from-primary/10 to-secondary/10">
            <Brain className="h-4 w-4" />
            <span className="hidden md:inline">IA Insights</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="workspace" className="mt-6">
          <CrewRealtimeWorkspace />
        </TabsContent>

        <TabsContent value="dossier" className="mt-6">
          <CrewDossierManager />
        </TabsContent>

        <TabsContent value="schedules" className="mt-6">
          <CrewScheduleManager />
        </TabsContent>

        <TabsContent value="certifications" className="mt-6">
          <CrewCertificationsManager />
        </TabsContent>

        <TabsContent value="ai-insights" className="mt-6">
          <CrewAIInsights crew={[
            { id: "1", full_name: "João Silva", position: "Comandante", nationality: "Brasileiro", status: "active", experience_years: 15 },
            { id: "2", full_name: "Carlos Santos", position: "Chefe de Máquinas", nationality: "Brasileiro", status: "active", experience_years: 12 },
            { id: "3", full_name: "Maria Oliveira", position: "Oficial de Convés", nationality: "Brasileira", status: "shore_leave", experience_years: 8 }
          ]} />
        </TabsContent>
      </Tabs>
    </ModulePageWrapper>
  );
};

export default CrewModuleProfessional;
