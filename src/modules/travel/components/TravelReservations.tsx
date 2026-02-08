/**
 * PATCH 377: Travel Reservations & Group Management
 * Reservations synchronization, group travel, and enhanced exports
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Hotel, Plus } from "lucide-react";
import { logger } from '@/lib/logger';

// Use travel_itineraries as the canonical table for travel bookings
const TRAVEL_TABLE = "travel_itineraries" as const;

interface Reservation {
  id: string;
  reservation_number: string;
  itinerary_id?: string;
  crew_member_id?: string;
  reservation_type: string;
  provider_name: string;
  booking_reference?: string;
  status: string;
  check_in_date?: string;
  check_out_date?: string;
  location?: string;
  cost?: number;
  currency: string;
  payment_status: string;
  notes?: string;
  created_at: string;
}

export const TravelReservations: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    reservation_number: `RES-${Date.now()}`,
    reservation_type: "accommodation",
    provider_name: "",
    booking_reference: "",
    status: "confirmed",
    check_in_date: "",
    check_out_date: "",
    location: "",
    cost: 0,
    currency: "USD",
    payment_status: "pending",
    notes: ""
  });

  useEffect(() => {
    loadReservations();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [statusFilter, typeFilter, reservations]);

  const loadReservations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from(TRAVEL_TABLE)
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      const mappedData: Reservation[] = (data || []).map((row) => ({
        id: row.id,
        reservation_number: row.booking_reference || `RES-${(row.id || "").slice(0, 8)}`,
        itinerary_id: row.id,
        crew_member_id: undefined,
        reservation_type: row.status || "accommodation",
        provider_name: row.trip_name || row.destination || "",
        booking_reference: row.booking_reference || undefined,
        status: row.status || "pending",
        check_in_date: row.departure_date || undefined,
        check_out_date: row.return_date || undefined,
        location: row.destination || undefined,
        cost: row.total_cost ? Number(row.total_cost) : undefined,
        currency: "USD",
        payment_status: "pending",
        notes: undefined,
        created_at: row.created_at || "",
      }));
      
      setReservations(mappedData);
    } catch (error) {
      logger.error("Error loading reservations:", error);
      toast({
        title: "Error",
        description: "Failed to load reservations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...reservations];

    if (statusFilter !== "all") {
      filtered = filtered.filter(r => r.status === statusFilter);
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter(r => r.reservation_type === typeFilter);
    }

    setFilteredReservations(filtered);
  };

  const handleCreate = async () => {
    try {
      const { error } = await supabase
        .from(TRAVEL_TABLE)
        .insert([{
          trip_name: formData.provider_name || formData.reservation_number,
          destination: formData.location || formData.provider_name,
          origin: "N/A",
          booking_reference: formData.booking_reference || formData.reservation_number,
          status: formData.status,
          departure_date: formData.check_in_date || new Date().toISOString().split('T')[0],
          return_date: formData.check_out_date || null,
          total_cost: formData.cost,
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Reservation created successfully"
      });

      setIsCreateOpen(false);
      resetForm();
      loadReservations();
    } catch (error) {
      logger.error("Error creating reservation:", error);
      toast({
        title: "Error",
        description: "Failed to create reservation",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      reservation_number: `RES-${Date.now()}`,
      reservation_type: "accommodation",
      provider_name: "",
      booking_reference: "",
      status: "confirmed",
      check_in_date: "",
      check_out_date: "",
      location: "",
      cost: 0,
      currency: "USD",
      payment_status: "pending",
      notes: ""
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "outline",
      confirmed: "default",
      cancelled: "destructive",
      completed: "secondary",
      no_show: "outline"
    };

    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  const getPaymentBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "outline",
      paid: "default",
      refunded: "secondary",
      cancelled: "destructive"
    };

    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Hotel className="h-5 w-5" />
              Travel Reservations
            </CardTitle>
            <CardDescription>
              Manage accommodation and transportation reservations
            </CardDescription>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                New Reservation
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Reservation</DialogTitle>
                <DialogDescription>
                  Add a new travel reservation
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Reservation Number *</Label>
                    <Input
                      value={formData.reservation_number}
                      onChange={(e) => setFormData({ ...formData, reservation_number: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Type *</Label>
                    <Select 
                      value={formData.reservation_type} 
                      onValueChange={(value) => setFormData({ ...formData, reservation_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="accommodation">Accommodation</SelectItem>
                        <SelectItem value="transportation">Transportation</SelectItem>
                        <SelectItem value="car_rental">Car Rental</SelectItem>
                        <SelectItem value="service">Service</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Provider Name *</Label>
                    <Input
                      value={formData.provider_name}
                      onChange={(e) => setFormData({ ...formData, provider_name: e.target.value })}
                      placeholder="Hotel name, airline, etc."
                    />
                  </div>
                  <div>
                    <Label>Booking Reference</Label>
                    <Input
                      value={formData.booking_reference}
                      onChange={(e) => setFormData({ ...formData, booking_reference: e.target.value })}
                      placeholder="ABC123XYZ"
                    />
                  </div>
                </div>

                <div>
                  <Label>Location</Label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="City, Country"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Check-in Date</Label>
                    <Input
                      type="datetime-local"
                      value={formData.check_in_date}
                      onChange={(e) => setFormData({ ...formData, check_in_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Check-out Date</Label>
                    <Input
                      type="datetime-local"
                      value={formData.check_out_date}
                      onChange={(e) => setFormData({ ...formData, check_out_date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Cost</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.cost}
                      onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label>Currency</Label>
                    <Select 
                      value={formData.currency} 
                      onValueChange={(value) => setFormData({ ...formData, currency: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="BRL">BRL</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Payment Status</Label>
                    <Select 
                      value={formData.payment_status} 
                      onValueChange={(value) => setFormData({ ...formData, payment_status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="refunded">Refunded</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="no_show">No Show</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Notes</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional notes..."
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate}>Create Reservation</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex gap-4 mb-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="accommodation">Accommodation</SelectItem>
              <SelectItem value="transportation">Transportation</SelectItem>
              <SelectItem value="car_rental">Car Rental</SelectItem>
              <SelectItem value="service">Service</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading reservations...</div>
        ) : filteredReservations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No reservations found. Create your first reservation to get started.
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reservation #</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReservations.map((reservation) => (
                  <TableRow key={reservation.id}>
                    <TableCell className="font-mono text-sm">
                      {reservation.reservation_number}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{reservation.reservation_type}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{reservation.provider_name}</div>
                      {reservation.booking_reference && (
                        <div className="text-xs text-muted-foreground">
                          Ref: {reservation.booking_reference}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{reservation.location || "-"}</TableCell>
                    <TableCell>
                      {reservation.check_in_date
                        ? new Date(reservation.check_in_date).toLocaleDateString()
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {reservation.cost
                        ? `${reservation.cost.toFixed(2)} ${reservation.currency}`
                        : "-"}
                    </TableCell>
                    <TableCell>{getPaymentBadge(reservation.payment_status)}</TableCell>
                    <TableCell>{getStatusBadge(reservation.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
