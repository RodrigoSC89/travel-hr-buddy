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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plane, 
  Plus, 
  Download, 
  AlertTriangle, 
  MapPin, 
  Clock,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { logger } from '@/lib/logger';

// Lazy load jsPDF
const loadJsPDF = async () => {
  const { default: jsPDF } = await import("jspdf");
  await import("jspdf-autotable");
  return jsPDF;
};

// Helper to get dynamic supabase client for untyped tables
const dynamicSupabase = () => supabase as any;

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
      
      // Map database results to TravelItinerary interface
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- DB columns may not match interface exactly
      const mappedData: TravelItinerary[] = (data || []).map((row: any) => ({
        id: row.id,
        itinerary_number: row.itinerary_number || `ITN-${row.id?.slice(0, 8)}`,
        status: row.status || "pending",
        departure_location: row.origin || row.departure_location || "",
        arrival_location: row.destination || row.arrival_location || "",
        departure_date: row.departure_date || "",
        arrival_date: row.return_date || row.arrival_date || "",
        travel_purpose: row.trip_name || row.travel_purpose || "",
        total_cost: row.total_cost || 0,
        currency: row.currency || "USD",
        crew_member_id: row.crew_member_id,
        vessel_id: row.vessel_id,
        mission_id: row.mission_id,
        created_at: row.created_at,
        legs: Array.isArray(row.legs) ? row.legs : [],
      }));
      
      setItineraries(mappedData);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      logger.error("Error loading itineraries:", errorMessage);
      toast({
        title: "Error loading itineraries",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadConflicts = async () => {
    try {
      const { data, error } = await dynamicSupabase()
        .from("travel_schedule_conflicts")
        .select("*")
        .eq("resolved", false)
        .order("severity", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Map database results to TravelConflict interface
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- DB columns may not match interface exactly
      const mappedData: TravelConflict[] = (data || []).map((row: any) => ({
        id: row.id,
        conflict_type: row.conflict_type || "unknown",
        severity: row.severity || "low",
        conflict_description: row.conflict_description || row.description || "",
        resolved: row.resolved || false,
        created_at: row.created_at,
      }));
      
      setConflicts(mappedData);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      logger.error("Error loading conflicts:", errorMessage);
    }
  };

  const createItinerary = async () => {
    try {
      const { error } = await dynamicSupabase()
        .from("travel_itineraries")
        .insert({
          origin: formData.departure_location,
          destination: formData.arrival_location,
          departure_date: formData.departure_date,
          return_date: formData.arrival_date,
          trip_name: formData.travel_purpose,
          status: "pending"
        });

      if (error) throw error;

      toast({
        title: "✅ Itinerary Created",
        description: "Your travel itinerary has been created",
      });

      setShowNewItinerary(false);
      setFormData({
        departure_location: "",
        arrival_location: "",
        departure_date: "",
        arrival_date: "",
        travel_purpose: "",
        status: "pending"
      });
      loadItineraries();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast({
        title: "Error creating itinerary",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const exportToPDF = async (itinerary: TravelItinerary) => {
    try {
      const JsPDF = await loadJsPDF();
      const doc = new JsPDF();
      
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
      doc.text(`Date: ${itinerary.departure_date ? format(new Date(itinerary.departure_date), "dd/MM/yyyy HH:mm") : "N/A"}`, 14, 66);
      
      doc.text(`Arrival: ${itinerary.arrival_location}`, 14, 76);
      doc.text(`Date: ${itinerary.arrival_date ? format(new Date(itinerary.arrival_date), "dd/MM/yyyy HH:mm") : "N/A"}`, 14, 82);
      
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
          leg.departure_time ? format(new Date(leg.departure_time), "dd/MM HH:mm") : "N/A",
          leg.status
        ]);

        (doc as any).autoTable({
          startY: 100,
          head: [["Leg", "Type", "Carrier", "From", "To", "Departure", "Status"]],
          body: tableData,
          theme: "striped",
          headStyles: { fillColor: [59, 130, 246] },
        });
      }
      
      // Footer
      const pageCount = (doc as any).internal.getNumberOfPages();
      doc.setFontSize(8);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, doc.internal.pageSize.height - 10);
      doc.text(`Page ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
      
      doc.save(`travel-itinerary-${itinerary.itinerary_number}.pdf`);
      
      // Log export
      await dynamicSupabase().from("travel_export_history").insert({
        export_type: "pdf",
        itinerary_id: itinerary.id,
        file_name: `travel-itinerary-${itinerary.itinerary_number}.pdf`
      });
      
      toast({
        title: "✅ PDF Exported",
        description: "Itinerary exported successfully",
      });
    } catch (error) {
      logger.error("Error exporting PDF:", error);
      toast({
        title: "Error exporting PDF",
        description: "Failed to generate PDF",
        variant: "destructive",
      });
    }
  };

  const resolveConflict = async (conflictId: string) => {
    try {
      const { error } = await dynamicSupabase()
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
      });

      loadConflicts();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast({
        title: "Error resolving conflict",
        description: errorMessage,
        variant: "destructive",
      });
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
                            onChange={(e) => setFormData({ ...formData, departure_location: e.target.value })}
                            placeholder="e.g., New York, USA"
                          />
                        </div>
                        <div>
                          <Label htmlFor="arrival_location">Arrival Location</Label>
                          <Input
                            id="arrival_location"
                            value={formData.arrival_location}
                            onChange={(e) => setFormData({ ...formData, arrival_location: e.target.value })}
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
                            onChange={(e) => setFormData({ ...formData, departure_date: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="arrival_date">Arrival Date & Time</Label>
                          <Input
                            id="arrival_date"
                            type="datetime-local"
                            value={formData.arrival_date}
                            onChange={(e) => setFormData({ ...formData, arrival_date: e.target.value })}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="travel_purpose">Travel Purpose</Label>
                        <Textarea
                          id="travel_purpose"
                          value={formData.travel_purpose}
                          onChange={(e) => setFormData({ ...formData, travel_purpose: e.target.value })}
                          placeholder="Describe the purpose of this travel..."
                          rows={3}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowNewItinerary(false)}>
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
                                    {itinerary.departure_date && (
                                      <p className="text-xs text-muted-foreground">
                                        {format(new Date(itinerary.departure_date), "dd/MM/yyyy HH:mm")}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-start gap-2">
                                  <MapPin className="h-4 w-4 text-green-500 mt-1" />
                                  <div>
                                    <p className="text-xs text-muted-foreground">To</p>
                                    <p className="font-medium">{itinerary.arrival_location}</p>
                                    {itinerary.arrival_date && (
                                      <p className="text-xs text-muted-foreground">
                                        {format(new Date(itinerary.arrival_date), "dd/MM/yyyy HH:mm")}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {itinerary.travel_purpose && (
                                <p className="text-sm text-muted-foreground">
                                  {itinerary.travel_purpose}
                                </p>
                              )}

                              {itinerary.legs && itinerary.legs.length > 0 && (
                                <p className="text-xs text-muted-foreground mt-2">
                                  {itinerary.legs.length} leg(s)
                                </p>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => exportToPDF(itinerary)}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            PDF
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Travel Conflicts
              </CardTitle>
              <CardDescription>
                Detected scheduling conflicts for review
              </CardDescription>
            </CardHeader>
            <CardContent>
              {conflicts.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No active conflicts
                </p>
              ) : (
                <div className="space-y-3">
                  {conflicts.map((conflict) => (
                    <Card key={conflict.id} className="border-l-4 border-l-orange-500">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              {getSeverityBadge(conflict.severity)}
                              <Badge variant="outline">{conflict.conflict_type}</Badge>
                            </div>
                            <p className="text-sm">{conflict.conflict_description}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              Detected: {format(new Date(conflict.created_at), "dd/MM/yyyy HH:mm")}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => resolveConflict(conflict.id)}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
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
};

export default TravelManagement;
