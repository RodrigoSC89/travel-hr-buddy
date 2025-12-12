/**
import { useState } from "react";;
 * PATCH 410: Mission Planning Submodule
 * Mission scheduling, crew allocation, and equipment checks
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Package, Plus } from "lucide-react";

export const MissionPlanning = memo(function() {
  const [missions, setMissions] = useState([
    {
      id: "1",
      name: "Ocean Survey Alpha",
      startDate: "2025-11-01",
      crewAssigned: 12,
      equipmentStatus: "ready",
    },
    {
      id: "2",
      name: "Coastal Monitoring Beta",
      startDate: "2025-11-15",
      crewAssigned: 8,
      equipmentStatus: "pending",
    },
  ]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Mission Planning</h2>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Schedule Mission
        </Button>
      </div>

      <div className="grid gap-4">
        {missions.map((mission) => (
          <Card key={mission.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{mission.name}</span>
                <Badge variant={mission.equipmentStatus === "ready" ? "default" : "secondary"}>
                  {mission.equipmentStatus}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{mission.startDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{mission.crewAssigned} crew members</span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Equipment {mission.equipmentStatus}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
