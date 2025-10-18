import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DPIncident, SGSO_CATEGORIES, SGSORiskLevel } from "@/types/incident";
import { Save } from "lucide-react";

interface IncidentFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  incident?: DPIncident;
  onSave: (incident: Partial<DPIncident>) => void;
}

export function IncidentFormModal({ open, onOpenChange, incident, onSave }: IncidentFormModalProps) {
  const [formData, setFormData] = useState<Partial<DPIncident>>({
    vessel: incident?.vessel || "",
    incident_date: incident?.incident_date || new Date().toISOString().split('T')[0],
    severity: incident?.severity || "Média",
    title: incident?.title || "",
    description: incident?.description || "",
    root_cause: incident?.root_cause || "",
    location: incident?.location || "",
    class_dp: incident?.class_dp || "DP2",
    sgso_category: incident?.sgso_category || "",
    sgso_root_cause: incident?.sgso_root_cause || "",
    sgso_risk_level: incident?.sgso_risk_level || "moderado",
  });

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
            Preencha as informações básicas e a classificação SGSO do incidente.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
              Informações Básicas
            </h3>

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
                <Label htmlFor="incident_date">Data do Incidente *</Label>
                <Input
                  id="incident_date"
                  type="date"
                  value={formData.incident_date}
                  onChange={(e) => handleChange("incident_date", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="class_dp">Classe DP *</Label>
                <Select
                  value={formData.class_dp}
                  onValueChange={(value) => handleChange("class_dp", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a classe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DP1">DP1</SelectItem>
                    <SelectItem value="DP2">DP2</SelectItem>
                    <SelectItem value="DP3">DP3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="severity">Severidade *</Label>
                <Select
                  value={formData.severity}
                  onValueChange={(value) => handleChange("severity", value as "Alta" | "Média" | "Baixa")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a severidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Alta">Alta</SelectItem>
                    <SelectItem value="Média">Média</SelectItem>
                    <SelectItem value="Baixa">Baixa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Localização</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleChange("location", e.target.value)}
                placeholder="Ex: Santos Basin, Campos Basin"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Título do Incidente *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="Breve descrição do incidente"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição Detalhada</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Descreva o incidente em detalhes..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="root_cause">Causa Raiz</Label>
              <Input
                id="root_cause"
                value={formData.root_cause}
                onChange={(e) => handleChange("root_cause", e.target.value)}
                placeholder="Causa raiz identificada"
              />
            </div>
          </div>

          {/* SGSO Classification Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
              Classificação SGSO
            </h3>

            <div className="space-y-2">
              <Label htmlFor="sgso_category">Categoria SGSO</Label>
              <Select
                value={formData.sgso_category}
                onValueChange={(value) => handleChange("sgso_category", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {SGSO_CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sgso_risk_level">Nível de Risco SGSO</Label>
              <Select
                value={formData.sgso_risk_level}
                onValueChange={(value) => handleChange("sgso_risk_level", value as SGSORiskLevel)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o nível de risco" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="crítico">🔴 Crítico</SelectItem>
                  <SelectItem value="alto">🟠 Alto</SelectItem>
                  <SelectItem value="moderado">🟡 Moderado</SelectItem>
                  <SelectItem value="baixo">🟢 Baixo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sgso_root_cause">Causa Raiz SGSO</Label>
              <Textarea
                id="sgso_root_cause"
                value={formData.sgso_root_cause}
                onChange={(e) => handleChange("sgso_root_cause", e.target.value)}
                placeholder="Causa raiz identificada dentro do framework SGSO..."
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              {incident ? "Atualizar" : "Criar"} Incidente
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
