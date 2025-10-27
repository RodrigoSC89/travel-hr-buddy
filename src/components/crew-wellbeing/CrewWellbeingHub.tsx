import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Heart, Activity, Brain, TrendingUp } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function CrewWellbeingHub() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [sleepHours, setSleepHours] = useState<number>(7);
  const [moodScore, setMoodScore] = useState<number[]>([7]);
  const [heartRate, setHeartRate] = useState<number>(70);
  const [stressLevel, setStressLevel] = useState<number[]>([5]);
  const [fatigueLevel, setFatigueLevel] = useState<number[]>([5]);
  const [notes, setNotes] = useState("");

  const { data: metrics, isLoading } = useQuery({
    queryKey: ["crew-health-metrics"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("crew_health_metrics")
        .select("*")
        .eq("crew_member_id", user.id)
        .order("metric_date", { ascending: false })
        .limit(30);
      if (error) throw error;
      return data;
    },
  });

  const createMetricMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("crew_health_metrics")
        .insert({
          crew_member_id: user.id,
          sleep_hours: sleepHours,
          mood_score: moodScore[0],
          heart_rate: heartRate,
          stress_level: stressLevel[0],
          fatigue_level: fatigueLevel[0],
          notes: notes,
          anomaly_detected: heartRate > 100 || sleepHours < 5 || stressLevel[0] >= 8,
        } as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crew-health-metrics"] });
      toast({
        title: "Registro de saúde salvo",
        description: "Seus dados de saúde foram registrados com sucesso.",
      });
      setIsDialogOpen(false);
      setNotes("");
    },
  });

  const chartData = metrics?.slice(0, 10).reverse().map((m) => ({
    date: m.metric_date ? new Date(m.metric_date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }) : "",
    mood: m.mood_score,
    stress: m.stress_level,
    sleep: m.sleep_hours,
  }));

  const latestMetric = metrics?.[0];
  const avgMood = (metrics && metrics.length > 0) ? metrics.reduce((acc, m) => acc + (m.mood_score || 0), 0) / metrics.length : 0;
  const avgSleep = (metrics && metrics.length > 0) ? metrics.reduce((acc, m) => acc + Number(m.sleep_hours || 0), 0) / metrics.length : 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">Crew Wellbeing</h1>
          <p className="text-muted-foreground mt-2">
            Monitoramento de Saúde Física e Psicológica
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Registrar Métricas
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Registro de Saúde Diário</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Horas de Sono</label>
                <Input
                  type="number"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(Number(e.target.value))}
                  min={0}
                  max={24}
                  step={0.5}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Humor (1-10)</label>
                <Slider
                  value={moodScore}
                  onValueChange={setMoodScore}
                  min={1}
                  max={10}
                  step={1}
                />
                <p className="text-sm text-muted-foreground mt-1">Valor: {moodScore[0]}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Batimento Cardíaco (bpm)</label>
                <Input
                  type="number"
                  value={heartRate}
                  onChange={(e) => setHeartRate(Number(e.target.value))}
                  min={40}
                  max={200}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Nível de Estresse (1-10)</label>
                <Slider
                  value={stressLevel}
                  onValueChange={setStressLevel}
                  min={1}
                  max={10}
                  step={1}
                />
                <p className="text-sm text-muted-foreground mt-1">Valor: {stressLevel[0]}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Fadiga (1-10)</label>
                <Slider
                  value={fatigueLevel}
                  onValueChange={setFatigueLevel}
                  min={1}
                  max={10}
                  step={1}
                />
                <p className="text-sm text-muted-foreground mt-1">Valor: {fatigueLevel[0]}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Observações</label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Adicione observações adicionais..."
                  rows={3}
                />
              </div>
              <Button
                onClick={() => createMetricMutation.mutate()}
                disabled={createMetricMutation.isPending}
                className="w-full"
              >
                {createMetricMutation.isPending ? "Salvando..." : "Salvar Registro"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="h-5 w-5 text-rose-500" />
            <span className="text-sm font-medium">Último Registro</span>
          </div>
          <p className="text-2xl font-bold">{latestMetric?.heart_rate || "-"} bpm</p>
          <p className="text-xs text-muted-foreground">Batimento Cardíaco</p>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="h-5 w-5 text-purple-500" />
            <span className="text-sm font-medium">Humor Médio</span>
          </div>
          <p className="text-2xl font-bold">{avgMood.toFixed(1)}/10</p>
          <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-5 w-5 text-blue-500" />
            <span className="text-sm font-medium">Sono Médio</span>
          </div>
          <p className="text-2xl font-bold">{avgSleep.toFixed(1)}h</p>
          <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            <span className="text-sm font-medium">Status</span>
          </div>
          <Badge variant={latestMetric?.anomaly_detected ? "destructive" : "default"}>
            {latestMetric?.anomaly_detected ? "Atenção" : "Saudável"}
          </Badge>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="font-semibold text-lg mb-4">Evolução de Saúde (Últimos 10 dias)</h2>
        {isLoading ? (
          <div className="text-center py-12">Carregando dados...</div>
        ) : chartData && chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="mood" stroke="#8b5cf6" name="Humor" />
              <Line type="monotone" dataKey="stress" stroke="#ef4444" name="Estresse" />
              <Line type="monotone" dataKey="sleep" stroke="#3b82f6" name="Sono (h)" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            Sem dados suficientes para exibir o gráfico
          </div>
        )}
      </Card>
    </div>
  );
}
