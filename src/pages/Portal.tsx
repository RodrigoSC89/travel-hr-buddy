import React from "react";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { EmployeePortal } from "@/modules/hr/employee-portal";

const Portal: React.FC = () => {
  return (
    <ModulePageWrapper gradient="blue">
      <EmployeePortal />
    </ModulePageWrapper>
  );
};

export default Portal;