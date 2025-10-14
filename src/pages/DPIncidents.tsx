import React from "react";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import IncidentCards from "@/components/dp/IncidentCards";
import {
  Shield,
  AlertTriangle,
  FileText,
  TrendingUp
} from "lucide-react";

const DPIncidents = () => {
  return (
    <ModulePageWrapper gradient="blue">
      <ModuleHeader
        icon={AlertTriangle}
        title="DP Incident Intelligence Feed"
        description="Base de conhecimento de incidentes DP com análise por IA"
        gradient="indigo"
        badges={[
          { icon: Shield, label: "IMCA Database" },
          { icon: FileText, label: "Relatórios Completos" },
          { icon: TrendingUp, label: "Análise IA" }
        ]}
      />

      <div className="container mx-auto p-6">
        <IncidentCards />
      </div>
    </ModulePageWrapper>
  );
};

export default DPIncidents;
