/**
 * TaskCalendarView - Visualização de Calendário de Tarefas
 * Implementação completa com navegação mensal
 */

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Play
} from "lucide-react";

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "in_progress" | "completed" | "cancelled";
  assigned_to?: string;
  created_by: string;
  due_date?: string;
  completed_at?: string;
  tags: string[];
  related_vessel?: string;
  related_crew?: string;
  created_at: string;
}

interface TaskCalendarViewProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
}

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const priorityColors = {
  low: "bg-green-500",
  medium: "bg-yellow-500",
  high: "bg-red-500",
};

const statusIcons: Record<Task["status"], React.ReactNode> = {
  pending: <Clock className="h-3 w-3" />,
  in_progress: <Play className="h-3 w-3" />,
  completed: <CheckCircle2 className="h-3 w-3" />,
  cancelled: <AlertTriangle className="h-3 w-3" />,
};

export const TaskCalendarView: React.FC<TaskCalendarViewProps> = ({
  tasks,
  onSelectTask,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get calendar data
  const calendarData = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days: { date: Date; isCurrentMonth: boolean }[] = [];
    
    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false,
      });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }
    
    // Next month days
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }
    
    return days;
  }, [year, month]);

  // Get tasks for a specific date
  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => {
      if (!task.due_date) return false;
      const taskDate = new Date(task.due_date);
      return (
        taskDate.getDate() === date.getDate() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (date: Date) => {
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const selectedDateTasks = selectedDate ? getTasksForDate(selectedDate) : [];

  return (
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
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {WEEKDAYS.map(day => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarData.map((day, index) => {
              const dayTasks = getTasksForDate(day.date);
              const hasHighPriority = dayTasks.some(t => t.priority === "high" && t.status !== "completed");
              
              return (
                <div
                  key={index}
                  onClick={() => setSelectedDate(day.date)}
                  className={`
                    min-h-[80px] p-1 rounded-lg border cursor-pointer transition-all
                    ${!day.isCurrentMonth ? "opacity-40" : ""}
                    ${isToday(day.date) ? "bg-primary/10 border-primary" : "hover:bg-muted/50"}
                    ${isSelected(day.date) ? "ring-2 ring-primary" : ""}
                  `}
                >
                  <div className={`text-sm font-medium mb-1 ${isToday(day.date) ? "text-primary" : ""}`}>
                    {day.date.getDate()}
                  </div>
                  
                  {dayTasks.length > 0 && (
                    <div className="space-y-0.5">
                      {dayTasks.slice(0, 3).map(task => (
                        <div
                          key={task.id}
                          className={`text-xs px-1 py-0.5 rounded truncate text-white ${priorityColors[task.priority]}`}
                          title={task.title}
                        >
                          {task.title}
                        </div>
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
        </CardContent>
      </Card>

      {/* Selected date tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {selectedDate ? (
              <>
                Tarefas de {selectedDate.toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "long"
                })}
              </>
            ) : (
              "Selecione uma data"
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            {selectedDate ? (
              selectedDateTasks.length > 0 ? (
                <div className="space-y-3">
                  {selectedDateTasks.map(task => (
                    <div
                      key={task.id}
                      onClick={() => onSelectTask(task)}
                      className="p-3 rounded-lg border hover:shadow-md cursor-pointer transition-all"
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <div className={`p-1 rounded ${priorityColors[task.priority]} text-white`}>
                          {statusIcons[task.status]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm line-clamp-2">{task.title}</h4>
                          {task.assigned_to && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Responsável: {task.assigned_to}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={task.status === "completed" ? "default" : "outline"} className="text-xs">
                          {task.status === "pending" && "Pendente"}
                          {task.status === "in_progress" && "Em Andamento"}
                          {task.status === "completed" && "Concluída"}
                          {task.status === "cancelled" && "Cancelada"}
                        </Badge>
                        {task.related_vessel && (
                          <Badge variant="secondary" className="text-xs">
                            {task.related_vessel}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma tarefa para esta data</p>
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
  );
};
