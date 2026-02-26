/**
 * IntelligencePanelSkeleton - Premium loading states for dashboard widgets
 */
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { motion } from "framer-motion";

export function WidgetSkeleton({ className = "" }: { className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`overflow-hidden ${className}`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-4 rounded-full" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3">
            <Skeleton className="h-16 w-20 rounded-lg" />
            <Skeleton className="h-16 w-20 rounded-lg" />
            <Skeleton className="h-16 w-20 rounded-lg" />
            <Skeleton className="h-16 w-20 rounded-lg" />
          </div>
          <Skeleton className="h-32 w-full rounded-lg" />
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <WidgetSkeleton />
      <WidgetSkeleton />
    </div>
  );
}

export function IntelligencePanelSkeleton() {
  return (
    <div className="space-y-4 mt-4">
      <WidgetSkeleton />
      <WidgetSkeleton />
      <GridSkeleton />
      <WidgetSkeleton />
    </div>
  );
}
