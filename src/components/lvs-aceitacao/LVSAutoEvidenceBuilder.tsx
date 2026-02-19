/**
 * LVS Auto Evidence Builder — Auto-generates evidence packages per ET/section
 * Maps existing documents (certificates, checklists, audits) to LVS items
 * AI-powered gap detection and evidence suggestions
 */
import React, { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Archive, FolderOpen, FileText, CheckCircle2, Clock, AlertTriangle,
  Download, Brain, Loader2, Search, Sparkles, Package, FileCheck,
  Camera, XCircle, Shield, Wrench, Eye
} from "lucide-react";
import { ALL_LVS_SECTIONS, ET_REFERENCES, type ItemStatus } from "./lvs-data";
import { useNautilusAI } from "@/hooks/useNautilusAI";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";

interface EvidencePackage {
  id: string;
  etRef: string;
  etDescription: string;
  sections: string[];
  totalItems: number;
  approvedItems: number;
  pendingItems: number;
  rejectedItems: number;
  notVerifiedItems: number;
  completeness: number;
  requiredDocuments: string[];
  availableDocuments: string[];
  missingDocuments: string[];
  status: "ready" | "partial" | "incomplete";
}

interface EvidenceDocument {
  id: string;
  name: string;
  type: string;
  source: string;
  status: "available" | "pending" | "missing";
  mappedItems: string[];
  date: string;
}

export function LVSAutoEvidenceBuilder() {
  const { generate, isLoading: aiLoading } = useNautilusAI();
  const [activeTab, setActiveTab] = useState("packages");
  const [searchTerm, setSearchTerm] = useState("");
  const [aiSummaries, setAiSummaries] = useState<Record<string, string>>({});
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [fullAnalysis, setFullAnalysis] = useState<string | null>(null);
  const [showFullAnalysis, setShowFullAnalysis] = useState(false);

  // Load real evidence data from Supabase
  const { data: certificates = [] } = useQuery({
    queryKey: ["lvs-evidence-certificates"],
    queryFn: async () => {
      const { data } = await supabase.from("certificates").select("id, certificate_number, certificate_type, issue_date, expiry_date, status, created_at").order("created_at", { ascending: false }).limit(100);
      return data || [];
    },
    staleTime: 120000,
  });

  const { data: documents = [] } = useQuery({
    queryKey: ["lvs-evidence-documents"],
    queryFn: async () => {
      const { data } = await supabase.from("ai_documents").select("id, file_name, file_type, category, ocr_status, created_at").order("created_at", { ascending: false }).limit(100);
      return data || [];
    },
    staleTime: 120000,
  });

  // Build evidence packages per ET
  const packages: EvidencePackage[] = useMemo(() => {
    return ET_REFERENCES.map(et => {
      const etSections = ALL_LVS_SECTIONS.filter(s => s.etRef === et.id);
      const allItems = etSections.flatMap(s => s.subsections.flatMap(ss => ss.items));
      const approved = allItems.filter(i => i.status === "approved").length;
      const pending = allItems.filter(i => i.status === "pending").length;
      const rejected = allItems.filter(i => i.status === "rejected").length;
      const notVerified = allItems.filter(i => i.status === "not_verified").length;
      const na = allItems.filter(i => i.status === "not_applicable").length;
      const applicable = allItems.length - na;
      const completeness = applicable > 0 ? Math.round((approved / applicable) * 100) : 0;

      // Infer required documents from methodology
      const requiredDocs = new Set<string>();
      const availableDocs: string[] = [];
      const missingDocs: string[] = [];

      allItems.forEach(item => {
        const meth = item.methodology.toLowerCase();
        if (meth.includes("certificado")) requiredDocs.add("Certificados técnicos");
        if (meth.includes("teste")) requiredDocs.add("Relatórios de teste");
        if (meth.includes("datasheet")) requiredDocs.add("Datasheets de equipamentos");
        if (meth.includes("documental") || meth.includes("documento")) requiredDocs.add("Documentação técnica");
        if (meth.includes("foto") || meth.includes("fotográfico")) requiredDocs.add("Registro fotográfico");
        if (meth.includes("plano")) requiredDocs.add("Planos operacionais");
        if (meth.includes("avaliaç")) requiredDocs.add("Relatórios de avaliação");

        if (item.status === "approved") {
          availableDocs.push(`[${item.ref}] ${item.question.substring(0, 50)}`);
        } else if (item.status === "rejected" || item.status === "pending") {
          missingDocs.push(`[${item.ref}] ${item.pendency || item.question.substring(0, 50)}`);
        }
      });

      return {
        id: et.id,
        etRef: et.id,
        etDescription: et.description,
        sections: etSections.map(s => `${s.code} ${s.title}`),
        totalItems: allItems.length,
        approvedItems: approved,
        pendingItems: pending,
        rejectedItems: rejected,
        notVerifiedItems: notVerified,
        completeness,
        requiredDocuments: Array.from(requiredDocs),
        availableDocuments: availableDocs.slice(0, 20),
        missingDocuments: missingDocs.slice(0, 20),
        status: completeness === 100 ? "ready" : completeness >= 50 ? "partial" : "incomplete",
      };
    });
  }, []);

  // Build evidence library from real data + LVS items
  const evidenceLibrary: EvidenceDocument[] = useMemo(() => {
    const docs: EvidenceDocument[] = [];

    // From certificates
    certificates.forEach((c: any) => {
      docs.push({
        id: c.id,
        name: c.certificate_number || c.certificate_type || "Certificado",
        type: "certificate",
        source: "Certificates DB",
        status: c.status === "active" ? "available" : c.status === "expired" ? "missing" : "pending",
        mappedItems: [],
        date: c.issue_date || c.created_at,
      });
    });

    // From AI documents
    documents.forEach((d: any) => {
      docs.push({
        id: d.id,
        name: d.file_name,
        type: d.file_type || "document",
        source: "Document Repository",
        status: d.ocr_status === "completed" ? "available" : "pending",
        mappedItems: [],
        date: d.created_at,
      });
    });

    // From approved LVS items (as implicit evidence)
    ALL_LVS_SECTIONS.flatMap(s => s.subsections.flatMap(ss => ss.items))
      .filter(i => i.status === "approved" && i.hasPhoto)
      .forEach(item => {
        docs.push({
          id: `photo-${item.id}`,
          name: `Foto: ${item.ref} — ${item.question.substring(0, 40)}`,
          type: "photo",
          source: "LVS Photos",
          status: "available",
          mappedItems: [item.ref],
          date: new Date().toISOString(),
        });
      });

    return docs;
  }, [certificates, documents]);

  // Stats
  const stats = useMemo(() => ({
    totalPackages: packages.length,
    ready: packages.filter(p => p.status === "ready").length,
    partial: packages.filter(p => p.status === "partial").length,
    incomplete: packages.filter(p => p.status === "incomplete").length,
    totalEvidence: evidenceLibrary.length,
    available: evidenceLibrary.filter(e => e.status === "available").length,
    pending: evidenceLibrary.filter(e => e.status === "pending").length,
    missing: evidenceLibrary.filter(e => e.status === "missing").length,
  }), [packages, evidenceLibrary]);

  // AI evidence summary per package
  const generatePackageSummary = useCallback(async (pkg: EvidencePackage) => {
    setGeneratingId(pkg.id);
    const result = await generate("peodp",
      `Você é auditor especialista em aceitação de embarcações RSV Petrobras.

PACOTE DE EVIDÊNCIAS: ${pkg.etRef} — ${pkg.etDescription}
- Seções: ${pkg.sections.join(", ")}
- Total itens: ${pkg.totalItems} | Aprovados: ${pkg.approvedItems} | Pendentes: ${pkg.pendingItems} | Rejeitados: ${pkg.rejectedItems}
- Completude: ${pkg.completeness}%
- Documentos requeridos: ${pkg.requiredDocuments.join(", ")}
- Gaps (documentos faltantes): ${pkg.missingDocuments.slice(0, 10).join("\n")}

GERE:
1. **Checklist de Evidências**: Lista completa de documentos necessários para este pacote
2. **Mapeamento**: Quais documentos cobrem quais requisitos
3. **Gaps Críticos**: Evidências que o inspetor Petrobras CERTAMENTE vai cobrar
4. **Dicas de Preparação**: Como organizar o pacote para maximizar aprovação
5. **Template de Índice**: Modelo de índice para o dossiê de evidências

Use tabelas markdown e seja prático.`,
      { framework: "lvs_petrobras" }
    );
    if (result) {
      setAiSummaries(prev => ({ ...prev, [pkg.id]: result.response }));
    }
    setGeneratingId(null);
  }, [generate]);

  // Full AI analysis
  const generateFullAnalysis = useCallback(async () => {
    setShowFullAnalysis(true);
    setFullAnalysis(null);
    const summary = packages.map(p =>
      `${p.etRef}: ${p.completeness}% completo, ${p.rejectedItems} rejeitados, ${p.pendingItems} pendentes`
    ).join("\n");

    const result = await generate("peodp",
      `Você é o Coordenador de Dossiê para aceitação de embarcação RSV Petrobras.

RESUMO DOS PACOTES DE EVIDÊNCIAS:
${summary}

Total evidências no repositório: ${stats.totalEvidence}
Disponíveis: ${stats.available} | Pendentes: ${stats.pending} | Faltantes: ${stats.missing}

GERE UM RELATÓRIO EXECUTIVO:
1. **Status Geral**: Resumo da prontidão de evidências
2. **Matriz ET × Tipo de Evidência**: Quais tipos faltam em cada ET
3. **Ações Prioritárias**: Top 10 evidências que devem ser produzidas urgentemente
4. **Cronograma de Compilação**: Plano para montar todos os dossiês
5. **Checklist do Inspetor**: O que o inspetor Petrobras vai pedir em cada ET
6. **Score de Prontidão**: Estimativa de % pronto para inspeção

Use markdown com tabelas.`,
      { framework: "lvs_petrobras" }
    );
    if (result) setFullAnalysis(result.response);
  }, [packages, stats, generate]);

  // Export
  const exportCSV = () => {
    const headers = "ET,Descrição,Total,Aprovados,Pendentes,Rejeitados,Completude %,Status,Docs Requeridos,Docs Faltantes\n";
    const rows = packages.map(p =>
      `"${p.etRef}","${p.etDescription}",${p.totalItems},${p.approvedItems},${p.pendingItems},${p.rejectedItems},${p.completeness}%,${p.status},"${p.requiredDocuments.join("; ")}","${p.missingDocuments.slice(0, 5).join("; ")}"`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "lvs-evidence-packages.csv"; a.click();
    toast.success("Pacotes exportados!");
  };

  const STATUS_BADGE: Record<string, { label: string; color: string }> = {
    ready: { label: "Pronto", color: "bg-success/20 text-success" },
    partial: { label: "Parcial", color: "bg-warning/20 text-warning" },
    incomplete: { label: "Incompleto", color: "bg-destructive/20 text-destructive" },
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Archive className="h-5 w-5 text-primary" />
            Auto Evidence Builder — LVS Petrobras
          </h3>
          <p className="text-sm text-muted-foreground">
            Geração automática de dossiês de evidência por ET • {stats.totalEvidence} evidências
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={generateFullAnalysis} disabled={aiLoading}>
            <Brain className="h-3.5 w-3.5 mr-1" /> Análise Completa IA
          </Button>
          <Button size="sm" variant="outline" onClick={exportCSV}>
            <Download className="h-3.5 w-3.5 mr-1" /> CSV
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
        {[
          { icon: Package, label: "Pacotes", value: stats.totalPackages, color: "text-primary" },
          { icon: CheckCircle2, label: "Prontos", value: stats.ready, color: "text-success" },
          { icon: Clock, label: "Parciais", value: stats.partial, color: "text-warning" },
          { icon: XCircle, label: "Incompletos", value: stats.incomplete, color: "text-destructive" },
          { icon: FileText, label: "Evidências", value: stats.totalEvidence, color: "text-primary" },
          { icon: FileCheck, label: "Disponíveis", value: stats.available, color: "text-success" },
          { icon: Clock, label: "Pendentes", value: stats.pending, color: "text-warning" },
          { icon: AlertTriangle, label: "Faltantes", value: stats.missing, color: "text-destructive" },
        ].map(kpi => (
          <Card key={kpi.label}><CardContent className="p-2 text-center">
            <kpi.icon className={`h-3.5 w-3.5 mx-auto mb-0.5 ${kpi.color}`} />
            <div className={`text-lg font-bold ${kpi.color}`}>{kpi.value}</div>
            <div className="text-[9px] text-muted-foreground">{kpi.label}</div>
          </CardContent></Card>
        ))}
      </div>

      {/* Full AI Analysis */}
      {showFullAnalysis && (
        <Card className="border-primary/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> Relatório IA — Prontidão de Evidências
            </CardTitle>
          </CardHeader>
          <CardContent>
            {fullAnalysis ? (
              <ScrollArea className="h-[350px] rounded border p-4 bg-primary/5">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{fullAnalysis}</ReactMarkdown>
                </div>
              </ScrollArea>
            ) : (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-3 text-sm text-muted-foreground">Analisando dossiê completo...</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="packages"><FolderOpen className="h-3.5 w-3.5 mr-1" /> Pacotes por ET ({packages.length})</TabsTrigger>
          <TabsTrigger value="library"><Archive className="h-3.5 w-3.5 mr-1" /> Biblioteca ({evidenceLibrary.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="packages" className="space-y-3 mt-3">
          {packages.map(pkg => (
            <Card key={pkg.id} className={
              pkg.status === "ready" ? "border-success/30" :
              pkg.status === "incomplete" ? "border-destructive/20" : ""
            }>
              <CardContent className="p-4 space-y-3">
                {/* Package Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="font-mono text-xs">{pkg.etRef}</Badge>
                      <h4 className="font-semibold text-sm">{pkg.etDescription}</h4>
                      <Badge className={STATUS_BADGE[pkg.status].color}>
                        {STATUS_BADGE[pkg.status].label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{pkg.sections.length} seções</span>
                      <span>{pkg.totalItems} itens</span>
                      <span className="text-success">✓ {pkg.approvedItems}</span>
                      <span className="text-warning">⏳ {pkg.pendingItems}</span>
                      <span className="text-destructive">✗ {pkg.rejectedItems}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className={`text-2xl font-bold ${
                      pkg.completeness >= 80 ? "text-success" :
                      pkg.completeness >= 50 ? "text-warning" : "text-destructive"
                    }`}>{pkg.completeness}%</span>
                    <Button size="sm" variant="outline" className="text-[10px] h-6" onClick={() => generatePackageSummary(pkg)} disabled={generatingId === pkg.id}>
                      {generatingId === pkg.id ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Brain className="h-3 w-3 mr-1" />}
                      Checklist IA
                    </Button>
                  </div>
                </div>

                {/* Progress */}
                <Progress value={pkg.completeness} className="h-2" />

                {/* Required Docs */}
                <div className="flex flex-wrap gap-1">
                  {pkg.requiredDocuments.map(doc => (
                    <Badge key={doc} variant="outline" className="text-[9px] bg-muted/30">
                      <FileText className="h-2.5 w-2.5 mr-0.5" /> {doc}
                    </Badge>
                  ))}
                </div>

                {/* Missing docs preview */}
                {pkg.missingDocuments.length > 0 && (
                  <div className="p-2 rounded bg-destructive/5 border border-destructive/10">
                    <p className="text-[10px] font-medium text-destructive mb-1">
                      Evidências faltantes ({pkg.missingDocuments.length}):
                    </p>
                    <div className="space-y-0.5">
                      {pkg.missingDocuments.slice(0, 5).map((doc, i) => (
                        <p key={i} className="text-[10px] text-muted-foreground">• {doc}</p>
                      ))}
                      {pkg.missingDocuments.length > 5 && (
                        <p className="text-[10px] text-muted-foreground italic">... e mais {pkg.missingDocuments.length - 5}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* AI Summary */}
                {aiSummaries[pkg.id] && (
                  <div className="p-3 rounded bg-primary/5 border border-primary/20">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                      <span className="text-xs font-medium text-primary">Checklist de Evidências (IA)</span>
                    </div>
                    <ScrollArea className="h-[250px]">
                      <div className="prose prose-sm dark:prose-invert max-w-none text-xs">
                        <ReactMarkdown>{aiSummaries[pkg.id]}</ReactMarkdown>
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="library" className="space-y-3 mt-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar evidências..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9" />
          </div>
          <ScrollArea className="h-[500px]">
            <div className="space-y-1.5">
              {evidenceLibrary
                .filter(e => !searchTerm || e.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map(doc => (
                <Card key={doc.id}>
                  <CardContent className="p-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      {doc.status === "available" ? <CheckCircle2 className="h-4 w-4 text-success" /> :
                       doc.status === "pending" ? <Clock className="h-4 w-4 text-warning" /> :
                       <AlertTriangle className="h-4 w-4 text-destructive" />}
                      <div>
                        <p className="text-sm font-medium">{doc.name}</p>
                        <p className="text-[10px] text-muted-foreground">{doc.source} • {new Date(doc.date).toLocaleDateString("pt-BR")}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {doc.mappedItems.length > 0 && (
                        <Badge variant="secondary" className="text-[9px]">{doc.mappedItems.length} itens</Badge>
                      )}
                      <Badge variant="outline" className="text-[9px]">{doc.type}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {evidenceLibrary.length === 0 && (
                <Card><CardContent className="py-8 text-center text-muted-foreground">
                  <Archive className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">Nenhuma evidência no repositório</p>
                </CardContent></Card>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
