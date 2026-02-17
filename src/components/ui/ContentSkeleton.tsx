/**
 * ContentSkeleton - Reusable loading skeletons for data states
 * Provides consistent, themed skeleton loading patterns
 */
import { memo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const shimmer = {
  initial: { opacity: 0.5 },
  animate: { opacity: [0.5, 0.8, 0.5] },
  transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" as const },
};

export const KPISkeleton = memo(({ count = 4 }: { count?: number }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4" role="status" aria-label="Carregando dados...">
    {Array.from({ length: count }).map((_, i) => (
      <motion.div key={i} {...shimmer} transition={{ ...shimmer.transition, delay: i * 0.1 }}>
        <Card className="border-border/30 bg-card/50">
          <CardContent className="p-4 space-y-2">
            <div className="h-3 w-20 rounded bg-muted" />
            <div className="h-7 w-16 rounded bg-muted" />
            <div className="h-2 w-24 rounded bg-muted" />
          </CardContent>
        </Card>
      </motion.div>
    ))}
    <span className="sr-only">Carregando...</span>
  </div>
));
KPISkeleton.displayName = "KPISkeleton";

export const TableSkeleton = memo(({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) => (
  <Card className="border-border/30" role="status" aria-label="Carregando tabela...">
    <div className="p-4 space-y-3">
      <div className="flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <motion.div key={i} className="h-4 flex-1 rounded bg-muted" {...shimmer} transition={{ ...shimmer.transition, delay: i * 0.05 }} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4">
          {Array.from({ length: cols }).map((_, c) => (
            <motion.div key={c} className="h-3 flex-1 rounded bg-muted/60" {...shimmer} transition={{ ...shimmer.transition, delay: (r + c) * 0.03 }} />
          ))}
        </div>
      ))}
    </div>
    <span className="sr-only">Carregando...</span>
  </Card>
));
TableSkeleton.displayName = "TableSkeleton";

export const ChartSkeleton = memo(({ height = "h-64" }: { height?: string }) => (
  <motion.div {...shimmer} role="status" aria-label="Carregando gráfico...">
    <Card className="border-border/30 bg-card/50">
      <CardHeader>
        <div className="h-4 w-32 rounded bg-muted" />
      </CardHeader>
      <CardContent>
        <div className={`${height} rounded-lg bg-muted/40 flex items-end justify-between px-4 pb-4 gap-2`}>
          {Array.from({ length: 7 }).map((_, i) => (
            <motion.div
              key={i}
              className="flex-1 rounded-t bg-muted"
              style={{ height: `${20 + Math.random() * 60}%` }}
              {...shimmer}
              transition={{ ...shimmer.transition, delay: i * 0.08 }}
            />
          ))}
        </div>
      </CardContent>
    </Card>
    <span className="sr-only">Carregando...</span>
  </motion.div>
));
ChartSkeleton.displayName = "ChartSkeleton";

export const CardSkeleton = memo(({ count = 3 }: { count?: number }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4" role="status" aria-label="Carregando cards...">
    {Array.from({ length: count }).map((_, i) => (
      <motion.div key={i} {...shimmer} transition={{ ...shimmer.transition, delay: i * 0.1 }}>
        <Card className="border-border/30 bg-card/50">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-muted" />
              <div className="space-y-1.5 flex-1">
                <div className="h-4 w-3/4 rounded bg-muted" />
                <div className="h-3 w-1/2 rounded bg-muted/60" />
              </div>
            </div>
            <div className="h-2 w-full rounded bg-muted/40" />
            <div className="h-2 w-2/3 rounded bg-muted/40" />
          </CardContent>
        </Card>
      </motion.div>
    ))}
    <span className="sr-only">Carregando...</span>
  </div>
));
CardSkeleton.displayName = "CardSkeleton";
