import React from "react";
import { AdminPanel } from "@/components/auth/admin-panel";
import { MultiTenantWrapper } from "@/components/layout/multi-tenant-wrapper";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { Shield, Users, Settings, Lock } from "lucide-react";

const Admin = () => {
  return (
    <MultiTenantWrapper>
      <ModulePageWrapper gradient="purple">
        <ModuleHeader
          icon={Shield}
          title="Painel Administrativo"
          description="Gerenciamento completo de usuários, permissões e configurações do sistema"
          gradient="purple"
          badges={[
            { icon: Users, label: "Gestão de Usuários" },
            { icon: Lock, label: "Segurança" },
            { icon: Settings, label: "Configurações" },
          ]}
        />
        <AdminPanel />
      </ModulePageWrapper>
    </MultiTenantWrapper>
  );
};

export default Admin;
