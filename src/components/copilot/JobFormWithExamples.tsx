import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import SimilarExamples from "./SimilarExamples";
import { Save } from "lucide-react";

interface JobFormWithExamplesProps {
  onSubmit?: (data: { component: string; description: string }) => void;
}

export default function JobFormWithExamples({ onSubmit }: JobFormWithExamplesProps) {
  const [component, setComponent] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit({ component, description });
    }
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setDescription(suggestion);
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
              <Label htmlFor="description">Descrição do Problema</Label>
              <Textarea
                id="description"
                placeholder="Descreva o problema de manutenção em detalhes..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="resize-none"
                required
              />
            </div>

            <Button type="submit" disabled={!component || !description}>
              <Save className="h-4 w-4 mr-2" />
              Criar Job
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Exemplos Similares</CardTitle>
          <CardDescription>
            Busque casos históricos similares e use-os como base
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
