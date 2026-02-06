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
  Gauge, Thermometer, Clock, MapPin, Plus, HelpCircle, RefreshCw
} from "lucide-react";
import { useFuelRecords } from "@/hooks/useFuelRecords";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function FuelManagementPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { records, bunkerRecords, tankLevels, stats, isLoading, refetch } = useFuelRecords();

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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="tanks">Tanques</TabsTrigger>
          <TabsTrigger value="bunker">Bunker Ops</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
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
      </Tabs>
    </div>
  );
}
