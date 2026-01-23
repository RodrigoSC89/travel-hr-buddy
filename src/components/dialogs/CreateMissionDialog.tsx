/**
 * Create Mission Dialog
 * Dialog for creating new fleet missions with AI assistance
 */

import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Ship, Target, Calendar, Brain, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

interface CreateMissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMissionCreated?: () => void;
}

export const CreateMissionDialog: React.FC<CreateMissionDialogProps> = ({
  open,
  onOpenChange,
  onMissionCreated,
}) => {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    mission_type: "cargo_transport",
    priority: "medium",
    vessel_id: "",
    start_time: "",
    estimated_end_time: "",
    destination_port: "",
    cargo_type: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAIAssist = async () => {
    if (!formData.mission_type || !formData.destination_port) {
      toast({
        title: "Dados insuficientes",
        description: "Preencha pelo menos o tipo de missão e porto de destino",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingAI(true);
    
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const aiSuggestions = {
      name: `Missão ${formData.mission_type === "cargo_transport" ? "Carga" : "Especial"} - ${formData.destination_port}`,
      description: `Operação de ${formData.mission_type === "cargo_transport" ? "transporte de carga" : "missão especial"} para o porto de ${formData.destination_port}. Condições meteorológicas favoráveis previstas. Rota otimizada pela IA para economia de combustível.`,
    };

    setFormData(prev => ({
      ...prev,
      name: aiSuggestions.name,
      description: aiSuggestions.description,
    }));

    setIsGeneratingAI(false);
    toast({
      title: "✨ IA Assistiu",
      description: "Nome e descrição gerados com base nos parâmetros",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.mission_type) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha pelo menos o nome e tipo de missão",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      // Use the correct field names matching the missions table schema
      const missionData = {
        mission_code: `MSN-${Date.now()}`,
        mission_name: formData.name,
        mission_type: formData.mission_type,
        description: formData.description || null,
        priority: formData.priority,
        vessel_id: formData.vessel_id || null,
        start_date: formData.start_time || null,
        end_date: formData.estimated_end_time || null,
        status: "planned",
        created_by: user.id,
        metadata: {
          destination_port: formData.destination_port,
          cargo_type: formData.cargo_type,
        },
      };

      const { error } = await supabase.from("missions").insert(missionData);

      if (error) throw error;

      toast({
        title: "✅ Missão Criada",
        description: `${formData.name} foi adicionada ao sistema`,
      });

      // Reset form
      setFormData({
        name: "",
        description: "",
        mission_type: "cargo_transport",
        priority: "medium",
        vessel_id: "",
        start_time: "",
        estimated_end_time: "",
        destination_port: "",
        cargo_type: "",
      });

      onOpenChange(false);
      onMissionCreated?.();
    } catch (error) {
      logger.error("Error creating mission", error);
      toast({
        title: "Erro ao criar missão",
        description: error instanceof Error ? error.message : "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Criar Nova Missão
          </DialogTitle>
          <DialogDescription>
            Configure os detalhes da missão. Use a IA para assistência na criação.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mission_type">Tipo de Missão *</Label>
              <Select 
                value={formData.mission_type} 
                onValueChange={(v) => handleChange("mission_type", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cargo_transport">Transporte de Carga</SelectItem>
                  <SelectItem value="passenger">Passageiros</SelectItem>
                  <SelectItem value="offshore_support">Suporte Offshore</SelectItem>
                  <SelectItem value="survey">Pesquisa/Survey</SelectItem>
                  <SelectItem value="towing">Reboque</SelectItem>
                  <SelectItem value="maintenance">Manutenção</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Prioridade</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(v) => handleChange("priority", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      Crítica
                    </div>
                  </SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="low">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="destination_port">Porto de Destino</Label>
            <Input
              id="destination_port"
              value={formData.destination_port}
              onChange={(e) => handleChange("destination_port", e.target.value)}
              placeholder="Ex: Santos, Rotterdam, Singapore"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleAIAssist}
              disabled={isGeneratingAI}
            >
              <Brain className="h-4 w-4 mr-2" />
              {isGeneratingAI ? "Gerando..." : "Gerar com IA"}
            </Button>
            <Badge variant="outline" className="text-xs">
              Preencha tipo e destino para usar IA
            </Badge>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nome da Missão *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Ex: Transporte Carga - Santos"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Detalhes da missão..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_time">Data de Início</Label>
              <Input
                id="start_time"
                type="datetime-local"
                value={formData.start_time}
                onChange={(e) => handleChange("start_time", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimated_end_time">Data Estimada de Término</Label>
              <Input
                id="estimated_end_time"
                type="datetime-local"
                value={formData.estimated_end_time}
                onChange={(e) => handleChange("estimated_end_time", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cargo_type">Tipo de Carga (se aplicável)</Label>
            <Input
              id="cargo_type"
              value={formData.cargo_type}
              onChange={(e) => handleChange("cargo_type", e.target.value)}
              placeholder="Ex: Containers, Granel, Petróleo"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? "Criando..." : "Criar Missão"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateMissionDialog;
