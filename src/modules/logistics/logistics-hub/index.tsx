/**
 * PATCH 296: Logistics Hub Complete
 * Enhanced with tabbed dashboard, supply requests, and alerts
 */

import React from "react";
import { Package, ClipboardList, AlertTriangle, Truck } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InventoryAlerts } from "./components/InventoryAlerts";
import { ShipmentTracker } from "./components/ShipmentTracker";
import { SupplyRequests } from "./components/SupplyRequests";
import { LogisticsAlertsPanel } from "./components/LogisticsAlertsPanel";

const LogisticsHub = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Package className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Logistics Hub</h1>
          <p className="text-muted-foreground">
            Supply chain management and inventory control
          </p>
        </div>
      </div>
      
      <Tabs defaultValue="alerts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Alerts
          </TabsTrigger>
          <TabsTrigger value="shipments" className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Shipments
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            Supply Requests
          </TabsTrigger>
          <TabsTrigger value="inventory" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Inventory
          </TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-4">
          <LogisticsAlertsPanel />
          <InventoryAlerts />
        </TabsContent>

        <TabsContent value="shipments">
          <ShipmentTracker />
        </TabsContent>

        <TabsContent value="requests">
          <SupplyRequests />
        </TabsContent>

        <TabsContent value="inventory">
          <InventoryAlerts />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LogisticsHub;
