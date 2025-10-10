import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Shield,
  FileText,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Upload,
  Download,
  Eye,
  Edit,
  Search,
  Filter,
  Users,
  Ship,
  Award,
  BookOpen,
  Briefcase,
  Globe,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CertificationRecord {
  id: string;
  type: "vessel" | "crew" | "company";
  category: string;
  certificate_name: string;
  certificate_number: string;
  issuing_authority: string;
  holder_name: string;
  vessel_name?: string;
  issue_date: string;
  expiry_date: string;
  status: "valid" | "expiring" | "expired" | "suspended" | "pending";
  compliance_score: number; // 0-100
  file_url?: string;
  renewal_cost?: number;
  notes?: string;
  last_inspection?: string;
  next_inspection?: string;
  regulatory_body: string;
  risk_level: "low" | "medium" | "high" | "critical";
}

const ComplianceCenter: React.FC = () => {
  const [certificates, setCertificates] = useState<CertificationRecord[]>([]);
  const [selectedCertificate, setSelectedCertificate] = useState<CertificationRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = () => {
    const mockCertificates: CertificationRecord[] = [
      {
        id: "1",
        type: "vessel",
        category: "Safety",
        certificate_name: "Certificado de Segurança para Navios de Passageiros (CSSP)",
        certificate_number: "CSSP-2024-001",
        issuing_authority: "Marinha do Brasil",
        holder_name: "MV Atlântico Explorer",
        vessel_name: "MV Atlântico Explorer",
        issue_date: "2023-01-15",
        expiry_date: "2024-01-15",
        status: "expiring",
        compliance_score: 92,
        renewal_cost: 15000,
        notes: "Renovação agendada para dezembro",
        last_inspection: "2023-12-01",
        next_inspection: "2024-06-01",
        regulatory_body: "IMO/SOLAS",
        risk_level: "medium",
      },
      {
        id: "2",
        type: "crew",
        category: "STCW",
        certificate_name: "Certificado de Competência - Oficial de Convés",
        certificate_number: "STCW-COC-2023-456",
        issuing_authority: "Marinha do Brasil",
        holder_name: "Capitão João Silva",
        issue_date: "2022-03-10",
        expiry_date: "2025-03-10",
        status: "valid",
        compliance_score: 98,
        renewal_cost: 2500,
        regulatory_body: "IMO/STCW",
        risk_level: "low",
      },
      {
        id: "3",
        type: "vessel",
        category: "Environmental",
        certificate_name: "Certificado Internacional de Prevenção da Poluição (IOPP)",
        certificate_number: "IOPP-2023-789",
        issuing_authority: "Marinha do Brasil",
        holder_name: "MV Pacífico Star",
        vessel_name: "MV Pacífico Star",
        issue_date: "2023-06-20",
        expiry_date: "2026-06-20",
        status: "valid",
        compliance_score: 95,
        renewal_cost: 8000,
        last_inspection: "2023-11-15",
        next_inspection: "2024-05-15",
        regulatory_body: "IMO/MARPOL",
        risk_level: "low",
      },
      {
        id: "4",
        type: "crew",
        category: "Medical",
        certificate_name: "Atestado Médico Marítimo",
        certificate_number: "AMM-2023-321",
        issuing_authority: "Médico Credenciado DPC",
        holder_name: "Maria Santos - Oficial de Máquinas",
        issue_date: "2023-08-01",
        expiry_date: "2024-02-01",
        status: "expired",
        compliance_score: 0,
        renewal_cost: 300,
        regulatory_body: "DPC/Marinha",
        risk_level: "critical",
      },
      {
        id: "5",
        type: "company",
        category: "ISM",
        certificate_name: "Certificado de Gestão de Segurança (SMC)",
        certificate_number: "SMC-2023-100",
        issuing_authority: "Bureau Veritas",
        holder_name: "Companhia Marítima XYZ",
        issue_date: "2023-04-15",
        expiry_date: "2026-04-15",
        status: "valid",
        compliance_score: 89,
        renewal_cost: 25000,
        last_inspection: "2023-10-20",
        next_inspection: "2024-04-20",
        regulatory_body: "IMO/ISM Code",
        risk_level: "medium",
      },
    ];

    setCertificates(mockCertificates);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "valid":
        return "bg-success text-success-foreground";
      case "expiring":
        return "bg-warning text-warning-foreground";
      case "expired":
        return "bg-destructive text-destructive-foreground";
      case "suspended":
        return "bg-orange-500 text-white";
      case "pending":
        return "bg-info text-info-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "valid":
        return "Válido";
      case "expiring":
        return "Vencendo";
      case "expired":
        return "Vencido";
      case "suspended":
        return "Suspenso";
      case "pending":
        return "Pendente";
      default:
        return "Desconhecido";
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "text-success";
      case "medium":
        return "text-warning";
      case "high":
        return "text-orange-500";
      case "critical":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "vessel":
        return <Ship className="h-4 w-4" />;
      case "crew":
        return <Users className="h-4 w-4" />;
      case "company":
        return <Briefcase className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "safety":
        return <Shield className="h-4 w-4 text-primary" />;
      case "stcw":
        return <Award className="h-4 w-4 text-success" />;
      case "environmental":
        return <Globe className="h-4 w-4 text-azure-600" />;
      case "medical":
        return <BookOpen className="h-4 w-4 text-info" />;
      case "ism":
        return <CheckCircle className="h-4 w-4 text-warning" />;
      default:
        return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getDaysToExpiry = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const filteredCertificates = certificates.filter(cert => {
    const matchesSearch =
      cert.certificate_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.holder_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.certificate_number.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || cert.status === statusFilter;
    const matchesType = typeFilter === "all" || cert.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Calculate compliance stats
  const stats = {
    total: certificates.length,
    valid: certificates.filter(c => c.status === "valid").length,
    expiring: certificates.filter(c => c.status === "expiring").length,
    expired: certificates.filter(c => c.status === "expired").length,
    avgCompliance:
      certificates.length > 0
        ? Math.round(
            certificates.reduce((sum, c) => sum + c.compliance_score, 0) / certificates.length
          )
        : 0,
    totalRenewalCost: certificates.reduce((sum, c) => sum + (c.renewal_cost || 0), 0),
    criticalRisk: certificates.filter(c => c.risk_level === "critical").length,
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Válidos</p>
                <p className="text-2xl font-bold text-success">{stats.valid}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Vencendo</p>
                <p className="text-2xl font-bold text-warning">{stats.expiring}</p>
              </div>
              <Clock className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Vencidos</p>
                <p className="text-2xl font-bold text-destructive">{stats.expired}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Risco Crítico</p>
                <p className="text-2xl font-bold text-destructive">{stats.criticalRisk}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Conformidade</p>
                <p className="text-2xl font-bold text-primary">{stats.avgCompliance}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Custo Renovação</p>
                <p className="text-lg font-bold text-info">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                    notation: "compact",
                  }).format(stats.totalRenewalCost)}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-info" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Centro de Conformidade
          </h2>
          <p className="text-muted-foreground">
            Gestão completa de certificações e compliance regulatório
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Relatório de Conformidade
          </Button>

          <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Novo Certificado
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Adicionar Certificado</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cert_type">Tipo *</Label>
                    <select className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm">
                      <option value="">Selecione o tipo</option>
                      <option value="vessel">Embarcação</option>
                      <option value="crew">Tripulação</option>
                      <option value="company">Empresa</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="category">Categoria *</Label>
                    <select className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm">
                      <option value="">Selecione a categoria</option>
                      <option value="safety">Segurança</option>
                      <option value="environmental">Ambiental</option>
                      <option value="stcw">STCW</option>
                      <option value="medical">Médico</option>
                      <option value="ism">ISM</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="cert_name">Nome do Certificado *</Label>
                  <Input
                    id="cert_name"
                    placeholder="Ex: Certificado de Segurança para Navios de Passageiros"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cert_number">Número do Certificado *</Label>
                    <Input id="cert_number" placeholder="Ex: CSSP-2024-001" />
                  </div>
                  <div>
                    <Label htmlFor="holder">Portador/Embarcação *</Label>
                    <Input id="holder" placeholder="Nome do portador ou embarcação" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="issue_date">Data de Emissão *</Label>
                    <Input id="issue_date" type="date" />
                  </div>
                  <div>
                    <Label htmlFor="expiry_date">Data de Vencimento *</Label>
                    <Input id="expiry_date" type="date" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="authority">Autoridade Emissora *</Label>
                  <Input id="authority" placeholder="Ex: Marinha do Brasil" />
                </div>

                <div>
                  <Label htmlFor="file">Arquivo do Certificado</Label>
                  <Input id="file" type="file" accept=".pdf,.jpg,.jpeg,.png" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Formatos aceitos: PDF, JPG, PNG (máx. 10MB)
                  </p>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button className="flex-1">
                    <Upload className="h-4 w-4 mr-2" />
                    Salvar Certificado
                  </Button>
                  <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar certificados..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="all">Todos os Status</option>
              <option value="valid">Válidos</option>
              <option value="expiring">Vencendo</option>
              <option value="expired">Vencidos</option>
              <option value="suspended">Suspensos</option>
            </select>

            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="all">Todos os Tipos</option>
              <option value="vessel">Embarcação</option>
              <option value="crew">Tripulação</option>
              <option value="company">Empresa</option>
            </select>

            <Button variant="outline" className="w-full">
              <Filter className="h-4 w-4 mr-2" />
              Filtros Avançados
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Certificates List */}
      <div className="space-y-4">
        {filteredCertificates.map(cert => {
          const daysToExpiry = getDaysToExpiry(cert.expiry_date);

          return (
            <Card key={cert.id} className="hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="flex flex-col items-center gap-2">
                      {getTypeIcon(cert.type)}
                      {getCategoryIcon(cert.category)}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{cert.certificate_name}</h3>
                        <Badge className={getStatusColor(cert.status)} variant="secondary">
                          {getStatusText(cert.status)}
                        </Badge>
                        <Badge variant="outline" className={getRiskColor(cert.risk_level)}>
                          Risco {cert.risk_level}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Portador</p>
                          <p className="text-sm font-medium">{cert.holder_name}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Número</p>
                          <p className="text-sm font-mono">{cert.certificate_number}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Autoridade</p>
                          <p className="text-sm">{cert.issuing_authority}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Vencimento</p>
                          <p className="text-sm font-medium">
                            {new Date(cert.expiry_date).toLocaleDateString("pt-BR")}
                          </p>
                          {daysToExpiry <= 90 && (
                            <p
                              className={`text-xs ${daysToExpiry <= 30 ? "text-destructive" : "text-warning"}`}
                            >
                              {daysToExpiry > 0 ? `${daysToExpiry} dias` : "Vencido"}
                            </p>
                          )}
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Conformidade</p>
                          <div className="flex items-center gap-2">
                            <Progress value={cert.compliance_score} className="h-2 flex-1" />
                            <span className="text-sm font-medium">{cert.compliance_score}%</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Custo Renovação</p>
                          <p className="text-sm font-medium">
                            {cert.renewal_cost
                              ? new Intl.NumberFormat("pt-BR", {
                                  style: "currency",
                                  currency: "BRL",
                                }).format(cert.renewal_cost)
                              : "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Órgão Regulador</p>
                          <p className="text-sm">{cert.regulatory_body}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <Dialog
                      open={showDetailsDialog && selectedCertificate?.id === cert.id}
                      onOpenChange={setShowDetailsDialog}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedCertificate(cert)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalhes
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            {getCategoryIcon(cert.category)}
                            {cert.certificate_name}
                          </DialogTitle>
                        </DialogHeader>

                        {selectedCertificate && (
                          <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-sm font-medium">Status</Label>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge
                                    className={getStatusColor(selectedCertificate.status)}
                                    variant="secondary"
                                  >
                                    {getStatusText(selectedCertificate.status)}
                                  </Badge>
                                  <Badge
                                    variant="outline"
                                    className={getRiskColor(selectedCertificate.risk_level)}
                                  >
                                    Risco {selectedCertificate.risk_level}
                                  </Badge>
                                </div>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Score de Conformidade</Label>
                                <div className="flex items-center gap-2 mt-1">
                                  <Progress
                                    value={selectedCertificate.compliance_score}
                                    className="h-3 flex-1"
                                  />
                                  <span className="text-sm font-medium">
                                    {selectedCertificate.compliance_score}%
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-sm font-medium">Data de Emissão</Label>
                                <p className="text-sm mt-1">
                                  {new Date(selectedCertificate.issue_date).toLocaleDateString(
                                    "pt-BR"
                                  )}
                                </p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Data de Vencimento</Label>
                                <p className="text-sm mt-1">
                                  {new Date(selectedCertificate.expiry_date).toLocaleDateString(
                                    "pt-BR"
                                  )}
                                </p>
                              </div>
                            </div>

                            {selectedCertificate.last_inspection && (
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-sm font-medium">Última Inspeção</Label>
                                  <p className="text-sm mt-1">
                                    {new Date(
                                      selectedCertificate.last_inspection
                                    ).toLocaleDateString("pt-BR")}
                                  </p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Próxima Inspeção</Label>
                                  <p className="text-sm mt-1">
                                    {selectedCertificate.next_inspection
                                      ? new Date(
                                          selectedCertificate.next_inspection
                                        ).toLocaleDateString("pt-BR")
                                      : "N/A"}
                                  </p>
                                </div>
                              </div>
                            )}

                            {selectedCertificate.notes && (
                              <div>
                                <Label className="text-sm font-medium">Observações</Label>
                                <p className="text-sm mt-1 p-3 bg-muted/50 rounded-lg">
                                  {selectedCertificate.notes}
                                </p>
                              </div>
                            )}

                            <div className="flex gap-2">
                              <Button variant="outline" className="flex-1">
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </Button>
                              <Button variant="outline" className="flex-1">
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </Button>
                              <Button className="flex-1">
                                <Calendar className="h-4 w-4 mr-2" />
                                Renovar
                              </Button>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>

                    {cert.file_url && (
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filteredCertificates.length === 0 && (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <div className="text-center">
                <Shield className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">Nenhum certificado encontrado</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ComplianceCenter;
