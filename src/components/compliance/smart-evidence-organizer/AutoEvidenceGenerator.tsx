/**
 * Auto Evidence Generator - IA gera rascunhos de procedimentos/registros para gaps
 */
import React, { useState, useCallback, memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sparkles, FileText, Loader2, Download, Copy, CheckCircle2,
  AlertTriangle, FileUp, Wand2, Eye
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { EvidenceItem, EvidenceElement, EvidencePack } from "./types";
import { cn } from "@/lib/utils";

import type { ComplianceFramework } from "./SmartEvidenceOrganizer";

interface Props {
  framework: ComplianceFramework;
  pack: EvidencePack;
  items: EvidenceItem[];
  elements: EvidenceElement[];
  onRefresh: () => void;
}

interface GeneratedDoc {
  itemId: string;
  itemNumber: string;
  itemText: string;
  elementCode: string;
  docType: string;
  title: string;
  content: string;
  normReference: string;
}

export const AutoEvidenceGenerator = memo(({ framework, pack, items, elements, onRefresh }: Props) => {
  const [generating, setGenerating] = useState(false);
  const [generatedDocs, setGeneratedDocs] = useState<GeneratedDoc[]>([]);
  const [activeDoc, setActiveDoc] = useState<string | null>(null);
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());

  const gapItems = items.filter(i =>
    i.evidence_status === "not_found" || i.evidence_status === "pending"
  );

  const generateEvidence = useCallback(async () => {
    if (gapItems.length === 0) {
      toast.info("Nenhum gap encontrado para gerar evidências");
      return;
    }

    setGenerating(true);
    try {
      const result = await supabase.functions.invoke("smart-evidence-organizer", {
        body: {
          action: "generate_evidence_docs",
          pack_id: pack.id,
          framework,
          gap_items: gapItems.slice(0, 15).map(item => {
            const el = elements.find(e => e.id === item.element_id);
            return {
              id: item.id,
              item_number: item.item_number,
              item_text: item.item_text,
              requirement_description: item.requirement_description,
              element_code: el?.element_code || `E${el?.element_number || "?"}`,
              element_name: el?.element_name,
              is_critical: item.is_critical,
            };
          }),
        },
      });

      if (result.error) throw result.error;

      setGeneratedDocs(result.data.documents || []);
      if (result.data.documents?.length) {
        setActiveDoc(result.data.documents[0].itemId);
      }

      toast.success(`${result.data.documents?.length || 0} documentos gerados!`, {
        description: "Revise e salve os que forem adequados",
      });
    } catch (error) {
      console.error("Generate evidence error:", error);
      toast.error("Erro ao gerar evidências", {
        description: error instanceof Error ? error.message : "Erro desconhecido",
      });
    } finally {
      setGenerating(false);
    }
  }, [gapItems, pack.id, framework, elements]);

  const saveAsEvidence = useCallback(async (doc: GeneratedDoc) => {
    setSavingIds(prev => new Set(prev).add(doc.itemId));
    try {
      // Save the generated document as a manual evidence
      await supabase.from("audit_evidence_matches").insert({
        item_id: doc.itemId,
        pack_id: pack.id,
        document_title: doc.title,
        match_source: "ai" as const,
        match_confidence: 85,
        match_reason: `Documento gerado automaticamente pela IA: ${doc.docType}. ${doc.normReference}`,
      });

      await supabase.from("audit_evidence_items")
        .update({
          evidence_status: "partial",
          ai_response: doc.content.substring(0, 2000),
        })
        .eq("id", doc.itemId);

      toast.success(`"${doc.title}" salvo como evidência!`);
      onRefresh();
    } catch (error) {
      toast.error("Erro ao salvar evidência");
    } finally {
      setSavingIds(prev => {
        const next = new Set(prev);
        next.delete(doc.itemId);
        return next;
      });
    }
  }, [pack.id, onRefresh]);

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado!");
  }, []);

  const activeDocument = generatedDocs.find(d => d.itemId === activeDoc);

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                <Wand2 className="h-5 w-5 text-primary" />
                Auto-Geração de Evidências
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                A IA gerará rascunhos de procedimentos, registros e declarações para
                {" "}<span className="font-medium text-primary">{gapItems.length} gaps</span> identificados
              </p>
            </div>
            <Button
              onClick={generateEvidence}
              disabled={generating || gapItems.length === 0}
              className="gap-2"
              size="lg"
            >
              {generating ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Gerando...</>
              ) : (
                <><Sparkles className="h-4 w-4" /> Gerar Evidências ({gapItems.length})</>
              )}
            </Button>
          </div>

          {generating && (
            <div className="mt-4">
              <p className="text-xs text-muted-foreground mb-1">
                Analisando requisitos e gerando documentos de conformidade...
              </p>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: "60%" }} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gap Items Summary */}
      {gapItems.length > 0 && generatedDocs.length === 0 && !generating && (
        <Card>
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              Gaps que Receberão Evidências ({gapItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              <div className="space-y-1.5">
                {gapItems.slice(0, 15).map(item => {
                  const el = elements.find(e => e.id === item.element_id);
                  return (
                    <div key={item.id} className="flex items-center gap-2 p-2 rounded bg-muted/30 text-sm">
                      <AlertTriangle className="h-3.5 w-3.5 text-yellow-500 shrink-0" />
                      <span className="font-mono text-xs text-muted-foreground">{el?.element_code || "?"}</span>
                      <span className="truncate">{item.item_number} — {item.item_text}</span>
                      {item.is_critical && <Badge variant="destructive" className="text-[9px] h-4 shrink-0">CRÍTICO</Badge>}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Generated Documents */}
      {generatedDocs.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Document List */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Documentos Gerados ({generatedDocs.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="px-2">
              <ScrollArea className="h-[400px]">
                <div className="space-y-1 pr-1">
                  {generatedDocs.map(doc => (
                    <div
                      key={doc.itemId}
                      onClick={() => setActiveDoc(doc.itemId)}
                      className={cn(
                        "p-2.5 rounded-lg cursor-pointer transition-colors text-xs",
                        activeDoc === doc.itemId
                          ? "bg-primary/10 border border-primary/30"
                          : "hover:bg-muted/50"
                      )}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <FileText className="h-3 w-3 text-primary shrink-0" />
                        <span className="font-medium truncate">{doc.title}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Badge variant="outline" className="text-[9px]">{doc.elementCode}</Badge>
                        <Badge variant="secondary" className="text-[9px]">{doc.docType}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Document Preview */}
          <Card className="lg:col-span-2">
            {activeDocument ? (
              <>
                <CardHeader className="pb-2 pt-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      {activeDocument.title}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(activeDocument.content)}
                        className="gap-1 text-xs"
                      >
                        <Copy className="h-3 w-3" /> Copiar
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => saveAsEvidence(activeDocument)}
                        disabled={savingIds.has(activeDocument.itemId)}
                        className="gap-1 text-xs"
                      >
                        {savingIds.has(activeDocument.itemId) ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-3 w-3" />
                        )}
                        Salvar como Evidência
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-[10px]">{activeDocument.elementCode}</Badge>
                    <Badge variant="secondary" className="text-[10px]">{activeDocument.docType}</Badge>
                    {activeDocument.normReference && (
                      <Badge variant="outline" className="text-[10px]">📜 {activeDocument.normReference}</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[380px]">
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <pre className="whitespace-pre-wrap text-sm font-sans leading-relaxed">
                        {activeDocument.content}
                      </pre>
                    </div>
                  </ScrollArea>
                </CardContent>
              </>
            ) : (
              <CardContent className="py-20 text-center">
                <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Selecione um documento para visualizar</p>
              </CardContent>
            )}
          </Card>
        </div>
      )}
    </div>
  );
});

AutoEvidenceGenerator.displayName = "AutoEvidenceGenerator";
