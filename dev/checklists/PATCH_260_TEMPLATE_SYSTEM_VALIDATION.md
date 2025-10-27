# 🧪 PATCH 260 – Template System Dynamic Generation Validation

## 📋 Objective
Validar criação e exportação de templates dinâmicos com placeholders e substituição de variáveis.

---

## ✅ Validation Checklist

### 1️⃣ Template Creation & Editing
- [ ] É possível criar templates com variáveis ({{nome}}, {{data}}, etc.)?
- [ ] O editor suporta formatação rica (bold, italic, lists)?
- [ ] Templates podem ser salvos e editados posteriormente?
- [ ] É possível duplicar templates existentes?

### 2️⃣ Variable Substitution
- [ ] A renderização substitui variáveis corretamente com dados reais?
- [ ] Variáveis não encontradas são tratadas adequadamente?
- [ ] Suporta variáveis aninhadas ({{user.name}}, {{vessel.details.class}})?
- [ ] Funções de formatação funcionam ({{data|format:DD/MM/YYYY}})?

### 3️⃣ PDF Export
- [ ] É possível exportar templates como PDF?
- [ ] O layout é preservado no PDF?
- [ ] Imagens são incluídas corretamente?
- [ ] Tabelas e listas mantêm formatação?

### 4️⃣ Security
- [ ] A segurança dos dados nos templates é garantida?
- [ ] Não há vulnerabilidade XSS ao renderizar variáveis?
- [ ] Usuários só veem templates permitidos (RLS)?
- [ ] Injeção de código é prevenida?

### 5️⃣ Mobile Compatibility
- [ ] O editor é compatível com dispositivos móveis?
- [ ] Touch gestures funcionam no editor?
- [ ] O layout se adapta a telas pequenas?
- [ ] A visualização é responsiva?

---

## 🗄️ Required Database Schema

### Table: `templates`
```sql
CREATE TABLE IF NOT EXISTS public.templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  content JSONB NOT NULL,
  category TEXT,
  variables JSONB DEFAULT '[]'::jsonb,
  is_favorite BOOLEAN DEFAULT false,
  is_private BOOLEAN DEFAULT true,
  is_system BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_templates_created_by ON public.templates(created_by);
CREATE INDEX idx_templates_category ON public.templates(category);

ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view public templates"
  ON public.templates FOR SELECT
  USING (is_private = false OR auth.uid() = created_by);

CREATE POLICY "Users can view system templates"
  ON public.templates FOR SELECT
  USING (is_system = true);

CREATE POLICY "Users can create templates"
  ON public.templates FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their templates"
  ON public.templates FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their templates"
  ON public.templates FOR DELETE
  USING (auth.uid() = created_by);
```

### Table: `template_renders`
```sql
CREATE TABLE IF NOT EXISTS public.template_renders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES public.templates(id) ON DELETE CASCADE,
  rendered_by UUID REFERENCES auth.users(id),
  variables_used JSONB NOT NULL,
  output_format TEXT CHECK (output_format IN ('html', 'pdf', 'docx', 'json')),
  file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_template_renders_template ON public.template_renders(template_id);
CREATE INDEX idx_template_renders_user ON public.template_renders(rendered_by);

ALTER TABLE public.template_renders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their renders"
  ON public.template_renders FOR SELECT
  USING (auth.uid() = rendered_by);

CREATE POLICY "Users can create renders"
  ON public.template_renders FOR INSERT
  WITH CHECK (auth.uid() = rendered_by);
```

### Table: `template_categories`
```sql
CREATE TABLE IF NOT EXISTS public.template_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.template_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All users can view categories"
  ON public.template_categories FOR SELECT
  USING (is_active = true);
```

---

## 🔧 Implementation Status

### ✅ Implemented
- Template API exists at `src/lib/templates/api.ts`
- Basic CRUD operations for templates
- Template editor component exists
- API routes for template management

### ⚠️ Partial
- Variable substitution may not be complete
- PDF export may not be implemented
- XSS protection needs validation

### ❌ Missing
- Advanced variable substitution (nested, filters)
- PDF generation with proper styling
- Template preview before render
- Template versioning

---

## 🧪 Test Scenarios

### Scenario 1: Create Template with Variables
1. Navigate to template editor
2. Create new template with title "Relatório de Viagem"
3. Add content:
   ```
   Navio: {{vessel.name}}
   Data: {{date|format:DD/MM/YYYY}}
   Capitão: {{captain.name}}
   
   Consumo de combustível: {{fuel.consumption}} litros
   ```
4. Save template
5. **Expected**: Template saved with variables list extracted

### Scenario 2: Render Template with Data
1. Open saved template
2. Click "Render"
3. Provide data:
   ```json
   {
     "vessel": { "name": "MV Atlantic" },
     "date": "2025-10-27",
     "captain": { "name": "João Silva" },
     "fuel": { "consumption": 1500 }
   }
   ```
4. **Expected**: 
   ```
   Navio: MV Atlantic
   Data: 27/10/2025
   Capitão: João Silva
   
   Consumo de combustível: 1500 litros
   ```

### Scenario 3: Export to PDF
1. Render template
2. Click "Export to PDF"
3. **Expected**: 
   - PDF downloads
   - Layout matches preview
   - All variables substituted

### Scenario 4: XSS Prevention
1. Create template with: `{{user_input}}`
2. Render with data: `{ "user_input": "<script>alert('xss')</script>" }`
3. **Expected**: Script is escaped, not executed

### Scenario 5: Mobile Editing
1. Open editor on mobile device
2. Create template
3. Add formatting (bold, lists)
4. Save
5. **Expected**: All features work on mobile

---

## 📄 Template Variable Syntax

### Basic Variables
```
{{variable_name}}
```

### Nested Variables
```
{{object.property}}
{{user.profile.name}}
```

### Filters
```
{{date|format:DD/MM/YYYY}}
{{number|currency:BRL}}
{{text|uppercase}}
{{list|join:", "}}
```

### Conditionals
```
{{#if condition}}
  Content if true
{{else}}
  Content if false
{{/if}}
```

### Loops
```
{{#each items}}
  Item: {{this.name}}
{{/each}}
```

---

## 🛡️ Security Measures

| Threat | Mitigation | Status |
|--------|------------|--------|
| XSS | HTML escaping for all variables | ⚠️ |
| Code Injection | No eval() or Function() | ⚠️ |
| Unauthorized Access | RLS policies enforced | ✅ |
| Data Leaks | Sanitize variables before render | ⚠️ |

---

## 🚀 Next Steps

1. **Variable Engine**
   - Implement variable parser
   - Add filter functions (format, currency, etc.)
   - Support conditionals and loops

2. **PDF Export**
   - Integrate PDF library (jsPDF or Puppeteer)
   - Preserve styling and layout
   - Support images and tables

3. **Security Hardening**
   - Add XSS protection layer
   - Sanitize all user inputs
   - Audit variable rendering

4. **Testing**
   - Test all variable types
   - Validate PDF export quality
   - Security penetration testing
   - Mobile usability testing

5. **Documentation**
   - Create template syntax guide
   - Document available filters
   - Add example templates

---

**Status**: 🟡 Partial Implementation  
**Priority**: 🟠 Medium-High  
**Estimated Completion**: 6-8 hours
