/**
 * Job Creation with Similar Examples Demo Page
 * 
 * This page demonstrates the integration of the SimilarExamples component
 * with a job creation form, showing how to use RAG-based similarity search
 * to help users create better maintenance job requests.
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SimilarExamples from "@/components/copilot/SimilarExamples";
import { useToast } from "@/hooks/use-toast";
import { Save, FileText, Ship } from "lucide-react";

export default function JobCreationWithSimilarExamples() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    vessel: "",
    component: "",
    priority: "medium",
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha o título e a descrição do job.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Job criado!",
      description: "O job de manutenção foi criado com sucesso.",
      variant: "default",
    });

    console.log("Job criado:", formData);
  };

  const handleExampleFill = () => {
    setFormData({
      title: "Manutenção Preventiva - Sistema de Resfriamento",
      description: "Verificar sistema de resfriamento do motor principal, incluindo inspeção de bombas, válvulas e trocadores de calor. Identificar possíveis vazamentos e verificar níveis de fluido refrigerante.",
      vessel: "MV Atlantic Star",
      component: "Motor Principal - Sistema de Resfriamento",
      priority: "high",
    });
  };

  return (
    <div className="container mx-auto py-6 px-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Ship className="h-8 w-8 text-primary" />
          Criar Job de Manutenção
        </h1>
        <p className="text-muted-foreground">
          Demonstração de integração: Use exemplos semelhantes para criar jobs melhores
        </p>
      </div>

      {/* Demo Info Banner */}
      <Card className="mb-6 bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Página de Demonstração
          </CardTitle>
          <CardDescription className="text-blue-700">
            Esta é uma página de demonstração da funcionalidade SimilarExamples. 
            Preencha o formulário à esquerda e veja exemplos similares à direita.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleExampleFill} variant="outline" size="sm">
            📝 Preencher com exemplo
          </Button>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Job Creation Form */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Formulário de Job</CardTitle>
              <CardDescription>
                Preencha os detalhes do job de manutenção
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    placeholder="Ex: Manutenção do gerador principal"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição *</Label>
                  <Textarea
                    id="description"
                    placeholder="Descreva o problema ou a tarefa de manutenção em detalhes..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={6}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Mínimo 10 caracteres para buscar exemplos semelhantes
                  </p>
                </div>

                {/* Vessel */}
                <div className="space-y-2">
                  <Label htmlFor="vessel">Embarcação</Label>
                  <Input
                    id="vessel"
                    placeholder="Ex: MV Atlantic Star"
                    value={formData.vessel}
                    onChange={(e) => setFormData({ ...formData, vessel: e.target.value })}
                  />
                </div>

                {/* Component */}
                <div className="space-y-2">
                  <Label htmlFor="component">Componente/Sistema</Label>
                  <Input
                    id="component"
                    placeholder="Ex: Motor Principal, Bomba Hidráulica"
                    value={formData.component}
                    onChange={(e) => setFormData({ ...formData, component: e.target.value })}
                  />
                </div>

                {/* Priority */}
                <div className="space-y-2">
                  <Label htmlFor="priority">Prioridade</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => setFormData({ ...formData, priority: value })}
                  >
                    <SelectTrigger id="priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="critical">Crítica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Submit Button */}
                <Button type="submit" className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Criar Job
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Instructions Card */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-sm">💡 Como usar</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Preencha o título e descrição do job</li>
                <li>Clique em "Ver exemplos semelhantes" à direita</li>
                <li>Veja jobs históricos similares com sugestões da IA</li>
                <li>Use o botão "📋 Usar como base" para copiar sugestões</li>
                <li>Aprimore sua descrição com base nos exemplos</li>
              </ol>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Similar Examples */}
        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Exemplos Similares (RAG)</CardTitle>
              <CardDescription>
                Busca semântica baseada em embeddings vetoriais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SimilarExamples input={formData.description} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Technical Info Section */}
      <Card className="mt-6 bg-gray-50">
        <CardHeader>
          <CardTitle className="text-sm">🔧 Detalhes Técnicos</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-semibold text-gray-700 mb-1">Vector Embeddings</h4>
              <p>OpenAI text-embedding-3-small (1536 dimensões)</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 mb-1">Database</h4>
              <p>Supabase com pgvector extension</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 mb-1">Search Method</h4>
              <p>Cosine similarity (threshold: 0.78)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
