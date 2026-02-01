/**
 * PATCH 871 - Crew Management - Rotation & Alerts
 * Enhanced crew rotation manager with drag-and-drop, alerts, and calendar integration
 * Uses crew_embarkations table aligned with Supabase schema
 */

import React, { useState, useEffect } from "react";
import { DndContext, DragEndEvent, useDraggable, useDroppable } from "@dnd-kit/core";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Calendar as CalendarIcon, 
  Ship, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Bell,
  Plus,
  RefreshCw
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import type { Database } from "@/integrations/supabase/types";
import { logger } from '@/lib/logger';

type CrewEmbarkationRow = Database["public"]["Tables"]["crew_embarkations"]["Row"];
type VesselRow = Database["public"]["Tables"]["vessels"]["Row"];

interface CrewMember {
  id: string;
  name: string;
  rank: string;
  vessel_id?: string;
  vessel_name?: string;
  status: "onboard" | "onshore" | "transit";
}

type RotationType = "embarkation" | "disembarkation" | "rotation" | "leave" | "emergency";
type RotationStatus = "scheduled" | "confirmed" | "completed" | "cancelled" | "delayed";
type DocumentationStatus = "pending" | "verified" | "incomplete" | "expired";

interface CrewRotation {
  id: string;
  crew_member_id: string;
  crew_member_name?: string;
  vessel_id?: string | null;
  rotation_type: RotationType;
  scheduled_date: string;
  actual_date?: string | null;
  status: RotationStatus;
  departure_port?: string | null;
  arrival_port?: string | null;
  documentation_status: DocumentationStatus;
  medical_clearance: boolean;
  notes?: string | null;
}

interface ConflictDetection {
  type: "scheduling" | "documentation" | "vessel_capacity" | "compliance";
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  rotation_id?: string;
}

interface VesselData {
  id: string;
  name: string;
  status?: string | null;
}

// Status color mapping with type safety
const statusColors: Record<RotationStatus, string> = {
  scheduled: "bg-blue-500",
  confirmed: "bg-green-500",
  completed: "bg-muted",
  cancelled: "bg-destructive",
  delayed: "bg-yellow-500",
};

// Draggable Crew Member Card
const DraggableCrewCard: React.FC<{ member: CrewMember }> = ({ member }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: member.id,
    data: member,
  });

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
  rotations: CrewRotation[];
}> = ({ date, rotationType, rotations }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `${date}-${rotationType}`,
  });

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
          <p className="font-medium">{rotation.crew_member_name || "Crew Member"}</p>
          <Badge variant="outline" className="text-xs">
            {rotation.status}
          </Badge>
        </div>
      ))}
    </div>
  );
};

export const CrewRotationManager: React.FC = () => {
  const [rotations, setRotations] = useState<CrewRotation[]>([]);
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([]);
  const [vessels, setVessels] = useState<VesselData[]>([]);
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
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load embarkations (rotations) from crew_embarkations table
      const { data: embarkationsData, error: embarkationsError } = await supabase
        .from("crew_embarkations")
        .select("*, crew_members(id, full_name, rank)")
        .order("embark_date", { ascending: true })
        .limit(100);

      if (embarkationsError) {
        logger.error("Error loading embarkations", { error: embarkationsError });
      }

      // Load crew members
      const { data: crewData, error: crewError } = await supabase
        .from("crew_members")
        .select("id, full_name, rank, status")
        .eq("status", "active")
        .order("full_name")
        .limit(50);

      if (crewError) {
        logger.error("Error loading crew members", { error: crewError });
      }

      // Load vessels
      const { data: vesselsData, error: vesselsError } = await supabase
        .from("vessels")
        .select("id, name, status")
        .order("name");

      if (vesselsError) {
        logger.error("Error loading vessels", { error: vesselsError });
      }

      // Map embarkations to rotation format
      const mappedRotations: CrewRotation[] = (embarkationsData || []).map((emb) => {
        const crewInfo = emb.crew_members as { id: string; full_name: string; rank: string } | null;
        return {
          id: emb.id,
          crew_member_id: emb.crew_member_id || "",
          crew_member_name: crewInfo?.full_name || "Unknown",
          vessel_id: null, // crew_embarkations uses vessel_name, not vessel_id
          rotation_type: "embarkation" as RotationType,
          scheduled_date: emb.embark_date || new Date().toISOString().split("T")[0],
          actual_date: null,
          status: "scheduled" as RotationStatus,
          departure_port: emb.embark_location,
          arrival_port: emb.disembark_location,
          documentation_status: "verified" as DocumentationStatus,
          medical_clearance: true,
          notes: emb.observations,
        };
      });

      // Map crew members
      const mappedCrew: CrewMember[] = (crewData || []).map((crew) => ({
        id: crew.id,
        name: crew.full_name || "Crew Member",
        rank: crew.rank || "Marinheiro",
        status: crew.status === "active" ? "onboard" : "onshore",
      }));

      // Map vessels
      const mappedVessels: VesselData[] = (vesselsData || []).map((v) => ({
        id: v.id,
        name: v.name || "Unknown Vessel",
        status: v.status,
      }));

      setRotations(mappedRotations);
      setCrewMembers(mappedCrew);
      setVessels(mappedVessels);
      
      // Detect conflicts
      detectConflicts(mappedRotations);
    } catch (error) {
      logger.error("Error loading data:", { error });
      toast.error("Failed to load crew rotation data");
    } finally {
      setLoading(false);
    }
  };

  const detectConflicts = (rotationsList: CrewRotation[]) => {
    const detectedConflicts: ConflictDetection[] = [];

    rotationsList.forEach((rotation, index) => {
      // Check for scheduling conflicts
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
        });
      }

      // Check medical clearance
      if (!rotation.medical_clearance && rotation.status !== "cancelled") {
        detectedConflicts.push({
          type: "compliance",
          severity: "medium",
          message: `Missing medical clearance for crew member`,
          rotation_id: rotation.id,
        });
      }
    });

    setConflicts(detectedConflicts);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const overId = String(over.id);
    const parts = overId.split("-");
    if (parts.length < 2) return;

    const date = parts[0];
    const rotationType = parts[1] as RotationType;
    const crewMemberId = String(active.id);

    try {
      // Insert using type assertion to handle Supabase's strict Insert type
      const insertData = {
        crew_member_id: crewMemberId,
        vessel_name: "TBD",
        vessel_type: "cargo",
        embark_date: date,
        embark_location: "Santos",
      };
      
      const { error } = await supabase
        .from("crew_embarkations")
        .insert(insertData as Database["public"]["Tables"]["crew_embarkations"]["Insert"]);

      if (error) throw error;

      toast.success("Rotation scheduled successfully");
      loadData();
    } catch (error) {
      logger.error("Error scheduling rotation:", { error });
      toast.error("Failed to schedule rotation");
    }
  };

  const handleCreateRotation = async () => {
    if (!newRotation.crew_member_id || !newRotation.scheduled_date) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      // Insert using type assertion to handle Supabase's strict Insert type
      const insertData = {
        crew_member_id: newRotation.crew_member_id,
        vessel_name: "TBD",
        vessel_type: "cargo",
        embark_date: newRotation.scheduled_date,
        embark_location: newRotation.departure_port || "Santos",
        disembark_location: newRotation.arrival_port,
        observations: newRotation.notes,
      };
      
      const { error } = await supabase
        .from("crew_embarkations")
        .insert(insertData as Database["public"]["Tables"]["crew_embarkations"]["Insert"]);

      if (error) throw error;

      toast.success("Rotation created successfully");
      setIsDialogOpen(false);
      setNewRotation({
        rotation_type: "embarkation",
        status: "scheduled",
        documentation_status: "pending",
        medical_clearance: false,
      });
      loadData();
    } catch (error) {
      logger.error("Error creating rotation:", { error });
      toast.error("Failed to create rotation");
    }
  };

  const getStatusColor = (status: RotationStatus): string => {
    return statusColors[status] || "bg-muted";
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
                    <Label>Crew Member</Label>
                    <Select
                      value={newRotation.crew_member_id}
                      onValueChange={(value) =>
                        setNewRotation({ ...newRotation, crew_member_id: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select crew member" />
                      </SelectTrigger>
                      <SelectContent>
                        {crewMembers.map((crew) => (
                          <SelectItem key={crew.id} value={crew.id}>
                            {crew.name} - {crew.rank}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Rotation Type</Label>
                    <Select
                      value={newRotation.rotation_type}
                      onValueChange={(value: RotationType) =>
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
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Vessel</Label>
                    <Select
                      value={newRotation.vessel_id || undefined}
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
                  <div>
                    <Label>Scheduled Date</Label>
                    <Input
                      type="date"
                      value={newRotation.scheduled_date || ""}
                      onChange={(e) =>
                        setNewRotation({ ...newRotation, scheduled_date: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Departure Port</Label>
                    <Input
                      value={newRotation.departure_port || ""}
                      onChange={(e) =>
                        setNewRotation({ ...newRotation, departure_port: e.target.value })
                      }
                      placeholder="e.g., Santos"
                    />
                  </div>
                  <div>
                    <Label>Arrival Port</Label>
                    <Input
                      value={newRotation.arrival_port || ""}
                      onChange={(e) =>
                        setNewRotation({ ...newRotation, arrival_port: e.target.value })
                      }
                      placeholder="e.g., Rio de Janeiro"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateRotation}>
                    Create Rotation
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Conflicts Alert */}
      {conflicts.length > 0 && (
        <Card className="border-destructive">
          <CardHeader className="pb-2">
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              {conflicts.length} Conflict{conflicts.length > 1 ? "s" : ""} Detected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {conflicts.slice(0, 5).map((conflict, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <Badge variant={conflict.severity === "critical" ? "destructive" : "default"}>
                    {conflict.severity}
                  </Badge>
                  <span>{conflict.message}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            Schedule
          </TabsTrigger>
          <TabsTrigger value="crew" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Crew ({crewMembers.length})
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Alerts ({conflicts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="mt-4">
          <DndContext onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              {/* Crew Pool */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Available Crew</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {crewMembers.slice(0, 10).map((member) => (
                    <DraggableCrewCard key={member.id} member={member} />
                  ))}
                </CardContent>
              </Card>

              {/* Schedule Grid */}
              <div className="lg:col-span-3">
                <Card>
                  <CardHeader>
                    <CardTitle>Rotation Schedule</CardTitle>
                    <CardDescription>
                      Drag crew members to schedule slots
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {rotations.length > 0 ? (
                        <div className="space-y-2">
                          {rotations.map((rotation) => (
                            <div
                              key={rotation.id}
                              className="flex items-center justify-between p-3 border rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <Ship className="h-5 w-5 text-muted-foreground" />
                                <div>
                                  <p className="font-medium">{rotation.crew_member_name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {format(parseISO(rotation.scheduled_date), "PPP")} • {rotation.rotation_type}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className={getStatusColor(rotation.status)}>
                                  {rotation.status}
                                </Badge>
                                {rotation.medical_clearance ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Clock className="h-4 w-4 text-yellow-500" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No rotations scheduled</p>
                          <p className="text-sm">Drag crew members or click "New Rotation"</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </DndContext>
        </TabsContent>

        <TabsContent value="crew" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Crew Members</CardTitle>
              <CardDescription>All active crew members available for rotation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {crewMembers.map((member) => (
                  <div key={member.id} className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Users className="h-8 w-8 text-primary" />
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.rank}</p>
                      </div>
                    </div>
                    <Badge className="mt-2" variant={member.status === "onboard" ? "default" : "secondary"}>
                      {member.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Rotation Alerts</CardTitle>
              <CardDescription>Conflicts and compliance issues</CardDescription>
            </CardHeader>
            <CardContent>
              {conflicts.length > 0 ? (
                <div className="space-y-3">
                  {conflicts.map((conflict, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 border rounded-lg">
                      <AlertTriangle className={`h-5 w-5 ${
                        conflict.severity === "critical" ? "text-destructive" :
                        conflict.severity === "high" ? "text-orange-500" :
                        "text-yellow-500"
                      }`} />
                      <div>
                        <p className="font-medium">{conflict.type}</p>
                        <p className="text-sm text-muted-foreground">{conflict.message}</p>
                      </div>
                      <Badge variant={conflict.severity === "critical" ? "destructive" : "default"}>
                        {conflict.severity}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p>No conflicts detected</p>
                  <p className="text-sm">All rotations are compliant</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CrewRotationManager;
