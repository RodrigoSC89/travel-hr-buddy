# 🚀 Templates com IA - Guia Rápido

## Início Rápido

### 1. Criar Template
```typescript
// Via UI: /admin/templates
// Via API:
const response = await fetch('/api/templates', {
  method: 'POST',
  body: JSON.stringify({
    title: 'Meu Template',
    content: 'Conteúdo com {{variavel}}'
  })
});
```

### 2. Gerar com IA
```typescript
import { generateTemplateWithAI } from '@/utils/templates';

const content = await generateTemplateWithAI('report', 'Relatório de vendas');
```

### 3. Aplicar Variáveis
```typescript
import { applyTemplateWithValues } from '@/utils/templates';

const result = applyTemplateWithValues(template.content, {
  variavel: 'valor'
});
```

### 4. Exportar PDF
```typescript
import { exportToPDF } from '@/utils/templates';

exportToPDF(content, 'documento.pdf');
```

## 📡 API Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/templates` | Lista todos os templates |
| GET | `/api/templates/[id]` | Obtém template específico |
| PUT | `/api/templates/[id]` | Atualiza template |
| DELETE | `/api/templates/[id]` | Exclui template |
| POST | `/api/ai/generate-template` | Gera com IA |

## 🛠️ Funções Principais

### applyTemplate.ts
```typescript
applyTemplate(content: string): string
extractTemplateVariables(content: string): string[]
applyTemplateWithValues(content: string, vars: Record<string, string>): string
```

### exportToPDF.ts
```typescript
exportToPDF(html: string, filename?: string): void
exportToPDFWithOptions(html: string, options): void
exportElementToPDF(element: HTMLElement, filename?: string): void
```

### generateWithAI.ts
```typescript
generateTemplateWithAI(type: string, context: string): Promise<string>
generateTemplateWithCustomPrompt(prompt: string): Promise<string>
```

## 💡 Casos de Uso

### Email Automático
```typescript
const template = "Olá {{nome}}, seu pedido {{numero}} foi enviado!";
const email = applyTemplateWithValues(template, {
  nome: 'João',
  numero: '#12345'
});
```

### Certificado
```typescript
const content = await generateTemplateWithAI('certificate', 'STCW Básico');
const cert = applyTemplateWithValues(content, {
  aluno: 'Maria Silva',
  data: '2025-10-19'
});
exportToPDF(cert, 'certificado.pdf');
```

### Relatório
```typescript
const content = await generateTemplateWithAI('report', 'Vendas mensais');
const report = applyTemplateWithValues(content, {
  mes: 'Outubro',
  total: 'R$ 50.000'
});
exportToPDF(report, 'relatorio-vendas.pdf');
```

## 🎯 Estrutura de Template

Use variáveis no formato `{{nome_variavel}}`:

```text
# Certificado de Conclusão

Este certificado é concedido a {{aluno_nome}}
por completar o curso de {{curso_nome}}
em {{data_conclusao}}.

Instrutor: {{instrutor}}
```

## ✅ Checklist de Funcionalidades

- [x] ✅ Criar templates
- [x] ✅ Editar templates
- [x] ✅ Excluir templates
- [x] ✅ Listar templates
- [x] ✅ Gerar com IA (GPT-4)
- [x] ✅ Reformular conteúdo
- [x] ✅ Aplicar variáveis {{}}
- [x] ✅ Exportar para PDF
- [x] ✅ Favoritar templates
- [x] ✅ Templates privados/públicos
- [x] ✅ Busca e filtros
- [x] ✅ Duplicar templates

## 📊 Status

- **API**: ✅ Completa
- **Frontend**: ✅ Completo
- **Testes**: ✅ 4/4 passando
- **Build**: ✅ Sucesso
- **Documentação**: ✅ Completa

## 🔗 Links Úteis

- Interface: `/admin/templates`
- Documentação completa: `TEMPLATES_MODULE_COMPLETE.md`
- Testes: `tests/templates.test.tsx`

---

**Módulo 100% Funcional** ✅
