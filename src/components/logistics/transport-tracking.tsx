// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Truck, 
  Ship, 
  Plane, 
  MapPin, 
  Clock, 
  Package,
  CheckCircle,
  AlertCircle,
  Navigation
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Transport {
  id: string;
  tracking_number: string;
  type: 'truck' | 'ship' | 'plane';
  carrier: string;
  status: 'pending' | 'in_transit' | 'delayed' | 'delivered';
  origin: string;
  destination: string;
  current_location?: string;
  departure_date: string;
  estimated_arrival: string;
  actual_arrival?: string;
  progress_percentage: number;
  items_count: number;
}

interface TrackingStage {
  id: string;
  transport_id: string;
  stage: string;
  location: string;
  timestamp: string;
  status: 'completed' | 'current' | 'pending';
  notes?: string;
}

export const TransportTracking = () => {
  const [transports, setTransports] = useState<Transport[]>([]);
  const [selectedTransport, setSelectedTransport] = useState<Transport | null>(null);
  const [trackingStages, setTrackingStages] = useState<TrackingStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    loadTransports();
  }, []);

  useEffect(() => {
    if (selectedTransport) {
      loadTrackingStages(selectedTransport.id);
    }
  }, [selectedTransport]);

  const loadTransports = async () => {
    try {
      const { data, error } = await supabase
        .from("logistics_transports")
        .select("*")
        .order("departure_date", { ascending: false });

      if (error) throw error;
      setTransports(data || []);
    } catch (error) {
      console.error("Error loading transports:", error);
      toast.error("Failed to load transport data");
    } finally {
      setLoading(false);
    }
  };

  const loadTrackingStages = async (transportId: string) => {
    try {
      const { data, error } = await supabase
        .from("logistics_tracking_stages")
        .select("*")
        .eq("transport_id", transportId)
        .order("timestamp", { ascending: true });

      if (error) throw error;
      setTrackingStages(data || []);
    } catch (error) {
      console.error("Error loading tracking stages:", error);
      toast.error("Failed to load tracking stages");
    }
  };

  const getTransportIcon = (type: string) => {
    switch (type) {
      case 'truck': return <Truck className="h-5 w-5" />;
      case 'ship': return <Ship className="h-5 w-5" />;
      case 'plane': return <Plane className="h-5 w-5" />;
      default: return <Package className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-500';
      case 'in_transit': return 'bg-blue-500';
      case 'delayed': return 'bg-red-500';
      case 'pending': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'delayed': return <AlertCircle className="h-4 w-4" />;
      default: return <Navigation className="h-4 w-4" />;
    }
  };

  const filterTransports = (status: string) => {
    if (status === 'all') return transports;
    return transports.filter(t => t.status === status);
  };

  const calculateETA = (estimatedArrival: string) => {
    const now = new Date();
    const eta = new Date(estimatedArrival);
    const diffInHours = Math.ceil((eta.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 0) return "Overdue";
    if (diffInHours < 24) return `${diffInHours}h`;
    return `${Math.ceil(diffInHours / 24)} days`;
  };

  if (loading) {
    return <div className="text-center py-8">Loading transport data...</div>;
  }

  const displayTransports = filterTransports(activeTab);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Transport Tracking</CardTitle>
          <CardDescription>Monitor shipments across all transport modes</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">
                All ({transports.length})
              </TabsTrigger>
              <TabsTrigger value="pending">
                Pending ({transports.filter(t => t.status === 'pending').length})
              </TabsTrigger>
              <TabsTrigger value="in_transit">
                In Transit ({transports.filter(t => t.status === 'in_transit').length})
              </TabsTrigger>
              <TabsTrigger value="delayed">
                Delayed ({transports.filter(t => t.status === 'delayed').length})
              </TabsTrigger>
              <TabsTrigger value="delivered">
                Delivered ({transports.filter(t => t.status === 'delivered').length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6 space-y-4">
              {displayTransports.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No transports in this category</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {displayTransports.map((transport) => (
                    <Card 
                      key={transport.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setSelectedTransport(transport)}
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              {getTransportIcon(transport.type)}
                            </div>
                            <div>
                              <div className="font-semibold">{transport.tracking_number}</div>
                              <div className="text-sm text-muted-foreground">
                                {transport.carrier}
                              </div>
                            </div>
                          </div>
                          <Badge className={`${getStatusColor(transport.status)} text-white`}>
                            {getStatusIcon(transport.status)}
                            <span className="ml-1">{transport.status.replace('_', ' ')}</span>
                          </Badge>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">From:</span>
                              <span className="font-medium">{transport.origin}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">To:</span>
                              <span className="font-medium">{transport.destination}</span>
                            </div>
                          </div>

                          {transport.current_location && (
                            <div className="flex items-center gap-2 text-sm">
                              <Navigation className="h-4 w-4 text-blue-500" />
                              <span className="text-muted-foreground">Current:</span>
                              <span className="font-medium">{transport.current_location}</span>
                            </div>
                          )}

                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Progress</span>
                              <span className="font-medium">{transport.progress_percentage}%</span>
                            </div>
                            <Progress value={transport.progress_percentage} />
                          </div>

                          <div className="flex items-center justify-between text-sm pt-2 border-t">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">ETA:</span>
                              <span className="font-medium">{calculateETA(transport.estimated_arrival)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{transport.items_count} items</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Tracking Details Modal */}
      {selectedTransport && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Tracking Details</CardTitle>
                <CardDescription>{selectedTransport.tracking_number}</CardDescription>
              </div>
              <Button variant="outline" onClick={() => setSelectedTransport(null)}>
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Carrier</div>
                  <div className="font-medium">{selectedTransport.carrier}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Type</div>
                  <div className="flex items-center gap-2">
                    {getTransportIcon(selectedTransport.type)}
                    <span className="font-medium capitalize">{selectedTransport.type}</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Departure</div>
                  <div className="font-medium">
                    {new Date(selectedTransport.departure_date).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Estimated Arrival</div>
                  <div className="font-medium">
                    {new Date(selectedTransport.estimated_arrival).toLocaleString()}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Tracking History</h3>
                <div className="space-y-4">
                  {trackingStages.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No tracking stages recorded</p>
                  ) : (
                    trackingStages.map((stage, index) => (
                      <div key={stage.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full ${
                            stage.status === 'completed' ? 'bg-green-500' :
                            stage.status === 'current' ? 'bg-blue-500' :
                            'bg-gray-300'
                          }`} />
                          {index < trackingStages.length - 1 && (
                            <div className="w-0.5 h-full bg-gray-200 flex-1" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="font-medium">{stage.stage}</div>
                          <div className="text-sm text-muted-foreground">{stage.location}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {new Date(stage.timestamp).toLocaleString()}
                          </div>
                          {stage.notes && (
                            <div className="text-sm mt-2 p-2 bg-muted rounded">
                              {stage.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
