import React from "react";
import DPIntelligenceCenter from "@/modules/dp-intelligence/DPIntelligenceCenter";
import ControlHubPanel from "@/modules/control-hub/ControlHubPanel";
import FMEAExpert from "@/modules/fmea/FMEAExpert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ButtonHandlersDemo() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Button Handlers Demo - Nautilus One</h1>
      <Tabs defaultValue="dp-intelligence" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dp-intelligence">DP Intelligence</TabsTrigger>
          <TabsTrigger value="control-hub">Control Hub</TabsTrigger>
          <TabsTrigger value="fmea">FMEA Expert</TabsTrigger>
        </TabsList>
        <TabsContent value="dp-intelligence">
          <DPIntelligenceCenter />
        </TabsContent>
        <TabsContent value="control-hub">
          <ControlHubPanel />
        </TabsContent>
        <TabsContent value="fmea">
          <FMEAExpert />
        </TabsContent>
      </Tabs>
    </div>
  );
}
