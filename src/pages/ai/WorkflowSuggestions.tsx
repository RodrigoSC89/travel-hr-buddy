/**
 * PATCH 653 - Workflow Suggestions Page
 * Dedicated page for AI-powered workflow suggestions
 */

import { Helmet } from "react-helmet-async";
import { WorkflowAISuggestions } from "@/components/ai/WorkflowAISuggestions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, Workflow } from "lucide-react";

export default function WorkflowSuggestions() {
  return (
    <>
      <Helmet>
        <title>Sugestões IA Workflow | Nautilus One</title>
        <meta name="description" content="Sugestões inteligentes geradas por IA para otimização de workflows" />
      </Helmet>

      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Lightbulb className="h-8 w-8 text-yellow-500" />
            Sugestões de Workflow
          </h1>
          <p className="text-muted-foreground mt-1">
            Sugestões inteligentes geradas por IA para otimização de processos
          </p>
        </div>

        {/* Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Workflow className="h-5 w-5" />
              Como funciona
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              O sistema analisa automaticamente os logs, prazos e falhas dos workflows 
              para gerar sugestões acionáveis. As sugestões podem incluir:
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Criação de novas tarefas para resolver problemas identificados
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-yellow-500" />
                Ajustes de prazo baseados em análise de histórico
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Reatribuição de responsáveis para maior eficiência
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                Escalação de problemas críticos
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Suggestions Panel */}
        <WorkflowAISuggestions limit={50} />
      </div>
    </>
  );
}
