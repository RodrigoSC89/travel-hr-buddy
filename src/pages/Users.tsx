import { UserManagementHub } from "@/components/admin/UserManagementHub";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { Users as UsersIcon, UserPlus, Shield, Settings, Download } from "lucide-react";

export default function Users() {
  return (
    <ModulePageWrapper gradient="blue">
      <ModuleHeader
        icon={UsersIcon}
        title="Gestão de Usuários"
        description="Administração completa de usuários, permissões e convites da organização"
        gradient="blue"
        badges={[
          { icon: UserPlus, label: "Convites" },
          { icon: Shield, label: "Permissões" },
          { icon: Settings, label: "Configurações" },
          { icon: Download, label: "Exportar" },
        ]}
      />
      <UserManagementHub />
    </ModulePageWrapper>
  );
}
