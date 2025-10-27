import React from "react";
import { Package } from "lucide-react";
import { InventoryAlerts } from "./components/InventoryAlerts";
import { ShipmentTracker } from "./components/ShipmentTracker";

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
      
      <InventoryAlerts />
      
      <ShipmentTracker />
    </div>
  );
};

export default LogisticsHub;
