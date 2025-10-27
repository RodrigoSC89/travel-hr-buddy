import React from "react";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { User, Clock, FileText } from "lucide-react";
import { EmployeePortalSelfService } from "@/components/employee-portal/employee-portal-self-service";

const Portal: React.FC = () => {
  return (
    <ModulePageWrapper gradient="blue">
      <EmployeePortalSelfService />
    </ModulePageWrapper>
  );
};

export default Portal;