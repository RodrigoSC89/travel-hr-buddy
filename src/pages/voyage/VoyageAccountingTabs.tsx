import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Ship, Brain, BarChart3, PieChart, ArrowUp, ArrowDown, Calculator, FileText
} from "lucide-react";

interface Voyage {
  id: string;
  voyage_number: string;
  vessel_name: string;
  departure_port: string;
  arrival_port: string;
  departure_date: string;
  arrival_date?: string;
  cargo_type: string;
  budget_revenue: number;
  actual_revenue: number;
  budget_costs: number;
  actual_costs: number;
  net_result: number;
  margin_percent: number;
  tce_daily: number;
  status: string;
}

interface CostBreakdown {
  category: string;
  budgeted: number;
  actual: number;
  variance: number;
  percent_of_total: number;
}

interface VoyageAccountingTabsProps {
  voyages: Voyage[];
  costs: CostBreakdown[];
  stats: {
    totalRevenue: number;
    totalCosts: number;
    totalProfit: number;
  };
  onSelectVoyage: (v: Voyage) => void;
  onRunAIAnalysis: (v?: Voyage) => void;
}

export function VoyageAccountingTabs({ voyages, costs, stats, onSelectVoyage, onRunAIAnalysis }: VoyageAccountingTabsProps) {
  const totalBudgetedCosts = costs.reduce((sum, c) => sum + c.budgeted, 0);
  const totalActualCosts = costs.reduce((sum, c) => sum + c.actual, 0);
  const totalVariance = costs.reduce((sum, c) => sum + c.variance, 0);

  return (
    <>
      <TabsContent value="overview" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" />P&L Consolidado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-success/5 rounded-lg">
                  <span className="font-medium">Receita Total</span>
                  <span className="text-xl font-bold text-success">${(stats.totalRevenue / 1000000).toFixed(2)}M</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="font-medium">(-) Custos Operacionais</span>
                  <span className="text-xl font-bold">${(stats.totalCosts / 1000000).toFixed(2)}M</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg">Resultado Líquido</span>
                    <span className="text-2xl font-bold text-success">${(stats.totalProfit / 1000000).toFixed(2)}M</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><PieChart className="h-5 w-5" />Composição de Custos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {costs.slice(0, 5).map((cost) => (
                  <div key={cost.category}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{cost.category}</span>
                      <span className="font-medium">{cost.percent_of_total}%</span>
                    </div>
                    <Progress value={cost.percent_of_total} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="voyages" className="space-y-4">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Viagem</TableHead>
                  <TableHead>Embarcação</TableHead>
                  <TableHead>Rota</TableHead>
                  <TableHead>Receita</TableHead>
                  <TableHead>Custos</TableHead>
                  <TableHead>Resultado</TableHead>
                  <TableHead>Margem</TableHead>
                  <TableHead>TCE</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {voyages.map(voyage => (
                  <TableRow key={voyage.id}>
                    <TableCell className="font-mono font-medium">{voyage.voyage_number}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2"><Ship className="h-4 w-4 text-muted-foreground" />{voyage.vessel_name}</div>
                    </TableCell>
                    <TableCell className="text-sm">{voyage.departure_port} → {voyage.arrival_port}</TableCell>
                    <TableCell className="text-success font-medium">
                      {voyage.actual_revenue > 0 ? `$${(voyage.actual_revenue / 1000).toFixed(0)}k` : "-"}
                    </TableCell>
                    <TableCell>${(voyage.actual_costs / 1000).toFixed(0)}k</TableCell>
                    <TableCell className={voyage.net_result > 0 ? "text-success font-medium" : ""}>
                      {voyage.net_result > 0 ? `$${(voyage.net_result / 1000).toFixed(0)}k` : "-"}
                    </TableCell>
                    <TableCell className={voyage.margin_percent > 50 ? "text-success" : ""}>
                      {voyage.margin_percent > 0 ? `${voyage.margin_percent.toFixed(1)}%` : "-"}
                    </TableCell>
                    <TableCell>${voyage.tce_daily.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={
                        voyage.status === "completed" ? "default" :
                        voyage.status === "in_progress" ? "secondary" : "outline"
                      }>{voyage.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => { onSelectVoyage(voyage); onRunAIAnalysis(voyage); }}>
                        <Brain className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="costs" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" />Budget vs Actual</CardTitle>
            <CardDescription>Análise de variação de custos</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="text-right">Orçado</TableHead>
                  <TableHead className="text-right">Realizado</TableHead>
                  <TableHead className="text-right">Variação</TableHead>
                  <TableHead className="text-right">% do Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {costs.map((cost) => (
                  <TableRow key={cost.category}>
                    <TableCell className="font-medium">{cost.category}</TableCell>
                    <TableCell className="text-right">${cost.budgeted.toLocaleString()}</TableCell>
                    <TableCell className="text-right">${cost.actual.toLocaleString()}</TableCell>
                    <TableCell className={`text-right ${cost.variance < 0 ? "text-success" : cost.variance > 0 ? "text-destructive" : ""}`}>
                      {cost.variance < 0 ? "" : "+"}{cost.variance.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">{cost.percent_of_total}%</TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-bold border-t-2">
                  <TableCell>TOTAL</TableCell>
                  <TableCell className="text-right">${totalBudgetedCosts.toLocaleString()}</TableCell>
                  <TableCell className="text-right">${totalActualCosts.toLocaleString()}</TableCell>
                  <TableCell className={`text-right ${totalVariance < 0 ? "text-success" : "text-destructive"}`}>
                    {totalVariance < 0 ? "" : "+"}{totalVariance.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">100%</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="reports" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="cursor-pointer hover:border-primary transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" />P&L por Viagem</CardTitle>
              <CardDescription>Relatório detalhado de receitas e custos</CardDescription>
            </CardHeader>
            <CardContent><Button className="w-full">Gerar Relatório</Button></CardContent>
          </Card>
          <Card className="cursor-pointer hover:border-primary transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" />Benchmark TCE</CardTitle>
              <CardDescription>Comparativo de performance entre embarcações</CardDescription>
            </CardHeader>
            <CardContent><Button className="w-full">Gerar Relatório</Button></CardContent>
          </Card>
          <Card className="cursor-pointer hover:border-primary transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Brain className="h-5 w-5" />Análise IA</CardTitle>
              <CardDescription>Insights e recomendações automáticas</CardDescription>
            </CardHeader>
            <CardContent><Button className="w-full" onClick={() => onRunAIAnalysis()}>Gerar Análise</Button></CardContent>
          </Card>
        </div>
      </TabsContent>
    </>
  );
}
