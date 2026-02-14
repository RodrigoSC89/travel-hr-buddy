/**
 * ISPS Security Page - International Ship and Port Facility Security Code
 * Usa o componente ISPSModule completo (SSP, Assessments, Drills, Cybersecurity)
 * Módulo dedicado - NÃO é o mesmo que Security Center
 */
import React from "react";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import ModuleActionButton from "@/components/ui/module-action-button";
import { ISPSModule } from "@/components/safety/ISPSModule";
import { useMaritimeActions } from "@/hooks/useMaritimeActions";
import {
  Shield,
  Lock,
  ShieldAlert,
  Users,
  RefreshCw,
  Download,
  FileCheck,
  AlertTriangle,
  Eye,
} from "lucide-react";

const ISPSSecurityPage = () => {
  const { handleExport, handleRefresh } = useMaritimeActions();

  return (
    <ModulePageWrapper gradient="purple">
      <ModuleHeader
        icon={ShieldAlert}
        title="ISPS Code - Ship & Port Facility Security"
        description="International Ship and Port Facility Security Code - SOLAS Chapter XI-2"
        gradient="purple"
        badges={[
          { icon: Lock, label: "ISPS Compliant" },
          { icon: Shield, label: "SSP/SSA" },
          { icon: Users, label: "CSO/SSO" },
          { icon: Eye, label: "Security Monitoring" },
        ]}
      />

      {/* Full ISPS Module - SSP, Assessments, Drills, Cybersecurity */}
      <ISPSModule />

      <ModuleActionButton
        moduleId="isps-security"
        moduleName="ISPS Security"
        actions={[
          { id: "ssp", label: "Ship Security Plan", icon: <FileCheck className="h-3 w-3" />, action: () => {
            const tab = document.querySelector('[value="ssp"]') as HTMLElement;
            if (tab) tab.click();
          }},
          { id: "assessments", label: "Assessments", icon: <Shield className="h-3 w-3" />, action: () => {
            const tab = document.querySelector('[value="assessments"]') as HTMLElement;
            if (tab) tab.click();
          }},
          { id: "drills", label: "Security Drills", icon: <Users className="h-3 w-3" />, action: () => {
            const tab = document.querySelector('[value="drills"]') as HTMLElement;
            if (tab) tab.click();
          }},
          { id: "cyber", label: "Cybersecurity", icon: <Lock className="h-3 w-3" />, action: () => {
            const tab = document.querySelector('[value="cyber"]') as HTMLElement;
            if (tab) tab.click();
          }},
          { id: "threats", label: "Ameaças", icon: <AlertTriangle className="h-3 w-3" />, action: () => {
            const tab = document.querySelector('[value="cyber"]') as HTMLElement;
            if (tab) tab.click();
          }},
        ]}
        quickActions={[
          { id: "refresh", label: "Atualizar", icon: <RefreshCw className="h-3 w-3" />, action: () => handleRefresh("ISPS"), shortcut: "F5" },
          { id: "export", label: "Exportar SSP", icon: <Download className="h-3 w-3" />, action: () => handleExport("ISPS") },
        ]}
      />
    </ModulePageWrapper>
  );
};

export default ISPSSecurityPage;
