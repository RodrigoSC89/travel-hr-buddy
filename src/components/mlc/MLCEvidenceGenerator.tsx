/**
 * MLC Evidence Generator Component
 * AI-powered evidence generation for MLC non-conformities
 * Based on PEOTRAM evidence generator pattern
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
  Scale,
  Globe,
  FileDown
} from "lucide-react";
import { MLC_2022_TITLES, getItemById } from "@/data/mlc-2022-checklist";
import { logger } from '@/lib/logger';

interface EvidenceResult {
  technical_analysis: string;
  legal_reference: string;
  mlc_standard: string;
  risk_assessment: string;
  recommendations: string;
  corrective_action: string;
  responsible_party: string;
  deadline_suggestion: string;
  ai_confidence: number;
}

interface NCInput {
  title_number: number;
  regulation_code: string;
  item_id: string;
  nc_type: "deficiency" | "ground_for_detention" | "observation";
  observed_condition: string;
  vessel_name?: string;
  inspector_name?: string;
  port?: string;
}

const NC_TYPES = [
  { value: "ground_for_detention", label: "Ground for Detention", color: "bg-destructive", description: "Condição séria que justifica detenção" },
  { value: "deficiency", label: "Deficiency", color: "bg-warning", description: "Não conformidade identificada" },
  { value: "observation", label: "Observation", color: "bg-warning/60", description: "Observação para melhoria" },
];

export function MLCEvidenceGenerator() {
  const [input, setInput] = useState<NCInput>({
    title_number: 1,
    regulation_code: "1.1",
    item_id: "1.1.1",
    nc_type: "deficiency",
    observed_condition: "",
    vessel_name: "",
    inspector_name: "",
    port: ""
  });
  const [result, setResult] = useState<EvidenceResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleInputChange = (field: keyof NCInput, value: NCInput[keyof NCInput]) => {
    setInput(prev => ({ ...prev, [field]: value }));
  };

  // Get available regulations for selected title
  const selectedTitle = MLC_2022_TITLES.find(t => t.number === input.title_number);
  const regulations = selectedTitle?.regulations || [];
  
  // Get items for selected regulation
  const selectedReg = regulations.find(r => r.code === input.regulation_code);
  const items = selectedReg?.items || [];

  const generateEvidence = async () => {
    if (!input.observed_condition) {
      toast.error("Descreva a condição observada");
      return;
    }

    setIsGenerating(true);
    setResult(null);

    try {
      const selectedItem = getItemById(input.item_id);
      
      const { data, error } = await supabase.functions.invoke('mlc-generate-evidence', {
        body: {
          title_number: input.title_number,
          title_name: selectedTitle?.title,
          regulation_code: input.regulation_code,
          regulation_name: selectedReg?.title,
          item_id: input.item_id,
          item_title: selectedItem?.title,
          item_description: selectedItem?.description,
          legal_basis: selectedItem?.legalBasis,
          standard: selectedItem?.standard,
          nc_type: input.nc_type,
          observed_condition: input.observed_condition,
          vessel_name: input.vessel_name,
          inspector_name: input.inspector_name,
          port: input.port,
          inspection_date: new Date().toISOString().split('T')[0]
        }
      });

      if (error) throw error;

      setResult(data);
      toast.success("Evidência gerada com sucesso!");
    } catch (error) {
      logger.error("Error generating evidence:", error);
      
      // Fallback with mock data if edge function not available
      setResult({
        technical_analysis: `Análise da não conformidade identificada no item ${input.item_id} da MLC 2006. A condição observada indica desvio dos requisitos estabelecidos na convenção, conforme descrito: "${input.observed_condition}". Esta situação requer atenção imediata para garantir conformidade com os padrões internacionais de trabalho marítimo.`,
        legal_reference: `Maritime Labour Convention 2006, ${selectedItem?.regulation || 'Regulation'}, ${selectedItem?.standard || 'Standard'} - ${selectedItem?.legalBasis || 'Base legal aplicável'}`,
        mlc_standard: selectedItem?.guidance || 'Orientação conforme MLC 2006',
        risk_assessment: `Risco de não conformidade em inspeção PSC. ${input.nc_type === 'ground_for_detention' ? 'ALTO RISCO: Pode resultar em detenção do navio.' : input.nc_type === 'deficiency' ? 'MÉDIO RISCO: Deficiência deve ser corrigida no prazo.' : 'BAIXO RISCO: Observação para melhoria contínua.'}`,
        recommendations: `1. Investigar causa raiz da não conformidade\n2. Implementar ação corretiva imediata\n3. Documentar todas as evidências de correção\n4. Atualizar procedimentos se necessário\n5. Treinar tripulação envolvida`,
        corrective_action: `Ação corretiva proposta: Corrigir a condição identificada em conformidade com o ${selectedItem?.standard || 'standard aplicável'} da MLC 2006. Documentar a correção com evidências fotográficas e registros escritos.`,
        responsible_party: "Armador / Operador do Navio",
        deadline_suggestion: input.nc_type === 'ground_for_detention' ? 'Imediato (antes de zarpar)' : input.nc_type === 'deficiency' ? '14 dias' : '30 dias',
        ai_confidence: 0.85
      });
      toast.info("Evidência gerada localmente (modo offline)");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado!`);
  };

  const exportEvidence = (format: 'md' | 'docx') => {
    if (!result) return;

    const selectedItem = getItemById(input.item_id);
    const ncType = NC_TYPES.find(t => t.value === input.nc_type);

    const content = `# RELATÓRIO DE NÃO CONFORMIDADE MLC 2006

## Informações da Inspeção
- **Embarcação**: ${input.vessel_name || 'N/A'}
- **Porto**: ${input.port || 'N/A'}
- **Inspetor**: ${input.inspector_name || 'N/A'}
- **Data**: ${new Date().toLocaleDateString('pt-BR')}

## Identificação da Não Conformidade
- **Título MLC**: ${input.title_number} - ${selectedTitle?.title}
- **Regulamento**: ${input.regulation_code} - ${selectedReg?.title}
- **Item**: ${input.item_id} - ${selectedItem?.title}
- **Classificação**: ${ncType?.label}

## Condição Observada
${input.observed_condition}

## Análise Técnica
${result.technical_analysis}

## Referência Legal
${result.legal_reference}

## Standard MLC Aplicável
${result.mlc_standard}

## Avaliação de Risco
${result.risk_assessment}

## Recomendações
${result.recommendations}

## Ação Corretiva Proposta
${result.corrective_action}

## Responsável
${result.responsible_party}

## Prazo Sugerido
${result.deadline_suggestion}

---
*Documento gerado automaticamente pelo Nautilus One - MLC Inspection AI*
*Confiança da IA: ${(result.ai_confidence * 100).toFixed(0)}%*
`;

    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mlc-nc-${input.item_id}-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Relatório exportado!");
  };

  const selectedItem = getItemById(input.item_id);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg">
            <FileCheck className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <h3 className="font-semibold flex items-center gap-2">
              Gerador de Evidências MLC
              <Badge variant="outline" className="text-xs">
                <Sparkles className="h-3 w-3 mr-1" /> Lovable AI
              </Badge>
            </h3>
            <p className="text-sm text-muted-foreground">
              Análise técnica e ações corretivas baseadas na MLC 2006
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
                <Label>Título MLC</Label>
                <Select 
                  value={input.title_number.toString()} 
                  onValueChange={(v) => {
                    const num = parseInt(v);
                    handleInputChange('title_number', num);
                    const newTitle = MLC_2022_TITLES.find(t => t.number === num);
                    if (newTitle?.regulations[0]) {
                      handleInputChange('regulation_code', newTitle.regulations[0].code);
                      if (newTitle.regulations[0].items[0]) {
                        handleInputChange('item_id', newTitle.regulations[0].items[0].id);
                      }
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MLC_2022_TITLES.map((title) => (
                      <SelectItem key={title.number} value={title.number.toString()}>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">T{title.number}</Badge>
                          <span className="text-sm truncate max-w-[200px]">{title.title}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Regulamento</Label>
                <Select 
                  value={input.regulation_code} 
                  onValueChange={(v) => {
                    handleInputChange('regulation_code', v);
                    const reg = regulations.find(r => r.code === v);
                    if (reg?.items[0]) {
                      handleInputChange('item_id', reg.items[0].id);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {regulations.map((reg) => (
                      <SelectItem key={reg.code} value={reg.code}>
                        <span>{reg.code} - {reg.title}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Item do Checklist</Label>
                <Select 
                  value={input.item_id} 
                  onValueChange={(v) => handleInputChange('item_id', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {items.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        <div className="flex items-center gap-2">
                          <span>{item.id}</span>
                          {item.critical && <Star className="h-3 w-3 text-orange-500 fill-orange-500" />}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedItem?.critical && (
                  <Badge variant="destructive" className="text-xs">Item Crítico</Badge>
                )}
              </div>

              <div className="space-y-2">
                <Label>Classificação</Label>
                <Select 
                  value={input.nc_type} 
                  onValueChange={(v) => handleInputChange('nc_type', v)}
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

            {selectedItem && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium">{selectedItem.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{selectedItem.description}</p>
                <p className="text-xs text-blue-600 mt-1">{selectedItem.legalBasis}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label>Condição Observada</Label>
              <Textarea
                placeholder="Descreva detalhadamente o que foi encontrado durante a inspeção..."
                value={input.observed_condition}
                onChange={(e) => handleInputChange('observed_condition', e.target.value)}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Embarcação</Label>
                <Input
                  placeholder="Nome do navio"
                  value={input.vessel_name}
                  onChange={(e) => handleInputChange('vessel_name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Porto</Label>
                <Input
                  placeholder="Porto de inspeção"
                  value={input.port}
                  onChange={(e) => handleInputChange('port', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Inspetor</Label>
                <Input
                  placeholder="Nome do inspetor"
                  value={input.inspector_name}
                  onChange={(e) => handleInputChange('inspector_name', e.target.value)}
                />
              </div>
            </div>

            <Button 
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
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
                <FileText className="h-5 w-5 text-blue-500" />
                Evidência Gerada
              </div>
              {result && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {(result.ai_confidence * 100).toFixed(0)}%
                  </Badge>
                  <Button variant="outline" size="sm" onClick={() => exportEvidence('md')}>
                    <FileDown className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {result ? (
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-4">
                  {/* Technical Analysis */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2">
                        <Brain className="h-4 w-4 text-blue-500" />
                        Análise Técnica
                      </Label>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6"
                        onClick={() => copyToClipboard(result.technical_analysis, "Análise")}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="bg-muted p-3 rounded-lg text-sm whitespace-pre-wrap">
                      {result.technical_analysis}
                    </div>
                  </div>

                  <Separator />

                  {/* Legal Reference */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2">
                        <Scale className="h-4 w-4 text-purple-500" />
                        Referência Legal
                      </Label>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6"
                        onClick={() => copyToClipboard(result.legal_reference, "Referência")}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="bg-purple-500/10 border border-purple-500/20 p-3 rounded-lg text-sm">
                      {result.legal_reference}
                    </div>
                  </div>

                  <Separator />

                  {/* MLC Standard */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-cyan-500" />
                      Standard MLC
                    </Label>
                    <div className="bg-muted p-3 rounded-lg text-sm">
                      {result.mlc_standard}
                    </div>
                  </div>

                  <Separator />

                  {/* Risk Assessment */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      Avaliação de Risco
                    </Label>
                    <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-sm">
                      {result.risk_assessment}
                    </div>
                  </div>

                  <Separator />

                  {/* Recommendations */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-yellow-500" />
                      Recomendações
                    </Label>
                    <div className="bg-muted p-3 rounded-lg text-sm whitespace-pre-wrap">
                      {result.recommendations}
                    </div>
                  </div>

                  <Separator />

                  {/* Corrective Action */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Ação Corretiva
                    </Label>
                    <div className="bg-green-500/10 border border-green-500/20 p-3 rounded-lg text-sm">
                      {result.corrective_action}
                    </div>
                  </div>

                  {/* Responsibility & Deadline */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground">Responsável</p>
                      <p className="text-sm font-medium">{result.responsible_party}</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground">Prazo</p>
                      <p className="text-sm font-medium">{result.deadline_suggestion}</p>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            ) : (
              <div className="h-[500px] flex flex-col items-center justify-center text-muted-foreground">
                <Shield className="h-16 w-16 mb-4 opacity-20" />
                <p className="text-center">
                  Preencha os dados da não conformidade e clique em<br />
                  "Gerar Evidência com IA" para obter análise completa
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default MLCEvidenceGenerator;
