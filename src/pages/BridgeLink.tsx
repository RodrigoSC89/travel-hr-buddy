import React, { Suspense } from "react";
import { safeLazyImport } from "@/utils/safeLazyImport";
import { Loading } from "@/components/ui/Loading";

const BridgeLinkDashboard = safeLazyImport(() => import("@/components/bridgelink/BridgeLinkDashboard"), "BridgeLinkDashboard");
const BridgeLinkStatus = safeLazyImport(() => import("@/components/bridgelink/BridgeLinkStatus"), "BridgeLinkStatus");
const BridgeLinkSync = safeLazyImport(() => import("@/components/bridgelink/BridgeLinkSync"), "BridgeLinkSync");

export default function BridgeLink() {
  return (
    <Suspense fallback={<Loading fullScreen message="Carregando BridgeLink..." />}>
      <main className="p-6 flex flex-col gap-6 bg-[var(--nautilus-bg-alt)] min-h-screen">
        <h1 className="text-3xl font-bold" role="heading" aria-level={1}>
          BridgeLink Integration Core
        </h1>
        <BridgeLinkStatus />
        <BridgeLinkSync />
        <BridgeLinkDashboard />
      </main>
    </Suspense>
  );
}
