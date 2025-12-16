import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { 
  Database, 
  Download, 
  Upload, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Shield,
  Server,
  HardDrive,
  FileText,
  Calendar,
  Activity,
  RefreshCw
} from "lucide-react";

const SystemBackupAudit = () => {
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);
  const { toast } = useToast();

  const backupHistory = [
    {
      id: 1,
      type: "Automático",
      date: "2024-01-15 02:00:00",
      size: "2.4 GB",
      status: "Sucesso",
      retention: "30 dias"
    },
    {
      id: 2,
      type: "Manual",
      date: "2024-01-14 14:30:00",
      size: "2.3 GB",
      status: "Sucesso",
      retention: "90 dias"
    },
    {
      id: 3,
      type: "Automático",
      date: "2024-01-14 02:00:00",
      size: "2.2 GB",
      status: "Falha",
      retention: "-"
    }
  ];

  const auditLogs = [
    {
      id: 1,
      action: "Login de usuário",
      user: "admin@nautilus.com",
      timestamp: "2024-01-15 14:32:15",
      ip: "192.168.1.100",
      status: "Sucesso"
    },
    {
      id: 2,
      action: "Modificação de certificado",
      user: "hr@nautilus.com",
      timestamp: "2024-01-15 14:25:10",
      ip: "192.168.1.101",
      status: "Sucesso"
    },
    {
      id: 3,
      action: "Tentativa de acesso negado",
      user: "user@domain.com",
      timestamp: "2024-01-15 14:20:05",
      ip: "203.0.113.45",
      status: "Falha"
    }
  ];

  const systemMetrics = {
    diskUsage: 75,
    memoryUsage: 68,
    cpuUsage: 45,
    activeUsers: 127,
    uptime: "15 dias, 8 horas"
  };

  const createBackup = async () => {
    setIsCreatingBackup(true);
    setBackupProgress(0);

    // Simulate backup progress
    const progressInterval = setInterval(() => {
      setBackupProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setIsCreatingBackup(false);
          toast({
            title: "Backup Concluído",
            description: "Backup do sistema criado com sucesso"
          });
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
    case "Sucesso":
      return <Badge variant="default" className="bg-green-100 text-green-800">Sucesso</Badge>;
    case "Falha":
      return <Badge variant="destructive">Falha</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sistema de Backup & Auditoria</h1>
          <p className="text-muted-foreground">
            Gerenciamento de backups e monitoramento de auditoria do sistema
          </p>
        </div>
        <Button onClick={createBackup} disabled={isCreatingBackup}>
          {isCreatingBackup ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Criando Backup...
            </>
          ) : (
            <>
              <Database className="w-4 h-4 mr-2" />
              Criar Backup
            </>
          )}
        </Button>
      </div>

      {isCreatingBackup && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Progresso do Backup</span>
                <span>{backupProgress}%</span>
              </div>
              <Progress value={backupProgress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <HardDrive className="w-5 h-5 text-blue-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">Uso do Disco</p>
                <div className="flex items-center space-x-2">
                  <Progress value={systemMetrics.diskUsage} className="flex-1" />
                  <span className="text-sm">{systemMetrics.diskUsage}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Server className="w-5 h-5 text-green-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">Memória</p>
                <div className="flex items-center space-x-2">
                  <Progress value={systemMetrics.memoryUsage} className="flex-1" />
                  <span className="text-sm">{systemMetrics.memoryUsage}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-orange-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">CPU</p>
                <div className="flex items-center space-x-2">
                  <Progress value={systemMetrics.cpuUsage} className="flex-1" />
                  <span className="text-sm">{systemMetrics.cpuUsage}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Usuários Ativos</p>
                <p className="text-2xl font-bold">{systemMetrics.activeUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-indigo-500" />
              <div>
                <p className="text-sm font-medium">Uptime</p>
                <p className="text-sm font-bold">{systemMetrics.uptime}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="backups" className="space-y-4">
        <TabsList>
          <TabsTrigger value="backups">Backups</TabsTrigger>
          <TabsTrigger value="audit">Auditoria</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
        </TabsList>

        <TabsContent value="backups" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Histórico de Backups
              </CardTitle>
              <CardDescription>
                Visualize e gerencie os backups do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Tamanho</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Retenção</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {backupHistory.map((backup) => (
                    <TableRow key={backup.id}>
                      <TableCell>{backup.type}</TableCell>
                      <TableCell>{backup.date}</TableCell>
                      <TableCell>{backup.size}</TableCell>
                      <TableCell>{getStatusBadge(backup.status)}</TableCell>
                      <TableCell>{backup.retention}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Download className="w-4 h-4" />
                          </Button>
                          {backup.status === "Sucesso" && (
                            <Button size="sm" variant="outline">
                              <Upload className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Logs de Auditoria
              </CardTitle>
              <CardDescription>
                Registro completo de atividades do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ação</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{log.action}</TableCell>
                      <TableCell>{log.user}</TableCell>
                      <TableCell>{log.timestamp}</TableCell>
                      <TableCell>{log.ip}</TableCell>
                      <TableCell>{getStatusBadge(log.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-500" />
                  Status de Segurança
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Firewall</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Ativo
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>SSL/TLS</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Válido
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Antivírus</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Atualizado
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Backup Automático</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Ativo
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  Alertas de Segurança
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  <div>
                    <p className="text-sm font-medium">Tentativas de login suspeitas</p>
                    <p className="text-xs text-muted-foreground">3 tentativas falharam nas últimas 24h</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Certificado SSL</p>
                    <p className="text-xs text-muted-foreground">Expira em 45 dias</p>
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

export default SystemBackupAudit;