/**
 * PEOTRAM Evidence Generator Component
 * AI-powered evidence generation for non-conformities
 * Focus on critical elements 4 and 6
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { logger } from '@/lib/logger';
import {
  FileCheck,
  Brain,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  Star,
  Download,
  Copy,
  RefreshCw,
  FileText,
  Target,
  Shield,
  Wrench,
  Clock,
  User
} from "lucide-react";

interface EvidenceResult {
  technical_analysis: string;
  norm_reference: string;
  risk_identified: string;
  recommendations: string;
  corrective_action: string;
  ai_confidence: number;
}

interface NonConformityInput {
  element_number: number;
  item_description: string;
  non_conformity_type: "critical" | "major" | "minor" | "observation";
  observed_condition: string;
  vessel_name?: string;
  auditor_name?: string;
}

// 13 ELEMENTOS REAIS DO PEOTRAM 2024 - PETROBRAS
const PEOTRAM_ELEMENTS = [
  { number: 1, name: "Liderança, Gerenciamento e Responsabilidade", critical: false },
  { number: 2, name: "Conformidade Legal", critical: false },
  { number: 3, name: "Avaliação e Gestão de Riscos", critical: false },
  { number: 4, name: "Informação, Documentação e Controle", critical: true },
  { number: 5, name: "Pessoal, Capacitação e Competência", critical: false },
  { number: 6, name: "Integridade Mecânica e Qualidade", critical: true },
  { number: 7, name: "Gestão de Contratadas", critical: false },
  { number: 8, name: "Gestão de Operações", critical: false },
  { number: 9, name: "Gestão de Mudanças", critical: false },
  { number: 10, name: "Tratamento de Anomalias", critical: false },
  { number: 11, name: "Preparação e Resposta a Emergências", critical: true },
  { number: 12, name: "Comunicação e Consulta", critical: true },
  { number: 13, name: "Auditoria e Melhoria Contínua", critical: false },
];

const NC_TYPES = [
  { value: "critical", label: "Crítica", color: "bg-destructive" },
  { value: "major", label: "Maior", color: "bg-warning" },
  { value: "minor", label: "Menor", color: "bg-warning" },
  { value: "observation", label: "Observação", color: "bg-primary" },
];

export function PeotramEvidenceGenerator() {
  const [input, setInput] = useState<NonConformityInput>({
    element_number: 4,
    item_description: "",
    non_conformity_type: "major",
    observed_condition: "",
    vessel_name: "",
    auditor_name: ""
  });
  const [result, setResult] = useState<EvidenceResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleInputChange = (field: keyof NonConformityInput, value: string | number) => {
    setInput(prev => ({ ...prev, [field]: value }));
  };

  const generateEvidence = async () => {
    if (!input.item_description || !input.observed_condition) {
      toast.error("Preencha a descrição do item e a condição observada");
      return;
    }

    setIsGenerating(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('peotram-generate-evidence', {
        body: {
          element_number: input.element_number,
          element_name: PEOTRAM_ELEMENTS.find(e => e.number === input.element_number)?.name,
          item_number: `${input.element_number}.1`,
          item_description: input.item_description,
          non_conformity_reason: input.observed_condition,
          nc_classification: input.non_conformity_type === 'critical' ? 'A' : 
                            input.non_conformity_type === 'major' ? 'B' : 
                            input.non_conformity_type === 'minor' ? 'C' : 'D',
          vessel_name: input.vessel_name,
          auditor_name: input.auditor_name,
          audit_date: new Date().toISOString().split('T')[0]
        }
      });

      if (error) throw error;

      setResult(data);
      toast.success("Evidência gerada com sucesso!");
    } catch (error) {
      logger.error("Error generating evidence:", error);
      toast.error("Erro ao gerar evidência");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado para área de transferência`);
  };

  const exportEvidence = () => {
    if (!result) return;

    const element = PEOTRAM_ELEMENTS.find(e => e.number === input.element_number);
    const ncType = NC_TYPES.find(t => t.value === input.non_conformity_type);

    const content = `# EVIDÊNCIA DE NÃO CONFORMIDADE PEOTRAM

## Informações Gerais
- **Elemento**: ${input.element_number} - ${element?.name}${element?.critical ? ' (CRÍTICO)' : ''}
- **Item**: ${input.item_description}
- **Tipo de NC**: ${ncType?.label}
- **Embarcação**: ${input.vessel_name || 'N/A'}
- **Auditor**: ${input.auditor_name || 'N/A'}
- **Data**: ${new Date().toLocaleDateString('pt-BR')}

## Condição Observada
${input.observed_condition}

## Análise Técnica
${result.technical_analysis}

## Referência Normativa
${result.norm_reference}

## Riscos Identificados
${result.risk_identified}

## Recomendações
${result.recommendations}

## Ação Corretiva Proposta
${result.corrective_action}

---
*Documento gerado automaticamente pelo Nautilus One - PEOTRAM AI*
*Confiança da IA: ${(result.ai_confidence * 100).toFixed(0)}%*
`;

    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `evidencia-peotram-el${input.element_number}-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Evidência exportada com sucesso!");
  };

  const selectedElement = PEOTRAM_ELEMENTS.find(e => e.number === input.element_number);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-success/20 to-success/10 rounded-lg">
            <FileCheck className="h-6 w-6 text-success" />
          </div>
          <div>
            <h3 className="font-semibold flex items-center gap-2">
              Gerador de Evidências
              <Badge variant="outline" className="text-xs">
                <Sparkles className="h-3 w-3 mr-1" /> Lovable AI
              </Badge>
            </h3>
            <p className="text-sm text-muted-foreground">
              Geração automática de análise técnica e ações corretivas
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Dados da Não Conformidade
            </CardTitle>
            <CardDescription>
              Preencha os campos para gerar evidência automatizada
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Elemento PEOTRAM</Label>
                <Select 
                  value={input.element_number.toString()} 
                  onValueChange={(v) => handleInputChange('element_number', parseInt(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PEOTRAM_ELEMENTS.map((el) => (
                      <SelectItem key={el.number} value={el.number.toString()}>
                        <div className="flex items-center gap-2">
                          <span>{el.number} - {el.name}</span>
                          {el.critical && <Star className="h-3 w-3 text-orange-500 fill-orange-500" />}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedElement?.critical && (
                  <Badge variant="destructive" className="text-xs">
                    Elemento Crítico
                  </Badge>
                )}
              </div>

              <div className="space-y-2">
                <Label>Tipo de NC</Label>
                <Select 
                  value={input.non_conformity_type} 
                  onValueChange={(v) => handleInputChange('non_conformity_type', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {NC_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${type.color}`} />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Descrição do Item Auditado</Label>
              <Input
                placeholder="Ex: Procedimento de manutenção de bombas centrífugas"
                value={input.item_description}
                onChange={(e) => handleInputChange('item_description', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Condição Observada</Label>
              <Textarea
                placeholder="Descreva detalhadamente o que foi encontrado durante a auditoria..."
                value={input.observed_condition}
                onChange={(e) => handleInputChange('observed_condition', e.target.value)}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Embarcação (opcional)</Label>
                <Input
                  placeholder="Nome da embarcação"
                  value={input.vessel_name}
                  onChange={(e) => handleInputChange('vessel_name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Auditor (opcional)</Label>
                <Input
                  placeholder="Nome do auditor"
                  value={input.auditor_name}
                  onChange={(e) => handleInputChange('auditor_name', e.target.value)}
                />
              </div>
            </div>

            <Button 
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              onClick={generateEvidence}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Gerando Evidência...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Gerar Evidência com IA
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Result Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-success" />
                Evidência Gerada
              </div>
              {result && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    Confiança: {(result.ai_confidence * 100).toFixed(0)}%
                  </Badge>
                  <Button variant="outline" size="sm" onClick={exportEvidence}>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {result ? (
              <ScrollArea className="h-[450px] pr-4">
                <div className="space-y-4">
                  {/* Technical Analysis */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2">
                        <Brain className="h-4 w-4 text-primary" />
                        Análise Técnica
                      </Label>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6"
                        onClick={() => copyToClipboard(result.technical_analysis, "Análise técnica")}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="bg-muted p-3 rounded-lg text-sm whitespace-pre-wrap">
                      {result.technical_analysis}
                    </div>
                  </div>

                  <Separator />

                  {/* Norm Reference */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-purple-500" />
                        Referência Normativa
                      </Label>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6"
                        onClick={() => copyToClipboard(result.norm_reference, "Referência normativa")}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="bg-muted p-3 rounded-lg text-sm whitespace-pre-wrap">
                      {result.norm_reference}
                    </div>
                  </div>

                  <Separator />

                  {/* Risk Identified */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                        Riscos Identificados
                      </Label>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6"
                        onClick={() => copyToClipboard(result.risk_identified, "Riscos")}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="bg-destructive/10 border border-destructive/20 p-3 rounded-lg text-sm whitespace-pre-wrap">
                      {result.risk_identified}
                    </div>
                  </div>

                  <Separator />

                  {/* Recommendations */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-warning" />
                        Recomendações
                      </Label>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6"
                        onClick={() => copyToClipboard(result.recommendations, "Recomendações")}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="bg-muted p-3 rounded-lg text-sm whitespace-pre-wrap">
                      {result.recommendations}
                    </div>
                  </div>

                  <Separator />

                  {/* Corrective Action */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-success" />
                        Ação Corretiva Proposta
                      </Label>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6"
                        onClick={() => copyToClipboard(result.corrective_action, "Ação corretiva")}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="bg-green-500/10 border border-green-500/20 p-3 rounded-lg text-sm whitespace-pre-wrap">
                      {result.corrective_action}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            ) : (
              <div className="h-[450px] flex flex-col items-center justify-center text-center text-muted-foreground">
                <FileCheck className="h-16 w-16 mb-4 opacity-20" />
                <p className="text-sm">Preencha os dados e clique em "Gerar Evidência"</p>
                <p className="text-xs mt-2">A IA analisará a não conformidade e gerará:</p>
                <div className="flex flex-wrap gap-2 mt-4 justify-center">
                  <Badge variant="secondary" className="text-xs">Análise Técnica</Badge>
                  <Badge variant="secondary" className="text-xs">Referência Normativa</Badge>
                  <Badge variant="secondary" className="text-xs">Riscos</Badge>
                  <Badge variant="secondary" className="text-xs">Ação Corretiva</Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
