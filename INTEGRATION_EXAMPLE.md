# Integration Example: Adding AI Summary to Checklist Page

This document shows how to add the AI summary feature to the existing checklist page.

## Step 1: Import Required Dependencies

Add to the top of `/src/pages/admin/checklists.tsx`:

```typescript
import { Sparkles } from "lucide-react";
import { summarizeChecklist } from "@/utils/checklist-summary-helper";
import { useToast } from "@/hooks/use-toast";
```

## Step 2: Add State Management

Add these state variables inside the component:

```typescript
const [summarizing, setSummarizing] = useState<string | null>(null); // checklistId being summarized
const [summaries, setSummaries] = useState<Record<string, string>>({}); // { checklistId: summary }
const { toast } = useToast();
```

## Step 3: Add Summary Function

Add this function inside your component:

```typescript
async function generateSummary(checklistId: string) {
  const checklist = checklists.find(c => c.id === checklistId);
  if (!checklist) return;

  setSummarizing(checklistId);

  try {
    const result = await summarizeChecklist(
      checklist.title,
      checklist.items.map(item => ({
        title: item.title,
        completed: item.completed
      })),
      [] // Add comments here if available
    );

    setSummaries(prev => ({
      ...prev,
      [checklistId]: result.summary
    }));

    toast({
      title: "✨ Resumo gerado!",
      description: "A IA analisou seu checklist com sucesso.",
    });
  } catch (error) {
    console.error("Error generating summary:", error);
    toast({
      title: "Erro ao gerar resumo",
      description: error instanceof Error ? error.message : "Erro desconhecido",
      variant: "destructive",
    });
  } finally {
    setSummarizing(null);
  }
}
```

## Step 4: Add UI Button

Add this button next to the "Exportar PDF" button in your checklist card:

```tsx
<Button
  variant="outline"
  onClick={() => generateSummary(checklist.id)}
  disabled={summarizing === checklist.id}
>
  <Sparkles className="w-4 h-4 mr-2" />
  {summarizing === checklist.id ? "Gerando..." : "Resumir com IA"}
</Button>
```

## Step 5: Display Summary

Add this below the Progress component to show the summary:

```tsx
{summaries[checklist.id] && (
  <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
    <div className="flex items-center gap-2 mb-2">
      <Sparkles className="w-5 h-5 text-blue-600" />
      <h3 className="font-semibold text-blue-900 dark:text-blue-100">
        Resumo da IA
      </h3>
    </div>
    <div className="text-sm text-blue-800 dark:text-blue-200 whitespace-pre-line">
      {summaries[checklist.id]}
    </div>
  </div>
)}
```

## Complete Example

Here's how the updated card section would look:

```tsx
{checklists.map((checklist) => (
  <Card key={checklist.id} id={`checklist-${checklist.id}`}>
    <CardContent className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">📝 {checklist.title}</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => generateSummary(checklist.id)}
            disabled={summarizing === checklist.id}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {summarizing === checklist.id ? "Gerando..." : "Resumir com IA"}
          </Button>
          <Button
            variant="outline"
            onClick={() => exportPDF(checklist.id)}
          >
            📄 Exportar PDF
          </Button>
        </div>
      </div>

      <Progress value={calculateProgress(checklist.items)} />

      {summaries[checklist.id] && (
        <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900 dark:text-blue-100">
              Resumo da IA
            </h3>
          </div>
          <div className="text-sm text-blue-800 dark:text-blue-200 whitespace-pre-line">
            {summaries[checklist.id]}
          </div>
        </div>
      )}

      {/* Rest of your checklist items rendering */}
    </CardContent>
  </Card>
))}
```

## Expected Output

When the user clicks "Resumir com IA", they will see something like:

```
📊 Status Geral: 3 de 5 tarefas concluídas (60%)

✅ Progresso: Checklist está em bom andamento com a maioria dos itens críticos completados.

💡 Sugestões de Melhoria:
1. Priorizar a conclusão dos 2 itens pendentes
2. Adicionar evidências fotográficas aos itens concluídos
3. Implementar validação automática para garantir qualidade
```

## API Endpoint Details

The function calls:
- **Endpoint**: `supabase.functions.invoke("summarize-checklist", {...})`
- **Method**: POST
- **Model**: GPT-4
- **Temperature**: 0.5 (for consistent, focused responses)

## Notes

1. Make sure `OPENAI_API_KEY` is configured in Supabase Edge Functions settings
2. The function includes retry logic and timeout protection
3. Costs apply based on OpenAI token usage
4. Summary is cached in component state to avoid re-generating on re-renders
