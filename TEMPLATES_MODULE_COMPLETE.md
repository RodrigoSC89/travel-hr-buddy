# Templates with AI Module - Complete Documentation

## Overview

The Templates with AI module is a comprehensive solution for creating, managing, and utilizing document templates with AI-powered generation, dynamic variable replacement, and PDF export capabilities.

## Architecture

The module follows a layered architecture:

```
┌─────────────────────────────────────────────┐
│         Frontend UI Layer                   │
│  (React Components + TipTap Editor)         │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│         API Layer (Next.js)                 │
│  - GET /api/templates                       │
│  - GET /api/templates/[id]                  │
│  - PUT /api/templates/[id]                  │
│  - DELETE /api/templates/[id]               │
│  - POST /api/ai/generate-template           │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│         Utility Layer (TypeScript)          │
│  - applyTemplate.ts                         │
│  - exportToPDF.ts                           │
│  - generateWithAI.ts                        │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│         Data Layer (Supabase)               │
│  - templates table with RLS policies        │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│         AI Layer (OpenAI GPT-4)             │
│  - Supabase Edge Functions                  │
└─────────────────────────────────────────────┘
```

## API Endpoints

### GET /api/templates

Lists all templates for the authenticated user.

**Request:**
```http
GET /api/templates
Authorization: Bearer <token>
```

**Response:**
```json
{
  "templates": [
    {
      "id": "uuid",
      "title": "Email Template",
      "content": "Hello {{name}}...",
      "created_by": "user_id",
      "created_at": "2025-10-19T10:00:00Z",
      "updated_at": "2025-10-19T10:00:00Z",
      "is_favorite": false,
      "is_private": false
    }
  ]
}
```

### GET /api/templates/[id]

Retrieves a specific template by ID.

**Request:**
```http
GET /api/templates/abc-123
Authorization: Bearer <token>
```

**Response:**
```json
{
  "data": {
    "id": "abc-123",
    "title": "Email Template",
    "content": "Hello {{name}}...",
    "created_by": "user_id",
    "created_at": "2025-10-19T10:00:00Z",
    "updated_at": "2025-10-19T10:00:00Z"
  }
}
```

### PUT /api/templates/[id]

Updates an existing template.

**Request:**
```http
PUT /api/templates/abc-123
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "content": "Updated content with {{variable}}"
}
```

**Response:**
```json
{
  "data": {
    "id": "abc-123",
    "title": "Updated Title",
    "content": "Updated content with {{variable}}",
    "updated_at": "2025-10-19T11:00:00Z"
  }
}
```

### DELETE /api/templates/[id]

Deletes a template.

**Request:**
```http
DELETE /api/templates/abc-123
Authorization: Bearer <token>
```

**Response:**
```http
HTTP/1.1 204 No Content
```

### POST /api/ai/generate-template

Generates template content using GPT-4.

**Request:**
```http
POST /api/ai/generate-template
Authorization: Bearer <token>
Content-Type: application/json

{
  "prompt": "Create a professional email template for customer support"
}
```

**Response:**
```json
{
  "output": "Dear {{customer_name}},\n\nThank you for contacting {{company_name}}..."
}
```

## Utility Functions

### Template Variables (applyTemplate.ts)

**extractTemplateVariables(content: string): string[]**

Extracts all variables from a template.

```typescript
import { extractTemplateVariables } from '@/utils/templates';

const vars = extractTemplateVariables("Hello {{name}}, welcome to {{company}}!");
// Returns: ['name', 'company']
```

**applyTemplate(content: string): string**

Interactive variable replacement with user prompts.

```typescript
import { applyTemplate } from '@/utils/templates';

const filled = applyTemplate("Hello {{name}}!");
// User will be prompted to fill in 'name'
```

**applyTemplateWithValues(content: string, values: Record<string, string>): string**

Programmatic variable replacement.

```typescript
import { applyTemplateWithValues } from '@/utils/templates';

const result = applyTemplateWithValues(
  "Hello {{name}}, your order {{order_id}} is ready!",
  { name: 'John', order_id: '#12345' }
);
// Returns: "Hello John, your order #12345 is ready!"
```

### PDF Export (exportToPDF.ts)

**exportToPDF(html: string, filename?: string): Promise<void>**

Simple PDF export.

```typescript
import { exportToPDF } from '@/utils/templates';

await exportToPDF('<h1>My Document</h1>', 'output.pdf');
```

**exportToPDFWithOptions(html: string, options: PDFExportOptions): Promise<void>**

Advanced PDF export with custom options.

```typescript
import { exportToPDFWithOptions } from '@/utils/templates';

await exportToPDFWithOptions(html, {
  filename: 'report.pdf',
  margin: 1,
  format: 'a4',
  orientation: 'landscape',
  scale: 2
});
```

**exportElementToPDF(element: HTMLElement, filename?: string): Promise<void>**

Export DOM elements directly.

```typescript
import { exportElementToPDF } from '@/utils/templates';

const element = document.getElementById('template');
await exportElementToPDF(element, 'doc.pdf');
```

### AI Generation (generateWithAI.ts)

**generateTemplateWithAI(type: TemplateType, context: string): Promise<string>**

Generate template by type and context.

```typescript
import { generateTemplateWithAI } from '@/utils/templates';

const content = await generateTemplateWithAI('certificate', 'STCW training completion');
```

**generateTemplateWithCustomPrompt(prompt: string): Promise<string>**

Generate with custom prompt.

```typescript
import { generateTemplateWithCustomPrompt } from '@/utils/templates';

const content = await generateTemplateWithCustomPrompt(
  'Create a professional email template for customer support'
);
```

**generateTemplateWithVariables(type: TemplateType, context: string, includeVariables: string[]): Promise<string>**

Generate with specific variables.

```typescript
import { generateTemplateWithVariables } from '@/utils/templates';

const content = await generateTemplateWithVariables(
  'email',
  'Welcome message',
  ['name', 'company', 'date']
);
```

## Use Cases

### 1. Email Automation

```typescript
import { applyTemplateWithValues } from '@/utils/templates';

const template = "Hello {{name}}, your order {{order_id}} has been shipped!";
const email = applyTemplateWithValues(template, {
  name: 'Maria',
  order_id: '#12345'
});
```

### 2. Certificate Generation

```typescript
import { generateTemplateWithAI, applyTemplateWithValues, exportToPDF } from '@/utils/templates';

// Generate template with AI
const content = await generateTemplateWithAI('certificate', 'Maritime training completion');

// Fill in variables
const cert = applyTemplateWithValues(content, {
  student: 'John Silva',
  course: 'STCW Basic',
  date: '2025-10-19'
});

// Export to PDF
await exportToPDF(cert, 'certificate.pdf');
```

### 3. Dynamic Reports

```typescript
import { generateTemplateWithAI, applyTemplateWithValues, exportToPDF } from '@/utils/templates';

// Generate report template
const report = await generateTemplateWithAI('report', 'Monthly sales report');

// Fill with data
const filled = applyTemplateWithValues(report, {
  month: 'October',
  revenue: 'R$ 50,000',
  growth: '+15%'
});

// Export to PDF
await exportToPDF(filled, 'sales-report.pdf');
```

## Variable System

Templates support dynamic variables using the `{{variable_name}}` syntax. The system automatically:

1. **Extracts** all variables from template content
2. **Prompts** users for values in interactive mode
3. **Replaces** variables with provided values in programmatic mode

### Variable Naming Rules

- Use alphanumeric characters and underscores
- No spaces inside `{{}}`
- Case-sensitive
- Examples: `{{name}}`, `{{order_id}}`, `{{customer_email}}`

## PDF Generation

Leverages html2pdf.js to convert HTML content to PDF directly in the browser with support for:

- **Custom page sizes**: A4, Letter, Legal, or custom dimensions
- **Orientation**: Portrait or Landscape
- **Margins**: Single value or array [top, right, bottom, left]
- **High-quality rendering**: 2x scale by default

## Security

### Authentication

All API endpoints require authentication via Supabase Auth. Unauthorized requests receive a 401 response.

### Authorization

- Templates can only be updated or deleted by their creator (RLS policies)
- The `created_by` field is automatically set to the authenticated user's ID

### Input Validation

- Template titles must be at least 3 characters
- Content is validated using Zod schemas
- Prompts for AI generation are sanitized

## Error Handling

All API endpoints return appropriate HTTP status codes:

- `200` - Success
- `201` - Created
- `204` - No Content (successful deletion)
- `400` - Bad Request (validation error)
- `401` - Unauthorized
- `404` - Not Found
- `405` - Method Not Allowed
- `500` - Internal Server Error

## Testing

The module includes comprehensive tests:

```bash
npm run test
```

Tests cover:
- API endpoint functionality
- Variable extraction and replacement
- PDF export functionality
- AI generation
- Error handling

## Future Enhancements

Potential improvements for future consideration:

1. **Template Versioning**: Track history of template changes
2. **Sharing and Collaboration**: Share templates between users
3. **Advanced Categorization**: Organize templates with tags and categories
4. **Template Marketplace**: Share and download community templates
5. **Usage Analytics**: Track template usage and performance
6. **Multi-language Support**: Internationalization for templates
7. **Advanced Formatting**: Rich text editing with TipTap integration
8. **Batch Operations**: Apply templates to multiple items at once

## Module Status

- ✅ **Production Ready**
- ✅ **Documentation Complete**
- ✅ **Tests Passing**
- ✅ **Build Success**

## Support

For issues or questions, please refer to:
- [TEMPLATES_QUICKREF.md](./TEMPLATES_QUICKREF.md) - Quick reference guide
- [TEMPLATES_VISUAL_SUMMARY.md](./TEMPLATES_VISUAL_SUMMARY.md) - Visual diagrams
- Project issue tracker on GitHub
