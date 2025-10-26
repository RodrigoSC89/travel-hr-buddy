# PATCH 204.0 – Multi-Vessel Context Validation

## 📘 Objetivo
Validar o sistema de contexto multi-embarcação, garantindo isolamento completo de dados por `vessel_id` e prevenindo acesso cruzado entre embarcações.

## ✅ Checklist de Validação

### 1. VesselContext Provider
- [ ] Arquivo `src/lib/vesselContext.tsx` existe
- [ ] Context API implementado corretamente
- [ ] Hook `useVessel()` funcional
- [ ] Hook `useVesselId()` retorna ID correto
- [ ] Hook `useVesselFilter()` aplica filtros
- [ ] Estado de vessel persistido em localStorage
- [ ] Real-time updates ao trocar vessel

### 2. Seletor de Embarcação
- [ ] Componente VesselSelector renderiza
- [ ] Lista de vessels carrega do Supabase
- [ ] Dropdown com todos vessels ativos
- [ ] Seleção atualiza contexto global
- [ ] Avatar/ícone de vessel exibido
- [ ] Status da vessel indicado (ativo/manutenção)

### 3. Isolamento de Dados
- [ ] Todas queries filtram por `vessel_id`
- [ ] Dashboard mostra apenas dados do vessel atual
- [ ] Logs filtrados por vessel
- [ ] Missões filtradas por vessel
- [ ] Manutenção filtrada por vessel
- [ ] Rotas filtradas por vessel

### 4. RLS no Supabase
- [ ] Políticas RLS forçam filtro por `vessel_id`
- [ ] Usuário não vê dados de outro vessel
- [ ] INSERT verifica `vessel_id` correto
- [ ] UPDATE valida `vessel_id` não muda
- [ ] DELETE restringe por `vessel_id`

### 5. Componentes Reativos
- [ ] Dashboard re-renderiza ao trocar vessel
- [ ] Gráficos atualizam dados
- [ ] Listas recarregam automaticamente
- [ ] Mapas centralizam no vessel atual
- [ ] Breadcrumbs exibem vessel name
- [ ] Header mostra vessel ativo

### 6. Performance
- [ ] Troca de vessel ≤ 500ms
- [ ] Queries otimizadas com índices
- [ ] Cache de dados por vessel
- [ ] Prefetch de vessels vizinhos
- [ ] Lazy loading de dados pesados

## 📊 Critérios de Sucesso
- ✅ Contexto de vessel global funcional
- ✅ 100% dos componentes filtram por vessel_id
- ✅ RLS impede acesso cruzado
- ✅ UI reage instantaneamente à troca
- ✅ Performance otimizada
- ✅ Persistência entre sessões

## 🔍 Testes Recomendados

### Teste 1: Carregar Vessels
1. Abrir aplicação
2. Verificar lista de vessels carrega
3. Confirmar vessel padrão selecionado
4. Validar dados do Supabase
5. Testar ordenação alfabética
6. Verificar vessels inativos ocultos

### Teste 2: Trocar de Vessel
1. Abrir seletor de vessel
2. Selecionar vessel diferente
3. Verificar UI atualiza instantaneamente:
   - Dashboard muda KPIs
   - Gráficos recarregam
   - Logs filtram
   - Mapa centraliza
4. Recarregar página
5. Confirmar vessel permanece selecionado

### Teste 3: Isolamento de Dados
1. Selecionar Vessel A
2. Criar log de teste: "LOG_VESSEL_A"
3. Criar missão de teste: "MISSAO_VESSEL_A"
4. Trocar para Vessel B
5. Verificar:
   - LOG_VESSEL_A não aparece
   - MISSAO_VESSEL_A não aparece
6. Voltar para Vessel A
7. Confirmar dados aparecem novamente

### Teste 4: RLS no Supabase
1. Abrir console Supabase
2. Executar query sem filtro:
   ```sql
   SELECT * FROM missions;
   ```
3. Verificar RLS força `vessel_id`
4. Tentar UPDATE com `vessel_id` diferente:
   ```sql
   UPDATE missions 
   SET vessel_id = 'outro-vessel-id' 
   WHERE id = 'mission-id';
   ```
5. Confirmar erro de RLS

### Teste 5: Performance
1. Medir tempo de troca de vessel
2. Verificar queries no Network tab
3. Confirmar índices usados:
   ```sql
   EXPLAIN ANALYZE 
   SELECT * FROM missions 
   WHERE vessel_id = 'vessel-id';
   ```
4. Validar cache funciona
5. Testar com 100+ vessels

## 🚨 Cenários de Erro

### Contexto Não Carrega
- [ ] VesselProvider não envolvendo app
- [ ] Supabase retorna erro
- [ ] RLS muito restritivo
- [ ] Tabela vessels vazia

### Dados Cruzados
- [ ] Query não filtra por vessel_id
- [ ] RLS desabilitada
- [ ] Política com WHERE incorreto
- [ ] Cache misturando vessels

### UI Não Atualiza
- [ ] Context não dispara re-render
- [ ] Componente não usa useVessel()
- [ ] Query não revalida
- [ ] React Query com staleTime alto

## 📁 Arquivos a Verificar
- [ ] `src/lib/vesselContext.tsx` ⭐
- [ ] `src/components/VesselSelector.tsx`
- [ ] `src/hooks/useVesselFilter.ts`
- [ ] `src/pages/Dashboard.tsx`
- [ ] `src/pages/Missions.tsx`
- [ ] `src/pages/Logs.tsx`
- [ ] `supabase/migrations/*_vessels.sql`
- [ ] `supabase/migrations/*_rls_vessel_id.sql`

## 📊 Schema Supabase

```sql
-- Tabela de vessels
CREATE TABLE public.vessels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  imo_number TEXT UNIQUE,
  flag TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX idx_vessels_status ON public.vessels(status);
CREATE INDEX idx_vessels_name ON public.vessels(name);

-- RLS
ALTER TABLE public.vessels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view active vessels"
  ON public.vessels FOR SELECT
  USING (status = 'active');

-- Exemplo de tabela com vessel_id
CREATE TABLE public.missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES public.vessels(id) NOT NULL,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índice crítico para performance
CREATE INDEX idx_missions_vessel_id ON public.missions(vessel_id);

-- RLS forçando vessel_id
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only view their vessel's missions"
  ON public.missions FOR SELECT
  USING (
    vessel_id IN (
      SELECT id FROM public.vessels WHERE status = 'active'
    )
  );

CREATE POLICY "Users can only insert to their vessel"
  ON public.missions FOR INSERT
  WITH CHECK (
    vessel_id IN (
      SELECT id FROM public.vessels WHERE status = 'active'
    )
  );
```

## 📊 Métricas
- [ ] Vessels cadastrados: _____
- [ ] Vessels ativos: _____
- [ ] Tempo médio de troca: _____ms
- [ ] Queries filtradas corretamente: _____%
- [ ] Componentes reativos: _____/_____
- [ ] Cobertura de RLS: _____%

## 🧪 Validação Automatizada
```bash
# Testar contexto React
npm run test:context

# Verificar RLS no Supabase
supabase db lint

# Testar políticas RLS
npm run test:rls

# Build production
npm run build

# Preview
npm run preview
```

## 📝 Tabelas com vessel_id
- [ ] `missions`
- [ ] `logs`
- [ ] `maintenance`
- [ ] `routes`
- [ ] `crew_members`
- [ ] `inventory`
- [ ] `fuel_logs`
- [ ] `incidents`

## 📝 Notas de Validação
- **Data**: _____________
- **Validador**: _____________
- **Vessels testados**: _____
- **Tabelas validadas**: _____
- **Ambiente**: [ ] Dev [ ] Staging [ ] Production
- **Status**: [ ] ✅ Aprovado [ ] ❌ Reprovado [ ] 🔄 Em Revisão

## 🎯 Checklist de Go-Live
- [ ] VesselContext em produção
- [ ] Todas tabelas com vessel_id
- [ ] RLS em 100% das tabelas
- [ ] UI reage à troca de vessel
- [ ] Performance otimizada
- [ ] Documentação completa

## 📋 Observações Adicionais
_____________________________________________
_____________________________________________
_____________________________________________
