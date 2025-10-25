/**
 * PATCH 175.0 - AI Fleet Status UI
 * Unified view of all coordinated devices
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Network, Activity } from "lucide-react";
import { coordinationAI } from "./coordinationAI";
import { droneCommander } from "../drone-commander";
import { surfaceBotCore } from "../surface-bot";

export const AIFleetStatus: React.FC = () => {
  const [report, setReport] = useState<any>(null);
  const [assignments, setAssignments] = useState<any[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setReport(coordinationAI.generateMissionReport());
      setAssignments(coordinationAI.getAssignments().slice(0, 10));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            AI Fleet Coordination
          </CardTitle>
        </CardHeader>
        <CardContent>
          {report && (
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Total Devices</div>
                <div className="text-2xl font-bold">{report.totalDevices}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Active Tasks</div>
                <div className="text-2xl font-bold">{report.activeTasks}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Completed</div>
                <div className="text-2xl font-bold">{report.completedTasks}</div>
              </div>
            </div>
          )}
          
          <div className="mt-6 space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Recent Assignments
            </h3>
            {assignments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No assignments yet</p>
            ) : (
              assignments.map(a => (
                <div key={a.id} className="flex items-center justify-between p-2 border rounded">
                  <span className="text-sm">{a.task}</span>
                  <Badge>{a.priority}</Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIFleetStatus;
