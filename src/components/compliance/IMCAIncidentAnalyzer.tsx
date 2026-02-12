/**
 * IMCAIncidentAnalyzer - AI-powered incident comparison with IMCA bulletins
 * Provides preventive recommendations based on industry lessons learned
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logger } from "@/lib/utils/production-logger";
import { 
  Brain, AlertTriangle, FileText, Shield, CheckCircle2,
  RefreshCw, BookOpen, Users, Wrench, Target
} from "lucide-react";

const IMCA_CATEGORIES = [
  "Diving Operations",
  "Marine Operations",
  "Lifting & Mechanical Handling",
  "Personal Safety",
  "Well Control",
  "Subsea Operations",
  "DP Operations",
  "Environmental",
  "Fire & Explosion",
  "Structural Integrity"
];

const SEVERITY_LEVELS = [
  { value: "minor", label: "Menor" },
  { value: "moderate", label: "Moderado" },
  { value: "major", label: "Maior" },
  { value: "critical", label: "Crítico" }
];

interface IncidentForm {
  vessel_name: string;
  incident_date: string;
  category: string;
  severity: string;
  description: string;
  equipment_involved: string;
  injuries: number;
  environmental_impact: boolean;
}

interface AnalysisResult {
  similar_incidents: Array<{
    bulletin_id: string;
    title: string;
    similarity_score: number;
    matching_factors: string[];
    key_lessons: string[];
  }>;
  preventive_actions: string[];
  root_cause_analysis: string;
  risk_assessment: {
    current_level: string;
    potential_escalation: string;
    mitigation_priority: string;
  };
  compliance_gaps: string[];
  training_recommendations: string[];
}

export function IMCAIncidentAnalyzer() {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [incident, setIncident] = useState<IncidentForm>({
    vessel_name: '',
    incident_date: new Date().toISOString().split('T')[0],
    category: '',
    severity: 'moderate',
    description: '',
    equipment_involved: '',
    injuries: 0,
    environmental_impact: false
  });

  const handleAnalyze = async () => {
    if (!incident.description || !incident.category) {
      toast.error('Preencha a descrição e categoria do incidente');
      return;
    }

    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('imca-incident-analyzer', {
        body: { 
          incident: {
            ...incident,
            id: `INC-${Date.now()}`
          },
          action: 'analyze'
        }
      });

      if (error) throw error;
      
      setResult(data.analysis);
      toast.success('Análise IMCA concluída');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      logger.error('Analysis error:', { error: errorMessage });
      if (errorMessage.includes('429')) {
        toast.error('Limite de requisições. Aguarde alguns minutos.');
      } else {
        toast.error('Erro na análise de incidente');
      }
    } finally {
      setAnalyzing(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-success text-success-foreground';
      case 'medium': return 'bg-warning text-warning-foreground';
      case 'high': return 'bg-warning text-warning-foreground';
      case 'critical': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'immediate': return 'Imediato';
      case 'short_term': return 'Curto Prazo';
      case 'medium_term': return 'Médio Prazo';
      case 'long_term': return 'Longo Prazo';
      default: return priority;
    }
  };

  return (
    <div className="space-y-6">
      {/* Incident Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Registro de Incidente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Embarcação</Label>
              <Input
                placeholder="Nome da embarcação"
                value={incident.vessel_name}
                onChange={e => setIncident(prev => ({ ...prev, vessel_name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Data do Incidente</Label>
              <Input
                type="date"
                value={incident.incident_date}
                onChange={e => setIncident(prev => ({ ...prev, incident_date: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Categoria IMCA</Label>
              <Select 
                value={incident.category}
                onValueChange={v => setIncident(prev => ({ ...prev, category: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {IMCA_CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Severidade</Label>
              <Select 
                value={incident.severity}
                onValueChange={v => setIncident(prev => ({ ...prev, severity: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SEVERITY_LEVELS.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Equipamento Envolvido</Label>
              <Input
                placeholder="Ex: Guindaste principal"
                value={incident.equipment_involved}
                onChange={e => setIncident(prev => ({ ...prev, equipment_involved: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Lesões</Label>
              <Input
                type="number"
                min="0"
                value={incident.injuries}
                onChange={e => setIncident(prev => ({ ...prev, injuries: parseInt(e.target.value) || 0 }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Descrição do Incidente *</Label>
            <Textarea
              placeholder="Descreva o incidente em detalhes..."
              rows={4}
              value={incident.description}
              onChange={e => setIncident(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <Button 
            className="w-full" 
            onClick={handleAnalyze}
            disabled={analyzing}
          >
            {analyzing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Analisando com IA...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Analisar Incidente (IMCA)
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-info" />
              Resultado da Análise IMCA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="similar" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="similar">Similares</TabsTrigger>
                <TabsTrigger value="analysis">Análise</TabsTrigger>
                <TabsTrigger value="actions">Ações</TabsTrigger>
                <TabsTrigger value="training">Treinamento</TabsTrigger>
              </TabsList>

              <TabsContent value="similar" className="space-y-4">
                {/* Risk Assessment Summary */}
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      <span>Risco:</span>
                      <Badge className={getRiskColor(result.risk_assessment.current_level)}>
                        {result.risk_assessment.current_level.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      <span>Prioridade:</span>
                      <Badge variant="outline">
                        {getPriorityLabel(result.risk_assessment.mitigation_priority)}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{result.similar_incidents.length}</p>
                    <p className="text-xs text-muted-foreground">Incidentes Similares</p>
                  </div>
                </div>

                {/* Similar Incidents */}
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {result.similar_incidents.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
                        <p>Nenhum incidente similar encontrado na base IMCA</p>
                      </div>
                    ) : (
                      result.similar_incidents.map((incident) => (
                        <div key={incident.bulletin_id} className="p-4 border rounded-lg space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <Badge variant="outline" className="mb-1">{incident.bulletin_id}</Badge>
                              <p className="font-medium">{incident.title}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-info">{incident.similarity_score}%</p>
                              <p className="text-xs text-muted-foreground">Similaridade</p>
                            </div>
                          </div>
                          
                          <Progress value={incident.similarity_score} className="h-2" />
                          
                          {incident.matching_factors.length > 0 && (
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Fatores em Comum:</p>
                              <div className="flex flex-wrap gap-1">
                                {incident.matching_factors.map((f, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs">{f}</Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {incident.key_lessons.length > 0 && (
                            <div className="p-2 bg-muted/50 rounded text-sm">
                              <p className="font-medium text-xs mb-1">Lições Chave:</p>
                              <ul className="space-y-1">
                                {incident.key_lessons.slice(0, 3).map((lesson, i) => (
                                  <li key={i} className="text-muted-foreground">• {lesson}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="analysis" className="space-y-4">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="font-medium mb-2 flex items-center gap-2">
                    <Brain className="h-4 w-4 text-info" />
                    Análise de Causa Raiz (Tripod Beta)
                  </p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {result.root_cause_analysis || 'Análise não disponível'}
                  </p>
                </div>

                {result.risk_assessment.potential_escalation && (
                  <div className="p-4 border border-warning/50 bg-warning/10 rounded-lg">
                    <p className="font-medium text-warning flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Potencial de Escalação
                    </p>
                    <p className="text-sm mt-2">{result.risk_assessment.potential_escalation}</p>
                  </div>
                )}

                {result.compliance_gaps.length > 0 && (
                  <div className="p-4 border rounded-lg">
                    <p className="font-medium mb-2 flex items-center gap-2">
                      <Shield className="h-4 w-4 text-destructive" />
                      Gaps de Compliance
                    </p>
                    <ul className="space-y-1">
                      {result.compliance_gaps.map((gap) => (
                        <li key={gap} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-destructive">•</span>
                          {gap}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="actions" className="space-y-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Ações preventivas recomendadas baseadas na análise IMCA:
                </p>
                
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {result.preventive_actions.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        Nenhuma ação preventiva específica identificada
                      </p>
                    ) : (
                      result.preventive_actions.map((action, actionIdx) => (
                        <div key={action} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-center justify-center h-6 w-6 rounded-full bg-info text-info-foreground text-sm font-medium">
                            {actionIdx + 1}
                          </div>
                          <p className="text-sm flex-1">{action}</p>
                          <CheckCircle2 className="h-5 w-5 text-muted-foreground hover:text-success cursor-pointer" />
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="training" className="space-y-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Treinamentos recomendados para prevenir incidentes similares:
                </p>

                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {result.training_recommendations.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        Nenhum treinamento específico identificado
                      </p>
                    ) : (
                      result.training_recommendations.map((training) => (
                        <div key={training} className="p-4 border rounded-lg flex items-start gap-3">
                          <Users className="h-5 w-5 text-info mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm">{training}</p>
                          </div>
                          <Button variant="outline" size="sm">
                            Agendar
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default IMCAIncidentAnalyzer;
