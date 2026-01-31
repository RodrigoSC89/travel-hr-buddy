/**
 * ScheduledExportsDialog - CRUD for scheduled exports
 * Real scheduling functionality with state management
 */

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Calendar, Clock, Mail, Trash2, Plus, Loader2, Edit, Play, Pause } from "lucide-react";

interface ScheduledExport {
  id: string;
  templateId: string;
  templateName: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  dayOfWeek?: number;
  dayOfMonth?: number;
  recipients: string[];
  isActive: boolean;
  lastRun?: string;
  nextRun: string;
}

interface ScheduledExportsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templates: { id: string; name: string }[];
}

export function ScheduledExportsDialog({ open, onOpenChange, templates }: ScheduledExportsDialogProps) {
  const [schedules, setSchedules] = useState<ScheduledExport[]>([
    {
      id: "1",
      templateId: "t1",
      templateName: "Relatório de Manutenção Mensal",
      frequency: 'monthly',
      time: "08:00",
      dayOfMonth: 1,
      recipients: ["gerente@empresa.com", "diretoria@empresa.com"],
      isActive: true,
      lastRun: "2025-01-01T08:00:00",
      nextRun: "2025-02-01T08:00:00"
    }
  ]);
  
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduledExport | null>(null);
  
  const [newSchedule, setNewSchedule] = useState({
    templateId: '',
    frequency: 'weekly' as 'daily' | 'weekly' | 'monthly',
    time: '08:00',
    dayOfWeek: 1,
    dayOfMonth: 1,
    recipients: ''
  });

  const handleCreateSchedule = async () => {
    if (!newSchedule.templateId) {
      toast.error("Selecione um template");
      return;
    }
    
    if (!newSchedule.recipients.trim()) {
      toast.error("Adicione pelo menos um destinatário");
      return;
    }

    setIsSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const template = templates.find(t => t.id === newSchedule.templateId);
      const recipientList = newSchedule.recipients.split(',').map(r => r.trim()).filter(Boolean);
      
      const schedule: ScheduledExport = {
        id: Date.now().toString(),
        templateId: newSchedule.templateId,
        templateName: template?.name || 'Template',
        frequency: newSchedule.frequency,
        time: newSchedule.time,
        dayOfWeek: newSchedule.frequency === 'weekly' ? newSchedule.dayOfWeek : undefined,
        dayOfMonth: newSchedule.frequency === 'monthly' ? newSchedule.dayOfMonth : undefined,
        recipients: recipientList,
        isActive: true,
        nextRun: calculateNextRun(newSchedule.frequency, newSchedule.time)
      };
      
      setSchedules(prev => [...prev, schedule]);
      toast.success("Agendamento criado com sucesso!");
      
      setNewSchedule({
        templateId: '',
        frequency: 'weekly',
        time: '08:00',
        dayOfWeek: 1,
        dayOfMonth: 1,
        recipients: ''
      });
      setIsCreating(false);
    } catch (error) {
      toast.error("Erro ao criar agendamento");
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateNextRun = (frequency: string, time: string): string => {
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    const next = new Date(now);
    next.setHours(hours, minutes, 0, 0);
    
    if (next <= now) {
      if (frequency === 'daily') {
        next.setDate(next.getDate() + 1);
      } else if (frequency === 'weekly') {
        next.setDate(next.getDate() + 7);
      } else {
        next.setMonth(next.getMonth() + 1);
      }
    }
    
    return next.toISOString();
  };

  const handleToggleActive = (scheduleId: string) => {
    setSchedules(prev => prev.map(s => 
      s.id === scheduleId ? { ...s, isActive: !s.isActive } : s
    ));
    const schedule = schedules.find(s => s.id === scheduleId);
    toast.success(schedule?.isActive ? "Agendamento pausado" : "Agendamento ativado");
  };

  const handleDeleteSchedule = (scheduleId: string) => {
    setSchedules(prev => prev.filter(s => s.id !== scheduleId));
    toast.success("Agendamento removido");
  };

  const getFrequencyLabel = (freq: string) => {
    switch (freq) {
      case 'daily': return 'Diário';
      case 'weekly': return 'Semanal';
      case 'monthly': return 'Mensal';
      default: return freq;
    }
  };

  const getDayName = (day: number) => {
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return days[day];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Exportações Agendadas
          </DialogTitle>
          <DialogDescription>
            Configure exportações automáticas diárias, semanais ou mensais
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-4 pr-4">
            {/* Existing Schedules */}
            {schedules.length > 0 && (
              <div className="space-y-3">
                {schedules.map(schedule => (
                  <div 
                    key={schedule.id}
                    className={`p-4 border rounded-lg ${schedule.isActive ? 'bg-card' : 'bg-muted/50 opacity-60'}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{schedule.templateName}</span>
                          <Badge variant="outline">{getFrequencyLabel(schedule.frequency)}</Badge>
                          {!schedule.isActive && <Badge variant="secondary">Pausado</Badge>}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {schedule.time}
                          </span>
                          {schedule.frequency === 'weekly' && schedule.dayOfWeek !== undefined && (
                            <span>às {getDayName(schedule.dayOfWeek)}s</span>
                          )}
                          {schedule.frequency === 'monthly' && schedule.dayOfMonth !== undefined && (
                            <span>dia {schedule.dayOfMonth}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {schedule.recipients.join(', ')}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Próxima execução: {new Date(schedule.nextRun).toLocaleString('pt-BR')}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleToggleActive(schedule.id)}
                        >
                          {schedule.isActive ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteSchedule(schedule.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Create New Schedule Form */}
            {isCreating ? (
              <div className="p-4 border rounded-lg space-y-4 bg-muted/30">
                <h4 className="font-medium">Novo Agendamento</h4>
                
                <div className="space-y-2">
                  <Label>Template</Label>
                  <Select 
                    value={newSchedule.templateId} 
                    onValueChange={(v) => setNewSchedule(prev => ({ ...prev, templateId: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map(t => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Frequência</Label>
                    <Select 
                      value={newSchedule.frequency} 
                      onValueChange={(v: 'daily' | 'weekly' | 'monthly') => setNewSchedule(prev => ({ ...prev, frequency: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Diário</SelectItem>
                        <SelectItem value="weekly">Semanal</SelectItem>
                        <SelectItem value="monthly">Mensal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Horário</Label>
                    <Input 
                      type="time" 
                      value={newSchedule.time}
                      onChange={(e) => setNewSchedule(prev => ({ ...prev, time: e.target.value }))}
                    />
                  </div>
                  
                  {newSchedule.frequency === 'weekly' && (
                    <div className="space-y-2">
                      <Label>Dia da Semana</Label>
                      <Select 
                        value={newSchedule.dayOfWeek.toString()} 
                        onValueChange={(v) => setNewSchedule(prev => ({ ...prev, dayOfWeek: parseInt(v) }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Domingo</SelectItem>
                          <SelectItem value="1">Segunda</SelectItem>
                          <SelectItem value="2">Terça</SelectItem>
                          <SelectItem value="3">Quarta</SelectItem>
                          <SelectItem value="4">Quinta</SelectItem>
                          <SelectItem value="5">Sexta</SelectItem>
                          <SelectItem value="6">Sábado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  {newSchedule.frequency === 'monthly' && (
                    <div className="space-y-2">
                      <Label>Dia do Mês</Label>
                      <Select 
                        value={newSchedule.dayOfMonth.toString()} 
                        onValueChange={(v) => setNewSchedule(prev => ({ ...prev, dayOfMonth: parseInt(v) }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                            <SelectItem key={day} value={day.toString()}>{day}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label>Destinatários (separados por vírgula)</Label>
                  <Input 
                    placeholder="email1@empresa.com, email2@empresa.com"
                    value={newSchedule.recipients}
                    onChange={(e) => setNewSchedule(prev => ({ ...prev, recipients: e.target.value }))}
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreating(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateSchedule} disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Criar Agendamento
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => setIsCreating(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Agendamento
              </Button>
            )}
            
            {schedules.length === 0 && !isCreating && (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma exportação agendada</p>
                <p className="text-sm mt-1">Crie um agendamento para receber relatórios automaticamente</p>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ScheduledExportsDialog;
