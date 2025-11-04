import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { BarChart, TrendingUp, Activity, DollarSign } from "lucide-react";

export default function MaintenanceAnalytics() {
  return (
    <ModulePageWrapper gradient="green">
      <ModuleHeader
        icon={BarChart}
        title="Analytics de Manutenção"
        description="Métricas e indicadores de performance"
        gradient="green"
        badges={[
          { icon: TrendingUp, label: "KPIs" },
          { icon: Activity, label: "Performance" },
          { icon: DollarSign, label: "Custos" }
        ]}
      />

      <div className="grid gap-6">
        {/* KPIs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">MTBF</CardTitle>
              <CardDescription>Mean Time Between Failures</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">45 dias</div>
              <p className="text-xs text-muted-foreground">+8% vs mês anterior</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">MTTR</CardTitle>
              <CardDescription>Mean Time To Repair</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">2.3 horas</div>
              <p className="text-xs text-muted-foreground">-12% vs mês anterior</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Taxa de Conclusão</CardTitle>
              <CardDescription>Manutenções no Prazo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">95%</div>
              <p className="text-xs text-muted-foreground">Meta: 90%</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Custo Médio</CardTitle>
              <CardDescription">Por Manutenção</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">R$ 1,850</div>
              <p className="text-xs text-muted-foreground">-5% vs mês anterior</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Tipo</CardTitle>
              <CardDescription>Manutenções nos últimos 3 meses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Preventiva</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: '65%' }}></div>
                    </div>
                    <span className="text-sm font-medium">65%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Corretiva</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500" style={{ width: '25%' }}></div>
                    </div>
                    <span className="text-sm font-medium">25%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Preditiva</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500" style={{ width: '10%' }}></div>
                    </div>
                    <span className="text-sm font-medium">10%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Causas Principais</CardTitle>
              <CardDescription>Top 5 motivos de manutenção</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { cause: 'Desgaste natural', count: 42 },
                  { cause: 'Vazamentos', count: 28 },
                  { cause: 'Falha elétrica', count: 18 },
                  { cause: 'Vibração excessiva', count: 12 },
                  { cause: 'Superaquecimento', count: 8 }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm">{item.cause}</span>
                    <span className="text-sm font-medium">{item.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Tendência Mensal</CardTitle>
            <CardDescription>Manutenções realizadas por mês</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-around gap-2">
              {[38, 42, 35, 45, 48, 44].map((value, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors cursor-pointer"
                    style={{ height: `${(value / 50) * 100}%` }}
                  ></div>
                  <span className="text-xs mt-2 text-muted-foreground">
                    {['Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][index]}
                  </span>
                  <span className="text-xs font-medium">{value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </ModulePageWrapper>
  );
}
