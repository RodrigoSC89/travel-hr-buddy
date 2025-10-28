/**
 * Crew Rotations Component - Manage crew rotations and schedules
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Ship } from "lucide-react";

export function CrewRotations() {
  // Mock data - to be replaced with real data from Supabase
  const rotations = [
    { 
      id: 1, 
      member: "John Smith", 
      vessel: "MV Ocean Star", 
      startDate: "2025-10-01", 
      endDate: "2025-12-01", 
      status: "active" 
    },
    { 
      id: 2, 
      member: "Maria Garcia", 
      vessel: "MV Ocean Star", 
      startDate: "2025-10-01", 
      endDate: "2025-12-01", 
      status: "active" 
    },
    { 
      id: 3, 
      member: "Lisa Chen", 
      vessel: "MV Wave Runner", 
      startDate: "2025-11-01", 
      endDate: "2026-01-01", 
      status: "scheduled" 
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Schedule Rotation
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active & Scheduled Rotations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rotations.map((rotation) => (
              <div
                key={rotation.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{rotation.member}</p>
                    <Badge variant={rotation.status === "active" ? "default" : "secondary"}>
                      {rotation.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Ship className="h-4 w-4" />
                    <span>{rotation.vessel}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(rotation.startDate).toLocaleDateString()} - {new Date(rotation.endDate).toLocaleDateString()}
                  </p>
                </div>
                <Button variant="outline" size="sm" className="mt-2 sm:mt-0">
                  Manage
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
