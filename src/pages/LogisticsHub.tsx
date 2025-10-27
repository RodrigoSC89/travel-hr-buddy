// @ts-nocheck
import React, { Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import LogisticsHubDashboard from "@/components/logistics/logistics-hub-dashboard";

export default function LogisticsHub() {
  return (
    <div className="container mx-auto p-6">
      <Suspense fallback={
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">Loading Logistics Hub...</div>
          </CardContent>
        </Card>
      }>
        <LogisticsHubDashboard />
      </Suspense>
    </div>
  );
}
