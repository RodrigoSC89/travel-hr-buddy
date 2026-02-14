/**
 * Finance AI Hub - Suite Disruptiva IA para Finanças & Procurement
 * Análise de Contratos, Previsão de Custos, Procurement Intelligence, Reconciliação Auto
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
  DollarSign, TrendingUp, FileText, ShoppingCart, Brain, Zap,
  AlertTriangle, Loader2, BarChart3, Target, PieChart, Receipt,
  ArrowDown, ArrowUp, Calculator, Sparkles, Shield, Scale
} from "lucide-react";
import { useNautilusEnhancementAI } from "@/hooks/useNautilusEnhancementAI";

// ============ CONTRACT ANALYSIS AI ============
export const ContractAnalysisAI: React.FC = () => {
  const { invoke, isLoading } = useNautilusEnhancementAI();
  const [analysis, setAnalysis] = useState<any>(null);
  const [contractText, setContractText] = useState("");

  const handleAnalyze = async () => {
    const res = await invoke('audit_analyze', `Analise este contrato marítimo e identifique: 1) Cláusulas de risco, 2) Termos financeiros desfavoráveis, 3) Oportunidades de negociação, 4) Conformidade com MLC/BIMCO, 5) Comparação com benchmarks do mercado. Contrato: ${contractText}`);
    if (res) setAnalysis(res.response);
  };

  return (
    <Card className="border-blue-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="h-5 w-5 text-blue-500" />
          Análise de Contratos IA
          <Badge className="ml-auto bg-blue-500/10 text-blue-500">Legal AI</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
          <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">Arraste contratos (PDF/DOCX) ou cole o texto</p>
        </div>

        <Textarea
          placeholder="Cole aqui o texto do contrato ou cláusulas específicas para análise..."
          value={contractText}
          onChange={e => setContractText(e.target.value)}
          rows={4}
        />

        <Button onClick={handleAnalyze} disabled={isLoading || !contractText} className="w-full">
          {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Brain className="h-4 w-4 mr-2" />}
          Analisar Contrato com IA
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

// ============ COST PREDICTION AI ============
export const CostPredictionAI: React.FC<{ vesselId?: string }> = ({ vesselId }) => {
  const { analyzeRouteCost, isLoading } = useNautilusEnhancementAI();
  const [prediction, setPrediction] = useState<any>(null);

  const handlePredict = async () => {
    const res = await analyzeRouteCost(
      { vesselId, period: 'next_quarter' },
      { type: 'cost_forecast', categories: ['fuel', 'crew', 'maintenance', 'port', 'insurance'] }
    );
    if (res) setPrediction(res.response);
  };

  const costs = [
    { category: "Combustível", current: "$485K", forecast: "$512K", trend: "+5.6%", icon: ArrowUp, trendColor: "text-red-500" },
    { category: "Tripulação", current: "$320K", forecast: "$315K", trend: "-1.5%", icon: ArrowDown, trendColor: "text-green-500" },
    { category: "Manutenção", current: "$180K", forecast: "$210K", trend: "+16.7%", icon: ArrowUp, trendColor: "text-red-500" },
    { category: "Porto/Taxas", current: "$95K", forecast: "$98K", trend: "+3.2%", icon: ArrowUp, trendColor: "text-yellow-500" },
  ];

  return (
    <Card className="border-green-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-500" />
          Previsão de Custos IA
          <Badge className="ml-auto bg-green-500/10 text-green-500">Forecast</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {costs.map((c) => (
            <div key={c.category} className="flex items-center justify-between p-2 rounded border">
              <span className="text-sm font-medium">{c.category}</span>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">{c.current}</span>
                <span className="text-sm">→</span>
                <span className="text-sm font-bold">{c.forecast}</span>
                <Badge variant="outline" className={`text-xs ${c.trendColor}`}>
                  <c.icon className="h-3 w-3 mr-1" />{c.trend}
                </Badge>
              </div>
            </div>
          ))}
        </div>

        <Button onClick={handlePredict} disabled={isLoading} className="w-full" variant="outline">
          {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Calculator className="h-4 w-4 mr-2" />}
          Previsão Detalhada por Trimestre
        </Button>

        {prediction && (
          <div className="p-3 rounded-lg border bg-muted/30 text-sm whitespace-pre-wrap">
            {typeof prediction === 'string' ? prediction : JSON.stringify(prediction, null, 2)}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ============ PROCUREMENT INTELLIGENCE ============
export const ProcurementIntelligenceAI: React.FC = () => {
  const { invoke, isLoading } = useNautilusEnhancementAI();
  const [intel, setIntel] = useState<any>(null);

  const handleAnalyze = async () => {
    const res = await invoke('logistics_optimize', 'Analise todas as requisições de compra pendentes, compare fornecedores, identifique oportunidades de consolidação, sugira melhores preços e prazos de entrega otimizados');
    if (res) setIntel(res.response);
  };

  return (
    <Card className="border-purple-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-purple-500" />
          Procurement Intelligence
          <Badge className="ml-auto bg-purple-500/10 text-purple-500">Smart Buy</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2 rounded border text-center">
            <Receipt className="h-4 w-4 mx-auto text-purple-500 mb-1" />
            <p className="text-xs text-muted-foreground">Pendentes</p>
            <p className="font-bold">34</p>
          </div>
          <div className="p-2 rounded border text-center">
            <DollarSign className="h-4 w-4 mx-auto text-green-500 mb-1" />
            <p className="text-xs text-muted-foreground">Economia IA</p>
            <p className="font-bold text-green-500">$127K</p>
          </div>
          <div className="p-2 rounded border text-center">
            <Target className="h-4 w-4 mx-auto text-blue-500 mb-1" />
            <p className="text-xs text-muted-foreground">Consolidações</p>
            <p className="font-bold">8</p>
          </div>
        </div>

        <Button onClick={handleAnalyze} disabled={isLoading} className="w-full" variant="outline">
          {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
          Otimizar Compras com IA
        </Button>

        {intel && (
          <ScrollArea className="h-48 rounded-md border p-3 bg-muted/30">
            <p className="text-sm whitespace-pre-wrap">{typeof intel === 'string' ? intel : JSON.stringify(intel, null, 2)}</p>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

// ============ MAIN EXPORT ============
const FinanceAIHub: React.FC<{ vesselId?: string }> = ({ vesselId }) => {
  return (
    <Tabs defaultValue="contracts" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="contracts"><Scale className="h-3 w-3 mr-1" />Contratos</TabsTrigger>
        <TabsTrigger value="costs"><TrendingUp className="h-3 w-3 mr-1" />Custos</TabsTrigger>
        <TabsTrigger value="procurement"><ShoppingCart className="h-3 w-3 mr-1" />Procurement</TabsTrigger>
      </TabsList>
      <TabsContent value="contracts"><ContractAnalysisAI /></TabsContent>
      <TabsContent value="costs"><CostPredictionAI vesselId={vesselId} /></TabsContent>
      <TabsContent value="procurement"><ProcurementIntelligenceAI /></TabsContent>
    </Tabs>
  );
};

export default FinanceAIHub;
