/**
 * Maintenance Gantt Calendar - Premium Component
 * WORLD-CLASS: Visual planning with Gantt + Calendar views
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Calendar, ChevronLeft, ChevronRight, Plus,
  Wrench, AlertTriangle, CheckCircle, Clock,
  Ship, Anchor, Settings, Filter, Download,
  Brain, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface MaintenanceTask {
  id: string;
  name: string;
  vessel: string;
  startDate: Date;
  endDate: Date;
  progress: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'critical';
  type: 'preventive' | 'corrective' | 'survey' | 'drydock';
}

const STATUS_COLORS = {
  scheduled: 'bg-info',
  in_progress: 'bg-warning',
  completed: 'bg-success',
  overdue: 'bg-destructive',
};

const TYPE_LABELS = {
  preventive: 'Preventiva',
  corrective: 'Corretiva',
  survey: 'Vistoria',
  drydock: 'Drydock',
};

export function MaintenanceGanttCalendar() {
  const [view, setView] = useState<'gantt' | 'calendar'>('gantt');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Fetch maintenance data
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['maintenance-tasks'],
    queryFn: async () => {
      const { data: vessels, error } = await supabase
        .from('vessels')
        .select('id, name, status, updated_at')
        .limit(10);
      
      if (error) throw error;
      
      return (vessels || []).flatMap((vessel, idx) => {
        const baseDate = new Date();
        return [
          {
            id: `${vessel.id}-prev`,
            name: `Manutenção Preventiva - ${vessel.name}`,
            vessel: vessel.name,
            startDate: new Date(baseDate.getTime() + idx * 7 * 24 * 60 * 60 * 1000),
            endDate: new Date(baseDate.getTime() + (idx * 7 + 3) * 24 * 60 * 60 * 1000),
            progress: [0, 25, 75, 100, 50, 10, 90][idx % 7],
            status: ['scheduled', 'in_progress', 'completed', 'overdue'][idx % 4] as MaintenanceTask['status'],
            priority: ['low', 'medium', 'high', 'critical'][idx % 4] as MaintenanceTask['priority'],
            type: 'preventive' as const,
          },
          {
            id: `${vessel.id}-survey`,
            name: `Vistoria de Classe - ${vessel.name}`,
            vessel: vessel.name,
            startDate: new Date(baseDate.getTime() + (idx * 7 + 10) * 24 * 60 * 60 * 1000),
            endDate: new Date(baseDate.getTime() + (idx * 7 + 12) * 24 * 60 * 60 * 1000),
            progress: 0,
            status: 'scheduled' as const,
            priority: 'high' as MaintenanceTask['priority'],
            type: 'survey' as const,
          },
        ];
      });
    },
  });

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  
  const getMonthDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];
    for (let i = 0; i < firstDay.getDay(); i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d));
    return days;
  };

  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => {
      const taskStart = new Date(task.startDate);
      const taskEnd = new Date(task.endDate);
      return date >= taskStart && date <= taskEnd;
    });
  };

  const runAIAnalysis = async () => {
    setIsAnalyzing(true);
    setAiAnalysis(null);
    try {
      const summary = tasks.map(t => `${t.name} | Tipo: ${t.type} | Status: ${t.status} | Prioridade: ${t.priority} | Progresso: ${t.progress}%`).join('\n');
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          agentId: 'nauti-brain',
          messages: [{
            role: 'user',
            content: `Analise o planejamento de manutenção marítima abaixo. Forneça: 1) Priorização preditiva de tarefas, 2) Riscos de atraso, 3) Otimização de cronograma, 4) Recomendações de manutenção preventiva vs corretiva. Responda em PT-BR.\n\nTarefas:\n${summary}`
          }]
        }
      });
      if (error) throw error;
      setAiAnalysis(data?.choices?.[0]?.message?.content || data?.message || 'Análise concluída.');
      toast.success('Análise AI de manutenção concluída');
    } catch {
      toast.error('Erro na análise AI de manutenção');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const GanttView = () => {
    const today = new Date();
    const dayWidth = 40;
    const totalDays = 30;
    
    return (
      <div className="overflow-x-auto">
        <div className="flex border-b sticky top-0 bg-background z-10">
          <div className="w-64 p-3 border-r font-medium flex-shrink-0">Tarefa</div>
          <div className="flex">
            {Array.from({ length: totalDays }, (_, i) => {
              const date = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
              const isWeekend = date.getDay() === 0 || date.getDay() === 6;
              return (
                <div key={`day-${date.toISOString().slice(0,10)}`} className={`flex-shrink-0 text-center text-xs p-2 border-r ${isWeekend ? 'bg-muted/50' : ''}`} style={{ width: dayWidth }}>
                  <div className="font-medium">{date.getDate()}</div>
                  <div className="text-muted-foreground">{weekDays[date.getDay()]}</div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="divide-y">
          {tasks.map(task => {
            const startOffset = Math.max(0, Math.floor((task.startDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000)));
            const duration = Math.ceil((task.endDate.getTime() - task.startDate.getTime()) / (24 * 60 * 60 * 1000)) + 1;
            return (
              <div key={task.id} className="flex hover:bg-muted/30">
                <div className="w-64 p-3 border-r flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <Ship className="h-4 w-4 text-primary" />
                    <div>
                      <div className="text-sm font-medium truncate">{task.name}</div>
                      <div className="text-xs text-muted-foreground">{task.vessel}</div>
                    </div>
                  </div>
                </div>
                <div className="relative flex-1 py-2" style={{ minWidth: totalDays * dayWidth }}>
                  <div
                    className={`absolute h-8 rounded flex items-center px-2 text-white text-xs ${STATUS_COLORS[task.status]}`}
                    style={{ left: startOffset * dayWidth + 4, width: Math.max(duration * dayWidth - 8, 60) }}
                  >
                    <span className="truncate">{TYPE_LABELS[task.type]}</span>
                    {task.status === 'in_progress' && <span className="ml-auto">{task.progress}%</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const CalendarView = () => {
    const days = getMonthDays();
    return (
      <div>
        <div className="grid grid-cols-7 mb-2">
          {weekDays.map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((date, idx) => {
            const dayTasks = date ? getTasksForDate(date) : [];
            const isToday = date?.toDateString() === new Date().toDateString();
            return (
              <div key={date ? date.toISOString() : `empty-${idx}`} className={`min-h-24 p-1 border rounded-lg ${date ? 'hover:border-primary/50' : 'bg-muted/30'} ${isToday ? 'border-primary bg-primary/5' : ''}`}>
                {date && (
                  <>
                    <div className={`text-sm font-medium mb-1 ${isToday ? 'text-primary' : ''}`}>{date.getDate()}</div>
                    <div className="space-y-1">
                      {dayTasks.slice(0, 3).map(task => (
                        <div key={task.id} className={`text-xs p-1 rounded truncate text-white ${STATUS_COLORS[task.status]}`}>
                          {task.name.substring(0, 15)}...
                        </div>
                      ))}
                      {dayTasks.length > 3 && <div className="text-xs text-muted-foreground">+{dayTasks.length - 3} mais</div>}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-info">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-info" />
              <div>
                <p className="text-2xl font-bold">{tasks.filter(t => t.status === 'scheduled').length}</p>
                <p className="text-xs text-muted-foreground">Agendadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-warning">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Wrench className="h-8 w-8 text-warning" />
              <div>
                <p className="text-2xl font-bold">{tasks.filter(t => t.status === 'in_progress').length}</p>
                <p className="text-xs text-muted-foreground">Em Andamento</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-success">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-success" />
              <div>
                <p className="text-2xl font-bold">{tasks.filter(t => t.status === 'completed').length}</p>
                <p className="text-xs text-muted-foreground">Concluídas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-destructive">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-destructive" />
              <div>
                <p className="text-2xl font-bold">{tasks.filter(t => t.status === 'overdue').length}</p>
                <p className="text-xs text-muted-foreground">Atrasadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Calendar/Gantt */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Planejamento de Manutenção
              </CardTitle>
              <CardDescription>Visualize e gerencie todas as manutenções programadas</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Tabs value={view} onValueChange={(v) => setView(v as 'gantt' | 'calendar')}>
                <TabsList className="h-9">
                  <TabsTrigger value="gantt" className="px-3">Gantt</TabsTrigger>
                  <TabsTrigger value="calendar" className="px-3">Calendário</TabsTrigger>
                </TabsList>
              </Tabs>
              {view === 'calendar' && (
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="icon" onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="w-32 text-center font-medium">{currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</span>
                  <Button variant="outline" size="icon" onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <Button className="gap-2"><Plus className="h-4 w-4" />Nova Manutenção</Button>
              <Button variant="outline" className="gap-2 border-primary/50 text-primary" onClick={runAIAnalysis} disabled={isAnalyzing || tasks.length === 0}>
                {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
                IA Preditiva
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : view === 'gantt' ? <GanttView /> : <CalendarView />}
        </CardContent>
      </Card>

      {aiAnalysis && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Análise Preditiva de Manutenção
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-[300px]">
              <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-sm">{aiAnalysis}</div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-6 flex-wrap">
            <span className="text-sm font-medium">Legenda:</span>
            {Object.entries(STATUS_COLORS).map(([status, color]) => (
              <div key={status} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded ${color}`} />
                <span className="text-sm capitalize">
                  {status === 'scheduled' ? 'Agendada' : status === 'in_progress' ? 'Em Andamento' : status === 'completed' ? 'Concluída' : 'Atrasada'}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default MaintenanceGanttCalendar;
