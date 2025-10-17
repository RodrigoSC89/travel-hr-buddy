# Lista de Auditorias IMCA - Implementação Técnica

## Visão Geral

Sistema completo para gerenciamento de auditorias técnicas IMCA (International Marine Contractors Association) com funcionalidades de filtragem, exportação e análise por IA.

## Arquitetura

### Banco de Dados

**Tabela**: `auditorias_imca`

Campos técnicos adicionados:
- `navio` (TEXT): Nome da embarcação auditada
- `norma` (TEXT): Norma/padrão aplicado (ex: IMCA M103)
- `item_auditado` (TEXT): Item específico auditado
- `resultado` (TEXT): Resultado da auditoria
  - "Conforme" (🟢)
  - "Não Conforme" (🔴)
  - "Não Aplicável" (⚫)
- `comentarios` (TEXT): Comentários e observações
- `data` (DATE): Data da realização da auditoria

**Índices para Performance**:
- `idx_auditorias_imca_navio`
- `idx_auditorias_imca_norma`
- `idx_auditorias_imca_resultado`
- `idx_auditorias_imca_data`

### Edge Functions

#### 1. auditorias-explain
**Endpoint**: `/functions/v1/auditorias-explain`

Gera explicações técnicas para não conformidades usando GPT-4.

**Request**:
```json
{
  "navio": "Nome da Embarcação",
  "item": "Item Auditado",
  "norma": "IMCA M103"
}
```

**Response**:
```json
{
  "success": true,
  "resultado": "Explicação técnica detalhada..."
}
```

**Análise Inclui**:
1. Significado da não conformidade
2. Riscos associados
3. Nível de criticidade
4. Referências técnicas da norma

#### 2. auditorias-plano
**Endpoint**: `/functions/v1/auditorias-plano`

Gera planos de ação estruturados para correção de não conformidades.

**Request**:
```json
{
  "navio": "Nome da Embarcação",
  "item": "Item Auditado",
  "norma": "IMCA M103"
}
```

**Response**:
```json
{
  "success": true,
  "plano": "Plano de ação estruturado..."
}
```

**Plano Inclui**:
1. Ações Imediatas (7 dias)
2. Ações de Curto Prazo (1 mês)
3. Responsáveis Sugeridos
4. Recursos Necessários
5. KPIs de Validação

### Frontend

#### Componente Principal
**Arquivo**: `src/components/auditorias/ListaAuditoriasIMCA.tsx`

**Funcionalidades**:
- ✅ Carregamento de dados do Supabase
- ✅ Filtragem dinâmica por navio, norma, item ou resultado
- ✅ Badges coloridos por status
- ✅ Exportação CSV com file-saver
- ✅ Exportação PDF com html2pdf.js
- ✅ Integração com Edge Functions para análise IA
- ✅ Loading states e tratamento de erros
- ✅ Visualização de frota auditada

#### Estados do Componente
```typescript
interface AuditoriaIMCA {
  id: string;
  navio: string;
  norma: string;
  item_auditado: string;
  resultado: "Conforme" | "Não Conforme" | "Não Aplicável";
  comentarios: string;
  data: string;
  created_at: string;
}
```

**Estados Gerenciados**:
- `auditorias`: Lista completa de auditorias
- `auditoriasFiltradas`: Lista após aplicação de filtros
- `filtro`: Texto do filtro
- `loading`: Estado de carregamento inicial
- `loadingIA`: ID da auditoria com análise IA em andamento
- `explicacao`: Explicações IA por ID de auditoria
- `plano`: Planos de ação por ID de auditoria

## Exportação

### CSV
- Headers: Navio, Data, Norma, Item Auditado, Resultado, Comentários
- Formato: UTF-8 com BOM
- Nome do arquivo: `auditorias_imca_YYYY-MM-DD.csv`

### PDF
- Formato: A4 Portrait
- Margem: 0.5 polegadas
- Escala: 2x para melhor qualidade
- Nome do arquivo: `auditorias_imca_YYYY-MM-DD.pdf`
- Conteúdo: Snapshot visual completo da lista

## Segurança

### Row Level Security (RLS)
- Políticas existentes mantidas na tabela `auditorias_imca`
- Usuários só veem suas próprias auditorias
- Admins têm acesso total

### API Keys
- Edge Functions usam `OPENAI_API_KEY` do ambiente Supabase
- Frontend usa `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`

## Rotas

**URL**: `/admin/lista-auditorias-imca`

Integrado ao SmartLayout para navegação consistente.

## Testes

**Arquivo**: `src/tests/lista-auditorias-imca.test.tsx`

**Cobertura**:
- ✅ Renderização de componentes
- ✅ Carregamento de dados
- ✅ Filtragem
- ✅ Exportação CSV/PDF
- ✅ Badges de status
- ✅ Análise IA
- ✅ Acessibilidade
- ✅ Tratamento de erros

Total: 15+ casos de teste

## Dependências

### Produção
- `file-saver`: Exportação CSV
- `@types/file-saver`: Type definitions
- `html2pdf.js`: Exportação PDF
- `date-fns`: Formatação de datas
- `lucide-react`: Ícones
- `sonner`: Toast notifications

### Desenvolvimento
Todas já presentes no projeto.

## Performance

### Otimizações
1. **Índices de Banco de Dados**: Queries rápidas em colunas filtráveis
2. **Lazy Loading**: Componente carregado sob demanda
3. **useEffect Dependencies**: Re-renderização controlada
4. **Debounce Implícito**: Filtro aplica-se após digitação completa

### Métricas Esperadas
- Carregamento inicial: < 2s
- Filtragem: < 100ms
- Exportação CSV: < 1s
- Exportação PDF: 2-5s (depende do número de registros)
- Análise IA: 5-15s (chamada GPT-4)

## Deployment

### Requisitos
1. ✅ Deploy Supabase Edge Functions
   ```bash
   supabase functions deploy auditorias-explain
   supabase functions deploy auditorias-plano
   ```

2. ✅ Executar migration
   ```bash
   supabase migration up
   ```

3. ✅ Configurar variável de ambiente
   ```bash
   supabase secrets set OPENAI_API_KEY=sk-...
   ```

4. ✅ Build e deploy frontend
   ```bash
   npm run build
   vercel --prod
   ```

## Troubleshooting

### Problema: Auditorias não carregam
**Solução**: Verificar RLS policies e autenticação do usuário

### Problema: Análise IA falha
**Solução**: Verificar `OPENAI_API_KEY` no Supabase Dashboard

### Problema: Exportação PDF não funciona
**Solução**: Verificar se `html2pdf.js` está importado corretamente

### Problema: Filtro não funciona
**Solução**: Verificar estado de `filtro` e `auditoriasFiltradas`

## Próximos Passos

### Melhorias Futuras
- [ ] Paginação para grandes volumes de dados
- [ ] Filtros avançados (multi-select, date range)
- [ ] Gráficos de dashboard integrados
- [ ] Notificações por email para não conformidades
- [ ] Histórico de análises IA
- [ ] Templates de planos de ação
- [ ] Integração com sistema de workflow
- [ ] Mobile app com Capacitor

## Suporte

Para questões técnicas, consultar:
- Documentação Supabase: https://supabase.com/docs
- OpenAI API: https://platform.openai.com/docs
- IMCA Standards: https://www.imca-int.com/

## Referências

- IMCA M103: Marine Inspection
- IMCA M140: Specification for Offshore Survey Vessels
- ISO 9001: Quality Management Systems
