import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EnhancedLogisticsDashboard from "@/components/logistics/enhanced-logistics-dashboard";
import LogisticsHubDashboard from "@/components/logistics/logistics-hub-dashboard";
import { BackToDashboard } from "@/components/ui/back-to-dashboard";
import { Package, Ship } from "lucide-react";

const Logistics = () => {
  return (
    <div className="space-y-6">
      <BackToDashboard />
      
      <Tabs defaultValue="hub" className="space-y-4">
        <TabsList>
          <TabsTrigger value="hub">
            <Package className="h-4 w-4 mr-2" />
            Logistics Hub (PATCH 256)
          </TabsTrigger>
          <TabsTrigger value="legacy">
            <Ship className="h-4 w-4 mr-2" />
            Legacy Logistics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hub">
          <LogisticsHubDashboard />
        </TabsContent>

        <TabsContent value="legacy">
          <EnhancedLogisticsDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Logistics;