import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Package, TruckIcon, MapPin, Clock, AlertTriangle, FileText, Plus, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const LogisticsHub = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeShipments: 0,
    pendingRequests: 0,
    criticalItems: 0,
    activeAlerts: 0
  });
  const [shipments, setShipments] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [supplyRequests, setSupplyRequests] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch active shipments
      const { data: shipmentsData, error: shipmentsError } = await supabase
        .from('shipments')
        .select('*')
        .in('status', ['preparing', 'shipped', 'in_transit', 'arrived_port'])
        .order('estimated_arrival', { ascending: true })
        .limit(10);

      if (shipmentsError) throw shipmentsError;

      // Fetch critical inventory
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('inventory_items')
        .select('*')
        .lte('current_stock', supabase.rpc('minimum_stock'))
        .order('current_stock', { ascending: true })
        .limit(10);

      if (inventoryError) throw inventoryError;

      // Fetch pending supply requests
      const { data: requestsData, error: requestsError } = await supabase
        .from('supply_requests')
        .select('*')
        .in('status', ['pending', 'approved'])
        .order('priority', { ascending: false })
        .limit(10);

      if (requestsError) throw requestsError;

      // Fetch active alerts
      const { data: alertsData, error: alertsError } = await supabase
        .from('logistics_alerts')
        .select('*')
        .eq('acknowledged', false)
        .order('severity', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(10);

      if (alertsError) throw alertsError;

      setShipments(shipmentsData || []);
      setInventory(inventoryData || []);
      setSupplyRequests(requestsData || []);
      setAlerts(alertsData || []);

      setStats({
        activeShipments: shipmentsData?.length || 0,
        pendingRequests: requestsData?.length || 0,
        criticalItems: inventoryData?.length || 0,
        activeAlerts: alertsData?.length || 0
      });

    } catch (error) {
      console.error('Error fetching logistics data:', error);
      toast({
        title: "Error",
        description: "Failed to load logistics data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      shipped: 'bg-blue-500',
      in_transit: 'bg-yellow-500',
      delivered: 'bg-green-500',
      delayed: 'bg-red-500',
      pending: 'bg-gray-500',
      approved: 'bg-blue-500',
      low_stock: 'bg-orange-500',
      out_of_stock: 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      critical: 'bg-red-500',
      high: 'bg-orange-500',
      medium: 'bg-yellow-500',
      low: 'bg-blue-500'
    };
    return colors[severity] || 'bg-gray-500';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Package className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Logistics Hub</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Request
          </Button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Shipments</CardTitle>
            <TruckIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeShipments}</div>
            <p className="text-xs text-muted-foreground">In transit</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingRequests}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Critical Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.criticalItems}</div>
            <p className="text-xs text-muted-foreground">Below threshold</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeAlerts}</div>
            <p className="text-xs text-muted-foreground">Unacknowledged</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="shipments" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="shipments">Shipments</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="requests">Supply Requests</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="shipments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Shipments</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Loading shipments...</p>
              ) : shipments.length === 0 ? (
                <p className="text-muted-foreground">No active shipments</p>
              ) : (
                <div className="space-y-4">
                  {shipments.map((shipment: any) => (
                    <div key={shipment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{shipment.shipment_number}</h3>
                          <Badge className={getStatusColor(shipment.status)}>{shipment.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {shipment.origin_port} → {shipment.destination_port}
                        </p>
                        {shipment.carrier && (
                          <p className="text-sm">Carrier: {shipment.carrier}</p>
                        )}
                      </div>
                      <div className="text-right">
                        {shipment.estimated_arrival && (
                          <p className="text-sm">
                            ETA: {format(new Date(shipment.estimated_arrival), 'MMM dd, yyyy')}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Critical Inventory Items</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Loading inventory...</p>
              ) : inventory.length === 0 ? (
                <p className="text-muted-foreground">All inventory levels normal</p>
              ) : (
                <div className="space-y-4">
                  {inventory.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{item.name}</h3>
                          <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Category: {item.category}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">
                          {item.current_stock} / {item.minimum_stock} {item.unit_of_measure}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Stock Level
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Supply Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Loading requests...</p>
              ) : supplyRequests.length === 0 ? (
                <p className="text-muted-foreground">No pending supply requests</p>
              ) : (
                <div className="space-y-4">
                  {supplyRequests.map((request: any) => (
                    <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{request.request_number}</h3>
                          <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
                          <Badge variant="outline">{request.priority}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {request.justification}
                        </p>
                      </div>
                      <div className="text-right">
                        {request.required_by_date && (
                          <p className="text-sm">
                            Required: {format(new Date(request.required_by_date), 'MMM dd, yyyy')}
                          </p>
                        )}
                        <p className="text-sm font-semibold">
                          ${request.estimated_cost?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Loading alerts...</p>
              ) : alerts.length === 0 ? (
                <p className="text-muted-foreground">No active alerts</p>
              ) : (
                <div className="space-y-4">
                  {alerts.map((alert: any) => (
                    <div key={alert.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <AlertTriangle className={`h-6 w-6 ${getSeverityColor(alert.severity)}`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{alert.title}</h3>
                          <Badge className={getSeverityColor(alert.severity)}>{alert.severity}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{alert.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(alert.created_at), 'MMM dd, yyyy HH:mm')}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">Acknowledge</Button>
                    </div>
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

export default LogisticsHub;
