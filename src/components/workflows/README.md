# Workflow Suggestions PDF Export

## Overview

This module provides functionality to export AI-generated workflow suggestions to PDF format. It follows the existing PDF export patterns in the codebase and uses the `jsPDF` library for PDF generation.

## Features

- ✅ **Professional PDF Generation**: Creates well-formatted PDF documents with proper structure
- ✅ **Portuguese Labels**: All text and labels are in Portuguese (Brazilian)
- ✅ **Comprehensive Fields**: Includes all suggestion fields (etapa, tipo_sugestao, conteudo, criticidade, responsavel_sugerido)
- ✅ **Smart Pagination**: Automatically handles page breaks for long content
- ✅ **Text Wrapping**: Long text fields are automatically wrapped to fit page width
- ✅ **Metadata**: Includes generation timestamp and total suggestions count
- ✅ **Type-Safe**: Full TypeScript support with proper interfaces

## Installation

The required dependencies are already installed in the project:

```json
{
  "jspdf": "^3.0.3",
  "date-fns": "^3.6.0"
}
```

## Usage

### Basic Example

```typescript
import { exportSuggestionsToPDF, WorkflowSuggestion } from "@/components/workflows/ExportSuggestionsPDF";

// Define your suggestions
const suggestions: WorkflowSuggestion[] = [
  {
    etapa: "Análise de Requisitos",
    tipo_sugestao: "Melhoria",
    conteudo: "Implementar validação automática de dados de entrada para reduzir erros",
    criticidade: "alta",
    responsavel_sugerido: "Equipe de Desenvolvimento"
  },
  {
    etapa: "Revisão de Código",
    tipo_sugestao: "Otimização",
    conteudo: "Adicionar testes automatizados para aumentar a cobertura de código",
    criticidade: "media",
    responsavel_sugerido: "Tech Lead"
  }
];

// Export to PDF
exportSuggestionsToPDF(suggestions);
```

### Integration with Workflow Detail Page

```typescript
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { exportSuggestionsToPDF } from "@/components/workflows/ExportSuggestionsPDF";

const WorkflowDetailPage = ({ workflowId }: { workflowId: string }) => {
  const [suggestions, setSuggestions] = useState<WorkflowSuggestion[]>([]);

  // Fetch suggestions from API
  useEffect(() => {
    // Your API call here
    fetchWorkflowSuggestions(workflowId).then(setSuggestions);
  }, [workflowId]);

  const handleExport = () => {
    exportSuggestionsToPDF(suggestions);
  };

  return (
    <div>
      {/* Your workflow detail content */}
      
      <Button onClick={handleExport}>
        <FileDown className="mr-2 h-4 w-4" />
        Exportar Sugestões em PDF
      </Button>
    </div>
  );
};
```

## API Reference

### `WorkflowSuggestion` Interface

```typescript
interface WorkflowSuggestion {
  id?: string;                              // Optional: Unique identifier
  etapa: string;                            // Workflow step/stage name
  tipo_sugestao: string;                    // Suggestion type (e.g., "Melhoria", "Otimização")
  conteudo: string;                         // Suggestion content/description
  criticidade: "baixa" | "media" | "alta" | "critica";  // Criticality level
  responsavel_sugerido: string;             // Suggested responsible person/team
  created_at?: string;                      // Optional: Creation timestamp
}
```

### `exportSuggestionsToPDF(suggestions: WorkflowSuggestion[]): void`

Exports an array of workflow suggestions to a PDF file.

**Parameters:**
- `suggestions` (WorkflowSuggestion[]): Array of workflow suggestions to export

**Returns:**
- `void`: The function triggers a browser download of the PDF file

**File Naming:**
- Format: `Plano-Acoes-Workflow-YYYY-MM-DD.pdf`
- Example: `Plano-Acoes-Workflow-2025-10-15.pdf`

## PDF Structure

The generated PDF includes:

1. **Header Section**
   - Title: "Plano de Ações IA - Workflow"
   - Generation timestamp
   - Total number of suggestions

2. **Suggestion Details** (for each suggestion)
   - Sequential numbering (Sugestão 1, Sugestão 2, etc.)
   - Etapa (Stage)
   - Tipo (Type)
   - Conteúdo (Content) - with automatic text wrapping
   - Criticidade (Criticality)
   - Responsável (Responsible)
   - Visual separator line

3. **Features**
   - Automatic page breaks when content exceeds page height
   - Text wrapping for long content fields
   - Consistent formatting and spacing
   - Professional typography (Helvetica font)

## Testing

The module includes a comprehensive test suite with 8 tests covering:

1. ✅ PDF document creation with proper title
2. ✅ Metadata inclusion (date and suggestion count)
3. ✅ All suggestion fields rendering correctly
4. ✅ Empty array handling
5. ✅ Multiple suggestions handling
6. ✅ Portuguese labels verification
7. ✅ Filename format validation
8. ✅ All criticality levels support

### Running Tests

```bash
# Run all tests
npm run test

# Run specific test file
npm run test src/tests/ExportSuggestionsPDF.test.ts

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Results

```
✓ src/tests/ExportSuggestionsPDF.test.ts (8 tests) 12ms

Test Files  1 passed (1)
     Tests  8 passed (8)
```

## Implementation Details

### Design Pattern

This implementation follows the existing PDF export pattern used in the codebase, specifically modeled after `src/utils/restore-logs-export.ts`. This ensures consistency and maintainability across the application.

### Key Differences from html2pdf.js Approach

The problem statement initially mentioned using `html2pdf.js`, but this implementation uses `jsPDF` directly for several reasons:

1. **Consistency**: Matches the existing codebase pattern
2. **Performance**: Direct PDF generation is faster than HTML-to-PDF conversion
3. **Control**: Better control over PDF formatting and layout
4. **Reliability**: More predictable output across different browsers
5. **Size**: Smaller bundle size compared to html2pdf.js

### Text Wrapping Implementation

Long text fields (etapa, conteudo, responsavel_sugerido) use `jsPDF`'s `splitTextToSize()` method to automatically wrap text within the page margins:

```typescript
const conteudoText = doc.splitTextToSize(suggestion.conteudo, 160);
doc.text(conteudoText, margin + 25, y);
y += 5 * Math.ceil(conteudoText.length);
```

### Page Break Logic

The function monitors the vertical position (`y` coordinate) and adds a new page when content approaches the bottom margin:

```typescript
if (y > pageHeight - 40) {
  doc.addPage();
  y = margin;
}
```

## Use Cases

1. **Documentation**: Generate official PDF reports of AI suggestions for workflow improvements
2. **Sharing**: Share action plans with stakeholders via email or document management systems
3. **Archiving**: Store PDF exports as evidence of AI-assisted decision making
4. **Compliance**: Maintain audit trail of workflow optimization suggestions
5. **Presentations**: Use PDF exports in meetings and presentations

## Future Enhancements

Potential improvements for future versions:

- [ ] Add logo and branding to PDF header
- [ ] Support for custom color schemes based on criticality levels
- [ ] Include charts/graphs showing suggestion statistics
- [ ] Support for filtering suggestions before export (by criticality, type, etc.)
- [ ] Multi-language support (currently Portuguese only)
- [ ] Email integration to send PDFs directly
- [ ] Batch export multiple workflows

## Troubleshooting

### Issue: PDF not downloading

**Solution**: Check browser console for errors. Ensure pop-up blocker is not preventing download.

### Issue: Text appears cut off

**Solution**: The function uses automatic text wrapping. If issues persist, check that suggestion content doesn't contain special characters that may affect rendering.

### Issue: TypeScript errors

**Solution**: Ensure all required fields are provided in the `WorkflowSuggestion` object. The `id` and `created_at` fields are optional.

## Related Files

- **Component**: `/src/components/workflows/ExportSuggestionsPDF.tsx`
- **Tests**: `/src/tests/ExportSuggestionsPDF.test.ts`
- **Reference Pattern**: `/src/utils/restore-logs-export.ts`

## Support

For issues, questions, or contributions, please refer to the main project documentation or contact the development team.

## License

This module is part of the Travel HR Buddy project and follows the same license terms.
