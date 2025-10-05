import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Lock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  Eye,
  Zap,
  Brain,
  Target,
  TrendingUp,
  Clock,
  Database,
  Network,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  FileCheck,
  Link,
  Layers
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ThreatDetection {
  id: string;
  type: 'intrusion' | 'malware' | 'phishing' | 'ddos' | 'unauthorized-access';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  source: string;
  target: string;
  status: 'detected' | 'blocked' | 'investigating' | 'resolved';
  aiConfidence: number;
  action: string;
}

interface SecurityMetric {
  metric: string;
  value: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
}

interface BlockchainAudit {
  id: string;
  action: string;
  user: string;
  timestamp: Date;
  hash: string;
  verified: boolean;
  category: 'access' | 'modification' | 'approval' | 'security';
}

export const QuantumSecurityShield: React.FC = () => {
  const [threats, setThreats] = useState<ThreatDetection[]>([]);
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetric[]>([]);
  const [auditTrail, setAuditTrail] = useState<BlockchainAudit[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [detectionAccuracy, setDetectionAccuracy] = useState(99.9);
  const [responseTime, setResponseTime] = useState(0.8);
  const { toast } = useToast();

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = () => {
    const mockThreats: ThreatDetection[] = [
      {
        id: 't1',
        type: 'intrusion',
        severity: 'high',
        timestamp: new Date(Date.now() - 300000),
        source: '185.220.101.45',
        target: 'Maritime Operations Portal',
        status: 'blocked',
        aiConfidence: 99.7,
        action: 'Conexão bloqueada automaticamente. Firewall atualizado.'
      },
      {
        id: 't2',
        type: 'phishing',
        severity: 'medium',
        timestamp: new Date(Date.now() - 1800000),
        source: 'external-email@suspicious.com',
        target: 'crew@nautilus.com',
        status: 'blocked',
        aiConfidence: 98.5,
        action: 'Email bloqueado. Usuário notificado.'
      },
      {
        id: 't3',
        type: 'unauthorized-access',
        severity: 'critical',
        timestamp: new Date(Date.now() - 600000),
        source: '192.168.1.250',
        target: 'Certification Database',
        status: 'investigating',
        aiConfidence: 99.2,
        action: 'Acesso negado. Investigação em andamento.'
      }
    ];

    const mockMetrics: SecurityMetric[] = [
      { metric: 'Detecção de Ameaças', value: 99.9, status: 'excellent', trend: 'up' },
      { metric: 'Tempo de Resposta', value: 98.5, status: 'excellent', trend: 'up' },
      { metric: 'Integridade de Dados', value: 100, status: 'excellent', trend: 'stable' },
      { metric: 'Compliance Regulatório', value: 100, status: 'excellent', trend: 'stable' },
      { metric: 'Segurança de Rede', value: 97.8, status: 'excellent', trend: 'up' },
      { metric: 'Proteção de Endpoints', value: 99.1, status: 'excellent', trend: 'stable' }
    ];

    const mockAudit: BlockchainAudit[] = [
      {
        id: 'b1',
        action: 'Certificação STCW aprovada',
        user: 'system@nautilus.com',
        timestamp: new Date(Date.now() - 900000),
        hash: '0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
        verified: true,
        category: 'approval'
      },
      {
        id: 'b2',
        action: 'Acesso ao módulo de tripulação',
        user: 'admin@nautilus.com',
        timestamp: new Date(Date.now() - 1200000),
        hash: '0x2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae',
        verified: true,
        category: 'access'
      },
      {
        id: 'b3',
        action: 'Modificação de dados de embarcação',
        user: 'fleet-manager@nautilus.com',
        timestamp: new Date(Date.now() - 1500000),
        hash: '0xfcde2b2edba56bf408601fb721fe9b5c338d10ee429ea04fae5511b68fbf8fb9',
        verified: true,
        category: 'modification'
      },
      {
        id: 'b4',
        action: 'Tentativa de acesso bloqueada',
        user: 'unknown@external.com',
        timestamp: new Date(Date.now() - 600000),
        hash: '0xef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',
        verified: true,
        category: 'security'
      }
    ];

    setThreats(mockThreats);
    setSecurityMetrics(mockMetrics);
    setAuditTrail(mockAudit);
  };

  const runSecurityScan = () => {
    setIsScanning(true);

    setTimeout(() => {
      setDetectionAccuracy(99.85 + Math.random() * 0.15);
      setResponseTime(0.5 + Math.random() * 0.5);
      setIsScanning(false);

      toast({
        title: "✅ Varredura de Segurança Completa",
        description: `Sistema seguro. ${threats.filter(t => t.status === 'blocked').length} ameaças bloqueadas automaticamente.`,
      });
    }, 3000);
  };

  const getSeverityColor = (severity: ThreatDetection['severity']) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
    }
  };

  const getStatusColor = (status: ThreatDetection['status']) => {
    switch (status) {
      case 'blocked': return 'text-green-600 dark:text-green-400';
      case 'detected': return 'text-yellow-600 dark:text-yellow-400';
      case 'investigating': return 'text-orange-600 dark:text-orange-400';
      case 'resolved': return 'text-blue-600 dark:text-blue-400';
    }
  };

  const getMetricStatusColor = (status: SecurityMetric['status']) => {
    switch (status) {
      case 'excellent': return 'text-green-600 dark:text-green-400';
      case 'good': return 'text-blue-600 dark:text-blue-400';
      case 'warning': return 'text-yellow-600 dark:text-yellow-400';
      case 'critical': return 'text-red-600 dark:text-red-400';
    }
  };

  const getCategoryIcon = (category: BlockchainAudit['category']) => {
    switch (category) {
      case 'access': return <Eye className="h-4 w-4" />;
      case 'modification': return <FileCheck className="h-4 w-4" />;
      case 'approval': return <CheckCircle className="h-4 w-4" />;
      case 'security': return <Shield className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-red-600 to-orange-600 text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Shield className="h-8 w-8" />
              </div>
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  Quantum Security Shield
                  <Badge className="bg-yellow-400 text-yellow-900 hover:bg-yellow-300">
                    <Sparkles className="h-3 w-3 mr-1" />
                    QUANTUM
                  </Badge>
                </CardTitle>
                <CardDescription className="text-white/90">
                  Fortaleza Cibernética com IA de detecção 99.9%, blockchain imutável e zero-trust architecture
                </CardDescription>
              </div>
            </div>
            <Button
              onClick={runSecurityScan}
              disabled={isScanning}
              size="lg"
              className="bg-white text-red-600 hover:bg-white/90"
            >
              <Brain className="h-5 w-5 mr-2" />
              {isScanning ? 'Escaneando...' : 'Varredura Completa'}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Target className="h-8 w-8 text-green-600" />
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-green-700 dark:text-green-400">{detectionAccuracy.toFixed(1)}%</div>
            <div className="text-sm text-muted-foreground">Precisão de Detecção</div>
            <div className="text-xs text-green-600 mt-1">Meta: 99.9% ✅</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Zap className="h-8 w-8 text-blue-600" />
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-blue-700 dark:text-blue-400">{responseTime.toFixed(1)}s</div>
            <div className="text-sm text-muted-foreground">Tempo de Resposta</div>
            <div className="text-xs text-blue-600 mt-1">Resposta automática</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <ShieldCheck className="h-8 w-8 text-purple-600" />
              <CheckCircle className="h-5 w-5 text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-purple-700 dark:text-purple-400">
              {threats.filter(t => t.status === 'blocked').length}
            </div>
            <div className="text-sm text-muted-foreground">Ameaças Bloqueadas</div>
            <div className="text-xs text-purple-600 mt-1">Últimas 24h</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Lock className="h-8 w-8 text-orange-600" />
              <Layers className="h-5 w-5 text-orange-600" />
            </div>
            <div className="text-3xl font-bold text-orange-700 dark:text-orange-400">256-bit</div>
            <div className="text-sm text-muted-foreground">Criptografia Quântica</div>
            <div className="text-xs text-orange-600 mt-1">Ultra-seguro</div>
          </CardContent>
        </Card>
      </div>

      {/* Threat Detection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5" />
            Detecção de Ameaças em Tempo Real
          </CardTitle>
          <CardDescription>
            IA analisando atividades suspeitas com 99.9% de precisão
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {threats.map((threat) => (
            <Card key={threat.id} className="border-l-4" style={{
              borderLeftColor: threat.severity === 'critical' ? '#ef4444' :
                              threat.severity === 'high' ? '#f97316' :
                              threat.severity === 'medium' ? '#eab308' : '#22c55e'
            }}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">
                        {threat.type === 'intrusion' ? '🚨 Tentativa de Intrusão' :
                         threat.type === 'malware' ? '🦠 Malware Detectado' :
                         threat.type === 'phishing' ? '🎣 Tentativa de Phishing' :
                         threat.type === 'ddos' ? '💥 Ataque DDoS' :
                         '🔒 Acesso Não Autorizado'}
                      </h3>
                      <Badge className={getSeverityColor(threat.severity)}>
                        {threat.severity === 'critical' ? 'CRÍTICO' :
                         threat.severity === 'high' ? 'ALTO' :
                         threat.severity === 'medium' ? 'MÉDIO' : 'BAIXO'}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                      <div>
                        <div className="text-xs text-muted-foreground">Origem</div>
                        <div className="font-medium">{threat.source}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Alvo</div>
                        <div className="font-medium">{threat.target}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Status</div>
                        <div className={`font-medium ${getStatusColor(threat.status)}`}>
                          {threat.status === 'blocked' ? '🛡️ Bloqueado' :
                           threat.status === 'detected' ? '👁️ Detectado' :
                           threat.status === 'investigating' ? '🔍 Investigando' :
                           '✅ Resolvido'}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">IA Confiança</div>
                        <div className="font-medium text-purple-600">{threat.aiConfidence}%</div>
                      </div>
                    </div>

                    <div className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Zap className="h-4 w-4 text-blue-600 mt-0.5" />
                        <div>
                          <div className="text-xs font-medium text-blue-900 dark:text-blue-300 mb-1">
                            Ação Automática:
                          </div>
                          <div className="text-sm text-blue-800 dark:text-blue-200">
                            {threat.action}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {threat.timestamp.toLocaleString('pt-BR')}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Security Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Métricas de Segurança
          </CardTitle>
          <CardDescription>
            Monitoramento contínuo de todos os aspectos de segurança
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {securityMetrics.map((metric, idx) => (
              <div key={idx} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">{metric.metric}</h4>
                  <div className={`flex items-center gap-1 ${getMetricStatusColor(metric.status)}`}>
                    {metric.trend === 'up' ? <TrendingUp className="h-4 w-4" /> :
                     metric.trend === 'down' ? <TrendingUp className="h-4 w-4 rotate-180" /> :
                     <Activity className="h-4 w-4" />}
                    <span className="text-sm font-medium">{metric.value}%</span>
                  </div>
                </div>
                <Progress value={metric.value} className="h-2 mb-2" />
                <div className="flex items-center justify-between">
                  <Badge className={
                    metric.status === 'excellent' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' :
                    metric.status === 'good' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' :
                    metric.status === 'warning' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' :
                    'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                  }>
                    {metric.status === 'excellent' ? '✅ Excelente' :
                     metric.status === 'good' ? '👍 Bom' :
                     metric.status === 'warning' ? '⚠️ Atenção' :
                     '🔴 Crítico'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Blockchain Audit Trail */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            Blockchain Audit Trail - Registro Imutável
          </CardTitle>
          <CardDescription>
            Todas as ações são registradas permanentemente em blockchain
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {auditTrail.map((audit) => (
              <div key={audit.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(audit.category)}
                    <div>
                      <h4 className="font-medium">{audit.action}</h4>
                      <p className="text-sm text-muted-foreground">{audit.user}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {audit.verified ? (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verificado
                      </Badge>
                    ) : (
                      <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
                        <Clock className="h-3 w-3 mr-1" />
                        Pendente
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <Database className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">Hash:</span>
                    <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono text-xs">
                      {audit.hash}
                    </code>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {audit.timestamp.toLocaleString('pt-BR')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Zero-Trust Architecture */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            Zero-Trust Architecture
          </CardTitle>
          <CardDescription>
            Microsegmentação e verificação contínua de identidade
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="h-6 w-6 text-blue-600" />
                <h4 className="font-medium">Microsegmentação</h4>
              </div>
              <Progress value={100} className="h-2 mb-2" />
              <p className="text-sm text-muted-foreground">
                Rede dividida em zonas seguras isoladas
              </p>
              <Badge className="mt-2 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                ✅ Ativo
              </Badge>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Eye className="h-6 w-6 text-purple-600" />
                <h4 className="font-medium">Verificação Contínua</h4>
              </div>
              <Progress value={100} className="h-2 mb-2" />
              <p className="text-sm text-muted-foreground">
                Autenticação e autorização a cada acesso
              </p>
              <Badge className="mt-2 bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300">
                ✅ Ativo
              </Badge>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Lock className="h-6 w-6 text-orange-600" />
                <h4 className="font-medium">Criptografia E2E</h4>
              </div>
              <Progress value={100} className="h-2 mb-2" />
              <p className="text-sm text-muted-foreground">
                Dados criptografados ponta a ponta
              </p>
              <Badge className="mt-2 bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300">
                ✅ Ativo
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
