/**
 * CalendarSidebar - Selected date task list with actions
 */
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Calendar as CalendarIcon, Plus, Clock, Play, CheckCircle2, Edit, Trash2, MoreHorizontal, User, Ship } from "lucide-react";
import type { Task } from "@/hooks/useTaskManagementData";
import { priorityColors, priorityLabels, statusLabels, statusIcons, isOverdue } from "./types";

interface CalendarSidebarProps {
  selectedDate: Date | null;
  tasks: Task[];
  onCreateForDate: (date: Date) => void;
  onStatusChange: (task: Task, status: Task['status']) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export function CalendarSidebar({ selectedDate, tasks, onCreateForDate, onStatusChange, onEdit, onDelete }: CalendarSidebarProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            {selectedDate ? <>Tarefas — {selectedDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}</> : 'Selecione uma data'}
          </CardTitle>
          {selectedDate && (
            <Button size="sm" variant="outline" className="gap-1" onClick={() => onCreateForDate(selectedDate)}>
              <Plus className="h-3.5 w-3.5" />Nova
            </Button>
          )}
        </div>
        {selectedDate && (
          <p className="text-xs text-muted-foreground">
            {tasks.length} tarefa{tasks.length !== 1 ? 's' : ''}
            {tasks.filter(isOverdue).length > 0 && (
              <span className="text-destructive ml-1">({tasks.filter(isOverdue).length} atrasada{tasks.filter(isOverdue).length > 1 ? 's' : ''})</span>
            )}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px]">
          {selectedDate ? (
            tasks.length > 0 ? (
              <div className="space-y-3">
                {tasks.map(task => (
                  <div key={task.id} className={`p-3 rounded-lg border transition-all ${isOverdue(task) ? 'border-destructive/50 bg-destructive/5' : 'hover:shadow-md'}`}>
                    <div className="flex items-start gap-2 mb-2">
                      <div className={`p-1 rounded ${priorityColors[task.priority]} text-white shrink-0`}>{statusIcons[task.status]}</div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-medium text-sm line-clamp-2 ${task.status === 'completed' ? 'line-through opacity-60' : ''}`}>{task.title}</h4>
                        {task.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{task.description}</p>}
                        {task.assigned_to_name && <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><User className="h-3 w-3" />{task.assigned_to_name}</p>}
                        {task.vessel_name && <p className="text-xs text-muted-foreground flex items-center gap-1"><Ship className="h-3 w-3" />{task.vessel_name}</p>}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" aria-label="Mais opções"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit({ ...task })}><Edit className="h-4 w-4 mr-2" />Editar</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {task.status !== 'pending' && <DropdownMenuItem onClick={() => onStatusChange(task, 'pending')}><Clock className="h-4 w-4 mr-2" />Marcar Pendente</DropdownMenuItem>}
                          {task.status !== 'in_progress' && <DropdownMenuItem onClick={() => onStatusChange(task, 'in_progress')}><Play className="h-4 w-4 mr-2" />Em Andamento</DropdownMenuItem>}
                          {task.status !== 'completed' && <DropdownMenuItem onClick={() => onStatusChange(task, 'completed')}><CheckCircle2 className="h-4 w-4 mr-2" />Concluir</DropdownMenuItem>}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onDelete(task)}><Trash2 className="h-4 w-4 mr-2" />Excluir</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={task.status === 'completed' ? 'default' : 'outline'} className="text-xs">{statusLabels[task.status]}</Badge>
                      <Badge variant="secondary" className="text-xs">{priorityLabels[task.priority]}</Badge>
                      {isOverdue(task) && <Badge variant="destructive" className="text-xs">Atrasada</Badge>}
                    </div>
                    {task.status !== 'completed' && task.status !== 'cancelled' && (
                      <Button variant="outline" size="sm" className="w-full mt-2 gap-2 text-xs h-7" onClick={() => onStatusChange(task, 'completed')}>
                        <CheckCircle2 className="h-3.5 w-3.5" />Marcar como concluída
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma tarefa para esta data</p>
                <Button variant="outline" size="sm" className="mt-3 gap-2" onClick={() => onCreateForDate(selectedDate)}><Plus className="h-4 w-4" />Criar tarefa</Button>
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
  );
}
