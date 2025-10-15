# Workflow Suggestions PDF Export

Este módulo fornece funcionalidade para exportar sugestões de IA para workflows em formato PDF.

## 📦 Componentes

### `ExportSuggestionsPDF.tsx`

Módulo que contém a função principal para exportar sugestões de workflow para PDF.

#### Interface: `WorkflowSuggestion`

```typescript
interface WorkflowSuggestion {
  etapa: string;                    // Nome da etapa do workflow
  tipo_sugestao: string;            // Tipo de sugestão (ex: "Otimização", "Melhoria")
  conteudo: string;                 // Descrição detalhada da sugestão
  criticidade: string;              // Nível de criticidade (ex: "Baixa", "Média", "Alta", "Crítica")
  responsavel_sugerido: string;     // Nome do responsável sugerido
}
```

#### Função: `exportSuggestionsToPDF`

```typescript
function exportSuggestionsToPDF(suggestions: WorkflowSuggestion[]): void
```

**Parâmetros:**
- `suggestions`: Array de sugestões de workflow a serem exportadas

**Retorno:**
- `void` - A função baixa automaticamente o arquivo PDF para o dispositivo do usuário

**Exceções:**
- Lança erro se o array de sugestões estiver vazio ou nulo
- Lança erro em caso de falha na geração do PDF

## 🚀 Uso

### Importação

```typescript
import { exportSuggestionsToPDF, WorkflowSuggestion } from "@/components/workflows";
```

### Exemplo Básico

```typescript
import { exportSuggestionsToPDF } from "@/components/workflows";

const suggestions = [
  {
    etapa: "Aprovação de Despesas",
    tipo_sugestao: "Otimização de Processo",
    conteudo: "Implementar aprovação automática para despesas abaixo de R$ 500,00",
    criticidade: "Média",
    responsavel_sugerido: "Gerente Financeiro"
  },
  {
    etapa: "Onboarding de Tripulantes",
    tipo_sugestao: "Melhoria de Eficiência",
    conteudo: "Criar checklist digital interativo",
    criticidade: "Alta",
    responsavel_sugerido: "RH - Coordenador"
  }
];

// Exportar para PDF
exportSuggestionsToPDF(suggestions);
```

### Uso em Componente React

```typescript
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { exportSuggestionsToPDF, WorkflowSuggestion } from "@/components/workflows";
import { useToast } from "@/hooks/use-toast";

function WorkflowSuggestionsPanel({ suggestions }: { suggestions: WorkflowSuggestion[] }) {
  const { toast } = useToast();

  const handleExport = () => {
    try {
      exportSuggestionsToPDF(suggestions);
      toast({
        title: "PDF exportado com sucesso",
        description: "O plano de ações foi exportado como PDF.",
      });
    } catch (error) {
      toast({
        title: "Erro ao exportar PDF",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
    }
  };

  return (
    <Button onClick={handleExport}>
      <Download className="w-4 h-4 mr-2" />
      Exportar Sugestões PDF
    </Button>
  );
}
```

## 📄 Formato do PDF

O PDF gerado inclui:

- **Cabeçalho**: Título "📄 Plano de Ações IA - Workflow" e data atual
- **Para cada sugestão**:
  - 🧩 Etapa
  - 📌 Tipo de Sugestão
  - 💬 Conteúdo
  - 🔥 Criticidade
  - 👤 Responsável Sugerido
- **Separadores**: Linhas horizontais entre sugestões
- **Paginação**: Quebras de página automáticas quando necessário

**Nome do arquivo**: `Plano-Acoes-Workflow-YYYY-MM-DD.pdf`

## 🛠️ Tecnologias

- **jsPDF**: Biblioteca para geração de PDFs
- **date-fns**: Formatação de datas
- **TypeScript**: Tipagem forte

## ✅ Testes

O módulo inclui testes abrangentes que cobrem:

- Validação de entrada (array vazio ou nulo)
- Geração correta do PDF
- Formatação de título e data
- Processamento de todas as sugestões
- Nomenclatura correta do arquivo
- Tratamento de erros
- Inclusão de todos os campos obrigatórios
- Adição de separadores entre sugestões

Para executar os testes:

```bash
npm test src/components/workflows/ExportSuggestionsPDF.test.tsx
```

## 📝 Notas de Implementação

### Diferenças com o Código Original

O código original mencionava o uso de `html2pdf.js`, mas esta implementação utiliza `jsPDF` diretamente, seguindo o padrão estabelecido no projeto (ver `PR211_REFACTOR_COMPLETE.md`).

**Vantagens desta abordagem:**

- ✅ Melhor qualidade de texto no PDF
- ✅ Menor tamanho de arquivo
- ✅ Mais rápido (não requer conversão HTML → Canvas → PDF)
- ✅ Sem problemas de firewall
- ✅ Consistente com outras exportações PDF no projeto

### Integração com Banco de Dados

Para uso em produção, você precisará:

1. Criar a tabela `workflow_ai_suggestions` no banco de dados
2. Implementar API para buscar sugestões: `/api/workflows/copilot/suggest`
3. Substituir dados de exemplo por dados reais

Exemplo de estrutura da tabela:

```sql
CREATE TABLE workflow_ai_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES smart_workflows(id),
  etapa TEXT NOT NULL,
  tipo_sugestao TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  criticidade TEXT NOT NULL,
  responsavel_sugerido TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_applied BOOLEAN DEFAULT false
);
```

## 🔗 Arquivos Relacionados

- `/src/components/workflows/ExportSuggestionsPDF.tsx` - Implementação principal
- `/src/components/workflows/ExportSuggestionsPDF.test.tsx` - Testes
- `/src/components/workflows/index.ts` - Exports públicos
- `/src/pages/admin/workflows/detail.tsx` - Exemplo de uso

## 📚 Documentação Adicional

Para mais informações sobre exportação de PDFs no projeto, consulte:

- `PR211_REFACTOR_COMPLETE.md`
- `PR211_VS_CURRENT_COMPARISON.md`
- `src/pages/admin/documents/ai-editor.tsx` (exemplo de exportação PDF)
