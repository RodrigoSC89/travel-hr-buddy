import { useState, useCallback } from "react";;
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Calendar as CalendarIcon,
  Plus,
  Ship,
  Users,
  Clock,
  ArrowRightLeft,
  AlertTriangle,
  CheckCircle,
  Search,
  Filter,
  Download,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Schedule {
  id: string;
  crewMemberId: string;
  crewMemberName: string;
  vesselId: string;
  vesselName: string;
  position: string;
  embarqueDate: Date;
  desembarqueDate: Date;
  status: "scheduled" | "active" | "completed" | "cancelled";
  type: "regular" | "emergency" | "transfer";
}

interface Vessel {
  id: string;
  name: string;
  capacity: number;
  currentCrew: number;
}

export const CrewScheduleManager = memo(() => {
  const [schedules, setSchedules] = useState<Schedule[]>([
    {
      id: "1",
      crewMemberId: "1",
      crewMemberName: "João Silva",
      vesselId: "v1",
      vesselName: "Navio Aurora",
      position: "Comandante",
      embarqueDate: new Date(2024, 2, 1),
      desembarqueDate: new Date(2024, 3, 15),
      status: "active",
      type: "regular"
    },
    {
      id: "2",
      crewMemberId: "2",
      crewMemberName: "Carlos Santos",
      vesselId: "v1",
      vesselName: "Navio Aurora",
      position: "Chefe de Máquinas",
      embarqueDate: new Date(2024, 2, 1),
      desembarqueDate: new Date(2024, 3, 15),
      status: "active",
      type: "regular"
    },
    {
      id: "3",
      crewMemberId: "3",
      crewMemberName: "Maria Oliveira",
      vesselId: "v2",
      vesselName: "Navio Estrela",
      position: "Oficial de Convés",
      embarqueDate: new Date(2024, 3, 1),
      desembarqueDate: new Date(2024, 4, 15),
      status: "scheduled",
      type: "regular"
    },
    {
      id: "4",
      crewMemberId: "4",
      crewMemberName: "Pedro Costa",
      vesselId: "v2",
      vesselName: "Navio Estrela",
      position: "Marinheiro",
      embarqueDate: new Date(2024, 1, 15),
      desembarqueDate: new Date(2024, 2, 28),
      status: "completed",
      type: "regular"
    }
  ]);

  const [vessels] = useState<Vessel[]>([
    { id: "v1", name: "Navio Aurora", capacity: 25, currentCrew: 18 },
    { id: "v2", name: "Navio Estrela", capacity: 30, currentCrew: 22 },
    { id: "v3", name: "Navio Netuno", capacity: 20, currentCrew: 15 }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isNewScheduleOpen, setIsNewScheduleOpen] = useState(false);
  const [embarqueDate, setEmbarqueDate] = useState<Date>();
  const [desembarqueDate, setDesembarqueDate] = useState<Date>();

  const getStatusBadge = (status: Schedule["status"]) => {
    switch (status) {
    case "active":
      return <Badge className="bg-success text-success-foreground">Ativo</Badge>;
    case "scheduled":
      return <Badge className="bg-info text-info-foreground">Agendado</Badge>;
    case "completed":
      return <Badge variant="secondary">Concluído</Badge>;
    case "cancelled":
      return <Badge variant="destructive">Cancelado</Badge>;
    }
  };

  const getTypeBadge = (type: Schedule["type"]) => {
    switch (type) {
    case "regular":
      return <Badge variant="outline">Regular</Badge>;
    case "emergency":
      return <Badge variant="destructive">Emergência</Badge>;
    case "transfer":
      return <Badge variant="secondary">Transferência</Badge>;
    };
  };

  const filteredSchedules = schedules.filter(schedule => {
    const matchesSearch = schedule.crewMemberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.vesselName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || schedule.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCount = schedules.filter(s => s.status === "active").length;
  const scheduledCount = schedules.filter(s => s.status === "scheduled").length;
  const completedCount = schedules.filter(s => s.status === "completed").length;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Embarcados Ativos</p>
                <p className="text-2xl font-bold text-success">{activeCount}</p>
              </div>
              <Ship className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Agendados</p>
                <p className="text-2xl font-bold text-info">{scheduledCount}</p>
              </div>
              <CalendarIcon className="h-8 w-8 text-info" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Concluídos (Mês)</p>
                <p className="text-2xl font-bold">{completedCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Alertas</p>
                <p className="text-2xl font-bold text-warning">2</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vessel Capacity Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ship className="h-5 w-5" />
            Capacidade de Tripulação por Embarcação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {vessels.map((vessel) => {
              const percentage = (vessel.currentCrew / vessel.capacity) * 100;
              return (
                <div key={vessel.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{vessel.name}</span>
                    <Badge variant={percentage > 90 ? "destructive" : percentage > 70 ? "secondary" : "outline"}>
                      {vessel.currentCrew}/{vessel.capacity}
                    </Badge>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={cn(
                        "h-2 rounded-full transition-all",
                        percentage > 90 ? "bg-destructive" : percentage > 70 ? "bg-warning" : "bg-success"
                      )}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Schedules List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Escalas e Embarques
              </CardTitle>
              <CardDescription>Gerenciamento de embarques e rotação de tripulação</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Sincronizar
              </Button>
              <Dialog open={isNewScheduleOpen} onOpenChange={setIsNewScheduleOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Escala
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Criar Nova Escala</DialogTitle>
                    <DialogDescription>Agende um novo embarque para um tripulante</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label>Tripulante</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tripulante" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">João Silva - Comandante</SelectItem>
                          <SelectItem value="2">Carlos Santos - Chefe de Máquinas</SelectItem>
                          <SelectItem value="3">Maria Oliveira - Oficial de Convés</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Embarcação</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a embarcação" />
                        </SelectTrigger>
                        <SelectContent>
                          {vessels.map((vessel) => (
                            <SelectItem key={vessel.id} value={vessel.id}>
                              {vessel.name} ({vessel.currentCrew}/{vessel.capacity})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Data de Embarque</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-left font-normal">
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {embarqueDate ? format(embarqueDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={embarqueDate}
                              onSelect={setEmbarqueDate}
                              locale={ptBR}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div>
                        <Label>Data de Desembarque</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-left font-normal">
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {desembarqueDate ? format(desembarqueDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={desembarqueDate}
                              onSelect={setDesembarqueDate}
                              locale={ptBR}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    <div>
                      <Label>Tipo</Label>
                      <Select defaultValue="regular">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="regular">Regular</SelectItem>
                          <SelectItem value="emergency">Emergência</SelectItem>
                          <SelectItem value="transfer">Transferência</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" onClick={handleSetIsNewScheduleOpen}>
                        Cancelar
                      </Button>
                      <Button onClick={handleSetIsNewScheduleOpen}>
                        Criar Escala
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por tripulante ou embarcação..."
                value={searchTerm}
                onChange={handleChange}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="scheduled">Agendados</SelectItem>
                <SelectItem value="completed">Concluídos</SelectItem>
                <SelectItem value="cancelled">Cancelados</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Schedules Table */}
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {filteredSchedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{schedule.crewMemberName}</span>
                        {getTypeBadge(schedule.type)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {schedule.position} • {schedule.vesselName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-3 w-3" />
                        {format(schedule.embarqueDate, "dd/MM/yyyy", { locale: ptBR })}
                        <ArrowRightLeft className="h-3 w-3" />
                        {format(schedule.desembarqueDate, "dd/MM/yyyy", { locale: ptBR })}
                      </div>
                    </div>
                    {getStatusBadge(schedule.status)}
                    <Button variant="ghost" size="sm">
                      Detalhes
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default CrewScheduleManager;
