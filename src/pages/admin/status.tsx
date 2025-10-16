import { MultiTenantWrapper } from "@/components/layout/multi-tenant-wrapper";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { Activity } from "lucide-react";
import AdminStatusPanel from "@/components/admin/AdminStatusPanel";

export default function AdminStatusPage() {
  return (
    <MultiTenantWrapper>
      <ModulePageWrapper gradient="purple">
        <ModuleHeader
          icon={Activity}
          title="🎯 Status dos Módulos"
          description="Painel de status de todos os módulos do Nautilus One"
          gradient="purple"
        />
        <AdminStatusPanel />
      </ModulePageWrapper>
    </MultiTenantWrapper>
  );
}
