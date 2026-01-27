/**
 * SGSOAuditDialog - Extracted from SgsoDashboard
 * Dialog for scheduling SGSO audits
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FileText, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AuditForm {
  title: string;
  type: string;
  scope: string;
  auditor: string;
  scheduledDate: string;
  practices: string;
}

interface SGSOAuditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triggerClassName?: string;
}

const initialForm: AuditForm = {
  title: "",
  type: "",
  scope: "",
  auditor: "",
  scheduledDate: "",
  practices: ""
};

export function SGSOAuditDialog({ open, onOpenChange, triggerClassName }: SGSOAuditDialogProps) {
  const [form, setForm] = useState<AuditForm>(initialForm);
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!form.title || !form.type || !form.scheduledDate) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "✅ Auditoria Agendada",
      description: `Auditoria "${form.title}" agendada para ${form.scheduledDate}.`
    });
    onOpenChange(false);
    setForm(initialForm);
  };

  const updateField = (field: keyof AuditForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="default" className={triggerClassName || "bg-primary hover:bg-primary/90 text-primary-foreground h-auto py-6 flex-col gap-2"}>
          <FileText className="h-6 w-6" />
          <span className="font-semibold">Nova Auditoria</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Agendar Nova Auditoria
          </DialogTitle>
          <DialogDescription>
            Planeje uma auditoria interna ou externa
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="audit-title">Título da Auditoria *</Label>
            <Input
              id="audit-title"
              placeholder="Ex: Auditoria Prática 13 - Segurança"
              value={form.title}
              onChange={(e) => updateField('title', e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo *</Label>
              <Select value={form.type} onValueChange={(v) => updateField('type', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="internal">Interna</SelectItem>
                  <SelectItem value="external">Externa</SelectItem>
                  <SelectItem value="anp">ANP</SelectItem>
                  <SelectItem value="certification">Certificação</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="audit-date">Data Agendada *</Label>
              <Input
                id="audit-date"
                type="date"
                value={form.scheduledDate}
                onChange={(e) => updateField('scheduledDate', e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="audit-auditor">Auditor Responsável</Label>
            <Input
              id="audit-auditor"
              placeholder="Nome do auditor"
              value={form.auditor}
              onChange={(e) => updateField('auditor', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="audit-scope">Escopo</Label>
            <Textarea
              id="audit-scope"
              placeholder="Descreva o escopo da auditoria..."
              rows={3}
              value={form.scope}
              onChange={(e) => updateField('scope', e.target.value)}
            />
          </div>
          <Button className="w-full" onClick={handleSubmit}>
            <Save className="h-4 w-4 mr-2" />
            Agendar Auditoria
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
