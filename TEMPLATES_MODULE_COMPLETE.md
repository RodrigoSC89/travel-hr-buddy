# 📦 Templates com IA - Módulo Completo

## Visão Geral

O módulo de Templates com IA permite criar, editar, gerenciar e aplicar templates de documentos com inteligência artificial integrada. Este módulo oferece funcionalidades completas de CRUD, geração com GPT-4, exportação para PDF e substituição de variáveis.

## ✅ Funcionalidades Implementadas

### 1. **CRUD Completo**
- ✅ Criar templates
- ✅ Editar templates existentes
- ✅ Listar todos os templates
- ✅ Excluir templates
- ✅ Duplicar templates
- ✅ Favoritar templates
- ✅ Tornar templates privados/públicos

### 2. **Geração com IA**
- ✅ Gerar conteúdo com GPT-4
- ✅ Reformular conteúdo existente
- ✅ Sugerir títulos automaticamente
- ✅ Geração baseada em tipo e contexto

### 3. **Variáveis Dinâmicas**
- ✅ Aplicar variáveis {{nome}} no template
- ✅ Extrair variáveis do conteúdo
- ✅ Substituir com valores fornecidos

### 4. **Exportação**
- ✅ Exportar para PDF com html2pdf.js
- ✅ Opções customizáveis de PDF
- ✅ Download direto do navegador

## 🚀 Estrutura de Arquivos

```
📁 pages/api/
├── 📁 templates/
│   ├── index.ts          # GET: Lista templates
│   └── [id].ts          # GET/PUT/DELETE: Gerencia template específico
└── 📁 ai/
    └── generate-template.ts  # POST: Gera template com IA

📁 src/
├── 📁 pages/admin/
│   └── templates.tsx    # Interface principal de gerenciamento
├── 📁 components/templates/
│   ├── TemplateEditor.tsx          # Editor com TipTap
│   ├── template-manager.tsx        # Gerenciador visual
│   └── ApplyTemplateModal.tsx      # Modal de aplicação
└── 📁 utils/templates/
    ├── applyTemplate.ts      # Funções de variáveis
    ├── exportToPDF.ts        # Funções de exportação
    ├── generateWithAI.ts     # Funções de geração IA
    └── index.ts              # Exportações centralizadas
```

## 📡 Endpoints da API

### 1. Listar Templates
```typescript
GET /api/templates
Response: {
  success: true,
  templates: Template[]
}
```

### 2. Obter Template Específico
```typescript
GET /api/templates/[id]
Response: {
  success: true,
  data: Template
}
```

### 3. Atualizar Template
```typescript
PUT /api/templates/[id]
Body: {
  title: string,
  content: string
}
Response: {
  success: true,
  data: Template
}
```

### 4. Excluir Template
```typescript
DELETE /api/templates/[id]
Response: {
  success: true
}
```

### 5. Gerar Template com IA
```typescript
POST /api/ai/generate-template
Body: {
  prompt?: string,
  type?: string,
  context?: string
}
Response: {
  success: true,
  output: string,
  prompt: string
}
```

## 🛠️ Funções Utilitárias

### Aplicar Variáveis

```typescript
import { applyTemplate, applyTemplateWithValues, extractTemplateVariables } from '@/utils/templates';

// Aplicar com prompts interativos
const content = "Olá {{nome}}, bem-vindo à {{empresa}}!";
const filled = applyTemplate(content);

// Extrair variáveis
const variables = extractTemplateVariables(content);
// Retorna: ['nome', 'empresa']

// Aplicar com valores fornecidos
const result = applyTemplateWithValues(content, {
  nome: 'João',
  empresa: 'TechCorp'
});
// Retorna: "Olá João, bem-vindo à TechCorp!"
```

### Exportar para PDF

```typescript
import { exportToPDF, exportToPDFWithOptions, exportElementToPDF } from '@/utils/templates';

// Exportação simples
exportToPDF('<h1>Meu Template</h1>', 'template.pdf');

// Exportação com opções
exportToPDFWithOptions('<h1>Template</h1>', {
  filename: 'relatorio.pdf',
  margin: 1,
  format: 'a4',
  orientation: 'portrait'
});

// Exportar elemento DOM
const element = document.getElementById('template');
exportElementToPDF(element, 'documento.pdf');
```

### Gerar com IA

```typescript
import { generateTemplateWithAI, generateTemplateWithCustomPrompt } from '@/utils/templates';

// Gerar por tipo e contexto
const content = await generateTemplateWithAI(
  'report',
  'Relatório mensal de vendas'
);

// Gerar com prompt customizado
const content2 = await generateTemplateWithCustomPrompt(
  'Crie um template de email de boas-vindas profissional'
);
```

## 💡 Exemplos de Uso

### Exemplo 1: Criar e Aplicar Template

```typescript
// 1. Criar template via API
const response = await fetch('/api/templates', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Email de Boas-vindas',
    content: 'Olá {{nome}}, bem-vindo à {{empresa}}!'
  })
});

// 2. Aplicar template
const template = await response.json();
const filled = applyTemplateWithValues(template.content, {
  nome: 'Maria',
  empresa: 'ABC Corp'
});

// 3. Exportar para PDF
exportToPDF(filled, 'boas-vindas.pdf');
```

### Exemplo 2: Gerar Template com IA

```typescript
// 1. Gerar conteúdo
const content = await generateTemplateWithAI(
  'certificate',
  'Certificado de conclusão de treinamento STCW'
);

// 2. Salvar template
await supabase.from('templates').insert({
  title: 'Certificado STCW',
  content: content,
  created_by: user.id
});

// 3. Aplicar variáveis
const certificate = applyTemplateWithValues(content, {
  aluno: 'João Silva',
  curso: 'STCW Básico',
  data: '2025-10-19'
});

// 4. Exportar
exportToPDF(certificate, 'certificado.pdf');
```

## 🎨 Interface do Usuário

### Página Principal: `/admin/templates`

A página de templates oferece:

1. **Aba de Criação**
   - Campo de título com sugestão automática por IA
   - Editor de conteúdo com formatação
   - Botão "Gerar com IA" para geração automática
   - Botão "Reformular" para melhorar conteúdo existente
   - Botão "Salvar Template"

2. **Aba de Listagem**
   - Busca por título ou conteúdo
   - Filtros (Favoritos, Privados)
   - Cards com informações do template
   - Ações: Editar, Duplicar, Aplicar, PDF, Excluir
   - Toggle de favorito e privacidade

3. **Funcionalidades**
   - Edição inline
   - Duplicação rápida
   - Aplicação direta em documentos
   - Exportação para PDF
   - Exclusão com confirmação

## 📊 Estrutura do Banco de Dados

```sql
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  is_favorite BOOLEAN DEFAULT false,
  is_private BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

## 🧪 Testes

```bash
# Rodar testes do módulo
npm test -- tests/templates.test.tsx

# Rodar todos os testes
npm test
```

**Status dos Testes:**
- ✅ 4/4 testes de templates passando
- ✅ 1843/1843 testes gerais passando

## 🔧 Dependências

- `@tiptap/react` - Editor de texto rico
- `@tiptap/starter-kit` - Extensões básicas do TipTap
- `html2pdf.js` - Geração de PDF
- `jspdf` - Alternativa para PDF
- `@supabase/supabase-js` - Cliente Supabase

## 📝 Notas Importantes

1. **Autenticação**: Todos os endpoints requerem autenticação via Supabase
2. **Edge Functions**: A geração com IA usa Supabase Edge Functions com OpenAI
3. **RLS**: Row Level Security está habilitado na tabela templates
4. **Variáveis**: Use formato `{{variavel}}` para campos dinâmicos
5. **PDF**: A biblioteca html2pdf.js converte HTML para PDF no navegador

## 🚀 Próximos Passos Sugeridos

1. **Versioning**: Adicionar versionamento de templates
2. **Compartilhamento**: Sistema de compartilhamento entre usuários
3. **Categorias**: Organização por categorias e tags
4. **Pré-visualização**: Preview antes de aplicar template
5. **Histórico**: Rastrear uso e aplicações do template

## 📞 Suporte

Para questões ou suporte, consulte:
- Documentação completa no repositório
- Issues no GitHub
- Equipe de desenvolvimento

---

**Módulo Templates com IA** - Versão 1.0.0
Desenvolvido com ❤️ pela equipe Travel HR Buddy
