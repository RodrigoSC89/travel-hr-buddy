/**
 * SparePartsCriticality - Spare parts stock criticality matrix
 * Shows stock levels, reorder alerts, and criticality distribution
 */

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Package, AlertTriangle, CheckCircle, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";

export function SparePartsCriticality() {
  const { data: parts = [] } = useQuery({
    queryKey: ["spare-parts-criticality"],
    queryFn: async () => {
      const { data } = await supabase
        .from("inventory_items")
        .select("id, item_name, quantity, minimum_stock, category, unit_cost, criticality")
        .order("quantity", { ascending: true })
        .limit(100);
      return data || [];
    },
    staleTime: 60000,
  });

  const metrics = useMemo(() => {
    const total = parts.length;
    const belowMin = parts.filter((p: any) => p.quantity <= (p.minimum_stock || 0)).length;
    const outOfStock = parts.filter((p: any) => p.quantity === 0).length;
    const criticalLow = parts.filter((p: any) => 
      (p.criticality === "critical" || p.criticality === "high") && p.quantity <= (p.minimum_stock || 0)
    ).length;
    const totalValue = parts.reduce((a: number, p: any) => a + (p.quantity || 0) * (p.unit_cost || 0), 0);

    return { total, belowMin, outOfStock, criticalLow, totalValue };
  }, [parts]);

  // Top items needing reorder
  const reorderItems = useMemo(() => {
    return parts
      .filter((p: any) => p.quantity <= (p.minimum_stock || 0))
      .sort((a: any, b: any) => {
        const critOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
        return (critOrder[a.criticality] || 3) - (critOrder[b.criticality] || 3);
      })
      .slice(0, 8);
  }, [parts]);

  const critColorMap: Record<string, { bg: string; text: string }> = {
    critical: { bg: "bg-destructive/20", text: "text-destructive" },
    high: { bg: "bg-orange-500/20", text: "text-orange-500" },
    medium: { bg: "bg-warning/20", text: "text-warning" },
    low: { bg: "bg-muted", text: "text-muted-foreground" },
  };

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Package className="h-5 w-5 text-primary" />
            Spare Parts Criticality
          </CardTitle>
          {metrics.criticalLow > 0 && (
            <Badge variant="destructive" className="text-xs animate-pulse">
              <ShieldAlert className="h-3 w-3 mr-1" />
              {metrics.criticalLow} critical low
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary metrics */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Total Items", value: metrics.total, icon: Package, color: "text-primary" },
            { label: "Below Min", value: metrics.belowMin, icon: AlertTriangle, color: "text-warning" },
            { label: "Out of Stock", value: metrics.outOfStock, icon: ShieldAlert, color: "text-destructive" },
            { label: "Stock Value", value: `$${(metrics.totalValue / 1000).toFixed(0)}k`, icon: CheckCircle, color: "text-success" },
          ].map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="text-center p-2 rounded-lg bg-muted/30"
            >
              <m.icon className={`h-4 w-4 mx-auto mb-1 ${m.color}`} />
              <p className="text-lg font-bold">{m.value}</p>
              <p className="text-[10px] text-muted-foreground">{m.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Reorder alert list */}
        {reorderItems.length > 0 ? (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">⚠️ Reorder Required</p>
            {reorderItems.map((item: any, i: number) => {
              const crit = item.criticality || "low";
              const colors = critColorMap[crit] || critColorMap.low;
              const stockPct = item.minimum_stock > 0 
                ? Math.round((item.quantity / item.minimum_stock) * 100) 
                : 0;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-2 p-2 rounded-lg border border-border/40 text-sm"
                >
                  <Tooltip>
                    <TooltipTrigger>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${colors.bg} ${colors.text}`}>
                        {crit.slice(0, 4)}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>Criticidade: {crit}</TooltipContent>
                  </Tooltip>
                  <span className="flex-1 truncate font-medium">{item.item_name}</span>
                  <div className="flex items-center gap-2 text-xs">
                    <span className={item.quantity === 0 ? "text-destructive font-bold" : "text-warning"}>
                      {item.quantity}/{item.minimum_stock || "—"}
                    </span>
                    <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${stockPct > 50 ? "bg-success" : stockPct > 25 ? "bg-warning" : "bg-destructive"}`}
                        style={{ width: `${Math.min(100, stockPct)}%` }}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-4 text-sm text-muted-foreground">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-success opacity-60" />
            <p>Todos os itens acima do estoque mínimo</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
