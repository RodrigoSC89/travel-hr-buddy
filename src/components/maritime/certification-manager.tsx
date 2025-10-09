import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "@/components/ui/calendar";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Download,
  Upload,
  Bell,
  TrendingUp,
  Users,
  Globe,
  Award,
  BookOpen,
  Zap,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Certification {
  id: string;
  name: string;
  type: "STCW" | "Medical" | "Security" | "Safety" | "Technical";
  issuingAuthority: string;
  issueDate: Date;
  expiryDate: Date;
  status: "valid" | "expiring" | "expired" | "pending";
  crewMember: {
    name: string;
    rank: string;
    vessel: string;
  };
  documentUrl?: string;
  renewalCost: number;
  mandatoryFor: string[];
}

interface ComplianceMetric {
  category: string;
  compliance: number;
  total: number;
  critical: number;
}

export const CertificationManager: React.FC = () => {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [activeTab, setActiveTab] = useState("overview");
  const [complianceMetrics, setComplianceMetrics] = useState<ComplianceMetric[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Mock data para demonstração
    const mockCertifications: Certification[] = [
      {
        id: "1",
        name: "Basic Safety Training (BST)",
        type: "STCW",
        issuingAuthority: "Marinha do Brasil",
        issueDate: new Date("2023-01-15"),
        expiryDate: new Date("2028-01-15"),
        status: "valid",
        crewMember: {
          name: "João Silva",
          rank: "AB Seaman",
          vessel: "MV Ocean Pioneer",
        },
        renewalCost: 1500,
        mandatoryFor: ["All Crew"],
      },
      {
        id: "2",
        name: "Medical Certificate",
        type: "Medical",
        issuingAuthority: "Authorized Medical Examiner",
        issueDate: new Date("2023-06-01"),
        expiryDate: new Date("2024-06-01"),
        status: "expiring",
        crewMember: {
          name: "Maria Santos",
          rank: "Cook",
          vessel: "MV Atlantic Star",
        },
        renewalCost: 300,
        mandatoryFor: ["All Crew"],
      },
      {
        id: "3",
        name: "Ship Security Officer (SSO)",
        type: "Security",
        issuingAuthority: "Maritime Security Agency",
        issueDate: new Date("2022-03-10"),
        expiryDate: new Date("2024-03-10"),
        status: "expired",
        crewMember: {
          name: "Carlos Lima",
          rank: "Chief Officer",
          vessel: "MV Ocean Pioneer",
        },
        renewalCost: 2500,
        mandatoryFor: ["Officers"],
      },
    ];

    const mockMetrics: ComplianceMetric[] = [
      { category: "STCW", compliance: 87, total: 45, critical: 3 },
      { category: "Medical", compliance: 92, total: 38, critical: 1 },
      { category: "Security", compliance: 78, total: 25, critical: 5 },
      { category: "Safety", compliance: 94, total: 52, critical: 2 },
      { category: "Technical", compliance: 89, total: 31, critical: 1 },
    ];

    setCertifications(mockCertifications);
    setComplianceMetrics(mockMetrics);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
    case "valid":
      return "text-green-600 bg-green-50 border-green-200";
    case "expiring":
      return "text-yellow-600 bg-yellow-50 border-yellow-200";
    case "expired":
      return "text-red-600 bg-red-50 border-red-200";
    case "pending":
      return "text-blue-600 bg-blue-50 border-blue-200";
    default:
      return "text-muted-foreground bg-gray-50 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
    case "valid":
      return <CheckCircle className="h-4 w-4" />;
    case "expiring":
      return <Clock className="h-4 w-4" />;
    case "expired":
      return <AlertTriangle className="h-4 w-4" />;
    case "pending":
      return <Clock className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
    case "STCW":
      return "bg-blue-500";
    case "Medical":
      return "bg-green-500";
    case "Security":
      return "bg-red-500";
    case "Safety":
      return "bg-yellow-500";
    case "Technical":
      return "bg-purple-500";
    default:
      return "bg-gray-500";
    }
  };

  const getDaysUntilExpiry = (expiryDate: Date) => {
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleBulkRenewal = () => {
    toast({
      title: "🔄 Renovação em Massa",
      description: "Processando renovações automáticas...",
    });
  };

  const handleGenerateReport = () => {
    toast({
      title: "📊 Relatório Gerado",
      description: "Relatório de compliance exportado com sucesso!",
    });
  };

  const expiringCertifications = certifications.filter(cert => {
    const days = getDaysUntilExpiry(cert.expiryDate);
    return days <= 90 && days > 0;
  });

  const expiredCertifications = certifications.filter(
    cert => getDaysUntilExpiry(cert.expiryDate) < 0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            Gestor de Certificações Marítimas
          </h1>
          <p className="text-muted-foreground">
            Compliance automatizado com regulamentações internacionais
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleBulkRenewal}>
            <Zap className="h-4 w-4 mr-2" />
            Renovação Automática
          </Button>
          <Button onClick={handleGenerateReport}>
            <Download className="h-4 w-4 mr-2" />
            Relatório Compliance
          </Button>
        </div>
      </div>

      {/* Alertas Críticos */}
      {(expiringCertifications.length > 0 || expiredCertifications.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {expiredCertifications.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-red-800 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Certificações Vencidas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-red-700 mb-2">
                  {expiredCertifications.length} certificação(ões) vencida(s) - Ação imediata
                  necessária!
                </p>
                <Button variant="destructive" size="sm">
                  <Bell className="h-4 w-4 mr-2" />
                  Notificar Responsáveis
                </Button>
              </CardContent>
            </Card>
          )}

          {expiringCertifications.length > 0 && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-yellow-800 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Certificações Vencendo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-yellow-700 mb-2">
                  {expiringCertifications.length} certificação(ões) vencendo em 90 dias
                </p>
                <Button variant="outline" size="sm" className="border-yellow-500 text-yellow-700">
                  <Calendar className="h-4 w-4 mr-2" />
                  Agendar Renovações
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Métricas de Compliance */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {complianceMetrics.map(metric => (
          <Card key={metric.category}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                {metric.category}
                <Badge className={getTypeColor(metric.category)} variant="secondary">
                  {metric.total}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold">{metric.compliance}%</div>
                <Progress value={metric.compliance} className="h-2" />
                {metric.critical > 0 && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {metric.critical} crítico(s)
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="certifications">Certificações</TabsTrigger>
          <TabsTrigger value="calendar">Calendário</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="training">Treinamentos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Certificações por Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {certifications.map(cert => (
                      <div
                        key={cert.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <Badge className={getTypeColor(cert.type)} variant="secondary">
                            {cert.type}
                          </Badge>
                          <div className="space-y-1">
                            <h4 className="font-semibold">{cert.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {cert.crewMember.name} - {cert.crewMember.rank}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {cert.crewMember.vessel}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <p className="text-sm font-medium">
                              {cert.expiryDate.toLocaleDateString("pt-BR")}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {getDaysUntilExpiry(cert.expiryDate) > 0
                                ? `${getDaysUntilExpiry(cert.expiryDate)} dias`
                                : "Vencido"}
                            </p>
                          </div>
                          <Badge className={getStatusColor(cert.status)}>
                            {getStatusIcon(cert.status)}
                            <span className="ml-1">
                              {cert.status === "valid"
                                ? "Válido"
                                : cert.status === "expiring"
                                  ? "Vencendo"
                                  : cert.status === "expired"
                                    ? "Vencido"
                                    : "Pendente"}
                            </span>
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Estatísticas Gerais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                    <h3 className="text-2xl font-bold text-green-600">89.5%</h3>
                    <p className="text-sm text-green-600">Compliance Geral</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                    <h3 className="text-2xl font-bold text-blue-600">{certifications.length}</h3>
                    <p className="text-sm text-blue-600">Total de Certificações</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg">
                    <h3 className="text-2xl font-bold text-orange-600">
                      R${" "}
                      {certifications
                        .reduce((sum, cert) => sum + cert.renewalCost, 0)
                        .toLocaleString()}
                    </h3>
                    <p className="text-sm text-orange-600">Custo de Renovação</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Próximos Vencimentos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {expiringCertifications.slice(0, 3).map(cert => (
                      <div
                        key={cert.id}
                        className="p-3 bg-yellow-50 rounded-lg border border-yellow-200"
                      >
                        <p className="text-sm font-medium text-yellow-800">{cert.name}</p>
                        <p className="text-xs text-yellow-600">{cert.crewMember.name}</p>
                        <p className="text-xs text-yellow-600">
                          Vence em {getDaysUntilExpiry(cert.expiryDate)} dias
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="certifications">
          <Card>
            <CardHeader>
              <CardTitle>Todas as Certificações</CardTitle>
              <CardDescription>Gestão completa de certificações da tripulação</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4 items-center">
                  <Input placeholder="Buscar certificação..." className="max-w-sm" />
                  <Select>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="valid">Válidos</SelectItem>
                      <SelectItem value="expiring">Vencendo</SelectItem>
                      <SelectItem value="expired">Vencidos</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="STCW">STCW</SelectItem>
                      <SelectItem value="Medical">Medical</SelectItem>
                      <SelectItem value="Security">Security</SelectItem>
                      <SelectItem value="Safety">Safety</SelectItem>
                      <SelectItem value="Technical">Technical</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Certificação
                  </Button>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-4 font-semibold">Certificação</th>
                        <th className="text-left p-4 font-semibold">Tripulante</th>
                        <th className="text-left p-4 font-semibold">Tipo</th>
                        <th className="text-left p-4 font-semibold">Vencimento</th>
                        <th className="text-left p-4 font-semibold">Status</th>
                        <th className="text-left p-4 font-semibold">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {certifications.map(cert => (
                        <tr key={cert.id} className="border-t">
                          <td className="p-4">
                            <div>
                              <p className="font-medium">{cert.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {cert.issuingAuthority}
                              </p>
                            </div>
                          </td>
                          <td className="p-4">
                            <div>
                              <p className="font-medium">{cert.crewMember.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {cert.crewMember.rank}
                              </p>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge className={getTypeColor(cert.type)} variant="secondary">
                              {cert.type}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div>
                              <p className="font-medium">
                                {cert.expiryDate.toLocaleDateString("pt-BR")}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {getDaysUntilExpiry(cert.expiryDate) > 0
                                  ? `${getDaysUntilExpiry(cert.expiryDate)} dias`
                                  : "Vencido"}
                              </p>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge className={getStatusColor(cert.status)}>
                              {getStatusIcon(cert.status)}
                              <span className="ml-1">
                                {cert.status === "valid"
                                  ? "Válido"
                                  : cert.status === "expiring"
                                    ? "Vencendo"
                                    : cert.status === "expired"
                                      ? "Vencido"
                                      : "Pendente"}
                              </span>
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                Renovar
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Calendário de Vencimentos</CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border"
                  />
                </CardContent>
              </Card>
            </div>
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Agenda do Dia</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm font-medium text-blue-800">Renovação BST</p>
                      <p className="text-xs text-blue-600">João Silva - AB Seaman</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm font-medium text-green-800">Exame Médico</p>
                      <p className="text-xs text-green-600">Maria Santos - Cook</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="compliance">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Compliance Internacional
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">STCW Convention</p>
                      <p className="text-sm text-muted-foreground">IMO Regulation</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-2 bg-gray-200 rounded-full">
                        <div className="w-10 h-2 bg-green-500 rounded-full"></div>
                      </div>
                      <span className="text-sm font-medium">87%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">MLC 2006</p>
                      <p className="text-sm text-muted-foreground">Maritime Labour Convention</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-2 bg-gray-200 rounded-full">
                        <div className="w-11 h-2 bg-green-500 rounded-full"></div>
                      </div>
                      <span className="text-sm font-medium">92%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">ISPS Code</p>
                      <p className="text-sm text-muted-foreground">Ship Security</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-2 bg-gray-200 rounded-full">
                        <div className="w-9 h-2 bg-yellow-500 rounded-full"></div>
                      </div>
                      <span className="text-sm font-medium">78%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Relatórios de Auditoria
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Relatório STCW Mensal
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Compliance MLC 2006
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Auditoria PSC
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Certificações Vencendo
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="training">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Treinamentos Disponíveis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">Basic Safety Training Refresher</h4>
                      <Badge variant="outline">Online</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Atualização obrigatória para STCW BST
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">16 horas</span>
                      <Button size="sm">Inscrever</Button>
                    </div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">Medical First Aid</h4>
                      <Badge variant="outline">Presencial</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Primeiros socorros médicos a bordo
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">24 horas</span>
                      <Button size="sm">Inscrever</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Progresso dos Treinamentos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">João Silva - BST Refresher</span>
                      <span className="text-sm text-muted-foreground">75%</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Maria Santos - Medical Aid</span>
                      <span className="text-sm text-muted-foreground">100%</span>
                    </div>
                    <Progress value={100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Carlos Lima - Security Officer</span>
                      <span className="text-sm text-muted-foreground">45%</span>
                    </div>
                    <Progress value={45} className="h-2" />
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
