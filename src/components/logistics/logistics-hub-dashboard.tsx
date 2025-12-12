import { useEffect, useState } from "react";;

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Truck, Users, BarChart3, Map } from "lucide-react";
import { InventoryManagement } from "./inventory-management";
import { SupplyOrdersManagement } from "./supply-orders-management";
import { DeliveryMap } from "./DeliveryMap";
import { supabase } from "@/integrations/supabase/client";

const LogisticsHubDashboard = () => {
  const [deliveryLocations, setDeliveryLocations] = useState([]);

  useEffect(() => {
    loadDeliveryData();
  }, []);

  const loadDeliveryData = async () => {
    // Load shipment data and transform to map format
    const { data: shipments } = await supabase
      .from("logistics_shipments")
      .select("*")
      .in("status", ["in_transit", "delivered"]);

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
          current: shipment.status === "in_transit" 
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
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="inventory">
            <Package className="h-4 w-4 mr-2" />
            Inventory
          </TabsTrigger>
          <TabsTrigger value="orders">
            <Truck className="h-4 w-4 mr-2" />
            Supply Orders
          </TabsTrigger>
          <TabsTrigger value="map">
            <Map className="h-4 w-4 mr-2" />
            Delivery Map
          </TabsTrigger>
          <TabsTrigger value="suppliers">
            <Users className="h-4 w-4 mr-2" />
            Suppliers
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4">
          <InventoryManagement />
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <SupplyOrdersManagement />
        </TabsContent>

        <TabsContent value="map" className="space-y-4">
          <DeliveryMap deliveries={deliveryLocations} />
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Supplier Management</CardTitle>
              <CardDescription>Manage your supplier relationships and procurement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Supplier management interface coming soon...</p>
                <p className="text-sm mt-2">View and manage suppliers, ratings, and contracts</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Logistics Analytics</CardTitle>
              <CardDescription>View logistics performance metrics and insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Analytics dashboard coming soon...</p>
                <p className="text-sm mt-2">Track KPIs, costs, and efficiency metrics</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LogisticsHubDashboard;
