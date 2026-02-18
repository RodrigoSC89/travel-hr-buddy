/**
 * Wave 24: Supply Chain Intelligence
 * Procurement, spare parts logistics and supplier performance
 */

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Truck, Package, Clock, AlertCircle, CheckCircle2, DollarSign } from 'lucide-react';

export default function SupplyChainIntelligence() {
  const { data: requisitions = [] } = useQuery({
    queryKey: ['supply-chain-requisitions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchase_requisitions')
        .select('id, status, priority, estimated_total, created_at, vessel_id, department')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['supply-chain-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('procurement_orders')
        .select('id, status, total_amount, supplier_id, created_at, delivery_date')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ['supply-chain-suppliers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('suppliers')
        .select('id, company_name, rating, is_active, category')
        .order('rating', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
    staleTime: 120000,
  });

  const analytics = useMemo(() => {
    const reqPending = requisitions.filter(r => r.status === 'pending' || r.status === 'draft').length;
    const reqApproved = requisitions.filter(r => r.status === 'approved').length;
    const reqTotal = requisitions.length;
    const totalSpend = orders.reduce((s, o) => s + (o.total_amount || 0), 0);

    const orderStatus: Record<string, number> = {};
    orders.forEach(o => {
      const s = o.status || 'unknown';
      orderStatus[s] = (orderStatus[s] || 0) + 1;
    });

    const completedOrders = orders.filter(o => o.delivery_date && o.created_at);
    const avgLeadTime = completedOrders.length > 0
      ? completedOrders.reduce((sum, o) => {
          const created = new Date(o.created_at!);
          const delivered = new Date(o.delivery_date!);
          return sum + (delivered.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
        }, 0) / completedOrders.length
      : 0;

    const priorityDist: Record<string, number> = {};
    requisitions.forEach(r => {
      const p = r.priority || 'normal';
      priorityDist[p] = (priorityDist[p] || 0) + 1;
    });

    const topSuppliers = suppliers
      .filter(s => s.rating)
      .slice(0, 5)
      .map(s => ({
        name: s.company_name,
        rating: s.rating || 0,
        category: Array.isArray(s.category) ? s.category[0] : null,
      }));

    return { reqPending, reqApproved, reqTotal, totalSpend, orderStatus, avgLeadTime, priorityDist, topSuppliers };
  }, [requisitions, orders, suppliers]);

  const priorityColors: Record<string, string> = {
    critical: 'text-destructive',
    urgent: 'text-destructive',
    high: 'text-primary',
    normal: 'text-primary',
    low: 'text-muted-foreground',
  };

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Supply Chain Intelligence</CardTitle>
          </div>
          <Badge variant="outline" className="text-xs">
            {analytics.reqPending} pendentes
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <Package className="h-4 w-4 mx-auto text-primary mb-1" />
            <p className="text-xs text-muted-foreground">Requisições</p>
            <p className="text-lg font-bold">{analytics.reqTotal}</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <CheckCircle2 className="h-4 w-4 mx-auto text-primary mb-1" />
            <p className="text-xs text-muted-foreground">Aprovadas</p>
            <p className="text-lg font-bold">{analytics.reqApproved}</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <Clock className="h-4 w-4 mx-auto text-primary mb-1" />
            <p className="text-xs text-muted-foreground">Lead Time (d)</p>
            <p className="text-lg font-bold">{analytics.avgLeadTime.toFixed(1)}</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <DollarSign className="h-4 w-4 mx-auto text-primary mb-1" />
            <p className="text-xs text-muted-foreground">Total Spend</p>
            <p className="text-lg font-bold">${(analytics.totalSpend / 1000).toFixed(0)}k</p>
          </div>
        </div>

        {/* Order Pipeline */}
        {Object.keys(analytics.orderStatus).length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Order Pipeline</p>
            <div className="space-y-2">
              {Object.entries(analytics.orderStatus).map(([status, count]) => {
                const total = Object.values(analytics.orderStatus).reduce((a, b) => a + b, 0);
                const pct = total > 0 ? (count / total) * 100 : 0;
                return (
                  <div key={status} className="flex items-center gap-2">
                    <span className="text-xs w-24 truncate capitalize">{status.replace(/_/g, ' ')}</span>
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${Math.min(pct, 100)}%` }} />
                    </div>
                    <span className="text-xs font-mono w-8 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Priority Breakdown */}
        {Object.keys(analytics.priorityDist).length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Priority Breakdown</p>
            <div className="flex gap-2 flex-wrap">
              {Object.entries(analytics.priorityDist).map(([priority, count]) => (
                <div key={priority} className="flex items-center gap-1.5 bg-muted/50 rounded-md px-2.5 py-1.5">
                  <AlertCircle className={`h-3 w-3 ${priorityColors[priority] || 'text-muted-foreground'}`} />
                  <span className="text-xs capitalize">{priority}</span>
                  <span className="text-xs font-bold">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Suppliers */}
        {analytics.topSuppliers.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Top Suppliers</p>
            <div className="space-y-1.5">
              {analytics.topSuppliers.map((s, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground w-4">{i + 1}.</span>
                    <span className="font-medium">{s.name}</span>
                    {s.category && <Badge variant="secondary" className="text-[9px]">{s.category}</Badge>}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-amber-500">★</span>
                    <span className="font-mono">{s.rating.toFixed(1)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {analytics.reqTotal === 0 && (
          <div className="text-center py-6 text-muted-foreground text-sm">
            Nenhuma requisição de compra registrada
          </div>
        )}
      </CardContent>
    </Card>
  );
}
