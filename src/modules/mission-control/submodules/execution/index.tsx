/**
 * PATCH 410: Mission Execution Submodule
 * Handles active mission execution and monitoring
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, CheckCircle, AlertCircle, Pause, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export const MissionExecution: React.FC = () => {
  const activeMissions = [
    {
      id: '1',
      title: 'ROV Maintenance Dive',
      status: 'in_progress',
      progress: 65,
      crew: 'Team Alpha',
      priority: 'high'
    },
    {
      id: '2',
      title: 'Survey Area B-12',
      status: 'in_progress',
      progress: 30,
      crew: 'Team Bravo',
      priority: 'medium'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Activity className="h-6 w-6 animate-pulse" />
          Mission Execution
        </h2>
        <p className="text-muted-foreground">
          Monitor and manage active missions
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Active Missions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{activeMissions.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">48%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">On Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">2</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">0</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Missions</CardTitle>
          <CardDescription>Real-time mission status and control</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeMissions.map(mission => (
              <div key={mission.id} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{mission.title}</h3>
                      <Badge 
                        variant={mission.priority === 'high' ? 'destructive' : 'outline'}
                      >
                        {mission.priority}
                      </Badge>
                      <Badge variant="secondary">
                        <Activity className="h-3 w-3 mr-1 animate-pulse" />
                        In Progress
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{mission.crew}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Pause className="h-4 w-4" />
                    </Button>
                    <Button size="sm">Details</Button>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progress</span>
                    <span className="font-semibold">{mission.progress}%</span>
                  </div>
                  <Progress value={mission.progress} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
