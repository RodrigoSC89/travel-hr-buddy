/**
import { useState, useCallback } from "react";;
 * PATCH 452 - Mission Planning Component
 * Tab for planning and creating missions
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Target, Calendar, User } from "lucide-react";
import { toast } from "sonner";
import { missionControlService } from "../services/mission-control-service";
import type { Mission } from "../types";

interface MissionPlanningProps {
  missions: Mission[];
  onRefresh: () => void;
}

export const MissionPlanning: React.FC<MissionPlanningProps> = ({ missions, onRefresh }) => {
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    type: "operation" as Mission["type"],
    priority: "medium" as Mission["priority"],
    description: "",
    startDate: "",
    endDate: ""
});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await missionControlService.createMission({
        ...formData,
        status: "planned",
        objectives: [],
        createdBy: "",
        metadata: {}
      });
      toast.success("Mission created successfully");
      setShowDialog(false);
      setFormData({
        code: "",
        name: "",
        type: "operation",
        priority: "medium",
        description: "",
        startDate: "",
        endDate: ""
      });
      onRefresh();
    } catch (error) {
      toast.error("Failed to create mission");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
    case "planned": return "bg-blue-500/20 text-blue-500";
    case "in-progress": return "bg-green-500/20 text-green-500";
    case "completed": return "bg-gray-500/20 text-gray-500";
    case "cancelled": return "bg-red-500/20 text-red-500";
    default: return "bg-gray-500/20 text-gray-500";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
    case "critical": return "bg-red-500/20 text-red-500";
    case "high": return "bg-orange-500/20 text-orange-500";
    case "medium": return "bg-yellow-500/20 text-yellow-500";
    case "low": return "bg-green-500/20 text-green-500";
    default: return "bg-gray-500/20 text-gray-500";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Mission Planning</CardTitle>
            <CardDescription>Create and manage mission plans</CardDescription>
          </div>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Mission
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Mission</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Code</label>
                    <Input
                      value={formData.code}
                      onChange={handleChange}
                      placeholder="MSN-001"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Name</label>
                    <Input
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Mission Name"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Type</label>
                    <Select value={formData.type} onValueChange={(v) => setFormData({...formData, type: v as Mission["type"]})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="operation">Operation</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="inspection">Inspection</SelectItem>
                        <SelectItem value="emergency">Emergency</SelectItem>
                        <SelectItem value="training">Training</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Priority</label>
                    <Select value={formData.priority} onValueChange={(v) => setFormData({...formData, priority: v as Mission["priority"]})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Mission description..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Start Date</label>
                    <Input
                      type="date"
                      value={formData.startDate}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">End Date</label>
                    <Input
                      type="date"
                      value={formData.endDate}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={handleSetShowDialog}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    Create Mission
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {missions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No missions planned yet
            </div>
          ) : (
            missions.map(mission => (
              <Card key={mission.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4" />
                      <span className="font-semibold">{mission.name}</span>
                      <Badge variant="outline">{mission.code}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{mission.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(mission.startDate).toLocaleDateString()}
                      </div>
                      <span>Type: {mission.type}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Badge className={getStatusColor(mission.status)}>{mission.status}</Badge>
                    <Badge className={getPriorityColor(mission.priority)}>{mission.priority}</Badge>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
