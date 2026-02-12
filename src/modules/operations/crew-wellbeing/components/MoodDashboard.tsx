/**
 * Mood Dashboard - Crew Wellbeing Tracking
 * REFACTORED: Uses useMoodDashboardData hook for real data
 */
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Heart, Brain, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useMoodDashboardData } from "@/hooks/useMoodDashboardData";

export const MoodDashboard = () => {
  const { entries, stats, trends, isLoading, error } = useMoodDashboardData();

  const getTrendIcon = (trend: number) => {
    if (trend > 5) return <TrendingUp className="h-4 w-4 text-success" />;
    if (trend < -5) return <TrendingDown className="h-4 w-4 text-destructive" />;
    return <span className="text-xs text-muted-foreground">Estável</span>;
  };

  const chartData = trends.map(d => ({
    name: new Date(d.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }),
    humor: d.avgMood * 20,
    energia: d.avgEnergy * 20,
    estresse: (5 - d.avgStress) * 20,
  }));

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
      <div className="text-center py-8 text-destructive">
        <Heart className="h-8 w-8 mx-auto mb-2" />
        <p>Erro ao carregar dados</p>
      </div>
    );
  }

  const moodTrend = stats?.trend === 'improving' ? 10 : stats?.trend === 'declining' ? -10 : 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Heart className="h-4 w-4 text-destructive" />
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
              <Brain className="h-4 w-4 text-info" />
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
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <Tooltip formatter={(value: number) => `${value.toFixed(0)}%`} />
                <Legend />
                <Line type="monotone" dataKey="humor" stroke="hsl(var(--success))" name="Humor" strokeWidth={2} />
                <Line type="monotone" dataKey="energia" stroke="hsl(var(--primary))" name="Energia" strokeWidth={2} />
                <Line type="monotone" dataKey="estresse" stroke="hsl(var(--warning))" name="Estresse" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
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
              {stats.commonFactors.map((factor) => (
                <Badge key={factor.factor} variant="secondary" className="px-3 py-1">
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