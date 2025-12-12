import { useEffect, useState, useCallback } from "react";;

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Package, 
  Truck,
  Ship,
  Plane,
  MapPin,
  Calendar,
  Search,
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";

interface Shipment {
  id: string;
  shipment_number: string;
  carrier: string;
  tracking_number: string;
  shipping_method: string;
  origin_port: string;
  destination_port: string;
  shipped_date: string;
  estimated_arrival: string;
  actual_arrival?: string;
  status: string;
  current_location?: string;
  last_location_update?: string;
}

export const ShipmentTracking = memo(() => {
  const { toast } = useToast();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadShipments();
  }, []);

  const loadShipments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("shipments")
        .select("*")
        .order("estimated_arrival", { ascending: true });

      if (error) throw error;
      setShipments(data || []);
    } catch (error: SupabaseError | null) {
      toast({
        title: "Error loading shipments",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
    case "delivered":
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    case "delayed":
    case "lost":
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    case "in_transit":
      return <Truck className="h-5 w-5 text-blue-500" />;
    default:
      return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getShippingIcon = (method: string) => {
    switch (method) {
    case "air":
      return <Plane className="h-4 w-4" />;
    case "sea":
      return <Ship className="h-4 w-4" />;
    default:
      return <Truck className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "destructive" | "secondary" | "outline"> = {
      preparing: "secondary",
      shipped: "default",
      in_transit: "default",
      arrived_port: "default",
      customs_clearance: "secondary",
      out_for_delivery: "default",
      delivered: "outline",
      delayed: "destructive",
      cancelled: "destructive",
      lost: "destructive"
    };
    return (
      <Badge variant={variants[status] || "default"}>
        {status.replace("_", " ")}
      </Badge>
    );
  };

  const filteredShipments = shipments.filter(shipment =>
    shipment.shipment_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shipment.tracking_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shipment.carrier?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getActiveShipments = () => {
    return shipments.filter(s => 
      !["delivered", "cancelled", "lost"].includes(s.status)
    );
  };

  const getDelayedShipments = () => {
    return shipments.filter(s => s.status === "delayed");
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Shipments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getActiveShipments().length}</div>
            <p className="text-xs text-muted-foreground">In transit or processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Delayed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {getDelayedShipments().length}
            </div>
            <p className="text-xs text-muted-foreground">Requiring attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Shipments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{shipments.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {shipments.filter(s => s.status === "delivered").length}
            </div>
            <p className="text-xs text-muted-foreground">Successfully delivered</p>
          </CardContent>
        </Card>
      </div>

      {/* Shipment Tracking */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Shipment Tracking</CardTitle>
              <CardDescription>Track your shipments in real-time</CardDescription>
            </div>
            <Button size="sm">
              <Package className="h-4 w-4 mr-2" />
              New Shipment
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by shipment number, tracking number, or carrier..."
                value={searchTerm}
                onChange={handleChange}
                className="pl-8"
              />
            </div>
          </div>

          {/* Shipments List */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">Loading shipments...</div>
            ) : filteredShipments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No shipments found
              </div>
            ) : (
              filteredShipments.map(shipment => (
                <Card key={shipment.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(shipment.status)}
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{shipment.shipment_number}</h4>
                            {getStatusBadge(shipment.status)}
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                            {getShippingIcon(shipment.shipping_method)}
                            <span className="capitalize">{shipment.shipping_method}</span>
                            {shipment.carrier && (
                              <>
                                <span>•</span>
                                <span>{shipment.carrier}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      {shipment.tracking_number && (
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Track
                        </Button>
                      )}
                    </div>

                    {/* Route Information */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Origin</div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            {shipment.origin_port || "N/A"}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Destination</div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            {shipment.destination_port || "N/A"}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Current Location</div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-medium">
                            {shipment.current_location || "Updating..."}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Shipped</div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {shipment.shipped_date ? 
                            format(new Date(shipment.shipped_date), "MMM dd, yyyy") : 
                            "Not shipped"
                          }
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Est. Arrival</div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {shipment.estimated_arrival ? 
                            format(new Date(shipment.estimated_arrival), "MMM dd, yyyy") : 
                            "N/A"
                          };
                        </div>
                      </div>
                      {shipment.actual_arrival && (
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Delivered</div>
                          <div className="flex items-center gap-2 text-sm text-green-600">
                            <CheckCircle2 className="h-4 w-4" />
                            {format(new Date(shipment.actual_arrival), "MMM dd, yyyy")}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Tracking Number */}
                    {shipment.tracking_number && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="text-xs text-muted-foreground mb-1">Tracking Number</div>
                        <div className="flex items-center justify-between">
                          <code className="text-sm font-mono">{shipment.tracking_number}</code>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(shipment.tracking_number);
                              toast({
                                title: "Copied",
                                description: "Tracking number copied to clipboard",
                              });
                            }}
                          >
                            Copy
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
