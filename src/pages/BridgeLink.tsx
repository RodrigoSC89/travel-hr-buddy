import React, { Suspense } from "react";
import { safeLazyImport } from "@/utils/safeLazyImport";
import { Loader } from "lucide-react";

// Using the main BridgeLink module with AI integration and comprehensive features
const BridgeLinkDashboard = safeLazyImport(() => import("@/modules/control/bridgelink/BridgeLinkDashboard"), "BridgeLink Dashboard");

export default function BridgeLink() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader className="h-8 w-8 animate-spin" /></div>}>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">BridgeLink Integration Core</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time communication and synchronization system with AI-powered insights
          </p>
        </div>

        <BridgeLinkDashboard />
      </div>
    </Suspense>
  );
}
