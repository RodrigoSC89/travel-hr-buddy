/**
 * TaskCalendarView - Visualização de Calendário dentro do Task Management
 * Com ações rápidas, tooltips e indicadores visuais de overdue
 */

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Task } from "@/hooks/useTaskManagementData";
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock,
  AlertTriangle, CheckCircle2, Play, Plus, MoreHorizontal,
  Edit, Trash2, User, Ship
} from "lucide-react";

interface TaskCalendarViewProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  onCreateTask?: (dueDate?: string) => void;
  onUpdateStatus?: (taskId: string, status: Task["status"]) => void;
  onDeleteTask?: (taskId: string) => void;
}

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const priorityColors: Record<string, string> = {
  low: "bg-green-500",
  medium: "bg-yellow-500",
  high: "bg-red-500",
  urgent: "bg-red-600",
};

const priorityLabels: Record<string, string> = {
  low: "Baixa", medium: "Média", high: "Alta", urgent: "Urgente",
};

const statusLabels: Record<string, string> = {
  pending: "Pendente", in_progress: "Em Andamento", completed: "Concluída", cancelled: "Cancelada",
};

export const TaskCalendarView: React.FC<TaskCalendarViewProps> = ({
  tasks,
  onSelectTask,
  onCreateTask,
  onUpdateStatus,
  onDeleteTask,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const calendarData = useMemo(() => {
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
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }
    return days;
  }, [year, month]);

  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => {
      if (!task.due_date) return false;
      const taskDate = new Date(task.due_date);
      return taskDate.getDate() === date.getDate() && taskDate.getMonth() === date.getMonth() && taskDate.getFullYear() === date.getFullYear();
    });
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + (direction === "prev" ? -1 : 1));
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
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
    if (!task.due_date || task.status === "completed" || task.status === "cancelled") return false;
    return new Date(task.due_date) < new Date(new Date().toDateString());
  };

  const formatDateForInput = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const selectedDateTasks = selectedDate ? getTasksForDate(selectedDate) : [];

  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                {MONTHS[month]} {year}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={goToToday}>
                  Hoje
                </Button>
                <Button variant="ghost" size="icon" onClick={() => navigateMonth("prev")}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => navigateMonth("next")}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {WEEKDAYS.map(day => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {calendarData.map((day, index) => {
                const dayTasks = getTasksForDate(day.date);
                const hasOverdue = dayTasks.some(isOverdue);
                
                return (
                  <div
                    key={index}
                    onClick={() => setSelectedDate(day.date)}
                    onDoubleClick={() => onCreateTask?.(formatDateForInput(day.date))}
                    className={`
                      min-h-[80px] p-1 rounded-lg border cursor-pointer transition-all group relative
                      ${!day.isCurrentMonth ? "opacity-40" : ""}
                      ${isToday(day.date) ? "bg-primary/10 border-primary" : "hover:bg-muted/50"}
                      ${isSelected(day.date) ? "ring-2 ring-primary" : ""}
                      ${hasOverdue && day.isCurrentMonth ? "border-destructive/50" : ""}
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-medium ${isToday(day.date) ? "text-primary" : ""}`}>
                        {day.date.getDate()}
                      </span>
                      {day.isCurrentMonth && onCreateTask && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onCreateTask(formatDateForInput(day.date)); }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20"
                        >
                          <Plus className="h-3 w-3 text-primary" />
                        </button>
                      )}
                    </div>
                    
                    {dayTasks.length > 0 && (
                      <div className="space-y-0.5 mt-0.5">
                        {dayTasks.slice(0, 3).map(task => (
                          <Tooltip key={task.id}>
                            <TooltipTrigger asChild>
                              <div
                                className={`text-xs px-1 py-0.5 rounded truncate text-white ${priorityColors[task.priority]} ${isOverdue(task) ? "animate-pulse" : ""} ${task.status === "completed" ? "opacity-60 line-through" : ""}`}
                                title={task.title}
                              >
                                {task.title}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs">
                              <p className="font-medium">{task.title}</p>
                              <p className="text-xs">{statusLabels[task.status]} • {priorityLabels[task.priority]}</p>
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

            <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground flex-wrap">
              <span className="font-medium">Legenda:</span>
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-green-500" /> Baixa</div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-yellow-500" /> Média</div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-red-500" /> Alta</div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-red-600" /> Urgente</div>
            </div>
          </CardContent>
        </Card>

        {/* Selected date tasks */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                {selectedDate ? (
                  <>Tarefas — {selectedDate.toLocaleDateString("pt-BR", { day: "2-digit", month: "long" })}</>
                ) : (
                  "Selecione uma data"
                )}
              </CardTitle>
              {selectedDate && onCreateTask && (
                <Button size="sm" variant="outline" className="gap-1" onClick={() => onCreateTask(formatDateForInput(selectedDate))}>
                  <Plus className="h-3.5 w-3.5" />
                  Nova
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              {selectedDate ? (
                selectedDateTasks.length > 0 ? (
                  <div className="space-y-3">
                    {selectedDateTasks.map(task => (
                      <div
                        key={task.id}
                        className={`p-3 rounded-lg border transition-all ${isOverdue(task) ? "border-destructive/50 bg-destructive/5" : "hover:shadow-md"}`}
                      >
                        <div className="flex items-start gap-2 mb-2">
                          <div className={`p-1 rounded ${priorityColors[task.priority]} text-white shrink-0`}>
                            {task.status === "completed" ? <CheckCircle2 className="h-3.5 w-3.5" /> :
                             task.status === "in_progress" ? <Play className="h-3.5 w-3.5" /> :
                             <Clock className="h-3.5 w-3.5" />}
                          </div>
                          <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onSelectTask(task)}>
                            <h4 className={`font-medium text-sm line-clamp-2 ${task.status === "completed" ? "line-through opacity-60" : ""}`}>
                              {task.title}
                            </h4>
                            {task.assigned_to_name && (
                              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                <User className="h-3 w-3" /> {task.assigned_to_name}
                              </p>
                            )}
                          </div>
                          {(onUpdateStatus || onDeleteTask) && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => onSelectTask(task)}>
                                  <Edit className="h-4 w-4 mr-2" /> Detalhes
                                </DropdownMenuItem>
                                {onUpdateStatus && (
                                  <>
                                    <DropdownMenuSeparator />
                                    {task.status !== "completed" && (
                                      <DropdownMenuItem onClick={() => onUpdateStatus(task.id, "completed")}>
                                        <CheckCircle2 className="h-4 w-4 mr-2" /> Concluir
                                      </DropdownMenuItem>
                                    )}
                                    {task.status !== "in_progress" && (
                                      <DropdownMenuItem onClick={() => onUpdateStatus(task.id, "in_progress")}>
                                        <Play className="h-4 w-4 mr-2" /> Em Andamento
                                      </DropdownMenuItem>
                                    )}
                                  </>
                                )}
                                {onDeleteTask && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-destructive" onClick={() => onDeleteTask(task.id)}>
                                      <Trash2 className="h-4 w-4 mr-2" /> Excluir
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant={task.status === "completed" ? "default" : "outline"} className="text-xs">
                            {statusLabels[task.status]}
                          </Badge>
                          {isOverdue(task) && <Badge variant="destructive" className="text-xs">Atrasada</Badge>}
                          {task.vessel_name && <Badge variant="secondary" className="text-xs">{task.vessel_name}</Badge>}
                        </div>
                        {onUpdateStatus && task.status !== "completed" && task.status !== "cancelled" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full mt-2 gap-2 text-xs h-7"
                            onClick={() => onUpdateStatus(task.id, "completed")}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" /> Concluir
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma tarefa para esta data</p>
                    {onCreateTask && (
                      <Button variant="outline" size="sm" className="mt-3 gap-2" onClick={() => onCreateTask(formatDateForInput(selectedDate))}>
                        <Plus className="h-4 w-4" /> Criar tarefa
                      </Button>
                    )}
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
    </TooltipProvider>
  );
};
