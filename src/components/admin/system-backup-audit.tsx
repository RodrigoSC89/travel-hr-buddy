import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Database, 
  Download, 
  Upload, 
  History, 
  Shield, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw,
  HardDrive,
  Cloud,
  Server,
  Archive,
  FileText,
  Calendar,
  Eye,
  Trash2,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BackupJob {
  id: string;
  name: string;
  type: 'full' | 'incremental' | 'differential';
  status: 'running' | 'completed' | 'failed' | 'scheduled';
  startTime: Date;
  endTime?: Date;
  size?: string;
  progress?: number;
}

interface AuditLog {
  id: string;
  timestamp: Date;
  user: string;
  action: string;
  resource: string;
  details: string;
  ip: string;
  userAgent: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

const SystemBackupAudit = () => {
  const [backupJobs, setBackupJobs] = useState<BackupJob[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [selectedTab, setSelectedTab] = useState('backup');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Dados simulados
  useEffect(() => {
    const mockBackupJobs: BackupJob[] = [
      {
        id: '1',
        name: 'Backup Completo Diário',
        type: 'full',
        status: 'completed',
        startTime: new Date(Date.now() - 6 * 60 * 60 * 1000),
        endTime: new Date(Date.now() - 5 * 60 * 60 * 1000),
        size: '2.3 GB'
      },
      {
        id: '2',
        name: 'Backup Incremental',
        type: 'incremental',
        status: 'running',
        startTime: new Date(Date.now() - 30 * 60 * 1000),
        progress: 65
      },
      {
        id: '3',
        name: 'Backup de Certificados',
        type: 'differential',
        status: 'scheduled',
        startTime: new Date(Date.now() + 2 * 60 * 60 * 1000)
      }
    ];

    const mockAuditLogs: AuditLog[] = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        user: 'admin@empresa.com',
        action: 'LOGIN',
        resource: 'Sistema',
        details: 'Login realizado com sucesso',
        ip: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        severity: 'low'
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        user: 'hr@empresa.com',
        action: 'CREATE_CERTIFICATE',
        resource: 'Certificados',
        details: 'Novo certificado STCW criado para João Silva',
        ip: '192.168.1.105',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        severity: 'medium'
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
        user: 'sistema',
        action: 'FAILED_LOGIN_ATTEMPT',
        resource: 'Autenticação',
        details: 'Tentativa de login falhada - senha incorreta',
        ip: '203.45.67.89',
        userAgent: 'Unknown',
        severity: 'high'
      },
      {
        id: '4',
        timestamp: new Date(Date.now() - 60 * 60 * 1000),
        user: 'admin@empresa.com',
        action: 'UPDATE_USER_ROLE',
        resource: 'Usuários',
        details: 'Papel de usuário alterado de employee para hr_manager',
        ip: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        severity: 'critical'
      }
    ];

    setBackupJobs(mockBackupJobs);
    setAuditLogs(mockAuditLogs);
  }, []);

  const getBackupStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'running':
        return <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />;
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'scheduled':
        return <Clock className="w-4 h-4 text-orange-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'running':
        return 'text-blue-600 bg-blue-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      case 'scheduled':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-100';
      case 'high':
        return 'text-orange-600 bg-orange-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-green-600 bg-green-100';
    }
  };

  const startBackup = async (type: 'full' | 'incremental' | 'differential') => {
    setIsLoading(true);
    
    const newJob: BackupJob = {
      id: Date.now().toString(),
      name: `Backup ${type === 'full' ? 'Completo' : type === 'incremental' ? 'Incremental' : 'Diferencial'}`,
      type,
      status: 'running',
      startTime: new Date(),
      progress: 0
    };

    setBackupJobs(prev => [newJob, ...prev]);

    // Simular progresso do backup
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        clearInterval(interval);
        setBackupJobs(prev => prev.map(job => 
          job.id === newJob.id 
            ? { ...job, status: 'completed', endTime: new Date(), progress: 100, size: '1.2 GB' }
            : job
        ));
        setIsLoading(false);
        toast({
          title: "Backup concluído",
          description: "Backup realizado com sucesso",
        });
      } else {
        setBackupJobs(prev => prev.map(job => 
          job.id === newJob.id ? { ...job, progress } : job
        ));
      }
    }, 500);
  };

  const exportAuditLogs = () => {
    const csvContent = auditLogs.map(log => 
      `${log.timestamp.toISOString()},${log.user},${log.action},${log.resource},${log.severity},${log.ip}`
    ).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'audit-logs.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Logs exportados",
      description: "Arquivo CSV criado com sucesso",
    });
  };

  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Agora';
    if (diffInMinutes < 60) return `${diffInMinutes}m atrás`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h atrás`;
    return `${Math.floor(diffInMinutes / 1440)}d atrás`;
  };

  const completedJobs = backupJobs.filter(job => job.status === 'completed').length;
  const runningJobs = backupJobs.filter(job => job.status === 'running').length;
  const failedJobs = backupJobs.filter(job => job.status === 'failed').length;

  const criticalLogs = auditLogs.filter(log => log.severity === 'critical').length;
  const highLogs = auditLogs.filter(log => log.severity === 'high').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="w-8 h-8" />
            Sistema de Backup e Auditoria
          </h1>
          <p className="text-muted-foreground">
            Gestão de backups e monitoramento de atividades do sistema
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportAuditLogs}>
            <Download className="w-4 h-4 mr-2" />
            Exportar Logs
          </Button>
          <Button onClick={() => startBackup('full')} disabled={isLoading}>
            <Database className="w-4 h-4 mr-2" />
            Backup Completo
          </Button>
        </div>
      </div>

      {/* Resumo Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Backups Concluídos</p>
                <p className="text-2xl font-bold text-green-600">{completedJobs}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Backups Executando</p>
                <p className="text-2xl font-bold text-blue-600">{runningJobs}</p>
              </div>
              <RefreshCw className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Logs Críticos</p>
                <p className="text-2xl font-bold text-red-600">{criticalLogs}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Logs de Alta Prioridade</p>
                <p className="text-2xl font-bold text-orange-600">{highLogs}</p>
              </div>
              <Eye className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="backup">Backups</TabsTrigger>
          <TabsTrigger value="audit">Auditoria</TabsTrigger>
          <TabsTrigger value="recovery">Recuperação</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="backup" className="space-y-6">
          <div className="flex gap-4">
            <Button onClick={() => startBackup('full')} disabled={isLoading}>
              <Database className="w-4 h-4 mr-2" />
              Backup Completo
            </Button>
            <Button variant="outline" onClick={() => startBackup('incremental')} disabled={isLoading}>
              <Archive className="w-4 h-4 mr-2" />
              Backup Incremental
            </Button>
            <Button variant="outline" onClick={() => startBackup('differential')} disabled={isLoading}>
              <HardDrive className="w-4 h-4 mr-2" />
              Backup Diferencial
            </Button>
          </div>

          <div className="space-y-4">
            {backupJobs.map((job) => (
              <Card key={job.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getBackupStatusIcon(job.status)}
                      <div>
                        <h3 className="font-semibold">{job.name}</h3>
                        <Badge className={getStatusColor(job.status)} variant="secondary">
                          {job.status === 'completed' ? 'Concluído' :
                           job.status === 'running' ? 'Executando' :
                           job.status === 'failed' ? 'Falhou' : 'Agendado'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Tipo</p>
                        <p className="font-medium capitalize">{job.type}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Início</p>
                        <p className="font-medium">{job.startTime.toLocaleTimeString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Tamanho</p>
                        <p className="font-medium">{job.size || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Duração</p>
                        <p className="font-medium">
                          {job.endTime 
                            ? `${Math.floor((job.endTime.getTime() - job.startTime.getTime()) / (1000 * 60))}m`
                            : 'Em execução'
                          }
                        </p>
                      </div>
                    </div>

                    {job.status === 'running' && job.progress !== undefined && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progresso</span>
                          <span>{Math.round(job.progress)}%</span>
                        </div>
                        <Progress value={job.progress} className="h-2" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Logs de Auditoria</CardTitle>
              <CardDescription>
                Registro detalhado de todas as atividades do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auditLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-center gap-1">
                        <Badge className={getSeverityColor(log.severity)} variant="secondary">
                          {log.severity}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {getRelativeTime(log.timestamp)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{log.action}</h4>
                          <span className="text-sm text-muted-foreground">•</span>
                          <span className="text-sm text-muted-foreground">{log.resource}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{log.details}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>Usuário: {log.user}</span>
                          <span>IP: {log.ip}</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recovery" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Recuperação de Dados
              </CardTitle>
              <CardDescription>
                Restaure dados a partir de backups anteriores
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Operações de recuperação podem interromper o serviço. Execute apenas durante janelas de manutenção.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Backups Disponíveis para Recuperação</h4>
                  <div className="space-y-2">
                    {backupJobs.filter(job => job.status === 'completed').map((job) => (
                      <div key={job.id} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-medium">{job.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {job.startTime.toLocaleString()} • {job.size}
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          <Upload className="w-4 h-4 mr-2" />
                          Restaurar
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configurações de Backup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium mb-4">Agendamento Automático</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">Backup Completo Diário</p>
                      <p className="text-sm text-muted-foreground">Todos os dias às 02:00</p>
                    </div>
                    <Badge variant="default">Ativo</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">Backup Incremental</p>
                      <p className="text-sm text-muted-foreground">A cada 4 horas</p>
                    </div>
                    <Badge variant="default">Ativo</Badge>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-4">Retenção de Dados</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Backups diários:</span>
                    <span className="font-medium">30 dias</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Backups semanais:</span>
                    <span className="font-medium">12 semanas</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Backups mensais:</span>
                    <span className="font-medium">12 meses</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-4">Armazenamento</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Local:</span>
                    <span className="font-medium">/var/backups/</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cloud (S3):</span>
                    <Badge variant="default">Configurado</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Espaço utilizado:</span>
                    <span className="font-medium">45.2 GB / 100 GB</span>
                  </div>
                </div>
                <Progress value={45.2} className="mt-2 h-2" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemBackupAudit;