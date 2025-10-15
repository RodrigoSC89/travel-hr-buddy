import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import SimilarExamples from "./SimilarExamples";
import { toast } from "sonner";

export interface JobFormData {
  component: string;
  description: string;
}

interface JobFormWithExamplesProps {
  onSubmit?: (data: JobFormData) => Promise<void>;
}

export default function JobFormWithExamples({ onSubmit }: JobFormWithExamplesProps) {
  const [component, setComponent] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!component.trim() || !description.trim()) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit({ component, description });
        toast.success("Job criado com sucesso!");
        setComponent("");
        setDescription("");
      } else {
        // Mock submission for demo
        console.log("Job submitted:", { component, description });
        toast.success("Job criado com sucesso!");
      }
    } catch (error) {
      console.error("Error submitting job:", error);
      toast.error("Erro ao criar job");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectExample = (text: string) => {
    setDescription(text);
    toast.success("Exemplo aplicado ao formulário");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Criar Novo Job de Manutenção</CardTitle>
          <CardDescription>
            Preencha os detalhes do job ou use exemplos similares para começar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="component">Componente</Label>
              <Input
                id="component"
                placeholder="Ex: 603.0004.02"
                value={component}
                onChange={(e) => setComponent(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Descreva o problema ou ação de manutenção..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                required
              />
            </div>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Criando..." : "Criar Job"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Exemplos Similares</CardTitle>
          <CardDescription>
            Busque casos históricos e use-os como base
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SimilarExamples
            input={description || component}
            onSelect={handleSelectExample}
          />
        </CardContent>
      </Card>
    </div>
  );
}
