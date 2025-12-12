import { useEffect, useState, useCallback } from "react";;

/**
 * PATCH 298: Travel Management Component
 * Multi-leg itinerary display with conflict detection and PDF export
 * PATCH 653 - Lazy loading for jsPDF
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plane, 
  Plus, 
  Download, 
  AlertTriangle, 
  MapPin, 
  Calendar,
  Clock,
  Users,
  Ship,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

// Lazy load jsPDF
const loadJsPDF = async () => {
  const { default: jsPDF } = await import("jspdf");
  await import("jspdf-autotable");
  return jsPDF;
};

interface TravelItinerary {
  id: string;
  itinerary_number: string;
  status: string;
  departure_location: string;
  arrival_location: string;
  departure_date: string;
  arrival_date: string;
  travel_purpose: string;
  total_cost: number;
  currency: string;
  crew_member_id?: string;
  vessel_id?: string;
  mission_id?: string;
  created_at: string;
  legs?: TravelLeg[];
}

interface TravelLeg {
  id: string;
  leg_number: number;
  transport_type: string;
  carrier: string;
  booking_reference: string;
  departure_location: string;
  arrival_location: string;
  departure_time: string;
  arrival_time: string;
  cost: number;
  status: string;
}

interface TravelConflict {
  id: string;
  conflict_type: string;
  severity: string;
  conflict_description: string;
  resolved: boolean;
  created_at: string;
}

const TravelManagement = () => {
  const [itineraries, setItineraries] = useState<TravelItinerary[]>([]);
  const [conflicts, setConflicts] = useState<TravelConflict[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewItinerary, setShowNewItinerary] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    departure_location: "",
    arrival_location: "",
    departure_date: "",
    arrival_date: "",
    travel_purpose: "",
    status: "pending"
  });

  useEffect(() => {
    loadItineraries();
    loadConflicts();
    
    const itinerariesChannel = supabase
      .channel("travel_itineraries_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "travel_itineraries"
        },
        () => {
          loadItineraries();
        }
      )
      .subscribe();

    const conflictsChannel = supabase
      .channel("travel_conflicts_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "travel_schedule_conflicts"
        },
        () => {
          loadConflicts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(itinerariesChannel);
      supabase.removeChannel(conflictsChannel);
    };
  }, []);

  const loadItineraries = async () => {
    try {
      const { data, error } = await supabase
        .from("travel_itineraries")
        .select(`
          *,
          legs:travel_legs(*)
        `)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setItineraries(data || []);
    } catch (error: SupabaseError | null) {
      console.error("Error loading itineraries:", error);
      toast({
        title: "Error loading itineraries",
        description: error.message,
        variant: "destructive",
      };
    } finally {
      setLoading(false);
    }
  };

  const loadConflicts = async () => {
    try {
      const { data, error } = await supabase
        .from("travel_schedule_conflicts")
        .select("*")
        .eq("resolved", false)
        .order("severity", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      setConflicts(data || []);
    } catch (error: SupabaseError | null) {
      console.error("Error loading conflicts:", error);
    }
  };

  const createItinerary = async () => {
    try {
      const { error } = await supabase
        .from("travel_itineraries")
        .insert({
          ...formData,
          status: "pending"
        };

      if (error) throw error;

      toast({
        title: "✅ Itinerary Created",
        description: "Your travel itinerary has been created",
      };

      setShowNewItinerary(false);
      setFormData({
        departure_location: "",
        arrival_location: "",
        departure_date: "",
        arrival_date: "",
        travel_purpose: "",
        status: "pending"
      };
      loadItineraries();
    } catch (error: SupabaseError | null) {
      toast({
        title: "Error creating itinerary",
        description: error.message,
        variant: "destructive",
      };
    }
  };

  const exportToPDF = (itinerary: TravelItinerary) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text("Travel Itinerary", 14, 20);
    
    // Itinerary details
    doc.setFontSize(12);
    doc.text(`Itinerary Number: ${itinerary.itinerary_number}`, 14, 35);
    doc.text(`Status: ${itinerary.status}`, 14, 42);
    doc.text(`Purpose: ${itinerary.travel_purpose || "N/A"}`, 14, 49);
    
    doc.setFontSize(10);
    doc.text(`Departure: ${itinerary.departure_location}`, 14, 60);
    doc.text(`Date: ${format(new Date(itinerary.departure_date), "dd/MM/yyyy HH:mm")}`, 14, 66);
    
    doc.text(`Arrival: ${itinerary.arrival_location}`, 14, 76);
    doc.text(`Date: ${format(new Date(itinerary.arrival_date), "dd/MM/yyyy HH:mm")}`, 14, 82);
    
    // Legs table
    if (itinerary.legs && itinerary.legs.length > 0) {
      doc.setFontSize(14);
      doc.text("Travel Legs", 14, 95);
      
      const tableData = itinerary.legs.map((leg: TravelLeg) => [
        leg.leg_number.toString(),
        leg.transport_type,
        leg.carrier || "N/A",
        leg.departure_location,
        leg.arrival_location,
        format(new Date(leg.departure_time), "dd/MM HH:mm"),
        leg.status
      ]);

      (doc as unknown).autoTable({
        startY: 100,
        head: [["Leg", "Type", "Carrier", "From", "To", "Departure", "Status"]],
        body: tableData,
        theme: "striped",
        headStyles: { fillColor: [59, 130, 246] },
      };
    }
    
    // Footer
    const pageCount = (doc as unknown).internal.getNumberOfPages();
    doc.setFontSize(8);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, doc.internal.pageSize.height - 10);
    doc.text(`Page ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
    
    doc.save(`travel-itinerary-${itinerary.itinerary_number}.pdf`);
    
    // Log export
    supabase.from("travel_export_history").insert({
      export_type: "pdf",
      itinerary_id: itinerary.id,
      file_name: `travel-itinerary-${itinerary.itinerary_number}.pdf`
    };
    
    toast({
      title: "✅ PDF Exported",
      description: "Itinerary exported successfully",
    };
  };

  const resolveConflict = async (conflictId: string) => {
    try {
      const { error } = await supabase
        .from("travel_schedule_conflicts")
        .update({
          resolved: true,
          resolved_at: new Date().toISOString()
        })
        .eq("id", conflictId);

      if (error) throw error;

      toast({
        title: "✅ Conflict Resolved",
        description: "Travel conflict has been marked as resolved",
      };

      loadConflicts();
    } catch (error: SupabaseError | null) {
      toast({
        title: "Error resolving conflict",
        description: error.message,
        variant: "destructive",
      };
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
    case "confirmed":
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case "cancelled":
      return <XCircle className="h-4 w-4 text-red-500" />;
    case "in_progress":
      return <Clock className="h-4 w-4 text-blue-500" />;
    case "completed":
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    default:
      return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
    case "confirmed":
      return <Badge className="bg-green-500">Confirmed</Badge>;
    case "cancelled":
      return <Badge variant="destructive">Cancelled</Badge>;
    case "pending":
      return <Badge variant="secondary">Pending</Badge>;
    case "in_progress":
      return <Badge className="bg-blue-500">In Progress</Badge>;
    case "completed":
      return <Badge>Completed</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
    case "critical":
      return <Badge variant="destructive">Critical</Badge>;
    case "high":
      return <Badge className="bg-orange-500">High</Badge>;
    case "medium":
      return <Badge variant="secondary">Medium</Badge>;
    case "low":
      return <Badge variant="outline">Low</Badge>;
    default:
      return <Badge variant="outline">{severity}</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Plane className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Travel Management</h1>
          <p className="text-muted-foreground">
            Crew travel coordination with conflict detection
          </p>
        </div>
      </div>

      <Tabs defaultValue="itineraries" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="itineraries" className="flex items-center gap-2">
            <Plane className="h-4 w-4" />
            Itineraries
          </TabsTrigger>
          <TabsTrigger value="conflicts" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Conflicts ({conflicts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="itineraries">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Plane className="h-5 w-5" />
                    Travel Itineraries
                  </CardTitle>
                  <CardDescription>
                    Manage crew travel schedules and bookings
                  </CardDescription>
                </div>
                <Dialog open={showNewItinerary} onOpenChange={setShowNewItinerary}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      New Itinerary
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create Travel Itinerary</DialogTitle>
                      <DialogDescription>
                        Create a new travel itinerary for crew members
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="departure_location">Departure Location</Label>
                          <Input
                            id="departure_location"
                            value={formData.departure_location}
                            onChange={handleChange}
                            placeholder="e.g., New York, USA"
                          />
                        </div>
                        <div>
                          <Label htmlFor="arrival_location">Arrival Location</Label>
                          <Input
                            id="arrival_location"
                            value={formData.arrival_location}
                            onChange={handleChange}
                            placeholder="e.g., London, UK"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="departure_date">Departure Date & Time</Label>
                          <Input
                            id="departure_date"
                            type="datetime-local"
                            value={formData.departure_date}
                            onChange={handleChange}
                          />
                        </div>
                        <div>
                          <Label htmlFor="arrival_date">Arrival Date & Time</Label>
                          <Input
                            id="arrival_date"
                            type="datetime-local"
                            value={formData.arrival_date}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="travel_purpose">Travel Purpose</Label>
                        <Textarea
                          id="travel_purpose"
                          value={formData.travel_purpose}
                          onChange={handleChange}
                          placeholder="Describe the purpose of this travel..."
                          rows={3}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={handleSetShowNewItinerary}>
                        Cancel
                      </Button>
                      <Button onClick={createItinerary}>
                        Create Itinerary
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {loading ? (
                  <p>Loading itineraries...</p>
                ) : itineraries.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No travel itineraries found
                  </p>
                ) : (
                  itineraries.map((itinerary) => (
                    <Card key={itinerary.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            {getStatusIcon(itinerary.status)}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-mono font-semibold">
                                  {itinerary.itinerary_number}
                                </span>
                                {getStatusBadge(itinerary.status)}
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4 mt-3 mb-3">
                                <div className="flex items-start gap-2">
                                  <MapPin className="h-4 w-4 text-blue-500 mt-1" />
                                  <div>
                                    <p className="text-xs text-muted-foreground">From</p>
                                    <p className="font-medium">{itinerary.departure_location}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {format(new Date(itinerary.departure_date), "dd/MM/yyyy HH:mm")}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-start gap-2">
                                  <MapPin className="h-4 w-4 text-green-500 mt-1" />
                                  <div>
                                    <p className="text-xs text-muted-foreground">To</p>
                                    <p className="font-medium">{itinerary.arrival_location}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {format(new Date(itinerary.arrival_date), "dd/MM/yyyy HH:mm")}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {itinerary.travel_purpose && (
                                <p className="text-sm text-muted-foreground mb-2">
                                  Purpose: {itinerary.travel_purpose}
                                </p>
                              )}

                              {itinerary.legs && itinerary.legs.length > 0 && (
                                <div className="mt-3 p-3 bg-muted rounded-md">
                                  <p className="text-xs font-semibold mb-2">
                                    {itinerary.legs.length} Travel Leg{itinerary.legs.length > 1 ? "s" : ""}
                                  </p>
                                  <div className="space-y-2">
                                    {itinerary.legs.map((leg: TravelLeg) => (
                                      <div key={leg.id} className="text-xs flex items-center gap-2">
                                        <Badge variant="outline" className="text-xs">
                                          Leg {leg.leg_number}
                                        </Badge>
                                        <span>{leg.transport_type}</span>
                                        <span className="text-muted-foreground">•</span>
                                        <span>{leg.departure_location} → {leg.arrival_location}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleexportToPDF}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Export PDF
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conflicts">
          <Card className="border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Travel Conflicts ({conflicts.length})
              </CardTitle>
              <CardDescription>
                Auto-detected schedule conflicts and overlaps
              </CardDescription>
            </CardHeader>
            <CardContent>
              {conflicts.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  ✅ No conflicts detected
                </p>
              ) : (
                <div className="space-y-3">
                  {conflicts.map((conflict) => (
                    <Card key={conflict.id} className="border-l-4 border-l-orange-500">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <AlertTriangle className="h-5 w-5 text-orange-500" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline">{conflict.conflict_type}</Badge>
                                {getSeverityBadge(conflict.severity)}
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {conflict.conflict_description}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Detected {format(new Date(conflict.created_at), "dd/MM/yyyy HH:mm")}
                              </p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleresolveConflict}
                          >
                            Resolve
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
});

export default TravelManagement;
