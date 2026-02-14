/**
 * Compliance Evidence Generator - Reusable AI evidence generator
 * Supports ISM Code, ISPS, MARPOL, SOLAS, and other maritime compliance frameworks
 */
import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Sparkles, FileText, Download, Copy, Loader2,
  AlertTriangle, CheckCircle, Clock, Ship, Target
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { logger } from "@/lib/logger";

interface ModuleElement {
  id: number | string;
  name: string;
}

interface ComplianceEvidenceGeneratorProps {
  moduleId: string;
  moduleName: string;
  elements: ModuleElement[];
  edgeFunctionName?: string;
}

interface GeneratedEvidence {
  content: string;
  analysis: string;
  recommendations: string[];
  corrective_actions: string[];
  normative_references: string[];
  risk_level: string;
  confidence: number;
}

export function ComplianceEvidenceGenerator({
  moduleId,
  moduleName,
  elements,
  edgeFunctionName,
}: ComplianceEvidenceGeneratorProps) {
  const [selectedElement, setSelectedElement] = useState<string>("");
  const [ncType, setNcType] = useState<string>("B");
  const [vesselName, setVesselName] = useState("");
  const [auditorName, setAuditorName] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [observedCondition, setObservedCondition] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [evidence, setEvidence] = useState<GeneratedEvidence | null>(null);

  const generateEvidence = useCallback(async () => {
    if (!itemDescription || !observedCondition) {
      toast.error("Preencha a descrição do item e a condição observada");
      return;
    }

    setIsGenerating(true);
    try {
      const elementName = elements.find(e => String(e.id) === selectedElement)?.name || "";

      if (edgeFunctionName) {
        const { data, error } = await supabase.functions.invoke(edgeFunctionName, {
          body: {
            element_number: selectedElement,
            element_name: elementName,
            item_description: itemDescription,
            non_conformity_reason: observedCondition,
            nc_classification: ncType,
            vessel_name: vesselName,
            auditor_name: auditorName,
            audit_date: new Date().toISOString().split("T")[0],
          },
        });
        if (error) throw error;
        setEvidence({
          content: data?.evidence?.content || data?.content || "Evidência gerada",
          analysis: data?.evidence?.analysis || data?.analysis || "",
          recommendations: data?.evidence?.recommendations || data?.recommendations || [],
          corrective_actions: data?.evidence?.corrective_actions || data?.corrective_actions || [],
          normative_references: data?.evidence?.normative_references || data?.normative_references || [],
          risk_level: ncType === "A" ? "critical" : ncType === "B" ? "high" : "medium",
          confidence: data?.confidence_score || 92,
        });
      } else {
        // Fallback: use ai-chat
        const { data, error } = await supabase.functions.invoke("ai-chat", {
          body: {
            messages: [
              {
                role: "system",
                content: `Você é um auditor sênior especialista em ${moduleName}. Gere evidências técnicas detalhadas para não conformidades, incluindo: análise do desvio, referências normativas, ações corretivas recomendadas e prazo de implementação. Responda em markdown formatado.`,
              },
              {
                role: "user",
                content: `Gere evidência de auditoria ${moduleName} para:
- Elemento/Seção: ${selectedElement} - ${elementName}
- Classificação NC: ${ncType}
- Embarcação: ${vesselName || "N/A"}
- Descrição do Item: ${itemDescription}
- Condição Observada: ${observedCondition}
- Data: ${new Date().toLocaleDateString("pt-BR")}
- Auditor: ${auditorName || "N/A"}

Inclua: análise técnica, referências normativas (IMO, SOLAS, ${moduleName}), ações corretivas com prazos, e avaliação de risco.`,
              },
            ],
          },
        });
        if (error) throw error;

        const responseText = data?.choices?.[0]?.message?.content || data?.response || "";
        setEvidence({
          content: responseText,
          analysis: "",
          recommendations: [],
          corrective_actions: [],
          normative_references: [],
          risk_level: ncType === "A" ? "critical" : ncType === "B" ? "high" : "medium",
          confidence: 90,
        });
      }

      toast.success("Evidência gerada com sucesso!");
    } catch (err) {
      logger.error(`[ComplianceEvidenceGenerator:${moduleId}]`, err);
      toast.error("Erro ao gerar evidência");
    } finally {
      setIsGenerating(false);
    }
  }, [moduleId, moduleName, elements, edgeFunctionName, selectedElement, ncType, vesselName, auditorName, itemDescription, observedCondition]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Sparkles className="h-6 w-6 text-primary" />
        <div>
          <h3 className="text-lg font-semibold">Gerador de Evidências IA - {moduleName}</h3>
          <p className="text-sm text-muted-foreground">
            Gere evidências técnicas para não conformidades e itens de checklist
          </p>
        </div>
      </div>

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados da Não Conformidade</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Elemento / Seção</Label>
              <Select value={selectedElement} onValueChange={setSelectedElement}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {elements.map(el => (
                    <SelectItem key={el.id} value={String(el.id)}>
                      {typeof el.id === "number" ? `${el.id}. ` : ""}{el.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Classificação NC</Label>
              <Select value={ncType} onValueChange={setNcType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">A - Crítica</SelectItem>
                  <SelectItem value="B">B - Maior</SelectItem>
                  <SelectItem value="C">C - Menor</SelectItem>
                  <SelectItem value="D">D - Observação</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Embarcação</Label>
              <Input value={vesselName} onChange={e => setVesselName(e.target.value)} placeholder="Nome da embarcação" />
            </div>
            <div className="space-y-2">
              <Label>Auditor</Label>
              <Input value={auditorName} onChange={e => setAuditorName(e.target.value)} placeholder="Nome do auditor" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Descrição do Item *</Label>
            <Textarea value={itemDescription} onChange={e => setItemDescription(e.target.value)} placeholder="Descreva o requisito ou item do checklist..." rows={3} />
          </div>
          <div className="space-y-2">
            <Label>Condição Observada *</Label>
            <Textarea value={observedCondition} onChange={e => setObservedCondition(e.target.value)} placeholder="Descreva a condição observada durante a auditoria/inspeção..." rows={4} />
          </div>
          <Button onClick={generateEvidence} disabled={isGenerating} className="w-full gap-2">
            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {isGenerating ? "Gerando Evidência..." : "Gerar Evidência com IA"}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Evidence */}
      {evidence && (
        <Card className="border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Evidência Gerada
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge className={
                  evidence.risk_level === "critical" ? "bg-destructive" :
                  evidence.risk_level === "high" ? "bg-warning" : "bg-success"
                }>
                  Risco: {evidence.risk_level}
                </Badge>
                <Badge variant="outline">Confiança: {evidence.confidence}%</Badge>
                <Button size="sm" variant="outline" onClick={() => copyToClipboard(evidence.content)}>
                  <Copy className="h-3 w-3 mr-1" /> Copiar
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{evidence.content}</ReactMarkdown>
              </div>
              {evidence.recommendations.length > 0 && (
                <>
                  <Separator className="my-4" />
                  <h4 className="font-semibold text-sm mb-2">Recomendações:</h4>
                  {evidence.recommendations.map((r, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm mb-1">
                      <CheckCircle className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                      <span>{r}</span>
                    </div>
                  ))}
                </>
              )}
              {evidence.corrective_actions.length > 0 && (
                <>
                  <Separator className="my-4" />
                  <h4 className="font-semibold text-sm mb-2">Ações Corretivas:</h4>
                  {evidence.corrective_actions.map((a, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm mb-1">
                      <Target className="h-3.5 w-3.5 text-warning shrink-0 mt-0.5" />
                      <span>{a}</span>
                    </div>
                  ))}
                </>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ComplianceEvidenceGenerator;
