/**
 * Job Form with AI-Powered Similar Examples
 * 
 * A complete job creation form that integrates AI-powered suggestions
 * based on historical maintenance data.
 */

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Save, Sparkles } from "lucide-react";
import SimilarExamples from "./SimilarExamples";

interface JobFormData {
  component: string;
  description: string;
  title?: string;
}

interface JobFormWithExamplesProps {
  onSubmit?: (data: JobFormData) => void;
  initialData?: Partial<JobFormData>;
}

export default function JobFormWithExamples({ 
  onSubmit,
  initialData = {}
}: JobFormWithExamplesProps) {
  const [component, setComponent] = useState(initialData.component || "");
  const [description, setDescription] = useState(initialData.description || "");
  const [title, setTitle] = useState(initialData.title || "");

  const handleSubmit = () => {
    const jobData: JobFormData = {
      component,
      description,
      title,
    };
    
    if (onSubmit) {
      onSubmit(jobData);
    } else {
      console.log("Criar job:", jobData);
      // Default behavior: log to console
      // In production, this would integrate with your API
    }
  };

  const handleSelectExample = (exampleText: string) => {
    setDescription(exampleText);
  };

  const handleClear = () => {
    setComponent("");
    setDescription("");
    setTitle("");
  };

  const isFormValid = component.trim() !== "" && description.trim() !== "";

  return (
    <div className="space-y-6">
      {/* Main Job Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            🧠 Criar Job com IA
          </CardTitle>
          <CardDescription>
            Preencha os detalhes do job ou use exemplos similares sugeridos pela IA
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Job Title (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="job-title">Título do Job (opcional)</Label>
            <Input
              id="job-title"
              placeholder="Ex: Manutenção preventiva do gerador"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Component Field */}
          <div className="space-y-2">
            <Label htmlFor="component">
              Componente <span className="text-red-500">*</span>
            </Label>
            <Input
              id="component"
              placeholder="Componente (ex: 603.0004.02)"
              value={component}
              onChange={(e) => setComponent(e.target.value)}
              required
            />
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Descrição <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Descreva o problema ou ação necessária..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="resize-none"
              required
            />
            <p className="text-xs text-muted-foreground">
              💡 Digite uma descrição e use os exemplos similares abaixo para obter sugestões da IA
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button 
              onClick={handleSubmit} 
              disabled={!isFormValid}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              ✅ Criar Job
            </Button>
            <Button variant="outline" onClick={handleClear}>
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Similar Examples Integration */}
      <Card>
        <CardHeader>
          <CardTitle>Exemplos Similares com IA</CardTitle>
          <CardDescription>
            Busque casos históricos similares usando IA para obter sugestões automáticas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SimilarExamples 
            input={description || title || component} 
            onSelect={handleSelectExample} 
          />
        </CardContent>
      </Card>
    </div>
  );
}
