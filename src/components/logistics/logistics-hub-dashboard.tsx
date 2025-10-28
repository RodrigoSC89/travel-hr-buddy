// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Truck, Users, BarChart3, Map } from "lucide-react";
import { InventoryManagement } from "./inventory-management";
import { ShipmentTracking } from "./shipment-tracking";
import { SupplyOrdersManagement } from "./supply-orders-management";
import { DeliveryMap } from "./DeliveryMap";
import { SupplierManagement } from "./supplier-management";
import { TransportTracking } from "./transport-tracking";
import { MovementHistory } from "./movement-history";
import { InventoryAlerts } from "./inventory-alerts";
import { supabase } from "@/integrations/supabase/client";

const LogisticsHubDashboard = () => {
  const [deliveryLocations, setDeliveryLocations] = useState([]);

  useEffect(() => {
    loadDeliveryData();
  }, []);

  const loadDeliveryData = async () => {
    // Load shipment data and transform to map format
    const { data: shipments } = await supabase
      .from('logistics_shipments')
      .select('*')
      .in('status', ['in_transit', 'delivered']);

    if (shipments) {
      // Transform shipments to delivery locations with mock coordinates
      const locations = shipments.map((shipment, idx) => ({
        id: shipment.id,
        shipment_number: shipment.shipment_number,
        origin: shipment.origin,
        destination: shipment.destination,
        status: shipment.status,
        estimated_arrival: shipment.estimated_arrival,
        coordinates: {
          origin: [-47 - (idx * 2), -10 - (idx * 1.5)],
          destination: [-43 + (idx * 2), -8 + (idx * 1)],
          current: shipment.status === 'in_transit' 
            ? [-45 + (idx * 0.5), -9 + (idx * 0.5)] 
            : undefined
        }
      }));
      setDeliveryLocations(locations);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Logistics Hub</h1>
        <p className="text-muted-foreground">
          Complete supply chain management - Inventory, Suppliers, Purchase Orders, and Shipment Tracking
        </p>
      </div>

      <Tabs defaultValue="inventory" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="inventory">
            <Package className="h-4 w-4 mr-2" />
            Inventory
          </TabsTrigger>
          <TabsTrigger value="orders">
            <Truck className="h-4 w-4 mr-2" />
            Orders
          </TabsTrigger>
          <TabsTrigger value="transport">
            <Truck className="h-4 w-4 mr-2" />
            Transport
          </TabsTrigger>
          <TabsTrigger value="suppliers">
            <Users className="h-4 w-4 mr-2" />
            Suppliers
          </TabsTrigger>
          <TabsTrigger value="movement">
            <BarChart3 className="h-4 w-4 mr-2" />
            Movement
          </TabsTrigger>
          <TabsTrigger value="map">
            <Map className="h-4 w-4 mr-2" />
            Map
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4">
          <InventoryAlerts />
          <InventoryManagement />
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <SupplyOrdersManagement />
        </TabsContent>

        <TabsContent value="map" className="space-y-4">
          <DeliveryMap deliveries={deliveryLocations} />
        </TabsContent>

        <TabsContent value="transport" className="space-y-4">
          <TransportTracking />
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-4">
          <SupplierManagement />
        </TabsContent>

        <TabsContent value="movement" className="space-y-4">
          <MovementHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LogisticsHubDashboard;
