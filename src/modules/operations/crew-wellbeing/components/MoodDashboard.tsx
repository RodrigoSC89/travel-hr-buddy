/**
 * Mood Dashboard - Crew Wellbeing Tracking
 * REFACTORED: Uses useMoodDashboardData hook for real data
 */
import React from "react";
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
import { TrendingUp, TrendingDown, Heart, Brain, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useMoodDashboardData } from "@/hooks/useMoodDashboardData";

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

export const MoodDashboard = () => {
  const { entries, stats, trends, isLoading, error } = useMoodDashboardData();

  const getTrendIcon = (trend: number) => {
    if (trend > 5) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend < -5) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <span className="text-xs text-muted-foreground">Estável</span>;
  };

  const chartData = {
    labels: trends.map(d => {
      const date = new Date(d.date);
      return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
    }),
    datasets: [
      {
        label: "Humor",
        data: trends.map(d => d.avgMood * 20), // Scale 1-5 to 0-100
        borderColor: "hsl(var(--success))",
        backgroundColor: "hsl(var(--success) / 0.1)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Energia",
        data: trends.map(d => d.avgEnergy * 20),
        borderColor: "hsl(var(--primary))",
        backgroundColor: "hsl(var(--primary) / 0.1)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Estresse",
        data: trends.map(d => (5 - d.avgStress) * 20), // Invert: lower stress = higher score
        borderColor: "hsl(var(--warning))",
        backgroundColor: "hsl(var(--warning) / 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        ticks: {
          callback: (value: number | string) => `${value}%`,
        },
      },
    },
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Carregando dados de bem-estar...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        <Heart className="h-8 w-8 mx-auto mb-2" />
        <p>Erro ao carregar dados</p>
      </div>
    );
  }

  // Calculate trend values for display
  const moodTrend = stats?.trend === 'improving' ? 10 : stats?.trend === 'declining' ? -10 : 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Heart className="h-4 w-4 text-red-500" />
              Humor Médio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{((stats?.averageMood || 0) * 20).toFixed(0)}%</span>
              {getTrendIcon(moodTrend)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Brain className="h-4 w-4 text-blue-500" />
              Energia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{((stats?.averageEnergy || 0) * 20).toFixed(0)}%</span>
              <Badge variant={stats?.averageEnergy && stats.averageEnergy >= 3 ? "default" : "secondary"}>
                {stats?.averageEnergy && stats.averageEnergy >= 3 ? "Bom" : "Baixo"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Nível de Estresse</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{((5 - (stats?.averageStress || 3)) * 20).toFixed(0)}%</span>
              <Badge variant={stats?.averageStress && stats.averageStress <= 3 ? "default" : "destructive"}>
                {stats?.averageStress && stats.averageStress <= 3 ? "Controlado" : "Alto"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Registros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{stats?.totalEntries || 0}</span>
              <Badge variant="outline">
                {stats?.trend === 'improving' ? '↑ Melhorando' : 
                 stats?.trend === 'declining' ? '↓ Diminuindo' : '→ Estável'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Tendência de Bem-estar</CardTitle>
        </CardHeader>
        <CardContent>
          {trends.length > 0 ? (
            <Line data={chartData} options={chartOptions} />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhum dado de tendência disponível</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Common Factors */}
      {stats?.commonFactors && stats.commonFactors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Fatores Mais Comuns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {stats.commonFactors.map((factor, index) => (
                <Badge key={index} variant="secondary" className="px-3 py-1">
                  {factor.factor} ({factor.count})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Entries */}
      <Card>
        <CardHeader>
          <CardTitle>Registros Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {entries.slice(0, 5).map(entry => (
              <div 
                key={entry.id} 
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div>
                  <div className="font-medium">{entry.crew_member_name || 'Tripulante'}</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(entry.recorded_at).toLocaleDateString("pt-BR")}
                    {entry.vessel_name && ` • ${entry.vessel_name}`}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span>😊 {entry.mood_score}/5</span>
                  <span>⚡ {entry.energy_level}/5</span>
                  <span>😰 {entry.stress_level}/5</span>
                </div>
              </div>
            ))}
            {entries.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                Nenhum registro encontrado
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
