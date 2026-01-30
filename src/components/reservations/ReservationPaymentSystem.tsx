/**
 * PATCH 368 - Reservations - Payment & Calendar Integration
 * PATCH 10/10 - Removed @ts-nocheck, added proper typing for notifications insert
 */
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Calendar,
  CreditCard,
  CheckCircle,
  Clock,
  DollarSign,
  Mail,
  Download,
  RefreshCw,
  MapPin,
  X
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { logger } from "@/lib/logger";
import type { Database } from "@/integrations/supabase/types";

// Type aliases from Supabase schema
type ReservationRow = Database["public"]["Tables"]["reservations"]["Row"];
type NotificationInsert = Database["public"]["Tables"]["notifications"]["Insert"];

interface Reservation {
  id: string;
  user_id?: string | null;
  title?: string | null;
  description?: string | null;
  reservation_type?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  location?: string | null;
  status?: string | null;
  total_amount?: number | null;
  currency?: string | null;
  payment_status?: string | null;
  payment_method?: string | null;
  payment_transaction_id?: string | null;
  confirmation_number?: string | null;
  notes?: string | null;
  created_at?: string | null;
  calendar_event_id?: string | null;
}

type PaymentMethod = "stripe" | "paypal" | "credit_card";
type CalendarProvider = "google" | "outlook" | "ical";

interface PaymentIntent {
  amount: number;
  currency: string;
  payment_method: PaymentMethod;
  reservation_id: string;
}

interface CalendarSyncConfig {
  provider: CalendarProvider;
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
  });
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
      
      // Map database rows to our interface
      const mapped: Reservation[] = (data || []).map((row: ReservationRow) => ({
        id: row.id,
        user_id: row.user_id,
        title: row.title,
        description: row.description,
        reservation_type: row.reservation_type,
        start_date: row.start_date,
        end_date: row.end_date,
        location: row.location,
        status: row.status,
        total_amount: row.total_amount,
        currency: row.currency,
        payment_status: row.payment_status,
        payment_method: row.payment_method,
        payment_transaction_id: row.payment_transaction_id,
        confirmation_number: row.confirmation_number,
        notes: row.notes,
        created_at: row.created_at,
        calendar_event_id: row.calendar_event_id,
      }));
      
      setReservations(mapped);
    } catch (error) {
      logger.error("Error loading reservations", { error });
      toast.error("Failed to load reservations");
    } finally {
      setLoading(false);
    }
  };

  const initiatePayment = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setPaymentIntent({
      amount: reservation.total_amount || 0,
      currency: reservation.currency || "USD",
      payment_method: "stripe",
      reservation_id: reservation.id,
    });
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
      await sendConfirmationEmail(selectedReservation);
      
      // Sync to calendar
      if (calendarSync.auto_sync) {
        await syncToCalendar(selectedReservation);
      }
      
      // Send push notification
      await sendPushNotification(selectedReservation, "Reservation confirmed and paid");

      setIsPaymentDialogOpen(false);
      loadReservations();
    } catch (error) {
      logger.error("Error processing payment", { error });
      toast.error("Payment failed. Please try again.");
    } finally {
      setProcessingPayment(false);
    }
  };

  const sendConfirmationEmail = async (reservation: Reservation) => {
    if (!reservation.user_id) {
      logger.warn("Cannot send confirmation - no user_id");
      return;
    }
    
    try {
      // Log notification with proper typing
      const notificationData: NotificationInsert = {
        user_id: reservation.user_id,
        title: "Reservation Confirmed",
        message: `Your reservation ${reservation.title || "Untitled"} has been confirmed and paid.`,
        type: "reservation_confirmation",
        priority: "high",
      };
      
      const { error } = await supabase.from("notifications").insert(notificationData);
      
      if (error) {
        logger.error("Failed to insert notification", { error });
      } else {
        toast.info("Confirmation email sent");
      }
    } catch (error) {
      logger.error("Error sending email", { error });
    }
  };

  const sendPushNotification = async (reservation: Reservation, message: string) => {
    if (!reservation.user_id) {
      logger.warn("Cannot send push notification - no user_id");
      return;
    }
    
    try {
      const notificationData: NotificationInsert = {
        user_id: reservation.user_id,
        title: "Reservation Update",
        message,
        type: "push_notification",
        priority: "medium",
      };
      
      const { error } = await supabase.from("notifications").insert(notificationData);
      
      if (error) {
        logger.error("Failed to insert push notification", { error });
      }
    } catch (error) {
      logger.error("Error sending push notification", { error });
    }
  };

  const syncToCalendar = async (reservation: Reservation) => {
    if (!reservation.start_date || !reservation.end_date) {
      toast.error("Missing dates for calendar sync");
      return;
    }
    
    try {
      const calendarEvent = {
        title: reservation.title || "Reservation",
        description: reservation.description || "",
        start: reservation.start_date,
        end: reservation.end_date,
        location: reservation.location || "",
      };

      // Generate iCal format
      const icalContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Nauti One//Reservation System//EN
BEGIN:VEVENT
UID:${reservation.id}@nautione.com
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
        URL.revokeObjectURL(url);
      }

      // Update reservation with calendar sync info
      await supabase
        .from("reservations")
        .update({ calendar_event_id: reservation.id })
        .eq("id", reservation.id);

      toast.success("Synced to calendar");
    } catch (error) {
      logger.error("Error syncing to calendar", { error });
      toast.error("Failed to sync calendar");
    }
  };

  const processRefund = async (reservationId: string) => {
    try {
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
      logger.error("Error processing refund", { error });
      toast.error("Failed to process refund");
    }
  };

  const cancelReservation = async (reservationId: string) => {
    try {
      const reservation = reservations.find((r) => r.id === reservationId);
      
      if (reservation?.payment_status === "paid") {
        await processRefund(reservationId);
      } else {
        const { error } = await supabase
          .from("reservations")
          .update({ status: "cancelled" })
          .eq("id", reservationId);

        if (error) throw error;
        toast.success("Reservation cancelled");
      }

      loadReservations();
    } catch (error) {
      logger.error("Error cancelling reservation", { error });
      toast.error("Failed to cancel reservation");
    }
  };

  const exportReservationHistory = () => {
    if (reservations.length === 0) {
      toast.error("No reservations to export");
      return;
    }
    
    const csvData = reservations.map((r) => ({
      id: r.id,
      title: r.title || "",
      type: r.reservation_type || "",
      start_date: r.start_date || "",
      end_date: r.end_date || "",
      status: r.status || "",
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
    URL.revokeObjectURL(url);

    toast.success("Reservation history exported");
  };

  const getPaymentStatusBadge = (status?: string | null) => {
    const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      paid: "default",
      pending: "secondary",
      refunded: "outline",
      failed: "destructive",
    };
    const variant = status ? variants[status] || "secondary" : "secondary";
    return (
      <Badge variant={variant}>
        {status?.toUpperCase() || "PENDING"}
      </Badge>
    );
  };

  const getStatusBadge = (status?: string | null) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      confirmed: "default",
      pending: "secondary",
      cancelled: "destructive",
    };
    const variant = status ? variants[status] || "secondary" : "secondary";
    return (
      <Badge variant={variant}>
        {(status || "pending").toUpperCase()}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
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
              {reservations.filter((r) => r.payment_status === "pending" || !r.payment_status).length}
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
          {reservations.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No reservations found
              </CardContent>
            </Card>
          ) : (
            reservations.map((reservation) => (
              <Card key={reservation.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{reservation.title || "Untitled"}</CardTitle>
                      <CardDescription>
                        {reservation.start_date && reservation.end_date ? (
                          <>
                            {format(parseISO(reservation.start_date), "PPP")} -{" "}
                            {format(parseISO(reservation.end_date), "PPP")}
                          </>
                        ) : (
                          "No dates specified"
                        )}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(reservation.status)}
                      {getPaymentStatusBadge(reservation.payment_status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                    <div>
                      <p className="text-muted-foreground">Type</p>
                      <p className="font-medium">{reservation.reservation_type || "N/A"}</p>
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
                        onClick={() => initiatePayment(reservation)}
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
                          onClick={() => sendConfirmationEmail(reservation)}
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
                        onClick={() => cancelReservation(reservation.id)}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="paid">
          {reservations.filter((r) => r.payment_status === "paid").map((reservation) => (
            <Card key={reservation.id}>
              <CardHeader>
                <CardTitle>{reservation.title || "Untitled"}</CardTitle>
                <CardDescription>
                  Paid on {reservation.created_at ? format(new Date(reservation.created_at), "PPP") : "N/A"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Transaction ID</p>
                    <p className="font-mono text-sm">{reservation.payment_transaction_id || "N/A"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Amount</p>
                    <p className="text-lg font-bold">
                      {reservation.currency || "USD"} ${reservation.total_amount || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="pending">
          {reservations.filter((r) => r.payment_status === "pending" || !r.payment_status).map((reservation) => (
            <Card key={reservation.id}>
              <CardHeader>
                <CardTitle>{reservation.title || "Untitled"}</CardTitle>
              </CardHeader>
              <CardContent>
                <Button onClick={() => initiatePayment(reservation)}>
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
                <CardTitle className="text-muted-foreground">{reservation.title || "Untitled"}</CardTitle>
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
              Process payment for {selectedReservation?.title || "reservation"}
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
                onValueChange={(value: PaymentMethod) =>
                  setPaymentIntent(prev => prev ? { ...prev, payment_method: value } : null)
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
                onClick={() => setIsPaymentDialogOpen(false)}
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
              Add {selectedReservation?.title || "reservation"} to your calendar
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Calendar Provider</Label>
              <Select
                value={calendarSync.provider}
                onValueChange={(value: CalendarProvider) =>
                  setCalendarSync(prev => ({ ...prev, provider: value }))
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
                  setCalendarSync(prev => ({ ...prev, auto_sync: !!checked }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Send reminders</Label>
              <Checkbox
                checked={calendarSync.send_reminders}
                onCheckedChange={(checked) =>
                  setCalendarSync(prev => ({ ...prev, send_reminders: !!checked }))
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
};

export default ReservationPaymentSystem;
