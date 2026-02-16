/**
 * Certificate Manager - Supabase Integrated
 * Full CRUD for maritime certificates with expiry tracking
 */

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  Award, Plus, Search, Edit, Trash2, AlertTriangle, Clock,
  CheckCircle, XCircle, Calendar, User, Ship, FileText,
  Download, Bell, RefreshCw, MoreHorizontal, Send, Loader2,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Certificate {
  id: string;
  type: string;
  category: "crew" | "vessel";
  holderId: string;
  holderName: string;
  vesselId?: string;
  vesselName?: string;
  issueDate: string;
  expiryDate: string;
  issuingAuthority: string;
  certificateNumber: string;
  status: "valid" | "expiring" | "expired" | "pending_renewal";
  notes: string;
}

const CERTIFICATE_TYPES = {
  crew: [
    "STCW Basic Safety", "Medical Fitness Certificate", "GMDSS Radio Operator",
    "Radar Navigation (ARPA)", "Advanced Fire Fighting", "Survival Craft & Rescue",
    "Medical Care Certificate", "Ship Security Officer", "Bridge Resource Management",
    "Engine Resource Management", "Tankerman PIC", "Passport", "Seaman Book",
  ],
  vessel: [
    "Safety Management Certificate (SMC)", "ISM Document of Compliance",
    "International Ship Security Certificate (ISSC)", "Safety Construction Certificate",
    "Safety Equipment Certificate", "Safety Radio Certificate", "Load Line Certificate",
    "IOPP Certificate", "Class Certificate", "Tonnage Certificate",
    "Maritime Labour Certificate", "DMLC Part I", "DMLC Part II",
  ],
};

const getStatus = (expiryDate: string): Certificate["status"] => {
  const days = getDaysUntilExpiry(expiryDate);
  if (days < 0) return "expired";
  if (days <= 30) return "expiring";
  return "valid";
};

const getDaysUntilExpiry = (expiryDate: string): number => {
  const expiry = new Date(expiryDate);
  const today = new Date();
  return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

export function CertificateManager() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<Certificate | null>(null);
  const [formData, setFormData] = useState({
    type: "", category: "crew" as "crew" | "vessel", holderName: "", holderId: "",
    vesselName: "", vesselId: "", issueDate: "", expiryDate: "",
    issuingAuthority: "", certificateNumber: "", notes: "",
  });

  // ===== SUPABASE QUERIES =====
  const { data: certificates = [], isLoading } = useQuery({
    queryKey: ["certificates-manager"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("certificates")
        .select("*")
        .order("expiry_date", { ascending: true });
      if (error) throw error;
      return (data || []).map((c): Certificate => ({
        id: c.id,
        type: c.certificate_type,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase columns not in generated types
        category: (c as any).category || "crew",
        holderId: c.employee_id || "",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase dynamic column
        holderName: (c as any).holder_name || c.employee_id || "N/A",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase dynamic column
        vesselId: (c as any).vessel_id || undefined,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase dynamic column
        vesselName: (c as any).vessel_name || undefined,
        issueDate: c.issue_date,
        expiryDate: c.expiry_date,
        issuingAuthority: c.issuing_authority,
        certificateNumber: c.certificate_number,
        status: c.status === "pending_renewal" ? "pending_renewal" : getStatus(c.expiry_date),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase dynamic column
        notes: (c as any).notes || "",
      }));
    },
    staleTime: 30000,
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const status = getStatus(data.expiryDate);
      const { error } = await supabase.from("certificates").insert({
        certificate_type: data.type,
        category: data.category,
        holder_name: data.holderName,
        employee_id: data.holderId || null,
        vessel_id: data.vesselId || null,
        vessel_name: data.vesselName || null,
        issue_date: data.issueDate || new Date().toISOString().split("T")[0],
        expiry_date: data.expiryDate,
        issuing_authority: data.issuingAuthority,
        certificate_number: data.certificateNumber || `CERT-${Date.now()}`,
        status,
        notes: data.notes || null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- columns exist in DB but not in generated types
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["certificates-manager"] });
      queryClient.invalidateQueries({ queryKey: ["certificates-widget"] });
      toast.success("Certificado cadastrado com sucesso");
      setIsFormOpen(false);
      resetForm();
    },
    onError: () => toast.error("Erro ao cadastrar certificado"),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const status = getStatus(data.expiryDate);
      const { error } = await supabase.from("certificates").update({
        certificate_type: data.type,
        category: data.category,
        holder_name: data.holderName,
        employee_id: data.holderId || null,
        vessel_id: data.vesselId || null,
        vessel_name: data.vesselName || null,
        issue_date: data.issueDate,
        expiry_date: data.expiryDate,
        issuing_authority: data.issuingAuthority,
        certificate_number: data.certificateNumber,
        status,
        notes: data.notes || null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- columns exist in DB but not in generated types
      } as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["certificates-manager"] });
      queryClient.invalidateQueries({ queryKey: ["certificates-widget"] });
      toast.success("Certificado atualizado");
      setIsFormOpen(false);
      resetForm();
    },
    onError: () => toast.error("Erro ao atualizar certificado"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("certificates").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["certificates-manager"] });
      queryClient.invalidateQueries({ queryKey: ["certificates-widget"] });
      toast.success("Certificado removido");
    },
    onError: () => toast.error("Erro ao remover certificado"),
  });

  const renewalMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("certificates").update({
        status: "pending_renewal",
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["certificates-manager"] });
      toast.success("Solicitação de renovação enviada");
    },
  });

  const filteredCertificates = useMemo(() => {
    return certificates.filter((cert) => {
      const matchesSearch =
        cert.holderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.certificateNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || cert.status === statusFilter;
      const matchesCategory = categoryFilter === "all" || cert.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [certificates, searchTerm, statusFilter, categoryFilter]);

  const stats = useMemo(() => ({
    total: certificates.length,
    valid: certificates.filter((c) => c.status === "valid").length,
    expiring: certificates.filter((c) => c.status === "expiring").length,
    expired: certificates.filter((c) => c.status === "expired").length,
    crew: certificates.filter((c) => c.category === "crew").length,
    vessel: certificates.filter((c) => c.category === "vessel").length,
  }), [certificates]);

  const resetForm = () => {
    setFormData({
      type: "", category: "crew", holderName: "", holderId: "",
      vesselName: "", vesselId: "", issueDate: "", expiryDate: "",
      issuingAuthority: "", certificateNumber: "", notes: "",
    });
    setEditingCert(null);
  };

  const openCreateForm = () => { resetForm(); setIsFormOpen(true); };
  const openEditForm = (cert: Certificate) => {
    setEditingCert(cert);
    setFormData({
      type: cert.type, category: cert.category, holderName: cert.holderName,
      holderId: cert.holderId, vesselName: cert.vesselName || "",
      vesselId: cert.vesselId || "", issueDate: cert.issueDate,
      expiryDate: cert.expiryDate, issuingAuthority: cert.issuingAuthority,
      certificateNumber: cert.certificateNumber, notes: cert.notes,
    });
    setIsFormOpen(true);
  };

  const handleSave = () => {
    if (!formData.type || !formData.holderName || !formData.expiryDate) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }
    if (editingCert) {
      updateMutation.mutate({ id: editingCert.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Tem certeza que deseja remover este certificado?")) {
      deleteMutation.mutate(id);
    }
  };

  const exportToCSV = () => {
    const headers = ["Tipo", "Titular", "Categoria", "Emissão", "Validade", "Status", "Autoridade", "Número"];
    const rows = filteredCertificates.map((c) => [c.type, c.holderName, c.category, c.issueDate, c.expiryDate, c.status, c.issuingAuthority, c.certificateNumber]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `certificados_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    toast.success("Exportação concluída");
  };

  const getStatusBadge = (status: Certificate["status"], days?: number) => {
    const config = {
      valid: { label: "Válido", variant: "default" as const, icon: CheckCircle },
      expiring: { label: days !== undefined ? `Vence em ${days}d` : "Vencendo", variant: "secondary" as const, icon: AlertTriangle },
      expired: { label: "Vencido", variant: "destructive" as const, icon: XCircle },
      pending_renewal: { label: "Renovando", variant: "outline" as const, icon: Clock },
    };
    const { label, variant, icon: Icon } = config[status];
    return <Badge variant={variant} className="gap-1"><Icon className="h-3 w-3" />{label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Award className="h-6 w-6 text-primary" />Gestão de Certificados
          </h2>
          <p className="text-muted-foreground">Controle de certificações marítimas com alertas de vencimento</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToCSV}><Download className="h-4 w-4 mr-2" />Exportar</Button>
          <Button onClick={openCreateForm}><Plus className="h-4 w-4 mr-2" />Novo Certificado</Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-6 gap-4">
        <Card><CardContent className="pt-4"><div className="text-2xl font-bold">{stats.total}</div><p className="text-sm text-muted-foreground">Total</p></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-2xl font-bold text-success">{stats.valid}</div><p className="text-sm text-muted-foreground">Válidos</p></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-2xl font-bold text-warning">{stats.expiring}</div><p className="text-sm text-muted-foreground">Vencendo</p></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-2xl font-bold text-destructive">{stats.expired}</div><p className="text-sm text-muted-foreground">Vencidos</p></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-2xl font-bold text-primary">{stats.crew}</div><p className="text-sm text-muted-foreground">Tripulação</p></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-2xl font-bold text-accent-foreground">{stats.vessel}</div><p className="text-sm text-muted-foreground">Embarcações</p></CardContent></Card>
      </div>

      {/* Alert Banner */}
      {stats.expired > 0 && (
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <span className="font-medium text-destructive">{stats.expired} certificado(s) vencido(s) requer(em) atenção imediata</span>
            </div>
            <Button variant="destructive" size="sm" onClick={() => setStatusFilter("expired")}>Ver Vencidos</Button>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar por titular, tipo ou número..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Status</SelectItem>
                <SelectItem value="valid">Válidos</SelectItem>
                <SelectItem value="expiring">Vencendo</SelectItem>
                <SelectItem value="expired">Vencidos</SelectItem>
                <SelectItem value="pending_renewal">Renovando</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Categoria" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="crew">Tripulação</SelectItem>
                <SelectItem value="vessel">Embarcação</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="icon" onClick={() => { setSearchTerm(""); setStatusFilter("all"); setCategoryFilter("all"); }} aria-label="Limpar filtros" title="Limpar filtros">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Certificate List */}
      <Card>
        <CardHeader><CardTitle>Certificados ({filteredCertificates.length})</CardTitle></CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="space-y-3">
              {filteredCertificates.map((cert) => {
                const days = getDaysUntilExpiry(cert.expiryDate);
                return (
                  <div key={cert.id} className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${cert.status === "expired" ? "border-destructive/50 bg-destructive/5" : cert.status === "expiring" ? "border-warning/50 bg-warning/5" : "hover:bg-muted/50"}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${cert.category === "crew" ? "bg-primary/10" : "bg-accent/10"}`}>
                        {cert.category === "crew" ? <User className="h-6 w-6 text-primary" /> : <Ship className="h-6 w-6 text-accent-foreground" />}
                      </div>
                      <div>
                        <div className="font-medium">{cert.type}</div>
                        <div className="text-sm text-muted-foreground">{cert.holderName}</div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>Validade: {new Date(cert.expiryDate).toLocaleDateString("pt-BR")}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right mr-4">
                        <div className="text-sm font-mono text-muted-foreground">{cert.certificateNumber}</div>
                        <div className="text-xs text-muted-foreground">{cert.issuingAuthority}</div>
                      </div>
                      {getStatusBadge(cert.status, days > 0 ? days : undefined)}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" aria-label="Mais opções"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditForm(cert)}><Edit className="h-4 w-4 mr-2" />Editar</DropdownMenuItem>
                          {(cert.status === "expiring" || cert.status === "expired") && (
                            <DropdownMenuItem onClick={() => renewalMutation.mutate(cert.id)}><Send className="h-4 w-4 mr-2" />Solicitar Renovação</DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(cert.id)}><Trash2 className="h-4 w-4 mr-2" />Remover</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })}
              {filteredCertificates.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum certificado encontrado</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Create/Edit Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingCert ? "Editar Certificado" : "Novo Certificado"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Categoria *</Label>
              <Select value={formData.category} onValueChange={(v) => setFormData((prev) => ({ ...prev, category: v as "crew" | "vessel", type: "" }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="crew">Tripulação</SelectItem>
                  <SelectItem value="vessel">Embarcação</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tipo de Certificado *</Label>
              <Select value={formData.type} onValueChange={(v) => setFormData((prev) => ({ ...prev, type: v }))}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {CERTIFICATE_TYPES[formData.category].map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{formData.category === "crew" ? "Nome do Tripulante *" : "Nome da Embarcação *"}</Label>
              <Input value={formData.holderName} onChange={(e) => setFormData((prev) => ({ ...prev, holderName: e.target.value }))} placeholder={formData.category === "crew" ? "Nome do tripulante" : "Nome da embarcação"} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Data de Emissão</Label><Input type="date" value={formData.issueDate} onChange={(e) => setFormData((prev) => ({ ...prev, issueDate: e.target.value }))} /></div>
              <div><Label>Data de Validade *</Label><Input type="date" value={formData.expiryDate} onChange={(e) => setFormData((prev) => ({ ...prev, expiryDate: e.target.value }))} /></div>
            </div>
            <div><Label>Autoridade Emissora</Label><Input value={formData.issuingAuthority} onChange={(e) => setFormData((prev) => ({ ...prev, issuingAuthority: e.target.value }))} placeholder="Ex: Marinha do Brasil, Lloyd's Register" /></div>
            <div><Label>Número do Certificado</Label><Input value={formData.certificateNumber} onChange={(e) => setFormData((prev) => ({ ...prev, certificateNumber: e.target.value }))} placeholder="Número de identificação" /></div>
            <div><Label>Observações</Label><Textarea value={formData.notes} onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))} placeholder="Observações adicionais..." rows={2} /></div>
          </div>
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>
              {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingCert ? "Salvar Alterações" : "Cadastrar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CertificateManager;
