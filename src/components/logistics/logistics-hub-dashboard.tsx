import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Truck, Users, BarChart3 } from "lucide-react";
import { InventoryManagement } from "./inventory-management";
import { ShipmentTracking } from "./shipment-tracking";

const LogisticsHubDashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Logistics Hub</h1>
        <p className="text-muted-foreground">
          Complete supply chain management - Inventory, Suppliers, Purchase Orders, and Shipment Tracking
        </p>
      </div>

      <Tabs defaultValue="inventory" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="inventory">
            <Package className="h-4 w-4 mr-2" />
            Inventory
          </TabsTrigger>
          <TabsTrigger value="shipments">
            <Truck className="h-4 w-4 mr-2" />
            Shipments
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

        <TabsContent value="shipments" className="space-y-4">
          <ShipmentTracking />
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
