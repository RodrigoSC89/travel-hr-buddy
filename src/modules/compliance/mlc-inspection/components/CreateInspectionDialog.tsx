import { useState, useCallback } from "react";;
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { mlcInspectionService } from "@/services/mlc-inspection.service";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CreateInspectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInspectionCreated: (inspectionId: string) => void;
}

export const CreateInspectionDialog = memo(function({ open, onOpenChange, onInspectionCreated }: CreateInspectionDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    vessel_id: "",
    inspector_name: "",
    inspection_type: "initial" as const,
    notes: "",
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.vessel_id || !formData.inspector_name) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      };
      return;
    }

    try {
      setLoading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      const inspection = await mlcInspectionService.createInspection({
        vessel_id: formData.vessel_id,
        inspector_id: user.id,
        inspector_name: formData.inspector_name,
        inspection_type: formData.inspection_type,
        notes: formData.notes,
        status: "draft",
      });

      onInspectionCreated(inspection.id);
      
      // Reset form
      setFormData({
        vessel_id: "",
        inspector_name: "",
        inspection_type: "initial",
        notes: "",
      });
    } catch (error) {
      console.error("Error creating inspection:", error);
      toast({
        title: "Error",
        description: "Failed to create inspection",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New MLC Inspection</DialogTitle>
            <DialogDescription>
              Start a new Maritime Labour Convention inspection
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="vessel_id">Vessel ID *</Label>
              <Input
                id="vessel_id"
                placeholder="Enter vessel ID"
                value={formData.vessel_id}
                onChange={handleChange})}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="inspector_name">Inspector Name *</Label>
              <Input
                id="inspector_name"
                placeholder="Enter inspector name"
                value={formData.inspector_name}
                onChange={handleChange})}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="inspection_type">Inspection Type</Label>
              <Select
                value={formData.inspection_type}
                onValueChange={(value: unknown) => setFormData({ ...formData, inspection_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="initial">Initial</SelectItem>
                  <SelectItem value="renewal">Renewal</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="port_state_control">Port State Control</SelectItem>
                  <SelectItem value="flag_state">Flag State</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Enter any initial notes..."
                value={formData.notes}
                onChange={handleChange})}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleonOpenChange}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Inspection"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
