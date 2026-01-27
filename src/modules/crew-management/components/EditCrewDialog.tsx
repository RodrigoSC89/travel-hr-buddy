import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User, Trash2 } from "lucide-react";

interface CrewMember {
  id: string;
  full_name: string;
  position: string;
  status: string | null;
  employee_id: string;
  nationality: string;
  email?: string | null;
  phone?: string | null;
  join_date?: string | null;
}

interface EditCrewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  crewMember: CrewMember | null;
  onSuccess: () => void;
}

export function EditCrewDialog({ open, onOpenChange, crewMember, onSuccess }: EditCrewDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    position: "deckhand",
    email: "",
    phone: "",
    nationality: "BR",
    status: "active",
    join_date: "",
  });

  useEffect(() => {
    if (crewMember) {
      setFormData({
        full_name: crewMember.full_name || "",
        position: crewMember.position || "deckhand",
        email: crewMember.email || "",
        phone: crewMember.phone || "",
        nationality: crewMember.nationality || "BR",
        status: crewMember.status || "active",
        join_date: crewMember.join_date?.split("T")[0] || "",
      });
    }
  }, [crewMember]);

  const handleUpdate = async () => {
    if (!crewMember || !formData.full_name.trim()) {
      toast({
        title: "Erro",
        description: "Nome completo é obrigatório",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("crew_members")
        .update({
          full_name: formData.full_name,
          position: formData.position,
          email: formData.email || null,
          phone: formData.phone || null,
          nationality: formData.nationality,
          status: formData.status,
          join_date: formData.join_date || null,
        })
        .eq("id", crewMember.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Tripulante atualizado com sucesso!",
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating crew member:", error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar tripulante",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!crewMember) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("crew_members")
        .update({ status: "inactive", deleted_at: new Date().toISOString() })
        .eq("id", crewMember.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Tripulante removido com sucesso!",
      });

      setShowDeleteConfirm(false);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error deleting crew member:", error);
      toast({
        title: "Erro",
        description: "Falha ao remover tripulante",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!crewMember) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Editar Tripulante
            </DialogTitle>
            <DialogDescription>
              Atualize as informações do tripulante
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome Completo *</Label>
              <Input
                placeholder="Nome completo"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cargo</Label>
                <Select value={formData.position} onValueChange={(v) => setFormData({ ...formData, position: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="captain">Comandante</SelectItem>
                    <SelectItem value="chief_officer">Imediato</SelectItem>
                    <SelectItem value="second_officer">Segundo Oficial</SelectItem>
                    <SelectItem value="third_officer">Terceiro Oficial</SelectItem>
                    <SelectItem value="chief_engineer">Chefe de Máquinas</SelectItem>
                    <SelectItem value="second_engineer">Segundo Engenheiro</SelectItem>
                    <SelectItem value="dpo">Oficial DPO</SelectItem>
                    <SelectItem value="deck_officer">Oficial de Convés</SelectItem>
                    <SelectItem value="deckhand">Marinheiro</SelectItem>
                    <SelectItem value="cook">Cozinheiro</SelectItem>
                    <SelectItem value="steward">Comissário</SelectItem>
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
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="on_leave">Em Licença</SelectItem>
                    <SelectItem value="embarked">Embarcado</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="email@exemplo.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input
                  placeholder="+55 11 99999-9999"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nacionalidade</Label>
                <Select value={formData.nationality} onValueChange={(v) => setFormData({ ...formData, nationality: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BR">Brasil</SelectItem>
                    <SelectItem value="US">Estados Unidos</SelectItem>
                    <SelectItem value="PT">Portugal</SelectItem>
                    <SelectItem value="ES">Espanha</SelectItem>
                    <SelectItem value="UK">Reino Unido</SelectItem>
                    <SelectItem value="NO">Noruega</SelectItem>
                    <SelectItem value="NL">Holanda</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Data de Admissão</Label>
                <Input
                  type="date"
                  value={formData.join_date}
                  onChange={(e) => setFormData({ ...formData, join_date: e.target.value })}
                />
              </div>
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
              Tem certeza que deseja remover {crewMember.full_name} da tripulação? 
              Esta ação irá marcar o tripulante como inativo.
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
