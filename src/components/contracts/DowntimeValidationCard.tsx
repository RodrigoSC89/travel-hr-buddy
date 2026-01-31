import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Shield, CheckCircle, AlertTriangle, XCircle, 
  RefreshCw, Download, FileText, Zap
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

interface ValidationResult {
  is_valid: boolean;
  confidence: number;
  reasoning: string;
  required_evidence: string[];
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
  broa_compliant: boolean;
  validation_factors: {
    technical_validity: number;
    documentation_completeness: number;
    historical_consistency: number;
    severity_proportionality: number;
  };
}

interface Props {
  downtimeId: string;
  onValidationComplete?: (result: ValidationResult) => void;
}

export function DowntimeValidationCard({ downtimeId, onValidationComplete }: Props) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [broaEvidence, setBroaEvidence] = useState<object | null>(null);

  const validate = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('validate-downtime-ai', {
        body: { downtimeId, include_historical_analysis: true }
      });

      if (error) throw error;

      if (data?.validation) {
        setResult(data.validation);
        setBroaEvidence(data.broa_evidence);
        onValidationComplete?.(data.validation);
        toast.success('Validação concluída!');
      }
    } catch (err) {
      logger.error('Validation error:', err);
      toast.error('Erro na validação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const downloadBROA = () => {
    if (!broaEvidence) return;
    const blob = new Blob([JSON.stringify(broaEvidence, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `broa-evidence-${downtimeId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getRiskBadge = (level: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      low: { variant: 'outline', label: 'Baixo' },
      medium: { variant: 'secondary', label: 'Médio' },
      high: { variant: 'destructive', label: 'Alto' },
      critical: { variant: 'destructive', label: 'Crítico' }
    };
    return variants[level] || variants.medium;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Validação de Downtime com IA</CardTitle>
              <CardDescription>Análise BROA automatizada com Gemini</CardDescription>
            </div>
          </div>
          {result && (
            <Badge variant={result.is_valid ? 'default' : 'destructive'}>
              {result.is_valid ? (
                <><CheckCircle className="h-3 w-3 mr-1" /> Válido</>
              ) : (
                <><XCircle className="h-3 w-3 mr-1" /> Requer Revisão</>
              )}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {!result ? (
          <Button onClick={validate} disabled={loading} className="w-full">
            {loading ? (
              <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Analisando...</>
            ) : (
              <><Zap className="mr-2 h-4 w-4" /> Validar com IA</>
            )}
          </Button>
        ) : (
          <>
            {/* Confidence Score */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Confiança da Análise</span>
                <span className="font-medium">{result.confidence}%</span>
              </div>
              <Progress value={result.confidence} />
            </div>

            {/* Risk Level */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Nível de Risco</span>
              <Badge variant={getRiskBadge(result.risk_level).variant}>
                {getRiskBadge(result.risk_level).label}
              </Badge>
            </div>

            <Separator />

            {/* Reasoning */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" /> Análise
              </h4>
              <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                {result.reasoning}
              </p>
            </div>

            {/* Validation Factors */}
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(result.validation_factors).map(([key, value]) => (
                <div key={key} className="space-y-1">
                  <span className="text-xs text-muted-foreground capitalize">
                    {key.replace(/_/g, ' ')}
                  </span>
                  <Progress value={value} className="h-2" />
                </div>
              ))}
            </div>

            {/* Required Evidence */}
            {result.required_evidence.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" /> Evidências Necessárias
                </h4>
                <ul className="text-sm space-y-1">
                  {result.required_evidence.map((ev, i) => (
                    <li key={i} className="flex items-start gap-2 text-muted-foreground">
                      <span className="text-amber-500">•</span> {ev}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {result.recommendations.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Recomendações</h4>
                <ul className="text-sm space-y-1">
                  {result.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2 text-muted-foreground">
                      <CheckCircle className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" /> {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={validate} disabled={loading}>
                <RefreshCw className="mr-1 h-3 w-3" /> Revalidar
              </Button>
              {broaEvidence && (
                <Button variant="secondary" size="sm" onClick={downloadBROA}>
                  <Download className="mr-1 h-3 w-3" /> Baixar BROA
                </Button>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
