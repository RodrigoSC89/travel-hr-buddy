import { useState, useCallback } from "react";;
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Shield,
  FileCheck,
  Download,
  Eye,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Building2,
  Ship,
  Calendar,
  Send,
  FileText,
  Lock,
  Unlock,
  User,
  History,
  Search,
  Filter
} from "lucide-react";

interface CompliancePackage {
  id: string;
  vesselName: string;
  vesselIMO: string;
  packageType: "annual" | "audit" | "incident" | "renewal";
  status: "draft" | "submitted" | "under_review" | "approved" | "rejected";
  submittedDate?: string;
  reviewedDate?: string;
  reviewer?: string;
  documents: ComplianceDocument[];
  score?: number;
  expiryDate?: string;
  regulator: string;
}

interface ComplianceDocument {
  id: string;
  name: string;
  type: string;
  status: "pending" | "approved" | "rejected" | "expired";
  uploadedAt: string;
  expiresAt?: string;
  comments?: string;
}

interface AccessLog {
  id: string;
  action: string;
  user: string;
  userType: "internal" | "regulator" | "client";
  timestamp: string;
  details: string;
}

const mockPackages: CompliancePackage[] = [
  {
    id: "PKG-001",
    vesselName: "MV Atlantic Explorer",
    vesselIMO: "IMO9876543",
    packageType: "annual",
    status: "approved",
    submittedDate: "2024-11-15",
    reviewedDate: "2024-11-20",
    reviewer: "Petrobras QHSE",
    regulator: "Petrobras",
    score: 94,
    expiryDate: "2025-11-15",
    documents: [
      { id: "D1", name: "Certificado DP Anual", type: "certificate", status: "approved", uploadedAt: "2024-11-10" },
      { id: "D2", name: "FMEA Report", type: "report", status: "approved", uploadedAt: "2024-11-10" },
      { id: "D3", name: "DP Trials Report", type: "report", status: "approved", uploadedAt: "2024-11-12" }
    ]
  },
  {
    id: "PKG-002",
    vesselName: "OSV Petrobras XXI",
    vesselIMO: "IMO1234567",
    packageType: "audit",
    status: "under_review",
    submittedDate: "2024-12-01",
    regulator: "Lloyd's Register",
    documents: [
      { id: "D4", name: "Auditoria DP Class 2", type: "audit", status: "pending", uploadedAt: "2024-12-01" },
      { id: "D5", name: "Lista de Tripulação DP", type: "crew_list", status: "approved", uploadedAt: "2024-12-01" }
    ]
  },
  {
    id: "PKG-003",
    vesselName: "MV Atlantic Explorer",
    vesselIMO: "IMO9876543",
    packageType: "incident",
    status: "submitted",
    submittedDate: "2024-12-03",
    regulator: "DPC - Marinha",
    documents: [
      { id: "D6", name: "Relatório de Incidente DP", type: "incident", status: "pending", uploadedAt: "2024-12-03" },
      { id: "D7", name: "Evidências Fotográficas", type: "evidence", status: "pending", uploadedAt: "2024-12-03" }
    ]
  }
];

const mockAccessLogs: AccessLog[] = [
  { id: "L1", action: "VIEW_PACKAGE", user: "auditor@petrobras.com", userType: "regulator", timestamp: "2024-12-04T10:30:00", details: "Visualizou PKG-001" },
  { id: "L2", action: "DOWNLOAD_DOC", user: "inspector@lloyds.com", userType: "regulator", timestamp: "2024-12-04T09:15:00", details: "Baixou FMEA Report" },
  { id: "L3", action: "APPROVE_DOC", user: "qhse@client.com", userType: "client", timestamp: "2024-12-03T16:45:00", details: "Aprovou Certificado DP" }
];

export const RegulatorPortal: React.FC = () => {
  const [packages, setPackages] = useState<CompliancePackage[]>(mockPackages);
  const [accessLogs] = useState<AccessLog[]>(mockAccessLogs);
  const [selectedPackage, setSelectedPackage] = useState<CompliancePackage | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterRegulator, setFilterRegulator] = useState<string>("all");

  const regulators = [...new Set(packages.map(p => p.regulator))];

  const filteredPackages = packages.filter(pkg => {
    const matchesSearch = pkg.vesselName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pkg.vesselIMO.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || pkg.status === filterStatus;
    const matchesRegulator = filterRegulator === "all" || pkg.regulator === filterRegulator;
    return matchesSearch && matchesStatus && matchesRegulator;
  });

  const stats = {
    total: packages.length,
    approved: packages.filter(p => p.status === "approved").length,
    pending: packages.filter(p => ["submitted", "under_review"].includes(p.status)).length,
    expiringSoon: packages.filter(p => p.expiryDate && new Date(p.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)).length
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
    case "approved": return <Badge className="bg-green-500">Aprovado</Badge>;
    case "submitted": return <Badge className="bg-blue-500">Enviado</Badge>;
    case "under_review": return <Badge className="bg-yellow-500 text-black">Em Análise</Badge>;
    case "rejected": return <Badge variant="destructive">Rejeitado</Badge>;
    default: return <Badge variant="secondary">Rascunho</Badge>;
    }
  };

  const getDocStatusIcon = (status: string) => {
    switch (status) {
    case "approved": return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "rejected": return <XCircle className="h-4 w-4 text-red-500" />;
    case "expired": return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    default: return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getUserTypeBadge = (type: string) => {
    switch (type) {
    case "regulator": return <Badge className="bg-purple-500">Regulador</Badge>;
    case "client": return <Badge className="bg-blue-500">Cliente</Badge>;
    default: return <Badge variant="secondary">Interno</Badge>;
    }
  };

  const handleCreatePackage = () => {
    toast.info("Abrindo wizard de criação de pacote...");
  };

  const handleSubmitToRegulator = (pkgId: string) => {
    setPackages(packages.map(p => p.id === pkgId ? { ...p, status: "submitted", submittedDate: new Date().toISOString() } : p));
    toast.success("Pacote enviado ao regulador");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Portal Reguladores & Armadores</h2>
            <p className="text-muted-foreground">Gestão de compliance e pacotes de evidências</p>
          </div>
        </div>
        <Button onClick={handleCreatePackage}>
          <FileCheck className="w-4 h-4 mr-2" />
          Novo Pacote
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Pacotes</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-primary/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-500/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aprovados</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-yellow-500/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-orange-500/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Expirando em 30d</p>
                <p className="text-2xl font-bold text-orange-600">{stats.expiringSoon}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por embarcação ou IMO..."
            value={searchTerm}
            onChange={handleChange}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Status</SelectItem>
            <SelectItem value="draft">Rascunho</SelectItem>
            <SelectItem value="submitted">Enviado</SelectItem>
            <SelectItem value="under_review">Em Análise</SelectItem>
            <SelectItem value="approved">Aprovado</SelectItem>
            <SelectItem value="rejected">Rejeitado</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterRegulator} onValueChange={setFilterRegulator}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Regulador" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Reguladores</SelectItem>
            {regulators.map(reg => (
              <SelectItem key={reg} value={reg}>{reg}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="packages" className="space-y-4">
        <TabsList>
          <TabsTrigger value="packages">Pacotes de Compliance</TabsTrigger>
          <TabsTrigger value="access">Logs de Acesso</TabsTrigger>
          <TabsTrigger value="permissions">Permissões</TabsTrigger>
        </TabsList>

        <TabsContent value="packages">
          <div className="grid grid-cols-2 gap-4">
            {filteredPackages.map(pkg => (
              <Card key={pkg.id} className="hover:shadow-lg transition-all">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Ship className="h-5 w-5 text-primary" />
                      <div>
                        <CardTitle className="text-lg">{pkg.vesselName}</CardTitle>
                        <CardDescription className="font-mono">{pkg.vesselIMO}</CardDescription>
                      </div>
                    </div>
                    {getStatusBadge(pkg.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span>{pkg.regulator}</span>
                    </div>
                    <Badge variant="outline">
                      {pkg.packageType === "annual" ? "Anual" :
                        pkg.packageType === "audit" ? "Auditoria" :
                          pkg.packageType === "incident" ? "Incidente" : "Renovação"}
                    </Badge>
                  </div>

                  {pkg.score && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Score Compliance</span>
                        <span className="font-medium">{pkg.score}%</span>
                      </div>
                      <Progress value={pkg.score} className="h-2" />
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {pkg.submittedDate && (
                      <span className="flex items-center gap-1">
                        <Send className="h-3 w-3" />
                        Enviado: {new Date(pkg.submittedDate).toLocaleDateString("pt-BR")}
                      </span>
                    )}
                    {pkg.expiryDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Expira: {new Date(pkg.expiryDate).toLocaleDateString("pt-BR")}
                      </span>
                    )}
                  </div>

                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground mb-2">Documentos ({pkg.documents.length})</p>
                    <div className="space-y-1">
                      {pkg.documents.slice(0, 3).map(doc => (
                        <div key={doc.id} className="flex items-center justify-between text-sm">
                          <span className="truncate flex-1">{doc.name}</span>
                          {getDocStatusIcon(doc.status)}
                        </div>
                      ))}
                      {pkg.documents.length > 3 && (
                        <p className="text-xs text-muted-foreground">+{pkg.documents.length - 3} mais</p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={handleSetSelectedPackage}>
                      <Eye className="w-4 h-4 mr-1" />
                      Ver
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                    {pkg.status === "draft" && (
                      <Button size="sm" onClick={() => handlehandleSubmitToRegulator}>
                        <Send className="w-4 h-4 mr-1" />
                        Enviar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="access">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Registro de Acessos
              </CardTitle>
              <CardDescription>Histórico de visualizações e downloads por reguladores e clientes</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {accessLogs.map(log => (
                    <div key={log.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{log.user}</p>
                          <p className="text-sm text-muted-foreground">{log.details}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getUserTypeBadge(log.userType)}
                        <span className="text-xs text-muted-foreground">
                          {new Date(log.timestamp).toLocaleString("pt-BR")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Gestão de Permissões
              </CardTitle>
              <CardDescription>Controle de acesso por regulador e tipo de documento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {regulators.map(reg => (
                  <div key={reg} className="p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-primary" />
                        <span className="font-medium">{reg}</span>
                      </div>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Unlock className="h-3 w-3" />
                        Acesso Ativo
                      </Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Certificados</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Relatórios</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Auditorias</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-500" />
                        <span>Financeiro</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
});
