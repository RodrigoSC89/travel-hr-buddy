/**
 * Spare Parts Intelligence - M048
 * AI-powered parts inventory optimization and demand forecasting
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  Package, AlertTriangle, TrendingDown, TrendingUp, DollarSign,
  Search, Brain, RefreshCw, ShoppingCart, BarChart3, Sparkles,
  ArrowUpRight, Clock, CheckCircle,
} from "lucide-react";
import { maintenanceIntelligence } from "@/services/maintenance";
import { useSupplyInventoryRealData } from "@/hooks/useSupplyInventoryRealData";
import { toast } from "sonner";

interface SparePartAnalysis {
  part_name: string;
  current_stock: number;
  recommended_stock: number;
  lead_time_days: number;
  criticality: "critical" | "high" | "medium" | "low";
  estimated_cost_usd: number;
  recommendation: string;
}

export function SparePartsIntelligence() {
  const { supplies, stats, isLoading } = useSupplyInventoryRealData();
  const [aiResult, setAiResult] = useState<{
    spare_parts_analysis?: { critical_parts?: SparePartAnalysis[]; total_inventory_value_usd?: number; optimization_savings_usd?: number };
    summary?: string;
    overall_health?: string;
  } | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const runAIAnalysis = async () => {
    setAnalyzing(true);
    try {
      const result = await maintenanceIntelligence.runOptimization("spare_parts");
      setAiResult(result);
      toast.success("Análise de peças sobressalentes concluída");
    } catch (err) {
      toast.error("Erro na análise AI");
    } finally {
      setAnalyzing(false);
    }
  };

  const criticalityColor = (c: string) => {
    switch (c) {
      case "critical": return "text-destructive bg-destructive/10 border-destructive/30";
      case "high": return "text-warning bg-warning/10 border-warning/30";
      case "medium": return "text-warning bg-warning/10 border-warning/30";
      default: return "text-success bg-success/10 border-success/30";
    }
  };

  const filteredSupplies = supplies.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-border/50 bg-card/80">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10">
              <Package className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{supplies.length}</p>
              <p className="text-xs text-muted-foreground">Total de Itens</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/80">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.critical}</p>
              <p className="text-xs text-muted-foreground">Estoque Crítico</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/80">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <TrendingDown className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.low}</p>
              <p className="text-xs text-muted-foreground">Estoque Baixo</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/80">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                ${aiResult?.spare_parts_analysis?.total_inventory_value_usd?.toLocaleString() || "—"}
              </p>
              <p className="text-xs text-muted-foreground">Valor Total</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Analysis Button */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">Otimização AI de Peças Sobressalentes</p>
              <p className="text-sm text-muted-foreground">
                Análise preditiva de demanda, pontos de reabastecimento e economia potencial
              </p>
            </div>
          </div>
          <Button onClick={runAIAnalysis} disabled={analyzing} className="gap-2">
            {analyzing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {analyzing ? "Analisando..." : "Executar Análise"}
          </Button>
        </CardContent>
      </Card>

      {/* AI Results */}
      {aiResult?.spare_parts_analysis?.critical_parts && aiResult.spare_parts_analysis.critical_parts.length > 0 && (
        <Card className="border-border/50 bg-card/80">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Recomendações AI
              </CardTitle>
              {aiResult.spare_parts_analysis.optimization_savings_usd && (
                <Badge variant="default" className="gap-1">
                  <ArrowUpRight className="h-3 w-3" />
                  Economia: ${aiResult.spare_parts_analysis.optimization_savings_usd.toLocaleString()}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[250px]">
              <div className="space-y-2">
                {aiResult.spare_parts_analysis.critical_parts.map((part) => (
                  <div key={part.part_name} className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-muted/10">
                    <Badge variant="outline" className={`text-xs ${criticalityColor(part.criticality)}`}>
                      {part.criticality.toUpperCase()}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{part.part_name}</p>
                      <p className="text-xs text-muted-foreground truncate">{part.recommendation}</p>
                    </div>
                    <div className="text-right text-xs space-y-1">
                      <p className="flex items-center gap-1">
                        <Package className="h-3 w-3" />
                        {part.current_stock || 0} → {part.recommended_stock || 0}
                      </p>
                      {part.lead_time_days && (
                        <p className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {part.lead_time_days}d lead time
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Inventory Table */}
      <Card className="border-border/50 bg-card/80">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Inventário de Peças</CardTitle>
            <div className="relative w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {isLoading ? (
                <div className="flex items-center justify-center py-10">
                  <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredSupplies.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-10">Nenhum item encontrado</p>
              ) : (
                filteredSupplies.map((item) => {
                  const percentage = Math.round((item.currentStock / item.maxCapacity) * 100);
                  return (
                    <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-muted/10">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium truncate">{item.name}</p>
                          <Badge variant="outline" className="text-xs">{item.category}</Badge>
                        </div>
                        <Progress value={percentage} className="h-1.5" />
                      </div>
                      <div className="text-right text-xs whitespace-nowrap space-y-0.5">
                        <p className="font-medium">{item.currentStock} {item.unit}</p>
                        <p className="text-muted-foreground">{item.daysUntilEmpty}d restantes</p>
                      </div>
                      <Badge
                        variant={item.status === "critical" ? "destructive" : item.status === "low" ? "secondary" : "default"}
                        className="text-xs"
                      >
                        {item.status === "ok" && <CheckCircle className="h-3 w-3 mr-1" />}
                        {item.status === "critical" && <AlertTriangle className="h-3 w-3 mr-1" />}
                        {item.status}
                      </Badge>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
