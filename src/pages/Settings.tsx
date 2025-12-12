import React from "react";
import { EnhancedSettingsHub } from "@/components/settings/enhanced-settings-hub";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { Settings as SettingsIcon, User, Bell, Shield } from "lucide-react";

const Settings = () => {
  return (
    <ModulePageWrapper gradient="neutral">
      <ModuleHeader
        icon={SettingsIcon}
        title="Configurações"
        description="Configure preferências do sistema, conta e notificações"
        gradient="indigo"
        badges={[
          { icon: User, label: "Perfil" },
          { icon: Bell, label: "Notificações" },
          { icon: Shield, label: "Segurança" }
        ]}
      />
      <EnhancedSettingsHub />
    </ModulePageWrapper>
  );
};

export default Settings;