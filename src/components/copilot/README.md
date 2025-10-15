# Copilot Job Form With Examples

## 📋 Visão Geral

O módulo **Copilot Job Form With Examples** fornece uma interface inteligente para criação de jobs de manutenção com sugestões baseadas em IA e casos históricos similares.

## 🎯 Componentes

### JobFormWithExamples

Formulário principal para criação de jobs com integração de IA.

**Funcionalidades:**
- 🧾 Formulário para criação de Job com IA
- 📝 Campo para componente (ex: 603.0004.02)
- 📄 Área de texto para descrição do problema
- ✅ Botão de criação de job
- 🔍 Integração com exemplos similares em tempo real

**Uso:**
```tsx
import { JobFormWithExamples } from '@/components/copilot';

function MyPage() {
  return <JobFormWithExamples />;
}
```

### SimilarExamples

Componente que busca e exibe exemplos similares baseados na descrição do job.

**Funcionalidades:**
- 🔍 Busca automática de casos similares
- 📊 Exibição de score de similaridade
- 📋 Preenchimento automático com base em histórico
- ⏱️ Debounce automático (500ms)
- 🔄 Loading state durante a busca

**Props:**
```typescript
interface SimilarExamplesProps {
  input: string;           // Texto de entrada para busca
  onSelect: (text: string) => void;  // Callback quando um exemplo é selecionado
}
```

**Uso:**
```tsx
import { SimilarExamples } from '@/components/copilot';

function MyComponent() {
  const [description, setDescription] = useState('');

  return (
    <SimilarExamples 
      input={description} 
      onSelect={(text) => setDescription(text)} 
    />
  );
}
```

## 🛠️ Tecnologias Utilizadas

- **React** - Framework UI
- **TypeScript** - Type safety
- **Shadcn/ui** - Componentes UI
- **Lucide React** - Ícones

## 🔄 Fluxo de Funcionamento

1. Usuário digita a descrição do problema
2. Após 500ms sem digitação, o componente busca exemplos similares
3. Exemplos são exibidos com score de similaridade
4. Usuário pode clicar para copiar um exemplo
5. O texto é automaticamente preenchido no formulário
6. Usuário revisa e submete o job

## 📦 Estrutura de Arquivos

```
src/components/copilot/
├── JobFormWithExamples.tsx    # Componente principal do formulário
├── SimilarExamples.tsx        # Componente de busca de exemplos
└── index.ts                   # Exports dos componentes
```

## 🧪 Testes

Testes unitários estão disponíveis em:
```
src/tests/copilot/JobFormWithExamples.test.tsx
```

Para executar os testes:
```bash
npm test -- src/tests/copilot/JobFormWithExamples.test.tsx
```

## 🚀 Próximos Passos

1. **Integração com API Real**: Conectar com serviço de embeddings e busca vetorial
2. **Filtros Avançados**: Adicionar filtros por componente, data, criticidade
3. **Machine Learning**: Melhorar algoritmo de similaridade
4. **Histórico**: Salvar histórico de jobs criados
5. **Analytics**: Rastrear taxa de uso de sugestões da IA

## 📝 Notas de Implementação

- O componente usa **mock data** atualmente para demonstração
- A busca de similaridade pode ser integrada com OpenAI embeddings
- O debounce de 500ms otimiza chamadas à API
- Requer mínimo de 10 caracteres para iniciar a busca

## 🎨 UI/UX

- Design responsivo
- Loading states claros
- Feedback visual ao copiar exemplos
- Scores de similaridade em percentual
- Interface intuitiva e limpa

## 📚 Referências

- Baseado no padrão MMI Copilot existente
- Integra com o sistema de jobs da aplicação
- Segue design system Shadcn/ui
