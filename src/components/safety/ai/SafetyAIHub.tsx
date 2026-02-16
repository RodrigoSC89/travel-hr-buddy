/**
 * Safety & ESG AI Hub - Suite Disruptiva IA para Segurança & ESG
 * Predição de Incidentes, Near-Miss AI, Emissões CII, Photo Risk Detection
 * REFACTORED: All hardcoded colors replaced with semantic tokens
 */
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Shield, AlertTriangle, Camera, Leaf, Brain, Zap, TrendingDown,
  Loader2, BarChart3, Target, Flame, Eye, Activity, FileWarning,
  TreePine, Droplets, Wind, Gauge, Sparkles, AlertOctagon
} from "lucide-react";
import { useNautilusEnhancementAI } from "@/hooks/useNautilusEnhancementAI";

// ============ INCIDENT PREDICTION AI ============
export const IncidentPredictionAI: React.FC<{ vesselId?: string }> = ({ vesselId }) => {
  const { invoke, isLoading } = useNautilusEnhancementAI();
  const [prediction, setPrediction] = useState<any>(null);

  const handlePredict = async () => {
    const res = await invoke('emergency_guidance', 'Analise todos os near-misses, incidentes e condições operacionais atuais para prever os tipos de incidentes mais prováveis nos próximos 30 dias. Considere: clima, fadiga da tripulação, estado dos equipamentos, operações planejadas e histórico do navio.', {
      vesselId,
      analysisType: 'incident_prediction'
    });
    if (res) setPrediction(res.response);
  };

  const risks = [
    { type: "Queda/Escorregão", probability: 68, trend: "↑", severity: "Moderada" },
    { type: "Lesão por Equipamento", probability: 42, trend: "→", severity: "Alta" },
    { type: "Exposição Química", probability: 25, trend: "↓", severity: "Alta" },
    { type: "Incêndio/Explosão", probability: 12, trend: "→", severity: "Crítica" },
  ];

  return (
    <Card className="border-destructive/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertOctagon className="h-5 w-5 text-destructive" />
          Predição de Incidentes IA
          <Badge className="ml-auto bg-destructive/10 text-destructive">Risk Engine</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {risks.map((r) => (
            <div key={r.type} className="flex items-center gap-3 p-2 rounded-lg border">
              <div className="flex-1">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">{r.type}</span>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-xs">{r.trend}</Badge>
                    <Badge variant={r.severity === "Crítica" ? "destructive" : "secondary"} className="text-xs">{r.severity}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Progress value={r.probability} className="h-1.5 flex-1" />
                  <span className="text-xs font-bold">{r.probability}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Button onClick={handlePredict} disabled={isLoading} className="w-full">
          {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Brain className="h-4 w-4 mr-2" />}
          Análise Preditiva Completa
        </Button>

        {prediction && (
          <ScrollArea className="h-48 rounded-md border p-3 bg-muted/30">
            <p className="text-sm whitespace-pre-wrap">{typeof prediction === 'string' ? prediction : JSON.stringify(prediction, null, 2)}</p>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

// ============ NEAR-MISS AI ============
export const NearMissAI: React.FC = () => {
  const { invoke, isLoading } = useNautilusEnhancementAI();
  const [analysis, setAnalysis] = useState<any>(null);
  const [description, setDescription] = useState("");

  const handleAnalyze = async () => {
    const res = await invoke('emergency_guidance', `Analise este near-miss e gere: 1) Classificação de risco (Matriz 5x5), 2) Causa raiz (5-Why), 3) Ações preventivas, 4) Lições aprendidas, 5) Recomendação de treinamento. Near-miss: ${description}`);
    if (res) setAnalysis(res.response);
  };

  return (
    <Card className="border-warning/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileWarning className="h-5 w-5 text-warning" />
          Análise de Near-Miss IA
          <Badge className="ml-auto bg-warning/10 text-warning">Auto Analysis</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Descreva o near-miss em detalhes: o que aconteceu, onde, quando, quem estava envolvido..."
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={4}
        />

        <Button onClick={handleAnalyze} disabled={isLoading || !description} className="w-full">
          {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Zap className="h-4 w-4 mr-2" />}
          Analisar Near-Miss com IA
        </Button>

        {analysis && (
          <ScrollArea className="h-64 rounded-md border p-3 bg-muted/30">
            <p className="text-sm whitespace-pre-wrap">{typeof analysis === 'string' ? analysis : JSON.stringify(analysis, null, 2)}</p>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

// ============ CII EMISSIONS AI ============
export const CIIEmissionsAI: React.FC<{ vesselId?: string }> = ({ vesselId }) => {
  const { invoke, isLoading } = useNautilusEnhancementAI();
  const [optimization, setOptimization] = useState<any>(null);

  const handleOptimize = async () => {
    const res = await invoke('voyage_plan', 'Calcule o CII (Carbon Intensity Indicator) atual, projete o rating para o final do ano (A-E) e sugira ações concretas para melhorar o rating: slow steaming, weather routing, hull cleaning, trim optimization. Inclua impacto estimado de cada ação.', {
      vesselId
    });
    if (res) setOptimization(res.response);
  };

  return (
    <Card className="border-success/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Leaf className="h-5 w-5 text-success" />
          Otimização CII & Emissões
          <Badge className="ml-auto bg-success/10 text-success">ESG Engine</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "CII Atual", value: "C", color: "text-warning" },
            { label: "CO₂ YTD", value: "4,230 MT", color: "text-muted-foreground" },
            { label: "Meta Anual", value: "B", color: "text-success" },
            { label: "Economia", value: "$89K", color: "text-info" },
          ].map((m) => (
            <div key={m.label} className="p-2 rounded border text-center">
              <p className="text-xs text-muted-foreground">{m.label}</p>
              <p className={`font-bold ${m.color}`}>{m.value}</p>
            </div>
          ))}
        </div>

        <Button onClick={handleOptimize} disabled={isLoading} className="w-full" variant="outline">
          {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
          Plano de Otimização CII
        </Button>

        {optimization && (
          <div className="p-3 rounded-lg border bg-muted/30 text-sm whitespace-pre-wrap">
            {typeof optimization === 'string' ? optimization : JSON.stringify(optimization, null, 2)}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ============ HAZARD PHOTO AI ============
export const HazardPhotoAI: React.FC = () => {
  const { invoke, isLoading } = useNautilusEnhancementAI();
  const [analysis, setAnalysis] = useState<any>(null);
  const [hazardDesc, setHazardDesc] = useState("");

  const handleAnalyze = async () => {
    const res = await invoke('training_simulate', `Analise este risco/perigo identificado: ${hazardDesc}. Classifique por: tipo de risco (físico, químico, biológico, ergonômico), severidade (1-5), probabilidade, EPIs necessários e ação corretiva imediata.`);
    if (res) setAnalysis(res.response);
  };

  return (
    <Card className="border-accent/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-accent-foreground" />
          Detecção de Riscos IA
          <Badge className="ml-auto bg-accent/10 text-accent-foreground">Vision Safety</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
          <Camera className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">Foto do local/situação de risco</p>
        </div>

        <Textarea
          placeholder="Descreva o risco identificado..."
          value={hazardDesc}
          onChange={e => setHazardDesc(e.target.value)}
          rows={3}
        />

        <Button onClick={handleAnalyze} disabled={isLoading || !hazardDesc} className="w-full">
          {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Shield className="h-4 w-4 mr-2" />}
          Classificar Risco com IA
        </Button>

        {analysis && (
          <div className="p-3 rounded-lg border bg-muted/30 text-sm whitespace-pre-wrap">
            {typeof analysis === 'string' ? analysis : JSON.stringify(analysis, null, 2)}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ============ MAIN EXPORT ============
const SafetyAIHub: React.FC<{ vesselId?: string }> = ({ vesselId }) => {
  return (
    <Tabs defaultValue="incidents" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="incidents"><AlertOctagon className="h-3 w-3 mr-1" />Incidentes</TabsTrigger>
        <TabsTrigger value="nearmiss"><FileWarning className="h-3 w-3 mr-1" />Near-Miss</TabsTrigger>
        <TabsTrigger value="emissions"><Leaf className="h-3 w-3 mr-1" />Emissões</TabsTrigger>
        <TabsTrigger value="hazard"><Eye className="h-3 w-3 mr-1" />Riscos</TabsTrigger>
      </TabsList>
      <TabsContent value="incidents"><IncidentPredictionAI vesselId={vesselId} /></TabsContent>
      <TabsContent value="nearmiss"><NearMissAI /></TabsContent>
      <TabsContent value="emissions"><CIIEmissionsAI vesselId={vesselId} /></TabsContent>
      <TabsContent value="hazard"><HazardPhotoAI /></TabsContent>
    </Tabs>
  );
};

export default SafetyAIHub;
