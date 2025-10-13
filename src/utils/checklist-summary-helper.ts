/**
 * Example: How to use the summarize-checklist Supabase Function
 * 
 * This file demonstrates how to integrate the summarize-checklist function
 * into your React components.
 */

import React from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ChecklistItem {
  title: string;
  checked?: boolean;
  completed?: boolean;
}

interface ChecklistComment {
  user: string;
  text: string;
}

/**
 * Call the summarize-checklist function to get AI-generated summary and suggestions
 */
export async function summarizeChecklist(
  title: string,
  items: ChecklistItem[],
  comments?: ChecklistComment[]
): Promise<{ summary: string; timestamp: string }> {
  try {
    const { data, error } = await supabase.functions.invoke("summarize-checklist", {
      body: {
        title,
        items,
        comments: comments || []
      }
    });

    if (error) {
      throw error;
    }

    return {
      summary: data.summary,
      timestamp: data.timestamp
    };
  } catch (error) {
    console.error("Error summarizing checklist:", error);
    throw error;
  }
}

/**
 * React Hook Example: useSummarizeChecklist
 * 
 * Usage in a component:
 * 
 * ```tsx
 * const { summarize, summary, isLoading, error } = useSummarizeChecklist();
 * 
 * const handleSummarize = async () => {
 *   await summarize("My Checklist", items, comments);
 * };
 * ```
 */
export function useSummarizeChecklist() {
  const [summary, setSummary] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const { toast } = useToast();

  const summarize = async (
    title: string,
    items: ChecklistItem[],
    comments?: ChecklistComment[]
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await summarizeChecklist(title, items, comments);
      setSummary(result.summary);
      
      toast({
        title: "Resumo gerado com sucesso!",
        description: "A IA analisou seu checklist e gerou sugestões.",
      });

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao gerar resumo";
      setError(errorMessage);
      
      toast({
        title: "Erro ao gerar resumo",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { summarize, summary, isLoading, error };
}

/**
 * Example Component Integration
 * 
 * This shows how to add a "Summarize" button to an existing checklist component
 */
/*
// Add this to your checklist component:

import { useSummarizeChecklist } from "@/utils/checklist-summary-helper";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { logger } from "@/lib/logger";

function ChecklistComponent() {
  const { summarize, summary, isLoading } = useSummarizeChecklist();
  const [checklist, setChecklist] = useState<Checklist>({...});

  const handleSummarize = async () => {
    await summarize(
      checklist.title,
      checklist.items,
      checklist.comments // optional
    );
  };

  return (
    <div>
      <Button 
        onClick={handleSummarize} 
        disabled={isLoading}
      >
        <Sparkles className="w-4 h-4 mr-2" />
        {isLoading ? "Gerando..." : "Resumir com IA"}
      </Button>

      {summary && (
        <Card className="mt-4">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2">📊 Resumo do Checklist</h3>
            <div className="text-sm whitespace-pre-line">
              {summary}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
*/

/**
 * Example: Direct API call (without hook)
 */
/*
async function generateChecklistSummary() {
  const { data, error } = await supabase.functions.invoke("summarize-checklist", {
    body: {
      title: "Checklist de embarque",
      items: [
        { title: "Validar documentos", checked: true },
        { title: "Verificar carga", checked: false }
      ],
      comments: [
        { user: "Maria", text: "Faltam dados do navio" }
      ]
    }
  });

  if (error) {
    console.error("Error:", error);
    return;
  }

  logger.info("Summary:", data.summary);
  // Expected output:
  // "📊 1 de 2 tarefas concluídas. ⚠️ Checklist parcialmente completo.
  //  💡 Sugestões: 
  //  1) Concluir verificação de carga
  //  2) Adicionar dados do navio conforme comentário de Maria
  //  3) Implementar checklist automático"
}
*/
