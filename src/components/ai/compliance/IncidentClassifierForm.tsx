/**
 * Incident Classifier Form - NLP-based incident classification
 */
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, FileText, Brain, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClassificationResult {
  category: string;
  subcategory: string;
  severity: string;
  riskScore: number;
  requiresInvestigation: boolean;
  reportingRequirements: Array<{ authority: string; deadline: string }>;
  suggestedActions: Array<{ priority: string; action: string }>;
  confidence: number;
}

interface IncidentClassifierFormProps {
  onClassify?: (incident: { title: string; description: string }) => Promise<ClassificationResult>;
  className?: string;
}

const SEVERITY_COLORS = {
  negligible: 'bg-gray-500',
  minor: 'bg-blue-500',
  moderate: 'bg-yellow-500',
  major: 'bg-orange-500',
  catastrophic: 'bg-red-500',
};

export function IncidentClassifierForm({ onClassify, className }: IncidentClassifierFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [result, setResult] = useState<ClassificationResult | null>(null);
  const [isClassifying, setIsClassifying] = useState(false);

  const handleClassify = async () => {
    if (!title.trim() || !description.trim()) return;
    
    setIsClassifying(true);
    try {
      if (onClassify) {
        const classification = await onClassify({ title, description });
        setResult(classification);
      } else {
        // Mock classification
        setResult({
          category: 'safety',
          subcategory: 'Queda',
          severity: 'moderate',
          riskScore: 12,
          requiresInvestigation: true,
          reportingRequirements: [
            { authority: 'Flag State', deadline: '24 horas' },
            { authority: 'Sociedade Classificadora', deadline: '72 horas' }
          ],
          suggestedActions: [
            { priority: 'immediate', action: 'Providenciar atendimento médico' },
            { priority: 'within_24h', action: 'Iniciar investigação formal' }
          ],
          confidence: 87
        });
      }
    } finally {
      setIsClassifying(false);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Incident Classifier
        </CardTitle>
        <CardDescription>Classificação automática por NLP</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Form */}
        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="title">Título do Incidente</Label>
            <Input
              id="title"
              placeholder="Ex: Queda de tripulante durante operação"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Descreva o incidente com detalhes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
          <Button 
            onClick={handleClassify}
            disabled={!title.trim() || !description.trim() || isClassifying}
            className="w-full"
          >
            <Brain className="h-4 w-4 mr-2" />
            {isClassifying ? 'Classificando...' : 'Classificar Incidente'}
          </Button>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-4 pt-4 border-t">
            {/* Classification */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium capitalize">{result.category}</p>
                <p className="text-xs text-muted-foreground">{result.subcategory}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={cn(SEVERITY_COLORS[result.severity as keyof typeof SEVERITY_COLORS] || 'bg-gray-500', "text-white capitalize")}>
                  {result.severity}
                </Badge>
                <Badge variant="outline">
                  Score: {result.riskScore}
                </Badge>
              </div>
            </div>

            {/* Investigation Required */}
            {result.requiresInvestigation && (
              <div className="flex items-center gap-2 p-2 bg-yellow-500/10 rounded text-sm">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <span>Investigação formal necessária</span>
              </div>
            )}

            {/* Reporting Requirements */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Requisitos de Reporte</p>
              {result.reportingRequirements.map((req, i) => (
                <div key={i} className="flex items-center justify-between text-sm p-2 bg-muted/50 rounded">
                  <span>{req.authority}</span>
                  <Badge variant="outline">{req.deadline}</Badge>
                </div>
              ))}
            </div>

            {/* Suggested Actions */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Ações Sugeridas</p>
              {result.suggestedActions.slice(0, 3).map((action, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <div>
                    <Badge variant="outline" className="text-xs mr-2">
                      {action.priority === 'immediate' ? 'Imediato' : 
                       action.priority === 'within_24h' ? '24h' : 'Routine'}
                    </Badge>
                    <span className="text-muted-foreground">{action.action}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Confidence */}
            <p className="text-xs text-muted-foreground text-center">
              Confiança da classificação: {result.confidence}%
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default IncidentClassifierForm;
