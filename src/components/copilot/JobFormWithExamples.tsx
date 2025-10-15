/**
 * JobFormWithExamples Component
 * 
 * A comprehensive form component for creating maintenance jobs with AI-powered suggestions.
 * Combines component input, description textarea, and real-time similar examples integration.
 */

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import SimilarExamples from "./SimilarExamples";
import { useToast } from "@/hooks/use-toast";

interface JobFormWithExamplesProps {
  onSubmit?: (data: { component: string; description: string }) => void;
}

export default function JobFormWithExamples({ onSubmit }: JobFormWithExamplesProps) {
  const [description, setDescription] = useState("");
  const [component, setComponent] = useState("");
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!component || !description) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha o componente e a descrição.",
        variant: "destructive",
      });
      return;
    }

    console.log("Criar job:", { component, description });
    
    toast({
      title: "Job criado!",
      description: "O job de manutenção foi criado com sucesso.",
    });

    // Call the optional onSubmit callback
    if (onSubmit) {
      onSubmit({ component, description });
    }

    // Reset form
    setComponent("");
    setDescription("");
  };

  const handleSelectExample = (text: string) => {
    setDescription(text);
    toast({
      title: "Exemplo aplicado",
      description: "A descrição foi preenchida com o exemplo selecionado.",
    });
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          🧠 Criar Job com IA
        </h2>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="component">Componente</Label>
            <Input
              id="component"
              placeholder="Componente (ex: 603.0004.02)"
              value={component}
              onChange={(e) => setComponent(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Descreva o problema ou ação necessária..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          <Button onClick={handleSubmit} className="w-full" disabled={!component || !description}>
            ✅ Criar Job
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Exemplos Similares</h3>
        <SimilarExamples 
          input={description} 
          onSelect={handleSelectExample} 
        />
      </Card>
    </div>
  );
}
