# 📄 Workflow Suggestions PDF Export

## Overview

This feature allows users to export AI-generated workflow suggestions as a professionally formatted PDF document. The export function follows the existing PDF export patterns used throughout the application and provides a clean, organized report that can be shared or stored for future reference.

## Files Added

### 1. Core Component
- **`src/components/workflows/ExportSuggestionsPDF.tsx`**
  - Main export function using jsPDF library
  - Follows existing patterns from `restore-logs-export.ts`
  - Properly formats all suggestion fields in Portuguese

### 2. Tests
- **`src/tests/components/workflows/ExportSuggestionsPDF.test.ts`**
  - Comprehensive test suite with 8 tests
  - All tests passing ✅
  - Covers functionality, formatting, and edge cases

### 3. Integration
- **`src/components/workflows/index.ts`** (updated)
  - Exports the new component and types
- **`src/components/workflows/KanbanAISuggestions.tsx`** (updated)
  - Uses shared `Suggestion` interface
- **`src/pages/admin/workflows/detail.tsx`** (updated)
  - Added AI Suggestions section with export button
  - Includes demo data for testing

## Features

### PDF Export Function
The `exportSuggestionsToPDF` function:

✅ **Uses jsPDF** (not html2pdf.js) - consistent with existing patterns  
✅ **Portuguese labels** - "Plano de Ações IA - Workflow"  
✅ **All suggestion fields**:
- 🧩 Etapa (Stage)
- 📌 Tipo (Type)
- 💬 Conteúdo (Content)
- 🔥 Criticidade (Criticality)
- 👤 Responsável Sugerido (Suggested Responsible)

✅ **Professional formatting**:
- Clear title and metadata
- Proper page breaks
- Text wrapping for long content
- Separator lines between suggestions
- Date-stamped filename

✅ **Edge case handling**:
- Empty suggestion arrays
- Long content with automatic text splitting
- Multiple pages when needed

## Usage

### Import the Function

```typescript
import { exportSuggestionsToPDF, type Suggestion } from "@/components/workflows";
```

### Define Suggestions

```typescript
const suggestions: Suggestion[] = [
  {
    etapa: "Planejamento",
    tipo_sugestao: "Análise de Riscos",
    conteudo: "Realizar análise de riscos detalhada antes de iniciar o desenvolvimento.",
    criticidade: "Alta",
    responsavel_sugerido: "Project Manager"
  },
  {
    etapa: "Desenvolvimento",
    tipo_sugestao: "Code Review",
    conteudo: "Implementar revisão de código em pares para garantir qualidade.",
    criticidade: "Média",
    responsavel_sugerido: "Tech Lead"
  }
];
```

### Export to PDF

```typescript
// Simple usage
exportSuggestionsToPDF(suggestions);

// With toast notification
import { useToast } from "@/hooks/use-toast";

const { toast } = useToast();

const handleExport = () => {
  exportSuggestionsToPDF(suggestions);
  toast({
    title: "PDF Exportado",
    description: "O plano de ações foi exportado com sucesso!",
  });
};
```

## Integration Example

The workflow detail page (`/admin/workflows/:id`) now includes an AI Suggestions section with an export button:

```tsx
<Card>
  <CardHeader>
    <CardTitle className="flex items-center justify-between">
      <span>🤖 Sugestões da IA</span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          exportSuggestionsToPDF(demoSuggestions);
          toast({
            title: "PDF Exportado",
            description: "O plano de ações foi exportado com sucesso!",
          });
        }}
      >
        📄 Exportar PDF
      </Button>
    </CardTitle>
  </CardHeader>
</Card>
```

## Demo Data

The workflow detail page includes demo suggestions for testing:

- **Planejamento**: Análise de Riscos (Alta)
- **Desenvolvimento**: Code Review (Média)
- **Testes**: Automação (Alta)
- **Deploy**: Monitoramento (Média)

## PDF Output Example

```
📄 Plano de Acoes IA - Workflow
Data: 15/10/2025 14:23
Total de sugestoes: 4

Sugestao 1
Etapa: Planejamento
Tipo: Análise de Riscos
Conteudo: Realizar análise de riscos detalhada...
Criticidade: Alta
Responsavel: Project Manager

─────────────────────────────

Sugestao 2
Etapa: Desenvolvimento
...
```

## Testing

### Run Tests

```bash
npm test -- src/tests/components/workflows/ExportSuggestionsPDF.test.ts
```

### Test Coverage

✅ 8 tests, all passing:
1. Export PDF with proper title and metadata
2. Export all suggestion fields
3. Handle multiple suggestions
4. Use proper font styles
5. Save PDF with proper filename
6. Handle empty suggestions array
7. Handle long content with text splitting
8. Add new page when content exceeds page height

## Build Verification

```bash
npm run build
# ✓ built in 51.88s - Success!
```

## Technical Details

### Dependencies
- **jsPDF**: ^3.0.3 (already in project)
- **date-fns**: ^3.6.0 (already in project)

### Pattern Consistency
Follows the same patterns as:
- `src/utils/restore-logs-export.ts`
- `src/pages/admin/documents/ai-editor.tsx`
- `src/pages/admin/dashboard.tsx`

### Type Safety
- Full TypeScript support
- Exported `Suggestion` interface
- Type-safe function parameters

### Code Quality
- ESLint compliant
- Prettier formatted
- No build warnings or errors

## Future Enhancements

Potential improvements for future iterations:

1. **Customization Options**
   - Font size selection
   - Color themes
   - Logo/header customization

2. **Additional Formats**
   - CSV export
   - Excel export
   - JSON export

3. **AI Integration**
   - Real-time suggestion generation
   - Save to database
   - Suggestion history

4. **Enhanced Formatting**
   - Charts and graphs
   - Priority-based highlighting
   - Status indicators

## Related Documentation

- [SMART_WORKFLOWS_IMPLEMENTATION.md](../SMART_WORKFLOWS_IMPLEMENTATION.md)
- [WORKFLOW_AI_EXTENSION_README.md](../WORKFLOW_AI_EXTENSION_README.md)
- [KanbanAISuggestions Component](../src/components/workflows/README.md)

## Support

For questions or issues:
1. Check existing tests for usage examples
2. Review similar PDF export implementations
3. Refer to jsPDF documentation
4. Contact the development team

---

**Status**: ✅ Complete and Production Ready
**Tests**: ✅ 8/8 Passing
**Build**: ✅ Successful
**Documentation**: ✅ Complete
