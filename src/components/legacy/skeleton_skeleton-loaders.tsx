/**
 * Skeleton Loaders
 * PATCH 834: Optimized skeleton components for perceived performance
 */

import React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  animate?: boolean;
  style?: React.CSSProperties;
}

export function Skeleton({ className, animate = true, style }: SkeletonProps) {
  return (
    <div
      className={cn(
        "bg-muted rounded-md",
        animate && "animate-pulse",
        className
      )}
      style={style}
    />
  );
}

// Card Skeleton
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("p-4 space-y-3 border rounded-lg bg-card", className)}>
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  );
}

// Table Row Skeleton
export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <tr className="border-b">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="p-3">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

// Table Skeleton
export function TableSkeleton({ 
  rows = 5, 
  columns = 5 
}: { rows?: number; columns?: number }) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-muted/50">
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="p-3 text-left">
                <Skeleton className="h-4 w-20" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <TableRowSkeleton key={i} columns={columns} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

// List Skeleton
export function ListSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Dashboard Skeleton
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-4 border rounded-lg space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>
      
      {/* Chart */}
      <div className="p-4 border rounded-lg">
        <Skeleton className="h-4 w-32 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
      
      {/* Table */}
      <TableSkeleton rows={5} columns={4} />
    </div>
  );
}

// Form Skeleton
export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}

// Profile Skeleton
export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-20 w-20 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-1">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-5 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Navigation Skeleton
export function NavSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-2 p-2">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>
  );
}

// Chart Skeleton
export function ChartSkeleton({ type = "bar" }: { type?: "bar" | "line" | "pie" }) {
  if (type === "pie") {
    return (
      <div className="flex items-center justify-center p-8">
        <Skeleton className="h-48 w-48 rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-2">
      <div className="flex items-end gap-2 h-48">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton 
            key={i} 
            className="flex-1" 
            style={{ height: `${30 + Math.random() * 70}%` }}
          />
        ))}
      </div>
      <div className="flex justify-between pt-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-8" />
        ))}
      </div>
    </div>
  );
}

// Image Skeleton with aspect ratio
export function ImageSkeleton({ 
  aspectRatio = "16/9",
  className 
}: { 
  aspectRatio?: string;
  className?: string;
}) {
  return (
    <div 
      className={cn("relative overflow-hidden rounded-lg bg-muted", className)}
      style={{ aspectRatio }}
    >
      <Skeleton className="absolute inset-0" />
    </div>
  );
}

// Text Block Skeleton
export function TextBlockSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          className="h-4" 
          style={{ width: i === lines - 1 ? "60%" : "100%" }}
        />
      ))}
    </div>
  );
}
