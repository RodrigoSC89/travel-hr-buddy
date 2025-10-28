# PATCH 409: Templates Integration with Document Hub

## 📋 Overview

**Status**: Active  
**Version**: 409.0  
**Last Updated**: 2025-10-28

This patch finalizes the template system by enabling full integration with Document Hub, including dynamic variable substitution and document export capabilities.

## 🎯 Features Implemented

### 1. Variable Substitution System

Templates support dynamic variables using `{{variable}}` syntax:

```
Olá {{nome}},

Este documento foi criado em {{data}} para {{empresa}}.
Seu cargo: {{cargo}}

Atenciosamente,
{{assinatura}}
```

### 2. Common Variables

Automatically pre-filled from user context:
- `{{nome}}` - User's full name
- `{{email}}` - User's email
- `{{cargo}}` - User's role/position
- `{{data}}` - Current date (pt-BR format)
- `{{hora}}` - Current time
- `{{data_hora}}` - Date and time
- `{{empresa}}` - Company name (Nautilus One)
- `{{ano}}` - Current year
- `{{mes}}` - Current month name
- `{{dia}}` - Current day

### 3. Template Application Service

Located at: `src/services/template-application.service.ts`

#### Extract Variables
```typescript
import { TemplateApplicationService } from '@/services/template-application.service';

const variables = TemplateApplicationService.extractVariables(templateContent);
// Returns: ['nome', 'data', 'cargo', ...]
```

#### Apply Template
```typescript
const data = {
  nome: 'João Silva',
  cargo: 'Engenheiro',
  data: '28/10/2025'
};

const result = TemplateApplicationService.applyTemplate(templateContent, data);
```

#### Validate Data
```typescript
const validation = TemplateApplicationService.validateTemplateData(
  templateContent,
  data,
  requiredVariables
);

if (!validation.valid) {
  console.log('Missing variables:', validation.missing);
}
```

#### Apply to Document
```typescript
const updatedDocument = TemplateApplicationService.applyToDocument(
  existingDocument,
  template,
  variableData
);
```

#### Create New Document from Template
```typescript
const newDocument = TemplateApplicationService.createDocumentFromTemplate(
  template,
  variableData,
  'Custom Title'
);
```

### 4. Apply Template Dialog Component

Located at: `src/components/templates/ApplyTemplateDialog.tsx`

#### Usage
```typescript
import { ApplyTemplateDialog } from '@/components/templates/ApplyTemplateDialog';

function DocumentEditor() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateData | null>(null);

  const handleApply = (content: string, metadata: any) => {
    // Update document with applied content
    updateDocument(content, metadata);
  };

  return (
    <>
      <Button onClick={() => setDialogOpen(true)}>
        Apply Template
      </Button>

      <ApplyTemplateDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        template={selectedTemplate}
        onApply={handleApply}
        documentTitle="My Document"
      />
    </>
  );
}
```

#### Features
- **Real-time Preview**: See applied variables as you type
- **Validation**: Highlights missing required variables
- **Auto-fill**: Pre-populates common variables
- **Smart Inputs**: Date pickers for date variables, email validation
- **Split View**: Form on left, preview on right

### 5. Document Export

Export applied templates in multiple formats:

```typescript
const blob = await TemplateApplicationService.exportDocument(
  document,
  'pdf' // or 'docx', 'html', 'txt'
);

// Create download link
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `${document.title}.pdf`;
a.click();
```

## 🔄 Integration with Document Hub

### Add "Apply Template" Button

In your Document Hub component:

```typescript
import { ApplyTemplateDialog } from '@/components/templates/ApplyTemplateDialog';

function DocumentHub() {
  // ... existing code

  return (
    <div>
      {/* Document actions */}
      <Button onClick={() => setShowTemplateDialog(true)}>
        <FileText className="mr-2" />
        Apply Template
      </Button>

      <ApplyTemplateDialog
        open={showTemplateDialog}
        onOpenChange={setShowTemplateDialog}
        template={selectedTemplate}
        onApply={handleTemplateApply}
      />
    </div>
  );
}
```

### Handle Template Application

```typescript
const handleTemplateApply = async (content: string, metadata: any) => {
  try {
    // Update current document
    const { error } = await supabase
      .from('documents')
      .update({
        content: content,
        metadata: {
          ...document.metadata,
          ...metadata
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', document.id);

    if (error) throw error;

    toast({
      title: "Template applied successfully",
      description: "Your document has been updated."
    });

    // Refresh document
    await fetchDocument();
  } catch (error) {
    console.error('Error applying template:', error);
    toast({
      title: "Error",
      description: "Failed to apply template",
      variant: "destructive"
    });
  }
};
```

## 📝 Creating Templates

### Template Structure

```typescript
interface TemplateData {
  id: string;
  title: string;
  content: string; // HTML with {{variables}}
  variables?: TemplateVariable[]; // Optional metadata
  created_at?: string;
}
```

### Example Template

```html
<h1>Relatório de {{tipo}}</h1>

<p>Data: {{data}}</p>
<p>Responsável: {{nome}} ({{cargo}})</p>

<h2>Resumo</h2>
<p>{{resumo}}</p>

<h2>Detalhes</h2>
<p>{{detalhes}}</p>

<p>Documento gerado automaticamente em {{data_hora}}.</p>
```

## 🎨 Variable Types

The system supports different input types:

- **Text**: Default input
- **Date**: Date picker for `*data*` variables
- **Email**: Email validation for `*email*` variables
- **Select**: Dropdown (define in template metadata)
- **Number**: Number input
- **Textarea**: Multi-line text

## ✅ Acceptance Criteria

- [x] Templates can be loaded from Document Hub
- [x] Variable substitution system implemented (`{{variable}}`)
- [x] Export final document with real data applied
- [x] "Apply Template" button in Document Hub
- [x] Bidirectional integration between modules
- [x] No data corruption when saving
- [x] Real-time preview
- [x] Validation of required fields
- [x] Common variables auto-fill

## 🔐 Security

- Input validation for all variables
- HTML sanitization for preview
- XSS protection
- User authentication required
- Row-level security on templates table

## 🧪 Testing

Test the template system:

```bash
npm run test -- template-application
```

## 📖 Related Documentation

- [Template Manager Component](/src/components/templates/README.md)
- [Document Hub](/src/modules/document-hub/README.md)
- [Template API](/pages/api/templates/README.md)

## 🚀 Next Steps

Future enhancements:
- Rich text editor for template creation
- Template marketplace/library
- Advanced conditional logic (if/else)
- Template versioning
- Collaborative template editing
- AI-powered template suggestions

---

**Last Updated**: 2025-10-28  
**Patch**: PATCH 409  
**Status**: ✅ Active - Fully Integrated
