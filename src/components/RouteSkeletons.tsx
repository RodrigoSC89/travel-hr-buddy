import { memo } from 'react';
import { Skeleton } from "@/components/unified/Skeletons.unified";
import { motion } from "framer-motion";

// Dashboard Skeleton
export const DashboardSkeleton = memo(function() {
  return (
    <div className="space-y-6 p-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="rounded-lg border bg-card p-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-32" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-lg border bg-card p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
        <div className="rounded-lg border bg-card p-6">
          <Skeleton className="h-6 w-28 mb-4" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Table/List Skeleton
export const TableSkeleton = memo(function({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-lg border animate-fade-in">
      {/* Header */}
      <div className="border-b p-4 flex gap-4 bg-muted/50">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      
      {/* Rows */}
      {[...Array(rows)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.05 }}
          className="border-b last:border-0 p-4 flex gap-4"
        >
          {[...Array(5)].map((_, j) => (
            <Skeleton key={j} className="h-4 flex-1" />
          ))}
        </motion.div>
      ))}
    </div>
  );
}

// Form Skeleton
export const FormSkeleton = memo(function() {
  return (
    <div className="space-y-6 max-w-2xl animate-fade-in">
      <Skeleton className="h-8 w-48 mb-6" />
      
      <div className="grid grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
      
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-24 w-full" />
      </div>
      
      <div className="flex gap-3">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}

// Profile/Detail Skeleton
export const ProfileSkeleton = memo(function() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-6 p-6 rounded-lg border bg-card">
        <Skeleton className="h-24 w-24 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-28" />
      </div>
      
      {/* Tabs */}
      <div className="flex gap-2 border-b pb-2">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-9 w-24" />
        ))}
      </div>
      
      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-lg border bg-card p-4">
            <Skeleton className="h-5 w-28 mb-3" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Map/Chart Skeleton
export const ChartSkeleton = memo(function() {
  return (
    <div className="rounded-lg border bg-card p-6 animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <Skeleton className="h-6 w-36" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
      <div className="relative h-64">
        <Skeleton className="absolute inset-0 rounded-lg" />
        <div className="absolute bottom-0 left-0 right-0 flex justify-around p-4">
          {[...Array(7)].map((_, i) => (
            <Skeleton 
              key={i} 
              className="w-8" 
              style={{ height: `${20 + Math.random() * 80}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Generic Page Skeleton
export const PageSkeleton = memo(function() {
  return (
    <div className="space-y-6 p-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <TableSkeleton rows={8} />
        </div>
        <div className="space-y-4">
          <ChartSkeleton />
          <div className="rounded-lg border bg-card p-4">
            <Skeleton className="h-5 w-32 mb-3" />
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
