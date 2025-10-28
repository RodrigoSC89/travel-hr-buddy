/**
 * PATCH 410: Mission Planning Submodule
 * Handles mission planning and preparation
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Target, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const MissionPlanning: React.FC = () => {
  const upcomingMissions = [
    {
      id: '1',
      title: 'Inspection ROV Alpha',
      type: 'maintenance',
      scheduled: '2025-10-30',
      crew: 5,
      status: 'planning'
    },
    {
      id: '2',
      title: 'Deep Sea Survey',
      type: 'survey',
      scheduled: '2025-11-05',
      crew: 8,
      status: 'planning'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Calendar className="h-6 w-6" />
          Mission Planning
        </h2>
        <p className="text-muted-foreground">
          Plan and prepare upcoming missions
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Planned Missions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{upcomingMissions.length}</div>
            <p className="text-xs text-muted-foreground">Next 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Crew Ready</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">42</div>
            <p className="text-xs text-muted-foreground">Available members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Equipment Check</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">98%</div>
            <p className="text-xs text-muted-foreground">Operational</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Missions</CardTitle>
          <CardDescription>Missions in planning stage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingMissions.map(mission => (
              <div key={mission.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    <h3 className="font-semibold">{mission.title}</h3>
                    <Badge variant="outline">{mission.type}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {mission.scheduled}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {mission.crew} crew
                    </span>
                  </div>
                </div>
                <Button size="sm">View Details</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
