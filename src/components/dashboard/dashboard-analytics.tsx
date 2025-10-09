import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar,
  RadialBarChart,
  RadialBar,
  Legend
} from "recharts";
import { 
  TrendingUp, 
  BarChart3, 
  PieChart as PieChartIcon,
  Activity,
  Brain,
  Zap,
  Target,
  TrendingDown,
  AlertTriangle,
  Users,
  Ship,
  Settings,
  Award
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ChartData {
  name: string;
  value: number;
  color?: string;
  percentage?: number;
}

interface TimeSeriesData {
  date: string;
  value: number;
  label?: string;
  category?: string;
}

interface AIInsight {
  id: string;
  type: "prediction" | "recommendation" | "alert" | "optimization";
  title: string;
  description: string;
  confidence: number;
  impact: "high" | "medium" | "low";
  actionable: boolean;
  metadata?: any;
}

const DashboardCharts: React.FC<{ profile: string }> = ({ profile }) => {
  const { toast } = useToast();

  // Generate sample data based on profile
  const getChartData = () => {
    const performanceData: TimeSeriesData[] = [
      { date: "01/01", value: 85, category: "performance" },
      { date: "01/02", value: 87, category: "performance" },
      { date: "01/03", value: 92, category: "performance" },
      { date: "01/04", value: 88, category: "performance" },
      { date: "01/05", value: 94, category: "performance" },
      { date: "01/06", value: 96, category: "performance" },
      { date: "01/07", value: 93, category: "performance" }
    ];

    const distributionData: ChartData[] = [
      { name: "Conformes", value: 75, color: "#22c55e" },
      { name: "Pendentes", value: 15, color: "#f59e0b" },
      { name: "Não Conformes", value: 10, color: "#ef4444" }
    ];

    const comparisonData: ChartData[] = [
      { name: "Meta", value: 95, percentage: 95 },
      { name: "Atual", value: 87, percentage: 87 },
      { name: "Anterior", value: 82, percentage: 82 }
    ];

    return { performanceData, distributionData, comparisonData };
  };

  const { performanceData, distributionData, comparisonData } = getChartData();

  const COLORS = ["#22c55e", "#f59e0b", "#ef4444", "#3b82f6", "#8b5cf6"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {/* Performance Trend */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Tendência de Performance
          </CardTitle>
          <CardDescription>
            Evolução dos indicadores nos últimos 7 dias
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date" 
                fontSize={12}
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis 
                fontSize={12}
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px"
                }}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="hsl(var(--primary))" 
                fill="hsl(var(--primary))" 
                fillOpacity={0.2}
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5 text-success" />
            Distribuição Status
          </CardTitle>
          <CardDescription>
            Proporção atual por categoria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={distributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {distributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Comparison Chart */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-info" />
            Comparativo de Indicadores
          </CardTitle>
          <CardDescription>
            Análise comparativa entre períodos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={comparisonData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis type="category" dataKey="name" width={80} />
              <Tooltip />
              <Bar dataKey="percentage" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

const AIInsightsPanel: React.FC<{ profile: string }> = ({ profile }) => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateInsights = async () => {
    setIsGenerating(true);
    
    // Simulate AI insights generation
    setTimeout(() => {
      const sampleInsights: AIInsight[] = [
        {
          id: "1",
          type: "prediction",
          title: "Previsão de Não Conformidade",
          description: "Baseado nos padrões históricos, há 78% de chance de não conformidade na Embarcação MV Beta nos próximos 15 dias.",
          confidence: 78,
          impact: "high",
          actionable: true,
          metadata: { vessel: "MV Beta", days: 15 }
        },
        {
          id: "2",
          type: "recommendation",
          title: "Otimização de Treinamentos",
          description: "Recomenda-se focar treinamentos em segurança para tripulação com baixa performance (< 85%).",
          confidence: 92,
          impact: "medium",
          actionable: true,
          metadata: { threshold: 85, module: "training" }
        },
        {
          id: "3",
          type: "optimization",
          title: "Eficiência Operacional",
          description: "Redistribuindo 3 membros da tripulação, é possível aumentar a eficiência geral em 12%.",
          confidence: 85,
          impact: "medium",
          actionable: true,
          metadata: { efficiency_gain: 12, crew_moves: 3 }
        },
        {
          id: "4",
          type: "alert",
          title: "Padrão Anômalo Detectado",
          description: "Detectado aumento de 34% em falhas de equipamentos na última semana. Investigação recomendada.",
          confidence: 89,
          impact: "high",
          actionable: true,
          metadata: { increase: 34, period: "7_days" }
        }
      ];

      setInsights(sampleInsights);
      setIsGenerating(false);
      
      toast({
        title: "IA Insights Gerados",
        description: `${sampleInsights.length} insights foram gerados com base nos dados atuais.`,
      });
    }, 2000);
  };

  useEffect(() => {
    generateInsights();
  }, [profile]);

  const getInsightIcon = (type: AIInsight["type"]) => {
    switch (type) {
    case "prediction": return <TrendingUp className="h-4 w-4" />;
    case "recommendation": return <Target className="h-4 w-4" />;
    case "optimization": return <Zap className="h-4 w-4" />;
    case "alert": return <AlertTriangle className="h-4 w-4" />;
    default: return <Brain className="h-4 w-4" />;
    }
  };

  const getInsightColor = (type: AIInsight["type"]) => {
    switch (type) {
    case "prediction": return "text-info";
    case "recommendation": return "text-success";
    case "optimization": return "text-warning";
    case "alert": return "text-destructive";
    default: return "text-primary";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              IA Insights
            </CardTitle>
            <CardDescription>
              Análises preditivas e recomendações inteligentes
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={generateInsights}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <div className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
            ) : (
              <Brain className="h-4 w-4" />
            )}
            {isGenerating ? "Gerando..." : "Atualizar"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 max-h-96 overflow-y-auto">
        {insights.map((insight) => (
          <div 
            key={insight.id}
            className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-full bg-muted ${getInsightColor(insight.type)}`}>
                {getInsightIcon(insight.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">{insight.title}</h4>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={insight.impact === "high" ? "destructive" : insight.impact === "medium" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {insight.impact}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {insight.confidence}% confiança
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>
                {insight.actionable && (
                  <Button variant="outline" size="sm" className="text-xs">
                    Tomar Ação
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {insights.length === 0 && !isGenerating && (
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum insight disponível</p>
            <Button variant="outline" size="sm" onClick={generateInsights} className="mt-2">
              Gerar Insights
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export { DashboardCharts, AIInsightsPanel };