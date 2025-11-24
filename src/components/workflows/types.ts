export interface Suggestion {
  id?: string;
  etapa: string;
  tipo_sugestao: string;
  conteudo: string;
  criticidade: string;
  responsavel_sugerido: string;
  suggestion_type?: string;
  suggestion_text?: string;
  confidence_score?: number;
  applied?: boolean;
}

export interface KanbanAISuggestionsProps {
  suggestions: Suggestion[];
}
