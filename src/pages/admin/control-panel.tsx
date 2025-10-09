import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MultiTenantWrapper } from '@/components/layout/multi-tenant-wrapper';
import { ModulePageWrapper } from '@/components/ui/module-page-wrapper';
import { ModuleHeader } from '@/components/ui/module-header';
import { RoleBasedAccess } from '@/components/auth/role-based-access';
import { ModuleList } from '@/components/admin/ModuleList';
import { APIStatus } from '@/components/admin/APIStatus';
import { SystemInfo } from '@/components/admin/SystemInfo';
import { 
  Settings,
  Activity,
  Layers,
  Zap,
  Users,
  Shield,
  AlertCircle,
  CheckCircle,
  BarChart3,
  ExternalLink,
  Terminal,
  FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePermissions } from '@/hooks/use-permissions';

const ControlPanel = () => {
  const { userRole, isLoading } = usePermissions();
  const [activeTab, setActiveTab] = useState('overview');

  if (isLoading) {
    return (
      <MultiTenantWrapper>
        <ModulePageWrapper gradient="purple">
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </ModulePageWrapper>
      </MultiTenantWrapper>
    );
  }

  return (
    <RoleBasedAccess roles={['admin', 'hr_manager']}>
      <MultiTenantWrapper>
        <ModulePageWrapper gradient="purple">
          <ModuleHeader
            icon={Settings}
            title="Control Panel"
            description="Painel central de gerenciamento e monitoramento do Nautilus One"
            gradient="purple"
            badges={[
              { icon: Activity, label: 'Sistema Ativo' },
              { icon: Shield, label: userRole === 'admin' ? 'Admin' : 'Gerente' },
              { icon: CheckCircle, label: '32 Módulos' }
            ]}
          />

          {/* Quick Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Módulos Ativos</p>
                    <p className="text-3xl font-bold text-success">20</p>
                  </div>
                  <CheckCircle className="h-10 w-10 text-success/50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Em Desenvolvimento</p>
                    <p className="text-3xl font-bold text-warning">12</p>
                  </div>
                  <AlertCircle className="h-10 w-10 text-warning/50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">APIs Conectadas</p>
                    <p className="text-3xl font-bold text-primary">7</p>
                  </div>
                  <Zap className="h-10 w-10 text-primary/50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-info/10 to-info/5 border-info/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Usuários Ativos</p>
                    <p className="text-3xl font-bold text-info">87</p>
                  </div>
                  <Users className="h-10 w-10 text-info/50" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden md:inline">Visão Geral</span>
                <span className="md:hidden">Visão</span>
              </TabsTrigger>
              <TabsTrigger value="modules" className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                <span className="hidden md:inline">Módulos</span>
                <span className="md:hidden">Módulos</span>
              </TabsTrigger>
              <TabsTrigger value="apis" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                <span className="hidden md:inline">APIs</span>
                <span className="md:hidden">APIs</span>
              </TabsTrigger>
              <TabsTrigger value="system" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                <span className="hidden md:inline">Sistema</span>
                <span className="md:hidden">Sistema</span>
              </TabsTrigger>
              <TabsTrigger value="tools" className="flex items-center gap-2">
                <Terminal className="h-4 w-4" />
                <span className="hidden md:inline">Ferramentas</span>
                <span className="md:hidden">Tools</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Status Geral do Sistema</CardTitle>
                    <CardDescription>Resumo executivo do Nautilus One</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-success/10 border border-success/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 bg-success rounded-full animate-pulse" />
                        <span className="font-medium">Sistema Operacional</span>
                      </div>
                      <Badge className="bg-success/20 text-success">100% Uptime</Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Módulos Funcionais</span>
                        <span className="font-medium">20/32 (62.5%)</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">APIs Conectadas</span>
                        <span className="font-medium">4/7 (57%)</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Performance</span>
                        <span className="font-medium text-success">Excelente</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Acesso Rápido</CardTitle>
                    <CardDescription>Links para áreas importantes</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Link to="/admin">
                      <Button variant="outline" className="w-full justify-between">
                        <span className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Painel Admin
                        </span>
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link to="/admin/api-tester">
                      <Button variant="outline" className="w-full justify-between">
                        <span className="flex items-center gap-2">
                          <Zap className="h-4 w-4" />
                          API Tester
                        </span>
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link to="/health-monitor">
                      <Button variant="outline" className="w-full justify-between">
                        <span className="flex items-center gap-2">
                          <Activity className="h-4 w-4" />
                          Monitor de Saúde
                        </span>
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link to="/settings">
                      <Button variant="outline" className="w-full justify-between">
                        <span className="flex items-center gap-2">
                          <Settings className="h-4 w-4" />
                          Configurações
                        </span>
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>

              <SystemInfo />
            </TabsContent>

            {/* Modules Tab */}
            <TabsContent value="modules">
              <ModuleList />
            </TabsContent>

            {/* APIs Tab */}
            <TabsContent value="apis">
              <APIStatus />
            </TabsContent>

            {/* System Tab */}
            <TabsContent value="system">
              <SystemInfo />
            </TabsContent>

            {/* Tools Tab */}
            <TabsContent value="tools" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Terminal className="h-5 w-5" />
                    Ferramentas de Desenvolvedor
                  </CardTitle>
                  <CardDescription>
                    Utilitários para desenvolvedores e administradores
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link to="/admin/api-tester">
                      <Card className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <Zap className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-semibold mb-1">API Tester</h4>
                              <p className="text-sm text-muted-foreground">
                                Testar todas as integrações de APIs externas
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>

                    <Link to="/health-monitor">
                      <Card className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-success">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-success/10 rounded-lg">
                              <Activity className="h-6 w-6 text-success" />
                            </div>
                            <div>
                              <h4 className="font-semibold mb-1">Health Monitor</h4>
                              <p className="text-sm text-muted-foreground">
                                Monitoramento detalhado de saúde do sistema
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>

                    <Card className="opacity-60 cursor-not-allowed">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-muted rounded-lg">
                            <FileText className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <div>
                            <h4 className="font-semibold mb-1 flex items-center gap-2">
                              System Logs
                              <Badge variant="outline">Em Breve</Badge>
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Visualizar logs do sistema em tempo real
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="opacity-60 cursor-not-allowed">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-muted rounded-lg">
                            <BarChart3 className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <div>
                            <h4 className="font-semibold mb-1 flex items-center gap-2">
                              Performance Analyzer
                              <Badge variant="outline">Em Breve</Badge>
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Análise profunda de performance
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="border-t pt-4 mt-4">
                    <h4 className="font-medium mb-3">Controles do Sistema</h4>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Activity className="h-4 w-4 mr-2" />
                        Rebuild Cache
                      </Button>
                      <Button variant="outline" size="sm">
                        <Shield className="h-4 w-4 mr-2" />
                        Clear Sessions
                      </Button>
                      <Button variant="outline" size="sm">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Export Metrics
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {userRole === 'admin' && (
                <Card className="border-warning bg-warning/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-warning">
                      <Shield className="h-5 w-5" />
                      Área Administrativa
                    </CardTitle>
                    <CardDescription>
                      Controles avançados disponíveis apenas para administradores
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground mb-3">
                        Como administrador, você tem acesso a funcionalidades avançadas de gerenciamento do sistema.
                      </p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Simular Login como Usuário
                        </Button>
                        <Button variant="outline" size="sm">
                          Gerenciar Permissões
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </ModulePageWrapper>
      </MultiTenantWrapper>
    </RoleBasedAccess>
  );
};

export default ControlPanel;
