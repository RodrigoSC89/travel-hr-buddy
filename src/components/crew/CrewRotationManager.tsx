import { useCallback, useMemo, useEffect, useState } from "react";;

/**
 * PATCH 366 - Crew Management - Rotation & Alerts
 * Enhanced crew rotation manager with drag-and-drop, alerts, and calendar integration
 */

import React, { useState, useEffect, useCallback } from "react";
import { DndContext, DragEndEvent, useDraggable, useDroppable } from "@dnd-kit/core";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Calendar as CalendarIcon, 
  Ship, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Bell,
  MapPin,
  Plane,
  Plus,
  X,
  Edit,
  Trash2,
  Download,
  Mail,
  RefreshCw
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, parseISO, addDays, isBefore, isAfter } from "date-fns";

interface CrewMember {
  id: string;
  name: string;
  rank: string;
  vessel_id?: string;
  vessel_name?: string;
  status: "onboard" | "onshore" | "transit";
}

interface CrewRotation {
  id: string;
  crew_member_id: string;
  vessel_id?: string;
  rotation_type: "embarkation" | "disembarkation" | "rotation" | "leave" | "emergency";
  scheduled_date: string;
  actual_date?: string;
  status: "scheduled" | "confirmed" | "completed" | "cancelled" | "delayed";
  departure_port?: string;
  arrival_port?: string;
  transportation_method?: string;
  flight_details?: unknown;
  accommodation_details?: unknown;
  documentation_status: "pending" | "verified" | "incomplete" | "expired";
  medical_clearance: boolean;
  visa_status?: string;
  notes?: string;
  crew_member?: CrewMember;
}

interface ConflictDetection {
  type: "scheduling" | "documentation" | "vessel_capacity" | "compliance";
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  rotation_id?: string;
}

// Draggable Crew Member Card
const DraggableCrewCard: React.FC<{ member: CrewMember }> = ({ member }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: member.id,
    data: member,
};

  const style = transform
    ? {
      transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      opacity: isDragging ? 0.5 : 1,
    }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="p-3 bg-card border rounded-lg cursor-move hover:shadow-md transition-shadow"
    >
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4" />
        <div className="flex-1">
          <p className="font-medium text-sm">{member.name}</p>
          <p className="text-xs text-muted-foreground">{member.rank}</p>
        </div>
        <Badge variant={member.status === "onboard" ? "default" : "secondary"}>
          {member.status}
        </Badge>
      </div>
    </div>
  );
};

// Droppable Schedule Slot
const DroppableScheduleSlot: React.FC<{
  date: string;
  rotationType: string;
  onDrop: (memberId: string, date: string, type: string) => void;
  rotations: CrewRotation[];
}> = ({ date, rotationType, rotations, onDrop }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `${date}-${rotationType}`,
};

  const slotRotations = rotations.filter(
    (r) => r.scheduled_date === date && r.rotation_type === rotationType
  );

  return (
    <div
      ref={setNodeRef}
      className={`p-2 border rounded min-h-[80px] ${
        isOver ? "bg-primary/10 border-primary" : "bg-muted/50"
      }`}
    >
      {slotRotations.map((rotation) => (
        <div key={rotation.id} className="text-xs bg-background p-2 rounded mb-1">
          <p className="font-medium">{rotation.crew_member?.name}</p>
          <Badge variant="outline" className="text-xs">
            {rotation.status}
          </Badge>
        </div>
      ))}
    </div>
  );
});

export const CrewRotationManager: React.FC = () => {
  const [rotations, setRotations] = useState<CrewRotation[]>([]);
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([]);
  const [vessels, setVessels] = useState<any[]>([]);
  const [conflicts, setConflicts] = useState<ConflictDetection[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("schedule");
  const [newRotation, setNewRotation] = useState<Partial<CrewRotation>>({
    rotation_type: "embarkation",
    status: "scheduled",
    documentation_status: "pending",
    medical_clearance: false,
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load rotations with crew member details
      const { data: rotationsData, error: rotationsError } = await supabase
        .from("crew_rotations")
        .select(`
          *,
          crew_member:auth.users!crew_rotations_crew_member_id_fkey(id, raw_user_meta_data)
        `)
        .order("scheduled_date", { ascending: true });

      if (rotationsError) throw rotationsError;

      // Load vessels
      const { data: vesselsData, error: vesselsError } = await supabase
        .from("vessels")
        .select("*")
        .order("name");

      if (vesselsError) throw vesselsError;

      setRotations(rotationsData || []);
      setVessels(vesselsData || []);
      
      // Detect conflicts
      detectConflicts(rotationsData || []);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load crew rotation data");
    } finally {
      setLoading(false);
    }
  };

  const detectConflicts = (rotationsList: CrewRotation[]) => {
    const detectedConflicts: ConflictDetection[] = [];

    // Check for scheduling conflicts
    rotationsList.forEach((rotation, index) => {
      // Check if crew member has overlapping rotations
      const overlapping = rotationsList.find((r, i) => 
        i !== index &&
        r.crew_member_id === rotation.crew_member_id &&
        r.scheduled_date === rotation.scheduled_date &&
        r.status !== "cancelled"
      );

      if (overlapping) {
        detectedConflicts.push({
          type: "scheduling",
          severity: "high",
          message: `Crew member has multiple rotations on ${rotation.scheduled_date}`,
          rotation_id: rotation.id,
        };
      }

      // Check documentation expiry
      if (rotation.documentation_status === "expired") {
        detectedConflicts.push({
          type: "documentation",
          severity: "critical",
          message: `Documentation expired for rotation on ${rotation.scheduled_date}`,
          rotation_id: rotation.id,
        });
      }

      // Check medical clearance
      if (!rotation.medical_clearance && rotation.status !== "cancelled") {
        detectedConflicts.push({
          type: "compliance",
          severity: "medium",
          message: `Missing medical clearance for ${rotation.crew_member?.name || "crew member"}`,
          rotation_id: rotation.id,
        });
      }
    });

    setConflicts(detectedConflicts);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const [date, rotationType] = over.id.toString().split("-");
    const crewMemberId = active.id;

    try {
      const { error } = await supabase
        .from("crew_rotations")
        .insert({
          crew_member_id: crewMemberId,
          rotation_type: rotationType,
          scheduled_date: date,
          status: "scheduled",
          documentation_status: "pending",
          medical_clearance: false,
        };

      if (error) throw error;

      toast.success("Rotation scheduled successfully");
      loadData();
      
      // Generate alert
      await generateRotationAlert(crewMemberId, date, rotationType);
    } catch (error) {
      console.error("Error scheduling rotation:", error);
      toast.error("Failed to schedule rotation");
    }
  };

  const generateRotationAlert = async (crewMemberId: string, date: string, type: string) => {
    try {
      // Create alert in system
      const alertMessage = `${type === "embarkation" ? "Embarkation" : "Disembarkation"} scheduled for ${format(parseISO(date), "PPP")}`;
      
      await supabase.from("notifications").insert({
        user_id: crewMemberId,
        title: "Crew Rotation Alert",
        message: alertMessage,
        type: "crew_rotation",
        priority: "high",
        status: "unread",
      };

      // Log the alert
      toast.info("Alert generated for crew member");
    } catch (error) {
      console.error("Error generating alert:", error);
    }
  };

  const handleCreateRotation = async () => {
    try {
      const { error } = await supabase
        .from("crew_rotations")
        .insert(newRotation);

      if (error) throw error;

      toast.success("Rotation created successfully");
      setIsDialogOpen(false);
      loadData();
      
      // Generate alert for the new rotation
      if (newRotation.crew_member_id && newRotation.scheduled_date && newRotation.rotation_type) {
        await generateRotationAlert(
          newRotation.crew_member_id,
          newRotation.scheduled_date,
          newRotation.rotation_type
        );
      }
    } catch (error) {
      console.error("Error creating rotation:", error);
      toast.error("Failed to create rotation");
    }
  };

  const handleUpdateRotationStatus = async (rotationId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("crew_rotations")
        .update({ status: newStatus })
        .eq("id", rotationId);

      if (error) throw error;

      // Log the status change
      await supabase.from("crew_rotation_logs").insert({
        rotation_id: rotationId,
        log_type: "status_change",
        description: `Status changed to ${newStatus}`,
        new_status: newStatus,
      };

      toast.success("Rotation status updated");
      loadData();
    } catch (error) {
      console.error("Error updating rotation:", error);
      toast.error("Failed to update rotation");
    }
  };

  const exportToCalendar = (rotation: CrewRotation) => {
    // Generate iCal format
    const event = {
      title: `${rotation.rotation_type} - ${rotation.crew_member?.name}`,
      start: rotation.scheduled_date,
      description: rotation.notes || "",
      location: rotation.departure_port || rotation.arrival_port || "",
    };

    // Create iCal content
    const icalContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${format(parseISO(rotation.scheduled_date), "yyyyMMdd'T'HHmmss")}
SUMMARY:${event.title}
DESCRIPTION:${event.description}
LOCATION:${event.location}
END:VEVENT
END:VCALENDAR`;

    // Download iCal file
    const blob = new Blob([icalContent], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rotation-${rotation.id}.ics`;
    a.click();
    
    toast.success("Calendar event exported");
  };

  const getStatusColor = (status: string) => {
    const colors = {
      scheduled: "bg-blue-500",
      confirmed: "bg-green-500",
      completed: "bg-gray-500",
      cancelled: "bg-red-500",
      delayed: "bg-yellow-500",
    };
    return colors[status] || "bg-gray-500";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            Crew Rotation Management
          </h1>
          <p className="text-muted-foreground">
            Drag-and-drop scheduling with alerts and calendar integration
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => loadData()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Rotation
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Rotation</DialogTitle>
                <DialogDescription>
                  Schedule a new crew rotation with all required details
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Rotation Type</Label>
                    <Select
                      value={newRotation.rotation_type}
                      onValueChange={(value) =>
                        setNewRotation({ ...newRotation, rotation_type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="embarkation">Embarkation</SelectItem>
                        <SelectItem value="disembarkation">Disembarkation</SelectItem>
                        <SelectItem value="rotation">Rotation</SelectItem>
                        <SelectItem value="leave">Leave</SelectItem>
                        <SelectItem value="emergency">Emergency</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Vessel</Label>
                    <Select
                      value={newRotation.vessel_id}
                      onValueChange={(value) =>
                        setNewRotation({ ...newRotation, vessel_id: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select vessel" />
                      </SelectTrigger>
                      <SelectContent>
                        {vessels.map((vessel) => (
                          <SelectItem key={vessel.id} value={vessel.id}>
                            {vessel.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Scheduled Date</Label>
                  <Input
                    type="date"
                    value={newRotation.scheduled_date || ""}
                    onChange={handleChange})
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Departure Port</Label>
                    <Input
                      value={newRotation.departure_port || ""}
                      onChange={handleChange})
                      }
                    />
                  </div>
                  <div>
                    <Label>Arrival Port</Label>
                    <Input
                      value={newRotation.arrival_port || ""}
                      onChange={handleChange})
                      }
                    />
                  </div>
                </div>
                <div>
                  <Label>Notes</Label>
                  <Textarea
                    value={newRotation.notes || ""}
                    onChange={handleChange})
                    }
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={handleSetIsDialogOpen}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateRotation}>Create Rotation</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Conflicts Alert */}
      {conflicts.length > 0 && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              {conflicts.length} Conflict{conflicts.length > 1 ? "s" : ""} Detected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {conflicts.map((conflict, index) => (
                <div key={index} className="flex items-start gap-2 p-2 bg-destructive/10 rounded">
                  <Badge variant="destructive">{conflict.severity}</Badge>
                  <p className="text-sm flex-1">{conflict.message}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rotations</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rotations.length}</div>
            <p className="text-xs text-muted-foreground">
              {rotations.filter((r) => r.status === "scheduled").length} scheduled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rotations.filter((r) => r.status === "confirmed").length}
            </div>
            <p className="text-xs text-muted-foreground">Ready to proceed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Docs</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rotations.filter((r) => r.documentation_status === "pending").length}
            </div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alerts Generated</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conflicts.length}</div>
            <p className="text-xs text-muted-foreground">Active alerts</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="rotations">All Rotations</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rotation Schedule</CardTitle>
              <CardDescription>
                Drag crew members to schedule slots to create rotations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DndContext onDragEnd={handleDragEnd}>
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: 7 }, (_, i) => {
                    const date = format(addDays(selectedDate, i), "yyyy-MM-dd");
                    return (
                      <div key={date} className="space-y-2">
                        <div className="text-center font-medium text-sm">
                          {format(addDays(selectedDate, i), "EEE dd")}
                        </div>
                        <div className="space-y-2">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Embarkation</p>
                            <DroppableScheduleSlot
                              date={date}
                              rotationType="embarkation"
                              rotations={rotations}
                              onDrop={handleDragEnd}
                            />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Disembarkation</p>
                            <DroppableScheduleSlot
                              date={date}
                              rotationType="disembarkation"
                              rotations={rotations}
                              onDrop={handleDragEnd}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </DndContext>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rotations" className="space-y-4">
          {rotations.map((rotation) => (
            <Card key={rotation.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Ship className="h-5 w-5" />
                    <div>
                      <CardTitle className="text-lg">
                        {rotation.rotation_type.charAt(0).toUpperCase() +
                          rotation.rotation_type.slice(1)}
                      </CardTitle>
                      <CardDescription>
                        {format(parseISO(rotation.scheduled_date), "PPP")}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(rotation.status)}>
                      {rotation.status}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleexportToCalendar}
                    >
                      <CalendarIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Departure Port</p>
                    <p className="font-medium">{rotation.departure_port || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Arrival Port</p>
                    <p className="font-medium">{rotation.arrival_port || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Documentation</p>
                    <Badge variant={rotation.documentation_status === "verified" ? "default" : "secondary"}>
                      {rotation.documentation_status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Medical Clearance</p>
                    <Badge variant={rotation.medical_clearance ? "default" : "secondary"}>
                      {rotation.medical_clearance ? "Cleared" : "Pending"}
                    </Badge>
                  </div>
                </div>
                {rotation.notes && (
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground">Notes</p>
                    <p className="text-sm">{rotation.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>Active Alerts</CardTitle>
              <CardDescription>Conflicts and notifications requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              {conflicts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-2" />
                  <p>No active alerts</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {conflicts.map((conflict, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-4 border rounded-lg"
                    >
                      <AlertTriangle
                        className={`h-5 w-5 ${
                          conflict.severity === "critical"
                            ? "text-red-500"
                            : conflict.severity === "high"
                              ? "text-orange-500"
                              : "text-yellow-500"
                        }`}
                      />
                      <div className="flex-1">
                        <p className="font-medium">{conflict.type.replace("_", " ").toUpperCase()}</p>
                        <p className="text-sm text-muted-foreground">{conflict.message}</p>
                      </div>
                      <Badge>{conflict.severity}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Rotation History</CardTitle>
              <CardDescription>Completed crew rotations and logs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {rotations
                  .filter((r) => r.status === "completed")
                  .map((rotation) => (
                    <div
                      key={rotation.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">
                            {rotation.rotation_type.charAt(0).toUpperCase() +
                              rotation.rotation_type.slice(1)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(parseISO(rotation.scheduled_date), "PPP")}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">Completed</Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CrewRotationManager;
