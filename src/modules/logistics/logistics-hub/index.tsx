/**
 * PATCH 352: Logistics Hub Complete
 * Enhanced with inventory management, purchase orders, and supply tracking
 */

import React from "react";
import { Package, ClipboardList, AlertTriangle, Truck, ShoppingCart } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InventoryAlerts } from "./components/InventoryAlerts";
import { ShipmentTracker } from "./components/ShipmentTracker";
import { SupplyRequests } from "./components/SupplyRequests";
import { LogisticsAlertsPanel } from "./components/LogisticsAlertsPanel";
import { InventoryManagement } from "./components/InventoryManagement";
import { PurchaseOrdersManagement } from "./components/PurchaseOrdersManagement";

const LogisticsHub = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Package className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Logistics Hub</h1>
          <p className="text-muted-foreground">
            Complete supply chain management and inventory control system
          </p>
        </div>
      </div>
      
      <Tabs defaultValue="inventory" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="inventory" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Inventory
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Orders
          </TabsTrigger>
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
            Requests
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4">
          <InventoryManagement />
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <PurchaseOrdersManagement />
        </TabsContent>

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
      </Tabs>
    </div>
  );
};

export default LogisticsHub;
