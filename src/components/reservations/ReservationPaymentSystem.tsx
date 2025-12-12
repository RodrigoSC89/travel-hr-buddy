/**
import { useEffect, useState, useCallback } from "react";;
 * PATCH 368 - Reservations - Payment & Calendar Integration
 * Complete reservation system with payment processing and calendar sync
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Calendar,
  CreditCard,
  CheckCircle,
  AlertTriangle,
  Clock,
  DollarSign,
  Mail,
  Download,
  Send,
  Bell,
  RefreshCw,
  MapPin,
  Users,
  FileText,
  Link as LinkIcon,
  X
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";

interface Reservation {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  reservation_type: string;
  start_date: string;
  end_date: string;
  location?: string;
  status: "pending" | "confirmed" | "cancelled";
  total_amount?: number;
  currency?: string;
  payment_status?: "pending" | "paid" | "refunded" | "failed";
  payment_method?: string;
  payment_transaction_id?: string;
  confirmation_number?: string;
  calendar_event_id?: string;
  notes?: string;
  created_at: string;
}

interface PaymentIntent {
  amount: number;
  currency: string;
  payment_method: "stripe" | "paypal" | "credit_card";
  reservation_id: string;
}

interface CalendarSyncConfig {
  provider: "google" | "outlook" | "ical";
  auto_sync: boolean;
  send_reminders: boolean;
}

export const ReservationPaymentSystem: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isCalendarDialogOpen, setIsCalendarDialogOpen] = useState(false);
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntent | null>(null);
  const [calendarSync, setCalendarSync] = useState<CalendarSyncConfig>({
    provider: "google",
    auto_sync: true,
    send_reminders: true,
  };
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("reservations")
        .select("*")
        .order("start_date", { ascending: true });

      if (error) throw error;
      setReservations(data || []);
    } catch (error) {
      console.error("Error loading reservations:", error);
      console.error("Error loading reservations:", error);
      toast.error("Failed to load reservations");
    } finally {
      setLoading(false);
    }
  };

  const initiatePayment = async (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setPaymentIntent({
      amount: reservation.total_amount || 0,
      currency: reservation.currency || "USD",
      payment_method: "stripe",
      reservation_id: reservation.id,
    };
    setIsPaymentDialogOpen(true);
  };

  const processPayment = async () => {
    if (!paymentIntent || !selectedReservation) return;

    try {
      setProcessingPayment(true);

      // Simulate payment processing (in production, integrate with Stripe/PayPal)
      const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

      // Update reservation with payment info
      const { error } = await supabase
        .from("reservations")
        .update({
          payment_status: "paid",
          payment_method: paymentIntent.payment_method,
          payment_transaction_id: transactionId,
          status: "confirmed",
          confirmation_number: `CONF-${Date.now()}`,
        })
        .eq("id", selectedReservation.id);

      if (error) throw error;

      toast.success("Payment processed successfully!");
      
      // Send confirmation email
      await sendConfirmationEmail(selectedReservation.id);
      
      // Sync to calendar
      if (calendarSync.auto_sync) {
        await syncToCalendar(selectedReservation);
      }
      
      // Send push notification
      await sendPushNotification(selectedReservation.id, "Reservation confirmed and paid");

      setIsPaymentDialogOpen(false);
      loadReservations();
    } catch (error) {
      console.error("Error processing payment:", error);
      console.error("Error processing payment:", error);
      toast.error("Payment failed. Please try again.");
    } finally {
      setProcessingPayment(false);
    }
  };

  const sendConfirmationEmail = async (reservationId: string) => {
    try {
      // In production, integrate with email service (SendGrid, AWS SES, etc.)
      
      // Log notification
      await supabase.from("notifications").insert({
        user_id: selectedReservation?.user_id,
        title: "Reservation Confirmed",
        message: `Your reservation ${selectedReservation?.title} has been confirmed and paid.`,
        type: "reservation_confirmation",
        priority: "high",
        status: "sent",
      };

      toast.info("Confirmation email sent");
    } catch (error) {
      console.error("Error sending email:", error);
      console.error("Error sending email:", error);
    }
  };

  const sendPushNotification = async (reservationId: string, message: string) => {
    try {
      // In production, integrate with push notification service (Firebase, OneSignal, etc.)
      
      await supabase.from("notifications").insert({
        user_id: selectedReservation?.user_id,
        title: "Reservation Update",
        message,
        type: "push_notification",
        priority: "medium",
        status: "sent",
      };
    } catch (error) {
      console.error("Error sending push notification:", error);
      console.error("Error sending push notification:", error);
    }
  };

  const syncToCalendar = async (reservation: Reservation) => {
    try {
      const calendarEvent = {
        title: reservation.title,
        description: reservation.description || "",
        start: reservation.start_date,
        end: reservation.end_date,
        location: reservation.location || "",
      };

      // Generate iCal format
      const icalContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Nautilus One//Reservation System//EN
BEGIN:VEVENT
UID:${reservation.id}@nautilusone.com
DTSTART:${format(parseISO(reservation.start_date), "yyyyMMdd'T'HHmmss")}
DTEND:${format(parseISO(reservation.end_date), "yyyyMMdd'T'HHmmss")}
SUMMARY:${calendarEvent.title}
DESCRIPTION:${calendarEvent.description}
LOCATION:${calendarEvent.location}
STATUS:CONFIRMED
SEQUENCE:0
BEGIN:VALARM
TRIGGER:-PT24H
ACTION:DISPLAY
DESCRIPTION:Reminder: ${calendarEvent.title} tomorrow
END:VALARM
END:VEVENT
END:VCALENDAR`;

      // For Google Calendar
      if (calendarSync.provider === "google") {
        const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(calendarEvent.title)}&dates=${format(parseISO(reservation.start_date), "yyyyMMdd'T'HHmmss")}/${format(parseISO(reservation.end_date), "yyyyMMdd'T'HHmmss")}&details=${encodeURIComponent(calendarEvent.description)}&location=${encodeURIComponent(calendarEvent.location)}`;
        
        // Open in new window
        window.open(googleCalendarUrl, "_blank");
      }

      // For Outlook Calendar
      if (calendarSync.provider === "outlook") {
        const outlookUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(calendarEvent.title)}&startdt=${reservation.start_date}&enddt=${reservation.end_date}&body=${encodeURIComponent(calendarEvent.description)}&location=${encodeURIComponent(calendarEvent.location)}`;
        
        window.open(outlookUrl, "_blank");
      }

      // For iCal download
      if (calendarSync.provider === "ical") {
        const blob = new Blob([icalContent], { type: "text/calendar" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `reservation-${reservation.id}.ics`;
        a.click();
      }

      // Update reservation with calendar sync info
      await supabase
        .from("reservations")
        .update({ calendar_event_id: reservation.id })
        .eq("id", reservation.id);

      toast.success("Synced to calendar");
    } catch (error) {
      console.error("Error syncing to calendar:", error);
      console.error("Error syncing to calendar:", error);
      toast.error("Failed to sync calendar");
    }
  };

  const processRefund = async (reservationId: string) => {
    try {
      // Simulate refund processing
      const { error } = await supabase
        .from("reservations")
        .update({
          payment_status: "refunded",
          status: "cancelled",
        })
        .eq("id", reservationId);

      if (error) throw error;

      toast.success("Refund processed successfully");
      loadReservations();
    } catch (error) {
      console.error("Error processing refund:", error);
      console.error("Error processing refund:", error);
      toast.error("Failed to process refund");
    }
  };

  const cancelReservation = async (reservationId: string) => {
    try {
      const reservation = reservations.find((r) => r.id === reservationId);
      
      if (reservation?.payment_status === "paid") {
        // Process refund if paid
        await processRefund(reservationId);
      } else {
        // Just cancel
        const { error } = await supabase
          .from("reservations")
          .update({ status: "cancelled" })
          .eq("id", reservationId);

        if (error) throw error;
        toast.success("Reservation cancelled");
      }

      loadReservations();
    } catch (error) {
      console.error("Error cancelling reservation:", error);
      console.error("Error cancelling reservation:", error);
      toast.error("Failed to cancel reservation");
    }
  };

  const exportReservationHistory = () => {
    const csvData = reservations.map((r) => ({
      id: r.id,
      title: r.title,
      type: r.reservation_type,
      start_date: r.start_date,
      end_date: r.end_date,
      status: r.status,
      payment_status: r.payment_status || "N/A",
      amount: r.total_amount || 0,
      currency: r.currency || "USD",
      confirmation: r.confirmation_number || "N/A",
    }));

    const csv = [
      Object.keys(csvData[0]).join(","),
      ...csvData.map((row) => Object.values(row).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reservations-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();

    toast.success("Reservation history exported");
  };

  const getPaymentStatusBadge = (status: string) => {
    const variants = {
      paid: "default",
      pending: "secondary",
      refunded: "outline",
      failed: "destructive",
    };
    return (
      <Badge variant={variants[status] || "secondary"}>
        {status?.toUpperCase() || "PENDING"}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      confirmed: "default",
      pending: "secondary",
      cancelled: "destructive",
    };
    return (
      <Badge variant={variants[status] || "secondary"}>
        {status.toUpperCase()}
      </Badge>
    );
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
            <Calendar className="h-8 w-8 text-primary" />
            Reservation & Payment System
          </h1>
          <p className="text-muted-foreground">
            Complete payment processing and calendar integration
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportReservationHistory}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={loadReservations}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reservations</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reservations.length}</div>
            <p className="text-xs text-muted-foreground">
              {reservations.filter((r) => r.status === "confirmed").length} confirmed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Reservations</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reservations.filter((r) => r.payment_status === "paid").length}
            </div>
            <p className="text-xs text-muted-foreground">Successfully processed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reservations.filter((r) => r.payment_status === "pending").length}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${reservations
                .filter((r) => r.payment_status === "paid")
                .reduce((sum, r) => sum + (r.total_amount || 0), 0)
                .toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Total revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Reservations</TabsTrigger>
          <TabsTrigger value="paid">Paid</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {reservations.map((reservation) => (
            <Card key={reservation.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{reservation.title}</CardTitle>
                    <CardDescription>
                      {format(parseISO(reservation.start_date), "PPP")} -{" "}
                      {format(parseISO(reservation.end_date), "PPP")}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(reservation.status)}
                    {getPaymentStatusBadge(reservation.payment_status || "pending")}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                  <div>
                    <p className="text-muted-foreground">Type</p>
                    <p className="font-medium">{reservation.reservation_type}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Location</p>
                    <p className="font-medium flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {reservation.location || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Amount</p>
                    <p className="font-medium">
                      {reservation.currency || "USD"} ${reservation.total_amount || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Confirmation</p>
                    <p className="font-medium">{reservation.confirmation_number || "N/A"}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  {reservation.payment_status !== "paid" && reservation.status !== "cancelled" && (
                    <Button
                      size="sm"
                      onClick={() => handleinitiatePayment}
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Pay Now
                    </Button>
                  )}
                  
                  {reservation.payment_status === "paid" && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedReservation(reservation);
                          setIsCalendarDialogOpen(true);
                        }}
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Add to Calendar
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlesendConfirmationEmail}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Resend Confirmation
                      </Button>
                    </>
                  )}

                  {reservation.status !== "cancelled" && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handlecancelReservation}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="paid">
          {reservations.filter((r) => r.payment_status === "paid").map((reservation) => (
            <Card key={reservation.id}>
              <CardHeader>
                <CardTitle>{reservation.title}</CardTitle>
                <CardDescription>
                  Paid on {format(new Date(reservation.created_at), "PPP")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Transaction ID</p>
                    <p className="font-mono text-sm">{reservation.payment_transaction_id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Amount</p>
                    <p className="text-lg font-bold">
                      {reservation.currency} ${reservation.total_amount}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="pending">
          {reservations.filter((r) => r.payment_status === "pending").map((reservation) => (
            <Card key={reservation.id}>
              <CardHeader>
                <CardTitle>{reservation.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <Button onClick={() => handleinitiatePayment}>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Complete Payment
                </Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="cancelled">
          {reservations.filter((r) => r.status === "cancelled").map((reservation) => (
            <Card key={reservation.id}>
              <CardHeader>
                <CardTitle className="text-muted-foreground">{reservation.title}</CardTitle>
                <CardDescription>
                  Cancelled {reservation.payment_status === "refunded" && "(Refunded)"}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Payment</DialogTitle>
            <DialogDescription>
              Process payment for {selectedReservation?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Amount</Label>
              <div className="text-2xl font-bold">
                {paymentIntent?.currency} ${paymentIntent?.amount}
              </div>
            </div>
            <div>
              <Label>Payment Method</Label>
              <Select
                value={paymentIntent?.payment_method}
                onValueChange={(value) =>
                  setPaymentIntent({ ...paymentIntent!, payment_method: value as any })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stripe">Credit Card (Stripe)</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="credit_card">Direct Credit Card</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                This is a demo. In production, integrate with Stripe or PayPal SDK for real
                payment processing.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleSetIsPaymentDialogOpen}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={processPayment}
                disabled={processingPayment}
                className="flex-1"
              >
                {processingPayment ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Pay Now
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Calendar Sync Dialog */}
      <Dialog open={isCalendarDialogOpen} onOpenChange={setIsCalendarDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sync to Calendar</DialogTitle>
            <DialogDescription>
              Add {selectedReservation?.title} to your calendar
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Calendar Provider</Label>
              <Select
                value={calendarSync.provider}
                onValueChange={(value) =>
                  setCalendarSync({ ...calendarSync, provider: value as any })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="google">Google Calendar</SelectItem>
                  <SelectItem value="outlook">Outlook Calendar</SelectItem>
                  <SelectItem value="ical">iCal (Download)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label>Auto-sync future reservations</Label>
              <Checkbox
                checked={calendarSync.auto_sync}
                onCheckedChange={(checked) =>
                  setCalendarSync({ ...calendarSync, auto_sync: !!checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Send reminders</Label>
              <Checkbox
                checked={calendarSync.send_reminders}
                onCheckedChange={(checked) =>
                  setCalendarSync({ ...calendarSync, send_reminders: !!checked })
                }
              />
            </div>
            <Button
              onClick={() => {
                if (selectedReservation) {
                  syncToCalendar(selectedReservation);
                  setIsCalendarDialogOpen(false);
                }
              }}
              className="w-full"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Sync to Calendar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
});

export default ReservationPaymentSystem;
