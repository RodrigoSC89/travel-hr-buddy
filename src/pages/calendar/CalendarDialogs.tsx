/**
 * CalendarDialogs - Create, Edit, Delete task dialogs
 */
import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import type { Task } from "@/hooks/useTaskManagementData";

interface NewTaskForm {
  title: string;
  description: string;
  priority: Task['priority'];
  status: Task['status'];
  due_date: string;
  assigned_to_name: string;
}

interface CreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newTask: NewTaskForm;
  setNewTask: React.Dispatch<React.SetStateAction<NewTaskForm>>;
  onSubmit: () => void;
  isPending: boolean;
}

export function CreateTaskDialog({ open, onOpenChange, newTask, setNewTask, onSubmit, isPending }: CreateDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Tarefa</DialogTitle>
          <DialogDescription>Crie uma nova tarefa no calendário</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div><Label htmlFor="title">Título *</Label><Input id="title" value={newTask.title} onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))} placeholder="Título da tarefa" /></div>
          <div><Label htmlFor="description">Descrição</Label><Textarea id="description" value={newTask.description} onChange={e => setNewTask(p => ({ ...p, description: e.target.value }))} placeholder="Descrição detalhada (opcional)" rows={3} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Prioridade</Label><Select value={newTask.priority} onValueChange={v => setNewTask(p => ({ ...p, priority: v as Task['priority'] }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="low">Baixa</SelectItem><SelectItem value="medium">Média</SelectItem><SelectItem value="high">Alta</SelectItem><SelectItem value="urgent">Urgente</SelectItem></SelectContent></Select></div>
            <div><Label>Status</Label><Select value={newTask.status} onValueChange={v => setNewTask(p => ({ ...p, status: v as Task['status'] }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="pending">Pendente</SelectItem><SelectItem value="in_progress">Em Andamento</SelectItem></SelectContent></Select></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label htmlFor="due_date">Vencimento</Label><Input id="due_date" type="date" value={newTask.due_date} onChange={e => setNewTask(p => ({ ...p, due_date: e.target.value }))} /></div>
            <div><Label htmlFor="assigned">Responsável</Label><Input id="assigned" value={newTask.assigned_to_name} onChange={e => setNewTask(p => ({ ...p, assigned_to_name: e.target.value }))} placeholder="Nome do responsável" /></div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={onSubmit} disabled={isPending}>{isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}Criar Tarefa</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface EditDialogProps {
  task: Task | null;
  onClose: () => void;
  onSubmit: () => void;
  onChange: (task: Task | null) => void;
  isPending: boolean;
}

export function EditTaskDialog({ task, onClose, onSubmit, onChange, isPending }: EditDialogProps) {
  return (
    <Dialog open={!!task} onOpenChange={open => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Tarefa</DialogTitle>
          <DialogDescription>Atualize os dados da tarefa</DialogDescription>
        </DialogHeader>
        {task && (
          <div className="space-y-4">
            <div><Label>Título *</Label><Input value={task.title} onChange={e => onChange({ ...task, title: e.target.value })} /></div>
            <div><Label>Descrição</Label><Textarea value={task.description || ''} onChange={e => onChange({ ...task, description: e.target.value })} rows={3} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Prioridade</Label><Select value={task.priority} onValueChange={v => onChange({ ...task, priority: v as Task['priority'] })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="low">Baixa</SelectItem><SelectItem value="medium">Média</SelectItem><SelectItem value="high">Alta</SelectItem><SelectItem value="urgent">Urgente</SelectItem></SelectContent></Select></div>
              <div><Label>Status</Label><Select value={task.status} onValueChange={v => onChange({ ...task, status: v as Task['status'] })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="pending">Pendente</SelectItem><SelectItem value="in_progress">Em Andamento</SelectItem><SelectItem value="completed">Concluída</SelectItem><SelectItem value="cancelled">Cancelada</SelectItem></SelectContent></Select></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Vencimento</Label><Input type="date" value={task.due_date?.slice(0, 10) || ''} onChange={e => onChange({ ...task, due_date: e.target.value })} /></div>
              <div><Label>Responsável</Label><Input value={task.assigned_to_name || ''} onChange={e => onChange({ ...task, assigned_to_name: e.target.value })} /></div>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={onSubmit} disabled={isPending}>{isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Edit className="h-4 w-4 mr-2" />}Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface DeleteDialogProps {
  task: Task | null;
  onClose: () => void;
  onSubmit: () => void;
  isPending: boolean;
}

export function DeleteTaskDialog({ task, onClose, onSubmit, isPending }: DeleteDialogProps) {
  return (
    <Dialog open={!!task} onOpenChange={open => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir Tarefa</DialogTitle>
          <DialogDescription>Tem certeza que deseja excluir a tarefa <strong>"{task?.title}"</strong>? Esta ação não pode ser desfeita.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button variant="destructive" onClick={onSubmit} disabled={isPending}>{isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}Excluir</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
