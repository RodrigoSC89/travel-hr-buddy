import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Ship, Trash2 } from "lucide-react";

interface Vessel {
  id: string;
  name: string;
  status: string;
  vessel_type?: string;
  current_location?: string;
  imo_number?: string;
  flag_state?: string;
}

interface EditVesselDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vessel: Vessel | null;
  onSuccess: () => void;
}

export function EditVesselDialog({ open, onOpenChange, vessel, onSuccess }: EditVesselDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    vessel_type: "cargo",
    status: "active",
    current_location: "",
    imo_number: "",
    flag_state: "BR",
  });

  useEffect(() => {
    if (vessel) {
      setFormData({
        name: vessel.name || "",
        vessel_type: vessel.vessel_type || "cargo",
        status: vessel.status || "active",
        current_location: vessel.current_location || "",
        imo_number: vessel.imo_number || "",
        flag_state: vessel.flag_state || "BR",
      });
    }
  }, [vessel]);

  const handleUpdate = async () => {
    if (!vessel || !formData.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome da embarcação é obrigatório",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("vessels")
        .update({
          name: formData.name,
          vessel_type: formData.vessel_type,
          status: formData.status,
          current_location: formData.current_location || null,
          imo_number: formData.imo_number || null,
          flag_state: formData.flag_state,
        })
        .eq("id", vessel.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Embarcação atualizada com sucesso!",
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating vessel:", error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar embarcação",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!vessel) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("vessels")
        .update({ status: "inactive", deleted_at: new Date().toISOString() })
        .eq("id", vessel.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Embarcação removida com sucesso!",
      });

      setShowDeleteConfirm(false);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error deleting vessel:", error);
      toast({
        title: "Erro",
        description: "Falha ao remover embarcação",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!vessel) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ship className="h-5 w-5" />
              Editar Embarcação
            </DialogTitle>
            <DialogDescription>
              Atualize as informações da embarcação
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input
                placeholder="MV Ocean Star"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={formData.vessel_type} onValueChange={(v) => setFormData({ ...formData, vessel_type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cargo">Carga</SelectItem>
                    <SelectItem value="tanker">Petroleiro</SelectItem>
                    <SelectItem value="container">Contêiner</SelectItem>
                    <SelectItem value="offshore">Offshore</SelectItem>
                    <SelectItem value="passenger">Passageiros</SelectItem>
                    <SelectItem value="supply">Supply</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Operacional</SelectItem>
                    <SelectItem value="maintenance">Em Manutenção</SelectItem>
                    <SelectItem value="docked">Atracado</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Número IMO</Label>
                <Input
                  placeholder="9123456"
                  value={formData.imo_number}
                  onChange={(e) => setFormData({ ...formData, imo_number: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Bandeira</Label>
                <Select value={formData.flag_state} onValueChange={(v) => setFormData({ ...formData, flag_state: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BR">Brasil</SelectItem>
                    <SelectItem value="PA">Panamá</SelectItem>
                    <SelectItem value="LR">Libéria</SelectItem>
                    <SelectItem value="MH">Ilhas Marshall</SelectItem>
                    <SelectItem value="SG">Singapura</SelectItem>
                    <SelectItem value="MT">Malta</SelectItem>
                    <SelectItem value="BS">Bahamas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Localização Atual</Label>
              <Input
                placeholder="Porto de Santos"
                value={formData.current_location}
                onChange={(e) => setFormData({ ...formData, current_location: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter className="flex justify-between">
            <Button
              variant="destructive"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isSubmitting}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Remover
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button onClick={handleUpdate} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Alterações"
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Remoção</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover {vessel.name} da frota? 
              Esta ação irá marcar a embarcação como inativa.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Remover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
