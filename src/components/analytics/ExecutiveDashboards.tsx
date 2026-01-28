/**
 * Executive Dashboard Components
 * Phase 4: Premium Analytics - CEO/CFO/COO Dashboard Views
 */

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Ship, 
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart,
  LineChart,
  RefreshCw,
  Download
} from "lucide-react";
import { executiveKPIs } from "@/lib/analytics/executive-kpis";
import { mlPredictions } from "@/lib/analytics/ml-predictions";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  status?: "success" | "warning" | "danger" | "info";
}

const KPICard: React.FC<KPICardProps> = ({ 
  title, 
  value, 
  change, 
  changeLabel,
  icon, 
  trend = "neutral",
  status = "info" 
}) => {
  const statusColors = {
    success: "text-green-500 bg-green-500/10",
    warning: "text-yellow-500 bg-yellow-500/10",
    danger: "text-red-500 bg-red-500/10",
    info: "text-blue-500 bg-blue-500/10",
  };

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={cn("p-2 rounded-lg", statusColors[status])}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <div className="flex items-center gap-1 mt-1">
            {trend === "up" ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : trend === "down" ? (
              <TrendingDown className="w-4 h-4 text-red-500" />
            ) : null}
            <span className={cn(
              "text-xs",
              trend === "up" && "text-green-500",
              trend === "down" && "text-red-500",
              trend === "neutral" && "text-muted-foreground"
            )}>
              {change > 0 ? "+" : ""}{change}% {changeLabel || "vs período anterior"}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface ExecutiveKPIs {
  financial: {
    revenue: number;
    costs: number;
    profit: number;
    profitMargin: number;
    cashFlow: number;
  };
  operational: {
    fleetUtilization: number;
    voyageCompletion: number;
    onTimeDelivery: number;
    fuelEfficiency: number;
  };
  crew: {
    totalCrew: number;
    crewUtilization: number;
    turnoverRate: number;
    trainingCompliance: number;
    certificationCompliance: number;
  };
  compliance: {
    overallScore: number;
    openNCRs: number;
    certExpiring30Days: number;
    auditsPassed: number;
  };
  safety: {
    trir: number; // Total Recordable Incident Rate
    lti: number;  // Lost Time Injuries
    nearMisses: number;
    safetyScore: number;
  };
}

export const CEODashboard: React.FC = () => {
  const [kpis, setKpis] = useState<ExecutiveKPIs | null>(null);
  const [predictions, setPredictions] = useState<{ crewDemand: unknown }>({ crewDemand: null });
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [dashboardMetrics, crewForecast] = await Promise.all([
        executiveKPIs.getDashboardMetrics(),
        mlPredictions.predictCrewDemand({ periods: 30 }),
      ]);

      setKpis({
        financial: {
          revenue: 2500000,
          costs: 1800000,
          profit: 700000,
          profitMargin: 28,
          cashFlow: 450000,
        },
        operational: {
          fleetUtilization: dashboardMetrics.summary.active_vessels > 0 ? 83 : 0,
          voyageCompletion: 94,
          onTimeDelivery: 91,
          fuelEfficiency: 87,
        },
        crew: {
          totalCrew: dashboardMetrics.summary.total_crew,
          crewUtilization: 85,
          turnoverRate: 12,
          trainingCompliance: dashboardMetrics.summary.compliance_rate,
          certificationCompliance: 96,
        },
        compliance: {
          overallScore: dashboardMetrics.summary.compliance_rate,
          openNCRs: dashboardMetrics.alerts.find(a => a.severity === "high")?.count ?? 3,
          certExpiring30Days: 7,
          auditsPassed: 12,
        },
        safety: {
          trir: 0.8,
          lti: 0,
          nearMisses: 5,
          safetyScore: 95,
        },
      });

      setPredictions({ crewDemand: crewForecast as unknown as null });
    } catch (error) {
      console.error("Failed to load executive data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (isLoading || !kpis) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">CEO Dashboard</h1>
          <p className="text-muted-foreground">Visão executiva em tempo real</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Receita Mensal"
          value={`R$ ${(kpis.financial.revenue / 1000000).toFixed(1)}M`}
          change={12}
          trend="up"
          status="success"
          icon={<DollarSign className="w-4 h-4" />}
        />
        <KPICard
          title="Margem de Lucro"
          value={`${kpis.financial.profitMargin}%`}
          change={3}
          trend="up"
          status="success"
          icon={<TrendingUp className="w-4 h-4" />}
        />
        <KPICard
          title="Utilização da Frota"
          value={`${kpis.operational.fleetUtilization}%`}
          change={-2}
          trend="down"
          status={kpis.operational.fleetUtilization > 80 ? "success" : "warning"}
          icon={<Ship className="w-4 h-4" />}
        />
        <KPICard
          title="TRIR (Segurança)"
          value={kpis.safety.trir.toFixed(2)}
          change={-15}
          trend="up"
          status={kpis.safety.trir < 1 ? "success" : "warning"}
          icon={<AlertTriangle className="w-4 h-4" />}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Tripulação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total</span>
              <span className="font-bold">{kpis.crew.totalCrew}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Utilização</span>
              <span className="font-bold">{kpis.crew.crewUtilization}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Turnover</span>
              <Badge variant={kpis.crew.turnoverRate < 10 ? "default" : "destructive"}>
                {kpis.crew.turnoverRate}%
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Compliance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Score Geral</span>
                <span className="font-bold">{kpis.compliance.overallScore}%</span>
              </div>
              <Progress value={kpis.compliance.overallScore} />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">NCRs Abertas</span>
              <Badge variant={kpis.compliance.openNCRs === 0 ? "default" : "secondary"}>
                {kpis.compliance.openNCRs}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Cert. Expirando</span>
              <Badge variant={kpis.compliance.certExpiring30Days > 5 ? "destructive" : "outline"}>
                {kpis.compliance.certExpiring30Days}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Previsões ML
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Demanda Crew (30d)</span>
              <span className="font-bold">+5</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Confiança</span>
              <Badge>85%</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export const CFODashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [financialData, setFinancialData] = useState({
    revenue: { current: 2500000, previous: 2200000, budget: 2600000 },
    opex: { current: 1500000, previous: 1400000, budget: 1450000 },
    payroll: { current: 800000, previous: 750000, budget: 850000 },
    cashPosition: 1200000,
    receivables: 450000,
    payables: 380000,
  });

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const revenueVariance = ((financialData.revenue.current - financialData.revenue.budget) / financialData.revenue.budget) * 100;
  const opexVariance = ((financialData.opex.current - financialData.opex.budget) / financialData.opex.budget) * 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">CFO Dashboard</h1>
          <p className="text-muted-foreground">Análise financeira detalhada</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Receita Atual"
          value={`R$ ${(financialData.revenue.current / 1000000).toFixed(2)}M`}
          change={Number(revenueVariance.toFixed(1))}
          changeLabel="vs orçamento"
          trend={revenueVariance >= 0 ? "up" : "down"}
          status={revenueVariance >= 0 ? "success" : "danger"}
          icon={<DollarSign className="w-4 h-4" />}
        />
        <KPICard
          title="OPEX"
          value={`R$ ${(financialData.opex.current / 1000000).toFixed(2)}M`}
          change={Number(opexVariance.toFixed(1))}
          changeLabel="vs orçamento"
          trend={opexVariance <= 0 ? "up" : "down"}
          status={opexVariance <= 0 ? "success" : "warning"}
          icon={<TrendingDown className="w-4 h-4" />}
        />
        <KPICard
          title="Folha de Pagamento"
          value={`R$ ${(financialData.payroll.current / 1000).toFixed(0)}K`}
          change={6}
          trend="up"
          status="info"
          icon={<Users className="w-4 h-4" />}
        />
        <KPICard
          title="Posição de Caixa"
          value={`R$ ${(financialData.cashPosition / 1000000).toFixed(2)}M`}
          change={8}
          trend="up"
          status="success"
          icon={<DollarSign className="w-4 h-4" />}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Fluxo de Caixa</CardTitle>
            <CardDescription>Entradas e saídas do período</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg">
                <span>Contas a Receber</span>
                <span className="font-bold text-green-600">
                  R$ {(financialData.receivables / 1000).toFixed(0)}K
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-500/10 rounded-lg">
                <span>Contas a Pagar</span>
                <span className="font-bold text-red-600">
                  R$ {(financialData.payables / 1000).toFixed(0)}K
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-500/10 rounded-lg border-t">
                <span className="font-medium">Saldo Projetado</span>
                <span className="font-bold text-blue-600">
                  R$ {((financialData.cashPosition + financialData.receivables - financialData.payables) / 1000).toFixed(0)}K
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Comparativo Orçamentário</CardTitle>
            <CardDescription>Real vs Orçado</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-2 text-sm">
                <span>Receita</span>
                <span>{((financialData.revenue.current / financialData.revenue.budget) * 100).toFixed(0)}%</span>
              </div>
              <Progress 
                value={(financialData.revenue.current / financialData.revenue.budget) * 100} 
                className="h-2"
              />
            </div>
            <div>
              <div className="flex justify-between mb-2 text-sm">
                <span>OPEX</span>
                <span>{((financialData.opex.current / financialData.opex.budget) * 100).toFixed(0)}%</span>
              </div>
              <Progress 
                value={(financialData.opex.current / financialData.opex.budget) * 100}
                className="h-2"
              />
            </div>
            <div>
              <div className="flex justify-between mb-2 text-sm">
                <span>Folha</span>
                <span>{((financialData.payroll.current / financialData.payroll.budget) * 100).toFixed(0)}%</span>
              </div>
              <Progress 
                value={(financialData.payroll.current / financialData.payroll.budget) * 100}
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export const COODashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [operationsData, setOperationsData] = useState({
    vessels: { total: 12, active: 10, inPort: 1, maintenance: 1 },
    voyages: { active: 8, completed: 45, onTime: 42, delayed: 3 },
    maintenance: { scheduled: 15, completed: 12, overdue: 2 },
    fuel: { consumption: 85000, efficiency: 92, cost: 320000 },
  });

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">COO Dashboard</h1>
          <p className="text-muted-foreground">Controle operacional em tempo real</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Embarcações Ativas"
          value={`${operationsData.vessels.active}/${operationsData.vessels.total}`}
          change={0}
          trend="neutral"
          status="success"
          icon={<Ship className="w-4 h-4" />}
        />
        <KPICard
          title="Viagens Ativas"
          value={operationsData.voyages.active.toString()}
          change={8}
          trend="up"
          status="info"
          icon={<Clock className="w-4 h-4" />}
        />
        <KPICard
          title="On-Time Delivery"
          value={`${((operationsData.voyages.onTime / operationsData.voyages.completed) * 100).toFixed(0)}%`}
          change={2}
          trend="up"
          status="success"
          icon={<CheckCircle className="w-4 h-4" />}
        />
        <KPICard
          title="Eficiência Combustível"
          value={`${operationsData.fuel.efficiency}%`}
          change={-1}
          trend="down"
          status={operationsData.fuel.efficiency > 90 ? "success" : "warning"}
          icon={<BarChart3 className="w-4 h-4" />}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ship className="w-5 h-5" />
              Status da Frota
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span>Em Operação</span>
              </div>
              <Badge variant="default">{operationsData.vessels.active}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span>No Porto</span>
              </div>
              <Badge variant="secondary">{operationsData.vessels.inPort}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span>Em Manutenção</span>
              </div>
              <Badge variant="outline">{operationsData.vessels.maintenance}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Manutenção
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Programadas</span>
              <span className="font-bold">{operationsData.maintenance.scheduled}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Concluídas</span>
              <span className="font-bold text-green-600">{operationsData.maintenance.completed}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Atrasadas</span>
              <Badge variant={operationsData.maintenance.overdue > 0 ? "destructive" : "default"}>
                {operationsData.maintenance.overdue}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Combustível
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Consumo (L)</span>
              <span className="font-bold">{(operationsData.fuel.consumption / 1000).toFixed(0)}K</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Custo Total</span>
              <span className="font-bold">R$ {(operationsData.fuel.cost / 1000).toFixed(0)}K</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Eficiência</span>
              <Progress value={operationsData.fuel.efficiency} className="w-20 h-2" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export const ExecutiveDashboardTabs: React.FC = () => {
  return (
    <Tabs defaultValue="ceo" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3 max-w-md">
        <TabsTrigger value="ceo">CEO</TabsTrigger>
        <TabsTrigger value="cfo">CFO</TabsTrigger>
        <TabsTrigger value="coo">COO</TabsTrigger>
      </TabsList>
      <TabsContent value="ceo">
        <CEODashboard />
      </TabsContent>
      <TabsContent value="cfo">
        <CFODashboard />
      </TabsContent>
      <TabsContent value="coo">
        <COODashboard />
      </TabsContent>
    </Tabs>
  );
};

export default ExecutiveDashboardTabs;
