/**
 * ContextualSkeleton - Loading states inteligentes por tipo de conteúdo
 * Benchmark: Linear, Notion, Figma
 */

import React, { memo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ContextualSkeletonProps {
  type: "kpi" | "table" | "chart" | "list" | "form" | "card" | "timeline";
  count?: number;
  className?: string;
}

const KPISkeleton = memo(() => (
  <Card className="overflow-hidden">
    <CardContent className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="h-7 w-16" />
          <div className="flex items-center gap-1.5 pt-1">
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
        <Skeleton className="h-10 w-10 rounded-lg" />
      </div>
      <div className="mt-3">
        <Skeleton className="h-1.5 w-full rounded-full" />
      </div>
    </CardContent>
  </Card>
));

const TableSkeleton = memo(({ count = 5 }: { count: number }) => (
  <div className="space-y-1">
    <div className="flex gap-4 p-3 border-b border-border">
      {[1, 2, 3, 4, 5].map(i => (
        <Skeleton key={i} className="h-4 flex-1" />
      ))}
    </div>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex gap-4 p-3 border-b border-border/50">
        {[1, 2, 3, 4, 5].map(j => (
          <Skeleton key={j} className="h-4 flex-1" style={{ opacity: 1 - i * 0.15 }} />
        ))}
      </div>
    ))}
  </div>
));

const ChartSkeleton = memo(() => (
  <Card>
    <CardHeader className="pb-2">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-8 w-24 rounded-md" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="flex items-end gap-1.5 h-40">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton
            key={i}
            className="flex-1 rounded-t"
            style={{ height: `${30 + Math.sin(i * 0.8) * 40 + 30}%` }}
          />
        ))}
      </div>
      <div className="flex justify-between mt-2">
        {["Jan", "Mar", "Mai", "Jul", "Set", "Nov"].map(m => (
          <Skeleton key={m} className="h-3 w-6" />
        ))}
      </div>
    </CardContent>
  </Card>
));

const ListSkeleton = memo(({ count = 4 }: { count: number }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border/50">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
    ))}
  </div>
));

const TimelineSkeleton = memo(({ count = 4 }: { count: number }) => (
  <div className="space-y-4 pl-4 border-l-2 border-border">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="relative pl-6">
        <Skeleton className="absolute -left-[9px] top-1 h-4 w-4 rounded-full" />
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    ))}
  </div>
));

const FormSkeleton = memo(() => (
  <div className="space-y-5">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    ))}
    <div className="flex gap-3 pt-2">
      <Skeleton className="h-10 w-24 rounded-md" />
      <Skeleton className="h-10 w-20 rounded-md" />
    </div>
  </div>
));

const CardSkeleton = memo(() => (
  <Card>
    <CardHeader className="pb-2">
      <div className="flex items-center gap-3">
        <Skeleton className="h-12 w-12 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
        <Skeleton className="h-3 w-3/5" />
      </div>
    </CardContent>
  </Card>
));

KPISkeleton.displayName = "KPISkeleton";
TableSkeleton.displayName = "TableSkeleton";
ChartSkeleton.displayName = "ChartSkeleton";
ListSkeleton.displayName = "ListSkeleton";
TimelineSkeleton.displayName = "TimelineSkeleton";
FormSkeleton.displayName = "FormSkeleton";
CardSkeleton.displayName = "CardSkeleton";

const skeletonMap = {
  kpi: KPISkeleton,
  table: TableSkeleton,
  chart: ChartSkeleton,
  list: ListSkeleton,
  form: FormSkeleton,
  card: CardSkeleton,
  timeline: TimelineSkeleton,
};

export const ContextualSkeleton = memo(({
  type,
  count = 4,
  className,
}: ContextualSkeletonProps) => {
  const Component = skeletonMap[type];
  
  if (type === "kpi") {
    return (
      <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", className)}>
        {Array.from({ length: count }).map((_, i) => (
          <KPISkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className={cn(className)}>
      <Component count={count} />
    </div>
  );
});

ContextualSkeleton.displayName = "ContextualSkeleton";
