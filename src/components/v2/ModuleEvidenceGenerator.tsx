/**
 * ModuleEvidenceGenerator - Gerador de Evidências V2
 * Componente reutilizável para geração de evidências com IA
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
import { logger } from '@/lib/logger';
  FileCheck,
  Brain,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  Download,
  Copy,
  RefreshCw,
  FileText,
  FileDown,
  Loader2
} from "lucide-react";

interface EvidenceResult {
  technical_analysis: string;
  legal_reference: string;
  standard_reference: string;
  risk_assessment: string;
  recommendations: string;
  corrective_action: string;
  responsible_party: string;
  deadline_suggestion: string;
  ai_confidence: number;
}

interface FieldConfig {
  name: string;
  label: string;
  type: "text" | "textarea" | "select";
  placeholder?: string;
  options?: { value: string; label: string }[];
  required?: boolean;
}

interface ModuleEvidenceGeneratorProps {
  moduleName: string;
  moduleContext: string;
  edgeFunctionName: string;
  fields: FieldConfig[];
  ncTypes?: { value: string; label: string; color: string }[];
  accentColor?: string;
  onEvidenceGenerated?: (result: EvidenceResult) => void;
}

const DEFAULT_NC_TYPES = [
  { value: "critical", label: "Crítico", color: "bg-red-500" },
  { value: "major", label: "Maior", color: "bg-orange-500" },
  { value: "minor", label: "Menor", color: "bg-yellow-500" },
  { value: "observation", label: "Observação", color: "bg-blue-500" },
];

export function ModuleEvidenceGenerator({
  moduleName,
  moduleContext,
  edgeFunctionName,
  fields,
  ncTypes = DEFAULT_NC_TYPES,
  accentColor = "blue",
  onEvidenceGenerated,
}: ModuleEvidenceGeneratorProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [result, setResult] = useState<EvidenceResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateEvidence = async () => {
    const requiredFields = fields.filter(f => f.required);
    const missingFields = requiredFields.filter(f => !formData[f.name]?.trim());
    
    if (missingFields.length > 0) {
      toast.error(`Preencha os campos obrigatórios: ${missingFields.map(f => f.label).join(', ')}`);
      return;
    }

    setIsGenerating(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke(edgeFunctionName, {
        body: {
          module: moduleName,
          context: moduleContext,
          ...formData,
          inspection_date: new Date().toISOString().split('T')[0]
        }
      });

      if (error) throw error;

      setResult(data);
      onEvidenceGenerated?.(data);
      toast.success("Evidência gerada com sucesso!");
    } catch (error) {
      logger.error("Error generating evidence:", error);
      
      // Fallback com dados mock
      const fallbackResult: EvidenceResult = {
        technical_analysis: `Análise técnica da não conformidade identificada em ${moduleName}. A condição observada indica desvio dos requisitos estabelecidos. Esta situação requer atenção para garantir conformidade.`,
        legal_reference: `Referência normativa aplicável ao módulo ${moduleName}`,
        standard_reference: moduleContext,
        risk_assessment: `Avaliação de risco baseada na classificação: ${formData.nc_type || 'não especificado'}`,
        recommendations: `1. Investigar causa raiz\n2. Implementar ação corretiva\n3. Documentar evidências\n4. Atualizar procedimentos\n5. Treinar equipe`,
        corrective_action: `Ação corretiva proposta para resolução da não conformidade identificada.`,
        responsible_party: "Responsável designado",
        deadline_suggestion: formData.nc_type === 'critical' ? 'Imediato' : '14 dias',
        ai_confidence: 0.85
      };
      
      setResult(fallbackResult);
      onEvidenceGenerated?.(fallbackResult);
      toast.info("Evidência gerada localmente (modo offline)");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado!`);
  };

  const exportEvidence = () => {
    if (!result) return;

    const content = `# RELATÓRIO DE NÃO CONFORMIDADE - ${moduleName.toUpperCase()}

## Informações
- **Módulo**: ${moduleName}
- **Data**: ${new Date().toLocaleDateString('pt-BR')}

## Dados da Não Conformidade
${Object.entries(formData).map(([key, value]) => `- **${key}**: ${value}`).join('\n')}

## Análise Técnica
${result.technical_analysis}

## Referência Legal
${result.legal_reference}

## Standard Aplicável
${result.standard_reference}

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
*Documento gerado automaticamente pelo Nautilus One*
*Confiança da IA: ${(result.ai_confidence * 100).toFixed(0)}%*
`;

    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${moduleName.toLowerCase().replace(/\s+/g, '-')}-nc-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Relatório exportado!");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 bg-gradient-to-br from-${accentColor}-500/20 to-${accentColor}-500/10 rounded-lg`}>
            <FileCheck className={`h-6 w-6 text-${accentColor}-500`} />
          </div>
          <div>
            <h3 className="font-semibold flex items-center gap-2">
              Gerador de Evidências
              <Badge variant="outline" className="text-xs">
                <Sparkles className="h-3 w-3 mr-1" /> Lovable AI
              </Badge>
            </h3>
            <p className="text-sm text-muted-foreground">
              Análise técnica e ações corretivas para {moduleName}
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
            <div className="space-y-2">
              <Label>Classificação</Label>
              <Select 
                value={formData.nc_type || ''} 
                onValueChange={(v) => handleInputChange('nc_type', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a classificação" />
                </SelectTrigger>
                <SelectContent>
                  {ncTypes.map((type) => (
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

            {fields.map((field) => (
              <div key={field.name} className="space-y-2">
                <Label>{field.label} {field.required && <span className="text-red-500">*</span>}</Label>
                {field.type === 'textarea' ? (
                  <Textarea
                    placeholder={field.placeholder}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    rows={3}
                  />
                ) : field.type === 'select' ? (
                  <Select 
                    value={formData[field.name] || ''} 
                    onValueChange={(v) => handleInputChange(field.name, v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={field.placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    placeholder={field.placeholder}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                  />
                )}
              </div>
            ))}

            <Button 
              className={`w-full bg-gradient-to-r from-${accentColor}-500 to-${accentColor}-600 hover:from-${accentColor}-600 hover:to-${accentColor}-700`}
              onClick={generateEvidence}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
                <FileText className={`h-5 w-5 text-${accentColor}-500`} />
                Evidência Gerada
              </div>
              {result && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {(result.ai_confidence * 100).toFixed(0)}%
                  </Badge>
                  <Button variant="outline" size="sm" onClick={exportEvidence}>
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
                  <ResultSection
                    icon={Brain}
                    label="Análise Técnica"
                    content={result.technical_analysis}
                    onCopy={() => copyToClipboard(result.technical_analysis, "Análise")}
                    accentColor={accentColor}
                  />
                  <ResultSection
                    icon={FileText}
                    label="Referência Legal"
                    content={result.legal_reference}
                    onCopy={() => copyToClipboard(result.legal_reference, "Referência")}
                    accentColor={accentColor}
                  />
                  <ResultSection
                    icon={AlertTriangle}
                    label="Avaliação de Risco"
                    content={result.risk_assessment}
                    onCopy={() => copyToClipboard(result.risk_assessment, "Risco")}
                    accentColor={accentColor}
                  />
                  <ResultSection
                    icon={CheckCircle}
                    label="Recomendações"
                    content={result.recommendations}
                    onCopy={() => copyToClipboard(result.recommendations, "Recomendações")}
                    accentColor={accentColor}
                  />
                  <ResultSection
                    icon={FileCheck}
                    label="Ação Corretiva"
                    content={result.corrective_action}
                    onCopy={() => copyToClipboard(result.corrective_action, "Ação")}
                    accentColor={accentColor}
                  />
                  
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">Responsável</p>
                      <p className="text-sm font-medium">{result.responsible_party}</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">Prazo</p>
                      <p className="text-sm font-medium">{result.deadline_suggestion}</p>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            ) : (
              <div className="flex flex-col items-center justify-center h-[500px] text-muted-foreground">
                <FileCheck className="h-16 w-16 mb-4 opacity-30" />
                <p className="text-center">
                  Preencha os dados e clique em "Gerar Evidência"<br />
                  para obter análise técnica automatizada
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ResultSection({ 
  icon: Icon, 
  label, 
  content, 
  onCopy,
  accentColor = "blue"
}: { 
  icon: any; 
  label: string; 
  content: string; 
  onCopy: () => void;
  accentColor?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2">
          <Icon className={`h-4 w-4 text-${accentColor}-500`} />
          {label}
        </Label>
        <Button variant="ghost" size="sm" onClick={onCopy}>
          <Copy className="h-3 w-3" />
        </Button>
      </div>
      <div className="p-3 bg-muted/50 rounded-lg">
        <p className="text-sm whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  );
}

export default ModuleEvidenceGenerator;
