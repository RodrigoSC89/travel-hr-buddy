import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useCertifications, type Certification } from "@/hooks/useCertificationData";
import {
  Award, 
  AlertTriangle, 
  Calendar, 
  Plus,
  Download,
  Search,
  Bell,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
} from "lucide-react";

interface MaritimeCertificate {
  id: string;
  crew_member_name: string;
  certification_type: string;
  certificate_number: string;
  issuing_authority: string;
  issue_date: string;
  expiry_date: string;
  status: "valid" | "expiring" | "expired" | "pending_renewal";
  document_url?: string;
  renewal_cost?: number;
  issuing_country: string;
  notes?: string;
}

interface CertificationAlert {
  id: string;
  certificate_id: string;
  crew_member_name: string;
  certification_type: string;
  expiry_date: string;
  days_until_expiry: number;
  alert_type: "expiring_soon" | "expired" | "renewal_required";
}

function mapCertToLocal(cert: Certification): MaritimeCertificate {
  return {
    id: cert.id,
    crew_member_name: cert.crewMember.name,
    certification_type: cert.name,
    certificate_number: cert.name,
    issuing_authority: cert.issuingAuthority,
    issue_date: cert.issueDate.toISOString().split("T")[0],
    expiry_date: cert.expiryDate.toISOString().split("T")[0],
    status: cert.status === "pending" ? "pending_renewal" : cert.status,
    document_url: cert.documentUrl,
    renewal_cost: cert.renewalCost,
    issuing_country: "Brasil",
  };
}

function buildAlerts(certs: MaritimeCertificate[]): CertificationAlert[] {
  const now = new Date();
  return certs
    .filter(c => c.status === "expiring" || c.status === "expired")
    .map(c => {
      const days = Math.ceil((new Date(c.expiry_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return {
        id: c.id,
        certificate_id: c.id,
        crew_member_name: c.crew_member_name,
        certification_type: c.certification_type,
        expiry_date: c.expiry_date,
        days_until_expiry: days,
        alert_type: days < 0 ? "expired" as const : "expiring_soon" as const,
      };
    })
    .sort((a, b) => a.days_until_expiry - b.days_until_expiry);
}

export const MaritimeCertificationManager = () => {
  const { data: rawCerts, isLoading: loading } = useCertifications();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

  const certificates = useMemo(() => (rawCerts || []).map(mapCertToLocal), [rawCerts]);
  const alerts = useMemo(() => buildAlerts(certificates), [certificates]);

  const getStatusColor = (status: MaritimeCertificate["status"]) => {
    switch (status) {
    case "valid": return "bg-success";
    case "expiring": return "bg-warning";
    case "expired": return "bg-destructive";
    case "pending_renewal": return "bg-warning";
    default: return "bg-muted-foreground";
    }
  };

  const getStatusText = (status: MaritimeCertificate["status"]) => {
    switch (status) {
    case "valid": return "Válida";
    case "expiring": return "Vencendo";
    case "expired": return "Vencida";
    case "pending_renewal": return "Renovação Pendente";
    default: return "Desconhecido";
    }
  };

  const getAlertColor = (alertType: CertificationAlert["alert_type"]) => {
    switch (alertType) {
    case "expiring_soon": return "bg-warning/10 border-warning text-warning";
    case "expired": return "bg-destructive/10 border-destructive text-destructive";
    case "renewal_required": return "bg-warning/10 border-warning text-warning";
    default: return "bg-secondary border-muted text-secondary-foreground";
    }
  };

  const filteredCertificates = certificates.filter(cert => {
    const matchesSearch = cert.crew_member_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cert.certification_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || cert.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: certificates.length,
    valid: certificates.filter(c => c.status === "valid").length,
    expiring: certificates.filter(c => c.status === "expiring").length,
    expired: certificates.filter(c => c.status === "expired").length,
    pending: certificates.filter(c => c.status === "pending_renewal").length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Certificações Marítimas</h2>
          <p className="text-muted-foreground">
            Gerencie certificações da tripulação e alertas de vencimento
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nova Certificação
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Adicionar Nova Certificação</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <Label>Membro da Tripulação</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar tripulante" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="joao">João Silva</SelectItem>
                      <SelectItem value="maria">Maria Santos</SelectItem>
                      <SelectItem value="carlos">Carlos Oliveira</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Tipo de Certificação</Label>
                  <Input placeholder="Ex: STCW Basic Safety" />
                </div>
                
                <div>
                  <Label>Número do Certificado</Label>
                  <Input placeholder="Ex: BST-2024-001" />
                </div>
                
                <div>
                  <Label>Autoridade Emissora</Label>
                  <Input placeholder="Ex: Marinha do Brasil" />
                </div>
                
                <div>
                  <Label>Data de Emissão</Label>
                  <Input type="date" />
                </div>
                
                <div>
                  <Label>Data de Vencimento</Label>
                  <Input type="date" />
                </div>
                
                <div className="col-span-2">
                  <Label>Observações</Label>
                  <Textarea placeholder="Observações adicionais..." />
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => setIsAddDialogOpen(false)}>
                  Salvar Certificação
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Award className="h-8 w-8 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-success" />
            <div className="text-2xl font-bold">{stats.valid}</div>
            <div className="text-sm text-muted-foreground">Válidas</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 mx-auto mb-2 text-warning" />
            <div className="text-2xl font-bold">{stats.expiring}</div>
            <div className="text-sm text-muted-foreground">Vencendo</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <XCircle className="h-8 w-8 mx-auto mb-2 text-destructive" />
            <div className="text-2xl font-bold">{stats.expired}</div>
            <div className="text-sm text-muted-foreground">Vencidas</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-warning" />
            <div className="text-2xl font-bold">{stats.pending}</div>
            <div className="text-sm text-muted-foreground">Pendentes</div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-warning" />
              Alertas Críticos ({alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border-2 ${getAlertColor(alert.alert_type)}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{alert.crew_member_name}</h4>
                      <p className="text-sm">{alert.certification_type}</p>
                      <p className="text-xs">
                        Vencimento: {new Date(alert.expiry_date).toLocaleDateString()}
                        {alert.days_until_expiry > 0 
                          ? ` (${alert.days_until_expiry} dias)` 
                          : ` (vencida há ${Math.abs(alert.days_until_expiry)} dias)`
                        }
                      </p>
                    </div>
                    
                    <Button size="sm" variant="outline">
                      Ação Necessária
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="expiring">Vencendo</TabsTrigger>
          <TabsTrigger value="expired">Vencidas</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por tripulante ou certificação..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Status</SelectItem>
                    <SelectItem value="valid">Válidas</SelectItem>
                    <SelectItem value="expiring">Vencendo</SelectItem>
                    <SelectItem value="expired">Vencidas</SelectItem>
                    <SelectItem value="pending_renewal">Renovação Pendente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Certificates List */}
          <Card>
            <CardHeader>
              <CardTitle>Certificações Registradas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredCertificates.map((cert) => (
                  <div key={cert.id} className="border rounded-lg p-4 hover:bg-accent transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <Award className="h-6 w-6 text-primary" />
                        </div>
                        
                        <div>
                          <h3 className="font-semibold">{cert.crew_member_name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {cert.certification_type}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {cert.certificate_number} • {cert.issuing_authority}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <Badge className={`${getStatusColor(cert.status)} text-azure-50`}>
                            {getStatusText(cert.status)}
                          </Badge>
                          <div className="text-xs text-muted-foreground mt-1">
                            Vence: {new Date(cert.expiry_date).toLocaleDateString()}
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <FileText className="h-3 w-3 mr-1" />
                            Ver
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-3 w-3 mr-1" />
                            Baixar
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {cert.notes && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm text-muted-foreground">
                          <strong>Observações:</strong> {cert.notes}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expiring" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-warning">Certificações Vencendo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {certificates.filter(c => c.status === "expiring").map((cert) => (
                  <div key={cert.id} className="border-l-4 border-warning bg-warning/5 p-4 rounded">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{cert.crew_member_name}</h3>
                        <p className="text-sm">{cert.certification_type}</p>
                        <p className="text-xs text-warning">
                          Vencimento: {new Date(cert.expiry_date).toLocaleDateString()}
                        </p>
                      </div>
                      <Button variant="outline" className="border-warning text-warning">
                        Renovar Agora
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expired" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-destructive">Certificações Vencidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {certificates.filter(c => c.status === "expired").map((cert) => (
                  <div key={cert.id} className="border-l-4 border-destructive bg-destructive/5 p-4 rounded">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{cert.crew_member_name}</h3>
                        <p className="text-sm">{cert.certification_type}</p>
                        <p className="text-xs text-destructive">
                          Vencida em: {new Date(cert.expiry_date).toLocaleDateString()}
                        </p>
                      </div>
                      <Button variant="destructive">
                        Renovação Urgente
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Relatórios de Certificações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-dashed">
                  <CardContent className="p-4 text-center">
                    <FileText className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <h4 className="font-medium text-sm mb-1">Certificações por Status</h4>
                    <p className="text-xs text-muted-foreground mb-3">Resumo de todas as certificações ativas, expiradas e pendentes</p>
                    <Button size="sm" className="w-full" onClick={() => {
                      const rows = ["Tripulante,Certificação,Número,Validade,Status"];
                      (certificates || []).forEach((c) => {
                        rows.push(`"${c.crew_member_name || ''}","${c.certification_type || ''}","${c.certificate_number || ''}","${c.expiry_date || ''}","${c.status || ''}"`);
                      });
                      const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a"); a.href = url; a.download = `certificacoes-status-${new Date().toISOString().split('T')[0]}.csv`; a.click(); URL.revokeObjectURL(url);
                      toast({ title: "📄 Relatório exportado", description: "CSV de certificações por status baixado." });
                    }}>
                      <Download className="h-4 w-4 mr-1" /> Exportar CSV
                    </Button>
                  </CardContent>
                </Card>
                <Card className="border-dashed">
                  <CardContent className="p-4 text-center">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-warning" />
                    <h4 className="font-medium text-sm mb-1">Certificações Expirando</h4>
                    <p className="text-xs text-muted-foreground mb-3">Certificações que expiram nos próximos 90 dias</p>
                    <Button size="sm" variant="outline" className="w-full" onClick={() => {
                      const expiring = (certificates || []).filter((c) => c.status === 'expiring' || c.status === 'expired');
                      const rows = ["Tripulante,Certificação,Validade,Status"];
                      expiring.forEach((c) => {
                        rows.push(`"${c.crew_member_name || ''}","${c.certification_type || ''}","${c.expiry_date || ''}","${c.status || ''}"`);
                      });
                      const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a"); a.href = url; a.download = `certificacoes-expirando-${new Date().toISOString().split('T')[0]}.csv`; a.click(); URL.revokeObjectURL(url);
                      toast({ title: "⚠️ Relatório exportado", description: `${expiring.length} certificações expirando/expiradas.` });
                    }}>
                      <Download className="h-4 w-4 mr-1" /> Exportar
                    </Button>
                  </CardContent>
                </Card>
                <Card className="border-dashed">
                  <CardContent className="p-4 text-center">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 text-success" />
                    <h4 className="font-medium text-sm mb-1">Compliance STCW</h4>
                    <p className="text-xs text-muted-foreground mb-3">Relatório de conformidade STCW da tripulação</p>
                    <Button size="sm" variant="outline" className="w-full" onClick={() => {
                      const valid = (certificates || []).filter((c) => c.status === 'valid');
                      const total = (certificates || []).length;
                      const score = total > 0 ? ((valid.length / total) * 100).toFixed(1) : '0';
                      navigator.clipboard.writeText(`Compliance STCW: ${score}% | ${valid.length}/${total} certificações válidas | Data: ${new Date().toLocaleDateString('pt-BR')}`);
                      toast({ title: "✅ Compliance STCW", description: `Score: ${score}% — ${valid.length}/${total} válidas. Dados copiados.` });
                    }}>
                      <FileText className="h-4 w-4 mr-1" /> Gerar
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};