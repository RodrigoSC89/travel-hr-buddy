/**
 * PATCH 426 - Mission Dashboard Component
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, AlertCircle, CheckCircle } from "lucide-react";
import type { Mission, ModuleStatus } from "../types";

interface MissionDashboardProps {
  missions: Mission[];
  moduleStatuses: ModuleStatus[];
  onRefresh: () => void;
}

export const MissionDashboard: React.FC<MissionDashboardProps> = ({
  missions,
  moduleStatuses,
  onRefresh
}) => {
  const getStatusColor = (status: ModuleStatus["status"]) => {
    switch (status) {
    case "operational":
      return "text-green-500 bg-green-500/10";
    case "warning":
      return "text-yellow-500 bg-yellow-500/10";
    case "critical":
      return "text-red-500 bg-red-500/10";
    case "offline":
      return "text-gray-500 bg-gray-500/10";
    default:
      return "text-gray-500 bg-gray-500/10";
    }
  };

  const activeMissions = missions.filter(m => m.status === "in-progress");
  const plannedMissions = missions.filter(m => m.status === "planned");

  return (
    <div className="space-y-6">
      {/* Module Status Overview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Connected Modules</CardTitle>
            <CardDescription>Status of integrated systems</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {moduleStatuses.map(module => (
              <Card key={module.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{module.name}</span>
                  <Badge className={getStatusColor(module.status)}>
                    {module.status}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Health</span>
                    <span className="font-medium">{module.health}%</span>
                  </div>
                  {module.alerts > 0 && (
                    <div className="flex items-center gap-1 text-xs text-yellow-500">
                      <AlertCircle className="h-3 w-3" />
                      <span>{module.alerts} alert{module.alerts > 1 ? "s" : ""}</span>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Missions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Active Missions</CardTitle>
            <CardDescription>{activeMissions.length} missions in progress</CardDescription>
          </CardHeader>
          <CardContent>
            {activeMissions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No active missions
              </p>
            ) : (
              <div className="space-y-3">
                {activeMissions.slice(0, 5).map(mission => (
                  <div key={mission.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">{mission.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {mission.code} • {mission.type}
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-500">
                      In Progress
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Planned Missions</CardTitle>
            <CardDescription>{plannedMissions.length} missions scheduled</CardDescription>
          </CardHeader>
          <CardContent>
            {plannedMissions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No planned missions
              </p>
            ) : (
              <div className="space-y-3">
                {plannedMissions.slice(0, 5).map(mission => (
                  <div key={mission.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">{mission.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {mission.code} • {mission.type}
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500">
                      Planned
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
