/**
 * PEO-DP Documents Manager — Gestão dos documentos obrigatórios (Anexo I-4)
 * Tracking de entrega para DP1 e DP2 com prazos e status
 */
import React, { useState } from "react";
import { quickExport } from "@/lib/export-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { FileText, Upload, CheckCircle, AlertTriangle, Clock, Download, Ship, Shield } from "lucide-react";
import { toast } from "sonner";

interface DocumentItem {
  id: string;
  section: string;
  number: string;
  title: string;
  description: string;
  dpClass: "DP1" | "DP2" | "BOTH";
  status: "pending" | "uploaded" | "approved" | "rejected" | "na";
  dueDate?: string;
  uploadedAt?: string;
  notes?: string;
}

const DOCUMENTS: DocumentItem[] = [
  // Seção 1 - Cartas
  { id: "1.1", section: "1. Cartas", number: "1.1", title: "Carta compromisso da direção", description: "Carta assinada pela mais alta direção comprometendo-se a implantar todos os requisitos do PEO-DP", dpClass: "BOTH", status: "pending" },
  { id: "1.2", section: "1. Cartas", number: "1.2", title: "Responsável PEO-DP", description: "Nome, celular e e-mail do responsável pela implantação", dpClass: "BOTH", status: "pending" },
  { id: "1.3", section: "1. Cartas", number: "1.3", title: "Company DP Authority", description: "Dados do CDPA, substituto, Gerente de Manutenção e Diretor Administrativo", dpClass: "BOTH", status: "pending" },
  { id: "1.4", section: "1. Cartas", number: "1.4", title: "Instrutores Qualificados", description: "Instrutor qualificado Convés (NORMAM 101) e Instrutor qualificado Máquinas", dpClass: "BOTH", status: "pending" },
  // Seção 2 - Documentos Técnicos DP2
  { id: "2.1", section: "2. Documentos DP2", number: "2.1", title: "Software do sistema DP", description: "Versão atual do software e nome do fabricante para cada embarcação", dpClass: "BOTH", status: "pending" },
  { id: "2.2", section: "2. Documentos DP2", number: "2.2", title: "Sistemas de Referência de Posição", description: "Tipos, quantidades, fabricante de cada PRS absoluto e relativo", dpClass: "BOTH", status: "pending" },
  { id: "2.3", section: "2. Documentos DP2", number: "2.3", title: "Fabricante Thrusters/Azimutais", description: "Razão social e nome fantasia do fabricante", dpClass: "BOTH", status: "pending" },
  { id: "2.4", section: "2. Documentos DP2", number: "2.4", title: "Cronograma exercícios emergência DP", description: "Datas estimadas dos exercícios simulados de todas as embarcações", dpClass: "BOTH", status: "pending" },
  { id: "2.5", section: "2. Documentos DP2", number: "2.5", title: "Manual de Operação DP Específico", description: "Vessel-specific DP Operating Manual atualizado", dpClass: "BOTH", status: "pending" },
  { id: "2.6", section: "2. Documentos DP2", number: "2.6", title: "Manual do Fabricante do Sistema DP", description: "DP System Manufacturer's Operating Manual", dpClass: "BOTH", status: "pending" },
  { id: "2.7", section: "2. Documentos DP2", number: "2.7", title: "Certificado de classe atual", description: "Com vistorias anuais, intermediárias e especiais sem pendência", dpClass: "BOTH", status: "pending" },
  { id: "2.8", section: "2. Documentos DP2", number: "2.8", title: "LV Configuração Sistema DP", description: "Formulários atualizados da Lista de Verificação", dpClass: "BOTH", status: "pending" },
  { id: "2.9", section: "2. Documentos DP2", number: "2.9", title: "LV Configuração Praça de Máquinas", description: "Formulários atualizados da LV de equipamentos", dpClass: "BOTH", status: "pending" },
  { id: "2.10", section: "2. Documentos DP2", number: "2.10", title: "FMEA atualizado", description: "Com carimbo e assinatura da sociedade classificadora", dpClass: "DP2", status: "pending" },
  { id: "2.11", section: "2. Documentos DP2", number: "2.11", title: "CAMO e ASOG", description: "Todos atualizados", dpClass: "DP2", status: "pending" },
  { id: "2.12", section: "2. Documentos DP2", number: "2.12", title: "Five-Yearly Trials", description: "Relatório do FIVE-YEARLY TRIALS mais recente", dpClass: "DP2", status: "pending" },
  { id: "2.13", section: "2. Documentos DP2", number: "2.13", title: "Annual DP Trials", description: "ANNUAL DP TRIALS de 2025 (ou 2024 se Five-Yearly em 2025)", dpClass: "DP2", status: "pending" },
  { id: "2.14", section: "2. Documentos DP2", number: "2.14", title: "Relatório calibração thrusters", description: "Calibração completa com scalings dos thrusters no DP", dpClass: "BOTH", status: "pending" },
  { id: "2.15", section: "2. Documentos DP2", number: "2.15", title: "Relatório calibração relés proteção", description: "Calibração dos relés de proteção dos disjuntores principais", dpClass: "BOTH", status: "pending" },
  { id: "2.16", section: "2. Documentos DP2", number: "2.16", title: "Cartão de Tripulação de Segurança", description: "CTS atualizado", dpClass: "BOTH", status: "pending" },
  { id: "2.17", section: "2. Documentos DP2", number: "2.17", title: "Estudo de coordenação e seletividade", description: "Estudo elétrico atualizado", dpClass: "DP2", status: "pending" },
  { id: "2.18", section: "2. Documentos DP2", number: "2.18", title: "Estudo de curto-circuito", description: "Estudo atualizado", dpClass: "DP2", status: "pending" },
  { id: "2.19", section: "2. Documentos DP2", number: "2.19", title: "Cronograma de docagens", description: "Cronograma atualizado", dpClass: "BOTH", status: "pending" },
  { id: "2.20", section: "2. Documentos DP2", number: "2.20", title: "Cronograma exercícios DP", description: "Cronograma de exercícios de emergência de DP", dpClass: "BOTH", status: "pending" },
];

export function PeoDPDocumentsManager() {
  const [docs, setDocs] = useState<DocumentItem[]>(DOCUMENTS);
  const [filterClass, setFilterClass] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedVessel, setSelectedVessel] = useState("all");

  const filtered = docs.filter(d =>
    (filterClass === "all" || d.dpClass === filterClass || d.dpClass === "BOTH") &&
    (filterStatus === "all" || d.status === filterStatus)
  );

  const sections = [...new Set(filtered.map(d => d.section))];
  const totalDocs = filtered.length;
  const uploadedDocs = filtered.filter(d => d.status === "uploaded" || d.status === "approved").length;
  const approvedDocs = filtered.filter(d => d.status === "approved").length;
  const progressPct = totalDocs > 0 ? Math.round((uploadedDocs / totalDocs) * 100) : 0;

  const toggleStatus = (id: string) => {
    setDocs(docs.map(d => {
      if (d.id !== id) return d;
      const next: Record<string, string> = { pending: "uploaded", uploaded: "approved", approved: "pending", rejected: "pending", na: "pending" };
      return { ...d, status: (next[d.status] || "pending") as DocumentItem["status"], uploadedAt: next[d.status] === "uploaded" ? new Date().toISOString() : d.uploadedAt };
    }));
    toast.success("Status atualizado");
  };

  const statusIcon = (s: string) => {
    switch (s) {
      case "approved": return <CheckCircle className="h-4 w-4 text-success" />;
      case "uploaded": return <Clock className="h-4 w-4 text-primary" />;
      case "rejected": return <AlertTriangle className="h-4 w-4 text-destructive" />;
      default: return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Documentos para Avaliação — Anexo I-4
          </h3>
          <p className="text-sm text-muted-foreground">
            Gestão dos {DOCUMENTS.length} documentos obrigatórios PEO-DP 2026
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Select value={filterClass} onValueChange={setFilterClass}>
            <SelectTrigger className="w-28 h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="DP1">DP1</SelectItem>
              <SelectItem value="DP2">DP2</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-32 h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Status</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="uploaded">Enviado</SelectItem>
              <SelectItem value="approved">Aprovado</SelectItem>
              <SelectItem value="rejected">Rejeitado</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" className="gap-1 h-9" onClick={() => quickExport(DOCUMENTS, "PEO-DP Documents Checklist")}>
            <Download className="h-3 w-3" /> Exportar
          </Button>
        </div>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progresso de Entrega</span>
            <span className="text-sm font-bold">{uploadedDocs}/{totalDocs} ({progressPct}%)</span>
          </div>
          <Progress value={progressPct} className="h-3" />
          <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-muted-foreground" /> Pendente: {filtered.filter(d => d.status === "pending").length}</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-primary" /> Enviado: {filtered.filter(d => d.status === "uploaded").length}</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-success" /> Aprovado: {approvedDocs}</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-destructive" /> Rejeitado: {filtered.filter(d => d.status === "rejected").length}</span>
          </div>
        </CardContent>
      </Card>

      {/* Document List by Section */}
      {sections.map(section => (
        <Card key={section}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              {section}
              <Badge variant="outline" className="text-xs ml-auto">
                {filtered.filter(d => d.section === section && (d.status === "uploaded" || d.status === "approved")).length}/
                {filtered.filter(d => d.section === section).length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {filtered.filter(d => d.section === section).map(doc => (
              <div key={doc.id} className={`flex items-start gap-3 p-2 rounded border ${
                doc.status === "approved" ? "border-success/20 bg-success/5" :
                doc.status === "rejected" ? "border-destructive/20 bg-destructive/5" :
                doc.status === "uploaded" ? "border-primary/20 bg-primary/5" :
                "border-border"
              }`}>
                <button onClick={() => toggleStatus(doc.id)} className="mt-0.5 shrink-0">
                  {statusIcon(doc.status)}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-muted-foreground">{doc.number}</span>
                    <span className="text-sm font-medium">{doc.title}</span>
                    <Badge variant="outline" className="text-xs shrink-0">{doc.dpClass}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{doc.description}</p>
                </div>
                <Button size="sm" variant="ghost" className="shrink-0 h-7 gap-1 text-xs" onClick={() => toast.info(`Upload para: ${doc.title}`)}>
                  <Upload className="h-3 w-3" /> Upload
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
