/**
 * Fuel Manager Page
 */
import React, { Suspense } from "react";
import { FuelManager } from "@/modules/fuel-manager";
import { Skeleton } from "@/components/unified/Skeletons.unified";

const FuelManagerPage = () => {
  return (
    <Suspense fallback={<FuelManagerSkeleton />}>
      <FuelManager />
    </Suspense>
  );
});

const FuelManagerSkeleton = () => (
  <div className="container mx-auto py-6 space-y-6">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-10 w-32" />
    </div>
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-32" />
      ))}
    </div>
    <Skeleton className="h-96" />
  </div>
);

export default FuelManagerPage;
