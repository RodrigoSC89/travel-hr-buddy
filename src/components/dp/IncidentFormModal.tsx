import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DPIncident, SGSO_CATEGORIES, SGSORiskLevel } from "@/types/incident";

interface IncidentFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  incident?: DPIncident | null;
  onSave: (incident: Partial<DPIncident>) => void;
}

export function IncidentFormModal({ open, onOpenChange, incident, onSave }: IncidentFormModalProps) {
  const [formData, setFormData] = useState<Partial<DPIncident>>(
    incident || {
      title: "",
      date: "",
      vessel: "",
      location: "",
      class_dp: "DP2",
      summary: "",
      sgso_category: "",
      sgso_root_cause: "",
      sgso_risk_level: undefined,
      tags: []
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onOpenChange(false);
  };

  const handleChange = (field: keyof DPIncident, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {incident ? "Editar Incidente DP" : "Novo Incidente DP"}
          </DialogTitle>
          <DialogDescription>
            Preencha as informações do incidente e sua classificação SGSO
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 border-b pb-2">Informações Básicas</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  placeholder="Título do incidente"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Data *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleChange("date", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vessel">Embarcação *</Label>
                <Input
                  id="vessel"
                  value={formData.vessel}
                  onChange={(e) => handleChange("vessel", e.target.value)}
                  placeholder="Nome da embarcação"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Localização *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                  placeholder="Localização do incidente"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="class_dp">Classe DP *</Label>
              <Select 
                value={formData.class_dp} 
                onValueChange={(value) => handleChange("class_dp", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a classe DP" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DP1">DP Class 1</SelectItem>
                  <SelectItem value="DP2">DP Class 2</SelectItem>
                  <SelectItem value="DP3">DP Class 3</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="summary">Resumo *</Label>
              <Textarea
                id="summary"
                value={formData.summary}
                onChange={(e) => handleChange("summary", e.target.value)}
                placeholder="Descrição detalhada do incidente"
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="link">Link do Relatório</Label>
              <Input
                id="link"
                type="url"
                value={formData.link || ""}
                onChange={(e) => handleChange("link", e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>

          {/* SGSO Classification Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 border-b pb-2">Classificação SGSO</h3>
            
            <div className="space-y-2">
              <Label htmlFor="sgso_category">Categoria SGSO *</Label>
              <Select 
                value={formData.sgso_category} 
                onValueChange={(value) => handleChange("sgso_category", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria SGSO" />
                </SelectTrigger>
                <SelectContent>
                  {SGSO_CATEGORIES.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sgso_risk_level">Nível de Risco *</Label>
              <Select 
                value={formData.sgso_risk_level} 
                onValueChange={(value) => handleChange("sgso_risk_level", value as SGSORiskLevel)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o nível de risco" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixo">🟢 Baixo</SelectItem>
                  <SelectItem value="moderado">🟡 Moderado</SelectItem>
                  <SelectItem value="alto">🟠 Alto</SelectItem>
                  <SelectItem value="crítico">🔴 Crítico</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sgso_root_cause">Causa Raiz SGSO *</Label>
              <Textarea
                id="sgso_root_cause"
                value={formData.sgso_root_cause || ""}
                onChange={(e) => handleChange("sgso_root_cause", e.target.value)}
                placeholder="Descrição da causa raiz identificada"
                rows={3}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {incident ? "Salvar Alterações" : "Criar Incidente"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
