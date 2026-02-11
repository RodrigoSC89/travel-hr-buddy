import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  Lock, 
  Eye, 
  AlertTriangle,
  CheckCircle,
  Users,
  FileText,
  Database,
  Globe,
  Key,
  Scan,
  UserCheck,
  Activity
} from "lucide-react";

export const CompleteSecurity: React.FC = () => {
  const [securityScore] = useState(94);
  const [threats] = useState([
    {
      id: "1",
      type: "Suspicious Login",
      severity: "high",
      description: "Login attempt from unusual location",
      timestamp: "2 minutos atrás",
      status: "investigating"
    },
    {
      id: "2", 
      type: "Brute Force",
      severity: "critical",
      description: "Multiple failed login attempts detected",
      timestamp: "15 minutos atrás",
      status: "blocked"
    },
    {
      id: "3",
      type: "Data Access",
      severity: "medium",
      description: "Unusual data access pattern detected",
      timestamp: "1 hora atrás",
      status: "resolved"
    }
  ]);

  const [vulnerabilities] = useState([
    {
      id: "1",
      component: "API Gateway",
      issue: "Missing rate limiting",
      severity: "medium",
      status: "open"
    },
    {
      id: "2",
      component: "Database",
      issue: "Weak password policy",
      severity: "high",
      status: "patched"
    },
    {
      id: "3",
      component: "Frontend",
      issue: "Outdated dependencies",
      severity: "low",
      status: "open"
    }
  ]);

  const [accessLogs] = useState([
    {
      id: "1",
      user: "admin@nautilus.com",
      action: "Admin panel access",
      resource: "User Management",
      timestamp: "2024-01-15 14:30:15",
      result: "success"
    },
    {
      id: "2",
      user: "user@example.com", 
      action: "Data export",
      resource: "Fleet Reports",
      timestamp: "2024-01-15 14:25:10",
      result: "success"
    },
    {
      id: "3",
      user: "unknown",
      action: "Login attempt",
      resource: "Authentication",
      timestamp: "2024-01-15 14:20:05",
      result: "failed"
    }
  ]);

  const [permissions] = useState([
    {
      role: "Super Admin",
      users: 2,
      permissions: ["all_access", "user_management", "system_config"],
      description: "Acesso total ao sistema"
    },
    {
      role: "Admin",
      users: 5,
      permissions: ["user_management", "reports", "fleet_management"],
      description: "Administração geral"
    },
    {
      role: "Manager",
      users: 23,
      permissions: ["reports", "fleet_view", "user_view"],
      description: "Gestão operacional"
    },
    {
      role: "User",
      users: 187,
      permissions: ["basic_access", "own_data"],
      description: "Acesso básico"
    }
  ]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
    case "critical": return "bg-destructive/10 text-destructive";
    case "high": return "bg-warning/10 text-warning";
    case "medium": return "bg-warning/10 text-warning";
    case "low": return "bg-success/10 text-success";
    default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
    case "resolved": return "bg-success/10 text-success";
    case "investigating": return "bg-warning/10 text-warning";
    case "blocked": return "bg-destructive/10 text-destructive";
    case "patched": return "bg-info/10 text-info";
    default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-bold">Centro de Segurança</h1>
          <Badge variant="secondary">Proteção Avançada</Badge>
        </div>
        <p className="text-muted-foreground">
          Monitoramento completo de segurança, ameaças e controle de acesso
        </p>
      </div>

      {/* Security Score */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Score de Segurança</h3>
              <p className="text-muted-foreground">Avaliação geral da segurança do sistema</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-success">{securityScore}%</div>
              <p className="text-sm text-muted-foreground">Excelente</p>
            </div>
          </div>
          <Progress value={securityScore} className="mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <Lock className="w-8 h-8 text-success mx-auto mb-2" />
              <p className="font-medium">Autenticação</p>
              <p className="text-sm text-success">Segura</p>
            </div>
            <div className="text-center">
              <Database className="w-8 h-8 text-success mx-auto mb-2" />
              <p className="font-medium">Dados</p>
              <p className="text-sm text-success">Protegidos</p>
            </div>
            <div className="text-center">
              <Globe className="w-8 h-8 text-warning mx-auto mb-2" />
              <p className="font-medium">Rede</p>
              <p className="text-sm text-warning">Monitorada</p>
            </div>
            <div className="text-center">
              <Eye className="w-8 h-8 text-success mx-auto mb-2" />
              <p className="font-medium">Logs</p>
              <p className="text-sm text-success">Ativos</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="threats" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="threats">Ameaças</TabsTrigger>
          <TabsTrigger value="vulnerabilities">Vulnerabilidades</TabsTrigger>
          <TabsTrigger value="access">Controle de Acesso</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="threats">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Ameaças Detectadas</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Scan className="w-4 h-4 mr-2" />
                  Scan Completo
                </Button>
                <Button size="sm">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Investigar Tudo
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {threats.map((threat) => (
                <Card key={threat.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className={`w-5 h-5 ${
                          threat.severity === "critical" ? "text-destructive" :
                            threat.severity === "high" ? "text-warning" :
                              "text-warning"
                        }`} />
                        <div>
                          <h4 className="font-medium">{threat.type}</h4>
                          <p className="text-sm text-muted-foreground">{threat.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getSeverityColor(threat.severity)}>
                          {threat.severity.charAt(0).toUpperCase() + threat.severity.slice(1)}
                        </Badge>
                        <Badge className={getStatusColor(threat.status)}>
                          {threat.status.charAt(0).toUpperCase() + threat.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">{threat.timestamp}</p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Investigar</Button>
                        <Button variant="outline" size="sm">Bloquear</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="vulnerabilities">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Vulnerabilidades</h3>
              <Button size="sm">
                <Scan className="w-4 h-4 mr-2" />
                Nova Varredura
              </Button>
            </div>

            <div className="space-y-3">
              {vulnerabilities.map((vuln) => (
                <Card key={vuln.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{vuln.component}</h4>
                        <p className="text-sm text-muted-foreground">{vuln.issue}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getSeverityColor(vuln.severity)}>
                          {vuln.severity.charAt(0).toUpperCase() + vuln.severity.slice(1)}
                        </Badge>
                        <Badge className={getStatusColor(vuln.status)}>
                          {vuln.status.charAt(0).toUpperCase() + vuln.status.slice(1)}
                        </Badge>
                        <Button variant="outline" size="sm">
                          {vuln.status === "open" ? "Corrigir" : "Detalhes"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="access">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Controle de Acesso</h3>
              <Button size="sm">
                <UserCheck className="w-4 h-4 mr-2" />
                Gerenciar Permissões
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {permissions.map((perm, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{perm.role}</h4>
                      <Badge variant="outline">{perm.users} usuários</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{perm.description}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {perm.permissions.map((permission, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {permission}
                        </Badge>
                      ))}
                    </div>
                    <Button variant="outline" size="sm" className="w-full">
                      Editar Permissões
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="logs">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Logs de Acesso</h3>
              <div className="flex gap-2">
                <Input placeholder="Filtrar logs..." className="w-64" />
                <Button variant="outline" size="sm">
                  <FileText className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              {accessLogs.map((log) => (
                <Card key={log.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {log.result === "success" ? (
                          <CheckCircle className="w-5 h-5 text-success" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-destructive" />
                        )}
                        <div>
                          <p className="font-medium">{log.user}</p>
                          <p className="text-sm text-muted-foreground">{log.action} - {log.resource}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{log.timestamp}</p>
                        <Badge 
                          variant={log.result === "success" ? "default" : "destructive"}
                          className="text-xs"
                        >
                          {log.result === "success" ? "Sucesso" : "Falhou"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="compliance">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Compliance e Regulamentações</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>LGPD Compliance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Consentimentos</span>
                      <CheckCircle className="w-5 h-5 text-success" />
                    </div>
                    <div className="flex justify-between">
                      <span>Políticas de Privacidade</span>
                      <CheckCircle className="w-5 h-5 text-success" />
                    </div>
                    <div className="flex justify-between">
                      <span>Direito ao Esquecimento</span>
                      <CheckCircle className="w-5 h-5 text-success" />
                    </div>
                    <div className="flex justify-between">
                      <span>Relatórios DPO</span>
                      <AlertTriangle className="w-5 h-5 text-warning" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>ISO 27001</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Gestão de Riscos</span>
                      <CheckCircle className="w-5 h-5 text-success" />
                    </div>
                    <div className="flex justify-between">
                      <span>Controles de Segurança</span>
                      <CheckCircle className="w-5 h-5 text-success" />
                    </div>
                    <div className="flex justify-between">
                      <span>Auditoria Interna</span>
                      <AlertTriangle className="w-5 h-5 text-warning" />
                    </div>
                    <div className="flex justify-between">
                      <span>Melhoria Contínua</span>
                      <CheckCircle className="w-5 h-5 text-success" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};