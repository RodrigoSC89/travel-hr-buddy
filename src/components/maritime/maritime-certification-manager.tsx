import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Award,
  AlertTriangle,
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

export const MaritimeCertificationManager = () => {
  const [certificates, setCertificates] = useState<MaritimeCertificate[]>([]);
  const [alerts, setAlerts] = useState<CertificationAlert[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadCertifications();
    loadAlerts();
  }, []);

  const loadCertifications = async () => {
    try {
      setLoading(true);

      // Simulando dados de certificações marítimas
      const mockCertificates: MaritimeCertificate[] = [
        {
          id: "1",
          crew_member_name: "João Silva",
          certification_type: "STCW Basic Safety Training",
          certificate_number: "BST-2024-001",
          issuing_authority: "Marinha do Brasil",
          issue_date: "2023-01-15",
          expiry_date: "2028-01-15",
          status: "valid",
          issuing_country: "Brasil",
          renewal_cost: 1500,
          notes: "Renovação automática disponível",
        },
        {
          id: "2",
          crew_member_name: "Maria Santos",
          certification_type: "Chief Officer License",
          certificate_number: "COL-2023-045",
          issuing_authority: "IMO",
          issue_date: "2023-06-01",
          expiry_date: "2024-12-31",
          status: "expiring",
          issuing_country: "Brasil",
          renewal_cost: 2500,
          notes: "Renovação urgente necessária",
        },
        {
          id: "3",
          crew_member_name: "Carlos Oliveira",
          certification_type: "Medical Certificate",
          certificate_number: "MED-2023-123",
          issuing_authority: "Autoridade Portuária",
          issue_date: "2023-03-10",
          expiry_date: "2024-03-10",
          status: "expired",
          issuing_country: "Brasil",
          renewal_cost: 800,
          notes: "Exame médico necessário",
        },
        {
          id: "4",
          crew_member_name: "Ana Costa",
          certification_type: "Radio Operator License",
          certificate_number: "ROL-2024-078",
          issuing_authority: "ANATEL",
          issue_date: "2024-01-20",
          expiry_date: "2026-01-20",
          status: "valid",
          issuing_country: "Brasil",
          renewal_cost: 600,
        },
      ];

      setCertificates(mockCertificates);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar certificações",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAlerts = async () => {
    try {
      // Simulando alertas baseados nas certificações
      const mockAlerts: CertificationAlert[] = [
        {
          id: "1",
          certificate_id: "2",
          crew_member_name: "Maria Santos",
          certification_type: "Chief Officer License",
          expiry_date: "2024-12-31",
          days_until_expiry: 45,
          alert_type: "expiring_soon",
        },
        {
          id: "2",
          certificate_id: "3",
          crew_member_name: "Carlos Oliveira",
          certification_type: "Medical Certificate",
          expiry_date: "2024-03-10",
          days_until_expiry: -50,
          alert_type: "expired",
        },
      ];

      setAlerts(mockAlerts);
    } catch (error) {
      console.warn("[EMPTY CATCH]", error);
    }
  };

  const getStatusColor = (status: MaritimeCertificate["status"]) => {
    switch (status) {
      case "valid":
        return "bg-green-500";
      case "expiring":
        return "bg-yellow-500";
      case "expired":
        return "bg-red-500";
      case "pending_renewal":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: MaritimeCertificate["status"]) => {
    switch (status) {
      case "valid":
        return "Válida";
      case "expiring":
        return "Vencendo";
      case "expired":
        return "Vencida";
      case "pending_renewal":
        return "Renovação Pendente";
      default:
        return "Desconhecido";
    }
  };

  const getAlertColor = (alertType: CertificationAlert["alert_type"]) => {
    switch (alertType) {
      case "expiring_soon":
        return "bg-yellow-100 border-yellow-500 text-yellow-800";
      case "expired":
        return "bg-red-100 border-red-500 text-red-800";
      case "renewal_required":
        return "bg-orange-100 border-orange-500 text-orange-800";
      default:
        return "bg-secondary border-muted text-secondary-foreground";
    }
  };

  const filteredCertificates = certificates.filter(cert => {
    const matchesSearch =
      cert.crew_member_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.certification_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || cert.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: certificates.length,
    valid: certificates.filter(c => c.status === "valid").length,
    expiring: certificates.filter(c => c.status === "expiring").length,
    expired: certificates.filter(c => c.status === "expired").length,
    pending: certificates.filter(c => c.status === "pending_renewal").length,
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
                <Button onClick={() => setIsAddDialogOpen(false)}>Salvar Certificação</Button>
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
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold">{stats.valid}</div>
            <div className="text-sm text-muted-foreground">Válidas</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
            <div className="text-2xl font-bold">{stats.expiring}</div>
            <div className="text-sm text-muted-foreground">Vencendo</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <XCircle className="h-8 w-8 mx-auto mb-2 text-red-600" />
            <div className="text-2xl font-bold">{stats.expired}</div>
            <div className="text-sm text-muted-foreground">Vencidas</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-orange-600" />
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
              <Bell className="h-5 w-5 text-orange-500" />
              Alertas Críticos ({alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map(alert => (
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
                          : ` (vencida há ${Math.abs(alert.days_until_expiry)} dias)`}
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
                      onChange={e => setSearchTerm(e.target.value)}
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
                {filteredCertificates.map(cert => (
                  <div
                    key={cert.id}
                    className="border rounded-lg p-4 hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <Award className="h-6 w-6 text-primary" />
                        </div>

                        <div>
                          <h3 className="font-semibold">{cert.crew_member_name}</h3>
                          <p className="text-sm text-muted-foreground">{cert.certification_type}</p>
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
              <CardTitle className="text-yellow-600">Certificações Vencendo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {certificates
                  .filter(c => c.status === "expiring")
                  .map(cert => (
                    <div
                      key={cert.id}
                      className="border-l-4 border-yellow-500 bg-yellow-50 p-4 rounded"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{cert.crew_member_name}</h3>
                          <p className="text-sm">{cert.certification_type}</p>
                          <p className="text-xs text-yellow-700">
                            Vencimento: {new Date(cert.expiry_date).toLocaleDateString()}
                          </p>
                        </div>
                        <Button variant="outline" className="border-yellow-500 text-yellow-700">
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
              <CardTitle className="text-red-600">Certificações Vencidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {certificates
                  .filter(c => c.status === "expired")
                  .map(cert => (
                    <div key={cert.id} className="border-l-4 border-red-500 bg-red-50 p-4 rounded">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{cert.crew_member_name}</h3>
                          <p className="text-sm">{cert.certification_type}</p>
                          <p className="text-xs text-red-700">
                            Vencida em: {new Date(cert.expiry_date).toLocaleDateString()}
                          </p>
                        </div>
                        <Button variant="destructive">Renovação Urgente</Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Relatórios de Certificações</h3>
              <p className="text-muted-foreground">Relatórios detalhados em desenvolvimento</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
