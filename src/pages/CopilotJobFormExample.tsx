/**
 * Example page demonstrating the JobFormWithExamples component
 * This page shows how to integrate the Copilot Job Form with AI-powered suggestions
 */

import { JobFormWithExamples } from "@/components/copilot";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function CopilotJobFormExample() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Copilot - Criação de Jobs com IA</h1>
        <p className="text-muted-foreground">
          Demonstração do formulário inteligente para criação de jobs de manutenção
        </p>
      </div>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Como funciona?</CardTitle>
          <CardDescription>
            Este componente combina um formulário de criação de jobs com busca inteligente de exemplos similares
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li>Digite a descrição do problema no campo de texto</li>
            <li>O sistema buscará automaticamente casos similares no histórico</li>
            <li>Você pode clicar em qualquer exemplo para copiar a descrição</li>
            <li>O score de similaridade mostra o quão relevante é cada exemplo</li>
            <li>Preencha o componente e clique em "Criar Job" para finalizar</li>
          </ul>
        </CardContent>
      </Card>

      {/* Job Form Component */}
      <Card>
        <CardContent className="pt-6">
          <JobFormWithExamples />
        </CardContent>
      </Card>

      {/* Technical Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informações Técnicas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Funcionalidades:</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Busca vetorial por similaridade</li>
                <li>Debounce de 500ms para otimizar requisições</li>
                <li>Mínimo de 10 caracteres para iniciar busca</li>
                <li>Loading states e feedback visual</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Próximas Melhorias:</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Integração com OpenAI embeddings</li>
                <li>Filtros avançados de busca</li>
                <li>Histórico de jobs criados</li>
                <li>Analytics de uso das sugestões</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
