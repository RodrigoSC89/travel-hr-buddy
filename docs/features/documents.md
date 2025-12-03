# Sistema de Documentos

## Visão Geral

Gerenciamento completo de documentos com editor rico, templates, versionamento e exportação.

## Componentes

### Document Hub (`src/modules/document-hub/`)

- **Editor**: TipTap com formatação rica
- **Templates**: Biblioteca de modelos
- **Versões**: Histórico completo
- **Colaboração**: Edição em tempo real

### Templates (`src/modules/document-hub/templates/`)

Sistema de templates com placeholders:

```typescript
// Template com variáveis
const template = `
  {{company_name}}
  Data: {{date}}
  Responsável: {{responsible}}
`;

// Substituição
const rendered = renderTemplate(template, {
  company_name: "Empresa X",
  date: "2025-01-01",
  responsible: "João"
});
```

## Funcionalidades

### 1. Editor Rico

Baseado no TipTap com:
- Formatação (bold, italic, lists)
- Tabelas
- Imagens
- Links
- Código

### 2. Templates

Modelos pré-definidos:
- Relatórios de viagem
- Checklists de segurança
- Contratos de serviço
- Procedimentos operacionais

### 3. Versionamento

Histórico completo:
- Cada alteração cria versão
- Comparação lado a lado
- Restauração de versões
- Auditoria de mudanças

### 4. Exportação

Formatos suportados:
- **PDF**: jsPDF + html2canvas
- **Word**: docx library
- **Excel**: xlsx library

```typescript
import { exportToPDF } from "@/lib/pdf-export";

await exportToPDF(document, {
  orientation: "portrait",
  pageSize: "A4"
});
```

## Tabelas do Banco

```sql
-- Documentos
documents (
  id, title, content, template_id,
  status, created_by, organization_id
)

-- Versões
document_versions (
  id, document_id, version_number,
  content, created_at, created_by
)

-- Templates
document_templates (
  id, name, content, category,
  placeholders, is_public
)
```

## Fluxo de Criação

```
1. Selecionar Template (opcional)
2. Preencher Placeholders
3. Editar Conteúdo
4. Salvar (cria versão)
5. Revisar/Aprovar
6. Exportar/Compartilhar
```
