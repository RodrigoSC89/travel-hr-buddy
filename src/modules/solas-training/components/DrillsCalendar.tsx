import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import {
  Calendar as CalendarIcon,
  Play,
  FileText,
  Clock,
  Users,
  Flame,
  LifeBuoy,
  Anchor,
  Siren,
  ShieldAlert,
  Heart,
  AlertTriangle,
  Check,
  Plus,
} from "lucide-react";
import { Drill } from "../types";
import { format, parseISO, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DrillsCalendarProps {
  drills: Drill[];
  onStartDrill: (drill: Drill) => void;
  onScheduleDrill: (drill: Drill, date: Date) => void;
  onViewReport: (drill: Drill) => void;
}

const drillTypeIcons: Record<Drill['type'], React.ComponentType<any>> = {
  fire: Flame,
  abandon: LifeBuoy,
  mob: Anchor,
  blackout: Siren,
  collision: AlertTriangle,
  pollution: Siren,
  security: ShieldAlert,
  medical: Heart,
};

const drillTypeColors: Record<Drill['type'], string> = {
  fire: "text-red-500 bg-red-500/10",
  abandon: "text-blue-500 bg-blue-500/10",
  mob: "text-cyan-500 bg-cyan-500/10",
  blackout: "text-amber-500 bg-amber-500/10",
  collision: "text-orange-500 bg-orange-500/10",
  pollution: "text-green-500 bg-green-500/10",
  security: "text-purple-500 bg-purple-500/10",
  medical: "text-pink-500 bg-pink-500/10",
};

export default function DrillsCalendar({ drills, onStartDrill, onScheduleDrill, onViewReport }: DrillsCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showStartDialog, setShowStartDialog] = useState(false);
  const [selectedDrill, setSelectedDrill] = useState<Drill | null>(null);
  const [scheduleTime, setScheduleTime] = useState("10:00");
  const [drillNotes, setDrillNotes] = useState("");
  const { toast } = useToast();

  const getDrillsForDate = (date: Date) => {
    return drills.filter(drill => {
      if (drill.scheduledDate) {
        return isSameDay(parseISO(drill.scheduledDate), date);
      }
      if (drill.nextDue) {
        return isSameDay(parseISO(drill.nextDue), date);
      }
      return false;
    });
  };

  const handleSchedule = (drill: Drill) => {
    setSelectedDrill(drill);
    setShowScheduleDialog(true);
  };

  const handleConfirmSchedule = () => {
    if (selectedDrill) {
      onScheduleDrill(selectedDrill, selectedDate);
      toast({
        title: "Drill Agendado",
        description: `${selectedDrill.name} agendado para ${format(selectedDate, "dd/MM/yyyy", { locale: ptBR })} às ${scheduleTime}`,
      });
      setShowScheduleDialog(false);
      setSelectedDrill(null);
    }
  };

  const handleStartDrill = (drill: Drill) => {
    setSelectedDrill(drill);
    setShowStartDialog(true);
  };

  const handleConfirmStart = () => {
    if (selectedDrill) {
      onStartDrill(selectedDrill);
      toast({
        title: "Drill Iniciado",
        description: `${selectedDrill.name} foi iniciado. Registre a participação da tripulação.`,
      });
      setShowStartDialog(false);
      setSelectedDrill(null);
      setDrillNotes("");
    }
  };

  const scheduledDates = drills
    .filter(d => d.scheduledDate || d.nextDue)
    .map(d => parseISO(d.scheduledDate || d.nextDue));

  const selectedDayDrills = getDrillsForDate(selectedDate);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Calendário de Drills
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              locale={ptBR}
              className="rounded-md border"
              modifiers={{
                scheduled: scheduledDates,
              }}
              modifiersClassNames={{
                scheduled: "bg-primary/20 font-bold",
              }}
            />
          </CardContent>
        </Card>

        {/* Drills for Selected Date */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Drills - {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
              <Button size="sm" onClick={() => handleSchedule(drills[0])}>
                <Plus className="h-4 w-4 mr-2" />
                Agendar Novo
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDayDrills.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum drill agendado para esta data</p>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedDayDrills.map(drill => {
                  const Icon = drillTypeIcons[drill.type];
                  return (
                    <div key={drill.id} className={`p-4 rounded-lg border ${
                      drill.status === 'overdue' ? 'border-destructive/50 bg-destructive/5' :
                      drill.status === 'completed' ? 'border-green-500/50 bg-green-500/5' :
                      'border-border'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${drillTypeColors[drill.type]}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="font-medium">{drill.name}</h4>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {drill.scheduledDate ? format(parseISO(drill.scheduledDate), "HH:mm") : "A definir"}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {drill.totalCrew} tripulantes
                              </span>
                            </div>
                          </div>
                        </div>
                        <Badge variant={
                          drill.status === 'completed' ? 'default' :
                          drill.status === 'overdue' ? 'destructive' :
                          drill.status === 'scheduled' ? 'secondary' : 'outline'
                        }>
                          {drill.status === 'completed' ? 'Concluído' :
                           drill.status === 'overdue' ? 'Atrasado' :
                           drill.status === 'scheduled' ? 'Agendado' : 'Pendente'}
                        </Badge>
                      </div>
                      <div className="flex gap-2 mt-4">
                        {drill.status !== 'completed' && (
                          <>
                            <Button size="sm" onClick={() => handleStartDrill(drill)}>
                              <Play className="h-4 w-4 mr-2" />
                              Iniciar Drill
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleSchedule(drill)}>
                              <CalendarIcon className="h-4 w-4 mr-2" />
                              Reagendar
                            </Button>
                          </>
                        )}
                        {drill.reportGenerated && (
                          <Button variant="outline" size="sm" onClick={() => onViewReport(drill)}>
                            <FileText className="h-4 w-4 mr-2" />
                            Ver Relatório
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* All Drills List */}
      <Card>
        <CardHeader>
          <CardTitle>Todos os Exercícios Obrigatórios</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {drills.map(drill => {
                const Icon = drillTypeIcons[drill.type];
                return (
                  <div key={drill.id} className={`p-4 rounded-lg border ${
                    drill.status === 'overdue' ? 'bg-destructive/5 border-destructive/30' :
                    drill.status === 'due' ? 'bg-amber-500/5 border-amber-500/30' :
                    drill.status === 'completed' ? 'bg-muted/30' : ''
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${drillTypeColors[drill.type]}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{drill.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Frequência: {drill.frequencyLabel} • Próximo: {format(parseISO(drill.nextDue), "dd/MM/yyyy")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          drill.status === 'completed' ? 'default' :
                          drill.status === 'overdue' ? 'destructive' :
                          drill.status === 'scheduled' ? 'secondary' : 'outline'
                        }>
                          {drill.status === 'completed' ? 'Concluído' :
                           drill.status === 'overdue' ? 'Atrasado' :
                           drill.status === 'scheduled' ? 'Agendado' : 'Pendente'}
                        </Badge>
                        {drill.status !== 'completed' && (
                          <Button variant="outline" size="sm" onClick={() => handleSchedule(drill)}>
                            Agendar
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Schedule Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agendar Drill</DialogTitle>
            <DialogDescription>
              Selecione a data e horário para o exercício
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Exercício</Label>
              <Select defaultValue={selectedDrill?.id}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o drill" />
                </SelectTrigger>
                <SelectContent>
                  {drills.filter(d => d.status !== 'completed').map(drill => (
                    <SelectItem key={drill.id} value={drill.id}>{drill.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data</Label>
                <Input 
                  type="date" 
                  value={format(selectedDate, "yyyy-MM-dd")}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>Horário</Label>
                <Input 
                  type="time" 
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea placeholder="Notas adicionais sobre o exercício..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>Cancelar</Button>
            <Button onClick={handleConfirmSchedule}>
              <Check className="h-4 w-4 mr-2" />
              Confirmar Agendamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Start Drill Dialog */}
      <Dialog open={showStartDialog} onOpenChange={setShowStartDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Iniciar Drill: {selectedDrill?.name}</DialogTitle>
            <DialogDescription>
              Confirme para iniciar o exercício e registrar participações
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Informações do Exercício</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Tipo: {selectedDrill?.name}</li>
                <li>• Frequência: {selectedDrill?.frequencyLabel}</li>
                <li>• Tripulação esperada: {selectedDrill?.totalCrew} pessoas</li>
              </ul>
            </div>
            <div className="space-y-2">
              <Label>Notas Iniciais</Label>
              <Textarea 
                placeholder="Condições, observações pré-exercício..."
                value={drillNotes}
                onChange={(e) => setDrillNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStartDialog(false)}>Cancelar</Button>
            <Button onClick={handleConfirmStart}>
              <Play className="h-4 w-4 mr-2" />
              Iniciar Exercício
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
