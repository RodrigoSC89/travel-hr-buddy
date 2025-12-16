import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings } from "lucide-react";

interface Props { open: boolean; onOpenChange: (open: boolean) => void; }

export function SettingsDialog({ open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle className="flex items-center gap-2"><Settings className="h-5 w-5" />Configurações</DialogTitle></DialogHeader>
        <div className="space-y-6 py-4">
          <div className="flex items-center justify-between"><div><Label>Notificações por Email</Label><p className="text-xs text-muted-foreground">Receber alertas de drills</p></div><Switch defaultChecked /></div>
          <div className="flex items-center justify-between"><div><Label>Alertas de Certificação</Label><p className="text-xs text-muted-foreground">Avisar 90 dias antes do vencimento</p></div><Switch defaultChecked /></div>
          <div className="space-y-2"><Label>Idioma dos Relatórios</Label><Select defaultValue="pt"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="pt">Português</SelectItem><SelectItem value="en">English</SelectItem></SelectContent></Select></div>
          <div className="space-y-2"><Label>Embarcação Padrão</Label><Select defaultValue="all"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todas</SelectItem><SelectItem value="vessel1">Vessel 1</SelectItem><SelectItem value="vessel2">Vessel 2</SelectItem></SelectContent></Select></div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
