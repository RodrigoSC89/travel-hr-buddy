import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter } from "lucide-react";

interface Props { open: boolean; onOpenChange: (open: boolean) => void; }

export const FiltersDialog = memo(function({ open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle className="flex items-center gap-2"><Filter className="h-5 w-5" />Filtros</DialogTitle></DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2"><Label>Status</Label><div className="space-y-2">{["Concluído", "Pendente", "Atrasado", "Em Andamento"].map(s => <div key={s} className="flex items-center gap-2"><Checkbox id={s} defaultChecked /><Label htmlFor={s} className="font-normal">{s}</Label></div>)}</div></div>
          <div className="space-y-2"><Label>Tipo de Drill</Label><Select defaultValue="all"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todos</SelectItem><SelectItem value="fire">Incêndio</SelectItem><SelectItem value="abandon">Abandono</SelectItem><SelectItem value="mob">MOB</SelectItem><SelectItem value="isps">ISPS</SelectItem></SelectContent></Select></div>
          <div className="space-y-2"><Label>Período</Label><Select defaultValue="all"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todo o período</SelectItem><SelectItem value="week">Última semana</SelectItem><SelectItem value="month">Último mês</SelectItem><SelectItem value="quarter">Último trimestre</SelectItem></SelectContent></Select></div>
        </div>
        <DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Limpar</Button><Button onClick={() => onOpenChange(false)}>Aplicar Filtros</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
