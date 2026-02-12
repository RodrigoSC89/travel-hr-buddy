/**
 * CalendarView - Calendário de Tarefas Avançado
 * Funcionalidades: CRUD, filtros, mudança de status, indicadores visuais, exportação
 */
import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock,
  CheckCircle2, Play, AlertTriangle, Loader2, RefreshCw,
  Plus, Filter, Download, Trash2, Edit, MoreHorizontal,
  ListFilter, Eye, User, Ship
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useTaskManagementData, Task } from '@/hooks/useTaskManagementData';
import { toast } from 'sonner';

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const priorityColors: Record<string, string> = {
  low: 'bg-success',
  medium: 'bg-warning',
  high: 'bg-destructive',
  urgent: 'bg-destructive',
};

const priorityLabels: Record<string, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
  urgent: 'Urgente',
};

const statusLabels: Record<string, string> = {
  pending: 'Pendente',
  in_progress: 'Em Andamento',
  completed: 'Concluída',
  cancelled: 'Cancelada',
};

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="h-3.5 w-3.5" />,
  in_progress: <Play className="h-3.5 w-3.5" />,
  completed: <CheckCircle2 className="h-3.5 w-3.5" />,
  cancelled: <AlertTriangle className="h-3.5 w-3.5" />,
};

const CalendarView: React.FC = () => {
  const { tasks, stats, isLoading, error, refetch, createTask, updateTask, deleteTask } = useTaskManagementData();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deleteConfirmTask, setDeleteConfirmTask] = useState<Task | null>(null);
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // New task form
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as Task['priority'],
    status: 'pending' as Task['status'],
    due_date: '',
    assigned_to_name: '',
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
      if (filterStatus !== 'all' && t.status !== filterStatus) return false;
      return true;
    });
  }, [tasks, filterPriority, filterStatus]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days: { date: Date; isCurrentMonth: boolean }[] = [];

    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDay - 1; i >= 0; i--) {
      days.push({ date: new Date(year, month - 1, prevMonthLastDay - i), isCurrentMonth: false });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }

    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }

    return days;
  }, [year, month]);

  const getTasksForDate = (date: Date): Task[] => {
    return filteredTasks.filter(task => {
      if (!task.due_date) return false;
      const d = new Date(task.due_date);
      return d.getDate() === date.getDate() && d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear();
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  };

  const isSelected = (date: Date) => {
    if (!selectedDate) return false;
    return date.getDate() === selectedDate.getDate() && date.getMonth() === selectedDate.getMonth() && date.getFullYear() === selectedDate.getFullYear();
  };

  const isOverdue = (task: Task) => {
    if (!task.due_date || task.status === 'completed' || task.status === 'cancelled') return false;
    return new Date(task.due_date) < new Date(new Date().toDateString());
  };

  const hasOverdueTasks = (date: Date) => {
    return getTasksForDate(date).some(isOverdue);
  };

  const navigateMonth = (dir: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + (dir === 'prev' ? -1 : 1));
      return d;
    });
  };

  const selectedDateTasks = selectedDate ? getTasksForDate(selectedDate) : [];

  // Create task handler
  const handleCreateTask = async () => {
    if (!newTask.title.trim()) {
      toast.error('Título é obrigatório');
      return;
    }
    try {
      await createTask.mutateAsync({
        title: newTask.title,
        description: newTask.description || undefined,
        priority: newTask.priority,
        status: newTask.status,
        due_date: newTask.due_date || undefined,
        assigned_to_name: newTask.assigned_to_name || undefined,
      });
      toast.success('Tarefa criada com sucesso!');
      setCreateDialogOpen(false);
      setNewTask({ title: '', description: '', priority: 'medium', status: 'pending', due_date: '', assigned_to_name: '' });
    } catch {
      toast.error('Erro ao criar tarefa');
    }
  };

  // Update task status
  const handleStatusChange = async (task: Task, newStatus: Task['status']) => {
    try {
      await updateTask.mutateAsync({ id: task.id, status: newStatus });
      toast.success(`Tarefa "${task.title}" atualizada para ${statusLabels[newStatus]}`);
    } catch {
      toast.error('Erro ao atualizar tarefa');
    }
  };

  // Update task (edit)
  const handleEditTask = async () => {
    if (!editingTask) return;
    try {
      await updateTask.mutateAsync({
        id: editingTask.id,
        title: editingTask.title,
        description: editingTask.description,
        priority: editingTask.priority,
        status: editingTask.status,
        due_date: editingTask.due_date,
        assigned_to_name: editingTask.assigned_to_name,
      });
      toast.success('Tarefa atualizada!');
      setEditingTask(null);
    } catch {
      toast.error('Erro ao atualizar tarefa');
    }
  };

  // Delete task
  const handleDeleteTask = async () => {
    if (!deleteConfirmTask) return;
    try {
      await deleteTask.mutateAsync(deleteConfirmTask.id);
      toast.success('Tarefa excluída');
      setDeleteConfirmTask(null);
    } catch {
      toast.error('Erro ao excluir tarefa');
    }
  };

  // Open create dialog with pre-filled date
  const openCreateForDate = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    setNewTask(prev => ({ ...prev, due_date: `${yyyy}-${mm}-${dd}` }));
    setCreateDialogOpen(true);
  };

  // Export tasks
  const handleExportCSV = () => {
    const rows = [['Título', 'Status', 'Prioridade', 'Vencimento', 'Responsável'].join(';')];
    filteredTasks.forEach(t => {
      rows.push([
        `"${t.title}"`,
        statusLabels[t.status],
        priorityLabels[t.priority],
        t.due_date ? new Date(t.due_date).toLocaleDateString('pt-BR') : '',
        t.assigned_to_name || ''
      ].join(';'));
    });
    const blob = new Blob(['\uFEFF' + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tarefas_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exportado com sucesso!');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Carregando calendário...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex flex-col items-center justify-center h-96 gap-4">
          <AlertTriangle className="h-12 w-12 text-destructive" />
          <div className="text-center">
            <h3 className="font-semibold text-lg">Erro ao carregar tarefas</h3>
            <p className="text-muted-foreground text-sm mt-1">Não foi possível carregar o calendário.</p>
          </div>
          <Button onClick={() => refetch()} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  const activeFilters = (filterPriority !== 'all' ? 1 : 0) + (filterStatus !== 'all' ? 1 : 0);

  return (
    <TooltipProvider>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <CalendarIcon className="h-8 w-8 text-primary" />
              Calendário de Tarefas
            </h1>
            <p className="text-muted-foreground mt-1">
              Visualização mensal das tarefas agendadas
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button onClick={() => { setNewTask(prev => ({ ...prev, due_date: '' })); setCreateDialogOpen(true); }} className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Tarefa
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-2">
              <Download className="h-4 w-4" />
              Exportar
            </Button>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Card className="p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total</span>
              <Badge variant="secondary">{stats.total}</Badge>
            </div>
          </Card>
          <Card className="p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Pendentes</span>
              <Badge variant="outline" className="text-yellow-600 border-yellow-500/30">{stats.pending}</Badge>
            </div>
          </Card>
          <Card className="p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Em Progresso</span>
              <Badge variant="outline" className="text-blue-600 border-blue-500/30">{stats.inProgress}</Badge>
            </div>
          </Card>
          <Card className="p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Concluídas</span>
              <Badge variant="outline" className="text-green-600 border-green-500/30">{stats.completed}</Badge>
            </div>
          </Card>
          <Card className="p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Atrasadas</span>
              <Badge variant={stats.overdue > 0 ? 'destructive' : 'outline'}>{stats.overdue}</Badge>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <ListFilter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Filtros:</span>
          </div>
          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-[150px] h-8 text-sm">
              <SelectValue placeholder="Prioridade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas Prioridades</SelectItem>
              <SelectItem value="urgent">Urgente</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
              <SelectItem value="medium">Média</SelectItem>
              <SelectItem value="low">Baixa</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[160px] h-8 text-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Status</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="in_progress">Em Andamento</SelectItem>
              <SelectItem value="completed">Concluída</SelectItem>
              <SelectItem value="cancelled">Cancelada</SelectItem>
            </SelectContent>
          </Select>
          {activeFilters > 0 && (
            <Button variant="ghost" size="sm" onClick={() => { setFilterPriority('all'); setFilterStatus('all'); }}>
              Limpar filtros ({activeFilters})
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Grid */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle>
                  {MONTHS[month]} {year}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => { setCurrentDate(new Date()); setSelectedDate(new Date()); }}>
                    Hoje
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => navigateMonth('prev')}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => navigateMonth('next')}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Weekday headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {WEEKDAYS.map(day => (
                  <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day) => {
                  const dayTasks = getTasksForDate(day.date);
                  const overdueDay = hasOverdueTasks(day.date);

                  return (
                    <div
                      key={day.date.toISOString()}
                      onClick={() => setSelectedDate(day.date)}
                      onDoubleClick={() => { setSelectedDate(day.date); openCreateForDate(day.date); }}
                      className={`
                        min-h-[80px] p-1 rounded-lg border cursor-pointer transition-all group relative
                        ${!day.isCurrentMonth ? 'opacity-40' : ''}
                        ${isToday(day.date) ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'}
                        ${isSelected(day.date) ? 'ring-2 ring-primary' : ''}
                        ${overdueDay && day.isCurrentMonth ? 'border-destructive/50' : ''}
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-medium ${isToday(day.date) ? 'text-primary' : ''}`}>
                          {day.date.getDate()}
                        </span>
                        {day.isCurrentMonth && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={(e) => { e.stopPropagation(); openCreateForDate(day.date); }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20"
                              >
                                <Plus className="h-3 w-3 text-primary" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="top"><p>Criar tarefa</p></TooltipContent>
                          </Tooltip>
                        )}
                      </div>

                      {dayTasks.length > 0 && (
                        <div className="space-y-0.5 mt-0.5">
                          {dayTasks.slice(0, 3).map(task => (
                            <Tooltip key={task.id}>
                              <TooltipTrigger asChild>
                                <div
                                  className={`text-xs px-1 py-0.5 rounded truncate text-white ${priorityColors[task.priority]} ${isOverdue(task) ? 'animate-pulse' : ''} ${task.status === 'completed' ? 'opacity-60 line-through' : ''}`}
                                  title={task.title}
                                >
                                  {task.title}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-xs">
                                <p className="font-medium">{task.title}</p>
                                <p className="text-xs">{statusLabels[task.status]} • {priorityLabels[task.priority]}</p>
                                {task.assigned_to_name && <p className="text-xs">Responsável: {task.assigned_to_name}</p>}
                              </TooltipContent>
                            </Tooltip>
                          ))}
                          {dayTasks.length > 3 && (
                            <div className="text-xs text-muted-foreground text-center">
                              +{dayTasks.length - 3} mais
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground flex-wrap">
                <span className="font-medium">Legenda:</span>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-success" /> Baixa</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-warning" /> Média</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-destructive" /> Alta</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-destructive" /> Urgente</div>
                <div className="flex items-center gap-1 border-l pl-4">Duplo-clique para criar tarefa</div>
              </div>
            </CardContent>
          </Card>

          {/* Selected date sidebar */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  {selectedDate ? (
                    <>Tarefas — {selectedDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}</>
                  ) : (
                    'Selecione uma data'
                  )}
                </CardTitle>
                {selectedDate && (
                  <Button size="sm" variant="outline" className="gap-1" onClick={() => openCreateForDate(selectedDate)}>
                    <Plus className="h-3.5 w-3.5" />
                    Nova
                  </Button>
                )}
              </div>
              {selectedDate && (
                <p className="text-xs text-muted-foreground">
                  {selectedDateTasks.length} tarefa{selectedDateTasks.length !== 1 ? 's' : ''}
                  {selectedDateTasks.filter(isOverdue).length > 0 && (
                    <span className="text-destructive ml-1">
                      ({selectedDateTasks.filter(isOverdue).length} atrasada{selectedDateTasks.filter(isOverdue).length > 1 ? 's' : ''})
                    </span>
                  )}
                </p>
              )}
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                {selectedDate ? (
                  selectedDateTasks.length > 0 ? (
                    <div className="space-y-3">
                      {selectedDateTasks.map(task => (
                        <div
                          key={task.id}
                          className={`p-3 rounded-lg border transition-all ${isOverdue(task) ? 'border-destructive/50 bg-destructive/5' : 'hover:shadow-md'}`}
                        >
                          <div className="flex items-start gap-2 mb-2">
                            <div className={`p-1 rounded ${priorityColors[task.priority]} text-white shrink-0`}>
                              {statusIcons[task.status]}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className={`font-medium text-sm line-clamp-2 ${task.status === 'completed' ? 'line-through opacity-60' : ''}`}>
                                {task.title}
                              </h4>
                              {task.description && (
                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{task.description}</p>
                              )}
                              {task.assigned_to_name && (
                                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {task.assigned_to_name}
                                </p>
                              )}
                              {task.vessel_name && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Ship className="h-3 w-3" />
                                  {task.vessel_name}
                                </p>
                              )}
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setEditingTask({ ...task })}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {task.status !== 'pending' && (
                                  <DropdownMenuItem onClick={() => handleStatusChange(task, 'pending')}>
                                    <Clock className="h-4 w-4 mr-2" />
                                    Marcar Pendente
                                  </DropdownMenuItem>
                                )}
                                {task.status !== 'in_progress' && (
                                  <DropdownMenuItem onClick={() => handleStatusChange(task, 'in_progress')}>
                                    <Play className="h-4 w-4 mr-2" />
                                    Em Andamento
                                  </DropdownMenuItem>
                                )}
                                {task.status !== 'completed' && (
                                  <DropdownMenuItem onClick={() => handleStatusChange(task, 'completed')}>
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Concluir
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => setDeleteConfirmTask(task)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant={task.status === 'completed' ? 'default' : 'outline'} className="text-xs">
                              {statusLabels[task.status]}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {priorityLabels[task.priority]}
                            </Badge>
                            {isOverdue(task) && (
                              <Badge variant="destructive" className="text-xs">
                                Atrasada
                              </Badge>
                            )}
                          </div>
                          {/* Quick complete button */}
                          {task.status !== 'completed' && task.status !== 'cancelled' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full mt-2 gap-2 text-xs h-7"
                              onClick={() => handleStatusChange(task, 'completed')}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Marcar como concluída
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhuma tarefa para esta data</p>
                      <Button variant="outline" size="sm" className="mt-3 gap-2" onClick={() => openCreateForDate(selectedDate)}>
                        <Plus className="h-4 w-4" />
                        Criar tarefa
                      </Button>
                    </div>
                  )
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Clique em uma data para ver as tarefas</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Create Task Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Tarefa</DialogTitle>
              <DialogDescription>
                Crie uma nova tarefa no calendário
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={newTask.title}
                  onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))}
                  placeholder="Título da tarefa"
                />
              </div>
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={newTask.description}
                  onChange={e => setNewTask(p => ({ ...p, description: e.target.value }))}
                  placeholder="Descrição detalhada (opcional)"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Prioridade</Label>
                  <Select value={newTask.priority} onValueChange={v => setNewTask(p => ({ ...p, priority: v as Task['priority'] }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={newTask.status} onValueChange={v => setNewTask(p => ({ ...p, status: v as Task['status'] }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="in_progress">Em Andamento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="due_date">Vencimento</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={newTask.due_date}
                    onChange={e => setNewTask(p => ({ ...p, due_date: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="assigned">Responsável</Label>
                  <Input
                    id="assigned"
                    value={newTask.assigned_to_name}
                    onChange={e => setNewTask(p => ({ ...p, assigned_to_name: e.target.value }))}
                    placeholder="Nome do responsável"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleCreateTask} disabled={createTask.isPending}>
                {createTask.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                Criar Tarefa
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Task Dialog */}
        <Dialog open={!!editingTask} onOpenChange={open => !open && setEditingTask(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Tarefa</DialogTitle>
              <DialogDescription>Atualize os dados da tarefa</DialogDescription>
            </DialogHeader>
            {editingTask && (
              <div className="space-y-4">
                <div>
                  <Label>Título *</Label>
                  <Input
                    value={editingTask.title}
                    onChange={e => setEditingTask(p => p ? { ...p, title: e.target.value } : null)}
                  />
                </div>
                <div>
                  <Label>Descrição</Label>
                  <Textarea
                    value={editingTask.description || ''}
                    onChange={e => setEditingTask(p => p ? { ...p, description: e.target.value } : null)}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Prioridade</Label>
                    <Select value={editingTask.priority} onValueChange={v => setEditingTask(p => p ? { ...p, priority: v as Task['priority'] } : null)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baixa</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="urgent">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Select value={editingTask.status} onValueChange={v => setEditingTask(p => p ? { ...p, status: v as Task['status'] } : null)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="in_progress">Em Andamento</SelectItem>
                        <SelectItem value="completed">Concluída</SelectItem>
                        <SelectItem value="cancelled">Cancelada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Vencimento</Label>
                    <Input
                      type="date"
                      value={editingTask.due_date?.slice(0, 10) || ''}
                      onChange={e => setEditingTask(p => p ? { ...p, due_date: e.target.value } : null)}
                    />
                  </div>
                  <div>
                    <Label>Responsável</Label>
                    <Input
                      value={editingTask.assigned_to_name || ''}
                      onChange={e => setEditingTask(p => p ? { ...p, assigned_to_name: e.target.value } : null)}
                    />
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingTask(null)}>Cancelar</Button>
              <Button onClick={handleEditTask} disabled={updateTask.isPending}>
                {updateTask.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Edit className="h-4 w-4 mr-2" />}
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirm Dialog */}
        <Dialog open={!!deleteConfirmTask} onOpenChange={open => !open && setDeleteConfirmTask(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Excluir Tarefa</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir a tarefa <strong>"{deleteConfirmTask?.title}"</strong>? Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteConfirmTask(null)}>Cancelar</Button>
              <Button variant="destructive" onClick={handleDeleteTask} disabled={deleteTask.isPending}>
                {deleteTask.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                Excluir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default CalendarView;
