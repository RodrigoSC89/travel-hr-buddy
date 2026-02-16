/**
 * CalendarView - Shared types and constants
 */
import React from "react";
import { Clock, CheckCircle2, Play, AlertTriangle } from "lucide-react";
import type { Task } from "@/hooks/useTaskManagementData";

export const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export const priorityColors: Record<string, string> = {
  low: 'bg-success',
  medium: 'bg-warning',
  high: 'bg-destructive',
  urgent: 'bg-destructive',
};

export const priorityLabels: Record<string, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
  urgent: 'Urgente',
};

export const statusLabels: Record<string, string> = {
  pending: 'Pendente',
  in_progress: 'Em Andamento',
  completed: 'Concluída',
  cancelled: 'Cancelada',
};

export const statusIcons: Record<string, React.ReactNode> = {
  pending: React.createElement(Clock, { className: "h-3.5 w-3.5" }),
  in_progress: React.createElement(Play, { className: "h-3.5 w-3.5" }),
  completed: React.createElement(CheckCircle2, { className: "h-3.5 w-3.5" }),
  cancelled: React.createElement(AlertTriangle, { className: "h-3.5 w-3.5" }),
};

export const isOverdue = (task: Task) => {
  if (!task.due_date || task.status === 'completed' || task.status === 'cancelled') return false;
  return new Date(task.due_date) < new Date(new Date().toDateString());
};

export const isToday = (date: Date) => {
  const today = new Date();
  return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
};

export const isSameDay = (a: Date, b: Date) => {
  return a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
};
