/**
 * Crew Members Component - List and manage crew members
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search } from "lucide-react";

export function CrewMembers() {
  // Mock data - to be replaced with real data from Supabase
  const members = [
    { id: 1, name: "John Smith", role: "Captain", status: "active", vessel: "MV Ocean Star" },
    { id: 2, name: "Maria Garcia", role: "Chief Engineer", status: "active", vessel: "MV Ocean Star" },
    { id: 3, name: "Ahmed Hassan", role: "Second Officer", status: "on-leave", vessel: null },
    { id: 4, name: "Lisa Chen", role: "Third Engineer", status: "active", vessel: "MV Wave Runner" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search crew members..." className="pl-8" />
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Member
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Crew Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{member.name}</p>
                    <Badge variant={member.status === "active" ? "default" : "secondary"}>
                      {member.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                  {member.vessel && (
                    <p className="text-xs text-muted-foreground">Assigned to: {member.vessel}</p>
                  )}
                </div>
                <Button variant="outline" size="sm" className="mt-2 sm:mt-0">
                  View Profile
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
