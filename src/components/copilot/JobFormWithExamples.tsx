import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import SimilarExamples from "./SimilarExamples";
import { Sparkles } from "lucide-react";

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
    
    if (onSubmit) {
      onSubmit({ component, description });
    }

    toast({
      title: "Job criado com sucesso!",
      description: "O job de manutenção foi registrado.",
    });

    // Reset form
    setComponent("");
    setDescription("");
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setDescription(suggestion);
    toast({
      title: "Exemplo aplicado",
      description: "A descrição foi preenchida com o exemplo selecionado.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            🧠 Criar Job com IA
          </CardTitle>
          <CardDescription>
            Crie um novo job de manutenção com sugestões inteligentes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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

          <Button onClick={handleSubmit} disabled={!component || !description}>
            ✅ Criar Job
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>💡 Exemplos Similares</CardTitle>
          <CardDescription>
            Encontre casos históricos similares e use-os como base
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SimilarExamples
            input={description || component}
            onSelect={handleSelectSuggestion}
          />
        </CardContent>
      </Card>
    </div>
  );
}
