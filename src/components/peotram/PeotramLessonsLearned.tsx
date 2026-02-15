/**
 * PEOTRAM Lessons Learned Module
 * Captures, categorizes and shares lessons learned from audits, incidents and operations
 * Connected to Supabase for real persistence
 */
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Lightbulb, BookOpen, AlertTriangle, CheckCircle, TrendingUp,
  Ship, Calendar, Tag, Users, ArrowRight, Plus, Loader2
} from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  description: string;
  source: string;
  element: string;
  elementName: string;
  severity: string;
  dateIdentified: string;
  vessel: string;
  actionTaken: string;
  benefit: string;
  sharedWith: string[];
  status: string;
}

const sourceLabels: Record<string, string> = {
  audit: 'Auditoria', incident: 'Incidente', near_miss: 'Quase-Acidente', operation: 'Operação', drill: 'Exercício',
};

const sourceColors: Record<string, string> = {
  audit: 'bg-primary/10 text-primary border-primary/30',
  incident: 'bg-destructive/10 text-destructive border-destructive/30',
  near_miss: 'bg-warning/10 text-warning border-warning/30',
  operation: 'bg-muted text-foreground border-border',
  drill: 'bg-success/10 text-success border-success/30',
};

const severityBorders: Record<string, string> = {
  info: '', warning: 'border-l-4 border-l-warning', critical: 'border-l-4 border-l-destructive',
};

const statusBadge: Record<string, string> = {
  new: 'bg-primary/10 text-primary border-primary/30',
  implemented: 'bg-success/10 text-success border-success/30',
  shared: 'bg-primary/10 text-primary border-primary/30',
};

export function PeotramLessonsLearned() {
  const [filter, setFilter] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [newLesson, setNewLesson] = useState({ title: '', description: '', source: 'audit', element: '', severity: 'info', vessel: '', actionTaken: '', benefit: '' });
  const queryClient = useQueryClient();

  const { data: lessons = [], isLoading } = useQuery({
    queryKey: ['peotram-lessons-learned'],
    queryFn: async () => {
      const { data, error } = await (supabase.from as Function)('peotram_lessons_learned')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map((r: Record<string, unknown>) => ({
        id: String(r.id),
        title: String(r.title || ''),
        description: String(r.description || ''),
        source: String(r.source || 'operation'),
        element: String(r.element_code || ''),
        elementName: String(r.element_name || ''),
        severity: String(r.severity || 'info'),
        dateIdentified: String(r.date_identified || r.created_at || ''),
        vessel: String(r.vessel_name || ''),
        actionTaken: String(r.action_taken || ''),
        benefit: String(r.benefit || ''),
        sharedWith: Array.isArray(r.shared_with) ? (r.shared_with as string[]) : [],
        status: String(r.status || 'new'),
      })) as Lesson[];
    },
  });

  const addMutation = useMutation({
    mutationFn: async (lesson: typeof newLesson) => {
      const { error } = await (supabase.from as Function)('peotram_lessons_learned')
        .insert({
          title: lesson.title,
          description: lesson.description,
          source: lesson.source,
          element_code: lesson.element,
          severity: lesson.severity,
          vessel_name: lesson.vessel,
          action_taken: lesson.actionTaken,
          benefit: lesson.benefit,
          status: 'new',
          date_identified: new Date().toISOString(),
        } as never);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['peotram-lessons-learned'] });
      toast.success('Lição registrada com sucesso');
      setShowForm(false);
      setNewLesson({ title: '', description: '', source: 'audit', element: '', severity: 'info', vessel: '', actionTaken: '', benefit: '' });
    },
    onError: () => toast.error('Erro ao registrar lição'),
  });

  const shareMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase.from as Function)('peotram_lessons_learned')
        .update({ status: 'shared' } as never)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['peotram-lessons-learned'] });
      toast.success('Lição compartilhada com a frota');
    },
  });

  const filtered = filter === 'all' ? lessons : lessons.filter(l => l.source === filter);

  return (
    <div className="space-y-4">
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Lightbulb className="h-5 w-5 text-warning" />
                Lições Aprendidas PEOTRAM
              </CardTitle>
              <CardDescription>Captura e compartilhamento de aprendizados de auditorias, incidentes e operações</CardDescription>
            </div>
            <Button size="sm" onClick={() => setShowForm(!showForm)} className="gap-1">
              <Plus className="h-4 w-4" /> Nova Lição
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Add Form */}
      {showForm && (
        <Card className="border-primary/30">
          <CardContent className="pt-4 space-y-3">
            <Input placeholder="Título da lição" value={newLesson.title} onChange={e => setNewLesson(p => ({ ...p, title: e.target.value }))} />
            <Textarea placeholder="Descrição detalhada" value={newLesson.description} onChange={e => setNewLesson(p => ({ ...p, description: e.target.value }))} />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Select value={newLesson.source} onValueChange={v => setNewLesson(p => ({ ...p, source: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(sourceLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={newLesson.severity} onValueChange={v => setNewLesson(p => ({ ...p, severity: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="critical">Crítico</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="Embarcação" value={newLesson.vessel} onChange={e => setNewLesson(p => ({ ...p, vessel: e.target.value }))} />
              <Input placeholder="Elemento (ex: E4-OP)" value={newLesson.element} onChange={e => setNewLesson(p => ({ ...p, element: e.target.value }))} />
            </div>
            <Textarea placeholder="Ação tomada" value={newLesson.actionTaken} onChange={e => setNewLesson(p => ({ ...p, actionTaken: e.target.value }))} />
            <Textarea placeholder="Benefício obtido" value={newLesson.benefit} onChange={e => setNewLesson(p => ({ ...p, benefit: e.target.value }))} />
            <Button onClick={() => addMutation.mutate(newLesson)} disabled={!newLesson.title || addMutation.isPending}>
              {addMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Registrar Lição
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="pt-4 pb-3"><p className="text-xs text-muted-foreground">Total</p><p className="text-2xl font-bold">{lessons.length}</p></CardContent></Card>
        <Card><CardContent className="pt-4 pb-3"><p className="text-xs text-muted-foreground">Implementadas</p><p className="text-2xl font-bold text-success">{lessons.filter(l => l.status !== 'new').length}</p></CardContent></Card>
        <Card><CardContent className="pt-4 pb-3"><p className="text-xs text-muted-foreground">Compartilhadas</p><p className="text-2xl font-bold text-primary">{lessons.filter(l => l.status === 'shared').length}</p></CardContent></Card>
        <Card><CardContent className="pt-4 pb-3"><p className="text-xs text-muted-foreground">Críticas</p><p className="text-2xl font-bold text-destructive">{lessons.filter(l => l.severity === 'critical').length}</p></CardContent></Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button variant={filter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('all')}>Todos</Button>
        {Object.entries(sourceLabels).map(([key, label]) => (
          <Button key={key} variant={filter === key ? 'default' : 'outline'} size="sm" onClick={() => setFilter(key)}>{label}</Button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="pt-8 pb-8 text-center text-muted-foreground">Nenhuma lição registrada. Clique em "Nova Lição" para começar.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(lesson => (
            <Card key={lesson.id} className={`hover:shadow-md transition-shadow ${severityBorders[lesson.severity] || ''}`}>
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <Lightbulb className={`h-5 w-5 mt-0.5 shrink-0 ${lesson.severity === 'critical' ? 'text-destructive' : lesson.severity === 'warning' ? 'text-warning' : 'text-primary'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-semibold text-sm">{lesson.title}</p>
                      <Badge variant="outline" className={sourceColors[lesson.source] || ''}>{sourceLabels[lesson.source] || lesson.source}</Badge>
                      {lesson.elementName && <Badge variant="outline" className="text-[10px]">{lesson.elementName}</Badge>}
                      <Badge variant="outline" className={statusBadge[lesson.status] || ''}>
                        {lesson.status === 'new' ? 'Nova' : lesson.status === 'implemented' ? 'Implementada' : 'Compartilhada'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">{lesson.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {lesson.actionTaken && (
                        <div className="bg-muted/30 rounded-lg p-2.5">
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-1">Ação Tomada</p>
                          <p className="text-xs">{lesson.actionTaken}</p>
                        </div>
                      )}
                      {lesson.benefit && (
                        <div className="bg-success/5 rounded-lg p-2.5 border border-success/10">
                          <p className="text-[10px] font-semibold text-success uppercase mb-1">Benefício</p>
                          <p className="text-xs">{lesson.benefit}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                      {lesson.vessel && <span className="flex items-center gap-1"><Ship className="h-3 w-3" />{lesson.vessel}</span>}
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(lesson.dateIdentified).toLocaleDateString('pt-BR')}</span>
                      {lesson.status !== 'shared' && (
                        <Button size="sm" variant="ghost" className="h-6 text-xs gap-1" onClick={() => shareMutation.mutate(lesson.id)}>
                          <Users className="h-3 w-3" /> Compartilhar
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
