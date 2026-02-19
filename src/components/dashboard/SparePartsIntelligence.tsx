/**
 * Spare Parts Inventory Intelligence v3
 * Stock levels, critical shortages, reorder alerts, vessel distribution, IMPA tracking
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Package, AlertTriangle, TrendingDown, CheckCircle, Ship, DollarSign, BarChart3 } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--warning))', 'hsl(var(--destructive))', 'hsl(var(--success))', 'hsl(var(--accent))'];

export function SparePartsIntelligence() {
  const { data: inventoryItems = [] } = useQuery({
    queryKey: ['spare-parts-intelligence-v3'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('id, name, quantity, min_quantity, unit_cost, category, status, vessel_id, criticality, impa_code')
        .order('quantity', { ascending: true })
        .limit(300);
      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });

  const metrics = React.useMemo(() => {
    const totalItems = inventoryItems.length;
    const criticalItems = inventoryItems.filter(i => {
      const min = Number(i.min_quantity || 0);
      const qty = Number(i.quantity || 0);
      return min > 0 && qty <= min * 0.25;
    });
    const lowStockItems = inventoryItems.filter(i => {
      const min = Number(i.min_quantity || 0);
      const qty = Number(i.quantity || 0);
      return min > 0 && qty > min * 0.25 && qty <= min;
    });
    const healthyItems = inventoryItems.filter(i => {
      const min = Number(i.min_quantity || 0);
      const qty = Number(i.quantity || 0);
      return min === 0 || qty > min;
    });

    const totalValue = inventoryItems.reduce((sum, i) => sum + (Number(i.quantity || 0) * Number(i.unit_cost || 0)), 0);

    // Categories
    const categories = new Map<string, { count: number; value: number }>();
    inventoryItems.forEach(i => {
      const cat = i.category || 'Uncategorized';
      const prev = categories.get(cat) || { count: 0, value: 0 };
      categories.set(cat, { count: prev.count + 1, value: prev.value + (Number(i.quantity || 0) * Number(i.unit_cost || 0)) });
    });
    const topCategories = Array.from(categories.entries())
      .sort((a, b) => b[1].value - a[1].value)
      .slice(0, 6)
      .map(([name, d]) => ({ name: name.substring(0, 12), value: Math.round(d.value), count: d.count }));

    // Vessel distribution
    const byVessel = new Map<string, number>();
    inventoryItems.forEach(i => {
      const v = i.vessel_id || 'shore';
      byVessel.set(v, (byVessel.get(v) || 0) + 1);
    });

    // IMPA coverage
    const withImpa = inventoryItems.filter(i => i.impa_code).length;
    const impaCoverage = totalItems > 0 ? Math.round((withImpa / totalItems) * 100) : 0;

    const stockHealth = totalItems > 0 ? Math.round((healthyItems.length / totalItems) * 100) : 100;

    return {
      totalItems, criticalItems: criticalItems.slice(0, 5), lowStockCount: lowStockItems.length,
      criticalCount: criticalItems.length, healthyCount: healthyItems.length,
      totalValue, topCategories, stockHealth, impaCoverage, vesselCount: byVessel.size,
    };
  }, [inventoryItems]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />Spare Parts Intelligence
          </CardTitle>
          <Badge variant="outline" className="text-[10px]">{metrics.totalItems} items</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Health + Value */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Stock Health</span>
              <span className={metrics.stockHealth >= 80 ? 'text-success' : metrics.stockHealth >= 60 ? 'text-warning' : 'text-destructive'}>
                {metrics.stockHealth}%
              </span>
            </div>
            <Progress value={metrics.stockHealth} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">IMPA Coverage</span>
              <span className="text-primary">{metrics.impaCoverage}%</span>
            </div>
            <Progress value={metrics.impaCoverage} className="h-2" />
          </div>
        </div>

        {/* Status Grid */}
        <div className="grid grid-cols-4 gap-2">
          <div className="flex items-center gap-1.5 p-2 rounded-lg bg-destructive/5 border border-destructive/10">
            <AlertTriangle className="h-3 w-3 text-destructive" />
            <div>
              <div className="text-sm font-bold text-destructive">{metrics.criticalCount}</div>
              <div className="text-[9px] text-muted-foreground">Critical</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 p-2 rounded-lg bg-warning/5 border border-warning/10">
            <TrendingDown className="h-3 w-3 text-warning" />
            <div>
              <div className="text-sm font-bold text-warning">{metrics.lowStockCount}</div>
              <div className="text-[9px] text-muted-foreground">Low</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 p-2 rounded-lg bg-success/5 border border-success/10">
            <CheckCircle className="h-3 w-3 text-success" />
            <div>
              <div className="text-sm font-bold text-success">{metrics.healthyCount}</div>
              <div className="text-[9px] text-muted-foreground">OK</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 p-2 rounded-lg bg-primary/5 border border-primary/10">
            <DollarSign className="h-3 w-3 text-primary" />
            <div>
              <div className="text-sm font-bold">${metrics.totalValue >= 1e6 ? `${(metrics.totalValue/1e6).toFixed(1)}M` : `${(metrics.totalValue/1000).toFixed(0)}K`}</div>
              <div className="text-[9px] text-muted-foreground">Value</div>
            </div>
          </div>
        </div>

        {/* Category Chart */}
        {metrics.topCategories.length > 0 && (
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.topCategories} layout="vertical">
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Critical Items */}
        {metrics.criticalItems.length > 0 && (
          <div className="space-y-1.5">
            <h4 className="text-xs font-semibold text-destructive uppercase">🔴 Reorder Required</h4>
            {metrics.criticalItems.map((item, i) => (
              <div key={i} className="flex justify-between items-center text-xs p-1.5 rounded bg-destructive/5">
                <span className="truncate max-w-[60%]">{item.name}</span>
                <span className="text-destructive font-medium">{item.quantity}/{item.min_quantity}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default SparePartsIntelligence;
