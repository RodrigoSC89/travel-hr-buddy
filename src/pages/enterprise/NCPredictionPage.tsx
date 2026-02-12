/**
 * NC Prediction - Página dedicada
 * Predição de Não-Conformidades com Machine Learning
 */
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Brain, AlertTriangle, TrendingUp, Ship, Shield,
  Target, Clock, FileText, Download, Activity
} from "lucide-react";

// Mock prediction data
const predictionStats = {
  totalPredictions: 45,
  highProbability: 8,
  mediumProbability: 15,
  lowProbability: 22,
  accuracy: 87,
  preventedNCs: 12,
};

const predictions = [
  {
    id: 1,
    vessel: "MV Atlântico Sul",
    area: "Fire Safety Equipment",
    probability: 85,
    inspectionType: "PSC",
    predictedDate: "2025-02-15",
    factors: ["Extinguisher expiry", "Previous deficiency", "Port history"],
    recommendation: "Schedule pre-arrival inspection and equipment check"
  },
  {
    id: 2,
    vessel: "MV Pacífico Norte",
    area: "ISM Documentation",
    probability: 72,
    inspectionType: "Flag State",
    predictedDate: "2025-02-20",
    factors: ["Document revision pending", "Crew change", "Audit schedule"],
    recommendation: "Complete SMS revision before next port call"
  },
  {
    id: 3,
    vessel: "MV Caribe Star",
    area: "MARPOL Compliance",
    probability: 68,
    inspectionType: "PSC",
    predictedDate: "2025-02-25",
    factors: ["ORB entries", "Equipment calibration", "Historical pattern"],
    recommendation: "Review Oil Record Book entries and calibrate equipment"
  },
  {
    id: 4,
    vessel: "MV Mediterranean",
    area: "Navigation Equipment",
    probability: 55,
    inspectionType: "Vetting",
    predictedDate: "2025-03-01",
    factors: ["ECDIS update", "AIS maintenance", "Equipment age"],
    recommendation: "Update navigation software and verify certificates"
  },
  {
    id: 5,
    vessel: "MV Atlantic Star",
    area: "Crew Certification",
    probability: 45,
    inspectionType: "PSC",
    predictedDate: "2025-03-10",
    factors: ["Certificate expiry dates", "Training records"],
    recommendation: "Review crew certificate matrix and schedule renewals"
  },
];

const riskFactors = [
  { factor: "Equipment Age", weight: 25, description: "Older equipment has higher NC probability" },
  { factor: "Port Risk Profile", weight: 20, description: "Historical PSC detention rates by port" },
  { factor: "Previous Deficiencies", weight: 20, description: "Past NCs increase future likelihood" },
  { factor: "Crew Tenure", weight: 15, description: "Recent crew changes impact compliance" },
  { factor: "Documentation Status", weight: 10, description: "Pending revisions or updates" },
  { factor: "Maintenance Schedule", weight: 10, description: "Overdue or deferred maintenance" },
];

export default function NCPredictionPage() {
  const [selectedTab, setSelectedTab] = useState("predictions");

  const getProbabilityColor = (prob: number) => {
    if (prob >= 70) return "bg-red-500";
    if (prob >= 50) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getProbabilityText = (prob: number) => {
    if (prob >= 70) return "Alta";
    if (prob >= 50) return "Média";
    return "Baixa";
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-500/20 rounded-xl">
            <Brain className="h-8 w-8 text-purple-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              NC Prediction
              <Badge variant="secondary" className="bg-purple-500/20 text-purple-400">
                ML
              </Badge>
            </h1>
            <p className="text-muted-foreground">
              Predição de Não-Conformidades usando Machine Learning
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <FileText className="h-4 w-4" />
            Relatório
          </Button>
          <Button className="gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Predições</p>
                <p className="text-3xl font-bold">{predictionStats.totalPredictions}</p>
              </div>
              <Brain className="h-10 w-10 text-muted-foreground/30" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Alta Prob.</p>
                <p className="text-3xl font-bold text-red-500">{predictionStats.highProbability}</p>
              </div>
              <AlertTriangle className="h-10 w-10 text-red-500/30" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Média Prob.</p>
                <p className="text-3xl font-bold text-yellow-500">{predictionStats.mediumProbability}</p>
              </div>
              <Activity className="h-10 w-10 text-yellow-500/30" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Baixa Prob.</p>
                <p className="text-3xl font-bold text-green-500">{predictionStats.lowProbability}</p>
              </div>
              <Shield className="h-10 w-10 text-green-500/30" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Precisão</p>
                <p className="text-3xl font-bold text-primary">{predictionStats.accuracy}%</p>
              </div>
              <Target className="h-10 w-10 text-primary/30" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Prevenidas</p>
                <p className="text-3xl font-bold text-green-500">{predictionStats.preventedNCs}</p>
              </div>
              <TrendingUp className="h-10 w-10 text-green-500/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="predictions">Predições</TabsTrigger>
          <TabsTrigger value="factors">Fatores de Risco</TabsTrigger>
          <TabsTrigger value="model">Modelo ML</TabsTrigger>
        </TabsList>

        <TabsContent value="predictions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Predições de NC por Embarcação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {predictions.map((pred) => (
                  <div key={pred.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Ship className="h-6 w-6 text-primary" />
                        <div>
                          <p className="font-medium">{pred.vessel}</p>
                          <p className="text-sm text-muted-foreground">{pred.area}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{pred.inspectionType}</Badge>
                        <div className={`px-3 py-1 rounded-full text-white font-bold ${getProbabilityColor(pred.probability)}`}>
                          {pred.probability}%
                        </div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Probabilidade de NC</span>
                        <span>{getProbabilityText(pred.probability)}</span>
                      </div>
                      <Progress value={pred.probability} className={pred.probability >= 70 ? "[&>div]:bg-red-500" : pred.probability >= 50 ? "[&>div]:bg-yellow-500" : "[&>div]:bg-green-500"} />
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                      <div>
                        <p className="text-muted-foreground">Data Prevista:</p>
                        <p className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {new Date(pred.predictedDate).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Fatores:</p>
                        <div className="flex flex-wrap gap-1">
                          {pred.factors.map((f, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">{f}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm"><strong>Recomendação:</strong> {pred.recommendation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="factors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Fatores de Risco no Modelo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {riskFactors.map((factor) => (
                  <div key={factor.factor} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{factor.factor}</h3>
                      <Badge className="bg-primary">{factor.weight}%</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{factor.description}</p>
                    <Progress value={factor.weight} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="model" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Desempenho do Modelo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span>Precisão (Accuracy)</span>
                      <span className="font-bold">87%</span>
                    </div>
                    <Progress value={87} />
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span>Recall</span>
                      <span className="font-bold">82%</span>
                    </div>
                    <Progress value={82} />
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span>F1-Score</span>
                      <span className="font-bold">84%</span>
                    </div>
                    <Progress value={84} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Informações do Modelo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between p-3 bg-muted rounded-lg">
                    <span>Algoritmo</span>
                    <span className="font-medium">XGBoost Ensemble</span>
                  </div>
                  <div className="flex justify-between p-3 bg-muted rounded-lg">
                    <span>Dados de Treinamento</span>
                    <span className="font-medium">15,000+ inspeções</span>
                  </div>
                  <div className="flex justify-between p-3 bg-muted rounded-lg">
                    <span>Última Atualização</span>
                    <span className="font-medium">2025-01-28</span>
                  </div>
                  <div className="flex justify-between p-3 bg-muted rounded-lg">
                    <span>Features</span>
                    <span className="font-medium">42 variáveis</span>
                  </div>
                  <div className="flex justify-between p-3 bg-muted rounded-lg">
                    <span>Janela de Predição</span>
                    <span className="font-medium">30-90 dias</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
