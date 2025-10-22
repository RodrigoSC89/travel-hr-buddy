import React, { Suspense } from "react";
import { safeLazyImport } from "@/utils/safeLazyImport";
import { Loader } from "lucide-react";

const BridgeLinkDashboard = safeLazyImport(() => import("@/components/bridgelink/BridgeLinkDashboard"), "BridgeLink Dashboard");
const BridgeLinkStatus = safeLazyImport(() => import("@/components/bridgelink/BridgeLinkStatus"), "BridgeLink Status");
const BridgeLinkSync = safeLazyImport(() => import("@/components/bridgelink/BridgeLinkSync"), "BridgeLink Sync");

export default function BridgeLink() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader className="h-8 w-8 animate-spin" /></div>}>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">BridgeLink Integration Core</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time communication and synchronization system
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <BridgeLinkStatus />
          <BridgeLinkSync />
          <BridgeLinkDashboard />
        </div>
      </div>
    </Suspense>
  );
}
