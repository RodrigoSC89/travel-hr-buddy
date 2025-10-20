import React from "react";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import DPIntelligenceCenter from "@/components/dp-intelligence/dp-intelligence-center";
import DPIntelligenceDashboard from "@/components/dp-intelligence/DPIntelligenceDashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain,
  Shield,
  FileText,
  TrendingUp,
  BarChart3
} from "lucide-react";

const DPIntelligence = () => {
  return (
    <ModulePageWrapper gradient="blue">
      <ModuleHeader
        icon={Brain}
        title="Centro de Inteligência DP"
        description="Base de conhecimento de incidentes DP com análise por IA"
        gradient="indigo"
        badges={[
          { icon: Shield, label: "IMCA Compliance" },
          { icon: FileText, label: "Relatórios Técnicos" },
          { icon: TrendingUp, label: "Análise IA" }
        ]}
      />
      
      <Tabs defaultValue="incidents" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="incidents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Incidentes
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard Analítico
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="incidents">
          <DPIntelligenceCenter />
        </TabsContent>
        
        <TabsContent value="dashboard">
          <DPIntelligenceDashboard />
        </TabsContent>
      </Tabs>
    </ModulePageWrapper>
  );
};

export default DPIntelligence;
