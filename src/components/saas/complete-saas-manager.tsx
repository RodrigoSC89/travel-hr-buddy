import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Building2,
  Users,
  Crown,
  Settings,
  BarChart,
  DollarSign,
  Zap,
  Database,
  AlertTriangle,
  CheckCircle,
  UserPlus,
} from "lucide-react";

interface Tenant {
  id: string;
  name: string;
  domain: string;
  plan: "starter" | "professional" | "enterprise";
  users: number;
  maxUsers: number;
  status: "active" | "suspended" | "trial";
  created: string;
  revenue: number;
  storage: number;
  maxStorage: number;
}

export const CompleteSaaSManager: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([
    {
      id: "1",
      name: "Navegação Atlântica",
      domain: "atlantica.nautilus.app",
      plan: "enterprise",
      users: 247,
      maxUsers: 500,
      status: "active",
      created: "2024-01-15",
      revenue: 15999,
      storage: 850,
      maxStorage: 1000,
    },
    {
      id: "2",
      name: "Porto do Mar",
      domain: "portomar.nautilus.app",
      plan: "professional",
      users: 89,
      maxUsers: 100,
      status: "active",
      created: "2024-02-20",
      revenue: 2999,
      storage: 340,
      maxStorage: 500,
    },
    {
      id: "3",
      name: "Marinha Comercial",
      domain: "comercial.nautilus.app",
      plan: "starter",
      users: 25,
      maxUsers: 50,
      status: "trial",
      created: "2024-03-10",
      revenue: 0,
      storage: 85,
      maxStorage: 100,
    },
  ]);

  const [systemMetrics] = useState({
    totalTenants: 127,
    activeTenants: 115,
    totalUsers: 5847,
    monthlyRevenue: 245890,
    storageUsed: 67.5,
    avgResponseTime: 245,
  });

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "starter":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
      case "professional":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300";
      case "enterprise":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      case "trial":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
      case "suspended":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Crown className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-bold">SaaS Multi-Tenant Completo</h1>
          <Badge variant="secondary">Sistema Empresarial</Badge>
        </div>
        <p className="text-muted-foreground">
          Gestão completa de organizações, usuários e recursos multi-tenant
        </p>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Tenants</p>
                <p className="text-2xl font-bold">{systemMetrics.totalTenants}</p>
              </div>
              <Building2 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ativos</p>
                <p className="text-2xl font-bold">{systemMetrics.activeTenants}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Usuários</p>
                <p className="text-2xl font-bold">{systemMetrics.totalUsers.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Receita Mensal</p>
                <p className="text-2xl font-bold">
                  R${systemMetrics.monthlyRevenue.toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Armazenamento</p>
                <p className="text-2xl font-bold">{systemMetrics.storageUsed}%</p>
              </div>
              <Database className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Resposta</p>
                <p className="text-2xl font-bold">{systemMetrics.avgResponseTime}ms</p>
              </div>
              <Zap className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tenants" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="tenants">Organizações</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="billing">Faturamento</TabsTrigger>
          <TabsTrigger value="resources">Recursos</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoramento</TabsTrigger>
        </TabsList>

        <TabsContent value="tenants">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Organizações Ativas</h3>
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                Nova Organização
              </Button>
            </div>

            <div className="grid gap-4">
              {tenants.map(tenant => (
                <Card key={tenant.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={`/api/placeholder/avatar/${tenant.id}`} />
                          <AvatarFallback>
                            {tenant.name
                              .split(" ")
                              .map(n => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold text-lg">{tenant.name}</h4>
                          <p className="text-muted-foreground">{tenant.domain}</p>
                          <p className="text-sm text-muted-foreground">
                            Criado em {tenant.created}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getPlanColor(tenant.plan)}>
                          {tenant.plan.charAt(0).toUpperCase() + tenant.plan.slice(1)}
                        </Badge>
                        <Badge className={getStatusColor(tenant.status)}>
                          {tenant.status.charAt(0).toUpperCase() + tenant.status.slice(1)}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Usuários</p>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">
                            {tenant.users}/{tenant.maxUsers}
                          </span>
                          <Progress
                            value={(tenant.users / tenant.maxUsers) * 100}
                            className="flex-1"
                          />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Armazenamento</p>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">
                            {tenant.storage}/{tenant.maxStorage}GB
                          </span>
                          <Progress
                            value={(tenant.storage / tenant.maxStorage) * 100}
                            className="flex-1"
                          />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Receita Mensal</p>
                        <p className="font-semibold">R${tenant.revenue.toLocaleString()}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Settings className="w-4 h-4 mr-2" />
                          Configurar
                        </Button>
                        <Button variant="outline" size="sm">
                          <BarChart className="w-4 h-4 mr-2" />
                          Analytics
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Crescimento de Usuários</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  [Gráfico de crescimento de usuários ao longo do tempo]
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Planos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Enterprise</span>
                    <span className="font-semibold">45%</span>
                  </div>
                  <Progress value={45} />
                  <div className="flex justify-between items-center">
                    <span>Professional</span>
                    <span className="font-semibold">35%</span>
                  </div>
                  <Progress value={35} />
                  <div className="flex justify-between items-center">
                    <span>Starter</span>
                    <span className="font-semibold">20%</span>
                  </div>
                  <Progress value={20} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Faturamento e Cobrança</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Receita Este Mês</h4>
                    <p className="text-2xl font-bold text-green-600">R$245.890</p>
                    <p className="text-sm text-muted-foreground">+12% vs mês anterior</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Faturas Pendentes</h4>
                    <p className="text-2xl font-bold text-yellow-600">R$34.250</p>
                    <p className="text-sm text-muted-foreground">7 organizações</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Churn Rate</h4>
                    <p className="text-2xl font-bold text-red-600">2.3%</p>
                    <p className="text-sm text-muted-foreground">-0.5% vs mês anterior</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources">
          <Card>
            <CardHeader>
              <CardTitle>Uso de Recursos do Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>CPU</span>
                      <span>67%</span>
                    </div>
                    <Progress value={67} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Memória</span>
                      <span>45%</span>
                    </div>
                    <Progress value={45} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Armazenamento</span>
                      <span>78%</span>
                    </div>
                    <Progress value={78} />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Bandwidth</span>
                      <span>234 GB</span>
                    </div>
                    <Progress value={60} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Requisições/min</span>
                      <span>1,247</span>
                    </div>
                    <Progress value={85} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Uptime</span>
                      <span>99.9%</span>
                    </div>
                    <Progress value={99.9} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  Alertas do Sistema
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                    <div>
                      <p className="font-medium">Alto uso de CPU</p>
                      <p className="text-sm text-muted-foreground">
                        Servidor principal acima de 80%
                      </p>
                    </div>
                    <Badge variant="secondary">Moderado</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg bg-red-50 dark:bg-red-900/20">
                    <div>
                      <p className="font-medium">Falha na replicação</p>
                      <p className="text-sm text-muted-foreground">Backup automático falhou</p>
                    </div>
                    <Badge variant="destructive">Crítico</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status dos Serviços</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>API Gateway</span>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                      Online
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Database</span>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                      Online
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Storage</span>
                    <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
                      Degradado
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Email Service</span>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                      Online
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
