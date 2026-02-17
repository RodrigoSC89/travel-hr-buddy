/**
 * PEO-DP Evidence Generator
 * Gerador de evidências com IA para não-conformidades PEO-DP Petrobras 2021
 */

import React, { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Sparkles,
  FileText,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Download,
  Copy,
  Loader2,
  Ship,
  Shield,
  Target
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { logger } from '@/lib/logger';

// Seções PEO-DP 2021
const PEODP_SECTIONS = [
  { id: "3.1", name: "Regras Gerais", code: "RG", critical: false, reqs: 7 },
  { id: "3.2", name: "Gestão", code: "GS", critical: true, reqs: 24 },
  { id: "3.3", name: "Treinamentos", code: "TR", critical: false, reqs: 9 },
  { id: "3.4", name: "Procedimentos", code: "PR", critical: false, reqs: 6 },
  { id: "3.5", name: "Operação", code: "OP", critical: true, reqs: 6 },
  { id: "3.6", name: "Manutenção", code: "MN", critical: true, reqs: 4 },
  { id: "3.7", name: "Testes Anuais", code: "TA", critical: true, reqs: 5 }
];

interface EvidenceInput {
  section: string;
  requirement_number: string;
  requirement_title: string;
  requirement_description: string;
  status: "non_compliant" | "partial";
  auditor_notes: string;
  vessel_name: string;
  dp_class: "DP1" | "DP2" | "DP3";
  company_name: string;
  auditor_name: string;
}

interface EvidenceResult {
  evidence_id: string;
  section: string;
  section_name: string;
  is_critical: boolean;
  requirement_number: string;
  title: string;
  technical_analysis: string;
  normative_reference: string;
  risk_assessment: string;
  recommendations: string;
  corrective_action_plan: string;
  full_content: string;
  generated_at: string;
}

export function PeodpEvidenceGenerator() {
  const [input, setInput] = useState<EvidenceInput>({
    section: "3.2",
    requirement_number: "",
    requirement_title: "",
    requirement_description: "",
    status: "non_compliant",
    auditor_notes: "",
    vessel_name: "",
    dp_class: "DP2",
    company_name: "",
    auditor_name: ""
  });
  
  const [result, setResult] = useState<EvidenceResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["analysis", "plan"]));

  const handleInputChange = (field: keyof EvidenceInput, value: string) => {
    setInput(prev => ({ ...prev, [field]: value }));
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const generateEvidence = useCallback(async () => {
    if (!input.requirement_number || !input.requirement_title) {
      toast.error("Preencha o número e título do requisito");
      return;
    }

    setIsGenerating(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('peodp-generate-evidence', {
        body: {
          section: input.section,
          requirement_number: input.requirement_number,
          requirement_title: input.requirement_title,
          requirement_description: input.requirement_description,
          status: input.status,
          auditor_notes: input.auditor_notes,
          vessel_name: input.vessel_name,
          dp_class: input.dp_class,
          company_name: input.company_name,
          audit_date: new Date().toISOString().split('T')[0],
          auditor_name: input.auditor_name
        }
      });

      if (error) throw error;

      setResult(data);
      toast.success("Evidência PEO-DP gerada com sucesso!");
    } catch (error) {
      logger.error("Error generating evidence:", error);
      toast.error("Erro ao gerar evidência. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  }, [input]);

  const copyToClipboard = useCallback(async () => {
    if (!result?.full_content) return;
    
    try {
      await navigator.clipboard.writeText(result.full_content);
      toast.success("Copiado para área de transferência");
    } catch {
      toast.error("Erro ao copiar");
    }
  }, [result]);

  const selectedSection = PEODP_SECTIONS.find(s => s.id === input.section);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Gerador de Evidências PEO-DP
          </CardTitle>
          <CardDescription>
            IA para análise de não-conformidades conforme PEO-DP Petrobras 2021
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Vessel Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vessel_name">Embarcação</Label>
              <Input
                id="vessel_name"
                placeholder="Nome da embarcação"
                value={input.vessel_name}
                onChange={(e) => handleInputChange("vessel_name", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dp_class">Classe DP</Label>
              <Select 
                value={input.dp_class} 
                onValueChange={(v) => handleInputChange("dp_class", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DP1">DP1</SelectItem>
                  <SelectItem value="DP2">DP2</SelectItem>
                  <SelectItem value="DP3">DP3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company_name">Empresa Contratada</Label>
              <Input
                id="company_name"
                placeholder="Nome da empresa"
                value={input.company_name}
                onChange={(e) => handleInputChange("company_name", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="auditor_name">Auditor</Label>
              <Input
                id="auditor_name"
                placeholder="Nome do auditor"
                value={input.auditor_name}
                onChange={(e) => handleInputChange("auditor_name", e.target.value)}
              />
            </div>
          </div>

          <Separator />

          {/* Section Selection */}
          <div className="space-y-2">
            <Label htmlFor="section">Seção PEO-DP</Label>
            <Select 
              value={input.section} 
              onValueChange={(v) => handleInputChange("section", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PEODP_SECTIONS.map(section => (
                  <SelectItem key={section.id} value={section.id}>
                    <div className="flex items-center gap-2">
                      <span>{section.id} - {section.name}</span>
                      {section.critical && (
                        <Badge variant="destructive" className="text-[10px] px-1">CRÍTICA</Badge>
                      )}
                      <Badge variant="outline" className="text-[10px]">{section.reqs} req.</Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedSection?.critical && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Seção crítica - maior peso na auditoria
              </p>
            )}
          </div>

          {/* Requirement Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="requirement_number">Número do Requisito</Label>
              <Input
                id="requirement_number"
                placeholder="Ex: 3.2.14"
                value={input.requirement_number}
                onChange={(e) => handleInputChange("requirement_number", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={input.status} 
                onValueChange={(v) => handleInputChange("status", v as "non_compliant" | "partial" | "compliant" | "not_verified")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="non_compliant">Não Conforme</SelectItem>
                  <SelectItem value="partial">Parcial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="requirement_title">Título do Requisito</Label>
            <Input
              id="requirement_title"
              placeholder="Ex: Análise Crítica Mensal"
              value={input.requirement_title}
              onChange={(e) => handleInputChange("requirement_title", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="requirement_description">Descrição do Requisito</Label>
            <Textarea
              id="requirement_description"
              placeholder="Descrição completa do requisito conforme PEO-DP..."
              value={input.requirement_description}
              onChange={(e) => handleInputChange("requirement_description", e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="auditor_notes">Observações do Auditor (Motivo da NC)</Label>
            <Textarea
              id="auditor_notes"
              placeholder="Descreva o que foi encontrado e por que caracteriza não-conformidade..."
              value={input.auditor_notes}
              onChange={(e) => handleInputChange("auditor_notes", e.target.value)}
              rows={3}
            />
          </div>

          <Button 
            onClick={generateEvidence} 
            disabled={isGenerating}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Gerando Evidência com IA...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Gerar Evidência com IA
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Result Display */}
      <Card className={result ? "border-primary" : ""}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Evidência Gerada
          </CardTitle>
          {result && (
            <CardDescription className="flex items-center gap-2">
              <Badge variant={result.is_critical ? "destructive" : "secondary"}>
                Seção {result.section} - {result.section_name}
              </Badge>
              <Badge variant="outline">{result.evidence_id}</Badge>
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {!result ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <Shield className="h-12 w-12 mb-4 opacity-50" />
              <p>Preencha os dados e clique em "Gerar Evidência"</p>
              <p className="text-sm">A IA analisará a não-conformidade e gerará o parecer técnico</p>
            </div>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="space-y-4">
                {/* Header Info */}
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <Ship className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">{input.vessel_name || "Embarcação"}</p>
                      <p className="text-xs text-muted-foreground">
                        Classe {input.dp_class} • Req. {result.requirement_number}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={copyToClipboard}>
                      <Copy className="h-3 w-3 mr-1" />
                      Copiar
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="h-3 w-3 mr-1" />
                      PDF
                    </Button>
                  </div>
                </div>

                {/* Title */}
                {result.title && (
                  <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                      <span className="font-medium text-destructive">Não-Conformidade Identificada</span>
                    </div>
                    <p className="text-sm">{result.title}</p>
                  </div>
                )}

                {/* Technical Analysis */}
                <Collapsible 
                  open={expandedSections.has("analysis")}
                  onOpenChange={() => toggleSection("analysis")}
                >
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted/50 rounded-lg hover:bg-muted">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      <span className="font-medium">Análise Técnica</span>
                    </div>
                    <ChevronDown className={`h-4 w-4 transition-transform ${expandedSections.has("analysis") ? "rotate-180" : ""}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="p-3">
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown>{result.technical_analysis || result.full_content}</ReactMarkdown>
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Risk Assessment */}
                {result.risk_assessment && (
                  <Collapsible 
                    open={expandedSections.has("risk")}
                    onOpenChange={() => toggleSection("risk")}
                  >
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-warning/10 rounded-lg hover:bg-warning/20">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-warning" />
                        <span className="font-medium">Risco Identificado</span>
                      </div>
                      <ChevronDown className={`h-4 w-4 transition-transform ${expandedSections.has("risk") ? "rotate-180" : ""}`} />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="p-3">
                      <div className="prose prose-sm max-w-none">
                        <ReactMarkdown>{result.risk_assessment}</ReactMarkdown>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {/* Corrective Action Plan */}
                <Collapsible 
                  open={expandedSections.has("plan")}
                  onOpenChange={() => toggleSection("plan")}
                >
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-success/10 rounded-lg hover:bg-success/20">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-success" />
                      <span className="font-medium">Plano de Ação Corretiva</span>
                    </div>
                    <ChevronDown className={`h-4 w-4 transition-transform ${expandedSections.has("plan") ? "rotate-180" : ""}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="p-3">
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown>{result.corrective_action_plan || result.recommendations}</ReactMarkdown>
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Footer */}
                <div className="text-xs text-muted-foreground text-center pt-4 border-t">
                  <p>Gerado por IA em {new Date(result.generated_at).toLocaleString('pt-BR')}</p>
                  <p>PEO-DP Petrobras 2021 • {result.evidence_id}</p>
                </div>
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
