import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Database,
  HardDrive,
  RotateCcw,
  Clock,
  MapPin,
  CheckCircle,
  AlertTriangle,
  Download,
  Upload,
  Archive,
  Zap,
  Globe,
  Shield,
} from "lucide-react";

export const BackupRecoverySystem: React.FC = () => {
  const [backupStatus] = useState({
    lastFullBackup: "2024-01-15 03:00:00",
    lastIncrementalBackup: "2024-01-15 15:30:00",
    nextScheduledBackup: "2024-01-16 03:00:00",
    totalBackupSize: "2.4 TB",
    retentionPeriod: "90 dias",
    encryptionStatus: "AES-256 Ativo",
  });

  const [backupLocations] = useState([
    {
      id: "1",
      name: "Zona Primária - São Paulo",
      status: "healthy",
      lastSync: "2024-01-15 15:30:00",
      storage: "850 GB",
      maxStorage: "1 TB",
      type: "primary",
    },
    {
      id: "2",
      name: "Zona Secundária - Rio de Janeiro",
      status: "healthy",
      lastSync: "2024-01-15 15:32:00",
      storage: "850 GB",
      maxStorage: "1 TB",
      type: "secondary",
    },
    {
      id: "3",
      name: "Zona Terciária - AWS US-East",
      status: "syncing",
      lastSync: "2024-01-15 15:25:00",
      storage: "847 GB",
      maxStorage: "1 TB",
      type: "tertiary",
    },
  ]);

  const [recoveryHistory] = useState([
    {
      id: "1",
      timestamp: "2024-01-14 10:30:00",
      type: "Recuperação Parcial",
      description: "Restauração de dados do cliente Navegação Atlântica",
      status: "success",
      duration: "23 min",
      dataSize: "1.2 GB",
      requestedBy: "admin@nautilus.com",
    },
    {
      id: "2",
      timestamp: "2024-01-12 14:15:00",
      type: "Teste de Integridade",
      description: "Verificação automática de backup semanal",
      status: "success",
      duration: "2h 15min",
      dataSize: "2.4 TB",
      requestedBy: "Sistema Automático",
    },
    {
      id: "3",
      timestamp: "2024-01-10 09:45:00",
      type: "Recuperação de Emergência",
      description: "Restauração completa após falha de servidor",
      status: "success",
      duration: "45 min",
      dataSize: "2.1 TB",
      requestedBy: "devops@nautilus.com",
    },
  ]);

  const [redundancyStatus] = useState({
    loadBalancer: "active",
    primaryServer: "healthy",
    secondaryServer: "healthy",
    databaseReplication: "synced",
    failoverTime: "< 30s",
    uptime: "99.98%",
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
      case "success":
      case "active":
      case "synced":
        return "text-green-500";
      case "syncing":
      case "warning":
        return "text-yellow-500";
      case "error":
      case "failed":
        return "text-red-500";
      default:
        return "text-muted-foreground";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "healthy":
      case "success":
      case "active":
      case "synced":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      case "syncing":
      case "warning":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
      case "error":
      case "failed":
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
          <Database className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-bold">Backup & Recuperação</h1>
          <Badge variant="secondary">Sistema de Continuidade</Badge>
        </div>
        <p className="text-muted-foreground">
          Sistema completo de backup, redundância e recuperação de dados
        </p>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Último Backup</p>
                <p className="text-lg font-bold">15:30</p>
                <p className="text-xs text-muted-foreground">Hoje</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tamanho Total</p>
                <p className="text-lg font-bold">2.4TB</p>
                <p className="text-xs text-muted-foreground">Crescendo</p>
              </div>
              <HardDrive className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Zonas</p>
                <p className="text-lg font-bold">3</p>
                <p className="text-xs text-muted-foreground">Ativas</p>
              </div>
              <MapPin className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Uptime</p>
                <p className="text-lg font-bold">99.98%</p>
                <p className="text-xs text-muted-foreground">Este mês</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Failover</p>
                <p className="text-lg font-bold">&lt; 30s</p>
                <p className="text-xs text-muted-foreground">Automático</p>
              </div>
              <Zap className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Criptografia</p>
                <p className="text-lg font-bold">AES-256</p>
                <p className="text-xs text-muted-foreground">Ativo</p>
              </div>
              <Shield className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="backup" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="backup">Status de Backup</TabsTrigger>
          <TabsTrigger value="recovery">Recuperação</TabsTrigger>
          <TabsTrigger value="redundancy">Redundância</TabsTrigger>
          <TabsTrigger value="testing">Testes DRP</TabsTrigger>
        </TabsList>

        <TabsContent value="backup">
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Backup Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Status do Backup
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Último Backup Completo:</span>
                      <span className="text-sm font-medium">{backupStatus.lastFullBackup}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Último Incremental:</span>
                      <span className="text-sm font-medium">
                        {backupStatus.lastIncrementalBackup}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Próximo Agendado:</span>
                      <span className="text-sm font-medium">
                        {backupStatus.nextScheduledBackup}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Retenção:</span>
                      <span className="text-sm font-medium">{backupStatus.retentionPeriod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Criptografia:</span>
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                        {backupStatus.encryptionStatus}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Backup Manual
                    </Button>
                    <Button variant="outline" size="sm">
                      <Archive className="w-4 h-4 mr-2" />
                      Histórico
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Backup Locations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Zonas Geográficas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {backupLocations.map(location => (
                    <div key={location.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{location.name}</h4>
                        <Badge className={getStatusBadge(location.status)}>
                          {location.status === "healthy"
                            ? "Saudável"
                            : location.status === "syncing"
                              ? "Sincronizando"
                              : location.status}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Armazenamento:</span>
                          <span>
                            {location.storage} / {location.maxStorage}
                          </span>
                        </div>
                        <Progress
                          value={
                            (parseFloat(location.storage) / parseFloat(location.maxStorage)) * 100
                          }
                          className="h-2"
                        />
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Último Sync:</span>
                          <span>{location.lastSync}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="recovery">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Centro de Recuperação</h3>
              <Button>
                <RotateCcw className="w-4 h-4 mr-2" />
                Nova Recuperação
              </Button>
            </div>

            {/* Recovery Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
                <CardContent className="p-4 text-center">
                  <Download className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <h4 className="font-semibold mb-2">Recuperação Rápida</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Restaurar dados específicos em minutos
                  </p>
                  <Button size="sm" className="w-full">
                    Iniciar
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
                <CardContent className="p-4 text-center">
                  <Database className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                  <h4 className="font-semibold mb-2">Recuperação Completa</h4>
                  <p className="text-sm text-muted-foreground mb-4">Restaurar sistema completo</p>
                  <Button size="sm" variant="outline" className="w-full">
                    Configurar
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
                <CardContent className="p-4 text-center">
                  <CheckCircle className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-semibold mb-2">Teste de Integridade</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Verificar integridade dos backups
                  </p>
                  <Button size="sm" variant="outline" className="w-full">
                    Testar
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recovery History */}
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Recuperações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recoveryHistory.map(recovery => (
                    <div
                      key={recovery.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <CheckCircle className={`w-6 h-6 ${getStatusColor(recovery.status)}`} />
                        <div>
                          <h4 className="font-medium">{recovery.type}</h4>
                          <p className="text-sm text-muted-foreground">{recovery.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {recovery.timestamp} • {recovery.requestedBy}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{recovery.duration}</p>
                        <p className="text-xs text-muted-foreground">{recovery.dataSize}</p>
                        <Badge className={getStatusBadge(recovery.status)}>
                          {recovery.status === "success" ? "Sucesso" : recovery.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="redundancy">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Sistema de Redundância e Alta Disponibilidade</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Server Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Status dos Servidores</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Servidor Primário</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                      Saudável
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Servidor Secundário</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                      Saudável
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Load Balancer</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                      Ativo
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Replicação DB</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                      Sincronizado
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Métricas de Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Tempo de Failover</span>
                        <span className="text-sm font-medium">&lt; 30 segundos</span>
                      </div>
                      <Progress value={95} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Uptime</span>
                        <span className="text-sm font-medium">99.98%</span>
                      </div>
                      <Progress value={99.98} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Lag de Replicação</span>
                        <span className="text-sm font-medium">0.5s</span>
                      </div>
                      <Progress value={90} className="h-2" />
                    </div>
                  </div>

                  <Button className="w-full mt-4">
                    <Zap className="w-4 h-4 mr-2" />
                    Testar Failover
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="testing">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Disaster Recovery Plan (DRP) - Testes</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Cronograma de Testes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="p-3 border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Teste Semanal de Backup</span>
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                          Agendado
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Próximo: Domingo 03:00</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Teste de Failover</span>
                        <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
                          Pendente
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Próximo: 20/01/2024</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Simulação de Desastre</span>
                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                          Trimestral
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Próximo: 01/04/2024</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resultados dos Últimos Testes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="p-3 border rounded-lg bg-green-50 dark:bg-green-900/20">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Backup Completo</span>
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        14/01/2024 - Sucesso em 2h 15min
                      </p>
                    </div>
                    <div className="p-3 border rounded-lg bg-green-50 dark:bg-green-900/20">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Recuperação Parcial</span>
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      </div>
                      <p className="text-sm text-muted-foreground">12/01/2024 - Sucesso em 23min</p>
                    </div>
                    <div className="p-3 border rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Failover Automático</span>
                        <AlertTriangle className="w-5 h-5 text-yellow-500" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        10/01/2024 - Sucesso com atraso (45s)
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Executar Teste Manual</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button className="h-20 flex-col">
                    <Database className="w-6 h-6 mb-2" />
                    Teste de Backup
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <RotateCcw className="w-6 h-6 mb-2" />
                    Teste de Recuperação
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Zap className="w-6 h-6 mb-2" />
                    Teste de Failover
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
