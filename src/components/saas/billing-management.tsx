import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  CreditCard,
  Download,
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Ship,
  Database,
} from "lucide-react";
import { useTenant } from "@/contexts/TenantContext";

interface Invoice {
  id: string;
  number: string;
  date: string;
  due_date: string;
  amount: number;
  status: "paid" | "pending" | "overdue";
  download_url?: string;
}

interface UsageMetric {
  name: string;
  current: number;
  limit: number;
  unit: string;
  icon: React.ComponentType<any>;
}

const mockInvoices: Invoice[] = [
  {
    id: "1",
    number: "INV-2024-001",
    date: "2024-01-01",
    due_date: "2024-01-15",
    amount: 299.0,
    status: "paid",
  },
  {
    id: "2",
    number: "INV-2024-002",
    date: "2024-02-01",
    due_date: "2024-02-15",
    amount: 299.0,
    status: "paid",
  },
  {
    id: "3",
    number: "INV-2024-003",
    date: "2024-03-01",
    due_date: "2024-03-15",
    amount: 299.0,
    status: "pending",
  },
];

export const BillingManagement: React.FC = () => {
  const { currentTenant, tenantUsage, tenantPlans } = useTenant();
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false);

  if (!currentTenant) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Nenhum tenant selecionado</p>
        </CardContent>
      </Card>
    );
  }

  const currentPlan = tenantPlans.find(plan => plan.slug === currentTenant.plan_type);

  const usageMetrics: UsageMetric[] = [
    {
      name: "Usuários",
      current: tenantUsage?.active_users || 0,
      limit: currentTenant.max_users,
      unit: "usuários",
      icon: Users,
    },
    {
      name: "Embarcações",
      current: 3,
      limit: currentTenant.max_vessels,
      unit: "embarcações",
      icon: Ship,
    },
    {
      name: "Armazenamento",
      current: tenantUsage?.storage_used_gb || 0,
      limit: currentTenant.max_storage_gb,
      unit: "GB",
      icon: Database,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "paid":
        return "Pago";
      case "pending":
        return "Pendente";
      case "overdue":
        return "Vencido";
      default:
        return status;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);
  };

  const getUsagePercentage = (current: number, limit: number) => {
    return Math.min((current / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="space-y-6">
      {/* Current Plan Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Plano Atual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-bold">{currentPlan?.name}</h3>
                {currentPlan?.is_popular && <Badge variant="secondary">Popular</Badge>}
              </div>
              <p className="text-muted-foreground">{currentPlan?.description}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Próxima cobrança: 15 de Março, 2024</span>
              </div>
            </div>
            <div className="text-right space-y-2">
              <div className="text-3xl font-bold">
                {formatCurrency(currentPlan?.price_monthly || 0)}
              </div>
              <div className="text-sm text-muted-foreground">/mês</div>
              <Button onClick={() => setIsUpgradeDialogOpen(true)}>Alterar Plano</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Uso Atual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {usageMetrics.map(metric => {
              const percentage = getUsagePercentage(metric.current, metric.limit);
              const Icon = metric.icon;

              return (
                <div key={metric.name} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{metric.name}</span>
                    </div>
                    {percentage >= 80 && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>
                        {metric.current} {metric.unit}
                      </span>
                      <span className="text-muted-foreground">
                        de {metric.limit} {metric.unit}
                      </span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                    <div className="text-xs text-muted-foreground">
                      {percentage.toFixed(1)}% utilizado
                    </div>
                  </div>

                  {percentage >= 90 && (
                    <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                      Limite quase atingido. Considere fazer upgrade.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Billing Tabs */}
      <Tabs defaultValue="invoices" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="invoices">Faturas</TabsTrigger>
          <TabsTrigger value="payment">Métodos de Pagamento</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle>Faturas Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockInvoices.map(invoice => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.number}</TableCell>
                      <TableCell>{new Date(invoice.date).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell>
                        {new Date(invoice.due_date).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(invoice.status)}>
                          {getStatusLabel(invoice.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>Métodos de Pagamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <p className="font-medium">•••• •••• •••• 4242</p>
                      <p className="text-sm text-muted-foreground">Visa terminado em 4242</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Principal</Badge>
                    <Button variant="ghost" size="sm">
                      Editar
                    </Button>
                  </div>
                </div>

                <Button variant="outline" className="w-full">
                  + Adicionar Método de Pagamento
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Billing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Calendar className="h-5 w-5 text-green-500" />
                  <div className="flex-1">
                    <p className="font-medium">Upgrade para Professional</p>
                    <p className="text-sm text-muted-foreground">15 de Janeiro, 2024</p>
                  </div>
                  <Badge variant="secondary">Ativo</Badge>
                </div>

                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div className="flex-1">
                    <p className="font-medium">Pagamento processado</p>
                    <p className="text-sm text-muted-foreground">1 de Janeiro, 2024</p>
                  </div>
                  <span className="text-sm font-medium">{formatCurrency(299)}</span>
                </div>

                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Clock className="h-5 w-5 text-blue-500" />
                  <div className="flex-1">
                    <p className="font-medium">Conta criada</p>
                    <p className="text-sm text-muted-foreground">15 de Dezembro, 2023</p>
                  </div>
                  <Badge variant="outline">Inicial</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Upgrade Dialog */}
      <Dialog open={isUpgradeDialogOpen} onOpenChange={setIsUpgradeDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Alterar Plano</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            {tenantPlans.map(plan => (
              <Card
                key={plan.id}
                className={`cursor-pointer transition-colors ${
                  plan.slug === currentTenant.plan_type
                    ? "ring-2 ring-primary"
                    : "hover:bg-muted/50"
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold">{plan.name}</h3>
                        {plan.is_popular && <Badge variant="secondary">Popular</Badge>}
                        {plan.slug === currentTenant.plan_type && <Badge>Atual</Badge>}
                      </div>
                      <p className="text-muted-foreground">{plan.description}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>👥 {plan.max_users} usuários</span>
                        <span>🚢 {plan.max_vessels} embarcações</span>
                        <span>💾 {plan.max_storage_gb}GB storage</span>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <div className="text-3xl font-bold">{formatCurrency(plan.price_monthly)}</div>
                      <div className="text-sm text-muted-foreground">/mês</div>
                      {plan.slug !== currentTenant.plan_type && (
                        <Button>
                          {plan.price_monthly > (currentPlan?.price_monthly || 0)
                            ? "Upgrade"
                            : "Downgrade"}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
