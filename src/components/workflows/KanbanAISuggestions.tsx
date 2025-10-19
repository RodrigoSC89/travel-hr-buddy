"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export interface Suggestion {
  etapa: string;
  tipo_sugestao: string;
  conteudo: string;
  criticidade: string;
  responsavel_sugerido: string;
}

/**
 * KanbanAISuggestions Component - Placeholder
 * 
 * This is a placeholder component for the Kanban AI Suggestions.
 * The full implementation requires the workflow_ai_suggestions table in Supabase.
 * 
 * To enable this feature:
 * 1. Create the workflow_ai_suggestions table migration
 * 2. Run supabase gen types to update types
 * 3. Replace this file with src/_legacy/KanbanAISuggestions.tsx
 */
export function KanbanAISuggestions({ suggestions }: { suggestions: Suggestion[] }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">
        🤖 Sugestões da IA para este workflow
      </h2>
      
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Recurso Indisponível</AlertTitle>
        <AlertDescription>
          O recurso de sugestões de IA para workflows requer a criação da tabela <code className="bg-muted px-1 py-0.5 rounded">workflow_ai_suggestions</code> no banco de dados Supabase.
          <br /><br />
          Para ativar este recurso:
          <ol className="list-decimal ml-6 mt-2 space-y-1">
            <li>Criar a migração da tabela workflow_ai_suggestions</li>
            <li>Executar <code className="bg-muted px-1 py-0.5 rounded">supabase gen types</code></li>
            <li>Implementar o componente completo de <code className="bg-muted px-1 py-0.5 rounded">src/_legacy/KanbanAISuggestions.tsx</code></li>
          </ol>
        </AlertDescription>
      </Alert>

      {/* Show suggestions in a read-only mode */}
      {suggestions && suggestions.length > 0 && (
        <div className="space-y-4 mt-6">
          <p className="text-sm text-muted-foreground">Visualização apenas (modo somente leitura):</p>
          {suggestions.map((s, idx) => (
            <Card key={idx} className="opacity-60">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">🧩 Etapa:</span>
                    <span className="text-sm">{s.etapa}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">📌 Tipo:</span>
                    <span className="text-sm">{s.tipo_sugestao}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">💬 Conteúdo:</span>
                    <span className="text-sm">{s.conteudo}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">🔥 Criticidade:</span>
                    <span className="text-sm">{s.criticidade}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">👤 Responsável:</span>
                    <span className="text-sm">{s.responsavel_sugerido}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
