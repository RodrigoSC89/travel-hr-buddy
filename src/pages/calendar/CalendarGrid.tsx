/**
 * CalendarGrid - Calendar month view with task indicators
 */
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import type { Task } from "@/hooks/useTaskManagementData";
import { MONTHS, WEEKDAYS, priorityColors, priorityLabels, statusLabels, isOverdue, isToday, isSameDay } from "./types";

interface CalendarGridProps {
  currentDate: Date;
  selectedDate: Date | null;
  calendarDays: { date: Date; isCurrentMonth: boolean }[];
  filteredTasks: Task[];
  onNavigateMonth: (dir: 'prev' | 'next') => void;
  onSelectDate: (date: Date) => void;
  onCreateForDate: (date: Date) => void;
}

export function CalendarGrid({ currentDate, selectedDate, calendarDays, filteredTasks, onNavigateMonth, onSelectDate, onCreateForDate }: CalendarGridProps) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const getTasksForDate = (date: Date): Task[] => {
    return filteredTasks.filter(task => {
      if (!task.due_date) return false;
      const d = new Date(task.due_date);
      return isSameDay(d, date);
    });
  };

  const hasOverdueTasks = (date: Date) => getTasksForDate(date).some(isOverdue);

  return (
    <Card className="lg:col-span-2">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle>{MONTHS[month]} {year}</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => { onSelectDate(new Date()); }}>Hoje</Button>
            <Button variant="ghost" size="icon" onClick={() => onNavigateMonth('prev')} aria-label="Mês anterior"><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" onClick={() => onNavigateMonth('next')} aria-label="Próximo mês"><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {WEEKDAYS.map(day => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day) => {
            const dayTasks = getTasksForDate(day.date);
            const overdueDay = hasOverdueTasks(day.date);
            const selected = selectedDate && isSameDay(day.date, selectedDate);
            return (
              <div
                key={day.date.toISOString()}
                onClick={() => onSelectDate(day.date)}
                onDoubleClick={() => { onSelectDate(day.date); onCreateForDate(day.date); }}
                className={`min-h-[80px] p-1 rounded-lg border cursor-pointer transition-all group relative
                  ${!day.isCurrentMonth ? 'opacity-40' : ''}
                  ${isToday(day.date) ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'}
                  ${selected ? 'ring-2 ring-primary' : ''}
                  ${overdueDay && day.isCurrentMonth ? 'border-destructive/50' : ''}
                `}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${isToday(day.date) ? 'text-primary' : ''}`}>{day.date.getDate()}</span>
                  {day.isCurrentMonth && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button onClick={(e) => { e.stopPropagation(); onCreateForDate(day.date); }} className="opacity-0 group-hover:opacity-100 transition-opacity h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20">
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
                          <div className={`text-xs px-1 py-0.5 rounded truncate text-white ${priorityColors[task.priority]} ${isOverdue(task) ? 'animate-pulse' : ''} ${task.status === 'completed' ? 'opacity-60 line-through' : ''}`} title={task.title}>
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
                    {dayTasks.length > 3 && <div className="text-xs text-muted-foreground text-center">+{dayTasks.length - 3} mais</div>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground flex-wrap">
          <span className="font-medium">Legenda:</span>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-success" /> Baixa</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-warning" /> Média</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-destructive" /> Alta/Urgente</div>
          <div className="flex items-center gap-1 border-l pl-4">Duplo-clique para criar tarefa</div>
        </div>
      </CardContent>
    </Card>
  );
}
