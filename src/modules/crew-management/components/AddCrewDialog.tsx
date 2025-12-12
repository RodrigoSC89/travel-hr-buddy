import { memo, memo, useState, useCallback } from "react";;;
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User, Briefcase, Phone, Mail, Globe, Calendar } from "lucide-react";

interface AddCrewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const AddCrewDialog = memo(function({ open, onOpenChange, onSuccess }: AddCrewDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    position: "deckhand",
    email: "",
    phone: "",
    nationality: "BR",
    employee_id: "",
    status: "active",
    join_date: new Date().toISOString().split("T")[0],
  });

  const handleSubmit = async () => {
    if (!formData.full_name.trim()) {
      toast({
        title: "Erro",
        description: "Nome completo é obrigatório",
        variant: "destructive",
      };
      return;
    }

    setIsSubmitting(true);
    try {
      const employeeId = formData.employee_id || `EMP${Date.now().toString().slice(-6)}`;

      const { error } = await supabase
        .from("crew_members")
        .insert([{
          full_name: formData.full_name,
          position: formData.position,
          email: formData.email || null,
          phone: formData.phone || null,
          nationality: formData.nationality,
          employee_id: employeeId,
          status: formData.status,
          join_date: formData.join_date,
        }]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Tripulante adicionado com sucesso!",
      };

      setFormData({
        full_name: "",
        position: "deckhand",
        email: "",
        phone: "",
        nationality: "BR",
        employee_id: "",
        status: "active",
        join_date: new Date().toISOString().split("T")[0],
      };

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding crew member:", error);
      toast({
        title: "Erro",
        description: "Falha ao adicionar tripulante",
        variant: "destructive",
      };
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Novo Tripulante
          </DialogTitle>
          <DialogDescription>
            Adicione um novo membro à tripulação
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="personal" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="personal">Dados Pessoais</TabsTrigger>
            <TabsTrigger value="professional">Profissional</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Nome Completo *
              </Label>
              <Input
                value={formData.full_name}
                onChange={handleChange}))}
                placeholder="Ex: João da Silva"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={handleChange}))}
                  placeholder="email@exemplo.com"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Telefone
                </Label>
                <Input
                  value={formData.phone}
                  onChange={handleChange}))}
                  placeholder="+55 11 99999-9999"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Nacionalidade
              </Label>
              <Select
                value={formData.nationality}
                onValueChange={(value) => setFormData(prev => ({ ...prev, nationality: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BR">Brasil</SelectItem>
                  <SelectItem value="US">Estados Unidos</SelectItem>
                  <SelectItem value="PT">Portugal</SelectItem>
                  <SelectItem value="ES">Espanha</SelectItem>
                  <SelectItem value="OTHER">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="professional" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Cargo
              </Label>
              <Select
                value={formData.position}
                onValueChange={(value) => setFormData(prev => ({ ...prev, position: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="captain">Comandante / Capitão</SelectItem>
                  <SelectItem value="chief_officer">Imediato</SelectItem>
                  <SelectItem value="second_officer">Segundo Oficial</SelectItem>
                  <SelectItem value="third_officer">Terceiro Oficial</SelectItem>
                  <SelectItem value="deck_officer">Oficial de Convés</SelectItem>
                  <SelectItem value="chief_engineer">Chefe de Máquinas</SelectItem>
                  <SelectItem value="second_engineer">Segundo Engenheiro</SelectItem>
                  <SelectItem value="dpo">Oficial DPO</SelectItem>
                  <SelectItem value="deckhand">Marinheiro</SelectItem>
                  <SelectItem value="cook">Cozinheiro</SelectItem>
                  <SelectItem value="steward">Comissário</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>ID do Funcionário</Label>
                <Input
                  value={formData.employee_id}
                  onChange={handleChange}))}
                  placeholder="EMP001"
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                >
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

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Data de Admissão
              </Label>
              <Input
                type="date"
                value={formData.join_date}
                onChange={handleChange}))}
              />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => handleonOpenChange}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              "Adicionar Tripulante"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
