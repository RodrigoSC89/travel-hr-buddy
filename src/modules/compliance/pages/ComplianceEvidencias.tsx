/**
 * Compliance Evidências - Gestão de Evidências e Documentação
 * Upload, organização e validação de evidências de conformidade
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useComplianceEvidences } from "../hooks/useComplianceData";
import { 
  FileCheck, Search, Plus, Upload, File, FileImage, FileText as FilePdf,
  Calendar, CheckCircle2, Clock, AlertTriangle, Eye, Download,
  Trash2, Filter, FolderOpen, Brain, Shield
} from "lucide-react";
import { toast } from "sonner";

interface Evidence {
  id: string;
  title: string;
  type: "document" | "image" | "certificate" | "report" | "audit";
  fileName: string;
  fileSize: string;
  regulation: string;
  status: "valid" | "pending_review" | "expired" | "rejected";
  uploadedBy: string;
  uploadedAt: string;
  expiryDate?: string;
  aiVerified: boolean;
  aiConfidence?: number;
}

const mockEvidences: Evidence[] = [
  {
    id: "1",
    title: "Certificado MLC 2006",
    type: "certificate",
    fileName: "mlc_certificate_2024.pdf",
    fileSize: "2.4 MB",
    regulation: "MLC-2006",
    status: "valid",
    uploadedBy: "João Silva",
    uploadedAt: "2024-01-15",
    expiryDate: "2025-01-15",
    aiVerified: true,
    aiConfidence: 98,
  },
  {
    id: "2",
    title: "Relatório de Auditoria SOLAS",
    type: "report",
    fileName: "solas_audit_q4_2024.pdf",
    fileSize: "5.1 MB",
    regulation: "SOLAS-74",
    status: "valid",
    uploadedBy: "Maria Santos",
    uploadedAt: "2024-12-10",
    aiVerified: true,
    aiConfidence: 95,
  },
  {
    id: "3",
    title: "Treinamento STCW - Certificados",
    type: "certificate",
    fileName: "stcw_training_batch.zip",
    fileSize: "12.8 MB",
    regulation: "STCW-78/10",
    status: "pending_review",
    uploadedBy: "Carlos Mendes",
    uploadedAt: "2024-12-28",
    aiVerified: false,
  },
  {
    id: "4",
    title: "Inspeção MARPOL - Fotos",
    type: "image",
    fileName: "marpol_inspection_photos.zip",
    fileSize: "45.2 MB",
    regulation: "MARPOL-73/78",
    status: "valid",
    uploadedBy: "Ana Oliveira",
    uploadedAt: "2024-12-20",
    aiVerified: true,
    aiConfidence: 92,
  },
  {
    id: "5",
    title: "Certificado ISM Code",
    type: "certificate",
    fileName: "ism_certificate_2023.pdf",
    fileSize: "1.8 MB",
    regulation: "ISM-Code",
    status: "expired",
    uploadedBy: "Pedro Costa",
    uploadedAt: "2023-06-01",
    expiryDate: "2024-06-01",
    aiVerified: true,
    aiConfidence: 99,
  },
  {
    id: "6",
    title: "Política LGPD - Documento",
    type: "document",
    fileName: "lgpd_policy_v2.pdf",
    fileSize: "890 KB",
    regulation: "LGPD-BR",
    status: "valid",
    uploadedBy: "Lucas Ferreira",
    uploadedAt: "2024-11-05",
    aiVerified: true,
    aiConfidence: 97,
  },
];

export default function ComplianceEvidencias() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const { data: evidences, isLoading } = useComplianceEvidences();

  // Use mock data as the display source - backend integration via useComplianceEvidences is available
  const displayEvidences = mockEvidences;

  const filteredEvidences = displayEvidences.filter(ev => {
    const matchesSearch = ev.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          ev.fileName.toLowerCase().includes(searchTerm.toLowerCase());
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
    switch (status) {
      case "valid": return <Badge className="bg-success/20 text-success border-success/30"><CheckCircle2 className="h-3 w-3 mr-1" />Válido</Badge>;
      case "pending_review": return <Badge className="bg-warning/20 text-warning border-warning/30"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>;
      case "expired": return <Badge className="bg-destructive/20 text-destructive border-destructive/30"><AlertTriangle className="h-3 w-3 mr-1" />Expirado</Badge>;
      case "rejected": return <Badge variant="destructive">Rejeitado</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case "certificate": return <Shield className="h-8 w-8 text-success" />;
      case "image": return <FileImage className="h-8 w-8 text-primary" />;
      case "report": return <FilePdf className="h-8 w-8 text-destructive" />;
      default: return <File className="h-8 w-8 text-muted-foreground" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileCheck className="h-7 w-7 text-primary" />
            Gestão de Evidências
          </h1>
          <p className="text-muted-foreground mt-1">Upload e validação de documentos de conformidade</p>
        </div>
        <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Upload Evidência
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Upload de Evidência</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">Arraste arquivos ou clique para selecionar</p>
                <p className="text-xs text-muted-foreground mt-1">PDF, PNG, JPG, ZIP até 50MB</p>
              </div>
              <div className="space-y-2">
                <Label>Título</Label>
                <Input placeholder="Ex: Certificado MLC 2006" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="certificate">Certificado</SelectItem>
                      <SelectItem value="report">Relatório</SelectItem>
                      <SelectItem value="document">Documento</SelectItem>
                      <SelectItem value="image">Imagem</SelectItem>
                      <SelectItem value="audit">Auditoria</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Regulamento</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mlc-2006">MLC 2006</SelectItem>
                      <SelectItem value="stcw">STCW</SelectItem>
                      <SelectItem value="solas">SOLAS</SelectItem>
                      <SelectItem value="marpol">MARPOL</SelectItem>
                      <SelectItem value="lgpd">LGPD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <Brain className="h-5 w-5 text-purple-400" />
                <span className="text-sm">IA irá verificar automaticamente a validade do documento</span>
              </div>
              <Button className="w-full" onClick={() => { setShowUploadDialog(false); toast.success("Evidência enviada para análise!"); }}>
                Enviar para Análise
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-card/50">
          <CardContent className="p-4 text-center">
            <FolderOpen className="h-6 w-6 mx-auto text-primary mb-2" />
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </CardContent>
        </Card>
        <Card className="bg-emerald-500/10 border-emerald-500/30">
          <CardContent className="p-4 text-center">
            <CheckCircle2 className="h-6 w-6 mx-auto text-emerald-400 mb-2" />
            <div className="text-2xl font-bold text-emerald-400">{stats.valid}</div>
            <div className="text-xs text-muted-foreground">Válidos</div>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-4 text-center">
            <Clock className="h-6 w-6 mx-auto text-amber-400 mb-2" />
            <div className="text-2xl font-bold text-amber-400">{stats.pending}</div>
            <div className="text-xs text-muted-foreground">Pendentes</div>
          </CardContent>
        </Card>
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-6 w-6 mx-auto text-red-400 mb-2" />
            <div className="text-2xl font-bold text-red-400">{stats.expired}</div>
            <div className="text-xs text-muted-foreground">Expirados</div>
          </CardContent>
        </Card>
        <Card className="bg-purple-500/10 border-purple-500/30">
          <CardContent className="p-4 text-center">
            <Brain className="h-6 w-6 mx-auto text-purple-400 mb-2" />
            <div className="text-2xl font-bold text-purple-400">{stats.aiVerified}</div>
            <div className="text-xs text-muted-foreground">IA Verificados</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar evidências..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Status</SelectItem>
            <SelectItem value="valid">Válidos</SelectItem>
            <SelectItem value="pending_review">Pendentes</SelectItem>
            <SelectItem value="expired">Expirados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Evidences Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEvidences.map(ev => (
          <Card key={ev.id} className="hover:border-primary/30 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-muted rounded-lg">
                  {getFileIcon(ev.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{ev.title}</h3>
                  <p className="text-sm text-muted-foreground truncate">{ev.fileName}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {getStatusBadge(ev.status)}
                    <Badge variant="outline" className="text-xs">{ev.regulation}</Badge>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-border space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Enviado por</span>
                  <span>{ev.uploadedBy}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Data</span>
                  <span>{new Date(ev.uploadedAt).toLocaleDateString("pt-BR")}</span>
                </div>
                {ev.aiVerified && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-purple-400 flex items-center gap-1">
                      <Brain className="h-3 w-3" /> IA Verificado
                    </span>
                    <span className="text-purple-400">{ev.aiConfidence}%</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="outline" className="flex-1">
                  <Eye className="h-3 w-3 mr-1" /> Ver
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
