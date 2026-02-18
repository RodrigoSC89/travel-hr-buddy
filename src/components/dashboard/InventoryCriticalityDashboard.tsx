/**
 * Inventory Criticality Dashboard - Spare parts stock vs criticality analysis
 * Queries inventory_items for stock levels and criticality classification
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { useMemo } from "react";

export function InventoryCriticalityDashboard() {
  const { data: items = [] } = useQuery({
    queryKey: ["inventory-criticality"],
    queryFn: async () => {
      const { data } = await supabase
        .from("inventory_items")
        .select("id, name, quantity, min_quantity, criticality, category, unit_cost")
        .order("criticality", { ascending: true })
        .limit(300);
      return data || [];
    },
    staleTime: 60000,
  });

  const analysis = useMemo(() => {
    const total = items.length;
    const critical = items.filter((i) => i.criticality === "critical" || i.criticality === "vital");
    const belowMin = items.filter((i) => i.quantity != null && i.min_quantity != null && i.quantity < i.min_quantity);
    const outOfStock = items.filter((i) => i.quantity != null && i.quantity <= 0);
    const criticalBelowMin = critical.filter((i) => i.quantity != null && i.min_quantity != null && i.quantity < i.min_quantity);

    const totalValue = items.reduce((sum, i) => sum + (i.quantity || 0) * (i.unit_cost || 0), 0);

    const byCriticality: Record<string, number> = {};
    items.forEach((i) => {
      const c = i.criticality || "standard";
      byCriticality[c] = (byCriticality[c] || 0) + 1;
    });

    return { total, critical: critical.length, belowMin: belowMin.length, outOfStock: outOfStock.length, criticalBelowMin: criticalBelowMin.length, totalValue, byCriticality, criticalItems: criticalBelowMin.slice(0, 5) };
  }, [items]);

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Package className="h-4 w-4 text-warning" />
            Criticidade de Inventário
          </CardTitle>
          <Badge variant="outline" className="text-xs">{analysis.total} itens</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Críticos", value: analysis.critical, icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10" },
            { label: "Abaixo Mín.", value: analysis.belowMin, icon: XCircle, color: "text-warning", bg: "bg-warning/10" },
            { label: "Sem Estoque", value: analysis.outOfStock, icon: XCircle, color: "text-destructive", bg: "bg-destructive/10" },
            { label: "OK", value: analysis.total - analysis.belowMin, icon: CheckCircle, color: "text-success", bg: "bg-success/10" },
          ].map((kpi) => (
            <div key={kpi.label} className={`text-center p-2 rounded-lg ${kpi.bg}`}>
              <kpi.icon className={`h-3.5 w-3.5 mx-auto mb-1 ${kpi.color}`} />
              <div className="text-sm font-bold">{kpi.value}</div>
              <div className="text-[10px] text-muted-foreground">{kpi.label}</div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30 text-xs">
          <span className="text-muted-foreground">Valor total em estoque</span>
          <span className="font-bold text-foreground">
            ${analysis.totalValue.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </span>
        </div>

        <div>
          <div className="text-xs text-muted-foreground mb-2">Distribuição por criticidade</div>
          <div className="flex gap-1 h-5 rounded-full overflow-hidden">
            {Object.entries(analysis.byCriticality)
              .sort((a, b) => {
                const order: Record<string, number> = { critical: 0, vital: 1, important: 2, standard: 3, desirable: 4 };
                return (order[a[0]] ?? 5) - (order[b[0]] ?? 5);
              })
              .map(([level, count]) => {
                const colors: Record<string, string> = {
                  critical: "bg-destructive",
                  vital: "bg-warning",
                  important: "bg-info",
                  standard: "bg-success",
                  desirable: "bg-muted-foreground/30",
                };
                return (
                  <div
                    key={level}
                    className={`${colors[level] || "bg-muted"} transition-all`}
                    style={{ flex: count }}
                    title={`${level}: ${count} itens`}
                  />
                );
              })}
          </div>
          <div className="flex justify-between text-[9px] text-muted-foreground mt-1">
            <span>Crítico</span>
            <span>Desejável</span>
          </div>
        </div>

        {analysis.criticalBelowMin > 0 && (
          <div className="space-y-1.5">
            <div className="text-xs text-destructive font-medium flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              {analysis.criticalBelowMin} itens críticos abaixo do mínimo
            </div>
            {analysis.criticalItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-xs p-1.5 rounded bg-destructive/5 border border-destructive/20">
                <span className="truncate font-medium">{item.name}</span>
                <span className="text-destructive shrink-0 ml-2">
                  {item.quantity}/{item.min_quantity}
                </span>
              </div>
            ))}
          </div>
        )}

        {analysis.total === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">Nenhum item no inventário</p>
        )}
      </CardContent>
    </Card>
  );
}

export default InventoryCriticalityDashboard;
