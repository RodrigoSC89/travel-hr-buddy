import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { TrendingUp, TrendingDown, Heart, Brain } from "lucide-react";
import { Badge } from "@/components/ui/badge";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface MoodData {
  date: Date;
  stress: number;
  energy: number;
  sleep: number;
  mood: number;
}

export const MoodDashboard = () => {
  const [moodHistory, setMoodHistory] = useState<MoodData[]>([]);

  // Constants for trend calculation
  const RECENT_DAYS = 3;
  const COMPARISON_DAYS = 6;
  const MIN_HISTORY_FOR_TREND = 2;

  // Helper function to invert stress (higher stress = lower score)
  const invertStress = (stress: number) => 100 - stress;

  useEffect(() => {
    // Load mood history from localStorage
    const saved = localStorage.getItem("crew_mood_history");
    if (saved) {
      const parsed = JSON.parse(saved);
      setMoodHistory(parsed.map((item: any) => ({
        ...item,
        date: new Date(item.date),
      })));
    } else {
      // Generate sample data for last 7 days
      const sampleData: MoodData[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        sampleData.push({
          date,
          stress: 40 + Math.random() * 30,
          energy: 50 + Math.random() * 30,
          sleep: 60 + Math.random() * 25,
          mood: 55 + Math.random() * 30,
        });
      }
      setMoodHistory(sampleData);
      localStorage.setItem("crew_mood_history", JSON.stringify(sampleData));
    }
  }, []);

  const calculateAverage = (key: keyof Omit<MoodData, "date">) => {
    if (moodHistory.length === 0) return 0;
    const sum = moodHistory.reduce((acc, curr) => acc + curr[key], 0);
    return sum / moodHistory.length;
  };

  const calculateTrend = (key: keyof Omit<MoodData, "date">) => {
    if (moodHistory.length < MIN_HISTORY_FOR_TREND) return 0;
    const recent = moodHistory.slice(-RECENT_DAYS);
    const older = moodHistory.slice(-COMPARISON_DAYS, -RECENT_DAYS);
    
    const recentAvg = recent.reduce((acc, curr) => acc + curr[key], 0) / recent.length;
    const olderAvg = older.reduce((acc, curr) => acc + curr[key], 0) / older.length;
    
    return recentAvg - olderAvg;
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 5) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend < -5) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <span className="text-xs text-muted-foreground">Estável</span>;
  };

  const chartData = {
    labels: moodHistory.map(d => d.date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })),
    datasets: [
      {
        label: "Humor",
        data: moodHistory.map(d => d.mood),
        borderColor: "#22c55e",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Energia",
        data: moodHistory.map(d => d.energy),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Sono",
        data: moodHistory.map(d => d.sleep),
        borderColor: "#8b5cf6",
        backgroundColor: "rgba(139, 92, 246, 0.1)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Estresse",
        data: moodHistory.map(d => invertStress(d.stress)),
        borderColor: "#ef4444",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: "Índice (%)",
        },
      },
    },
  };

  const getStatusColor = (value: number) => {
    if (value >= 70) return "text-green-600 bg-green-50 dark:bg-green-950";
    if (value >= 50) return "text-yellow-600 bg-yellow-50 dark:bg-yellow-950";
    return "text-red-600 bg-red-50 dark:bg-red-950";
  };

  const getStatusBadge = (value: number) => {
    if (value >= 70) return <Badge className="bg-green-600">Excelente</Badge>;
    if (value >= 50) return <Badge className="bg-yellow-600">Moderado</Badge>;
    return <Badge variant="destructive">Atenção</Badge>;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            Dashboard de Bem-Estar (Privado)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Metrics Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className={`p-4 rounded-lg ${getStatusColor(calculateAverage("mood"))}`}>
              <p className="text-xs text-muted-foreground mb-1">Humor Médio</p>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold">{calculateAverage("mood").toFixed(0)}%</p>
                {getTrendIcon(calculateTrend("mood"))}
              </div>
              {getStatusBadge(calculateAverage("mood"))}
            </div>

            <div className={`p-4 rounded-lg ${getStatusColor(calculateAverage("energy"))}`}>
              <p className="text-xs text-muted-foreground mb-1">Energia Média</p>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold">{calculateAverage("energy").toFixed(0)}%</p>
                {getTrendIcon(calculateTrend("energy"))}
              </div>
              {getStatusBadge(calculateAverage("energy"))}
            </div>

            <div className={`p-4 rounded-lg ${getStatusColor(calculateAverage("sleep"))}`}>
              <p className="text-xs text-muted-foreground mb-1">Sono Médio</p>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold">{calculateAverage("sleep").toFixed(0)}%</p>
                {getTrendIcon(calculateTrend("sleep"))}
              </div>
              {getStatusBadge(calculateAverage("sleep"))}
            </div>

            <div className={`p-4 rounded-lg ${getStatusColor(invertStress(calculateAverage("stress")))}`}>
              <p className="text-xs text-muted-foreground mb-1">Controle de Estresse</p>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold">{invertStress(calculateAverage("stress")).toFixed(0)}%</p>
                {getTrendIcon(-calculateTrend("stress"))}
              </div>
              {getStatusBadge(invertStress(calculateAverage("stress")))}
            </div>
          </div>

          {/* Chart */}
          <div className="h-80">
            <Line data={chartData} options={chartOptions} />
          </div>

          {/* AI Insights */}
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="h-5 w-5 text-primary" />
              <h4 className="font-semibold">Análise IA de Tendências</h4>
            </div>
            <div className="space-y-2 text-sm">
              {calculateTrend("mood") < -10 && (
                <div className="flex items-start gap-2">
                  <span className="text-red-600">⚠️</span>
                  <p>Queda significativa no humor detectada. Considere pausas adicionais e atividades relaxantes.</p>
                </div>
              )}
              {calculateAverage("sleep") < 50 && (
                <div className="flex items-start gap-2">
                  <span className="text-orange-600">⚠️</span>
                  <p>Qualidade de sono abaixo do ideal. Recomenda-se ajustar rotina de descanso.</p>
                </div>
              )}
              {calculateAverage("stress") > 70 && (
                <div className="flex items-start gap-2">
                  <span className="text-red-600">🚨</span>
                  <p className="font-semibold">Nível de estresse crítico. Contate o médico ou supervisor para suporte imediato.</p>
                </div>
              )}
              {calculateAverage("energy") < 40 && (
                <div className="flex items-start gap-2">
                  <span className="text-yellow-600">💡</span>
                  <p>Energia baixa persistente. Considere avaliação médica e possível rotação de turno.</p>
                </div>
              )}
              {calculateTrend("mood") > 10 && calculateAverage("sleep") > 70 && (
                <div className="flex items-start gap-2">
                  <span className="text-green-600">✅</span>
                  <p>Tendência positiva! Continue mantendo suas rotinas de bem-estar.</p>
                </div>
              )}
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg text-sm">
            <p className="text-blue-900 dark:text-blue-100">
              🔒 <strong>100% Privado:</strong> Seus dados são armazenados localmente e visíveis apenas para você. 
              RH recebe apenas alertas anônimos agregados sem identificação individual.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
