export { default as KanbanAISuggestions } from "@/_legacy/KanbanAISuggestions";
export { WorkflowAIScoreCard } from "./WorkflowAIScoreCard";
export { exportSuggestionsToPDF } from "./ExportSuggestionsPDF";

// Shared interface for workflow AI suggestions
export interface Suggestion {
  etapa: string;
  tipo_sugestao: string;
  conteudo: string;
  criticidade: string;
  responsavel_sugerido: string;
}
