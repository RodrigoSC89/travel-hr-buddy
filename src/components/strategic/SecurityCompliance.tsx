import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Shield,
  Lock,
  Eye,
  FileText,
  UserCheck,
  AlertTriangle,
  CheckCircle,
  Clock,
  Globe,
  Key,
} from "lucide-react";

interface SecurityFeature {
  id: string;
  name: string;
  description: string;
  status: "active" | "pending" | "disabled";
  priority: "high" | "medium" | "low";
  compliance: string[];
}

interface ComplianceStandard {
  id: string;
  name: string;
  description: string;
  coverage: number;
  requirements: number;
  completed: number;
  status: "compliant" | "in-progress" | "non-compliant";
}

export const SecurityCompliance = () => {
  const securityFeatures: SecurityFeature[] = [
    {
      id: "1",
      name: "Autenticação Multifator (MFA)",
      description: "Autenticação de dois fatores obrigatória para todos os usuários",
      status: "active",
      priority: "high",
      compliance: ["LGPD", "ISO 27001"],
    },
    {
      id: "2",
      name: "Criptografia de Dados",
      description: "Criptografia AES-256 em repouso e TLS 1.3 em trânsito",
      status: "active",
      priority: "high",
      compliance: ["LGPD", "GDPR", "SOX"],
    },
    {
      id: "3",
      name: "Auditoria de Ações",
      description: "Log completo de todas as ações de usuários com rastreabilidade",
      status: "active",
      priority: "high",
      compliance: ["ISM Code", "SOX"],
    },
    {
      id: "4",
      name: "Controle de Acesso (RBAC)",
      description: "Controle baseado em funções com permissões granulares",
      status: "active",
      priority: "medium",
      compliance: ["LGPD", "ISO 27001"],
    },
    {
      id: "5",
      name: "Detecção de Anomalias",
      description: "IA para detectar comportamentos suspeitos automaticamente",
      status: "pending",
      priority: "medium",
      compliance: ["ISO 27001"],
    },
    {
      id: "6",
      name: "Backup Automático",
      description: "Backup diário com retenção de 7 anos e teste de restauração",
      status: "active",
      priority: "high",
      compliance: ["LGPD", "ISM Code"],
    },
  ];

  const complianceStandards: ComplianceStandard[] = [
    {
      id: "1",
      name: "LGPD (Lei Geral de Proteção de Dados)",
      description: "Conformidade com a legislação brasileira de proteção de dados",
      coverage: 95,
      requirements: 84,
      completed: 80,
      status: "compliant",
    },
    {
      id: "2",
      name: "GDPR (General Data Protection Regulation)",
      description: "Conformidade com a regulamentação europeia de proteção de dados",
      coverage: 88,
      requirements: 99,
      completed: 87,
      status: "in-progress",
    },
    {
      id: "3",
      name: "ISM Code (International Safety Management)",
      description: "Código internacional de gestão de segurança marítima",
      coverage: 92,
      requirements: 156,
      completed: 143,
      status: "compliant",
    },
    {
      id: "4",
      name: "ISO 27001 (Information Security)",
      description: "Padrão internacional de gestão de segurança da informação",
      coverage: 78,
      requirements: 114,
      completed: 89,
      status: "in-progress",
    },
    {
      id: "5",
      name: "SOX (Sarbanes-Oxley Act)",
      description: "Conformidade com controles financeiros e auditoria",
      coverage: 85,
      requirements: 48,
      completed: 41,
      status: "in-progress",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
    case "active":
    case "compliant":
      return "bg-success text-success-foreground";
    case "pending":
    case "in-progress":
      return "bg-warning text-warning-foreground";
    case "disabled":
    case "non-compliant":
      return "bg-danger text-danger-foreground";
    default:
      return "bg-muted text-muted-foreground";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
    case "high":
      return "bg-danger text-danger-foreground";
    case "medium":
      return "bg-warning text-warning-foreground";
    case "low":
      return "bg-info text-info-foreground";
    default:
      return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
    case "active":
    case "compliant":
      return <CheckCircle className="h-4 w-4 text-success" />;
    case "pending":
    case "in-progress":
      return <Clock className="h-4 w-4 text-warning" />;
    case "disabled":
    case "non-compliant":
      return <AlertTriangle className="h-4 w-4 text-danger" />;
    default:
      return <Shield className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Segurança & Compliance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-success">98%</div>
              <div className="text-sm text-muted-foreground">Score de Segurança</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-info">5</div>
              <div className="text-sm text-muted-foreground">Padrões de Compliance</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">2</div>
              <div className="text-sm text-muted-foreground">Pendências</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">24/7</div>
              <div className="text-sm text-muted-foreground">Monitoramento</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Features */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            Funcionalidades de Segurança
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {securityFeatures.map(feature => (
              <div key={feature.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(feature.status)}
                    <div>
                      <h4 className="font-semibold">{feature.name}</h4>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={feature.status === "active"}
                      disabled={feature.status === "pending"}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Badge className={getStatusColor(feature.status)}>{feature.status}</Badge>
                    <Badge className={getPriorityColor(feature.priority)}>{feature.priority}</Badge>
                  </div>
                  <div className="flex gap-1">
                    {feature.compliance.map(standard => (
                      <Badge key={standard} variant="outline" className="text-xs">
                        {standard}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Compliance Standards */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Padrões de Compliance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {complianceStandards.map(standard => (
              <div key={standard.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(standard.status)}
                    <div>
                      <h4 className="font-semibold">{standard.name}</h4>
                      <p className="text-sm text-muted-foreground">{standard.description}</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(standard.status)}>
                    {standard.coverage}% compliant
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progresso:</span>
                    <span>
                      {standard.completed}/{standard.requirements} requisitos
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${standard.coverage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Actions */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-primary" />
            Ações de Segurança
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Eye className="h-6 w-6" />
              <span>Auditoria de Logs</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Key className="h-6 w-6" />
              <span>Gestão de Chaves</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Globe className="h-6 w-6" />
              <span>Relatório de Compliance</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
