import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Search, 
  Download, 
  Plus,
  FileText,
  Calendar,
  User,
  RefreshCw
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

interface Certification {
  id: string;
  crewMemberId: string;
  crewMemberName: string;
  type: string;
  number: string;
  issueDate: string;
  expiryDate: string;
  issuingAuthority: string;
  status: "valid" | "expiring" | "expired";
  daysUntilExpiry: number;
}

const demoCertifications: Certification[] = [
  {
    id: "1",
    crewMemberId: "1",
    crewMemberName: "João Silva",
    type: "STCW - Marinheiro Qualificado",
    number: "STCW-2024-001",
    issueDate: "2023-01-15",
    expiryDate: "2025-01-15",
    issuingAuthority: "Marinha do Brasil",
    status: "valid",
    daysUntilExpiry: 405
  },
  {
    id: "2",
    crewMemberId: "1",
    crewMemberName: "João Silva",
    type: "Certificado de Comandante",
    number: "CMD-2024-001",
    issueDate: "2022-06-01",
    expiryDate: "2024-12-20",
    issuingAuthority: "Marinha do Brasil",
    status: "expiring",
    daysUntilExpiry: 14
  },
  {
    id: "3",
    crewMemberId: "2",
    crewMemberName: "Carlos Santos",
    type: "Certificado de Máquinas",
    number: "ENG-2024-002",
    issueDate: "2023-03-10",
    expiryDate: "2025-03-10",
    issuingAuthority: "Marinha do Brasil",
    status: "valid",
    daysUntilExpiry: 459
  },
  {
    id: "4",
    crewMemberId: "3",
    crewMemberName: "Maria Oliveira",
    type: "STCW - Oficial de Navegação",
    number: "STCW-2024-003",
    issueDate: "2022-01-01",
    expiryDate: "2024-11-30",
    issuingAuthority: "Marinha do Brasil",
    status: "expired",
    daysUntilExpiry: -6
  },
  {
    id: "5",
    crewMemberId: "4",
    crewMemberName: "Pedro Costa",
    type: "Certificado de Segurança Marítima",
    number: "SEG-2024-004",
    issueDate: "2023-06-01",
    expiryDate: "2025-06-01",
    issuingAuthority: "ANTAQ",
    status: "valid",
    daysUntilExpiry: 542
  },
  {
    id: "6",
    crewMemberId: "2",
    crewMemberName: "Carlos Santos",
    type: "Certificado de Combate a Incêndio",
    number: "FIRE-2024-002",
    issueDate: "2023-02-15",
    expiryDate: "2024-12-25",
    issuingAuthority: "Corpo de Bombeiros",
    status: "expiring",
    daysUntilExpiry: 19
  }
];

interface CrewCertificationsManagerProps {
  crewMembers?: any[];
}

export function CrewCertificationsManager({ crewMembers = [] }: CrewCertificationsManagerProps) {
  const [certifications] = useState<Certification[]>(demoCertifications);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
    case "valid": return "bg-success text-success-foreground";
    case "expiring": return "bg-warning text-warning-foreground";
    case "expired": return "bg-destructive text-destructive-foreground";
    default: return "bg-muted";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
    case "valid": return "Válido";
    case "expiring": return "Vencendo";
    case "expired": return "Vencido";
    default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
    case "valid": return <CheckCircle className="h-4 w-4" />;
    case "expiring": return <Clock className="h-4 w-4" />;
    case "expired": return <AlertTriangle className="h-4 w-4" />;
    default: return null;
    }
  };

  const filteredCertifications = certifications.filter(cert => {
    const matchesSearch = 
      cert.crewMemberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || cert.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: certifications.length,
    valid: certifications.filter(c => c.status === "valid").length,
    expiring: certifications.filter(c => c.status === "expiring").length,
    expired: certifications.filter(c => c.status === "expired").length,
    complianceRate: Math.round((certifications.filter(c => c.status === "valid").length / certifications.length) * 100)
  };

  const handleAddCertification = () => {
    toast({
      title: "Certificação adicionada",
      description: "Nova certificação registrada com sucesso",
    });
    setIsAddDialogOpen(false);
  };

  const handleRenew = (certId: string) => {
    toast({
      title: "Renovação iniciada",
      description: "Processo de renovação iniciado. Você receberá notificações sobre o andamento.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Shield className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
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
          <CardContent className="pt-6">
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
          <CardContent className="pt-6">
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
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Conformidade</p>
                <p className="text-2xl font-bold">{stats.complianceRate}%</p>
              </div>
              <div className="w-12">
                <Progress value={stats.complianceRate} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Gestão de Certificações
              </CardTitle>
              <CardDescription>
                Controle de certificações STCW, MLC e documentos obrigatórios
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Certificação
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Adicionar Certificação</DialogTitle>
                    <DialogDescription>
                      Registre uma nova certificação para um tripulante
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="crew">Tripulante</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tripulante" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">João Silva</SelectItem>
                          <SelectItem value="2">Carlos Santos</SelectItem>
                          <SelectItem value="3">Maria Oliveira</SelectItem>
                          <SelectItem value="4">Pedro Costa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Tipo de Certificação</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="stcw">STCW</SelectItem>
                          <SelectItem value="mlc">MLC</SelectItem>
                          <SelectItem value="commander">Comandante</SelectItem>
                          <SelectItem value="engineer">Máquinas</SelectItem>
                          <SelectItem value="safety">Segurança</SelectItem>
                          <SelectItem value="fire">Combate a Incêndio</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="number">Número do Certificado</Label>
                      <Input id="number" placeholder="Ex: STCW-2024-001" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="issue">Data de Emissão</Label>
                        <Input id="issue" type="date" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="expiry">Data de Validade</Label>
                        <Input id="expiry" type="date" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="authority">Autoridade Emissora</Label>
                      <Input id="authority" placeholder="Ex: Marinha do Brasil" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleAddCertification}>
                      Adicionar
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, tipo ou número..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
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
          </div>

          {/* Certifications List */}
          <div className="space-y-3">
            {filteredCertifications.map((cert) => (
              <div
                key={cert.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${cert.status === "expired" ? "bg-destructive/10" : cert.status === "expiring" ? "bg-warning/10" : "bg-success/10"}`}>
                    <FileText className={`h-5 w-5 ${cert.status === "expired" ? "text-destructive" : cert.status === "expiring" ? "text-warning" : "text-success"}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{cert.type}</h4>
                      <Badge className={getStatusColor(cert.status)}>
                        {getStatusIcon(cert.status)}
                        <span className="ml-1">{getStatusLabel(cert.status)}</span>
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {cert.crewMemberName}
                      </span>
                      <span>Nº: {cert.number}</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Venc: {new Date(cert.expiryDate).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {cert.status === "valid" && (
                    <span className="text-sm text-muted-foreground">
                      {cert.daysUntilExpiry} dias restantes
                    </span>
                  )}
                  {cert.status === "expiring" && (
                    <span className="text-sm text-warning font-medium">
                      {cert.daysUntilExpiry} dias para vencer!
                    </span>
                  )}
                  {cert.status === "expired" && (
                    <span className="text-sm text-destructive font-medium">
                      Vencido há {Math.abs(cert.daysUntilExpiry)} dias
                    </span>
                  )}
                  {(cert.status === "expiring" || cert.status === "expired") && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleRenew(cert.id)}
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Renovar
                    </Button>
                  )}
                  <Button variant="ghost" size="sm">
                    <FileText className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {filteredCertifications.length === 0 && (
            <div className="text-center py-8">
              <Shield className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma certificação encontrada</h3>
              <p className="text-muted-foreground">
                Tente ajustar os filtros ou adicione novas certificações
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
