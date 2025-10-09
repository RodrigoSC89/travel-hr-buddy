import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Shield,
  Key,
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Users,
  Clock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  level: "low" | "medium" | "high" | "critical";
  enabled: boolean;
  lastUpdated: Date;
}

interface AccessLog {
  id: string;
  user: string;
  action: string;
  integration: string;
  timestamp: Date;
  status: "success" | "failed" | "blocked";
  ipAddress: string;
}

export const IntegrationSecurity: React.FC = () => {
  const [showApiKeys, setShowApiKeys] = useState(false);
  const [securityPolicies, setSecurityPolicies] = useState<SecurityPolicy[]>([
    {
      id: "1",
      name: "Criptografia de Dados",
      description: "Todos os dados em trânsito são criptografados com TLS 1.3",
      level: "high",
      enabled: true,
      lastUpdated: new Date(),
    },
    {
      id: "2",
      name: "Rotação Automática de Tokens",
      description: "Tokens são renovados automaticamente a cada 30 dias",
      level: "medium",
      enabled: true,
      lastUpdated: new Date(),
    },
    {
      id: "3",
      name: "Auditoria de Acessos",
      description: "Log completo de todas as ações de integração",
      level: "critical",
      enabled: true,
      lastUpdated: new Date(),
    },
    {
      id: "4",
      name: "Rate Limiting",
      description: "Limite de requisições por minuto para prevenir ataques",
      level: "medium",
      enabled: false,
      lastUpdated: new Date(),
    },
  ]);

  const [accessLogs] = useState<AccessLog[]>([
    {
      id: "1",
      user: "admin@nautilus.com",
      action: "API Key Generated",
      integration: "Stripe Payment",
      timestamp: new Date(Date.now() - 300000),
      status: "success",
      ipAddress: "192.168.1.100",
    },
    {
      id: "2",
      user: "operador@nautilus.com",
      action: "Integration Test",
      integration: "WhatsApp API",
      timestamp: new Date(Date.now() - 600000),
      status: "failed",
      ipAddress: "192.168.1.101",
    },
    {
      id: "3",
      user: "security@nautilus.com",
      action: "Security Scan",
      integration: "All Integrations",
      timestamp: new Date(Date.now() - 900000),
      status: "success",
      ipAddress: "192.168.1.102",
    },
  ]);

  const { toast } = useToast();

  const getLevelColor = (level: SecurityPolicy["level"]) => {
    switch (level) {
    case "low":
      return "bg-success/10 text-success border-success/20";
    case "medium":
      return "bg-warning/10 text-warning border-warning/20";
    case "high":
      return "bg-primary/10 text-primary border-primary/20";
    case "critical":
      return "bg-destructive/10 text-destructive border-destructive/20";
    }
  };

  const getStatusColor = (status: AccessLog["status"]) => {
    switch (status) {
    case "success":
      return "bg-success/10 text-success border-success/20";
    case "failed":
      return "bg-destructive/10 text-destructive border-destructive/20";
    case "blocked":
      return "bg-warning/10 text-warning border-warning/20";
    }
  };

  const togglePolicy = (id: string) => {
    setSecurityPolicies(prev =>
      prev.map(policy =>
        policy.id === id ? { ...policy, enabled: !policy.enabled, lastUpdated: new Date() } : policy
      )
    );

    const policy = securityPolicies.find(p => p.id === id);
    toast({
      title: "Política Atualizada",
      description: `${policy?.name} foi ${policy?.enabled ? "desativada" : "ativada"}`,
    });
  };

  const runSecurityScan = () => {
    toast({
      title: "Scan de Segurança Iniciado",
      description: "Verificando vulnerabilidades em todas as integrações...",
    });

    // Simular scan
    setTimeout(() => {
      toast({
        title: "Scan Concluído",
        description: "Nenhuma vulnerabilidade crítica encontrada",
      });
    }, 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header de Segurança */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-foreground">
            <Shield className="w-6 h-6 text-primary" />
            Central de Segurança de Integrações
          </CardTitle>
          <CardDescription>
            Monitore e gerencie a segurança de todas as suas integrações
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Status de Segurança */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-success/20 bg-success/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Status Geral</p>
                <p className="text-2xl font-bold text-success">Seguro</p>
              </div>
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Políticas Ativas</p>
                <p className="text-2xl font-bold text-primary">
                  {securityPolicies.filter(p => p.enabled).length}
                </p>
              </div>
              <Lock className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-warning/20 bg-warning/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Alertas</p>
                <p className="text-2xl font-bold text-warning">2</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-nautical/20 bg-nautical/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Último Scan</p>
                <p className="text-sm font-medium text-nautical">2h atrás</p>
              </div>
              <Eye className="w-8 h-8 text-nautical" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Políticas de Segurança */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground">Políticas de Segurança</CardTitle>
            <Button
              onClick={runSecurityScan}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Executar Scan
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {securityPolicies.map(policy => (
              <div
                key={policy.id}
                className="flex items-center justify-between p-4 border border-border/50 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Shield
                      className={`w-5 h-5 ${policy.enabled ? "text-success" : "text-muted-foreground"}`}
                    />
                    <div>
                      <h4 className="font-medium text-foreground">{policy.name}</h4>
                      <p className="text-sm text-muted-foreground">{policy.description}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={getLevelColor(policy.level)}>
                    {policy.level.toUpperCase()}
                  </Badge>
                  <Button
                    variant={policy.enabled ? "default" : "outline"}
                    size="sm"
                    onClick={() => togglePolicy(policy.id)}
                  >
                    {policy.enabled ? "Ativo" : "Inativo"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Gerenciamento de Chaves */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Key className="w-5 h-5 text-primary" />
            Gerenciamento de Chaves API
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <Lock className="w-4 h-4" />
              <AlertDescription>
                Todas as chaves são criptografadas usando AES-256 e armazenadas com segurança.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              {["Stripe Payment API", "WhatsApp Business", "Google Calendar"].map(
                (service, index) => (
                  <div
                    key={service}
                    className="flex items-center justify-between p-3 border border-border/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Key className="w-4 h-4 text-primary" />
                      <div>
                        <p className="font-medium text-foreground">{service}</p>
                        <p className="text-xs text-muted-foreground">
                          {showApiKeys
                            ? `naut_${Math.random().toString(36).substring(2, 15)}`
                            : "••••••••••••••••"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        Ativa
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowApiKeys(!showApiKeys)}
                      >
                        {showApiKeys ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs de Auditoria */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Users className="w-5 h-5 text-primary" />
            Logs de Auditoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {accessLogs.map(log => (
              <div
                key={log.id}
                className="flex items-center justify-between p-3 border border-border/50 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <Badge className={getStatusColor(log.status)}>{log.status}</Badge>
                  <div>
                    <p className="font-medium text-foreground">{log.action}</p>
                    <p className="text-sm text-muted-foreground">
                      {log.user} • {log.integration} • {log.ipAddress}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                    {log.timestamp.toLocaleString("pt-BR")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alertas de Segurança */}
      <Card className="border-warning/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-warning">
            <AlertTriangle className="w-5 h-5" />
            Alertas de Segurança
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Alert className="border-warning/20">
              <Clock className="w-4 h-4" />
              <AlertDescription>
                <strong>Token Expirando:</strong> O token da integração Stripe expira em 5 dias.
                <Button variant="link" className="p-0 h-auto ml-2 text-warning">
                  Renovar agora
                </Button>
              </AlertDescription>
            </Alert>

            <Alert className="border-destructive/20">
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>
                <strong>Múltiplas tentativas de acesso falharam:</strong> 3 tentativas de login
                falharam para a integração WhatsApp API.
                <Button variant="link" className="p-0 h-auto ml-2 text-destructive">
                  Investigar
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
