/**
 * SimilarExamples Component Integration Example
 * 
 * This example demonstrates how to integrate the SimilarExamples component
 * into a job creation workflow, allowing users to see similar historical jobs
 * while filling out the form.
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import SimilarExamples from "@/components/copilot/SimilarExamples";
import { Wrench, Plus } from "lucide-react";

export default function JobCreationWithSimilarExamples() {
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [component, setComponent] = useState("");

  // Combine form fields for similarity search
  const searchQuery = `${jobTitle} ${component} ${jobDescription}`.trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle job creation logic here
    console.log("Creating job:", { jobTitle, component, jobDescription });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Wrench className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Criar Novo Job MMI</h1>
        </div>
        <p className="text-muted-foreground">
          Preencha o formulário e veja exemplos semelhantes para referência
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Job Creation Form */}
        <Card>
          <CardHeader>
            <CardTitle>Detalhes do Job</CardTitle>
            <CardDescription>
              Preencha as informações do job de manutenção
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título do Job</Label>
                <Input
                  id="title"
                  placeholder="Ex: Manutenção preventiva do gerador STBD"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="component">Componente</Label>
                <Input
                  id="component"
                  placeholder="Ex: GEN-STBD-01"
                  value={component}
                  onChange={(e) => setComponent(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva o problema ou manutenção necessária..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={4}
                />
              </div>

              <Button type="submit" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Criar Job
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Similar Examples Panel */}
        <Card>
          <CardHeader>
            <CardTitle>💡 Exemplos Semelhantes</CardTitle>
            <CardDescription>
              Veja jobs históricos similares com sugestões de IA
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SimilarExamples input={searchQuery} />
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              📖 Como usar este recurso
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>1. Preencha o formulário</strong>
                <p className="text-muted-foreground">
                  Digite o título, componente e descrição do job
                </p>
              </div>
              <div>
                <strong>2. Clique em &quot;Ver exemplos semelhantes&quot;</strong>
                <p className="text-muted-foreground">
                  O sistema busca jobs históricos usando IA
                </p>
              </div>
              <div>
                <strong>3. Analise as sugestões</strong>
                <p className="text-muted-foreground">
                  Veja como problemas similares foram resolvidos
                </p>
              </div>
              <div>
                <strong>4. Use como base</strong>
                <p className="text-muted-foreground">
                  Copie a sugestão e adapte para seu caso
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
