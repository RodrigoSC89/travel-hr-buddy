/**
 * Job Creation with Similar Examples Demo Page
 * 
 * This page demonstrates the integration of the SimilarExamples component
 * with a maintenance job creation form, showcasing the RAG-based similarity search.
 */

import { useState } from "react";
import SimilarExamples from "@/components/copilot/SimilarExamples";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Save, RotateCcw, Lightbulb, BookOpen } from "lucide-react";

export default function JobCreationWithSimilarExamples() {
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [vessel, setVessel] = useState("");
  const [component, setComponent] = useState("");
  const [priority, setPriority] = useState("");
  const { toast } = useToast();

  const handleSelectSuggestion = (suggestion: string) => {
    // Populate the description field with the selected suggestion
    setJobDescription(suggestion);
  };

  const handleSaveJob = () => {
    if (!jobTitle || !jobDescription) {
      toast({
        title: "⚠️ Campos obrigatórios",
        description: "Por favor, preencha o título e a descrição do job.",
        variant: "destructive",
      });
      return;
    }

    console.log("Saving job:", {
      title: jobTitle,
      description: jobDescription,
      vessel: vessel,
      component: component,
      priority: priority,
    });
    
    toast({
      title: "✅ Job criado com sucesso",
      description: "O job de manutenção foi salvo no sistema.",
    });
  };

  const handleClear = () => {
    setJobTitle("");
    setJobDescription("");
    setVessel("");
    setComponent("");
    setPriority("");
    
    toast({
      title: "🔄 Formulário limpo",
      description: "Todos os campos foram resetados.",
    });
  };

  const handleFillExample = () => {
    setJobTitle("Falha no gerador STBD");
    setJobDescription("Gerador STBD apresentando ruído incomum e aumento de temperatura durante operação. Necessária inspeção urgente dos componentes internos.");
    setVessel("Atlantic Star");
    setComponent("Gerador Diesel");
    setPriority("high");
    
    toast({
      title: "📝 Exemplo preenchido",
      description: "Use este exemplo para testar a busca de casos similares.",
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
            <Sparkles className="h-10 w-10 text-primary" />
            Criar Job com Exemplos Similares
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Utilize o poder da IA para encontrar casos históricos similares e criar jobs de manutenção mais precisos e eficientes
          </p>
        </div>

        {/* Quick Example Button */}
        <div className="flex justify-center">
          <Button variant="outline" onClick={handleFillExample}>
            <Lightbulb className="mr-2 h-4 w-4" />
            Preencher com exemplo
          </Button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Job Creation Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Novo Job de Manutenção</CardTitle>
                <CardDescription>
                  Preencha os detalhes do job de manutenção
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Job Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">
                    Título do Job <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    placeholder="Ex: Falha no gerador STBD"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                  />
                </div>

                {/* Vessel */}
                <div className="space-y-2">
                  <Label htmlFor="vessel">Embarcação</Label>
                  <Input
                    id="vessel"
                    placeholder="Ex: Atlantic Star, Oceanic Explorer"
                    value={vessel}
                    onChange={(e) => setVessel(e.target.value)}
                  />
                </div>

                {/* Component/System */}
                <div className="space-y-2">
                  <Label htmlFor="component">Componente/Sistema</Label>
                  <Input
                    id="component"
                    placeholder="Ex: Gerador Diesel, Bomba Hidráulica"
                    value={component}
                    onChange={(e) => setComponent(e.target.value)}
                  />
                </div>

                {/* Priority */}
                <div className="space-y-2">
                  <Label htmlFor="priority">Prioridade</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger id="priority">
                      <SelectValue placeholder="Selecione a prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="critical">Crítica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Job Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">
                    Descrição do Problema <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Descreva o problema de manutenção em detalhes..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    rows={6}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    Dica: Use os exemplos similares ao lado para popular este campo automaticamente
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button 
                    onClick={handleSaveJob} 
                    disabled={!jobTitle || !jobDescription}
                    className="flex-1"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Job
                  </Button>
                  <Button variant="outline" onClick={handleClear}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Limpar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Similar Examples */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Exemplos Similares
                </CardTitle>
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
          </div>
        </div>

        {/* How to Use Section */}
        <Card>
          <CardHeader>
            <CardTitle>Como Usar esta Funcionalidade</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>
                <strong>Descreva o problema:</strong> Digite o título, componente ou descrição detalhada do problema de manutenção
              </li>
              <li>
                <strong>Busque exemplos:</strong> Clique em "🔍 Ver exemplos semelhantes" no painel direito para encontrar casos históricos similares
              </li>
              <li>
                <strong>Revise os resultados:</strong> Veja os jobs similares ordenados por relevância, com percentual de similaridade e sugestões de IA
              </li>
              <li>
                <strong>Use como base:</strong> Clique em "📋 Usar como base" em qualquer exemplo para popular o campo de descrição automaticamente
              </li>
              <li>
                <strong>Ajuste e salve:</strong> Edite a descrição conforme necessário e salve o novo job de manutenção
              </li>
            </ol>
          </CardContent>
        </Card>

        {/* Technical Information */}
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-lg">Informações Técnicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold text-muted-foreground">Tecnologia</p>
                <p>Vector Similarity Search com RAG</p>
              </div>
              <div>
                <p className="font-semibold text-muted-foreground">Modelo de Embedding</p>
                <p>OpenAI text-embedding-3-small (1536 dimensões)</p>
              </div>
              <div>
                <p className="font-semibold text-muted-foreground">Database</p>
                <p>Supabase com pgvector extension</p>
              </div>
              <div>
                <p className="font-semibold text-muted-foreground">Algoritmo de Busca</p>
                <p>Cosine Similarity</p>
              </div>
              <div>
                <p className="font-semibold text-muted-foreground">Threshold de Similaridade</p>
                <p>70% (0.7) mínimo</p>
              </div>
              <div>
                <p className="font-semibold text-muted-foreground">Resultados Máximos</p>
                <p>5 casos mais similares</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Benefits Section */}
        <Card>
          <CardHeader>
            <CardTitle>Benefícios desta Funcionalidade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold">Aprendizado Contínuo</h3>
                <p className="text-sm text-muted-foreground">
                  Aprenda com casos históricos e melhores práticas documentadas pela equipe
                </p>
              </div>
              <div className="space-y-2">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Save className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold">Economia de Tempo</h3>
                <p className="text-sm text-muted-foreground">
                  Reduza o tempo de criação de jobs reutilizando soluções comprovadas
                </p>
              </div>
              <div className="space-y-2">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold">Consistência</h3>
                <p className="text-sm text-muted-foreground">
                  Mantenha um padrão de qualidade nas descrições e resoluções de problemas
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
