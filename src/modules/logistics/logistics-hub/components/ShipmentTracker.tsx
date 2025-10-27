// @ts-nocheck
// PATCH 281: Logistics Hub - Shipment Tracking
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Truck, Package, MapPin, Clock, CheckCircle2, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface Shipment {
  id: string;
  tracking_number: string;
  carrier: string;
  origin: string;
  destination: string;
  status: string;
  current_location: string;
  shipped_at: string;
  estimated_delivery: string;
  actual_delivery: string | null;
}

export const ShipmentTracker = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [trackingSearch, setTrackingSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadShipments();
  }, []);

  const loadShipments = async () => {
    try {
      const { data, error } = await supabase
        .from('logistics_shipments')
        .select('*')
        .order('shipped_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setShipments(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading shipments",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const searchShipment = async () => {
    if (!trackingSearch.trim()) {
      loadShipments();
      return;
    }

    try {
      const { data, error } = await supabase
        .from('logistics_shipments')
        .select('*')
        .eq('tracking_number', trackingSearch.trim());

      if (error) throw error;

      if (data && data.length > 0) {
        setShipments(data);
        toast({
          title: "Shipment found",
          description: `Status: ${data[0].status}`,
        });
      } else {
        toast({
          title: "Not found",
          description: "No shipment with this tracking number",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Search error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const exportReport = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Shipment Tracking Report', 14, 20);
    
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28);
    doc.text(`Total Shipments: ${shipments.length}`, 14, 34);

    const tableData = shipments.map(s => [
      s.tracking_number,
      s.carrier,
      s.origin,
      s.destination,
      s.status,
      s.current_location || '-',
      s.estimated_delivery ? format(new Date(s.estimated_delivery), 'dd/MM/yyyy') : '-'
    ]);

    (doc as any).autoTable({
      startY: 40,
      head: [['Tracking', 'Carrier', 'Origin', 'Destination', 'Status', 'Location', 'ETA']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
    });

    doc.save(`shipment-report-${Date.now()}.pdf`);
    
    toast({
      title: "Report exported",
      description: "PDF downloaded successfully",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'in_transit':
        return <Truck className="h-5 w-5 text-blue-500" />;
      case 'delayed':
        return <Clock className="h-5 w-5 text-orange-500" />;
      default:
        return <Package className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'default';
      case 'in_transit': return 'secondary';
      case 'delayed': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Shipment Tracker
              </CardTitle>
              <CardDescription>
                Track your shipments from origin to destination
              </CardDescription>
            </div>
            <Button onClick={exportReport} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Enter tracking number..."
              value={trackingSearch}
              onChange={(e) => setTrackingSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchShipment()}
            />
            <Button onClick={searchShipment}>Search</Button>
            {trackingSearch && (
              <Button variant="outline" onClick={() => {
                setTrackingSearch("");
                loadShipments();
              }}>
                Clear
              </Button>
            )}
          </div>

          <div className="space-y-3">
            {loading ? (
              <p>Loading shipments...</p>
            ) : shipments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No shipments found
              </p>
            ) : (
              shipments.map((shipment) => (
                <Card key={shipment.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {getStatusIcon(shipment.status)}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono font-semibold">
                              {shipment.tracking_number}
                            </span>
                            <Badge variant={getStatusColor(shipment.status)}>
                              {shipment.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {shipment.carrier}
                          </p>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Origin</p>
                              <p className="font-medium">{shipment.origin}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Destination</p>
                              <p className="font-medium">{shipment.destination}</p>
                            </div>
                          </div>
                          {shipment.current_location && (
                            <div className="flex items-center gap-2 mt-2 text-sm">
                              <MapPin className="h-4 w-4 text-blue-500" />
                              <span>Current: {shipment.current_location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        {shipment.estimated_delivery && (
                          <div>
                            <p className="text-muted-foreground">ETA</p>
                            <p className="font-medium">
                              {format(new Date(shipment.estimated_delivery), 'dd/MM/yyyy')}
                            </p>
                          </div>
                        )}
                        {shipment.actual_delivery && (
                          <div className="mt-2">
                            <p className="text-muted-foreground">Delivered</p>
                            <p className="font-medium text-green-600">
                              {format(new Date(shipment.actual_delivery), 'dd/MM/yyyy')}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
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
