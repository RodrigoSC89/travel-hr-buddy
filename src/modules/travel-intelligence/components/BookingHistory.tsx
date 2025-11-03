/**
 * PATCH 608: Booking History Component
 * Display historical travel bookings
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { History, Plane, Hotel, Calendar, DollarSign, ExternalLink } from "lucide-react";

interface BookingRecord {
  id: string;
  type: "flight" | "hotel";
  title: string;
  date: string;
  cost: number;
  status: "completed" | "upcoming" | "cancelled";
  details: string;
}

export default function BookingHistory() {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);

  useEffect(() => {
    // Mock data - In production, fetch from Supabase
    const mockBookings: BookingRecord[] = [
      {
        id: "1",
        type: "flight",
        title: "GRU → GIG",
        date: "2024-01-15",
        cost: 850,
        status: "completed",
        details: "LATAM - Economy Class",
      },
      {
        id: "2",
        type: "hotel",
        title: "Copacabana Palace",
        date: "2024-01-15 - 2024-01-20",
        cost: 2250,
        status: "completed",
        details: "5 nights, Deluxe Room",
      },
      {
        id: "3",
        type: "flight",
        title: "GRU → SSA",
        date: "2024-12-10",
        cost: 780,
        status: "upcoming",
        details: "GOL - Economy Class",
      },
    ];
    setBookings(mockBookings);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "default";
      case "upcoming":
        return "secondary";
      case "cancelled":
        return "destructive";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Booking History
          </CardTitle>
          <CardDescription>
            View your past and upcoming travel bookings
          </CardDescription>
        </CardHeader>
      </Card>

      {bookings.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            No booking history found
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-muted rounded-lg">
                      {booking.type === "flight" ? (
                        <Plane className="h-5 w-5" />
                      ) : (
                        <Hotel className="h-5 w-5" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{booking.title}</h3>
                        <Badge variant={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {booking.date}
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {booking.cost}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{booking.details}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
