import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SystemState } from "@/ai/consciousCore";

interface CollectiveHealthBarProps {
  systemState: SystemState;
}

const getStatusColor = (status: string): string => {
  switch (status) {
    case "healthy": return "text-success";
    case "degraded": return "text-warning";
    case "critical": return "text-destructive";
    default: return "text-muted-foreground";
  }
};

export const CollectiveHealthBar: React.FC<CollectiveHealthBarProps> = ({ systemState }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">System Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${getStatusColor(systemState.overallHealth)}`}>
            {systemState.overallHealth.toUpperCase()}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Active Modules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {systemState.activeModules} / {systemState.totalModules}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Active Issues</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-warning">
            {systemState.activeObservations}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">
            {systemState.criticalIssues}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
