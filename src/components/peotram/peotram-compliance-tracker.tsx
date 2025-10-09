import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Shield,
  CheckCircle,
  AlertTriangle,
  Clock,
  Award,
  FileCheck,
  TrendingUp,
  BarChart3,
  Calendar,
  AlertCircle,
  RefreshCw,
  Download,
  Plus,
  Eye,
} from "lucide-react";

interface ComplianceRequirement {
  id: string;
  title: string;
  standard: string;
  category: "safety" | "environmental" | "quality" | "security" | "operational";
  status: "compliant" | "non-compliant" | "pending" | "expired";
  priority: "low" | "medium" | "high" | "critical";
  progress: number;
  dueDate: string;
  lastAudit: string;
  nextAudit: string;
  responsible: string;
  description: string;
  actions: string[];
}

interface Certification {
  id: string;
  name: string;
  issuer: string;
  certificateNumber: string;
  issueDate: string;
  expiryDate: string;
  status: "valid" | "expiring" | "expired" | "suspended";
  scope: string;
  category: string;
}

export const PeotramComplianceTracker: React.FC = () => {
  const [requirements, setRequirements] = useState<ComplianceRequirement[]>(getDemoRequirements());
  const [certifications, setCertifications] = useState<Certification[]>(getDemoCertifications());
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  function getDemoRequirements(): ComplianceRequirement[] {
    return [
      {
        id: "REQ001",
        title: "Sistema de Gestão de Segurança (SMS)",
        standard: "ISM Code",
        category: "safety",
        status: "compliant",
        priority: "critical",
        progress: 100,
        dueDate: "2024-12-31",
        lastAudit: "2024-01-15",
        nextAudit: "2024-07-15",
        responsible: "Capitão Silva",
        description:
          "Implementação e manutenção do Sistema de Gestão de Segurança conforme Código ISM",
        actions: [
          "Revisão anual dos procedimentos",
          "Treinamento da tripulação",
          "Auditoria interna semestral",
        ],
      },
      {
        id: "REQ002",
        title: "Prevenção da Poluição por Óleo",
        standard: "MARPOL Anexo I",
        category: "environmental",
        status: "pending",
        priority: "high",
        progress: 75,
        dueDate: "2024-03-30",
        lastAudit: "2023-12-10",
        nextAudit: "2024-06-10",
        responsible: "Eng. Santos",
        description: "Conformidade com requisitos de prevenção da poluição por óleo",
        actions: [
          "Atualização do plano de emergência",
          "Calibração de equipamentos",
          "Treinamento específico",
        ],
      },
      {
        id: "REQ003",
        title: "Segurança Portuária",
        standard: "ISPS Code",
        category: "security",
        status: "non-compliant",
        priority: "critical",
        progress: 40,
        dueDate: "2024-02-28",
        lastAudit: "2024-01-05",
        nextAudit: "2024-04-05",
        responsible: "Of. Segurança",
        description: "Implementação de medidas de segurança portuária",
        actions: [
          "Revisão do plano de segurança",
          "Atualização de credenciais",
          "Treinamento em segurança",
        ],
      },
    ];
  }

  function getDemoCertifications(): Certification[] {
    return [
      {
        id: "CERT001",
        name: "Certificado de Segurança",
        issuer: "Autoridade Marítima Brasileira",
        certificateNumber: "AMB-2024-001",
        issueDate: "2024-01-01",
        expiryDate: "2025-01-01",
        status: "valid",
        scope: "Navegação em águas nacionais",
        category: "Segurança",
      },
      {
        id: "CERT002",
        name: "Certificado de Prevenção da Poluição",
        issuer: "IMO",
        certificateNumber: "IMO-POLL-2023-456",
        issueDate: "2023-06-15",
        expiryDate: "2024-06-15",
        status: "expiring",
        scope: "Prevenção de poluição por óleo",
        category: "Ambiental",
      },
      {
        id: "CERT003",
        name: "Certificado de Gestão de Qualidade",
        issuer: "Bureau Veritas",
        certificateNumber: "BV-QMS-2023-789",
        issueDate: "2023-03-01",
        expiryDate: "2024-03-01",
        status: "expired",
        scope: "Sistema de Gestão da Qualidade ISO 9001",
        category: "Qualidade",
      },
    ];
  }

  const getStatusColor = (status: string) => {
    switch (status) {
    case "compliant":
    case "valid":
      return "bg-success/20 text-success border-success/30";
    case "pending":
    case "expiring":
      return "bg-warning/20 text-warning border-warning/30";
    case "non-compliant":
    case "expired":
      return "bg-destructive/20 text-destructive border-destructive/30";
    case "suspended":
      return "bg-muted/20 text-muted-foreground border-muted/30";
    default:
      return "bg-muted/20 text-muted-foreground border-muted/30";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
    case "critical":
      return "bg-destructive/20 text-destructive border-destructive/30";
    case "high":
      return "bg-warning/20 text-warning border-warning/30";
    case "medium":
      return "bg-info/20 text-info border-info/30";
    case "low":
      return "bg-success/20 text-success border-success/30";
    default:
      return "bg-muted/20 text-muted-foreground border-muted/30";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
    case "safety":
      return <Shield className="w-4 h-4" />;
    case "environmental":
      return <TrendingUp className="w-4 h-4" />;
    case "quality":
      return <Award className="w-4 h-4" />;
    case "security":
      return <AlertTriangle className="w-4 h-4" />;
    case "operational":
      return <BarChart3 className="w-4 h-4" />;
    default:
      return <FileCheck className="w-4 h-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
    case "compliant":
    case "valid":
      return <CheckCircle className="w-4 h-4 text-success" />;
    case "pending":
    case "expiring":
      return <Clock className="w-4 h-4 text-warning" />;
    case "non-compliant":
    case "expired":
      return <AlertCircle className="w-4 h-4 text-destructive" />;
    default:
      return <AlertTriangle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const overallCompliance = Math.round(
    (requirements.filter(req => req.status === "compliant").length / requirements.length) * 100
  );

  const criticalIssues = requirements.filter(
    req => req.priority === "critical" && req.status !== "compliant"
  ).length;

  const expiringCerts = certifications.filter(
    cert => cert.status === "expiring" || cert.status === "expired"
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Conformidade e Certificações</h2>
          <p className="text-muted-foreground">
            Acompanhamento de requisitos regulatórios e certificações
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Relatório
          </Button>
          <Button>
            <RefreshCw className="w-4 h-4 mr-2" />
            Sincronizar
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-success/20">
                <CheckCircle className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Conformidade Geral</p>
                <p className="text-2xl font-bold text-success">{overallCompliance}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-destructive/20">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Questões Críticas</p>
                <p className="text-2xl font-bold text-destructive">{criticalIssues}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-warning/20">
                <Clock className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cert. Expirando</p>
                <p className="text-2xl font-bold text-warning">{expiringCerts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-info/20">
                <Award className="w-6 h-6 text-info" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Certificações</p>
                <p className="text-2xl font-bold text-info">{certifications.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="requirements" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="requirements">Requisitos</TabsTrigger>
          <TabsTrigger value="certifications">Certificações</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        </TabsList>

        <TabsContent value="requirements" className="space-y-4">
          <div className="flex gap-4 mb-4">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                <SelectItem value="safety">Segurança</SelectItem>
                <SelectItem value="environmental">Ambiental</SelectItem>
                <SelectItem value="quality">Qualidade</SelectItem>
                <SelectItem value="security">Segurança Portuária</SelectItem>
                <SelectItem value="operational">Operacional</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="compliant">Conforme</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="non-compliant">Não conforme</SelectItem>
                <SelectItem value="expired">Expirado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            {requirements.map(requirement => (
              <Card key={requirement.id} className="border-l-4 border-l-primary">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getCategoryIcon(requirement.category)}
                      <div>
                        <CardTitle className="text-lg">{requirement.title}</CardTitle>
                        <CardDescription>
                          {requirement.standard} • {requirement.responsible}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className={getPriorityColor(requirement.priority)}>
                        {requirement.priority}
                      </Badge>
                      <Badge variant="outline" className={getStatusColor(requirement.status)}>
                        {getStatusIcon(requirement.status)}
                        <span className="ml-1">{requirement.status}</span>
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{requirement.description}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Progresso</p>
                      <div className="flex items-center gap-2">
                        <Progress value={requirement.progress} className="flex-1" />
                        <span className="font-medium">{requirement.progress}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Vencimento</p>
                      <p className="font-medium">
                        {new Date(requirement.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Última Auditoria</p>
                      <p className="font-medium">
                        {new Date(requirement.lastAudit).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Próxima Auditoria</p>
                      <p className="font-medium">
                        {new Date(requirement.nextAudit).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Ações Necessárias:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {requirement.actions.map((action, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="w-3 h-3 mr-1" />
                      Ver Detalhes
                    </Button>
                    <Button variant="outline" size="sm">
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Atualizar Status
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="certifications" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {certifications.map(cert => (
              <Card key={cert.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{cert.name}</CardTitle>
                      <CardDescription>{cert.issuer}</CardDescription>
                    </div>
                    <Badge variant="outline" className={getStatusColor(cert.status)}>
                      {getStatusIcon(cert.status)}
                      <span className="ml-1">{cert.status}</span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Número</p>
                      <p className="font-medium">{cert.certificateNumber}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Categoria</p>
                      <p className="font-medium">{cert.category}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Emissão</p>
                      <p className="font-medium">{new Date(cert.issueDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Validade</p>
                      <p className="font-medium">
                        {new Date(cert.expiryDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Escopo</p>
                    <p className="text-sm">{cert.scope}</p>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="w-3 h-3 mr-1" />
                      Visualizar
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Download className="w-3 h-3 mr-1" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="dashboard" className="space-y-4">
          <div className="text-center p-8">
            <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Dashboard de Conformidade</h3>
            <p className="text-muted-foreground mb-4">
              Visualizações avançadas e métricas de conformidade
            </p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Criar Dashboard
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
