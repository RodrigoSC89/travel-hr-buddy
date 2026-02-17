/**
 * Maintenance AI Hub - Suite Disruptiva IA para Manutenção
 * Manutenção Preditiva, Análise de Equipamentos, Spare Parts Intelligence, Auto Work Orders
 */
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Wrench, AlertTriangle, Camera, Package, Brain, Zap, TrendingUp,
  Clock, DollarSign, Loader2, Shield, Activity, Gauge, Settings,
  FileText, CheckCircle, XCircle, BarChart3
} from "lucide-react";
import { useNautilusEnhancementAI } from "@/hooks/useNautilusEnhancementAI";
import { useToast } from "@/hooks/use-toast";

// ============ PREDICTIVE MAINTENANCE AI ============
export const PredictiveMaintenanceAI: React.FC<{ vesselId?: string }> = ({ vesselId }) => {
  const { invoke, isLoading } = useNautilusEnhancementAI();
  const [predictions, setPredictions] = useState<any>(null);

  const handlePredict = async () => {
    const res = await invoke('training_simulate', 'Analise todos os equipamentos críticos e preveja falhas nos próximos 90 dias com base em vibração, temperatura, horas de operação e histórico de manutenção', {
      vesselId,
      analysisType: 'predictive_maintenance',
      timeframe: '90_days'
    });
    if (res) setPredictions(res.response);
  };

  const equipment = [
    { name: "Motor Principal #1", health: 87, risk: "Médio", nextService: "12 dias", icon: Settings },
    { name: "Gerador Auxiliar #2", health: 94, risk: "Baixo", nextService: "45 dias", icon: Zap },
    { name: "Bomba Ballast #3", health: 62, risk: "Alto", nextService: "3 dias", icon: AlertTriangle },
    { name: "Compressor A/C", health: 78, risk: "Médio", nextService: "21 dias", icon: Gauge },
  ];

  return (
    <Card className="border-accent/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-accent-foreground" />
          Manutenção Preditiva CBM
          <Badge className="ml-auto bg-accent/10 text-accent-foreground">ML Engine</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {equipment.map((eq) => (
            <div key={eq.name} className="flex items-center gap-3 p-2 rounded-lg border">
              <eq.icon className={`h-4 w-4 ${eq.health > 80 ? 'text-success' : eq.health > 60 ? 'text-warning' : 'text-destructive'}`} />
              <div className="flex-1">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">{eq.name}</span>
                  <Badge variant={eq.risk === "Alto" ? "destructive" : eq.risk === "Médio" ? "secondary" : "outline"} className="text-xs">
                    {eq.risk}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Progress value={eq.health} className="h-1.5 flex-1" />
                  <span className="text-xs text-muted-foreground">{eq.health}%</span>
                </div>
                <span className="text-xs text-muted-foreground">Próx. serviço: {eq.nextService}</span>
              </div>
            </div>
          ))}
        </div>

        <Button onClick={handlePredict} disabled={isLoading} className="w-full">
          {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Brain className="h-4 w-4 mr-2" />}
          Análise Preditiva Completa
        </Button>

        {predictions && (
          <ScrollArea className="h-48 rounded-md border p-3 bg-muted/30">
            <p className="text-sm whitespace-pre-wrap">{typeof predictions === 'string' ? predictions : JSON.stringify(predictions, null, 2)}</p>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

// ============ EQUIPMENT PHOTO AI ============
export const EquipmentPhotoAI: React.FC = () => {
  const { invoke, isLoading } = useNautilusEnhancementAI();
  const [analysis, setAnalysis] = useState<any>(null);
  const [description, setDescription] = useState("");

  const handleAnalyze = async () => {
    const res = await invoke('training_simulate', `Analise o estado do equipamento descrito: ${description}. Identifique: corrosão, desgaste, vazamentos, danos visíveis. Forneça diagnóstico, severidade (1-5), ação recomendada e urgência.`, {
      analysisType: 'visual_inspection'
    });
    if (res) setAnalysis(res.response);
  };

  return (
    <Card className="border-info/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5 text-info" />
          Inspeção Visual IA
          <Badge className="ml-auto bg-info/10 text-info">Vision AI</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
          <Camera className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">Arraste fotos do equipamento ou clique para upload</p>
          <p className="text-xs text-muted-foreground mt-1">Suporta: JPG, PNG, HEIC até 10MB</p>
        </div>

        <Textarea
          placeholder="Descreva o equipamento e sintomas observados..."
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={3}
        />

        <Button onClick={handleAnalyze} disabled={isLoading || !description} className="w-full" variant="outline">
          {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Brain className="h-4 w-4 mr-2" />}
          Diagnosticar com IA
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

// ============ SPARE PARTS INTELLIGENCE ============
export const SparePartsIntelligenceAI: React.FC<{ vesselId?: string }> = ({ vesselId }) => {
  const { invoke, isLoading } = useNautilusEnhancementAI();
  const [recommendation, setRecommendation] = useState<any>(null);

  const handleAnalyze = async () => {
    const res = await invoke('resource_availability', 'Analise o inventário de peças sobressalentes, identifique itens críticos com estoque baixo, preveja demanda para os próximos 6 meses e sugira compras preventivas com melhores fornecedores e preços', {
      vesselId,
      analysisType: 'spare_parts_optimization'
    });
    if (res) setRecommendation(res.response);
  };

  return (
    <Card className="border-warning/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5 text-warning" />
          Spare Parts Intelligence
          <Badge className="ml-auto bg-warning/10 text-warning">Inventory AI</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2 rounded border text-center">
            <CheckCircle className="h-4 w-4 mx-auto text-success mb-1" />
            <p className="text-xs text-muted-foreground">Em Estoque</p>
            <p className="font-bold">847</p>
          </div>
          <div className="p-2 rounded border text-center">
            <AlertTriangle className="h-4 w-4 mx-auto text-warning mb-1" />
            <p className="text-xs text-muted-foreground">Estoque Baixo</p>
            <p className="font-bold text-warning">23</p>
          </div>
          <div className="p-2 rounded border text-center">
            <XCircle className="h-4 w-4 mx-auto text-destructive mb-1" />
            <p className="text-xs text-muted-foreground">Crítico</p>
            <p className="font-bold text-destructive">5</p>
          </div>
        </div>

        <Button onClick={handleAnalyze} disabled={isLoading} className="w-full" variant="outline">
          {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Brain className="h-4 w-4 mr-2" />}
          Otimizar Inventário com IA
        </Button>

        {recommendation && (
          <div className="p-3 rounded-lg border bg-muted/30 text-sm whitespace-pre-wrap">
            {typeof recommendation === 'string' ? recommendation : JSON.stringify(recommendation, null, 2)}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ============ AUTO WORK ORDER AI ============
export const AutoWorkOrderAI: React.FC = () => {
  const { invoke, isLoading } = useNautilusEnhancementAI();
  const [workOrder, setWorkOrder] = useState<any>(null);
  const [issue, setIssue] = useState("");

  const handleGenerate = async () => {
    const res = await invoke('workflow_optimize', `Gere uma Work Order completa para: ${issue}. Inclua: descrição técnica, procedimentos passo-a-passo, peças necessárias, ferramentas, tempo estimado, nível de skill requerido, riscos de segurança e PPE obrigatório.`);
    if (res) setWorkOrder(res.response);
  };

  return (
    <Card className="border-accent/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-accent-foreground" />
          Auto-Geração de Work Orders
          <Badge className="ml-auto bg-accent/10 text-accent-foreground">AutoGen</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Descreva o problema ou necessidade de manutenção..."
          value={issue}
          onChange={e => setIssue(e.target.value)}
          rows={3}
        />

        <Button onClick={handleGenerate} disabled={isLoading || !issue} className="w-full">
          {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Zap className="h-4 w-4 mr-2" />}
          Gerar Work Order Automática
        </Button>

        {workOrder && (
          <ScrollArea className="h-64 rounded-md border p-3 bg-muted/30">
            <p className="text-sm whitespace-pre-wrap">{typeof workOrder === 'string' ? workOrder : JSON.stringify(workOrder, null, 2)}</p>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

// ============ MAIN EXPORT ============
const MaintenanceAIHub: React.FC<{ vesselId?: string }> = ({ vesselId }) => {
  return (
    <Tabs defaultValue="predictive" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="predictive"><Activity className="h-3 w-3 mr-1" />Preditiva</TabsTrigger>
        <TabsTrigger value="photo"><Camera className="h-3 w-3 mr-1" />Inspeção</TabsTrigger>
        <TabsTrigger value="spare"><Package className="h-3 w-3 mr-1" />Peças</TabsTrigger>
        <TabsTrigger value="workorder"><FileText className="h-3 w-3 mr-1" />Work Orders</TabsTrigger>
      </TabsList>
      <TabsContent value="predictive"><PredictiveMaintenanceAI vesselId={vesselId} /></TabsContent>
      <TabsContent value="photo"><EquipmentPhotoAI /></TabsContent>
      <TabsContent value="spare"><SparePartsIntelligenceAI vesselId={vesselId} /></TabsContent>
      <TabsContent value="workorder"><AutoWorkOrderAI /></TabsContent>
    </Tabs>
  );
};

export default MaintenanceAIHub;
