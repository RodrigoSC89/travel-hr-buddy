# 📚 Nautilus Vault Técnico IA

> O repositório inteligente do sistema — documentos, manuais, relatórios e pareceres técnicos com leitura semântica, busca contextual e resposta via LLM embarcada.

## 🎯 Visão Geral

O Vault Técnico IA é um módulo especializado para gerenciamento e interpretação inteligente de documentos técnicos. Ele oferece:

- **Indexação de Documentos**: Catalogação organizada de manuais, relatórios e pareceres técnicos
- **Busca Semântica**: Pesquisa contextual com correspondência fuzzy e scoring de relevância
- **Assistente IA**: Interpretação inteligente de conteúdo técnico com contextos especializados

## 🧩 Estrutura de Arquivos

```
src/modules/vault_ai/
├── components/
│   ├── VaultCore.tsx          # Dashboard principal com menu
│   ├── FileIndexer.tsx        # Interface de indexação de documentos
│   ├── SemanticSearch.tsx     # Componente de busca semântica
│   └── LLMInterface.tsx       # Chat IA para interpretação
├── services/
│   └── vaultStorage.ts        # Serviço de armazenamento LocalStorage
├── types/
│   └── index.ts               # Definições TypeScript
├── index.ts                   # Exports do módulo
└── README.md                  # Esta documentação
```

## 🔧 Componentes Principais

### VaultCore.tsx
Painel principal do Vault - integração dos módulos e interface de controle.

**Funcionalidades:**
- Menu principal com três opções principais
- Estatísticas do vault (total de documentos, última atualização)
- Navegação entre funcionalidades
- Exibição de contextos técnicos suportados

### FileIndexer.tsx
Responsável por catalogar e registrar documentos (PDF, DOCX, TXT).

**Funcionalidades:**
- Adicionar novos documentos com nome e caminho
- Listar todos os documentos indexados
- Remover documentos do vault
- Detecção automática de tipo de arquivo
- Validação de duplicatas

### SemanticSearch.tsx
Busca contextual com correspondência semântica.

**Funcionalidades:**
- Pesquisa fuzzy em nome, caminho e tags
- Cálculo de relevância com scoring
- Ordenação por relevância
- Exibição de resultados com metadados
- Suporte a múltiplos critérios de busca

### LLMInterface.tsx
Interface de IA embarcada - interpreta e responde sobre conteúdo técnico.

**Funcionalidades:**
- Chat interativo com assistente IA
- Detecção automática de contexto técnico
- Suporte a 6 contextos técnicos especializados
- Histórico de conversação
- Respostas contextualizadas

## 📋 Contextos Técnicos Suportados

1. **ASOG** - Aircraft Servicing and Operating Guidelines
   - Diretrizes de operação e serviço de aeronaves

2. **FMEA** - Failure Mode and Effects Analysis
   - Análise de modos de falha e efeitos
   - Identificação de falhas potenciais e mitigação

3. **IMCA** - International Marine Contractors Association
   - Padrões e boas práticas marítimas
   - Operações offshore

4. **SGSO** - Sistema de Gestão de Segurança Operacional
   - Políticas e procedimentos de segurança
   - Gestão operacional

5. **MTS** - Manuais Técnicos de Sistema
   - Componentes e manutenção
   - Limites operacionais

6. **Manuais Técnicos Gerais**
   - Procedimentos de manutenção
   - Documentação operacional

## 💾 Armazenamento

O módulo utiliza **LocalStorage** para persistência de dados:

- **Chave**: `nautilus_vault_index`
- **Estrutura**: JSON versionado
- **Versão**: 1.0.0

### Estrutura de Dados

```typescript
interface VaultIndex {
  version: string;
  documents: VaultDocument[];
  lastUpdated: string;
}

interface VaultDocument {
  id: string;
  nome: string;
  caminho: string;
  tipo?: string;
  tamanho?: number;
  dataIndexacao: string;
  tags?: string[];
}
```

## 🔍 API de Serviços

### vaultStorage.ts

```typescript
// Obter índice completo
getVaultIndex(): VaultIndex

// Adicionar documento
addDocument(document: Omit<VaultDocument, "id" | "dataIndexacao">): VaultDocument | null

// Obter todos os documentos
getAllDocuments(): VaultDocument[]

// Obter documento por ID
getDocumentById(id: string): VaultDocument | null

// Remover documento
removeDocument(id: string): boolean

// Buscar documentos
searchDocuments(termo: string): VaultDocument[]

// Limpar vault
clearVault(): boolean

// Estatísticas
getVaultStats(): { totalDocuments: number; lastUpdated: string; version: string; }
```

## 🎨 UI/UX

- **Design**: Radix UI components com Tailwind CSS
- **Responsivo**: Layout adaptável para mobile e desktop
- **Acessibilidade**: Suporte a leitores de tela e navegação por teclado
- **Feedback**: Toasts para ações do usuário (sonner)
- **Navegação**: Breadcrumb com botão "Voltar ao Menu"

## 🧪 Testes

Testes unitários disponíveis em `src/tests/modules/vault_ai/vaultStorage.test.ts`

**Cobertura:**
- ✅ Inicialização do índice
- ✅ Adição de documentos
- ✅ Validação de duplicatas
- ✅ Remoção de documentos
- ✅ Busca semântica
- ✅ Estatísticas do vault
- ✅ Limpeza de dados

## 🚀 Uso

### Importar o módulo
```typescript
import { VaultCore } from "@/modules/vault_ai";
```

### Usar no componente
```tsx
<VaultCore />
```

### Usar serviços diretamente
```typescript
import { addDocument, searchDocuments } from "@/modules/vault_ai";

// Adicionar documento
const doc = addDocument({
  nome: "Manual FMEA Rev 3.2",
  caminho: "/docs/fmea-v3.2.pdf",
  tags: ["fmea", "análise", "falhas"]
});

// Buscar documentos
const results = searchDocuments("fmea");
```

## 🔗 Integração

O módulo está integrado ao Nautilus One através de:

1. **Rota**: `/vault-ai` em `App.tsx`
2. **Menu**: Card no `ModulesGrid.tsx`
3. **Logger**: Integração com `@/lib/logger`
4. **Tema**: Compatível com sistema de temas (dark/light)

## 📊 Métricas

O Vault AI registra as seguintes métricas:

- Total de documentos indexados
- Data da última atualização
- Versão do índice
- Logs de operações (via logger)

## 🛠️ Desenvolvimento

### Adicionar novo contexto técnico

Edite `LLMInterface.tsx`:

```typescript
const TECHNICAL_CONTEXTS = {
  // ... contextos existentes
  novo_contexto: {
    descricao: "Descrição do contexto",
    keywords: ["palavra1", "palavra2"]
  }
};
```

### Customizar armazenamento

O serviço `vaultStorage.ts` pode ser adaptado para usar:
- Backend API (substituir LocalStorage)
- IndexedDB (para grandes volumes)
- Supabase Storage (para sincronização)

## 📝 Notas Técnicas

- **Performance**: Otimizado para até 1000 documentos no LocalStorage
- **Limite**: ~5MB de dados no LocalStorage (limite do navegador)
- **Sincronização**: Não há sync entre dispositivos (apenas local)
- **Backup**: Dados podem ser exportados via `getVaultIndex()`

## 🔐 Segurança

- Dados armazenados localmente no navegador
- Sem envio de dados sensíveis para APIs externas
- LLM é baseado em regras (não envia dados para OpenAI)
- Logs de operações via logger centralizado

## 📚 Referências

- [Radix UI](https://www.radix-ui.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [LocalStorage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)

## 🤝 Contribuindo

Para adicionar funcionalidades:

1. Adicione componentes em `components/`
2. Adicione serviços em `services/`
3. Atualize tipos em `types/`
4. Adicione testes em `tests/`
5. Atualize este README

---

**Versão:** 1.0.0  
**Última atualização:** 2025-10-20  
**Mantido por:** Nautilus One Team
