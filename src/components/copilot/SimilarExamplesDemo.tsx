/**
 * SimilarExamples Component Demo
 * 
 * This file demonstrates how to use the SimilarExamples component
 * in a real-world maintenance management scenario.
 */

import { useState } from "react";
import SimilarExamples from "@/components/copilot/SimilarExamples";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Sparkles, Save } from "lucide-react";

export default function SimilarExamplesDemo() {
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [component, setComponent] = useState("");

  const handleSelectSuggestion = (suggestion: string) => {
    // Populate the description field with the selected suggestion
    setJobDescription(suggestion);
  };

  const handleSaveJob = () => {
    console.log("Saving job:", {
      title: jobTitle,
      description: jobDescription,
      component: component,
    });
    // In a real application, this would call an API to save the job
  };

  const handleClear = () => {
    setJobTitle("");
    setJobDescription("");
    setComponent("");
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            Similar Examples Demo
          </h1>
          <p className="text-muted-foreground">
            Encontre e reutilize sugestões de manutenção de casos históricos similares
          </p>
        </div>

        {/* Main Form */}
        <Card>
          <CardHeader>
            <CardTitle>Criar Novo Job de Manutenção</CardTitle>
            <CardDescription>
              Preencha os detalhes do job ou use exemplos similares para começar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Job Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Título do Job</Label>
              <Input
                id="title"
                placeholder="Ex: Falha no gerador STBD"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
              />
            </div>

            {/* Component */}
            <div className="space-y-2">
              <Label htmlFor="component">Componente/Sistema</Label>
              <Input
                id="component"
                placeholder="Ex: Gerador Diesel, Bomba Hidráulica"
                value={component}
                onChange={(e) => setComponent(e.target.value)}
              />
            </div>

            {/* Job Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Descrição do Problema</Label>
              <Textarea
                id="description"
                placeholder="Descreva o problema de manutenção em detalhes..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                💡 Dica: Use os exemplos similares abaixo para popular este campo automaticamente
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button onClick={handleSaveJob} disabled={!jobTitle || !jobDescription}>
                <Save className="h-4 w-4 mr-2" />
                Salvar Job
              </Button>
              <Button variant="outline" onClick={handleClear}>
                Limpar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Similar Examples Component */}
        <Card>
          <CardHeader>
            <CardTitle>Exemplos Similares</CardTitle>
            <CardDescription>
              Busque casos históricos similares e use-os como base para o seu job
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SimilarExamples
              input={jobDescription || jobTitle || component}
              onSelect={handleSelectSuggestion}
            />
          </CardContent>
        </Card>

        {/* Usage Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Como Usar</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>
                <strong>Descreva o problema:</strong> Digite o título, componente ou descrição do problema
              </li>
              <li>
                <strong>Busque exemplos:</strong> Clique em &quot;🔍 Ver exemplos semelhantes&quot; para encontrar casos históricos
              </li>
              <li>
                <strong>Revise os resultados:</strong> Veja os jobs similares com suas sugestões de IA
              </li>
              <li>
                <strong>Use como base:</strong> Clique em &quot;📋 Usar como base&quot; para popular o campo de descrição
              </li>
              <li>
                <strong>Ajuste e salve:</strong> Edite conforme necessário e salve o novo job
              </li>
            </ol>
          </CardContent>
        </Card>

        {/* Example Scenarios */}
        <Card>
          <CardHeader>
            <CardTitle>Cenários de Exemplo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold">Cenário 1: Problema no Gerador</h4>
                <p className="text-sm text-muted-foreground">
                  Digite &quot;Gerador com ruído&quot; e veja casos similares de falhas em geradores
                </p>
              </div>
              
              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-semibold">Cenário 2: Manutenção Preventiva</h4>
                <p className="text-sm text-muted-foreground">
                  Digite &quot;Bomba hidráulica vibração&quot; para encontrar casos de manutenção preventiva
                </p>
              </div>
              
              <div className="border-l-4 border-orange-500 pl-4">
                <h4 className="font-semibold">Cenário 3: Falha Crítica</h4>
                <p className="text-sm text-muted-foreground">
                  Digite &quot;Válvula de segurança&quot; para ver ações urgentes tomadas em casos similares
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technical Info */}
        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle className="text-sm">Informações Técnicas</CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-2">
            <p>
              <strong>Tecnologia:</strong> Vector similarity search com OpenAI embeddings (text-embedding-3-small)
            </p>
            <p>
              <strong>Database:</strong> Supabase com pgvector extension
            </p>
            <p>
              <strong>Threshold:</strong> 0.7 (70% de similaridade mínima)
            </p>
            <p>
              <strong>Max Results:</strong> 5 casos mais similares
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
