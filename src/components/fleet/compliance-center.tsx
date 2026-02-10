import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, FileText, Calendar, AlertTriangle, CheckCircle, Clock,
  Upload, Download, Eye, Edit, Search, Filter, Users, Ship,
  Award, BookOpen, Briefcase, Globe, TrendingUp, AlertCircle, Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
  compliance_score: number;
  file_url?: string;
  renewal_cost?: number;
  notes?: string;
  last_inspection?: string;
  next_inspection?: string;
  regulatory_body: string;
  risk_level: "low" | "medium" | "high" | "critical";
}

const ComplianceCenter: React.FC = () => {
  const [selectedCertificate, setSelectedCertificate] = useState<CertificationRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const { toast } = useToast();

  // Fetch real certificates from Supabase
  const { data: rawCerts, isLoading } = useQuery({
    queryKey: ["compliance-certificates"],
    queryFn: async () => {
      const [certsRes, crewRes, vesselsRes] = await Promise.all([
        supabase.from("certificates").select("*").order("expiry_date"),
        supabase.from("crew_members").select("id, employee_id, full_name, vessel_id"),
        supabase.from("vessels").select("id, name"),
      ]);
      return {
        certs: certsRes.data || [],
        crew: crewRes.data || [],
        vessels: vesselsRes.data || [],
      };
    },
    staleTime: 30000,
  });

  // Map real data to CertificationRecord format
  const certificates = useMemo<CertificationRecord[]>(() => {
    if (!rawCerts) return [];
    const { certs, crew, vessels } = rawCerts;
    const vesselMap = new Map(vessels.map(v => [v.id, v.name]));
    const crewByEmpId = new Map(crew.map(c => [c.employee_id, c]));

    const now = new Date();
    return certs.map(cert => {
      const member = crewByEmpId.get(cert.employee_id || "");
      const expiryDate = cert.expiry_date ? new Date(cert.expiry_date) : null;
      const daysToExpiry = expiryDate ? Math.ceil((expiryDate.getTime() - now.getTime()) / 86400000) : 999;

      const status: CertificationRecord["status"] =
        daysToExpiry <= 0 ? "expired"
        : daysToExpiry <= 90 ? "expiring"
        : "valid";

      const riskLevel: CertificationRecord["risk_level"] =
        daysToExpiry <= 14 ? "critical"
        : daysToExpiry <= 30 ? "high"
        : daysToExpiry <= 90 ? "medium"
        : "low";

      return {
        id: cert.id,
        type: "crew" as const,
        category: cert.certificate_type || "General",
        certificate_name: cert.certificate_type || "Certificado",
        certificate_number: cert.certificate_number || cert.id.slice(0, 8),
        issuing_authority: cert.issuing_authority || "—",
        holder_name: member?.full_name || "—",
        vessel_name: member?.vessel_id ? vesselMap.get(member.vessel_id) : undefined,
        issue_date: cert.issue_date || "",
        expiry_date: cert.expiry_date || "",
        status,
        compliance_score: status === "valid" ? 95 : status === "expiring" ? 60 : 0,
        renewal_cost: 0,
        regulatory_body: cert.certificate_type?.includes("STCW") ? "IMO/STCW" : "DPC/Marinha",
        risk_level: riskLevel,
      };
    });
  }, [rawCerts]);

  const getStatusColor = (status: string) => {
    switch (status) {
    case "valid": return "bg-success text-success-foreground";
    case "expiring": return "bg-warning text-warning-foreground";
    case "expired": return "bg-destructive text-destructive-foreground";
    case "suspended": return "bg-orange-500 text-white";
    case "pending": return "bg-info text-info-foreground";
    default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
    case "valid": return "Válido";
    case "expiring": return "Vencendo";
    case "expired": return "Vencido";
    case "suspended": return "Suspenso";
    case "pending": return "Pendente";
    default: return "Desconhecido";
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
    case "low": return "text-success";
    case "medium": return "text-warning";
    case "high": return "text-orange-500";
    case "critical": return "text-destructive";
    default: return "text-muted-foreground";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
    case "vessel": return <Ship className="h-4 w-4" />;
    case "crew": return <Users className="h-4 w-4" />;
    case "company": return <Briefcase className="h-4 w-4" />;
    default: return <FileText className="h-4 w-4" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes("safety") || cat.includes("stcw")) return <Shield className="h-4 w-4 text-primary" />;
    if (cat.includes("medical")) return <BookOpen className="h-4 w-4 text-info" />;
    if (cat.includes("environment")) return <Globe className="h-4 w-4 text-azure-600" />;
    return <Award className="h-4 w-4 text-success" />;
  };

  const getDaysToExpiry = (expiryDate: string) => {
    if (!expiryDate) return 999;
    const expiry = new Date(expiryDate);
    const today = new Date();
    return Math.ceil((expiry.getTime() - today.getTime()) / 86400000);
  };

  const filteredCertificates = certificates.filter(cert => {
    const matchesSearch = cert.certificate_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cert.holder_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cert.certificate_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || cert.status === statusFilter;
    const matchesType = typeFilter === "all" || cert.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const stats = {
    total: certificates.length,
    valid: certificates.filter(c => c.status === "valid").length,
    expiring: certificates.filter(c => c.status === "expiring").length,
    expired: certificates.filter(c => c.status === "expired").length,
    avgCompliance: certificates.length > 0 ? Math.round(certificates.reduce((sum, c) => sum + c.compliance_score, 0) / certificates.length) : 0,
    totalRenewalCost: certificates.reduce((sum, c) => sum + (c.renewal_cost || 0), 0),
    criticalRisk: certificates.filter(c => c.risk_level === "critical").length
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Carregando certificados...</span>
      </div>
    );
  }

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
                    style: "currency", currency: "BRL", notation: "compact"
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
            {certificates.length} certificados registrados no sistema
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
                    <Label>Tipo *</Label>
                    <select className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm">
                      <option value="">Selecione</option>
                      <option value="vessel">Embarcação</option>
                      <option value="crew">Tripulação</option>
                      <option value="company">Empresa</option>
                    </select>
                  </div>
                  <div>
                    <Label>Categoria *</Label>
                    <select className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm">
                      <option value="">Selecione</option>
                      <option value="safety">Segurança</option>
                      <option value="stcw">STCW</option>
                      <option value="medical">Médico</option>
                    </select>
                  </div>
                </div>
                <div>
                  <Label>Nome do Certificado *</Label>
                  <Input placeholder="Ex: Certificado STCW" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Data de Emissão *</Label><Input type="date" /></div>
                  <div><Label>Data de Vencimento *</Label><Input type="date" /></div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button className="flex-1"><Upload className="h-4 w-4 mr-2" />Salvar</Button>
                  <Button variant="outline" onClick={() => setShowUploadDialog(false)}>Cancelar</Button>
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
              <Input placeholder="Buscar certificados..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border border-input bg-background rounded-md text-sm">
              <option value="all">Todos os Status</option>
              <option value="valid">Válidos</option>
              <option value="expiring">Vencendo</option>
              <option value="expired">Vencidos</option>
            </select>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="px-3 py-2 border border-input bg-background rounded-md text-sm">
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
        {filteredCertificates.map((cert) => {
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
                        <Badge className={getStatusColor(cert.status)} variant="secondary">{getStatusText(cert.status)}</Badge>
                        <Badge variant="outline" className={getRiskColor(cert.risk_level)}>Risco {cert.risk_level}</Badge>
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
                            {cert.expiry_date ? new Date(cert.expiry_date).toLocaleDateString("pt-BR") : "—"}
                          </p>
                          {daysToExpiry <= 90 && (
                            <p className={`text-xs ${daysToExpiry <= 30 ? "text-destructive" : "text-warning"}`}>
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
                          <p className="text-xs text-muted-foreground">Órgão Regulador</p>
                          <p className="text-sm">{cert.regulatory_body}</p>
                        </div>
                        {cert.vessel_name && (
                          <div>
                            <p className="text-xs text-muted-foreground">Embarcação</p>
                            <p className="text-sm">{cert.vessel_name}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    <Button variant="outline" size="sm" onClick={() => { setSelectedCertificate(cert); setShowDetailsDialog(true); }}>
                      <Eye className="h-4 w-4 mr-2" />
                      Detalhes
                    </Button>
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

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedCertificate && getCategoryIcon(selectedCertificate.category)}
              {selectedCertificate?.certificate_name}
            </DialogTitle>
          </DialogHeader>
          {selectedCertificate && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={getStatusColor(selectedCertificate.status)} variant="secondary">{getStatusText(selectedCertificate.status)}</Badge>
                    <Badge variant="outline" className={getRiskColor(selectedCertificate.risk_level)}>Risco {selectedCertificate.risk_level}</Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Score de Conformidade</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Progress value={selectedCertificate.compliance_score} className="h-3 flex-1" />
                    <span className="text-sm font-medium">{selectedCertificate.compliance_score}%</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Data de Emissão</Label>
                  <p className="text-sm mt-1">{selectedCertificate.issue_date ? new Date(selectedCertificate.issue_date).toLocaleDateString("pt-BR") : "—"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Data de Vencimento</Label>
                  <p className="text-sm mt-1">{selectedCertificate.expiry_date ? new Date(selectedCertificate.expiry_date).toLocaleDateString("pt-BR") : "—"}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1"><Edit className="h-4 w-4 mr-2" />Editar</Button>
                <Button variant="outline" className="flex-1"><Download className="h-4 w-4 mr-2" />Download</Button>
                <Button className="flex-1"><Calendar className="h-4 w-4 mr-2" />Renovar</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ComplianceCenter;
