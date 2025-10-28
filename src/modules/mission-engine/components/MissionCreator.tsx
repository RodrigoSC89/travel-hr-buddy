/**
 * PATCH 426 - Mission Creator Component
 */

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Rocket } from "lucide-react";
import type { Mission } from "../types";

interface MissionCreatorProps {
  onClose: () => void;
  onCreate: (mission: Omit<Mission, "id" | "createdAt">) => void;
}

export const MissionCreator: React.FC<MissionCreatorProps> = ({ onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    code: `M-${Date.now().toString().slice(-6)}`,
    name: "",
    type: "routine" as Mission["type"],
    status: "planned" as Mission["status"],
    priority: "medium" as Mission["priority"],
    description: "",
    startTime: new Date().toISOString().split("T")[0]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({
      ...formData,
      assignedAgents: [],
      metadata: {},
      startTime: new Date(formData.startTime).toISOString()
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5" />
            Create New Mission
          </DialogTitle>
          <DialogDescription>
            Define a new mission for execution
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Mission Code</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Mission Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Operation name..."
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={formData.type} onValueChange={(value: Mission["type"]) => setFormData({ ...formData, type: value })}>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="emergency">Emergency</SelectItem>
                  <SelectItem value="routine">Routine</SelectItem>
                  <SelectItem value="training">Training</SelectItem>
                  <SelectItem value="tactical">Tactical</SelectItem>
                  <SelectItem value="recon">Reconnaissance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(value: Mission["priority"]) => setFormData({ ...formData, priority: value })}>
                <SelectTrigger id="priority">
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

            <div className="space-y-2">
              <Label htmlFor="startTime">Start Date</Label>
              <Input
                id="startTime"
                type="date"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Mission objectives and details..."
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              <Rocket className="mr-2 h-4 w-4" />
              Create Mission
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
