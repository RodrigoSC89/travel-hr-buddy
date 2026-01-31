/**
 * Vacation Calendar View - Interactive calendar for vacation management
 */
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, ChevronLeft, ChevronRight, Plus, User, Clock } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

interface Vacation {
  id: string;
  crew_member_name?: string;
  start_date: string;
  end_date: string;
  status: string;
  days?: number;
}

interface VacationCalendarViewProps {
  vacations: Vacation[];
}

export const VacationCalendarView: React.FC<VacationCalendarViewProps> = ({ vacations }) => {
  const { toast } = useToast();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showNewVacation, setShowNewVacation] = useState(false);
  const [newVacation, setNewVacation] = useState({ employee: "", startDate: "", endDate: "" });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getVacationsForDate = (date: Date) => {
    return vacations.filter(v => {
      const start = new Date(v.start_date);
      const end = new Date(v.end_date);
      return date >= start && date <= end;
    });
  };

  const handleCreateVacation = () => {
    if (!newVacation.employee || !newVacation.startDate || !newVacation.endDate) {
      toast({ title: "Erro", description: "Preencha todos os campos", variant: "destructive" });
      return;
    }
    toast({ 
      title: "✅ Férias Agendadas", 
      description: `Férias de ${newVacation.employee} agendadas de ${newVacation.startDate} a ${newVacation.endDate}` 
    });
    setShowNewVacation(false);
    setNewVacation({ employee: "", startDate: "", endDate: "" });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Calendário de Férias
          </CardTitle>
          <CardDescription>Visão mensal das férias programadas</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium w-32 text-center">
            {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
          </span>
          <Button variant="outline" size="sm" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button size="sm" onClick={() => setShowNewVacation(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Agendar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
            <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for days before month start */}
          {Array.from({ length: monthStart.getDay() }).map((_, i) => (
            <div key={`empty-${i}`} className="h-24 bg-muted/20 rounded" />
          ))}
          {days.map((day) => {
            const dayVacations = getVacationsForDate(day);
            const isSelected = selectedDate && day.toDateString() === selectedDate.toDateString();
            
            return (
              <div
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                className={`
                  h-24 p-1 border rounded cursor-pointer transition-colors
                  ${isToday(day) ? "border-primary bg-primary/5" : "border-border hover:bg-accent/50"}
                  ${isSelected ? "ring-2 ring-primary" : ""}
                  ${!isSameMonth(day, currentMonth) ? "opacity-50" : ""}
                `}
              >
                <div className="text-xs font-medium mb-1">{format(day, "d")}</div>
                <div className="space-y-0.5 overflow-hidden">
                  {dayVacations.slice(0, 2).map((v, i) => (
                    <div 
                      key={`${v.id}-${i}`}
                      className="text-xs truncate px-1 py-0.5 rounded bg-primary/10 text-primary"
                    >
                      {v.crew_member_name || "Colaborador"}
                    </div>
                  ))}
                  {dayVacations.length > 2 && (
                    <div className="text-xs text-muted-foreground">+{dayVacations.length - 2} mais</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected date details */}
        {selectedDate && (
          <div className="mt-4 p-4 border rounded-lg bg-muted/20">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {format(selectedDate, "dd 'de' MMMM, yyyy", { locale: ptBR })}
            </h4>
            {getVacationsForDate(selectedDate).length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma férias neste dia</p>
            ) : (
              <div className="space-y-2">
                {getVacationsForDate(selectedDate).map((v) => (
                  <div key={v.id} className="flex items-center justify-between p-2 bg-background rounded">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{v.crew_member_name || "Colaborador"}</span>
                    </div>
                    <Badge variant={v.status === "approved" ? "default" : "secondary"}>
                      {v.status === "approved" ? "Aprovado" : v.status === "pending" ? "Pendente" : v.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>

      {/* New Vacation Dialog */}
      <Dialog open={showNewVacation} onOpenChange={setShowNewVacation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agendar Férias</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Colaborador</Label>
              <Input 
                placeholder="Nome do colaborador"
                value={newVacation.employee}
                onChange={(e) => setNewVacation(prev => ({ ...prev, employee: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Data Início</Label>
                <Input 
                  type="date"
                  value={newVacation.startDate}
                  onChange={(e) => setNewVacation(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div>
                <Label>Data Fim</Label>
                <Input 
                  type="date"
                  value={newVacation.endDate}
                  onChange={(e) => setNewVacation(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewVacation(false)}>Cancelar</Button>
            <Button onClick={handleCreateVacation}>Agendar Férias</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
