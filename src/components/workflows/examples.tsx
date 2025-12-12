/**
 * Example: Using KanbanAISuggestions in a Workflow Detail Page
 * 
 * This file demonstrates how to integrate the KanbanAISuggestions component
 * into a workflow detail page with real AI-generated suggestions.
 */

import { memo, memo, useEffect, useState, useCallback } from "react";;;
import { KanbanAISuggestions, type Suggestion } from "@/components/workflows";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

// Missing table in database schema - using any for now
// type SmartWorkflowStep = Database["public"]["Tables"]["smart_workflow_steps"]["Row"];

// Example: Integration in a workflow detail page
export const WorkflowDetailWithAISuggestions = memo(function({ workflowId }: { workflowId: string }) {
  const [aiSuggestions, setAiSuggestions] = useState<Suggestion[]>([]);

  useEffect(() => {
    // Example: Fetch AI suggestions from an AI service or generate them
    const generateAISuggestions = async () => {
      // In a real implementation, this would call an AI service
      // For now, we'll use example data
      const suggestions: Suggestion[] = [
        {
          etapa: "Planejamento",
          tipo_sugestao: "Otimização de Processo",
          conteudo: "Recomendo adicionar um checkpoint de revisão técnica antes de passar para a fase de desenvolvimento. Isso pode reduzir retrabalho em até 30%.",
          criticidade: "Alta",
          responsavel_sugerido: "Tech Lead"
        },
        {
          etapa: "Desenvolvimento",
          tipo_sugestao: "Melhoria de Qualidade",
          conteudo: "Sugiro implementar testes automatizados unitários para cada nova feature desenvolvida. Aumenta a confiabilidade do código.",
          criticidade: "Média",
          responsavel_sugerido: "Desenvolvedor Senior"
        },
        {
          etapa: "Testes",
          tipo_sugestao: "Automação",
          conteudo: "Implementar testes de integração automatizados pode acelerar o processo de QA em 50%.",
          criticidade: "Média",
          responsavel_sugerido: "QA Lead"
        },
        {
          etapa: "Implantação",
          tipo_sugestao: "Segurança",
          conteudo: "Adicionar verificação de segurança automatizada antes do deploy em produção. Crítico para conformidade.",
          criticidade: "Crítica",
          responsavel_sugerido: "DevOps Lead"
        }
      ]);

      setAiSuggestions(suggestions);
    };

    generateAISuggestions();
  }, [workflowId]);

  return (
    <div className="space-y-6 p-6">
      {/* Existing workflow content */}
      <Card>
        <CardHeader>
          <CardTitle>Workflow: Desenvolvimento de Nova Feature</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Este workflow gerencia o desenvolvimento de novas features do produto.
          </p>
        </CardContent>
      </Card>

      {/* AI Suggestions Section */}
      {aiSuggestions.length > 0 && (
        <KanbanAISuggestions suggestions={aiSuggestions} />
      )}
    </div>
  );
}

// Example: Generate suggestions dynamically based on workflow analysis
export async function generateAISuggestionsForWorkflow(workflowId: string): Promise<Suggestion[]> {
  // Fetch workflow steps
  const { data: steps } = await (supabase as unknown)
    .from("smart_workflow_steps")
    .select("*")
    .eq("workflow_id", workflowId);

  if (!steps || steps.length === 0) {
    return [];
  }

  // Analyze workflow and generate suggestions
  const typedSteps = steps as any[];
  const suggestions: Suggestion[] = [];

  // Example: Detect missing documentation
  const stepsWithoutDescription = typedSteps.filter(s => !s.description);
  if (stepsWithoutDescription.length > 0) {
    suggestions.push({
      etapa: stepsWithoutDescription[0].title,
      tipo_sugestao: "Documentação",
      conteudo: `${stepsWithoutDescription.length} etapas sem descrição detalhada. Adicionar descrições melhora a clareza do processo.`,
      criticidade: "Baixa",
      responsavel_sugerido: "Gerente de Projeto"
    });
  }

  // Detect high priority tasks without assignment
  const unassignedHighPriority = typedSteps.filter(
    s => s.priority === "high" && !s.assigned_to
  );
  if (unassignedHighPriority.length > 0) {
    suggestions.push({
      etapa: unassignedHighPriority[0].title,
      tipo_sugestao: "Atribuição",
      conteudo: `${unassignedHighPriority.length} tarefas de alta prioridade sem responsável. Atribuir para evitar atrasos.`,
      criticidade: "Alta",
      responsavel_sugerido: "Product Owner"
    });
  }

  // Detect bottlenecks (many tasks in same status)
  const inProgressTasks = typedSteps.filter(s => s.status === "em_progresso");
  if (inProgressTasks.length > 5) {
    suggestions.push({
      etapa: "Em Progresso",
      tipo_sugestao: "Gestão de Gargalo",
      conteudo: `${inProgressTasks.length} tarefas em progresso. Considerar adicionar mais recursos ou priorizar conclusão de tarefas existentes.`,
      criticidade: "Média",
      responsavel_sugerido: "Scrum Master"
    });
  }

  // Suggest automation for repetitive tasks
  const pendingTasks = typedSteps.filter(s => s.status === "pendente");
  if (pendingTasks.length > 10) {
    suggestions.push({
      etapa: "Planejamento",
      tipo_sugestao: "Automação",
      conteudo: `Grande volume de tarefas pendentes (${pendingTasks.length}). Considerar templates ou automação para criação de tarefas recorrentes.`,
      criticidade: "Média",
      responsavel_sugerido: "Tech Lead"
    });
  }

  return suggestions;
}

// Example: Usage in a page component
export default function ExampleWorkflowPage() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  useEffect(() => {
    const loadSuggestions = async () => {
      // Method 1: Use pre-generated suggestions
      const staticSuggestions: Suggestion[] = [
        {
          etapa: "Code Review",
          tipo_sugestao: "Best Practice",
          conteudo: "Adicionar checklist de code review automatizado para garantir consistência nas revisões.",
          criticidade: "Média",
          responsavel_sugerido: "Tech Lead"
        }
      ]);

      // Method 2: Generate dynamic suggestions
      const dynamicSuggestions = await generateAISuggestionsForWorkflow("workflow-123");

      // Combine and set suggestions
      setSuggestions([...staticSuggestions, ...dynamicSuggestions]);
    };

    loadSuggestions();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Workflow com IA</h1>
      
      <KanbanAISuggestions suggestions={suggestions} />
    </div>
  );
}

// Example: Integration with existing workflow detail page
// Add this section to /src/pages/admin/workflows/detail.tsx

/*
import { KanbanAISuggestions } from '@/components/workflows';
import { generateAISuggestionsForWorkflow } from '@/components/workflows/examples';

// Inside the component, add state:
const [aiSuggestions, setAiSuggestions] = useState([]);

// In useEffect, fetch suggestions:
useEffect(() => {
  if (id) {
    generateAISuggestionsForWorkflow(id).then(setSuggestions);
  }
}, [id]);

// Add component to the render:
{aiSuggestions.length > 0 && (
  <KanbanAISuggestions suggestions={aiSuggestions} />
)}
*/
