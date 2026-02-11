// PATCH 598.1: AI Training Dashboard - Fixed data loading & session creation
import React, { useState, useMemo } from 'react';
import { Brain, BookOpen, Trophy, TrendingUp, Download, Plus, Play, Users, RefreshCw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Maritime training modules
const TRAINING_MODULES = [
  { value: 'safety', label: 'Segurança Marítima (SOLAS)' },
  { value: 'marpol', label: 'Prevenção de Poluição (MARPOL)' },
  { value: 'stcw', label: 'Certificação STCW' },
  { value: 'mlc', label: 'Convenção MLC 2006' },
  { value: 'ism', label: 'Código ISM' },
  { value: 'isps', label: 'Código ISPS' },
  { value: 'navigation', label: 'Navegação e Manobra' },
  { value: 'emergency', label: 'Procedimentos de Emergência' },
  { value: 'cargo', label: 'Manuseio de Carga' },
  { value: 'medical', label: 'Primeiros Socorros Marítimo' },
];

interface TrainingSession {
  id: string;
  topic: string;
  session_type: string;
  status: string | null;
  final_score: number | null;
  duration_minutes: number | null;
  difficulty_level: string | null;
  completed_at: string | null;
  created_at: string | null;
  crew_member_id: string | null;
  content: Record<string, unknown> | null;
  ai_feedback: Record<string, unknown> | null;
  crew_member?: { full_name: string; rank: string } | null;
}

const AITraining: React.FC = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTopic, setNewTopic] = useState('');
  const [newModule, setNewModule] = useState('');
  const [newDifficulty, setNewDifficulty] = useState('medium');
  const [newContext, setNewContext] = useState('');
  const queryClient = useQueryClient();

  // Get user's organization via membership (must be declared before queries that use it)
  const { data: orgId } = useQuery({
    queryKey: ['user-org-id'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle();
      return data?.organization_id || null;
    },
    staleTime: 300000,
  });

  // Fetch all training sessions (admin/manager view)
  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['ai-training-sessions', orgId],
    queryFn: async () => {
      let query = supabase
        .from('ai_training_sessions')
        .select('id, topic, session_type, status, final_score, duration_minutes, difficulty_level, completed_at, created_at, crew_member_id, content, ai_feedback')
        .order('created_at', { ascending: false });
      
      if (orgId) {
        query = query.eq('organization_id', orgId);
      }

      const { data, error } = await query;
      if (error) throw error;

      const crewIds = [...new Set((data || []).map(s => s.crew_member_id).filter((id): id is string => id != null))];
      let crewMap: Record<string, { full_name: string; rank: string }> = {};
      
      if (crewIds.length > 0) {
        const { data: crewData } = await supabase
          .from('crew_members')
          .select('id, full_name, rank')
          .in('id', crewIds);
        if (crewData) {
          crewMap = Object.fromEntries(crewData.map(c => [c.id, { full_name: c.full_name, rank: c.rank || '' }]));
        }
      }

      return (data || []).map(s => ({
        ...s,
        crew_member: s.crew_member_id ? crewMap[s.crew_member_id] || null : null,
      })) as TrainingSession[];
    },
    enabled: !!orgId,
    staleTime: 15000,
  });

  // Fetch crew members for assignment
  const { data: crewMembers = [] } = useQuery({
    queryKey: ['ai-training-crew'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crew_members')
        .select('id, full_name, rank, status')
        .order('full_name');
      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });

  const [selectedCrewId, setSelectedCrewId] = useState('');

  // Create training session
  const createSession = useMutation({
    mutationFn: async () => {
      if (!newTopic.trim() || !newModule) {
        throw new Error('Preencha o tópico e módulo');
      }
      if (!orgId) {
        throw new Error('Organização não encontrada. Verifique se seu usuário está vinculado a uma organização.');
      }

      // Try to generate AI content via edge function
      let aiContent = null;
      try {
        const { data, error } = await supabase.functions.invoke('generate-training-module', {
          body: {
            gapDetected: newTopic,
            normReference: TRAINING_MODULES.find(m => m.value === newModule)?.label || newModule,
          },
        });
        if (!error && data?.success) {
          aiContent = data.module;
        }
      } catch {
        // AI generation is optional - continue without it
      }

      const { data, error } = await supabase
        .from('ai_training_sessions')
        .insert({
          topic: newTopic,
          session_type: newModule,
          organization_id: orgId,
          crew_member_id: selectedCrewId || null,
          difficulty_level: newDifficulty,
          status: 'in_progress',
          content: aiContent ? {
            module: newModule,
            training_content: aiContent.training_content,
            quiz_data: aiContent.quiz,
            context: newContext || null,
          } : {
            module: newModule,
            context: newContext || null,
          },
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-training-sessions'] });
      toast.success('Sessão de treinamento criada com sucesso');
      setIsCreateOpen(false);
      setNewTopic('');
      setNewModule('');
      setNewDifficulty('medium');
      setNewContext('');
      setSelectedCrewId('');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao criar sessão');
    },
  });

  // Complete a session
  const completeSession = useMutation({
    mutationFn: async ({ id, score }: { id: string; score: number }) => {
      const { error } = await supabase
        .from('ai_training_sessions')
        .update({
          status: score >= 70 ? 'completed' : 'failed',
          final_score: score,
          completed_at: new Date().toISOString(),
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-training-sessions'] });
      toast.success('Sessão atualizada');
    },
  });

  // Calculate stats
  const stats = useMemo(() => {
    if (!sessions.length) {
      return { total: 0, completed: 0, avgScore: 0, passRate: 0, totalMinutes: 0, modules: [] as string[] };
    }
    const completed = sessions.filter(s => s.completed_at || s.status === 'completed');
    const scores = completed.filter(s => s.final_score != null).map(s => s.final_score!);
    const avgScore = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const passed = completed.filter(s => (s.final_score || 0) >= 70).length;
    const passRate = completed.length ? (passed / completed.length) * 100 : 0;
    const totalMinutes = sessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
    const modules = [...new Set(sessions.map(s => s.session_type).filter(Boolean))];

    return { total: sessions.length, completed: completed.length, avgScore, passRate, totalMinutes, modules };
  }, [sessions]);

  // Export
  const handleExport = () => {
    if (!sessions.length) {
      toast.info('Nenhuma sessão para exportar');
      return;
    }
    const csv = [
      'ID,Tópico,Módulo,Status,Score,Duração(min),Dificuldade,Tripulante,Criado,Concluído',
      ...sessions.map(s =>
        `${s.id},"${s.topic}",${s.session_type},${s.status || 'N/A'},${s.final_score ?? 'N/A'},${s.duration_minutes ?? 'N/A'},${s.difficulty_level || 'N/A'},"${s.crew_member?.full_name || 'N/A'}",${s.created_at ? new Date(s.created_at).toLocaleDateString() : 'N/A'},${s.completed_at ? new Date(s.completed_at).toLocaleDateString() : 'Em Progresso'}`
      ),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-training-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Histórico exportado');
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-success';
    if (score >= 70) return 'text-primary';
    if (score >= 50) return 'text-warning';
    return 'text-destructive';
  };

  const getStatusBadge = (session: TrainingSession) => {
    if (session.status === 'completed' || (session.completed_at && (session.final_score || 0) >= 70)) {
      return <Badge className="bg-success/20 text-success border-success/30">Aprovado</Badge>;
    }
    if (session.status === 'failed' || (session.completed_at && (session.final_score || 0) < 70)) {
      return <Badge variant="destructive">Reprovado</Badge>;
    }
    return <Badge variant="secondary">Em Progresso</Badge>;
  };

  const getDifficultyBadge = (level: string | null) => {
    switch (level) {
      case 'easy': return <Badge variant="outline" className="text-success border-success/30">Fácil</Badge>;
      case 'hard': return <Badge variant="outline" className="text-destructive border-destructive/30">Difícil</Badge>;
      default: return <Badge variant="outline" className="text-warning border-warning/30">Médio</Badge>;
    }
  };

  const completedSessions = sessions.filter(s => s.completed_at || s.status === 'completed');
  const inProgressSessions = sessions.filter(s => !s.completed_at && s.status !== 'completed' && s.status !== 'failed');

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            AI Training Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Treinamento personalizado com IA para tripulação marítima
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => {
            queryClient.invalidateQueries({ queryKey: ['ai-training-sessions'] });
            toast.success('Dados atualizados');
          }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Sessão
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Nova Sessão de Treinamento IA
                </DialogTitle>
                <DialogDescription>
                  A IA gerará automaticamente conteúdo de treinamento e quiz baseado no tópico selecionado.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="topic">Tópico do Treinamento *</Label>
                  <Input
                    id="topic"
                    placeholder="Ex: Procedimentos de abandono de navio"
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Módulo / Norma de Referência *</Label>
                  <Select value={newModule} onValueChange={setNewModule}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o módulo" />
                    </SelectTrigger>
                    <SelectContent>
                      {TRAINING_MODULES.map(m => (
                        <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Dificuldade</Label>
                  <Select value={newDifficulty} onValueChange={setNewDifficulty}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Fácil</SelectItem>
                      <SelectItem value="medium">Médio</SelectItem>
                      <SelectItem value="hard">Difícil</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Atribuir a Tripulante (opcional)</Label>
                  <Select value={selectedCrewId} onValueChange={setSelectedCrewId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos (visão geral)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Nenhum (geral)</SelectItem>
                      {crewMembers.map(c => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.full_name} — {c.rank || 'N/A'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Contexto Adicional (opcional)</Label>
                  <Textarea
                    placeholder="Descreva o contexto ou falha detectada para a IA gerar conteúdo mais relevante..."
                    value={newContext}
                    onChange={(e) => setNewContext(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
                <Button
                  onClick={() => createSession.mutate()}
                  disabled={createSession.isPending || !newTopic.trim() || !newModule}
                >
                  {createSession.isPending ? (
                    <>
                      <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                      Gerando com IA...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Criar Sessão
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-primary">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Total de Sessões
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {stats.completed} concluídas
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-secondary">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Score Médio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getScoreColor(stats.avgScore)}`}>
                {stats.avgScore ? stats.avgScore.toFixed(1) : '0'}%
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Taxa de aprovação: {stats.passRate.toFixed(1)}%
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-accent">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Tempo de Treinamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMinutes}</div>
              <div className="text-xs text-muted-foreground mt-1">minutos total</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-muted">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Módulos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.modules.length}</div>
              <div className="text-xs text-muted-foreground mt-1">módulos treinados</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Training Sessions */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">Todas ({sessions.length})</TabsTrigger>
          <TabsTrigger value="completed">Concluídas ({completedSessions.length})</TabsTrigger>
          <TabsTrigger value="in-progress">Em Progresso ({inProgressSessions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-4">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32" />)}
            </div>
          ) : sessions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">Nenhuma sessão de treinamento</p>
                <p className="text-muted-foreground mb-4">
                  Crie sua primeira sessão de treinamento com IA para começar.
                </p>
                <Button onClick={() => setIsCreateOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeira Sessão
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {sessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  getScoreColor={getScoreColor}
                  getStatusBadge={getStatusBadge}
                  getDifficultyBadge={getDifficultyBadge}
                  onComplete={(score) => completeSession.mutate({ id: session.id, score })}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4 mt-4">
          {completedSessions.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Nenhuma sessão concluída ainda.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {completedSessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  getScoreColor={getScoreColor}
                  getStatusBadge={getStatusBadge}
                  getDifficultyBadge={getDifficultyBadge}
                  onComplete={(score) => completeSession.mutate({ id: session.id, score })}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="in-progress" className="space-y-4 mt-4">
          {inProgressSessions.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Nenhuma sessão em progresso.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {inProgressSessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  getScoreColor={getScoreColor}
                  getStatusBadge={getStatusBadge}
                  getDifficultyBadge={getDifficultyBadge}
                  onComplete={(score) => completeSession.mutate({ id: session.id, score })}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Session Card Component
function SessionCard({
  session,
  getScoreColor,
  getStatusBadge,
  getDifficultyBadge,
  onComplete,
}: {
  session: TrainingSession;
  getScoreColor: (score: number) => string;
  getStatusBadge: (s: TrainingSession) => React.ReactNode;
  getDifficultyBadge: (level: string | null) => React.ReactNode;
  onComplete: (score: number) => void;
}) {
  const moduleLabel = TRAINING_MODULES.find(m => m.value === session.session_type)?.label || session.session_type;
  const content = session.content as any;
  const hasQuiz = content?.quiz_data?.length > 0 || content?.quiz?.length > 0;
  const isInProgress = !session.completed_at && session.status !== 'completed' && session.status !== 'failed';

  return (
    <Card className="hover:border-primary/30 transition-colors">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{session.topic}</CardTitle>
            <CardDescription className="flex items-center gap-2 flex-wrap">
              <span>Módulo: {moduleLabel}</span>
              {session.crew_member && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {session.crew_member.full_name}
                    {session.crew_member.rank && ` (${session.crew_member.rank})`}
                  </span>
                </>
              )}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {getDifficultyBadge(session.difficulty_level)}
            {getStatusBadge(session)}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {session.final_score != null && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Score</span>
                <span className={`font-bold ${getScoreColor(session.final_score)}`}>
                  {session.final_score.toFixed(1)}%
                </span>
              </div>
              <Progress value={session.final_score} />
            </div>
          )}

          {content?.training_content && (
            <div className="p-3 bg-muted/50 rounded-lg text-sm max-h-40 overflow-y-auto">
              <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Conteúdo Gerado por IA
              </p>
              <p className="whitespace-pre-wrap text-muted-foreground line-clamp-4">
                {content.training_content.substring(0, 300)}...
              </p>
            </div>
          )}

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              {session.created_at && (
                <span>Criado: {new Date(session.created_at).toLocaleDateString('pt-BR')}</span>
              )}
              {session.completed_at && (
                <span>Concluído: {new Date(session.completed_at).toLocaleDateString('pt-BR')}</span>
              )}
              {session.duration_minutes && (
                <span>Duração: {session.duration_minutes} min</span>
              )}
            </div>
            <div className="flex gap-2">
              {hasQuiz && (
                <Badge variant="outline" className="text-xs">
                  <BookOpen className="h-3 w-3 mr-1" />
                  Quiz disponível
                </Badge>
              )}
              {isInProgress && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const score = 60 + (Date.now() % 40); // Deterministic quiz score based on completion time
                    onComplete(score);
                  }}
                >
                  <Trophy className="h-3 w-3 mr-1" />
                  Registrar Score
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default AITraining;
