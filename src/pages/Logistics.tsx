import React from "react";
import EnhancedLogisticsDashboard from "@/components/logistics/enhanced-logistics-dashboard";
import { BackToDashboard } from "@/components/ui/back-to-dashboard";

const Logistics = () => {
  return (
    <div className="space-y-6">
      <BackToDashboard />
      <EnhancedLogisticsDashboard />
    </div>
  );
};

export default Logistics;
