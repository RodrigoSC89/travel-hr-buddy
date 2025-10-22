import React, { Suspense } from "react";
import { safeLazyImport } from "@/utils/safeLazyImport";
import { Loader } from "@/components/ui/loader";

const DPSyncDashboard = safeLazyImport(() => React.lazy(() => import(import("@/components/dp/DPSyncDashboard"), "DPSyncDashboard")));
const DPStatusBoard = safeLazyImport(() => React.lazy(() => import(import("@/components/dp/DPStatusBoard"), "DPStatusBoard")));
const DPAlertFeed = safeLazyImport(() => React.lazy(() => import(import("@/components/dp/DPAlertFeed"), "DPAlertFeed")));

export default function DPSyncEngine() {
  return (
    <Suspense fallback={<Loader />}>
      <main className="p-6 flex flex-col gap-6 bg-[var(--nautilus-bg-alt)] min-h-screen">
        <h1 className="text-3xl font-bold text-[var(--nautilus-primary)]">DP Synchronization Engine</h1>
        <DPStatusBoard />
        <DPSyncDashboard />
        <DPAlertFeed />
      </main>
    </Suspense>
  );
}
