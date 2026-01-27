/**
 * SGSORiskDialog - Extracted from SgsoDashboard
 * Dialog for registering SGSO risks
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
import { AlertTriangle, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RiskForm {
  title: string;
  category: string;
  probability: string;
  impact: string;
  description: string;
  mitigation: string;
}

interface SGSORiskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triggerClassName?: string;
}

const initialForm: RiskForm = {
  title: "",
  category: "",
  probability: "",
  impact: "",
  description: "",
  mitigation: ""
};

export function SGSORiskDialog({ open, onOpenChange, triggerClassName }: SGSORiskDialogProps) {
  const [form, setForm] = useState<RiskForm>(initialForm);
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!form.title || !form.probability || !form.impact) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }
    
    const score = parseInt(form.probability) * parseInt(form.impact);
    let level = "Baixo";
    if (score >= 20) level = "Crítico";
    else if (score >= 15) level = "Alto";
    else if (score >= 8) level = "Médio";
    
    toast({
      title: "✅ Risco Registrado",
      description: `Risco "${form.title}" classificado como ${level} (Score: ${score}).`
    });
    onOpenChange(false);
    setForm(initialForm);
  };

  const updateField = (field: keyof RiskForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="default" className={triggerClassName || "bg-warning hover:bg-warning/90 text-warning-foreground h-auto py-6 flex-col gap-2"}>
          <AlertTriangle className="h-6 w-6" />
          <span className="font-semibold">Registrar Risco</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Registrar Novo Risco
          </DialogTitle>
          <DialogDescription>
            Identificação e avaliação de risco conforme matriz 5x5
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="risk-title">Descrição do Risco *</Label>
            <Input
              id="risk-title"
              placeholder="Ex: Falha no sistema de combate a incêndio"
              value={form.title}
              onChange={(e) => updateField('title', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select value={form.category} onValueChange={(v) => updateField('category', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="operational">Operacional</SelectItem>
                <SelectItem value="health_safety">Saúde e Segurança</SelectItem>
                <SelectItem value="environmental">Ambiental</SelectItem>
                <SelectItem value="equipment">Equipamento</SelectItem>
                <SelectItem value="process">Processo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Probabilidade (1-5) *</Label>
              <Select value={form.probability} onValueChange={(v) => updateField('probability', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Muito Baixa</SelectItem>
                  <SelectItem value="2">2 - Baixa</SelectItem>
                  <SelectItem value="3">3 - Média</SelectItem>
                  <SelectItem value="4">4 - Alta</SelectItem>
                  <SelectItem value="5">5 - Muito Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Impacto (1-5) *</Label>
              <Select value={form.impact} onValueChange={(v) => updateField('impact', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Insignificante</SelectItem>
                  <SelectItem value="2">2 - Menor</SelectItem>
                  <SelectItem value="3">3 - Moderado</SelectItem>
                  <SelectItem value="4">4 - Maior</SelectItem>
                  <SelectItem value="5">5 - Catastrófico</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="risk-mitigation">Medidas de Mitigação</Label>
            <Textarea
              id="risk-mitigation"
              placeholder="Descreva as medidas de controle e mitigação..."
              rows={3}
              value={form.mitigation}
              onChange={(e) => updateField('mitigation', e.target.value)}
            />
          </div>
          <Button className="w-full bg-warning hover:bg-warning/90 text-warning-foreground" onClick={handleSubmit}>
            <Save className="h-4 w-4 mr-2" />
            Registrar Risco
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
