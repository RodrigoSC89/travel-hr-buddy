import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Eye, 
  Lock, 
  Key, 
  Activity,
  Users,
  Globe,
  Database,
  Wifi,
  Server,
  FileText,
  Clock,
  TrendingUp,
  RefreshCw,
  Download,
  Settings
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface SecurityAlert {
  id: string;
  type: 'threat' | 'vulnerability' | 'policy' | 'access';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: Date;
  status: 'active' | 'investigating' | 'resolved';
  affectedAssets: string[];
}

interface SecurityMetric {
  name: string;
  value: number;
  target: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
}

interface VulnerabilityReport {
  id: string;
  asset: string;
  vulnerability: string;
  cvss: number;
  status: 'open' | 'patched' | 'mitigated';
  discoveredAt: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export const AdvancedSecurityCenter: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetric[]>([]);
  const [vulnerabilities, setVulnerabilities] = useState<VulnerabilityReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [securityScore, setSecurityScore] = useState(0);

  // Simular dados de segurança
  const generateSecurityData = () => {
    const mockAlerts: SecurityAlert[] = [
      {
        id: '1',
        type: 'threat',
        severity: 'high',
        title: 'Tentativa de Acesso Suspeito',
        description: 'Múltiplas tentativas de login falharam de IP desconhecido',
        timestamp: new Date(Date.now() - 15 * 60000),
        status: 'active',
        affectedAssets: ['Login System', 'User Database']
      },
      {
        id: '2',
        type: 'vulnerability',
        severity: 'medium',
        title: 'Atualização de Segurança Disponível',
        description: 'Nova versão do framework corrige vulnerabilidades conhecidas',
        timestamp: new Date(Date.now() - 2 * 60 * 60000),
        status: 'investigating',
        affectedAssets: ['Web Application']
      },
      {
        id: '3',
        type: 'policy',
        severity: 'low',
        title: 'Política de Senha Violada',
        description: 'Usuário utilizando senha fraca detectada',
        timestamp: new Date(Date.now() - 4 * 60 * 60000),
        status: 'resolved',
        affectedAssets: ['User Account']
      }
    ];

    const mockMetrics: SecurityMetric[] = [
      { name: 'Score de Segurança', value: 87, target: 95, unit: '%', status: 'warning', trend: 'up' },
      { name: 'Vulnerabilidades Críticas', value: 2, target: 0, unit: 'unidades', status: 'critical', trend: 'down' },
      { name: 'Tentativas de Ataque Bloqueadas', value: 147, target: 0, unit: 'unidades', status: 'good', trend: 'stable' },
      { name: 'Compliance Rate', value: 94, target: 100, unit: '%', status: 'good', trend: 'up' },
      { name: 'Tempo Médio de Resposta', value: 12, target: 15, unit: 'min', status: 'good', trend: 'down' },
      { name: 'Uptime de Segurança', value: 99.8, target: 99.9, unit: '%', status: 'good', trend: 'stable' }
    ];

    const mockVulnerabilities: VulnerabilityReport[] = [
      {
        id: '1',
        asset: 'Web Application',
        vulnerability: 'Cross-Site Scripting (XSS)',
        cvss: 7.4,
        status: 'open',
        discoveredAt: new Date(Date.now() - 3 * 24 * 60 * 60000),
        priority: 'high'
      },
      {
        id: '2',
        asset: 'Database Server',
        vulnerability: 'SQL Injection',
        cvss: 8.1,
        status: 'patched',
        discoveredAt: new Date(Date.now() - 7 * 24 * 60 * 60000),
        priority: 'critical'
      },
      {
        id: '3',
        asset: 'API Gateway',
        vulnerability: 'Insecure Direct Object Reference',
        cvss: 5.3,
        status: 'mitigated',
        discoveredAt: new Date(Date.now() - 5 * 24 * 60 * 60000),
        priority: 'medium'
      }
    ];

    setAlerts(mockAlerts);
    setMetrics(mockMetrics);
    setVulnerabilities(mockVulnerabilities);
    setSecurityScore(87);
    setIsLoading(false);
  };

  useEffect(() => {
    generateSecurityData();
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-green-600" />;
      case 'down': return <TrendingUp className="h-3 w-3 text-red-600 rotate-180" />;
      default: return <div className="h-3 w-3" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleResolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, status: 'resolved' } : alert
    ));
    
    toast({
      title: "Alerta resolvido",
      description: "O alerta de segurança foi marcado como resolvido.",
    });
  };

  const handleRunScan = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      generateSecurityData();
      toast({
        title: "Varredura concluída",
        description: "Nova análise de segurança foi executada com sucesso.",
      });
    }, 3000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Central de Segurança</h2>
          <p className="text-muted-foreground">
            Monitoramento avançado e gestão de segurança
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Relatório
          </Button>
          <Button onClick={handleRunScan}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Varredura
          </Button>
        </div>
      </div>

      {/* Security Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Score de Segurança</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className={`text-4xl font-bold ${getScoreColor(securityScore)}`}>
                {securityScore}
              </div>
              <p className="text-sm text-muted-foreground">de 100</p>
            </div>
            <div className="flex-1">
              <Progress value={securityScore} className="h-3" />
              <div className="mt-2 text-sm text-muted-foreground">
                {securityScore >= 90 ? 'Excelente' : 
                 securityScore >= 70 ? 'Bom' : 'Necessita Atenção'}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Última atualização</p>
              <p className="text-sm font-medium">há 5 minutos</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
              <div className="flex items-center space-x-1">
                {getTrendIcon(metric.trend)}
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getStatusColor(metric.status)}`}>
                {metric.value}{metric.unit === '%' ? '%' : metric.unit === 'unidades' ? '' : metric.unit}
              </div>
              <div className="mt-2">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Meta: {metric.target}{metric.unit === '%' ? '%' : ''}</span>
                  <Badge variant={metric.status === 'good' ? 'default' : 
                                  metric.status === 'warning' ? 'secondary' : 'destructive'}>
                    {metric.status === 'good' ? 'OK' : 
                     metric.status === 'warning' ? 'Atenção' : 'Crítico'}
                  </Badge>
                </div>
                {metric.target > 0 && (
                  <Progress 
                    value={Math.min((metric.value / metric.target) * 100, 100)} 
                    className="h-2"
                  />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
          <TabsTrigger value="vulnerabilities">Vulnerabilidades</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoramento</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alertas de Segurança</CardTitle>
              <CardDescription>
                Alertas ativos e recentes do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div key={alert.id} className="flex items-start space-x-4 p-4 border border-border rounded-lg">
                    <div className="flex items-center space-x-2">
                      {getSeverityIcon(alert.severity)}
                      <div className={`w-2 h-2 rounded-full ${getSeverityColor(alert.severity)}`} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium">{alert.title}</h4>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="capitalize">
                            {alert.type}
                          </Badge>
                          <Badge variant={alert.status === 'resolved' ? 'default' : 
                                         alert.status === 'investigating' ? 'secondary' : 'destructive'}>
                            {alert.status === 'resolved' ? 'Resolvido' : 
                             alert.status === 'investigating' ? 'Investigando' : 'Ativo'}
                          </Badge>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">
                        {alert.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {alert.timestamp.toLocaleString()}
                          </span>
                          <span className="flex items-center">
                            <Server className="h-3 w-3 mr-1" />
                            {alert.affectedAssets.length} ativos afetados
                          </span>
                        </div>
                        
                        {alert.status === 'active' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleResolveAlert(alert.id)}
                          >
                            Resolver
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vulnerabilities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Relatório de Vulnerabilidades</CardTitle>
              <CardDescription>
                Vulnerabilidades identificadas e seu status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {vulnerabilities.map((vuln) => (
                  <div key={vuln.id} className="flex items-center space-x-4 p-4 border border-border rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${
                        vuln.priority === 'critical' ? 'bg-red-500' :
                        vuln.priority === 'high' ? 'bg-orange-500' :
                        vuln.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                      }`} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium">{vuln.vulnerability}</h4>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">
                            CVSS: {vuln.cvss}
                          </Badge>
                          <Badge variant={vuln.status === 'patched' ? 'default' : 
                                         vuln.status === 'mitigated' ? 'secondary' : 'destructive'}>
                            {vuln.status === 'patched' ? 'Corrigido' : 
                             vuln.status === 'mitigated' ? 'Mitigado' : 'Aberto'}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Ativo: {vuln.asset}</span>
                        <span>Descoberto: {vuln.discoveredAt.toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Status de Compliance</CardTitle>
                <CardDescription>Conformidade com regulamentações</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">LGPD</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={95} className="w-20 h-2" />
                      <span className="text-sm font-medium">95%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">ISO 27001</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={88} className="w-20 h-2" />
                      <span className="text-sm font-medium">88%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">SOC 2</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={92} className="w-20 h-2" />
                      <span className="text-sm font-medium">92%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">PCI DSS</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={97} className="w-20 h-2" />
                      <span className="text-sm font-medium">97%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Políticas de Segurança</CardTitle>
                <CardDescription>Status das políticas implementadas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Política de Senhas</span>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Controle de Acesso</span>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Backup e Recuperação</span>
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Monitoramento de Logs</span>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Criptografia de Dados</span>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Atividade de Rede</CardTitle>
                <CardDescription>Tráfego e eventos em tempo real</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm flex items-center">
                      <Activity className="h-4 w-4 mr-2" />
                      Conexões Ativas
                    </span>
                    <span className="font-medium">1,247</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm flex items-center">
                      <Wifi className="h-4 w-4 mr-2" />
                      Largura de Banda
                    </span>
                    <span className="font-medium">156 Mbps</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm flex items-center">
                      <Globe className="h-4 w-4 mr-2" />
                      Requests/min
                    </span>
                    <span className="font-medium">2,847</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Logs de Segurança</CardTitle>
                <CardDescription>Eventos recentes do sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>Login bem-sucedido - admin@nautilus.com</span>
                    <span className="text-muted-foreground ml-auto">14:32</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                    <span>Tentativa de acesso negada - IP: 192.168.1.100</span>
                    <span className="text-muted-foreground ml-auto">14:28</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span>Backup automático concluído</span>
                    <span className="text-muted-foreground ml-auto">14:15</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    <span>Falha na autenticação 2FA</span>
                    <span className="text-muted-foreground ml-auto">14:10</span>
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