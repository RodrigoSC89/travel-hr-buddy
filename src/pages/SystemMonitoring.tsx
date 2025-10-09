import React from "react";
import SystemMonitoringDashboard from "@/components/monitoring/system-monitoring-dashboard";
import { BackToDashboard } from "@/components/ui/back-to-dashboard";

const SystemMonitoring = () => {
  return (
    <div className="space-y-6">
      <BackToDashboard />
      <SystemMonitoringDashboard />
    </div>
  );
};

export default SystemMonitoring;