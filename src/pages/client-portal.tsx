/**
 * External Client Portal Page
 * Secure portal for clients to view fleet status, compliance, and documents
 */
import React, { Suspense, lazy } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const ClientPortalContent = lazy(() => import("@/components/portal/ClientPortalContent"));

export default function ClientPortalPage() {
  return (
    <Suspense fallback={<div className="container mx-auto p-6"><Skeleton className="h-96" /></div>}>
      <ClientPortalContent />
    </Suspense>
  );
}
