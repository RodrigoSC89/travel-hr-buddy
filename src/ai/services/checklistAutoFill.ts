/**
 * PATCH 134.0 - Checklist Autocompletion with AI
 * Enables AI-powered auto-completion for checklists based on historical patterns
 * 
 * Features:
 * - Auto-fill checklist items based on history
 * - Pattern recognition from previous completions
 * - Compliance-aware suggestions
 * - User review and edit capability
 */

import { runOpenAI } from "@/ai/engine";
import { supabase } from "@/integrations/supabase/client";

export interface ChecklistItem {
  id: string;
  label: string;
  checked?: boolean;
  value?: string;
  notes?: string;
}

export interface ChecklistHistory {
  id: string;
  checklistType: string;
  items: ChecklistItem[];
  completedAt: string;
  vessel?: string;
  user?: string;
}

export interface AutoFillResult {
  items: ChecklistItem[];
  confidence: number;
  source: "ai" | "pattern" | "manual";
  suggestions: string[];
}

/**
 * Auto-fill checklist using AI and historical patterns
 */
export const autoFillChecklist = async (
  checklistId: string,
  checklistType: string,
  currentItems: ChecklistItem[],
  context?: {
    vessel?: string;
    user?: string;
    date?: string;
  }
): Promise<AutoFillResult> => {
  try {
    // Fetch historical data
    const history = await fetchChecklistHistory(checklistType, context?.vessel);
    
    if (history.length === 0) {
      return {
        items: currentItems,
        confidence: 0,
        source: "manual",
        suggestions: ["Sem histórico disponível para este tipo de checklist."]
      };
    }

    // Use AI to generate completions
    const aiResult = await generateAICompletions(
      checklistType,
      currentItems,
      history,
      context
    );

    return aiResult;
  } catch (error) {
    console.error("Error in autoFillChecklist:", error);
    
    // Fallback to pattern-based completion
    return generatePatternBasedCompletions(currentItems, []);
  }
};

/**
 * PATCH 586: Fetch checklist history from database (checklist_completions table exists)
 */
const fetchChecklistHistory = async (
  checklistType: string,
  vessel?: string
): Promise<ChecklistHistory[]> => {
  try {
    let query = supabase
      .from("checklist_completions")
      .select("*")
      .eq("checklist_type", checklistType)
      .order("completed_at", { ascending: false })
      .limit(10);
    
    if (vessel) {
      query = query.eq("vessel_id", vessel);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Error fetching checklist history:", error);
      return [];
    }
    
    return (data || []).map(record => ({
      id: record.id,
      checklistType: record.checklist_type,
      items: Array.isArray(record.items) ? record.items : [],
      completedAt: record.completed_at,
      vessel: record.vessel_id,
      user: record.user_id
    }));
  } catch (error) {
    console.error("Error fetching checklist history:", error);
    return [];
  }
};

/**
 * Generate AI-powered completions
 */
const generateAICompletions = async (
  checklistType: string,
  currentItems: ChecklistItem[],
  history: ChecklistHistory[],
  context?: any
): Promise<AutoFillResult> => {
  try {
    const historyContext = history.slice(0, 5).map((h, idx) => `
Histórico ${idx + 1} (${new Date(h.completedAt).toLocaleDateString("pt-BR")}):
${h.items.map(item => `- ${item.label}: ${item.value || (item.checked ? "Sim" : "Não")} ${item.notes ? `(${item.notes})` : ""}`).join("\n")}`
    ).join("\n\n");

    const itemsList = currentItems.map(item => `- ${item.label}`).join("\n");

    const prompt = `Com base no histórico de preenchimento de checklists similares, preencha o checklist do tipo "${checklistType}" de forma inteligente.

ITENS DO CHECKLIST ATUAL:
${itemsList}

HISTÓRICO DE PREENCHIMENTOS ANTERIORES:
${historyContext}

CONTEXTO ADICIONAL:
- Embarcação: ${context?.vessel || "N/A"}
- Data: ${context?.date || new Date().toLocaleDateString("pt-BR")}

Retorne um JSON com os itens preenchidos no formato:
{
  "items": [
    {
      "id": "id do item",
      "label": "label do item",
      "checked": true/false,
      "value": "valor sugerido (se aplicável)",
      "notes": "notas explicativas (se relevante)"
    }
  ],
  "confidence": 0.0 a 1.0,
  "suggestions": ["dica 1", "dica 2"]
}

Regras:
- Use padrões do histórico quando aplicável
- Marque como "checked: true" apenas itens que historicamente são sempre marcados
- Deixe em branco (null) itens que variam muito
- Forneça notas quando houver informações relevantes do histórico
- Confidence alto (>0.8) apenas para padrões muito consistentes`;

    const response = await runOpenAI({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Você é um especialista em compliance marítimo e preenchimento de checklists. Sempre retorne JSON válido."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.2, // Low temperature for consistency
      maxTokens: 2000
    });

    const result = parseAICompletionResponse(response.content, currentItems);
    return result;
  } catch (error) {
    console.error("Error generating AI completions:", error);
    throw error;
  }
};

/**
 * Parse AI response for checklist completions
 */
const parseAICompletionResponse = (
  responseText: string,
  originalItems: ChecklistItem[]
): AutoFillResult => {
  try {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const parsed = JSON.parse(jsonMatch[0]);
    
    // Merge with original items to preserve IDs
    const mergedItems = originalItems.map(originalItem => {
      const aiItem = parsed.items?.find((i: any) => 
        i.label === originalItem.label || i.id === originalItem.id
      );
      
      if (aiItem) {
        return {
          ...originalItem,
          checked: aiItem.checked ?? originalItem.checked,
          value: aiItem.value ?? originalItem.value,
          notes: aiItem.notes ?? originalItem.notes
        };
      }
      
      return originalItem;
    });

    return {
      items: mergedItems,
      confidence: typeof parsed.confidence === "number" 
        ? Math.max(0, Math.min(1, parsed.confidence))
        : 0.6,
      source: "ai",
      suggestions: Array.isArray(parsed.suggestions) 
        ? parsed.suggestions.slice(0, 5)
        : []
    };
  } catch (error) {
    console.error("Error parsing AI completion response:", error);
    throw error;
  }
};

/**
 * Generate pattern-based completions (fallback)
 */
const generatePatternBasedCompletions = (
  items: ChecklistItem[],
  history: ChecklistHistory[]
): AutoFillResult => {
  if (history.length === 0) {
    return {
      items,
      confidence: 0,
      source: "manual",
      suggestions: [
        "Configure a chave da API OpenAI para preenchimento automático inteligente",
        "Ou complete manualmente para criar histórico de padrões"
      ]
    };
  }

  // Simple pattern matching based on frequency
  const patternItems = items.map(item => {
    const matches = history.flatMap(h => 
      h.items.filter(hi => hi.label === item.label)
    );
    
    if (matches.length > 0) {
      const checkedCount = matches.filter(m => m.checked).length;
      const mostCommonValue = findMostCommon(matches.map(m => m.value).filter(Boolean));
      
      return {
        ...item,
        checked: checkedCount / matches.length > 0.7, // 70% threshold
        value: mostCommonValue || item.value,
        notes: matches.length > 3 ? `Baseado em ${matches.length} registros anteriores` : undefined
      };
    }
    
    return item;
  });

  return {
    items: patternItems,
    confidence: history.length > 5 ? 0.7 : 0.5,
    source: "pattern",
    suggestions: [
      "Preenchimento baseado em padrões históricos",
      "Revise os valores sugeridos antes de confirmar"
    ]
  };
};

/**
 * Find most common value in array
 */
const findMostCommon = (arr: (string | undefined)[]): string | undefined => {
  if (arr.length === 0) return undefined;
  
  const frequency: Record<string, number> = {};
  arr.forEach(item => {
    if (item) {
      frequency[item] = (frequency[item] || 0) + 1;
    }
  });
  
  let maxCount = 0;
  let mostCommon: string | undefined;
  
  Object.entries(frequency).forEach(([value, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mostCommon = value;
    }
  });
  
  return mostCommon;
};

/**
 * PATCH 586: Save completed checklist to history (checklist_completions table exists)
 */
export const saveChecklistCompletion = async (
  checklistType: string,
  items: ChecklistItem[],
  context?: {
    vessel?: string;
    userId?: string;
  }
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("checklist_completions")
      .insert({
        checklist_type: checklistType,
        items: items,
        vessel_id: context?.vessel,
        user_id: context?.userId,
        completed_at: new Date().toISOString()
      });
    
    if (error) {
      console.error("Error saving checklist completion:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error saving checklist completion:", error);
    return false;
  }
};
