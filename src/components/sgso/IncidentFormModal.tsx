import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DPIncident, SGSO_CATEGORIES, SGSO_RISK_LEVELS } from "@/types/incident";
import { Shield } from "lucide-react";

interface IncidentFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  incident?: DPIncident;
  onSave: (incident: DPIncident) => void;
}

export const IncidentFormModal: React.FC<IncidentFormModalProps> = ({
  open,
  onOpenChange,
  incident,
  onSave,
}) => {
  const [formData, setFormData] = useState<Partial<DPIncident>>(
    incident || {
      title: "",
      date: new Date().toISOString().split("T")[0],
      vessel: "",
      location: "",
      class_dp: "",
      root_cause: "",
      source: "IMCA",
      link: "",
      summary: "",
      tags: [],
      sgso_category: "",
      sgso_root_cause: "",
      sgso_risk_level: "baixo",
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newIncident: DPIncident = {
      id: incident?.id || `incident-${Date.now()}`,
      title: formData.title || "",
      date: formData.date || new Date().toISOString().split("T")[0],
      vessel: formData.vessel || "",
      location: formData.location || "",
      class_dp: formData.class_dp || "",
      root_cause: formData.root_cause || "",
      source: formData.source || "IMCA",
      link: formData.link || "",
      summary: formData.summary || "",
      tags: formData.tags || [],
      sgso_category: formData.sgso_category,
      sgso_root_cause: formData.sgso_root_cause,
      sgso_risk_level: formData.sgso_risk_level as any,
    };

    onSave(newIncident);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {incident ? "Editar Incidente" : "Novo Incidente"}
          </DialogTitle>
          <DialogDescription>
            Registre ou atualize informações do incidente com classificação SGSO
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground">
              Informações Básicas
            </h3>
            
            <div className="grid gap-4">
              <div>
                <Label htmlFor="title">Título do Incidente *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                  placeholder="Ex: Perda de posição durante operação"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Data *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="vessel">Embarcação *</Label>
                  <Input
                    id="vessel"
                    value={formData.vessel}
                    onChange={(e) =>
                      setFormData({ ...formData, vessel: e.target.value })
                    }
                    required
                    placeholder="Ex: FPSO X"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Localização</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    placeholder="Ex: Bacia de Santos"
                  />
                </div>

                <div>
                  <Label htmlFor="class_dp">Classe DP</Label>
                  <Select
                    value={formData.class_dp}
                    onValueChange={(value) =>
                      setFormData({ ...formData, class_dp: value })
                    }
                  >
                    <SelectTrigger id="class_dp">
                      <SelectValue placeholder="Selecione a classe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DP1">DP1</SelectItem>
                      <SelectItem value="DP2">DP2</SelectItem>
                      <SelectItem value="DP3">DP3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="summary">Resumo do Incidente</Label>
                <Textarea
                  id="summary"
                  value={formData.summary}
                  onChange={(e) =>
                    setFormData({ ...formData, summary: e.target.value })
                  }
                  placeholder="Descreva o que aconteceu..."
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* SGSO Classification */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Classificação SGSO
            </h3>

            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <div>
                <Label htmlFor="sgso_category">Categoria SGSO</Label>
                <Select
                  value={formData.sgso_category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, sgso_category: value })
                  }
                >
                  <SelectTrigger id="sgso_category">
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {SGSO_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="sgso_risk_level">Nível de Risco</Label>
                <Select
                  value={formData.sgso_risk_level}
                  onValueChange={(value) =>
                    setFormData({ ...formData, sgso_risk_level: value as any })
                  }
                >
                  <SelectTrigger id="sgso_risk_level">
                    <SelectValue placeholder="Selecione o nível de risco" />
                  </SelectTrigger>
                  <SelectContent>
                    {SGSO_RISK_LEVELS.map((risk) => (
                      <SelectItem key={risk.value} value={risk.value}>
                        {risk.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="sgso_root_cause">Causa Raiz Identificada</Label>
              <Input
                id="sgso_root_cause"
                value={formData.sgso_root_cause}
                onChange={(e) =>
                  setFormData({ ...formData, sgso_root_cause: e.target.value })
                }
                placeholder="Ex: Erro no PLC do DP, Falta de manutenção preventiva"
              />
            </div>

            <div>
              <Label htmlFor="root_cause">Análise da Causa Raiz (Detalhada)</Label>
              <Textarea
                id="root_cause"
                value={formData.root_cause}
                onChange={(e) =>
                  setFormData({ ...formData, root_cause: e.target.value })
                }
                placeholder="Descrição detalhada da análise da causa raiz..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {incident ? "Atualizar" : "Criar"} Incidente
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default IncidentFormModal;
