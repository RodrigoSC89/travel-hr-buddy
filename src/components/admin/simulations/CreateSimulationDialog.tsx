import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SimulationFormData, SimulationType } from "@/types/simulation";

interface CreateSimulationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateSimulationDialog: React.FC<CreateSimulationDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<SimulationFormData>({
    vessel_id: "",
    type: "DP" as SimulationType,
    frequency_days: 90,
    normative_reference: "",
    notes: "",
  });

  const { data: vessels } = useQuery({
    queryKey: ["vessels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vessels")
        .select("id, name")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: SimulationFormData) => {
      const { error } = await supabase
        .from("simulation_exercises")
        .insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["simulation-exercises"] });
      queryClient.invalidateQueries({ queryKey: ["simulation-stats"] });
      toast.success("Simulação agendada com sucesso!");
      onOpenChange(false);
      setFormData({
        vessel_id: "",
        type: "DP" as SimulationType,
        frequency_days: 90,
        normative_reference: "",
        notes: "",
      });
    },
    onError: (error) => {
      toast.error("Erro ao agendar simulação: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.vessel_id) {
      toast.error("Selecione uma embarcação");
      return;
    }
    createMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Agendar Nova Simulação</DialogTitle>
          <DialogDescription>
            Registre uma nova simulação obrigatória para a embarcação
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="vessel">Embarcação *</Label>
              <Select
                value={formData.vessel_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, vessel_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma embarcação" />
                </SelectTrigger>
                <SelectContent>
                  {vessels?.map((vessel) => (
                    <SelectItem key={vessel.id} value={vessel.id}>
                      {vessel.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo de Simulação *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value as SimulationType })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DP">DP</SelectItem>
                  <SelectItem value="Blackout">Blackout</SelectItem>
                  <SelectItem value="Abandono">Abandono</SelectItem>
                  <SelectItem value="Incêndio">Incêndio</SelectItem>
                  <SelectItem value="Man Overboard">Man Overboard</SelectItem>
                  <SelectItem value="Derramamento">Derramamento</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">Frequência (dias) *</Label>
              <Input
                id="frequency"
                type="number"
                value={formData.frequency_days}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    frequency_days: parseInt(e.target.value) || 90,
                  })
                }
                min="1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="normative">Referência Normativa</Label>
              <Input
                id="normative"
                placeholder="IMCA M220, IBAMA SGSO, etc"
                value={formData.normative_reference}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    normative_reference: e.target.value,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                placeholder="Notas adicionais sobre a simulação"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Agendando..." : "Agendar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
