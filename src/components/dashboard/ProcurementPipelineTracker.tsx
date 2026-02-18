/**
 * Procurement Pipeline Tracker
 * Tracks purchase requisitions lifecycle and spend
 * Uses purchase_requisitions for real data
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export function ProcurementPipelineTracker() {
  const { data: requisitions = [], isLoading } = useQuery({
    queryKey: ['procurement-pipeline'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchase_requisitions')
        .select('id, title, requisition_number, status, priority, category, estimated_total, actual_total, created_at')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });

  const byStatus: Record<string, number> = {};
  const byCategory: Record<string, number> = {};
  const byPriority: Record<string, number> = {};
  let totalEstimated = 0;
  let totalActual = 0;

  requisitions.forEach(r => {
    const s = r.status || 'draft';
    byStatus[s] = (byStatus[s] || 0) + 1;
    if (r.category) byCategory[r.category] = (byCategory[r.category] || 0) + 1;
    if (r.priority) byPriority[r.priority] = (byPriority[r.priority] || 0) + 1;
    totalEstimated += r.estimated_total || 0;
    totalActual += r.actual_total || 0;
  });

  const statusFlow = [
    { key: 'draft', label: 'Draft', icon: Clock, color: 'text-muted-foreground' },
    { key: 'pending', label: 'Pending', icon: AlertTriangle, color: 'text-warning' },
    { key: 'approved', label: 'Approved', icon: CheckCircle, color: 'text-success' },
    { key: 'ordered', label: 'Ordered', icon: ShoppingCart, color: 'text-primary' },
    { key: 'delivered', label: 'Delivered', icon: CheckCircle, color: 'text-success' },
    { key: 'cancelled', label: 'Cancelled', icon: XCircle, color: 'text-destructive' },
  ];

  const fmt = (n: number) => n >= 1000000 ? `$${(n / 1000000).toFixed(1)}M` : n >= 1000 ? `$${(n / 1000).toFixed(0)}K` : `$${n.toFixed(0)}`;

  if (isLoading) {
    return <Card><CardContent className="p-6"><div className="h-64 animate-pulse bg-muted rounded" /></CardContent></Card>;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <ShoppingCart className="h-5 w-5 text-hub-workbench" />
            Procurement Pipeline
          </CardTitle>
          <Badge variant="outline" className="text-xs">{requisitions.length} requisitions</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Spend summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="text-lg font-bold">{fmt(totalEstimated)}</div>
            <div className="text-[10px] text-muted-foreground">Estimated</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="text-lg font-bold">{fmt(totalActual)}</div>
            <div className="text-[10px] text-muted-foreground">Actual</div>
          </div>
        </div>

        {/* Pipeline stages */}
        <div className="space-y-1.5">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pipeline</h4>
          {statusFlow.map(({ key, label, icon: Icon, color }) => {
            const count = byStatus[key] || 0;
            const pct = requisitions.length > 0 ? Math.round((count / requisitions.length) * 100) : 0;
            return (
              <div key={key} className="flex items-center gap-3 p-2 rounded bg-muted/30">
                <Icon className={`h-3.5 w-3.5 ${color} shrink-0`} />
                <span className="text-sm flex-1">{label}</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-muted rounded-full h-1.5">
                    <div className="h-1.5 rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-sm font-semibold w-6 text-right">{count}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Top categories */}
        {Object.keys(byCategory).length > 0 && (
          <div className="space-y-1.5">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">By Category</h4>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(byCategory)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 6)
                .map(([cat, count]) => (
                  <Badge key={cat} variant="secondary" className="text-xs">
                    {cat}: {count}
                  </Badge>
                ))}
            </div>
          </div>
        )}

        {requisitions.length === 0 && (
          <div className="text-center py-6 text-muted-foreground text-sm">
            <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-50" />
            Nenhuma requisição de compra
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ProcurementPipelineTracker;
