import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2,
  Users,
  BarChart3,
  Crown,
  Zap,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  DollarSign,
  Calendar,
  Settings,
  Globe,
  Shield,
  Smartphone
} from 'lucide-react';
import { useTenant } from '@/contexts/TenantContext';
import { TenantSwitcher } from './tenant-switcher';
import { WhiteLabelCustomizer } from './white-label-customizer';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const SaaSDashboard: React.FC = () => {
  const { 
    currentTenant, 
    currentBranding, 
    currentUser,
    tenantUsage,
    tenantPlans,
    formatCurrency,
    formatDate,
    checkUsageLimits 
  } = useTenant();

  // Dados simulados para gráficos
  const usageData = [
    { date: '01/01', users: 8, api_calls: 120, storage: 1.2 },
    { date: '02/01', users: 12, api_calls: 180, storage: 1.4 },
    { date: '03/01', users: 15, api_calls: 240, storage: 1.8 },
    { date: '04/01', users: 18, api_calls: 320, storage: 2.1 },
    { date: '05/01', users: 22, api_calls: 450, storage: 2.3 },
  ];

  const planStats = {
    current: tenantPlans.find(p => p.slug === currentTenant?.plan_type),
    usage_percentage: {
      users: tenantUsage ? (tenantUsage.active_users / (currentTenant?.max_users || 1)) * 100 : 0,
      storage: tenantUsage ? (tenantUsage.storage_used_gb / (currentTenant?.max_storage_gb || 1)) * 100 : 0,
      api_calls: tenantUsage ? (tenantUsage.api_calls_made / (currentTenant?.max_api_calls_per_month || 1)) * 100 : 0
    }
  };

  if (!currentTenant) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <Building2 className="h-12 w-12 mx-auto text-muted-foreground" />
          <div>
            <h3 className="text-lg font-semibold">Nenhuma organização selecionada</h3>
            <p className="text-muted-foreground">Selecione uma organização para começar</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Building2 className="h-8 w-8" />
            {currentBranding?.company_name || currentTenant.name}
          </h1>
          <p className="text-muted-foreground">
            Plataforma SaaS Multicliente - {currentUser?.role} • Plano {currentTenant.plan_type}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="flex items-center gap-1">
            <Globe className="h-3 w-3" />
            {currentTenant.subdomain}.nautilus.app
          </Badge>
          <TenantSwitcher />
        </div>
      </div>

      {/* Visão Geral - Cards Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Usuários Ativos</p>
                <p className="text-2xl font-bold">{tenantUsage?.active_users || 0}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600">+12% este mês</span>
                </div>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <div className="mt-4">
              <Progress 
                value={planStats.usage_percentage.users} 
                className="h-2" 
              />
              <p className="text-xs text-muted-foreground mt-1">
                {tenantUsage?.active_users} de {currentTenant.max_users} usuários
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Armazenamento</p>
                <p className="text-2xl font-bold">{tenantUsage?.storage_used_gb || 0}GB</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-4 h-4 text-orange-600" />
                  <span className="text-sm text-orange-600">+5% este mês</span>
                </div>
              </div>
              <BarChart3 className="w-8 h-8 text-orange-600" />
            </div>
            <div className="mt-4">
              <Progress 
                value={planStats.usage_percentage.storage} 
                className="h-2" 
              />
              <p className="text-xs text-muted-foreground mt-1">
                {tenantUsage?.storage_used_gb}GB de {currentTenant.max_storage_gb}GB
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Chamadas API</p>
                <p className="text-2xl font-bold">{tenantUsage?.api_calls_made || 0}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                  <span className="text-sm text-purple-600">+23% este mês</span>
                </div>
              </div>
              <Zap className="w-8 h-8 text-purple-600" />
            </div>
            <div className="mt-4">
              <Progress 
                value={planStats.usage_percentage.api_calls} 
                className="h-2" 
              />
              <p className="text-xs text-muted-foreground mt-1">
                {tenantUsage?.api_calls_made} de {currentTenant.max_api_calls_per_month} chamadas
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Plano Atual</p>
                <p className="text-2xl font-bold capitalize">{currentTenant.plan_type}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Crown className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm text-yellow-600">
                    {formatCurrency(planStats.current?.price_monthly || 0)}/mês
                  </span>
                </div>
              </div>
              <Crown className="w-8 h-8 text-yellow-600" />
            </div>
            <div className="mt-4">
              <Button variant="outline" size="sm" className="w-full">
                <Settings className="w-4 h-4 mr-2" />
                Gerenciar Plano
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas e Status */}
      {(planStats.usage_percentage.users > 80 || 
        planStats.usage_percentage.storage > 80 || 
        planStats.usage_percentage.api_calls > 80) && (
        <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <div>
                <h4 className="font-medium text-orange-800 dark:text-orange-200">
                  Atenção aos Limites do Plano
                </h4>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  Alguns recursos estão próximos do limite. Considere fazer upgrade do seu plano.
                </p>
              </div>
              <Button variant="outline" size="sm" className="ml-auto">
                Ver Upgrade
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="analytics" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="customization">Personalização</TabsTrigger>
          <TabsTrigger value="billing">Faturamento</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Uso ao Longo do Tempo</CardTitle>
                <CardDescription>Usuários ativos nos últimos 5 dias</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={usageData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="users" 
                      stroke="#2563eb" 
                      fill="#2563eb" 
                      fillOpacity={0.6}
                      name="Usuários"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Chamadas de API</CardTitle>
                <CardDescription>Volume de requisições diárias</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={usageData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="api_calls" 
                      stroke="#7c3aed" 
                      strokeWidth={2}
                      name="API Calls"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Módulos Mais Usados</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">PEOTRAM</span>
                  <Badge variant="secondary">45%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Fleet Management</span>
                  <Badge variant="secondary">32%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Analytics</span>
                  <Badge variant="secondary">23%</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Devices</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    <span className="text-sm">Mobile</span>
                  </div>
                  <Badge variant="outline">68%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    <span className="text-sm">Desktop</span>
                  </div>
                  <Badge variant="outline">32%</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Status Geral</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Sistema Online</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Backup Ativo</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span className="text-sm">SSL Válido</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customization">
          <WhiteLabelCustomizer />
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Plano Atual
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold capitalize">
                      Plano {currentTenant.plan_type}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Faturamento {currentTenant.billing_cycle === 'monthly' ? 'mensal' : 'anual'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">
                      {formatCurrency(planStats.current?.price_monthly || 0)}
                    </p>
                    <p className="text-sm text-muted-foreground">/mês</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Próxima cobrança</span>
                    <span>{formatDate(currentTenant.subscription_ends_at || new Date().toISOString())}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Método de pagamento</span>
                    <span>•••• 4532</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    Alterar Plano
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Histórico
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Planos Disponíveis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {tenantPlans.slice(0, 3).map((plan) => (
                  <div 
                    key={plan.id}
                    className={`p-3 border rounded-lg ${
                      plan.slug === currentTenant.plan_type 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{plan.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {plan.max_users} usuários • {plan.max_storage_gb}GB
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(plan.price_monthly)}</p>
                        <p className="text-xs text-muted-foreground">/mês</p>
                      </div>
                    </div>
                    {plan.slug !== currentTenant.plan_type && (
                      <Button variant="outline" size="sm" className="w-full mt-2">
                        Fazer Upgrade
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Status de Segurança
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">SSL Ativo</span>
                  </div>
                  <Badge variant="secondary">Ativo</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">2FA Disponível</span>
                  </div>
                  <Badge variant="secondary">Configurado</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Backup Diário</span>
                  </div>
                  <Badge variant="secondary">Ativo</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <span className="text-sm">Auditoria de Logs</span>
                  </div>
                  <Badge variant="outline">Configurar</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Atividade Recente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-green-600 rounded-full" />
                  <span>Login de {currentUser?.display_name}</span>
                  <span className="text-muted-foreground ml-auto">2h</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-blue-600 rounded-full" />
                  <span>Branding atualizado</span>
                  <span className="text-muted-foreground ml-auto">5h</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-purple-600 rounded-full" />
                  <span>Usuário convidado</span>
                  <span className="text-muted-foreground ml-auto">1d</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-orange-600 rounded-full" />
                  <span>Backup realizado</span>
                  <span className="text-muted-foreground ml-auto">1d</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};