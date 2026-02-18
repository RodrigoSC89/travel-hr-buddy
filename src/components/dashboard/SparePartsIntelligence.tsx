/**
 * Spare Parts Inventory Intelligence
 * Stock levels, critical shortages, reorder alerts
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Package, AlertTriangle, TrendingDown, CheckCircle } from 'lucide-react';

export function SparePartsIntelligence() {
  const { data: inventoryItems = [] } = useQuery({
    queryKey: ['spare-parts-intelligence'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('id, name, quantity, min_quantity, unit_cost, category, status, vessel_id')
        .order('quantity', { ascending: true })
        .limit(200);
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

    const categories = new Map<string, number>();
    inventoryItems.forEach(i => {
      const cat = i.category || 'Uncategorized';
      categories.set(cat, (categories.get(cat) || 0) + 1);
    });
    const topCategories = Array.from(categories.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const stockHealth = totalItems > 0 ? Math.round((healthyItems.length / totalItems) * 100) : 100;

    return {
      totalItems, criticalItems: criticalItems.slice(0, 5), lowStockCount: lowStockItems.length,
      criticalCount: criticalItems.length, healthyCount: healthyItems.length,
      totalValue, topCategories, stockHealth,
    };
  }, [inventoryItems]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            Spare Parts Intelligence
          </CardTitle>
          <Badge variant="outline" className="text-[10px]">
            {metrics.totalItems} items
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">Stock Health</span>
            <span className={metrics.stockHealth >= 80 ? 'text-success' : metrics.stockHealth >= 60 ? 'text-warning' : 'text-destructive'}>
              {metrics.stockHealth}%
            </span>
          </div>
          <Progress value={metrics.stockHealth} className="h-2" />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-destructive/5 border border-destructive/10">
            <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
            <div>
              <div className="text-sm font-bold text-destructive">{metrics.criticalCount}</div>
              <div className="text-[10px] text-muted-foreground">Critical</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-warning/5 border border-warning/10">
            <TrendingDown className="h-3.5 w-3.5 text-warning" />
            <div>
              <div className="text-sm font-bold text-warning">{metrics.lowStockCount}</div>
              <div className="text-[10px] text-muted-foreground">Low Stock</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-success/5 border border-success/10">
            <CheckCircle className="h-3.5 w-3.5 text-success" />
            <div>
              <div className="text-sm font-bold text-success">{metrics.healthyCount}</div>
              <div className="text-[10px] text-muted-foreground">Healthy</div>
            </div>
          </div>
        </div>

        <div className="text-center p-3 rounded-lg bg-muted/30">
          <div className="text-xs text-muted-foreground">Total Inventory Value</div>
          <div className="text-xl font-bold">
            ${metrics.totalValue >= 1000000 ? `${(metrics.totalValue / 1000000).toFixed(1)}M` : metrics.totalValue >= 1000 ? `${(metrics.totalValue / 1000).toFixed(0)}K` : metrics.totalValue.toFixed(0)}
          </div>
        </div>

        {metrics.criticalItems.length > 0 && (
          <div className="space-y-1.5">
            <h4 className="text-xs font-semibold text-destructive uppercase">🔴 Reorder Required</h4>
            {metrics.criticalItems.map((item, i) => (
              <div key={i} className="flex justify-between items-center text-xs p-1.5 rounded bg-destructive/5">
                <span className="truncate max-w-[60%]">{item.name}</span>
                <span className="text-destructive font-medium">
                  {item.quantity}/{item.min_quantity}
                </span>
              </div>
            ))}
          </div>
        )}

        {metrics.topCategories.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {metrics.topCategories.map(([cat, count]) => (
              <Badge key={cat} variant="secondary" className="text-[10px]">
                {cat} ({count})
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default SparePartsIntelligence;
