import React, { useState } from "react";
import { Calendar, Plus, Settings, Bell } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

interface ScheduledChecklist {
  id: string;
  title: string;
  type: string;
  frequency: "daily" | "weekly" | "monthly" | "quarterly" | "annually";
  nextDue: Date;
  vesselId?: string;
  isActive: boolean;
  notifications: boolean;
}

export const ChecklistScheduler = () => {
  const [schedules, setSchedules] = useState<ScheduledChecklist[]>([
    {
      id: "1",
      title: "Daily Safety Inspection",
      type: "safety",
      frequency: "daily",
      nextDue: new Date("2024-01-15"),
      vesselId: "vessel-1",
      isActive: true,
      notifications: true,
    },
    {
      id: "2",
      title: "Weekly Equipment Check",
      type: "machine_routine",
      frequency: "weekly",
      nextDue: new Date("2024-01-20"),
      vesselId: "vessel-1",
      isActive: true,
      notifications: true,
    },
  ]);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { toast } = useToast();

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case "daily":
        return "bg-red-100 text-red-800";
      case "weekly":
        return "bg-orange-100 text-orange-800";
      case "monthly":
        return "bg-blue-100 text-blue-800";
      case "quarterly":
        return "bg-purple-100 text-purple-800";
      case "annually":
        return "bg-green-100 text-green-800";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? "bg-green-100 text-green-800" : "bg-secondary text-secondary-foreground";
  };

  const handleCreateSchedule = () => {
    toast({
      title: "Agenda Criada",
      description: "Nova agenda de checklist foi criada com sucesso.",
    });
    setIsCreateOpen(false);
  };

  const toggleSchedule = (id: string) => {
    setSchedules(prev =>
      prev.map(schedule =>
        schedule.id === id ? { ...schedule, isActive: !schedule.isActive } : schedule
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Agendamento de Checklists</h2>
          <p className="text-muted-foreground">
            Configure e gerencie agendamentos automáticos de checklists
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Agenda
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova Agenda</DialogTitle>
              <DialogDescription>
                Configure um novo agendamento automático para checklists
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Título</Label>
                <Input id="title" placeholder="Nome da agenda" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">Tipo de Checklist</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="safety">Segurança</SelectItem>
                    <SelectItem value="environmental">Ambiental</SelectItem>
                    <SelectItem value="machine_routine">Rotina de Máquinas</SelectItem>
                    <SelectItem value="nautical_routine">Rotina Náutica</SelectItem>
                    <SelectItem value="dp">Posicionamento Dinâmico</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="frequency">Frequência</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a frequência" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Diário</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="monthly">Mensal</SelectItem>
                    <SelectItem value="quarterly">Trimestral</SelectItem>
                    <SelectItem value="annually">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="notifications" defaultChecked />
                <Label htmlFor="notifications">Ativar notificações</Label>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateSchedule}>Criar Agenda</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList>
          <TabsTrigger value="active">Agendas Ativas</TabsTrigger>
          <TabsTrigger value="inactive">Agendas Inativas</TabsTrigger>
          <TabsTrigger value="calendar">Calendário</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <div className="grid gap-4">
            {schedules
              .filter(s => s.isActive)
              .map(schedule => (
                <Card key={schedule.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{schedule.title}</CardTitle>
                        <CardDescription>
                          Próxima execução: {schedule.nextDue.toLocaleDateString("pt-BR")}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getFrequencyColor(schedule.frequency)}>
                          {schedule.frequency}
                        </Badge>
                        <Badge className={getStatusColor(schedule.isActive)}>
                          {schedule.isActive ? "Ativo" : "Inativo"}
                        </Badge>
                        {schedule.notifications && <Bell className="h-4 w-4 text-orange-500" />}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Tipo: {schedule.type}
                        </div>
                        {schedule.vesselId && (
                          <div className="flex items-center">
                            <Settings className="h-4 w-4 mr-1" />
                            Navio: {schedule.vesselId}
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4 mr-1" />
                          Configurar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleSchedule(schedule.id)}
                        >
                          {schedule.isActive ? "Desativar" : "Ativar"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="inactive" className="space-y-4">
          <div className="grid gap-4">
            {schedules
              .filter(s => !s.isActive)
              .map(schedule => (
                <Card key={schedule.id} className="opacity-60">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{schedule.title}</CardTitle>
                        <CardDescription>Agenda inativa</CardDescription>
                      </div>
                      <Badge className={getStatusColor(schedule.isActive)}>Inativo</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" size="sm" onClick={() => toggleSchedule(schedule.id)}>
                      Reativar
                    </Button>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Calendário de Checklists</CardTitle>
              <CardDescription>
                Visualização em calendário dos próximos checklists agendados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2 text-center text-sm font-medium">
                <div className="p-2">Dom</div>
                <div className="p-2">Seg</div>
                <div className="p-2">Ter</div>
                <div className="p-2">Qua</div>
                <div className="p-2">Qui</div>
                <div className="p-2">Sex</div>
                <div className="p-2">Sáb</div>
              </div>
              <div className="grid grid-cols-7 gap-2 mt-2">
                {Array.from({ length: 35 }, (_, i) => (
                  <div
                    key={i}
                    className="aspect-square p-2 border rounded-lg flex items-center justify-center text-sm"
                  >
                    {i + 1 <= 31 ? i + 1 : ""}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
