/**
 * Crew Certifications Manager - Supabase Integrated
 * Full CRUD with maritime_certificates table
 * STCW, MLC, and mandatory document control
 */
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Shield, AlertTriangle, CheckCircle, Clock, Search, Download, Plus,
  FileText, Calendar, User, RefreshCw
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

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

const CERT_TYPES = [
  { value: "stcw_basic", label: "STCW - Marinheiro Qualificado" },
  { value: "stcw_officer", label: "STCW - Oficial de Navegação" },
  { value: "commander", label: "Certificado de Comandante" },
  { value: "engineer", label: "Certificado de Máquinas" },
  { value: "safety", label: "Certificado de Segurança Marítima" },
  { value: "fire", label: "Certificado de Combate a Incêndio" },
  { value: "gmdss", label: "GMDSS" },
  { value: "medical", label: "Certificado Médico Marítimo" },
  { value: "mlc", label: "MLC 2006" },
  { value: "tanker", label: "Operações com Tanques" },
];

interface CrewCertificationsManagerProps {
  crewMembers?: unknown[];
}

export function CrewCertificationsManager({ crewMembers = [] }: CrewCertificationsManagerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const [newCert, setNewCert] = useState({
    crew_member_id: "",
    certificate_type: "stcw_basic",
    certificate_number: "",
    issue_date: "",
    expiry_date: "",
    issuing_authority: "Marinha do Brasil",
  });

  // Fetch real data from maritime_certificates joined with crew_members
  const { data: certifications = [], isLoading } = useQuery({
    queryKey: ["crew-certifications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("maritime_certificates")
        .select("*, crew_members!inner(id, full_name)")
        .order("expiry_date", { ascending: true });

      if (error) throw error;

      const now = new Date();
      return (data || []).map((cert): Certification => {
        const expiry = new Date(cert.expiry_date || now);
        const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        let status: "valid" | "expiring" | "expired" = "valid";
        if (diffDays < 0) status = "expired";
        else if (diffDays <= 30) status = "expiring";

        const crewInfo = cert.crew_members as unknown as { id: string; full_name: string };
        const certType = cert.certification_type_id || '';
        return {
          id: cert.id,
          crewMemberId: cert.crew_member_id || "",
          crewMemberName: crewInfo?.full_name || "N/A",
          type: CERT_TYPES.find(t => t.value === certType)?.label || certType || "Certificado",
          number: cert.certificate_number || "",
          issueDate: cert.issue_date || "",
          expiryDate: cert.expiry_date || "",
          issuingAuthority: cert.issuing_authority || "",
          status,
          daysUntilExpiry: diffDays,
        };
      });
    },
    staleTime: 30000,
  });

  // Fetch crew list for the form
  const { data: crewList = [] } = useQuery({
    queryKey: ["crew-list-for-certs"],
    queryFn: async () => {
      const { data } = await supabase
        .from("crew_members")
        .select("id, full_name, rank")
        .order("full_name");
      return data || [];
    },
    staleTime: 60000,
  });

  // Add certification mutation
  const addMutation = useMutation({
    mutationFn: async (data: typeof newCert) => {
      const { error } = await supabase.from("maritime_certificates").insert({
        crew_member_id: data.crew_member_id,
        certification_type_id: data.certificate_type,
        certificate_number: data.certificate_number,
        issue_date: data.issue_date,
        expiry_date: data.expiry_date,
        issuing_authority: data.issuing_authority,
        status: "active",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crew-certifications"] });
      toast.success("Certificação adicionada com sucesso");
      setIsAddDialogOpen(false);
      setNewCert({ crew_member_id: "", certificate_type: "stcw_basic", certificate_number: "", issue_date: "", expiry_date: "", issuing_authority: "Marinha do Brasil" });
    },
    onError: () => toast.error("Erro ao adicionar certificação"),
  });

  // Renew mutation
  const renewMutation = useMutation({
    mutationFn: async (certId: string) => {
      const newExpiry = new Date();
      newExpiry.setFullYear(newExpiry.getFullYear() + 2);
      const { error } = await supabase
        .from("maritime_certificates")
        .update({
          expiry_date: newExpiry.toISOString().split("T")[0],
          issue_date: new Date().toISOString().split("T")[0],
          status: "active",
        })
        .eq("id", certId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crew-certifications"] });
      toast.success("Certificação renovada com sucesso");
    },
    onError: () => toast.error("Erro ao renovar certificação"),
  });

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
    complianceRate: certifications.length > 0
      ? Math.round((certifications.filter(c => c.status === "valid").length / certifications.length) * 100)
      : 0,
  };

  const handleExport = () => {
    const csvHeader = "Nome,Tipo,Número,Emissão,Validade,Autoridade,Status\n";
    const csvRows = filteredCertifications.map(c =>
      `"${c.crewMemberName}","${c.type}","${c.number}","${c.issueDate}","${c.expiryDate}","${c.issuingAuthority}","${c.status}"`
    ).join("\n");
    const blob = new Blob([csvHeader + csvRows], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `certificacoes-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${filteredCertifications.length} certificações exportadas como CSV`);
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
              <Button variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Certificação
              </Button>
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

          {/* Loading */}
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : filteredCertifications.length === 0 ? (
            <div className="py-12 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">Nenhuma certificação encontrada</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCertifications.map((cert) => (
                <div
                  key={cert.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${cert.status === 'expired' ? 'bg-destructive/10' : cert.status === 'expiring' ? 'bg-warning/10' : 'bg-success/10'}`}>
                      <FileText className={`h-5 w-5 ${cert.status === 'expired' ? 'text-destructive' : cert.status === 'expiring' ? 'text-warning' : 'text-success'}`} />
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
                          Venc: {cert.expiryDate ? new Date(cert.expiryDate).toLocaleDateString('pt-BR') : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {cert.status === "valid" && (
                      <span className="text-sm text-muted-foreground">{cert.daysUntilExpiry} dias restantes</span>
                    )}
                    {cert.status === "expiring" && (
                      <span className="text-sm text-warning font-medium">{cert.daysUntilExpiry} dias para vencer!</span>
                    )}
                    {cert.status === "expired" && (
                      <span className="text-sm text-destructive font-medium">Vencido há {Math.abs(cert.daysUntilExpiry)} dias</span>
                    )}
                    {(cert.status === "expiring" || cert.status === "expired") && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => renewMutation.mutate(cert.id)}
                        disabled={renewMutation.isPending}
                      >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Renovar
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Adicionar Certificação</DialogTitle>
            <DialogDescription>Registre uma nova certificação para um tripulante</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label>Tripulante</Label>
              <Select value={newCert.crew_member_id} onValueChange={v => setNewCert(p => ({ ...p, crew_member_id: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tripulante" />
                </SelectTrigger>
                <SelectContent>
                  {crewList.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.full_name} - {c.rank}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tipo de Certificação</Label>
              <Select value={newCert.certificate_type} onValueChange={v => setNewCert(p => ({ ...p, certificate_type: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CERT_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Número do Certificado</Label>
              <Input value={newCert.certificate_number} onChange={e => setNewCert(p => ({ ...p, certificate_number: e.target.value }))} placeholder="Ex: STCW-2026-001" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data de Emissão</Label>
                <Input type="date" value={newCert.issue_date} onChange={e => setNewCert(p => ({ ...p, issue_date: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Data de Validade</Label>
                <Input type="date" value={newCert.expiry_date} onChange={e => setNewCert(p => ({ ...p, expiry_date: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Autoridade Emissora</Label>
              <Input value={newCert.issuing_authority} onChange={e => setNewCert(p => ({ ...p, issuing_authority: e.target.value }))} placeholder="Ex: Marinha do Brasil" />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancelar</Button>
            <Button
              onClick={() => addMutation.mutate(newCert)}
              disabled={!newCert.crew_member_id || !newCert.certificate_number || addMutation.isPending}
            >
              {addMutation.isPending ? "Adicionando..." : "Adicionar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
