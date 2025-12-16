import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Shield,
  AlertTriangle,
  CheckCircle,
  Lock,
  Eye,
  Database,
  Key,
  Users,
  FileText,
  Globe,
  Clock,
  RefreshCw,
  Info
} from "lucide-react";

interface SecurityCheck {
  id: string;
  category: string;
  title: string;
  status: "passed" | "warning" | "failed" | "info";
  description: string;
  recommendation?: string;
  severity: "low" | "medium" | "high" | "critical";
}

interface SecurityMetrics {
  overallScore: number;
  totalChecks: number;
  passed: number;
  warnings: number;
  failed: number;
  lastScan: Date;
}

export const SecurityDashboard: React.FC = () => {
  const [securityChecks, setSecurityChecks] = useState<SecurityCheck[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const runSecurityScan = async () => {
    setIsScanning(true);
    try {
      // Simulate security scan
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockChecks: SecurityCheck[] = [
        {
          id: "1",
          category: "Authentication",
          title: "Autenticação de Dois Fatores",
          status: "warning",
          description: "2FA não está ativado para todos os usuários",
          recommendation: "Ativar 2FA obrigatório para usuários administrativos",
          severity: "high"
        },
        {
          id: "2",
          category: "Database",
          title: "Criptografia de Dados",
          status: "passed",
          description: "Dados sensíveis estão criptografados em repouso",
          severity: "low"
        },
        {
          id: "3",
          category: "Access Control",
          title: "Controle de Acesso por Função",
          status: "passed",
          description: "Políticas de acesso baseadas em função implementadas",
          severity: "low"
        },
        {
          id: "4",
          category: "Network",
          title: "Certificados SSL/TLS",
          status: "passed",
          description: "Certificados válidos e atualizados",
          severity: "low"
        },
        {
          id: "5",
          category: "Audit",
          title: "Logs de Auditoria",
          status: "warning",
          description: "Alguns eventos de segurança não estão sendo logados",
          recommendation: "Configurar logging para todas as operações sensíveis",
          severity: "medium"
        },
        {
          id: "6",
          category: "Data Protection",
          title: "Backup de Dados",
          status: "passed",
          description: "Backups automáticos configurados e testados",
          severity: "low"
        },
        {
          id: "7",
          category: "Compliance",
          title: "Conformidade LGPD",
          status: "info",
          description: "Revisão de conformidade com LGPD em andamento",
          recommendation: "Completar avaliação de conformidade",
          severity: "medium"
        },
        {
          id: "8",
          category: "Session Management",
          title: "Gerenciamento de Sessão",
          status: "failed",
          description: "Sessões não estão expirando adequadamente",
          recommendation: "Configurar timeout automático de sessão",
          severity: "critical"
        }
      ];

      const passed = mockChecks.filter(c => c.status === "passed").length;
      const warnings = mockChecks.filter(c => c.status === "warning").length;
      const failed = mockChecks.filter(c => c.status === "failed").length;
      const total = mockChecks.length;

      const mockMetrics: SecurityMetrics = {
        overallScore: Math.round(((passed + warnings * 0.5) / total) * 100),
        totalChecks: total,
        passed,
        warnings,
        failed,
        lastScan: new Date()
      };

      setSecurityChecks(mockChecks);
      setMetrics(mockMetrics);
      
      toast({
        title: "Scan de Segurança Concluído",
        description: `${total} verificações realizadas`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao executar scan de segurança",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    runSecurityScan();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
    case "passed": return <CheckCircle className="w-4 h-4 text-green-600" />;
    case "warning": return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
    case "failed": return <AlertTriangle className="w-4 h-4 text-red-600" />;
    default: return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
    case "passed": return "text-green-600 bg-green-50 border-green-200";
    case "warning": return "text-yellow-600 bg-yellow-50 border-yellow-200";
    case "failed": return "text-red-600 bg-red-50 border-red-200";
    default: return "text-blue-600 bg-blue-50 border-blue-200";
    }
  };

  const getSeverityBadge = (severity: string) => {
    const variants = {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-orange-100 text-orange-800",
      critical: "bg-red-100 text-red-800"
    };
    return variants[severity as keyof typeof variants] || variants.low;
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
    case "authentication": return <Key className="w-5 h-5" />;
    case "database": return <Database className="w-5 h-5" />;
    case "access control": return <Users className="w-5 h-5" />;
    case "network": return <Globe className="w-5 h-5" />;
    case "audit": return <Eye className="w-5 h-5" />;
    case "data protection": return <FileText className="w-5 h-5" />;
    case "compliance": return <Shield className="w-5 h-5" />;
    case "session management": return <Clock className="w-5 h-5" />;
    default: return <Shield className="w-5 h-5" />;
    }
  };

  if (!metrics) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <Shield className="w-12 h-12 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">Executando scan de segurança...</p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard de Segurança</h2>
          <p className="text-muted-foreground">
            Monitoramento e análise de segurança do sistema
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Último scan: {metrics.lastScan.toLocaleString("pt-BR")}
          </span>
          <Button onClick={runSecurityScan} disabled={isScanning} variant="outline">
            <RefreshCw className={`w-4 h-4 mr-2 ${isScanning ? "animate-spin" : ""}`} />
            {isScanning ? "Escaneando..." : "Executar Scan"}
          </Button>
        </div>
      </div>

      {/* Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Shield className="w-4 h-4 text-primary" />
              Score Geral
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              metrics.overallScore >= 80 ? "text-green-600" : 
                metrics.overallScore >= 60 ? "text-yellow-600" : "text-red-600"
            }`}>
              {metrics.overallScore}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Segurança geral
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Aprovados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {metrics.passed}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              de {metrics.totalChecks} verificações
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              Avisos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {metrics.warnings}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Necessitam atenção
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              Críticos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {metrics.failed}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Requerem ação imediata
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Critical Issues Alert */}
      {metrics.failed > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Atenção:</strong> {metrics.failed} problema(s) crítico(s) de segurança encontrado(s). 
            Ação imediata necessária.
          </AlertDescription>
        </Alert>
      )}

      {/* Security Checks */}
      <Card>
        <CardHeader>
          <CardTitle>Verificações de Segurança</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {securityChecks.map((check) => (
              <div
                key={check.id}
                className={`p-4 border rounded-lg ${getStatusColor(check.status)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(check.category)}
                      {getStatusIcon(check.status)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{check.title}</h4>
                        <Badge className={getSeverityBadge(check.severity)}>
                          {check.severity}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {check.category}
                        </span>
                      </div>
                      
                      <p className="text-sm mb-2">{check.description}</p>
                      
                      {check.recommendation && (
                        <p className="text-sm font-medium">
                          <strong>Recomendação:</strong> {check.recommendation}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {check.status === "failed" && (
                    <Button size="sm" variant="outline">
                      Corrigir
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityDashboard;