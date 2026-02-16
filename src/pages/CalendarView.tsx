/**
 * CalendarView - Calendário de Tarefas Avançado
 * Orchestrator: CRUD, filtros, mudança de status, indicadores visuais, exportação
 * Refactored: sub-components in src/pages/calendar/
 */
import React, { useState, useMemo } from 'react';
import { Calendar as CalendarIcon, Plus, Download, RefreshCw, Loader2, AlertTriangle, ListFilter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useTaskManagementData, Task } from '@/hooks/useTaskManagementData';
import { toast } from 'sonner';
import { statusLabels, priorityLabels, isSameDay } from './calendar/types';
import { CalendarGrid } from './calendar/CalendarGrid';
import { CalendarSidebar } from './calendar/CalendarSidebar';
import { CreateTaskDialog, EditTaskDialog, DeleteTaskDialog } from './calendar/CalendarDialogs';

const CalendarView: React.FC = () => {
  const { tasks, stats, isLoading, error, refetch, createTask, updateTask, deleteTask } = useTaskManagementData();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deleteConfirmTask, setDeleteConfirmTask] = useState<Task | null>(null);
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium' as Task['priority'], status: 'pending' as Task['status'], due_date: '', assigned_to_name: '' });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const filteredTasks = useMemo(() => tasks.filter(t => {
    if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    return true;
  }), [tasks, filterPriority, filterStatus]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startingDay = firstDay.getDay();
    const days: { date: Date; isCurrentMonth: boolean }[] = [];
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDay - 1; i >= 0; i--) days.push({ date: new Date(year, month - 1, prevMonthLastDay - i), isCurrentMonth: false });
    for (let i = 1; i <= daysInMonth; i++) days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    return days;
  }, [year, month]);

  const selectedDateTasks = selectedDate ? filteredTasks.filter(t => t.due_date && isSameDay(new Date(t.due_date), selectedDate)) : [];

  const navigateMonth = (dir: 'prev' | 'next') => setCurrentDate(prev => { const d = new Date(prev); d.setMonth(d.getMonth() + (dir === 'prev' ? -1 : 1)); return d; });

  const openCreateForDate = (date: Date) => {
    const yyyy = date.getFullYear(); const mm = String(date.getMonth() + 1).padStart(2, '0'); const dd = String(date.getDate()).padStart(2, '0');
    setNewTask(prev => ({ ...prev, due_date: `${yyyy}-${mm}-${dd}` }));
    setCreateDialogOpen(true);
  };

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) { toast.error('Título é obrigatório'); return; }
    try {
      await createTask.mutateAsync({ title: newTask.title, description: newTask.description || undefined, priority: newTask.priority, status: newTask.status, due_date: newTask.due_date || undefined, assigned_to_name: newTask.assigned_to_name || undefined });
      toast.success('Tarefa criada com sucesso!');
      setCreateDialogOpen(false);
      setNewTask({ title: '', description: '', priority: 'medium', status: 'pending', due_date: '', assigned_to_name: '' });
    } catch { toast.error('Erro ao criar tarefa'); }
  };

  const handleStatusChange = async (task: Task, newStatus: Task['status']) => {
    try { await updateTask.mutateAsync({ id: task.id, status: newStatus }); toast.success(`Tarefa "${task.title}" atualizada para ${statusLabels[newStatus]}`); } catch { toast.error('Erro ao atualizar tarefa'); }
  };

  const handleEditTask = async () => {
    if (!editingTask) return;
    try { await updateTask.mutateAsync({ id: editingTask.id, title: editingTask.title, description: editingTask.description, priority: editingTask.priority, status: editingTask.status, due_date: editingTask.due_date, assigned_to_name: editingTask.assigned_to_name }); toast.success('Tarefa atualizada!'); setEditingTask(null); } catch { toast.error('Erro ao atualizar tarefa'); }
  };

  const handleDeleteTask = async () => {
    if (!deleteConfirmTask) return;
    try { await deleteTask.mutateAsync(deleteConfirmTask.id); toast.success('Tarefa excluída'); setDeleteConfirmTask(null); } catch { toast.error('Erro ao excluir tarefa'); }
  };

  const handleExportCSV = () => {
    const rows = [['Título', 'Status', 'Prioridade', 'Vencimento', 'Responsável'].join(';')];
    filteredTasks.forEach(t => rows.push([`"${t.title}"`, statusLabels[t.status], priorityLabels[t.priority], t.due_date ? new Date(t.due_date).toLocaleDateString('pt-BR') : '', t.assigned_to_name || ''].join(';')));
    const blob = new Blob(['\uFEFF' + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `tarefas_${new Date().toISOString().slice(0, 10)}.csv`; a.click(); URL.revokeObjectURL(url);
    toast.success('CSV exportado com sucesso!');
  };

  if (isLoading) return <div className="container mx-auto p-6"><div className="flex items-center justify-center h-96"><Loader2 className="h-8 w-8 animate-spin text-primary" /><span className="ml-2 text-muted-foreground">Carregando calendário...</span></div></div>;
  if (error) return <div className="container mx-auto p-6"><div className="flex flex-col items-center justify-center h-96 gap-4"><AlertTriangle className="h-12 w-12 text-destructive" /><div className="text-center"><h3 className="font-semibold text-lg">Erro ao carregar tarefas</h3><p className="text-muted-foreground text-sm mt-1">Não foi possível carregar o calendário.</p></div><Button onClick={() => refetch()} variant="outline" className="gap-2"><RefreshCw className="h-4 w-4" />Tentar novamente</Button></div></div>;

  const activeFilters = (filterPriority !== 'all' ? 1 : 0) + (filterStatus !== 'all' ? 1 : 0);

  return (
    <TooltipProvider>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2"><CalendarIcon className="h-8 w-8 text-primary" />Calendário de Tarefas</h1>
            <p className="text-muted-foreground mt-1">Visualização mensal das tarefas agendadas</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button onClick={() => { setNewTask(prev => ({ ...prev, due_date: '' })); setCreateDialogOpen(true); }} className="gap-2"><Plus className="h-4 w-4" />Nova Tarefa</Button>
            <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-2"><Download className="h-4 w-4" />Exportar</Button>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2"><RefreshCw className="h-4 w-4" />Atualizar</Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Card className="p-3"><div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Total</span><Badge variant="secondary">{stats.total}</Badge></div></Card>
          <Card className="p-3"><div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Pendentes</span><Badge variant="outline" className="text-warning border-warning/30">{stats.pending}</Badge></div></Card>
          <Card className="p-3"><div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Em Progresso</span><Badge variant="outline" className="text-info border-info/30">{stats.inProgress}</Badge></div></Card>
          <Card className="p-3"><div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Concluídas</span><Badge variant="outline" className="text-success border-success/30">{stats.completed}</Badge></div></Card>
          <Card className="p-3"><div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Atrasadas</span><Badge variant={stats.overdue > 0 ? 'destructive' : 'outline'}>{stats.overdue}</Badge></div></Card>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2"><ListFilter className="h-4 w-4 text-muted-foreground" /><span className="text-sm text-muted-foreground">Filtros:</span></div>
          <Select value={filterPriority} onValueChange={setFilterPriority}><SelectTrigger className="w-[150px] h-8 text-sm"><SelectValue placeholder="Prioridade" /></SelectTrigger><SelectContent><SelectItem value="all">Todas Prioridades</SelectItem><SelectItem value="urgent">Urgente</SelectItem><SelectItem value="high">Alta</SelectItem><SelectItem value="medium">Média</SelectItem><SelectItem value="low">Baixa</SelectItem></SelectContent></Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}><SelectTrigger className="w-[160px] h-8 text-sm"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="all">Todos Status</SelectItem><SelectItem value="pending">Pendente</SelectItem><SelectItem value="in_progress">Em Andamento</SelectItem><SelectItem value="completed">Concluída</SelectItem><SelectItem value="cancelled">Cancelada</SelectItem></SelectContent></Select>
          {activeFilters > 0 && <Button variant="ghost" size="sm" onClick={() => { setFilterPriority('all'); setFilterStatus('all'); }}>Limpar filtros ({activeFilters})</Button>}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <CalendarGrid currentDate={currentDate} selectedDate={selectedDate} calendarDays={calendarDays} filteredTasks={filteredTasks} onNavigateMonth={navigateMonth} onSelectDate={setSelectedDate} onCreateForDate={openCreateForDate} />
          <CalendarSidebar selectedDate={selectedDate} tasks={selectedDateTasks} onCreateForDate={openCreateForDate} onStatusChange={handleStatusChange} onEdit={setEditingTask} onDelete={setDeleteConfirmTask} />
        </div>

        <CreateTaskDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} newTask={newTask} setNewTask={setNewTask} onSubmit={handleCreateTask} isPending={createTask.isPending} />
        <EditTaskDialog task={editingTask} onClose={() => setEditingTask(null)} onSubmit={handleEditTask} onChange={setEditingTask} isPending={updateTask.isPending} />
        <DeleteTaskDialog task={deleteConfirmTask} onClose={() => setDeleteConfirmTask(null)} onSubmit={handleDeleteTask} isPending={deleteTask.isPending} />
      </div>
    </TooltipProvider>
  );
};

export default CalendarView;
