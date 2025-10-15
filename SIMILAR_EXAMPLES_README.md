# SimilarExamples Component - Copilot UI

## 📋 Visão Geral

O componente `SimilarExamples` é uma interface de usuário para buscar e exibir jobs históricos semelhantes usando RAG (Retrieval-Augmented Generation) com embeddings vetoriais. Este componente permite que os usuários encontrem exemplos de problemas similares já resolvidos e suas respectivas sugestões de IA.

## 🚀 Funcionalidades

- ✅ **Busca por Similaridade**: Utiliza embeddings vetoriais para encontrar jobs semelhantes
- ✅ **Integração com OpenAI**: Geração de embeddings usando `text-embedding-3-small`
- ✅ **Fallback Inteligente**: Dados mock quando API não está disponível
- ✅ **Interface Responsiva**: Cards com informações detalhadas dos jobs
- ✅ **Estado de Loading**: Indicadores visuais durante a busca
- ✅ **Score de Similaridade**: Exibe percentual de similaridade entre jobs

## 📦 Instalação

Os componentes já estão criados nos seguintes diretórios:

```
/components/copilot/SimilarExamples.tsx
/lib/ai/copilot/querySimilarJobs.ts
```

## 🔧 Como Usar

### Uso Básico

```tsx
import SimilarExamples from '@/components/copilot/SimilarExamples';

function MyComponent() {
  const jobDescription = "Manutenção do gerador STBD com ruído excessivo";
  
  return (
    <div>
      <SimilarExamples input={jobDescription} />
    </div>
  );
}
```

### Integração em Formulário de Criação de Job

Veja o exemplo completo em `/src/pages/JobCreationWithSimilarExamples.tsx`:

```tsx
import SimilarExamples from '@/components/copilot/SimilarExamples';

function JobCreationForm() {
  const [jobTitle, setJobTitle] = useState("");
  const [description, setDescription] = useState("");
  
  // Combine campos para busca
  const searchQuery = `${jobTitle} ${description}`.trim();
  
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Formulário */}
      <div>
        <Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      
      {/* Exemplos Semelhantes */}
      <div>
        <SimilarExamples input={searchQuery} />
      </div>
    </div>
  );
}
```

## 📊 API do Componente

### Props

| Prop | Tipo | Obrigatório | Descrição |
|------|------|-------------|-----------|
| `input` | `string` | ✅ | Texto de entrada para busca de similaridade |

### Estrutura de Dados

```typescript
interface SimilarJobMetadata {
  job_id?: string;           // ID do job histórico
  title: string;              // Título do job
  component_id: string;       // ID do componente
  created_at: string;         // Data de criação (ISO 8601)
  ai_suggestion?: string;     // Sugestão da IA
  similarity?: number;        // Score de similaridade (0-1)
}
```

## 🔍 Função querySimilarJobs

### Uso Direto

```typescript
import { querySimilarJobs } from '@/lib/ai/copilot/querySimilarJobs';

// Busca padrão (threshold 0.6, 5 resultados)
const results = await querySimilarJobs("Problema com gerador");

// Busca customizada
const results = await querySimilarJobs(
  "Problema com gerador",
  0.7,  // threshold mínimo de similaridade
  10    // número máximo de resultados
);
```

### Parâmetros

| Parâmetro | Tipo | Padrão | Descrição |
|-----------|------|--------|-----------|
| `input` | `string` | - | Texto para busca de similaridade |
| `matchThreshold` | `number` | `0.6` | Threshold mínimo de similaridade (0-1) |
| `matchCount` | `number` | `5` | Número máximo de resultados |

## 🎨 Personalização

### Estilização

O componente usa Tailwind CSS e shadcn/ui. Para customizar:

```tsx
<SimilarExamples input={text} />
```

Você pode envolver o componente em um container com suas próprias classes:

```tsx
<div className="custom-container">
  <SimilarExamples input={text} />
</div>
```

### Botão "Usar como base"

O botão atualmente é visual. Para adicionar funcionalidade:

```tsx
// No componente SimilarExamples.tsx
<Button 
  className="mt-2" 
  variant="outline"
  onClick={() => handleUseAsBase(job.metadata)}
>
  📋 Usar como base
</Button>
```

## 🔌 Integração com Supabase

### Função RPC Necessária

O componente depende da função RPC `match_mmi_job_history` no Supabase:

```sql
CREATE OR REPLACE FUNCTION match_mmi_job_history (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  job_id text,
  title text,
  component_name text,
  created_at timestamp,
  ai_recommendation text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    mj.id::text as job_id,
    mj.title,
    mj.component_name,
    mj.created_at,
    mj.ai_recommendation,
    1 - (mj.embedding <=> query_embedding) as similarity
  FROM mmi_jobs mj
  WHERE 1 - (mj.embedding <=> query_embedding) > match_threshold
  ORDER BY mj.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

### Tabela Necessária

```sql
CREATE TABLE mmi_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  component_name text,
  created_at timestamp DEFAULT now(),
  ai_recommendation text,
  embedding vector(1536)
);

-- Criar índice para busca vetorial
CREATE INDEX ON mmi_jobs USING ivfflat (embedding vector_cosine_ops);
```

## 🌐 Variáveis de Ambiente

```env
VITE_OPENAI_API_KEY=your_openai_api_key_here
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🧪 Testes

### Teste Manual

1. Navegue para a página de exemplo:
   ```
   /job-creation-with-similar-examples
   ```

2. Preencha o formulário:
   - Título: "Manutenção preventiva do gerador STBD"
   - Componente: "GEN-STBD-01"
   - Descrição: "Ruído excessivo e aumento de temperatura"

3. Clique em "Ver exemplos semelhantes"

4. Verifique se os cards aparecem com:
   - Título do job
   - Componente
   - Data
   - Score de similaridade
   - Sugestão da IA

## 📈 Melhorias Futuras

- [ ] Adicionar filtros por data, componente, embarcação
- [ ] Implementar paginação para resultados
- [ ] Adicionar opção de copiar sugestão
- [ ] Salvar jobs favoritos
- [ ] Exportar exemplos em PDF
- [ ] Histórico de buscas
- [ ] Comparação lado a lado de múltiplos jobs

## 🐛 Troubleshooting

### Não aparecem resultados

1. Verifique se a API key do OpenAI está configurada
2. Confirme que o banco de dados tem jobs com embeddings
3. Reduza o `matchThreshold` (ex: 0.3 para testes)

### Erro de conexão com Supabase

1. Verifique as variáveis de ambiente
2. Confirme que a função RPC existe
3. Teste a conexão com Supabase

### Dados mock aparecem sempre

Isso é normal quando:
- API key não está configurada
- Erro na geração de embeddings
- Banco de dados não está acessível

## 📞 Suporte

Para problemas ou dúvidas, consulte:
- Documentação do Supabase: https://supabase.com/docs
- Documentação do OpenAI: https://platform.openai.com/docs
- Código fonte em `/components/copilot/SimilarExamples.tsx`

## 🎯 Casos de Uso Recomendados

1. **Criação de Novo Job**: Mostrar exemplos enquanto o usuário preenche o formulário
2. **Auditoria de Jobs**: Comparar job atual com histórico
3. **Treinamento**: Ensinar novos usuários com exemplos reais
4. **Qualidade**: Garantir consistência nas resoluções
5. **Knowledge Base**: Construir base de conhecimento organizacional

---

✅ **Componente SimilarExamples.tsx criado e pronto para uso no Copilot!**
