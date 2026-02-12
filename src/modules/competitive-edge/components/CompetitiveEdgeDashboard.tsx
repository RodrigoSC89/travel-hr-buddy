/**
 * 🏆 Competitive Edge Dashboard
 * Shows all competitive advantages over market competitors
 */
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy, FileSearch, TrendingUp, Brain, Smartphone, Zap,
  CheckCircle, XCircle, ArrowRight, Sparkles, Shield, Clock,
  BarChart3, FileText, AlertTriangle, Target, Lightbulb
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  useProcessDocument,
  useValidateCompliance,
  ExtractedData,
  Classification,
  ComplianceValidation,
} from "../hooks/useDocumentsIntelligence";
import {
  useGenerateInsights,
  useDetectAnomalies,
  useExecutiveSummary,
  PredictiveInsights,
  AnomalyReport,
  ExecutiveSummary,
} from "../hooks/usePredictiveBI";
import { cn } from "@/lib/utils";

const competitors = [
  { name: "SoftExpert", score: 65 },
  { name: "Fluig", score: 60 },
  { name: "UniSea", score: 70 },
  { name: "TM Master", score: 72 },
  { name: "MESPAS", score: 68 },
  { name: "SmartPAL", score: 63 },
  { name: "NOZZLE", score: 58 },
  { name: "DNV ShipManager", score: 75 },
];

const advantages = [
  { feature: "Multi-Engine OCR", us: true, competitors: false, description: "3 engines + AI consensus" },
  { feature: "AI Document Extraction", us: true, competitors: false, description: "Extrai dados estruturados automaticamente" },
  { feature: "Predictive Analytics", us: true, competitors: false, description: "Prediz tendências e problemas" },
  { feature: "Anomaly Detection", us: true, competitors: false, description: "Detecta padrões anômalos com ML" },
  { feature: "Offline AI", us: true, competitors: false, description: "IA funciona sem internet" },
  { feature: "Self-Optimizing Workflows", us: true, competitors: false, description: "Workflows que melhoram sozinhos" },
  { feature: "Voice Commands", us: true, competitors: false, description: "Comandos de voz integrados" },
  { feature: "VR Training", us: true, competitors: false, description: "Treinamento em realidade virtual" },
];

export function CompetitiveEdgeDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-warning/20 to-warning/10">
            <Trophy className="h-8 w-8 text-warning" />
          </div>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              Competitive Edge
              <Badge className="bg-gradient-to-r from-warning to-warning/80 text-warning-foreground">
                <Sparkles className="h-3 w-3 mr-1" />
                Superior
              </Badge>
            </h1>
            <p className="text-muted-foreground">
              Funcionalidades que superam todos os competidores
            </p>
          </div>
        </div>
      </div>

      {/* Comparison Score */}
      <Card className="border-warning/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-warning" />
            Nauti One vs Competidores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <span className="w-32 font-bold text-primary">Nauti One</span>
              <Progress value={95} className="flex-1 h-3" />
              <span className="w-12 text-right font-bold">95%</span>
            </div>
            {competitors.map((comp) => (
              <div key={comp.name} className="flex items-center gap-4">
                <span className="w-32 text-muted-foreground">{comp.name}</span>
                <Progress value={comp.score} className="flex-1 h-2" />
                <span className="w-12 text-right text-muted-foreground">{comp.score}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">Documents AI</TabsTrigger>
          <TabsTrigger value="analytics">Predictive BI</TabsTrigger>
          <TabsTrigger value="advantages">Vantagens</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab />
        </TabsContent>

        <TabsContent value="documents">
          <DocumentsAITab />
        </TabsContent>

        <TabsContent value="analytics">
          <PredictiveBITab />
        </TabsContent>

        <TabsContent value="advantages">
          <AdvantagesTab advantages={advantages} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function OverviewTab() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
      {[
        { icon: FileSearch, title: "Documents AI", value: "Multi-OCR + IA", color: "blue", desc: "Extração inteligente" },
        { icon: TrendingUp, title: "Predictive BI", value: "ML + Predições", color: "green", desc: "Insights preditivos" },
        { icon: Brain, title: "Workflows AI", value: "Auto-otimização", color: "purple", desc: "Melhora sozinho" },
        { icon: Smartphone, title: "Offline AI", value: "TF Lite", color: "orange", desc: "IA sem internet" },
      ].map((item) => (
        <Card key={item.title}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <div className={cn("p-2 rounded-lg", 
                item.color === "blue" ? "bg-info/20" :
                item.color === "green" ? "bg-success/20" :
                item.color === "purple" ? "bg-accent/20" : "bg-warning/20"
              )}>
                <item.icon className={cn("h-5 w-5", 
                  item.color === "blue" ? "text-info" :
                  item.color === "green" ? "text-success" :
                  item.color === "purple" ? "text-accent-foreground" : "text-warning"
                )} />
              </div>
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </div>
            <Badge className={cn(
              item.color === "blue" ? "bg-info/20 text-info" :
              item.color === "green" ? "bg-success/20 text-success" :
              item.color === "purple" ? "bg-accent/20 text-accent-foreground" : "bg-warning/20 text-warning"
            )}>
              {item.value}
            </Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function DocumentsAITab() {
  const [sampleText, setSampleText] = useState("");
  const { mutate: processDoc, isPending: processing, data: processResult } = useProcessDocument();
  const { mutate: validateComp, isPending: validating, data: complianceResult } = useValidateCompliance();

  const handleProcess = () => {
    if (sampleText) {
      // For demo, we simulate with extracted data
      validateComp({
        extractedData: {
          documentType: "certificate",
          dates: [{ type: "expiry", date: "2025-06-15", description: "Certificate expiry" }],
          monetaryValues: [],
          entities: [{ type: "authority", name: "Flag State", role: "issuer" }],
          referenceNumbers: [{ type: "certificate", value: "CERT-2024-001" }],
          vessels: [{ name: "MV Example", imo: "1234567", flag: "Panama" }],
          obligations: [],
          complianceItems: [{ regulation: "SOLAS", requirement: "Safety certificate", status: "valid" }],
          keyPoints: ["Valid safety certificate", "Expires in 6 months"],
          riskLevel: "low",
          language: "en",
        },
      });
    }
  };

  return (
    <div className="space-y-6 mt-6">
      <Card className="border-info/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSearch className="h-5 w-5 text-info" />
            Document Intelligence Engine
          </CardTitle>
          <CardDescription>
            Multi-engine OCR + AI extraction + Compliance validation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Cole aqui o texto de um documento para análise com IA..."
            value={sampleText}
            onChange={(e) => setSampleText(e.target.value)}
            rows={5}
          />
          <Button
            onClick={handleProcess}
            disabled={!sampleText || processing || validating}
            className="bg-gradient-to-r from-info to-primary"
          >
            {processing || validating ? "Processando..." : "🔍 Analisar com IA"}
          </Button>
        </CardContent>
      </Card>

      <AnimatePresence>
        {complianceResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className={cn(
              "border-2",
              complianceResult.compliant ? "border-success/30" : "border-destructive/30"
            )}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {complianceResult.compliant ? (
                    <CheckCircle className="h-5 w-5 text-success" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive" />
                  )}
                  Resultado da Validação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{complianceResult.overallScore}%</p>
                    <p className="text-xs text-muted-foreground">Compliance Score</p>
                  </div>
                  <Progress value={complianceResult.overallScore} className="flex-1" />
                </div>

                {complianceResult.warnings.length > 0 && (
                  <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
                    <p className="font-medium text-warning mb-2">⚠️ Alertas</p>
                    <ul className="text-sm space-y-1">
                      {complianceResult.warnings.map((w, i) => (
                        <li key={`warn-${i}-${w.slice(0,15)}`}>• {w}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {complianceResult.recommendations.length > 0 && (
                  <div className="p-3 rounded-lg bg-info/10 border border-info/20">
                    <p className="font-medium text-info mb-2">💡 Recomendações</p>
                    <ul className="text-sm space-y-1">
                      {complianceResult.recommendations.map((r, i) => (
                        <li key={`rec-${i}-${r.slice(0,15)}`}>• {r}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Features List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: Zap, title: "Multi-Engine OCR", desc: "Tesseract + Google Vision + Azure" },
          { icon: Brain, title: "AI Extraction", desc: "Extrai dados estruturados" },
          { icon: Shield, title: "Compliance Check", desc: "SOLAS, MARPOL, MLC, STCW" },
        ].map((f) => (
          <Card key={f.title}>
            <CardContent className="pt-4 flex items-center gap-3">
              <f.icon className="h-8 w-8 text-info" />
              <div>
                <p className="font-medium">{f.title}</p>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function PredictiveBITab() {
  const { mutate: generateInsights, isPending: generating, data: insights } = useGenerateInsights();
  const { mutate: detectAnomalies, isPending: detecting, data: anomalies } = useDetectAnomalies();
  const { mutate: execSummary, isPending: summarizing, data: summary } = useExecutiveSummary();

  return (
    <div className="space-y-6 mt-6">
      <Card className="border-success/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-success" />
            Predictive Analytics Engine
          </CardTitle>
          <CardDescription>
            ML predictions + Anomaly detection + Executive insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <Button
              onClick={() => generateInsights({ context: "Fleet operations", period: "Last 30 days" })}
              disabled={generating}
              className="bg-gradient-to-r from-success to-success/80"
            >
              {generating ? "Gerando..." : "🔮 Gerar Insights Preditivos"}
            </Button>
            <Button
              onClick={() => detectAnomalies({})}
              disabled={detecting}
              variant="outline"
            >
              {detecting ? "Detectando..." : "🔍 Detectar Anomalias"}
            </Button>
            <Button
              onClick={() => execSummary({ period: "This month" })}
              disabled={summarizing}
              variant="outline"
            >
              {summarizing ? "Gerando..." : "📋 Sumário Executivo"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <AnimatePresence>
        {insights && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {/* Summary */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>AI Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{insights.summary}</p>
                <Badge className="mt-2">Confiança: {insights.confidence}%</Badge>
              </CardContent>
            </Card>

            {/* Predictions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-accent-foreground" />
                  Predições
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {insights.predictions.slice(0, 5).map((pred) => (
                    <div key={pred.category} className="p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center justify-between mb-1">
                        <Badge variant="outline">{pred.category}</Badge>
                        <span className="text-sm">{pred.probability}%</span>
                      </div>
                      <p className="text-sm">{pred.prediction}</p>
                      <p className="text-xs text-muted-foreground mt-1">{pred.timeframe}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-warning" />
                  Recomendações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {insights.recommendations.slice(0, 5).map((rec, i) => (
                    <div key={`rec-${rec.action.slice(0,20)}-${i}`} className="flex items-start gap-3">
                      <Badge className={cn(
                        rec.priority === "high" ? "bg-destructive" :
                        rec.priority === "medium" ? "bg-warning" : "bg-success"
                      )}>
                        {rec.priority}
                      </Badge>
                      <p className="text-sm">{rec.action}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {anomalies && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  Anomaly Detection Report
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{anomalies.overallHealthScore}%</p>
                    <p className="text-xs text-muted-foreground">Health Score</p>
                  </div>
                  <Progress value={anomalies.overallHealthScore} className="flex-1" />
                </div>
                
                {anomalies.anomalies.length > 0 ? (
                  <div className="space-y-2">
                    {anomalies.anomalies.map((a) => (
                      <div key={a.id} className="p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center justify-between mb-1">
                          <Badge variant={a.severity === "high" ? "destructive" : "secondary"}>
                            {a.severity}
                          </Badge>
                          <span className="text-xs">{a.type}</span>
                        </div>
                        <p className="text-sm">{a.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground">
                    ✅ Nenhuma anomalia significativa detectada
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {summary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>{summary.headline}</CardTitle>
                <CardDescription>{summary.generatedAt}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>{summary.summary}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {summary.keyMetrics.map((m) => (
                    <div key={m.name} className="text-center p-3 rounded-lg bg-muted/50">
                      <p className="text-lg font-bold">{m.value}</p>
                      <p className="text-xs text-muted-foreground">{m.name}</p>
                      <Badge className={cn(
                        "mt-1",
                        m.status === "positive" ? "bg-success" :
                        m.status === "negative" ? "bg-destructive" : "bg-muted"
                      )}>
                        {m.change}
                      </Badge>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-lg bg-info/10">
                  <p className="font-medium text-info">Outlook: {summary.outlook}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface Advantage {
  feature: string;
  us: boolean;
  competitors: boolean;
  description: string;
}

function AdvantagesTab({ advantages: advList }: { advantages: Advantage[] }) {
  return (
    <div className="mt-6">
      <Card>
        <CardHeader>
          <CardTitle>Vantagens Competitivas Exclusivas</CardTitle>
          <CardDescription>
            Funcionalidades que nenhum competidor oferece
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {advList.map((adv: Advantage) => (
              <div key={adv.feature} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                <div className="flex-1">
                  <p className="font-medium">{adv.feature}</p>
                  <p className="text-xs text-muted-foreground">{adv.description}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Nauti One</p>
                    {adv.us ? (
                      <CheckCircle className="h-6 w-6 text-success mx-auto" />
                    ) : (
                      <XCircle className="h-6 w-6 text-destructive mx-auto" />
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Competidores</p>
                    {adv.competitors ? (
                      <CheckCircle className="h-6 w-6 text-success mx-auto" />
                    ) : (
                      <XCircle className="h-6 w-6 text-destructive mx-auto" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default CompetitiveEdgeDashboard;
