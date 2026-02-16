import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getEdgeFunctionUrl, getEdgeFunctionHeaders } from '@/lib/supabase/edge-function-helper';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, Loader2, AlertTriangle, CheckCircle, 
  Download, Copy, RefreshCw, Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

interface EvidenceData {
  itemReference: string;
  observation: string;
  regulatoryReference: string;
  riskLevel: 'high' | 'medium' | 'low';
  recommendedAction: string;
  timeline: string;
  additionalNotes: string;
}

interface PreOVIDEvidenceGeneratorProps {
  questionId: string;
  questionText: string;
  vesselType: string;
  chapterId: string;
  onEvidenceGenerated?: (evidence: EvidenceData) => void;
}

export const PreOVIDEvidenceGenerator: React.FC<PreOVIDEvidenceGeneratorProps> = ({
  questionId,
  questionText,
  vesselType,
  chapterId,
  onEvidenceGenerated,
}) => {
  const [observedCondition, setObservedCondition] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedEvidence, setGeneratedEvidence] = useState<EvidenceData | null>(null);

  const generateEvidence = async () => {
    if (!observedCondition.trim()) {
      toast.error('Descreva a condição observada');
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch(getEdgeFunctionUrl('preovid-ai-chat'), {
        method: 'POST',
        headers: getEdgeFunctionHeaders(),
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `Gere uma evidência formal de não conformidade para o item OVIQ4 ${questionId}.

Questão: ${questionText}
Tipo de embarcação: ${vesselType}
Condição observada: ${observedCondition}

Forneça a evidência no seguinte formato JSON:
{
  "itemReference": "número do item OVIQ4",
  "observation": "descrição detalhada e factual da observação",
  "regulatoryReference": "referências normativas aplicáveis (SOLAS, MARPOL, ISM, etc.)",
  "riskLevel": "high/medium/low com justificativa",
  "recommendedAction": "ações corretivas específicas",
  "timeline": "prazo recomendado para fechamento",
  "additionalNotes": "observações adicionais relevantes"
}

Responda APENAS com o JSON, sem texto adicional.`
          }],
          vesselType,
          chapterId,
          questionId,
          mode: 'evidence',
          language: 'pt',
        }),
      });

      if (!response.ok) throw new Error('Falha ao gerar evidência');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const json = JSON.parse(line.slice(6));
              const content = json.choices?.[0]?.delta?.content;
              if (content) fullContent += content;
            } catch { /* expected: partial SSE JSON chunk */ }
          }
        }
      }

      // Parse JSON from response
      const jsonMatch = fullContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const evidence = JSON.parse(jsonMatch[0]) as EvidenceData;
        setGeneratedEvidence(evidence);
        onEvidenceGenerated?.(evidence);
        toast.success('Evidência gerada com sucesso');
      } else {
        throw new Error('Formato de resposta inválido');
      }
    } catch (error) {
      logger.error("Evidence generation error", error instanceof Error ? error : new Error(String(error)));
      toast.error('Erro ao gerar evidência');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyEvidence = () => {
    if (!generatedEvidence) return;
    
    const text = `
EVIDÊNCIA DE NÃO CONFORMIDADE - OVIQ4

Item: ${generatedEvidence.itemReference}
Observação: ${generatedEvidence.observation}
Referência Regulatória: ${generatedEvidence.regulatoryReference}
Nível de Risco: ${generatedEvidence.riskLevel.toUpperCase()}
Ação Recomendada: ${generatedEvidence.recommendedAction}
Prazo: ${generatedEvidence.timeline}
Notas Adicionais: ${generatedEvidence.additionalNotes}
    `.trim();
    
    navigator.clipboard.writeText(text);
    toast.success('Evidência copiada para área de transferência');
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'high':
        return <Badge variant="destructive">Alto Risco</Badge>;
      case 'medium':
        return <Badge variant="default" className="bg-warning text-warning-foreground">Médio Risco</Badge>;
      case 'low':
        return <Badge variant="secondary">Baixo Risco</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Gerador de Evidências IA
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 rounded-lg bg-muted/50">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline">{questionId}</Badge>
            <Badge variant="secondary">{vesselType}</Badge>
          </div>
          <p className="text-sm">{questionText}</p>
        </div>

        <div className="space-y-2">
          <Label>Condição Observada</Label>
          <Textarea
            placeholder="Descreva detalhadamente a não conformidade observada..."
            value={observedCondition}
            onChange={(e) => setObservedCondition(e.target.value)}
            rows={3}
          />
        </div>

        <Button 
          onClick={generateEvidence} 
          disabled={isGenerating || !observedCondition.trim()}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Gerando Evidência...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Gerar Evidência com IA
            </>
          )}
        </Button>

        {generatedEvidence && (
          <>
            <Separator />
            <ScrollArea className="h-[300px]">
              <div className="space-y-4 pr-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    Evidência Gerada
                  </h4>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={copyEvidence}>
                      <Copy className="w-4 h-4 mr-1" />
                      Copiar
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setGeneratedEvidence(null)}>
                      <RefreshCw className="w-4 h-4 mr-1" />
                      Nova
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Item de Referência</Label>
                    <p className="text-sm font-medium">{generatedEvidence.itemReference}</p>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">Observação</Label>
                    <p className="text-sm">{generatedEvidence.observation}</p>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">Referência Regulatória</Label>
                    <p className="text-sm">{generatedEvidence.regulatoryReference}</p>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">Nível de Risco</Label>
                    <div className="mt-1">{getRiskBadge(generatedEvidence.riskLevel)}</div>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">Ação Recomendada</Label>
                    <p className="text-sm">{generatedEvidence.recommendedAction}</p>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">Prazo</Label>
                    <p className="text-sm">{generatedEvidence.timeline}</p>
                  </div>

                  {generatedEvidence.additionalNotes && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Notas Adicionais</Label>
                      <p className="text-sm">{generatedEvidence.additionalNotes}</p>
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
          </>
        )}
      </CardContent>
    </Card>
  );
};
