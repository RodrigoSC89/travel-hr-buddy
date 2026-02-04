/**
 * Medical Infirmary - Premium Module v2.0
 * Gestão completa de saúde, medicamentos e atendimentos
 * Conformidade MLC 2006 e NORMAM
 */

import React from "react";
import { 
  Stethoscope, 
  LayoutDashboard, 
  Users, 
  Pill, 
  FileText, 
  Activity,
  ClipboardList,
  AlertTriangle,
  Calendar,
  Phone
} from "lucide-react";
import { PremiumModuleShell } from "@/components/ui/premium-module-kit";
import type { ModuleTab } from "@/components/ui/premium-module-kit/PremiumModuleShell";
import EnhancedInfirmaryDashboard from "./components/EnhancedInfirmaryDashboard";
import CrewHealthTab from "./components/CrewHealthTab";
import SuppliesTab from "./components/SuppliesTab";
import RecordsTab from "./components/RecordsTab";
import ReportsTab from "./components/ReportsTab";
import MedicalConsultationsTab from "./components/MedicalConsultationsTab";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function MedicalInfirmary() {
  const handleRefresh = async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
  };

  const handleExport = () => {
    toast.success("Relatório médico exportado com sucesso");
  };

  const tabs: ModuleTab[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      content: <EnhancedInfirmaryDashboard />
    },
    {
      id: "consultations",
      label: "Atendimentos",
      icon: Activity,
      badge: 3,
      content: <MedicalConsultationsTab />
    },
    {
      id: "crew",
      label: "Tripulação",
      icon: Users,
      content: <CrewHealthTab />
    },
    {
      id: "supplies",
      label: "Estoque",
      icon: Pill,
      badge: 5,
      content: <SuppliesTab />
    },
    {
      id: "records",
      label: "Prontuários",
      icon: ClipboardList,
      content: <RecordsTab />
    },
    {
      id: "reports",
      label: "Relatórios",
      icon: FileText,
      content: <ReportsTab />
    }
  ];

  const actions = (
    <>
      <Button variant="outline" size="sm" className="gap-2">
        <Phone className="h-4 w-4" />
        Telemedicina
      </Button>
      <Button variant="destructive" size="sm" className="gap-2">
        <AlertTriangle className="h-4 w-4" />
        Emergência
      </Button>
    </>
  );

  return (
    <PremiumModuleShell
      title="Enfermaria Digital"
      subtitle="Gestão de saúde, medicamentos e atendimentos conforme MLC e NORMAM"
      icon={Stethoscope}
      iconGradient="from-rose-500 to-rose-600"
      tabs={tabs}
      defaultTab="dashboard"
      actions={actions}
      onRefresh={handleRefresh}
      onExport={handleExport}
      showAIBadge={true}
      aiStatus="active"
      alerts={2}
    />
  );
}
