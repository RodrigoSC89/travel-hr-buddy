/**
 * Fuel Management Page - Connected to Supabase fuel_records
 * PATCH Sprint 8: Replaced mock data with useFuelRecords hook
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Fuel, TrendingUp, TrendingDown, AlertTriangle, Ship, 
  DollarSign, BarChart3, Calendar, FileText, Droplets,
  Gauge, Thermometer, Clock, MapPin, Plus, HelpCircle, RefreshCw,
  Zap, Brain, Sparkles, Target, Lightbulb
} from "lucide-react";
import { useFuelRecords } from "@/hooks/useFuelRecords";
import { useFuelAI } from "@/hooks/useFuelAI";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function FuelManagementPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { records, bunkerRecords, tankLevels, stats, isLoading, refetch } = useFuelRecords();
  const { prediction, loading: aiLoading, predictConsumption } = useFuelAI();

  if (isLoading) {
    return (
      <div className="space-y-6 py-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  const totalCurrent = tankLevels.reduce((s, t) => s + t.current, 0);
  const totalCapacity = tankLevels.reduce((s, t) => s + t.capacity, 0);
  const fillPercentage = totalCapacity > 0 ? Math.round((totalCurrent / totalCapacity) * 100) : 0;

  // Calculate daily avg from consumption records
  const consumptionDays = records.length > 1
    ? Math.max(1, Math.ceil((new Date(records[0].record_date).getTime() - new Date(records[records.length - 1].record_date).getTime()) / (1000 * 60 * 60 * 24)))
    : 30;
  const dailyAvg = stats.totalConsumed > 0 ? (stats.totalConsumed / consumptionDays).toFixed(1) : "0";
  const autonomyDays = Number(dailyAvg) > 0 ? Math.round(totalCurrent / Number(dailyAvg)) : 0;

  // Fuel type distribution for analytics
  const fuelTypeDistribution = records.reduce((acc, r) => {
    acc[r.fuel_type] = (acc[r.fuel_type] || 0) + Number(r.quantity_mt);
    return acc;
  }, {} as Record<string, number>);
  const totalQuantity = Object.values(fuelTypeDistribution).reduce((s, v) => s + v, 0) || 1;

  return (
    <div className="space-y-6 py-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
            <Fuel className="h-8 w-8 text-primary" />
            Gestão de Combustível
          </h1>
          <p className="text-muted-foreground">
            {records.length} registros • {bunkerRecords.length} bunkerings • {stats.fuelTypes} tipos
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Bunker Report
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Novo Bunker
          </Button>
        </div>
      </div>

      {/* KPIs - Real Data */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">ROB Estimado</p>
                <p className="text-2xl font-bold">{totalCurrent.toLocaleString()} MT</p>
                <p className="text-xs text-muted-foreground">{fillPercentage}% capacidade</p>
              </div>
              <div className="p-3 rounded-full bg-primary/10">
                <Droplets className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Consumo Médio/Dia</p>
                <p className="text-2xl font-bold">{dailyAvg} MT</p>
                <p className="text-xs text-muted-foreground">últimos {consumptionDays} dias</p>
              </div>
              <div className="p-3 rounded-full bg-green-500/10">
                <Gauge className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Custo Total</p>
                <p className="text-2xl font-bold">${(stats.totalCost / 1000).toFixed(0)}K</p>
                <p className="text-xs text-muted-foreground">Preço médio: ${stats.avgPrice.toFixed(0)}/MT</p>
              </div>
              <div className="p-3 rounded-full bg-amber-500/10">
                <DollarSign className="h-6 w-6 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Autonomia Estimada</p>
                <p className="text-2xl font-bold">{autonomyDays} dias</p>
                <p className="text-xs text-muted-foreground">@ consumo atual</p>
              </div>
              <div className="p-3 rounded-full bg-blue-500/10">
                <Clock className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="tanks">Tanques</TabsTrigger>
          <TabsTrigger value="bunker">Bunker Ops</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            AI
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Tank Overview - Real Data */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Droplets className="h-5 w-5" />
                  Níveis dos Tanques (Estimado)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {tankLevels.length === 0 ? (
                  <div className="text-center py-8">
                    <Droplets className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                    <p className="text-muted-foreground">Sem dados de tanques</p>
                  </div>
                ) : (
                  tankLevels.map((tank, i) => {
                    const fill = tank.capacity > 0 ? Math.round((tank.current / tank.capacity) * 100) : 0;
                    const isLow = fill < 30;
                    return (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{tank.name}</span>
                            <Badge variant="outline" className="text-xs">{tank.type}</Badge>
                          </div>
                          {isLow && <AlertTriangle className="h-4 w-4 text-amber-500" />}
                        </div>
                        <div className="flex items-center gap-3">
                          <Progress value={fill} className="flex-1" />
                          <span className="text-sm font-medium w-24 text-right">
                            {Math.round(tank.current)}/{Math.round(tank.capacity)} MT
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            {/* Recent Bunker Operations - Real Data */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ship className="h-5 w-5" />
                  Últimas Operações de Bunker
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bunkerRecords.length === 0 ? (
                    <div className="text-center py-8">
                      <Ship className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                      <p className="text-muted-foreground">Nenhum bunkering registrado</p>
                    </div>
                  ) : (
                    bunkerRecords.slice(0, 5).map(op => (
                      <div key={op.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{op.bunkering_port || "Sem porto"}</span>
                            <Badge variant="secondary" className="text-xs">{op.fuel_type}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {op.supplier || "—"} • {format(new Date(op.record_date), "dd/MM/yyyy")}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{Number(op.quantity_mt).toLocaleString()} MT</p>
                          <p className="text-sm text-muted-foreground">
                            ${Number(op.price_per_mt || 0).toFixed(0)}/MT
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tanks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuração de Tanques</CardTitle>
              <CardDescription>Níveis estimados baseados em registros de bunker e consumo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {tankLevels.map((tank, i) => {
                  const fill = tank.capacity > 0 ? Math.round((tank.current / tank.capacity) * 100) : 0;
                  return (
                    <Card key={i} className="bg-muted/30">
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-semibold">{tank.name}</h3>
                            <Badge>{tank.type}</Badge>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold">{fill}%</p>
                          </div>
                        </div>
                        <Progress value={fill} className="mb-2" />
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>{Math.round(tank.current)} MT</span>
                          <span>Cap: {Math.round(tank.capacity)} MT</span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bunker" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Bunker</CardTitle>
              <CardDescription>{bunkerRecords.length} operações registradas</CardDescription>
            </CardHeader>
            <CardContent>
              {bunkerRecords.length === 0 ? (
                <div className="text-center py-12">
                  <Ship className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground">Nenhuma operação de bunker registrada</p>
                </div>
              ) : (
                <div className="rounded-lg border">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium">Data</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Porto</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Tipo</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Fornecedor</th>
                        <th className="px-4 py-3 text-right text-sm font-medium">Quantidade</th>
                        <th className="px-4 py-3 text-right text-sm font-medium">Preço/MT</th>
                        <th className="px-4 py-3 text-right text-sm font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bunkerRecords.map(op => (
                        <tr key={op.id} className="border-t">
                          <td className="px-4 py-3 text-sm">
                            {format(new Date(op.record_date), "dd/MM/yyyy")}
                          </td>
                          <td className="px-4 py-3 text-sm">{op.bunkering_port || "—"}</td>
                          <td className="px-4 py-3"><Badge variant="outline">{op.fuel_type}</Badge></td>
                          <td className="px-4 py-3 text-sm">{op.supplier || "—"}</td>
                          <td className="px-4 py-3 text-sm text-right">{Number(op.quantity_mt).toLocaleString()} MT</td>
                          <td className="px-4 py-3 text-sm text-right">${Number(op.price_per_mt || 0).toFixed(0)}</td>
                          <td className="px-4 py-3 text-sm text-right font-medium">
                            ${Number(op.total_cost || 0).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Analytics de Consumo
              </CardTitle>
              <CardDescription>Análise baseada em {records.length} registros reais</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Distribuição por Tipo</h3>
                  <div className="space-y-3">
                    {Object.entries(fuelTypeDistribution)
                      .sort(([, a], [, b]) => b - a)
                      .map(([type, qty]) => {
                        const pct = Math.round((qty / totalQuantity) * 100);
                        return (
                          <div key={type}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm">{type}</span>
                              <span className="font-medium text-sm">{pct}% ({Math.round(qty)} MT)</span>
                            </div>
                            <Progress value={pct} />
                          </div>
                        );
                      })}
                    {Object.keys(fuelTypeDistribution).length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">Sem dados</p>
                    )}
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold">Métricas Reais</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-primary">{stats.totalBunkered.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">MT Bunkered</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-amber-500">{stats.totalConsumed.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">MT Consumido</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-green-500">${stats.avgPrice.toFixed(0)}</p>
                      <p className="text-sm text-muted-foreground">Preço Médio/MT</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-blue-500">{stats.suppliers}</p>
                      <p className="text-sm text-muted-foreground">Fornecedores</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Prediction Tab */}
        <TabsContent value="ai" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Previsão de Consumo com IA
              </CardTitle>
              <CardDescription>
                Análise preditiva usando Gemini AI para prever consumo, recomendar reabastecimento e otimizar custos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => predictConsumption({
                  history: records.slice(0, 20).map(r => ({
                    date: r.record_date,
                    quantity: r.quantity_mt,
                    type: r.fuel_type,
                    port: r.bunkering_port,
                  })),
                  current_stock_tons: totalCurrent,
                  min_rob_tons: 50,
                  fuel_type: Object.keys(fuelTypeDistribution)[0] || 'VLSFO',
                })}
                disabled={aiLoading}
                className="w-full md:w-auto"
              >
                {aiLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                Gerar Previsão AI
              </Button>

              {prediction && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {/* Prediction Results */}
                  <Card className="bg-primary/5 border-primary/20">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Previsão de Consumo
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        {prediction.predicted_consumption_tons && (
                          <div className="p-3 bg-background rounded-lg text-center">
                            <p className="text-2xl font-bold text-primary">{prediction.predicted_consumption_tons}</p>
                            <p className="text-xs text-muted-foreground">Consumo Previsto (ton)</p>
                          </div>
                        )}
                        {prediction.confidence_score && (
                          <div className="p-3 bg-background rounded-lg text-center">
                            <p className="text-2xl font-bold text-emerald-500">{Math.round(prediction.confidence_score * 100)}%</p>
                            <p className="text-xs text-muted-foreground">Confiança</p>
                          </div>
                        )}
                        {prediction.estimated_cost_usd && (
                          <div className="p-3 bg-background rounded-lg text-center">
                            <p className="text-2xl font-bold text-amber-500">${prediction.estimated_cost_usd.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">Custo Estimado</p>
                          </div>
                        )}
                        {prediction.potential_savings_usd && (
                          <div className="p-3 bg-background rounded-lg text-center">
                            <p className="text-2xl font-bold text-green-500">${prediction.potential_savings_usd.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">Economia Potencial</p>
                          </div>
                        )}
                      </div>

                      {prediction.optimal_refuel_port && (
                        <div className="p-3 bg-background rounded-lg flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">Melhor Porto</span>
                          </div>
                          <Badge>{prediction.optimal_refuel_port}</Badge>
                        </div>
                      )}
                      {prediction.recommended_refuel_date && (
                        <div className="p-3 bg-background rounded-lg flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">Data Recomendada</span>
                          </div>
                          <Badge variant="outline">{prediction.recommended_refuel_date}</Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* AI Tips */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-amber-500" />
                        Dicas de Otimização
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {prediction.optimization_tips && prediction.optimization_tips.length > 0 ? (
                        <ul className="space-y-2">
                          {prediction.optimization_tips.map((tip, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <Zap className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground">Sem dicas disponíveis</p>
                      )}

                      {prediction.factors && prediction.factors.length > 0 && (
                        <div className="pt-3 border-t">
                          <h4 className="text-sm font-semibold mb-2">Fatores de Impacto</h4>
                          <div className="flex flex-wrap gap-2">
                            {prediction.factors.map((f, i) => (
                              <Badge 
                                key={i} 
                                variant={f.impact === 'high' ? 'destructive' : f.impact === 'medium' ? 'default' : 'secondary'}
                              >
                                {f.factor}: {f.impact}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
