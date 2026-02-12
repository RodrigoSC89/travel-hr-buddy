/**
 * Compliance Evidências
 * ✅ P0-002: Real data from useComplianceEvidences hook
 */

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useComplianceEvidences } from "../hooks/useComplianceData";
import { FileCheck, Search, Upload, File, FileImage, FileText as FilePdf, CheckCircle2, Clock, AlertTriangle, Eye, Download, Filter, FolderOpen, Brain, Shield } from "lucide-react";
import { toast } from "sonner";

interface Evidence {
  id: string; title: string; type: "document" | "image" | "certificate" | "report" | "audit";
  fileName: string; fileSize: string; regulation: string;
  status: "valid" | "pending_review" | "expired" | "rejected";
  uploadedBy: string; uploadedAt: string; expiryDate?: string;
  aiVerified: boolean; aiConfidence?: number;
}

export default function ComplianceEvidencias() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const { data: rawEvidences, isLoading } = useComplianceEvidences();

  // Map hook data to display format
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- compliance evidence rows need flexible mapping
  const displayEvidences: Evidence[] = (rawEvidences || []).map((e: any) => ({
    id: String(e.id),
    title: String(e.title || e.file_name || "Evidência"),
    type: (["document", "image", "certificate", "report", "audit"].includes(e.document_type) ? e.document_type : "document") as Evidence["type"],
    fileName: String(e.file_name || "arquivo"),
    fileSize: e.file_size ? `${(Number(e.file_size) / 1024).toFixed(0)} KB` : "N/A",
    regulation: String(e.regulation || "Geral"),
    status: e.status === "approved" ? "valid" as const : e.status === "expired" ? "expired" as const : "pending_review" as const,
    uploadedBy: String(e.uploaded_by || "Sistema"),
    uploadedAt: String(e.created_at || ""),
    expiryDate: e.expiry_date as string | undefined,
    aiVerified: !!e.ai_verified || !!e.confidence_score,
    aiConfidence: e.confidence_score as number | undefined,
  }));

  const filteredEvidences = displayEvidences.filter(ev => {
    const matchesSearch = ev.title.toLowerCase().includes(searchTerm.toLowerCase()) || ev.fileName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || ev.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: displayEvidences.length,
    valid: displayEvidences.filter(e => e.status === "valid").length,
    pending: displayEvidences.filter(e => e.status === "pending_review").length,
    expired: displayEvidences.filter(e => e.status === "expired").length,
    aiVerified: displayEvidences.filter(e => e.aiVerified).length,
  };

  const getStatusBadge = (status: string) => {
    switch (status) { case "valid": return <Badge className="bg-success/20 text-success border-success/30"><CheckCircle2 className="h-3 w-3 mr-1" />Válido</Badge>; case "pending_review": return <Badge className="bg-warning/20 text-warning border-warning/30"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>; case "expired": return <Badge className="bg-destructive/20 text-destructive border-destructive/30"><AlertTriangle className="h-3 w-3 mr-1" />Expirado</Badge>; default: return <Badge variant="outline">{status}</Badge>; }
  };
  const getFileIcon = (type: string) => { switch (type) { case "certificate": return <Shield className="h-8 w-8 text-success" />; case "image": return <FileImage className="h-8 w-8 text-primary" />; case "report": return <FilePdf className="h-8 w-8 text-destructive" />; default: return <File className="h-8 w-8 text-muted-foreground" />; } };

  if (isLoading) return <div className="container mx-auto p-6 space-y-4">{[1,2,3].map(i => <Skeleton key={`evid-skeleton-${i}`} className="h-32 w-full" />)}</div>;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div><h1 className="text-2xl font-bold flex items-center gap-2"><FileCheck className="h-7 w-7 text-primary" />Gestão de Evidências</h1><p className="text-muted-foreground mt-1">Upload e validação de documentos de conformidade</p></div>
        <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
          <DialogTrigger asChild><Button><Upload className="h-4 w-4 mr-2" />Upload Evidência</Button></DialogTrigger>
          <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Upload de Evidência</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"><Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" /><p className="text-muted-foreground">Arraste arquivos ou clique para selecionar</p><p className="text-xs text-muted-foreground mt-1">PDF, PNG, JPG, ZIP até 50MB</p></div>
              <div className="space-y-2"><Label>Título</Label><Input placeholder="Ex: Certificado MLC 2006" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Tipo</Label><Select><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent><SelectItem value="certificate">Certificado</SelectItem><SelectItem value="report">Relatório</SelectItem><SelectItem value="document">Documento</SelectItem></SelectContent></Select></div>
                <div className="space-y-2"><Label>Regulamento</Label><Select><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent><SelectItem value="mlc-2006">MLC 2006</SelectItem><SelectItem value="stcw">STCW</SelectItem><SelectItem value="solas">SOLAS</SelectItem><SelectItem value="marpol">MARPOL</SelectItem></SelectContent></Select></div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-accent/10 border border-accent/30 rounded-lg"><Brain className="h-5 w-5 text-accent-foreground" /><span className="text-sm">IA irá verificar automaticamente a validade do documento</span></div>
              <Button className="w-full" onClick={() => { setShowUploadDialog(false); window.history.pushState({}, "", '/documents?action=upload'); window.dispatchEvent(new PopStateEvent("popstate")); toast.success("Redirecionando para upload."); }}><Upload className="h-4 w-4 mr-2" />Enviar para Análise</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-card/50"><CardContent className="p-4 text-center"><FolderOpen className="h-6 w-6 mx-auto text-primary mb-2" /><div className="text-2xl font-bold">{stats.total}</div><div className="text-xs text-muted-foreground">Total</div></CardContent></Card>
        <Card className="bg-success/10 border-success/30"><CardContent className="p-4 text-center"><CheckCircle2 className="h-6 w-6 mx-auto text-success mb-2" /><div className="text-2xl font-bold text-success">{stats.valid}</div><div className="text-xs text-muted-foreground">Válidos</div></CardContent></Card>
        <Card className="bg-warning/10 border-warning/30"><CardContent className="p-4 text-center"><Clock className="h-6 w-6 mx-auto text-warning mb-2" /><div className="text-2xl font-bold text-warning">{stats.pending}</div><div className="text-xs text-muted-foreground">Pendentes</div></CardContent></Card>
        <Card className="bg-destructive/10 border-destructive/30"><CardContent className="p-4 text-center"><AlertTriangle className="h-6 w-6 mx-auto text-destructive mb-2" /><div className="text-2xl font-bold text-destructive">{stats.expired}</div><div className="text-xs text-muted-foreground">Expirados</div></CardContent></Card>
        <Card className="bg-secondary/10 border-secondary/30"><CardContent className="p-4 text-center"><Brain className="h-6 w-6 mx-auto text-secondary-foreground mb-2" /><div className="text-2xl font-bold text-secondary-foreground">{stats.aiVerified}</div><div className="text-xs text-muted-foreground">IA Verificados</div></CardContent></Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar evidências..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
        <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-[180px]"><Filter className="h-4 w-4 mr-2" /><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="all">Todos Status</SelectItem><SelectItem value="valid">Válidos</SelectItem><SelectItem value="pending_review">Pendentes</SelectItem><SelectItem value="expired">Expirados</SelectItem></SelectContent></Select>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEvidences.map(ev => (
          <Card key={ev.id} className="hover:border-primary/30 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-start gap-4"><div className="p-2 bg-muted rounded-lg">{getFileIcon(ev.type)}</div><div className="flex-1 min-w-0"><h3 className="font-medium truncate">{ev.title}</h3><p className="text-sm text-muted-foreground truncate">{ev.fileName}</p><div className="flex items-center gap-2 mt-2 flex-wrap">{getStatusBadge(ev.status)}<Badge variant="outline" className="text-xs">{ev.regulation}</Badge></div></div></div>
              <div className="mt-4 pt-4 border-t border-border space-y-2">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Enviado por</span><span>{ev.uploadedBy}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Data</span><span>{ev.uploadedAt ? new Date(ev.uploadedAt).toLocaleDateString("pt-BR") : "N/A"}</span></div>
                {ev.aiVerified && <div className="flex items-center justify-between text-sm"><span className="text-accent-foreground flex items-center gap-1"><Brain className="h-3 w-3" /> IA Verificado</span><span className="text-accent-foreground">{ev.aiConfidence}%</span></div>}
              </div>
              <div className="flex gap-2 mt-4"><Button size="sm" variant="outline" className="flex-1" onClick={() => { navigator.clipboard.writeText(`${ev.title} | Arquivo: ${ev.fileName} | Tamanho: ${ev.fileSize} | Regulamento: ${ev.regulation} | Status: ${ev.status}`); toast.success("Dados copiados para clipboard"); }}><Eye className="h-3 w-3 mr-1" /> Ver</Button><Button size="sm" variant="outline" onClick={() => { window.history.pushState({}, '', '/workbench?tab=documents'); window.dispatchEvent(new PopStateEvent('popstate')); }}><Download className="h-3 w-3" /></Button></div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
