# Templates Module - Quick Reference

## 📋 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/templates` | List all templates |
| GET | `/api/templates/[id]` | Get single template |
| PUT | `/api/templates/[id]` | Update template |
| DELETE | `/api/templates/[id]` | Delete template |
| POST | `/api/ai/generate-template` | Generate with AI |

## 🛠️ Utility Functions

### Template Variables

```typescript
import { 
  extractTemplateVariables,
  applyTemplate,
  applyTemplateWithValues 
} from '@/utils/templates';

// Extract variables
const vars = extractTemplateVariables("Hello {{name}}!");
// Returns: ['name']

// Interactive replacement
const filled = applyTemplate(content);

// Programmatic replacement
const result = applyTemplateWithValues(content, { 
  name: 'John', 
  company: 'Acme' 
});
```

### PDF Export

```typescript
import { 
  exportToPDF,
  exportToPDFWithOptions,
  exportElementToPDF 
} from '@/utils/templates';

// Simple export
await exportToPDF('<h1>Document</h1>', 'output.pdf');

// Advanced export
await exportToPDFWithOptions(html, {
  filename: 'report.pdf',
  margin: 1,
  format: 'a4',
  orientation: 'landscape'
});

// Export DOM element
await exportElementToPDF(document.getElementById('template'), 'doc.pdf');
```

### AI Generation

```typescript
import { 
  generateTemplateWithAI,
  generateTemplateWithCustomPrompt,
  generateTemplateWithVariables 
} from '@/utils/templates';

// Generate by type
const content = await generateTemplateWithAI('certificate', 'STCW training');

// Custom prompt
const content = await generateTemplateWithCustomPrompt(
  'Create a professional email template'
);

// With variables
const content = await generateTemplateWithVariables(
  'email',
  'Welcome message',
  ['name', 'company', 'date']
);
```

## 🔄 Complete Workflow Examples

### Email Automation

```typescript
import { applyTemplateWithValues } from '@/utils/templates';

const template = "Hello {{name}}, order {{order_id}} shipped!";
const email = applyTemplateWithValues(template, {
  name: 'Maria',
  order_id: '#12345'
});
// Result: "Hello Maria, order #12345 shipped!"
```

### Certificate Generation

```typescript
import { 
  generateTemplateWithAI, 
  applyTemplateWithValues, 
  exportToPDF 
} from '@/utils/templates';

// 1. Generate with AI
const content = await generateTemplateWithAI(
  'certificate', 
  'Maritime training'
);

// 2. Fill variables
const cert = applyTemplateWithValues(content, {
  student: 'John Silva',
  course: 'STCW Basic',
  date: '2025-10-19'
});

// 3. Export to PDF
await exportToPDF(cert, 'certificate.pdf');
```

### Dynamic Reports

```typescript
import { 
  generateTemplateWithAI, 
  applyTemplateWithValues, 
  exportToPDF 
} from '@/utils/templates';

// Generate report template
const report = await generateTemplateWithAI('report', 'Monthly sales');

// Fill with data
const filled = applyTemplateWithValues(report, {
  month: 'October',
  revenue: 'R$ 50,000',
  growth: '+15%'
});

// Export to PDF
await exportToPDF(filled, 'sales-report.pdf');
```

## 📊 Variable Syntax

Use double curly braces for dynamic variables:

```
Hello {{name}},

Your order {{order_id}} has been shipped to {{address}}.

Thank you for choosing {{company_name}}!
```

### Naming Rules
- Alphanumeric and underscores only
- No spaces inside `{{}}`
- Case-sensitive
- Examples: `{{name}}`, `{{order_id}}`, `{{customer_email}}`

## 🔒 Authentication

All endpoints require authentication:

```typescript
// Authentication is handled automatically by Supabase
const { data: { user } } = await supabase.auth.getUser();
```

## ⚡ Quick Start

### 1. Install Dependencies

```bash
npm install html2pdf.js
```

### 2. Import Utilities

```typescript
import { 
  extractTemplateVariables,
  applyTemplateWithValues,
  exportToPDF,
  generateTemplateWithAI
} from '@/utils/templates';
```

### 3. Use in Your Code

```typescript
// Generate template
const template = await generateTemplateWithAI('email', 'Welcome message');

// Apply variables
const filled = applyTemplateWithValues(template, { name: 'John' });

// Export to PDF
await exportToPDF(filled, 'welcome.pdf');
```

## 🎯 Common Use Cases

| Use Case | Functions Used |
|----------|---------------|
| Email Automation | `applyTemplateWithValues` |
| Document Generation | `generateTemplateWithAI` + `exportToPDF` |
| Certificate Creation | `generateTemplateWithAI` + `applyTemplateWithValues` + `exportToPDF` |
| Report Generation | `generateTemplateWithAI` + `applyTemplateWithValues` + `exportToPDF` |
| Variable Extraction | `extractTemplateVariables` |

## 🐛 Troubleshooting

### PDF Export Not Working
```bash
npm install html2pdf.js
```

### AI Generation Failing
Check Supabase Edge Function is deployed:
```bash
supabase functions deploy generate-document
```

### Authentication Errors
Ensure user is logged in:
```typescript
const { data: { user } } = await supabase.auth.getUser();
if (!user) {
  // Redirect to login
}
```

## 📚 Additional Resources

- [TEMPLATES_MODULE_COMPLETE.md](./TEMPLATES_MODULE_COMPLETE.md) - Full documentation
- [TEMPLATES_VISUAL_SUMMARY.md](./TEMPLATES_VISUAL_SUMMARY.md) - Visual diagrams
- [Supabase Documentation](https://supabase.com/docs)
- [html2pdf.js Documentation](https://github.com/eKoopmans/html2pdf.js)

## ✅ Module Status

- ✅ Production Ready
- ✅ All Tests Passing
- ✅ Documentation Complete
- ✅ Build Successful
