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
import { TrainingFormData } from "@/types/training";

interface CreateTrainingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateTrainingDialog: React.FC<CreateTrainingDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<TrainingFormData>({
    crew_id: "",
    training_module_id: "",
    date_completed: "",
    result: "",
    notes: "",
  });

  const { data: crew } = useQuery({
    queryKey: ["crew-members"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crew_members")
        .select("id, full_name, position")
        .order("full_name");
      if (error) throw error;
      return data;
    },
  });

  const { data: modules } = useQuery({
    queryKey: ["training-modules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("training_modules")
        .select("id, title, category")
        .order("title");
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: TrainingFormData) => {
      const { error } = await supabase
        .from("crew_training_records")
        .insert([{ ...data, status: "completed" }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crew-training-records"] });
      queryClient.invalidateQueries({ queryKey: ["training-stats"] });
      toast.success("Treinamento registrado com sucesso!");
      onOpenChange(false);
      setFormData({
        crew_id: "",
        training_module_id: "",
        date_completed: "",
        result: "",
        notes: "",
      });
    },
    onError: (error) => {
      toast.error("Erro ao registrar treinamento: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.crew_id || !formData.training_module_id) {
      toast.error("Selecione o tripulante e o módulo de treinamento");
      return;
    }
    createMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Treinamento</DialogTitle>
          <DialogDescription>
            Registre a conclusão de um treinamento para um tripulante
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="crew">Tripulante *</Label>
              <Select
                value={formData.crew_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, crew_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tripulante" />
                </SelectTrigger>
                <SelectContent>
                  {crew?.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.full_name} - {member.position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="module">Módulo de Treinamento *</Label>
              <Select
                value={formData.training_module_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, training_module_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o módulo" />
                </SelectTrigger>
                <SelectContent>
                  {modules?.map((module) => (
                    <SelectItem key={module.id} value={module.id}>
                      {module.title} ({module.category})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Data de Conclusão</Label>
              <Input
                id="date"
                type="date"
                value={formData.date_completed}
                onChange={(e) =>
                  setFormData({ ...formData, date_completed: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="result">Resultado</Label>
              <Input
                id="result"
                placeholder="Aprovado, 85%, etc"
                value={formData.result}
                onChange={(e) =>
                  setFormData({ ...formData, result: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                placeholder="Notas adicionais sobre o treinamento"
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
              {createMutation.isPending ? "Registrando..." : "Registrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
