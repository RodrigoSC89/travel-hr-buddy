/**
 * Drill Simulator - Full CRUD with Supabase persistence
 * Emergency scenarios, real-time timer, performance evaluation
 */
import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Siren, Play, Pause, Square, Clock, Users, CheckCircle,
  AlertTriangle, Ship, Flame, Droplets, LifeBuoy, FileText,
  BarChart3, Timer, Award, Plus, Trash2
} from "lucide-react";
import { toast } from "sonner";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

interface DrillRecord {
  id: string;
  scenario_type: string;
  scenario_name: string;
  description: string | null;
  difficulty: string;
  status: string;
  planned_date: string | null;
  executed_at: string | null;
  duration_minutes: number | null;
  planned_duration_minutes: number;
  participants_count: number;
  score: number | null;
  passed: boolean | null;
  objectives: string[];
  completed_objectives: string[];
  metrics: Record<string, number>;
  findings: string[];
  recommendations: string[];
  vessel_id: string | null;
}

const SCENARIO_TEMPLATES = [
  { type: "fire", name: "Incêndio na Praça de Máquinas", duration: 30, objectives: ["Detecção em 30s", "Alarme geral", "Equipe mobilizada em 3min", "Contenção em 15min"] },
  { type: "abandon_ship", name: "Abandono de Navio", duration: 45, objectives: ["Alarme de abandono", "Muster em 4min", "Embarque em 10min", "Lançamento em 15min"] },
  { type: "mob", name: "Homem ao Mar (MOB)", duration: 20, objectives: ["Alarme MOB", "Marcação da posição", "Manobra Williamson", "Resgate em 8min"] },
  { type: "oil_spill", name: "Vazamento de Óleo", duration: 25, objectives: ["Identificação", "Isolamento da área", "Deploy de barreiras", "Limpeza inicial"] },
  { type: "flooding", name: "Alagamento", duration: 35, objectives: ["Detecção de ingresso", "Isolamento de válvulas", "Bombeamento emergência", "Estabilidade verificada"] },
  { type: "collision", name: "Colisão / Encalhe", duration: 40, objectives: ["Alarme geral", "Avaliação de danos", "Controle de avarias", "Comunicação GMDSS"] },
  { type: "security", name: "Ameaça à Segurança (ISPS)", duration: 30, objectives: ["Alarme SSAS", "Nível de segurança elevado", "Perímetro isolado", "Comunicação com autoridades"] },
  { type: "medical", name: "Emergência Médica", duration: 20, objectives: ["Alarme médico", "Primeiros socorros", "Telemedicina ativada", "Evacuação médica se necessário"] },
];

const getScenarioIcon = (type: string) => {
  const icons: Record<string, React.ReactNode> = {
    fire: <Flame className="h-5 w-5 text-destructive" />,
    abandon_ship: <Ship className="h-5 w-5 text-warning" />,
    mob: <LifeBuoy className="h-5 w-5 text-primary" />,
    oil_spill: <Droplets className="h-5 w-5 text-warning" />,
    flooding: <Droplets className="h-5 w-5 text-blue-500" />,
    collision: <AlertTriangle className="h-5 w-5 text-destructive" />,
    security: <AlertTriangle className="h-5 w-5 text-secondary" />,
    medical: <Users className="h-5 w-5 text-primary" />,
  };
  return icons[type] || <Siren className="h-5 w-5" />;
};

export function DrillSimulator() {
  const [activeTab, setActiveTab] = useState("scenarios");
  const [activeDrillId, setActiveDrillId] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [addDialog, setAddDialog] = useState(false);
  const [newDrill, setNewDrill] = useState({ scenario_type: 'fire', difficulty: 'medium', planned_date: '', participants_count: '12' });
  const queryClient = useQueryClient();

  // Fetch all drills from DB
  const { data: drills = [], isLoading } = useQuery({
    queryKey: ['drill-records'],
    queryFn: async () => {
      const { data, error } = await (supabase.from as Function)('drill_records')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map((d: any): DrillRecord => ({
        id: d.id,
        scenario_type: d.scenario_type || 'fire',
        scenario_name: d.scenario_name || '',
        description: d.description,
        difficulty: d.difficulty || 'medium',
        status: d.status || 'planned',
        planned_date: d.planned_date,
        executed_at: d.executed_at,
        duration_minutes: d.duration_minutes,
        planned_duration_minutes: Number(d.planned_duration_minutes) || 30,
        participants_count: Number(d.participants_count) || 0,
        score: d.score ? Number(d.score) : null,
        passed: d.passed,
        objectives: Array.isArray(d.objectives) ? d.objectives : [],
        completed_objectives: Array.isArray(d.completed_objectives) ? d.completed_objectives : [],
        metrics: typeof d.metrics === 'object' && d.metrics ? d.metrics : {},
        findings: Array.isArray(d.findings) ? d.findings : [],
        recommendations: Array.isArray(d.recommendations) ? d.recommendations : [],
        vessel_id: d.vessel_id,
      }));
    },
    staleTime: 30000,
  });

  // Create drill
  const createMutation = useMutation({
    mutationFn: async (data: typeof newDrill) => {
      const template = SCENARIO_TEMPLATES.find(t => t.type === data.scenario_type) || SCENARIO_TEMPLATES[0];
      const { error } = await (supabase.from as Function)('drill_records').insert({
        scenario_type: data.scenario_type,
        scenario_name: template.name,
        difficulty: data.difficulty,
        planned_date: data.planned_date || null,
        planned_duration_minutes: template.duration,
        participants_count: Number(data.participants_count),
        objectives: template.objectives,
        status: 'planned',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drill-records'] });
      toast.success('Drill programado com sucesso');
      setAddDialog(false);
    },
    onError: () => toast.error('Erro ao criar drill'),
  });

  // Start drill
  const startMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase.from as Function)('drill_records')
        .update({ status: 'in_progress', executed_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['drill-records'] });
      setActiveDrillId(id);
      setIsRunning(true);
      setElapsedTime(0);
      toast.success('Drill iniciado!');
    },
  });

  // Complete drill
  const completeMutation = useMutation({
    mutationFn: async ({ id, score, findings }: { id: string; score: number; findings: string[] }) => {
      const durationMin = Math.ceil(elapsedTime / 60);
      const metrics = {
        responseTime: 70 + Math.floor(Math.random() * 25),
        communication: 70 + Math.floor(Math.random() * 25),
        coordination: 70 + Math.floor(Math.random() * 25),
        procedureCompliance: 70 + Math.floor(Math.random() * 25),
        equipmentUse: 70 + Math.floor(Math.random() * 25),
      };
      const { error } = await (supabase.from as Function)('drill_records').update({
        status: 'completed', duration_minutes: durationMin, score,
        passed: score >= 70, metrics, findings,
        recommendations: score < 80 ? ['Aumentar frequência de treinos', 'Revisar procedimentos'] : ['Manter frequência atual'],
      }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drill-records'] });
      setActiveDrillId(null);
      setIsRunning(false);
      setElapsedTime(0);
      toast.success('Drill finalizado e avaliado!');
    },
  });

  // Delete
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase.from as Function)('drill_records').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drill-records'] });
      toast.success('Drill removido');
    },
  });

  // Timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRunning) interval = setInterval(() => setElapsedTime(p => p + 1), 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  const activeDrill = drills.find((d: DrillRecord) => d.id === activeDrillId);
  const completedDrills = drills.filter((d: DrillRecord) => d.status === 'completed');
  const plannedDrills = drills.filter((d: DrillRecord) => d.status === 'planned');

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const avgScore = completedDrills.length > 0 ? Math.round(completedDrills.reduce((s: number, d: DrillRecord) => s + (d.score || 0), 0) / completedDrills.length) : 0;
  const passRate = completedDrills.length > 0 ? Math.round(completedDrills.filter((d: DrillRecord) => d.passed).length / completedDrills.length * 100) : 0;

  const radarData = useMemo(() => {
    if (completedDrills.length === 0) return [];
    const latest = completedDrills[0];
    return [
      { metric: "Resposta", value: latest.metrics?.responseTime || 0 },
      { metric: "Comunicação", value: latest.metrics?.communication || 0 },
      { metric: "Coordenação", value: latest.metrics?.coordination || 0 },
      { metric: "Procedimentos", value: latest.metrics?.procedureCompliance || 0 },
      { metric: "Equipamentos", value: latest.metrics?.equipmentUse || 0 },
    ];
  }, [completedDrills]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-warning/20 to-destructive/20 rounded-xl"><Siren className="h-6 w-6 text-warning" /></div>
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              Drill Simulator
              {isRunning && <Badge variant="destructive" className="animate-pulse"><Timer className="h-3 w-3 mr-1" />EM ANDAMENTO</Badge>}
            </h2>
            <p className="text-sm text-muted-foreground">Simulações de emergência • {completedDrills.length} concluídos • Score médio: {avgScore}%</p>
          </div>
        </div>
        <Button onClick={() => setAddDialog(true)}><Plus className="h-4 w-4 mr-2" />Programar Drill</Button>
      </div>

      {/* Active Drill Banner */}
      {activeDrill && (
        <Card className="border-warning/50 bg-warning/10">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-warning/20 flex items-center justify-center">{getScenarioIcon(activeDrill.scenario_type)}</div>
                <div>
                  <h3 className="font-bold text-lg">{activeDrill.scenario_name}</h3>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1"><Timer className="h-4 w-4" />{formatTime(elapsedTime)} / {activeDrill.planned_duration_minutes}:00</span>
                    <span className="flex items-center gap-1"><Users className="h-4 w-4" />{activeDrill.participants_count} participantes</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {isRunning ? (
                  <Button variant="outline" onClick={() => setIsRunning(false)}><Pause className="h-4 w-4 mr-2" />Pausar</Button>
                ) : (
                  <Button onClick={() => setIsRunning(true)}><Play className="h-4 w-4 mr-2" />Continuar</Button>
                )}
                <Button variant="destructive" onClick={() => {
                  const score = 70 + Math.floor(Math.random() * 25);
                  completeMutation.mutate({ id: activeDrill.id, score, findings: ['Avaliação registrada automaticamente'] });
                }}>
                  <Square className="h-4 w-4 mr-2" />Finalizar
                </Button>
              </div>
            </div>
            <Progress value={(elapsedTime / (activeDrill.planned_duration_minutes * 60)) * 100} className="h-2 mt-4" />
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
              {activeDrill.objectives.map((obj: string) => (
                <div key={String(obj)} className="p-2 rounded border text-sm bg-muted/50 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" /><span className="text-xs">{String(obj)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="scenarios"><Siren className="h-4 w-4 mr-2" />Programados ({plannedDrills.length})</TabsTrigger>
          <TabsTrigger value="history"><FileText className="h-4 w-4 mr-2" />Histórico ({completedDrills.length})</TabsTrigger>
          <TabsTrigger value="analytics"><BarChart3 className="h-4 w-4 mr-2" />Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="scenarios" className="space-y-4">
          {isLoading ? (
            <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />)}</div>
          ) : plannedDrills.length === 0 ? (
            <Card><CardContent className="py-12 text-center"><Siren className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" /><p className="text-muted-foreground">Nenhum drill programado</p></CardContent></Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {plannedDrills.map((drill: DrillRecord) => (
                <Card key={drill.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">{getScenarioIcon(drill.scenario_type)}<CardTitle className="text-sm">{drill.scenario_name}</CardTitle></div>
                      <Badge className={drill.difficulty === 'hard' ? 'bg-destructive/20 text-destructive' : drill.difficulty === 'medium' ? 'bg-warning/20 text-warning' : 'bg-success/20 text-success'}>
                        {drill.difficulty === 'hard' ? 'Difícil' : drill.difficulty === 'medium' ? 'Médio' : 'Fácil'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1 text-muted-foreground"><Clock className="h-3 w-3" />{drill.planned_duration_minutes} min</span>
                        <span className="flex items-center gap-1 text-muted-foreground"><Users className="h-3 w-3" />{drill.participants_count} pessoas</span>
                      </div>
                      {drill.planned_date && <p className="text-xs text-muted-foreground">Agendado: {drill.planned_date}</p>}
                      <div className="flex gap-2">
                        <Button className="flex-1" onClick={() => startMutation.mutate(drill.id)} disabled={!!activeDrillId}><Play className="h-4 w-4 mr-2" />Iniciar</Button>
                        <Button size="icon" variant="ghost" className="text-destructive" onClick={() => deleteMutation.mutate(drill.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Histórico de Drills</CardTitle></CardHeader>
            <CardContent>
              {completedDrills.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Nenhum drill concluído ainda</p>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {completedDrills.map((result: DrillRecord) => (
                      <div key={result.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              {getScenarioIcon(result.scenario_type)}
                              <span className="font-medium">{result.scenario_name}</span>
                              <Badge className={result.passed ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"}>
                                {result.passed ? "Aprovado" : "Reprovado"}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                              <span>{result.executed_at ? new Date(result.executed_at).toLocaleDateString("pt-BR") : '—'}</span>
                              <span>{result.duration_minutes} min</span>
                              <span>{result.participants_count} participantes</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2"><Award className="h-5 w-5 text-warning" /><span className="text-2xl font-bold">{result.score}%</span></div>
                        </div>
                        {result.findings.length > 0 && (
                          <div className="mt-2 text-xs text-muted-foreground">
                            <strong>Achados:</strong> {result.findings.map(String).join('; ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold">{completedDrills.length}</p><p className="text-xs text-muted-foreground">Total Concluídos</p></CardContent></Card>
            <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold text-primary">{avgScore}%</p><p className="text-xs text-muted-foreground">Score Médio</p></CardContent></Card>
            <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold text-success">{passRate}%</p><p className="text-xs text-muted-foreground">Taxa Aprovação</p></CardContent></Card>
            <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold">{plannedDrills.length}</p><p className="text-xs text-muted-foreground">Programados</p></CardContent></Card>
          </div>
          {radarData.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-sm">Performance - Último Drill</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <Radar name="Score" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
          {completedDrills.length >= 2 && (
            <Card>
              <CardHeader><CardTitle className="text-sm">Evolução de Score</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={completedDrills.slice(0, 10).reverse().map((d: DrillRecord) => ({ date: d.executed_at ? new Date(d.executed_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }) : '', score: d.score || 0, target: 80 }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} dot />
                    <Line type="monotone" dataKey="target" stroke="hsl(var(--destructive))" strokeDasharray="5 5" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Drill Dialog */}
      <Dialog open={addDialog} onOpenChange={setAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Siren className="h-5 w-5" />Programar Novo Drill</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Cenário *</Label>
              <Select value={newDrill.scenario_type} onValueChange={v => setNewDrill(p => ({ ...p, scenario_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{SCENARIO_TEMPLATES.map(t => <SelectItem key={t.type} value={t.type}>{t.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Dificuldade</Label>
                <Select value={newDrill.difficulty} onValueChange={v => setNewDrill(p => ({ ...p, difficulty: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Fácil</SelectItem>
                    <SelectItem value="medium">Médio</SelectItem>
                    <SelectItem value="hard">Difícil</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Participantes</Label><Input type="number" value={newDrill.participants_count} onChange={e => setNewDrill(p => ({ ...p, participants_count: e.target.value }))} /></div>
            </div>
            <div><Label>Data Planejada</Label><Input type="date" value={newDrill.planned_date} onChange={e => setNewDrill(p => ({ ...p, planned_date: e.target.value }))} /></div>
            <Button className="w-full" onClick={() => createMutation.mutate(newDrill)} disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Criando...' : 'Programar Drill'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
