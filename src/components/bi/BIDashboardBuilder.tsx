/**
import { useState, useCallback } from "react";;
 * BI Dashboard Builder - PHASE 3
 * Dashboards customizáveis com IA para consultas inteligentes
 */

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { 
  BarChart3, 
  TrendingUp, 
  Send,
  Sparkles,
  Loader2,
  Ship,
  Fuel,
  Users,
  Wrench,
  CheckCircle,
  Download
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

interface AIQueryResult {
  query: string;
  answer: string;
  data?: unknown[];
  chartType?: "bar" | "line" | "pie";
  confidence: number;
}

const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

// Mock data for demonstrations
const fuelConsumptionData = [
  { month: "Jan", consumo: 4500, meta: 4200 },
  { month: "Fev", consumo: 4200, meta: 4200 },
  { month: "Mar", consumo: 4800, meta: 4200 },
  { month: "Abr", consumo: 4100, meta: 4200 },
  { month: "Mai", consumo: 3900, meta: 4200 },
  { month: "Jun", consumo: 4300, meta: 4200 },
];

const vesselStatusData = [
  { name: "Operando", value: 12 },
  { name: "Manutenção", value: 3 },
  { name: "Docked", value: 2 },
  { name: "Em Trânsito", value: 5 },
];

const maintenanceData = [
  { vessel: "MV Nautilus", pendentes: 5, concluidas: 45 },
  { vessel: "PSV Alpha", pendentes: 3, concluidas: 38 },
  { vessel: "OSV Beta", pendentes: 8, concluidas: 32 },
  { vessel: "AHTS Gamma", pendentes: 2, concluidas: 51 },
];

export const BIDashboardBuilder: React.FC = () => {
  const [aiQuery, setAiQuery] = useState("");
  const [isQuerying, setIsQuerying] = useState(false);
  const [queryResults, setQueryResults] = useState<AIQueryResult[]>([]);
  const [activeTab, setActiveTab] = useState("overview");

  const handleAIQuery = async () => {
    if (!aiQuery.trim()) return;
    
    setIsQuerying(true);
    
    // Simulate AI query processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockResult: AIQueryResult = {
      query: aiQuery,
      answer: generateMockAnswer(aiQuery),
      confidence: 0.85 + Math.random() * 0.15,
      chartType: aiQuery.toLowerCase().includes("consumo") ? "line" : 
        aiQuery.toLowerCase().includes("status") ? "pie" : "bar",
      data: aiQuery.toLowerCase().includes("consumo") ? fuelConsumptionData :
        aiQuery.toLowerCase().includes("status") ? vesselStatusData : maintenanceData
    };
    
    setQueryResults(prev => [mockResult, ...prev]);
    setAiQuery("");
    setIsQuerying(false);
    toast.success("Consulta processada com sucesso!");
  };

  const generateMockAnswer = (query: string): string => {
    const q = query.toLowerCase();
    if (q.includes("consumo") || q.includes("combustível")) {
      return "A análise mostra que o consumo médio de combustível foi de 4.300L/mês no último semestre. O mês de Maio teve o menor consumo (3.900L), 7% abaixo da meta. Recomendo investigar as práticas operacionais desse período.";
    }
    if (q.includes("manutenção")) {
      return "Existem 18 manutenções pendentes distribuídas entre 4 embarcações. O OSV Beta tem o maior backlog (8 pendentes). Sugiro priorizar essa embarcação para evitar falhas operacionais.";
    }
    if (q.includes("tripulação") || q.includes("crew")) {
      return "A frota conta com 156 tripulantes ativos. Taxa de certificados válidos: 94.2%. Há 9 certificados expirando nos próximos 30 dias.";
    }
    return "Com base nos dados analisados, identifiquei padrões relevantes para sua operação. Os indicadores principais estão dentro dos parâmetros esperados, com algumas oportunidades de otimização identificadas.";
  };

  const renderChart = (result: AIQueryResult) => {
    if (!result.data) return null;

    switch (result.chartType) {
    case "pie":
      return (
        <ResponsiveContainer width="100%" height={250}>
          <RechartsPieChart>
            <Pie
              data={result.data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {result.data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </RechartsPieChart>
        </ResponsiveContainer>
      );
    case "line":
      return (
        <ResponsiveContainer width="100%" height={250}>
          <RechartsLineChart data={result.data}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="consumo" stroke="hsl(var(--primary))" strokeWidth={2} />
            <Line type="monotone" dataKey="meta" stroke="hsl(var(--muted-foreground))" strokeDasharray="5 5" />
          </RechartsLineChart>
        </ResponsiveContainer>
      );
    default:
      return (
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={result.data}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="vessel" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="pendentes" fill="hsl(var(--destructive))" name="Pendentes" />
            <Bar dataKey="concluidas" fill="hsl(var(--primary))" name="Concluídas" />
          </BarChart>
        </ResponsiveContainer>
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Query Section */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Consulta Inteligente com IA
          </CardTitle>
          <CardDescription>
            Faça perguntas em linguagem natural sobre seus dados operacionais
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Ex: Qual navio mais consumiu combustível por NM no trimestre?"
              value={aiQuery}
              onChange={handleChange}
              onKeyDown={(e) => e.key === "Enter" && handleAIQuery()}
              className="flex-1"
            />
            <Button onClick={handleAIQuery} disabled={isQuerying || !aiQuery.trim()}>
              {isQuerying ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-3">
            {["Consumo de combustível mensal", "Status das embarcações", "Manutenções pendentes"].map((suggestion) => (
              <Button
                key={suggestion}
                variant="outline"
                size="sm"
                onClick={handleSetAiQuery}
                className="text-xs"
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Query Results */}
      {queryResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados da Consulta</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-6">
                {queryResults.map((result, idx) => (
                  <div key={idx} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Consulta:</p>
                        <p className="font-medium">{result.query}</p>
                      </div>
                      <Badge variant="outline" className="gap-1">
                        <CheckCircle className="h-3 w-3" />
                        {(result.confidence * 100).toFixed(0)}% confiança
                      </Badge>
                    </div>
                    
                    <div className="p-3 bg-primary/5 rounded-lg">
                      <p className="text-sm">{result.answer}</p>
                    </div>
                    
                    {result.data && renderChart(result)}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Dashboard Widgets */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="fleet" className="gap-2">
            <Ship className="h-4 w-4" />
            Frota
          </TabsTrigger>
          <TabsTrigger value="operations" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Operações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Ship className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Embarcações</p>
                    <p className="text-2xl font-bold">22</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-green-500/10">
                    <Users className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tripulantes</p>
                    <p className="text-2xl font-bold">156</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-amber-500/10">
                    <Wrench className="h-6 w-6 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Manutenções</p>
                    <p className="text-2xl font-bold">18</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-blue-500/10">
                    <Fuel className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Consumo Médio</p>
                    <p className="text-2xl font-bold">4.3K L</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Consumo de Combustível</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsLineChart data={fuelConsumptionData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="consumo" stroke="hsl(var(--primary))" strokeWidth={2} />
                    <Line type="monotone" dataKey="meta" stroke="hsl(var(--muted-foreground))" strokeDasharray="5 5" />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Status da Frota</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsPieChart>
                    <Pie
                      data={vesselStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {vesselStatusData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="fleet">
          <Card>
            <CardHeader>
              <CardTitle>Manutenções por Embarcação</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={maintenanceData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="vessel" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="pendentes" fill="hsl(var(--destructive))" name="Pendentes" />
                  <Bar dataKey="concluidas" fill="hsl(var(--primary))" name="Concluídas" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operations">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Indicadores Operacionais</CardTitle>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Exportar
              </Button>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Dashboards operacionais em construção</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BIDashboardBuilder;
