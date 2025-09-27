import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Monitor, 
  Globe, 
  Rocket, 
  Users, 
  Activity, 
  CheckCircle, 
  AlertTriangle,
  Server,
  Database,
  Wifi,
  Zap,
  Shield,
  BarChart3,
  Settings,
  Play,
  User
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SystemMetrics {
  uptime: number;
  responseTime: number;
  activeUsers: number;
  databaseStatus: 'healthy' | 'warning' | 'critical';
  apiStatus: 'online' | 'offline' | 'degraded';
  memoryUsage: number;
  cpuUsage: number;
}

interface DeploymentConfig {
  domain: string;
  subdomain: string;
  sslEnabled: boolean;
  cdnEnabled: boolean;
  environment: 'staging' | 'production';
  monitoringEnabled: boolean;
}

const ProductionDeployCenter: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    uptime: 99.9,
    responseTime: 245,
    activeUsers: 12,
    databaseStatus: 'healthy',
    apiStatus: 'online',
    memoryUsage: 45,
    cpuUsage: 23
  });

  const [deployConfig, setDeployConfig] = useState<DeploymentConfig>({
    domain: '',
    subdomain: 'nautilus',
    sslEnabled: true,
    cdnEnabled: true,
    environment: 'production',
    monitoringEnabled: true
  });

  const [isDeploying, setIsDeploying] = useState(false);
  const [deployProgress, setDeployProgress] = useState(0);
  const [isLive, setIsLive] = useState(false);

  // Simular métricas em tempo real
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        responseTime: 200 + Math.random() * 100,
        activeUsers: 8 + Math.floor(Math.random() * 20),
        memoryUsage: 40 + Math.random() * 20,
        cpuUsage: 15 + Math.random() * 25
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleDeploy = async () => {
    setIsDeploying(true);
    setDeployProgress(0);

    try {
      // Simular processo de deploy
      const steps = [
        'Preparando ambiente de produção...',
        'Configurando domínio e SSL...',
        'Otimizando assets...',
        'Configurando CDN...',
        'Ativando monitoramento...',
        'Executando testes finais...',
        'Publicando aplicação...',
        'Verificando saúde do sistema...'
      ];

      for (let i = 0; i < steps.length; i++) {
        toast.info(steps[i]);
        setDeployProgress(((i + 1) / steps.length) * 100);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      setIsLive(true);
      toast.success('🚀 Deploy concluído! Sistema Nautilus One está live em produção!');
      
    } catch (error) {
      toast.error('Erro durante o deploy');
    } finally {
      setIsDeploying(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'warning':
      case 'degraded':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical':
      case 'offline':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
      case 'degraded':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header de Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Monitor className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Uptime</p>
                <p className="text-2xl font-bold text-green-600">{metrics.uptime}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Resposta</p>
                <p className="text-2xl font-bold">{Math.round(metrics.responseTime)}ms</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Usuários Ativos</p>
                <p className="text-2xl font-bold">{metrics.activeUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Rocket className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Status Deploy</p>
                <p className="text-lg font-bold">
                  {isLive ? (
                    <span className="text-green-600">🟢 LIVE</span>
                  ) : (
                    <span className="text-yellow-600">🟡 STAGING</span>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="monitoring" className="space-y-4">
        <TabsList>
          <TabsTrigger value="monitoring">Monitoramento</TabsTrigger>
          <TabsTrigger value="domain">Configuração Domínio</TabsTrigger>
          <TabsTrigger value="deploy">Deploy Produção</TabsTrigger>
          <TabsTrigger value="go-live">Go-to-Market</TabsTrigger>
        </TabsList>

        <TabsContent value="monitoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monitoramento em Tempo Real</CardTitle>
              <CardDescription>
                Métricas de performance e saúde do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Status dos Serviços */}
                <div className="space-y-4">
                  <h4 className="font-medium">Status dos Serviços</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Database className="w-4 h-4" />
                        <span className="text-sm">Base de Dados</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(metrics.databaseStatus)}
                        <Badge className={getStatusColor(metrics.databaseStatus)}>
                          {metrics.databaseStatus.toUpperCase()}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Server className="w-4 h-4" />
                        <span className="text-sm">API Services</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(metrics.apiStatus)}
                        <Badge className={getStatusColor(metrics.apiStatus)}>
                          {metrics.apiStatus.toUpperCase()}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Wifi className="w-4 h-4" />
                        <span className="text-sm">CDN Global</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <Badge className="text-green-600 bg-green-50 border-green-200">
                          ONLINE
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Métricas de Performance */}
                <div className="space-y-4">
                  <h4 className="font-medium">Performance do Sistema</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Uso de Memória</span>
                        <span className="text-sm text-muted-foreground">{Math.round(metrics.memoryUsage)}%</span>
                      </div>
                      <Progress value={metrics.memoryUsage} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Uso de CPU</span>
                        <span className="text-sm text-muted-foreground">{Math.round(metrics.cpuUsage)}%</span>
                      </div>
                      <Progress value={metrics.cpuUsage} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Conectividade</span>
                        <span className="text-sm text-muted-foreground">100%</span>
                      </div>
                      <Progress value={100} className="h-2" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Alertas e Notificações */}
              <div className="mt-6">
                <h4 className="font-medium mb-3">Alertas Recentes</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <div>
                      <p className="text-sm font-medium text-green-800">Sistema operando normalmente</p>
                      <p className="text-xs text-green-600">Todos os serviços estão funcionando perfeitamente</p>
                    </div>
                    <span className="text-xs text-green-500 ml-auto">2 min atrás</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="domain" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuração de Domínio</CardTitle>
              <CardDescription>
                Configure seu domínio personalizado para produção
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="domain">Domínio Principal</Label>
                    <Input
                      id="domain"
                      placeholder="exemplo.com.br"
                      value={deployConfig.domain}
                      onChange={(e) => setDeployConfig(prev => ({ ...prev, domain: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="subdomain">Subdomínio</Label>
                    <Input
                      id="subdomain"
                      placeholder="nautilus"
                      value={deployConfig.subdomain}
                      onChange={(e) => setDeployConfig(prev => ({ ...prev, subdomain: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">SSL/HTTPS</span>
                      <Badge className="text-green-600 bg-green-50 border-green-200">
                        Ativo
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">CDN Global</span>
                      <Badge className="text-blue-600 bg-blue-50 border-blue-200">
                        Configurado
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Preview do Domínio</h4>
                  <div className="p-4 border rounded-lg bg-secondary/50">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-primary" />
                        <span className="font-mono text-sm">
                          {deployConfig.domain ? 
                            `https://${deployConfig.subdomain}.${deployConfig.domain}` :
                            'https://nautilus.exemplo.com.br'
                          }
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        URL principal da aplicação
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h5 className="font-medium text-sm mb-2">Configurações DNS</h5>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p>Tipo: CNAME</p>
                      <p>Nome: {deployConfig.subdomain}</p>
                      <p>Valor: nautilus-one.vercel.app</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Aplicar Configurações
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deploy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Deploy para Produção</CardTitle>
              <CardDescription>
                Publicar o sistema Nautilus One em ambiente de produção
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!isLive ? (
                <div className="space-y-6">
                  {isDeploying && (
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="font-medium">Deploy em andamento...</span>
                        <span>{Math.round(deployProgress)}%</span>
                      </div>
                      <Progress value={deployProgress} className="h-3" />
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium">Checklist Pré-Deploy</h4>
                      <div className="space-y-2">
                        {[
                          'Auditoria técnica aprovada',
                          'Testes de homologação concluídos',
                          'Configurações de segurança validadas',
                          'Domínio configurado',
                          'SSL ativo',
                          'Monitoramento configurado'
                        ].map((item, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium">Configurações do Deploy</h4>
                      <div className="space-y-3">
                        <div className="p-3 border rounded-lg">
                          <h5 className="font-medium text-sm">Ambiente</h5>
                          <p className="text-xs text-muted-foreground">Produção</p>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <h5 className="font-medium text-sm">Região</h5>
                          <p className="text-xs text-muted-foreground">São Paulo, Brasil</p>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <h5 className="font-medium text-sm">CDN</h5>
                          <p className="text-xs text-muted-foreground">Global (200+ locais)</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <Button 
                      size="lg"
                      onClick={handleDeploy}
                      disabled={isDeploying}
                      className="flex items-center gap-2"
                    >
                      {isDeploying ? (
                        <>
                          <Activity className="w-5 h-5 animate-spin" />
                          Fazendo Deploy...
                        </>
                      ) : (
                        <>
                          <Rocket className="w-5 h-5" />
                          Fazer Deploy para Produção
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-6">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full">
                    <Rocket className="w-10 h-10 text-green-600" />
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-bold text-green-800 mb-2">
                      🚀 Deploy Concluído com Sucesso!
                    </h3>
                    <p className="text-green-600">
                      O sistema Nautilus One está agora rodando em produção
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                      <h4 className="font-medium text-green-800">URL de Produção</h4>
                      <p className="text-sm text-green-600 font-mono">
                        https://nautilus.exemplo.com.br
                      </p>
                    </div>
                    <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                      <h4 className="font-medium text-green-800">Status</h4>
                      <p className="text-sm text-green-600">🟢 Online e Operacional</p>
                    </div>
                    <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                      <h4 className="font-medium text-green-800">Uptime</h4>
                      <p className="text-sm text-green-600">99.9% SLA Garantido</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="go-live" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Go-to-Market</CardTitle>
              <CardDescription>
                Estratégia de lançamento e primeiros usuários
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Usuários Piloto
                  </h4>
                  <div className="space-y-3">
                    {[
                      { name: 'Equipe Técnica Petrobras', status: 'Ativo', users: 5 },
                      { name: 'Gestores Marítimos', status: 'Convite Enviado', users: 8 },
                      { name: 'Operadores de Campo', status: 'Aguardando', users: 12 }
                    ].map((group, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="text-sm font-medium">{group.name}</p>
                          <p className="text-xs text-muted-foreground">{group.users} usuários</p>
                        </div>
                        <Badge className={
                          group.status === 'Ativo' ? 'text-green-600 bg-green-50 border-green-200' :
                          group.status === 'Convite Enviado' ? 'text-blue-600 bg-blue-50 border-blue-200' :
                          'text-yellow-600 bg-yellow-50 border-yellow-200'
                        }>
                          {group.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Métricas de Adoção
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Usuários Cadastrados</span>
                        <span className="text-sm text-muted-foreground">25/50</span>
                      </div>
                      <Progress value={50} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Módulos Utilizados</span>
                        <span className="text-sm text-muted-foreground">8/12</span>
                      </div>
                      <Progress value={67} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Satisfação dos Usuários</span>
                        <span className="text-sm text-muted-foreground">4.8/5.0</span>
                      </div>
                      <Progress value={96} className="h-2" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Play className="w-5 h-5 text-blue-600" />
                  <h4 className="font-medium text-blue-800">Próximos Passos</h4>
                </div>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Coletar feedback dos usuários piloto</li>
                  <li>• Refinar funcionalidades baseado no uso real</li>
                  <li>• Expandir para mais departamentos</li>
                  <li>• Implementar melhorias sugeridas</li>
                  <li>• Preparar treinamentos em escala</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductionDeployCenter;