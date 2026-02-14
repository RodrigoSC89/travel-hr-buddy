/**
 * Documentation Center - REAL DATA from Supabase: certificates table
 */
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Plus, Trash2, Edit, Search, AlertTriangle, CheckCircle, Clock, Filter, Eye, Shield, Loader2 } from "lucide-react";

const CERTIFICATE_TYPES = ["IOPP Certificate","Safety Management Certificate","Safety Equipment Certificate","Safety Radio Certificate","Load Line Certificate","Tonnage Certificate","DOC - Document of Compliance","SMC - Safety Management Certificate","ISSC - International Ship Security Certificate","MLC Certificate","Ballast Water Certificate","Other"];
const ISSUING_AUTHORITIES = ["DNV","Lloyd's Register","Bureau Veritas","ABS","ClassNK","RINA","Marinha do Brasil","ANTAQ","IMO","Flag State","Other"];

const DocumentationCenter: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ certificate_type: "", certificate_number: "", vessel_name: "", issue_date: "", expiry_date: "", issuing_authority: "" });
  const queryClient = useQueryClient();

  const { data: certificates, isLoading } = useQuery({
    queryKey: ["doc-center-certs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("certificates").select("*, vessels(name)").order("expiry_date", { ascending: true }).limit(100);
      if (error) throw error;
      return (data || []).map((c: Record<string, unknown>) => {
        const vessels = c.vessels as Record<string, unknown> | null;
        const expiry = c.expiry_date ? new Date(String(c.expiry_date)) : null;
        const now = new Date();
        const daysLeft = expiry ? Math.ceil((expiry.getTime() - now.getTime()) / 86400000) : 999;
        return { ...c, vesselName: vessels?.name as string | undefined, computedStatus: daysLeft < 0 ? "expired" : daysLeft <= 90 ? "expiring" : "valid" };
      });
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("certificates").insert({
        certificate_type: formData.certificate_type,
        certificate_number: formData.certificate_number || null,
        issue_date: formData.issue_date || null,
        expiry_date: formData.expiry_date || null,
        issuing_authority: formData.issuing_authority || null,
        status: "active",
      } as never);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["doc-center-certs"] }); setIsCreateOpen(false); toast.success("Certificado adicionado!"); },
    onError: () => toast.error("Erro ao criar certificado"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("certificates").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["doc-center-certs"] }); setIsDeleteOpen(false); toast.success("Certificado excluído!"); },
  });

  interface CertRow extends Record<string, unknown> { certificate_type?: string; vesselName?: string; computedStatus: string; }
  const filtered = (certificates || []).filter((c) => {
    const cert = c as CertRow;
    const matchesSearch = (String(cert.certificate_type || "")).toLowerCase().includes(searchTerm.toLowerCase()) || (String(cert.vesselName || "")).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || cert.computedStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = { total: certificates?.length || 0, valid: certificates?.filter((c) => (c as CertRow).computedStatus === "valid").length || 0, expiring: certificates?.filter((c) => (c as CertRow).computedStatus === "expiring").length || 0, expired: certificates?.filter((c) => (c as CertRow).computedStatus === "expired").length || 0 };

  if (isLoading) return <div className="flex items-center justify-center h-96"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Total</p><p className="text-2xl font-bold">{stats.total}</p></div><FileText className="h-8 w-8 text-info opacity-80" /></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Válidos</p><p className="text-2xl font-bold text-success">{stats.valid}</p></div><CheckCircle className="h-8 w-8 text-success opacity-80" /></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Vencendo</p><p className="text-2xl font-bold text-warning">{stats.expiring}</p></div><Clock className="h-8 w-8 text-warning opacity-80" /></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Expirados</p><p className="text-2xl font-bold text-destructive">{stats.expired}</p></div><AlertTriangle className="h-8 w-8 text-destructive opacity-80" /></div></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-primary" />Centro de Documentação</CardTitle><CardDescription>Gestão centralizada de certificados e documentos da frota</CardDescription></div>
            <Button onClick={() => setIsCreateOpen(true)}><Plus className="h-4 w-4 mr-2" />Novo Certificado</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar certificados..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" /></div>
            <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-[180px]"><Filter className="h-4 w-4 mr-2" /><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="all">Todos</SelectItem><SelectItem value="valid">Válidos</SelectItem><SelectItem value="expiring">Vencendo</SelectItem><SelectItem value="expired">Expirados</SelectItem></SelectContent></Select>
          </div>

          <ScrollArea className="h-[400px]">
            {filtered.length === 0 ? (
              <div className="text-center py-12"><FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground mb-4">Nenhum certificado encontrado</p><Button onClick={() => setIsCreateOpen(true)}><Plus className="h-4 w-4 mr-2" />Adicionar Primeiro Certificado</Button></div>
            ) : (
              <div className="space-y-3">
                {filtered.map((cert: any) => (
                  <div key={cert.id} className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${cert.computedStatus === "valid" ? "bg-success/10" : cert.computedStatus === "expiring" ? "bg-warning/10" : "bg-destructive/10"}`}>
                        <FileText className={`h-5 w-5 ${cert.computedStatus === "valid" ? "text-success" : cert.computedStatus === "expiring" ? "text-warning" : "text-destructive"}`} />
                      </div>
                      <div>
                        <p className="font-medium">{cert.certificate_type}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{cert.vesselName || "N/A"}</span><span>•</span>
                          <span>Vence: {cert.expiry_date ? new Date(cert.expiry_date).toLocaleDateString('pt-BR') : "N/A"}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={cert.computedStatus === "valid" ? "default" : cert.computedStatus === "expiring" ? "secondary" : "destructive"}>{cert.computedStatus === "valid" ? "Válido" : cert.computedStatus === "expiring" ? "Vencendo" : "Expirado"}</Badge>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => { setSelectedId(cert.id); setIsDeleteOpen(true); }} aria-label="Excluir certificado" title="Excluir"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Novo Certificado</DialogTitle><DialogDescription>Adicione um novo certificado</DialogDescription></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label>Tipo *</Label><Select value={formData.certificate_type} onValueChange={(v) => setFormData(p => ({ ...p, certificate_type: v }))}><SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger><SelectContent>{CERTIFICATE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label>Número</Label><Input value={formData.certificate_number} onChange={(e) => setFormData(p => ({ ...p, certificate_number: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Emissão</Label><Input type="date" value={formData.issue_date} onChange={(e) => setFormData(p => ({ ...p, issue_date: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Validade *</Label><Input type="date" value={formData.expiry_date} onChange={(e) => setFormData(p => ({ ...p, expiry_date: e.target.value }))} /></div>
            </div>
            <div className="space-y-2"><Label>Autoridade Emissora</Label><Select value={formData.issuing_authority} onValueChange={(v) => setFormData(p => ({ ...p, issuing_authority: v }))}><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent>{ISSUING_AUTHORITIES.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent></Select></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancelar</Button><Button onClick={() => createMutation.mutate()} disabled={!formData.certificate_type}>Salvar</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle><AlertDialogDescription>Deseja excluir este certificado?</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => selectedId && deleteMutation.mutate(selectedId)}>Excluir</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DocumentationCenter;
