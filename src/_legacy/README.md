# Legacy Components

Este diretório contém componentes que dependem de tabelas do Supabase que ainda não foram criadas:

## Tabelas Ausentes

- `dp_incidents` - Usado por DPIntelligencePage e dp-intelligence-center
- `audit_comments` - Usado por ExportarComentariosPDF.example  
- `ai_document_templates` - Usado por ai-templates e ApplyTemplateModal
- `workflow_ai_suggestions` - Usado por KanbanAISuggestions e workflowAIMetrics

## Reintegração

Para reintegrar esses componentes ao projeto:

1. Criar as migrações do Supabase para as tabelas acima
2. Executar `supabase gen types` para atualizar os tipos
3. Mover os componentes de volta para suas pastas originais
4. Remover os imports do `_legacy/` nas páginas principais

## Estrutura Original

```
src/components/dp-intelligence/dp-intelligence-center.tsx
src/pages/admin/DPIntelligencePage.tsx
src/components/sgso/ExportarComentariosPDF.example.tsx
src/components/templates/ApplyTemplateModal.tsx
src/pages/admin/documents/ai-templates.tsx
src/components/workflows/KanbanAISuggestions.tsx
src/lib/analytics/workflowAIMetrics.ts
```
