# PATCH 201.0 – Cognitive Feedback Validation

## 📘 Objetivo
Validar o sistema de feedback cognitivo que permite operadores corregirem decisões da IA e melhorar o aprendizado contínuo do sistema.

## ✅ Checklist de Validação

### 1. Módulo Feedback Core
- [ ] Arquivo `feedback-core.ts` existe
- [ ] Classe `FeedbackCore` implementada
- [ ] Métodos de coleta de feedback funcionais
- [ ] Integração com learning-core ativa
- [ ] Logs de decisões sendo capturados
- [ ] Sistema de correção implementado

### 2. Tabela Supabase
- [ ] Tabela `cognitive_feedback` criada
- [ ] Campos corretos: id, decision_id, operator_id, correction_type, before_state, after_state, reason, timestamp
- [ ] RLS habilitada
- [ ] Políticas de acesso configuradas
- [ ] Índices otimizados
- [ ] Dados de teste inseridos

### 3. Interface de Feedback
- [ ] UI para visualizar decisões da IA
- [ ] Botão "Corrigir Decisão" presente
- [ ] Modal de feedback funcional
- [ ] Dropdown de tipos de correção
- [ ] Campo de justificativa
- [ ] Confirmação de envio
- [ ] Toast de sucesso/erro

### 4. Logs de Correção
- [ ] Eventos de correção registrados
- [ ] Filtros por operador funcionam
- [ ] Timeline de correções visível
- [ ] Estatísticas de aprendizado exibidas
- [ ] Exportação de logs disponível

### 5. Aprendizado Contínuo
- [ ] Correções alimentam modelo de IA
- [ ] Padrões de erro detectados
- [ ] Sugestões de melhoria geradas
- [ ] Métricas de acurácia atualizadas
- [ ] Dashboard de evolução disponível

## 📊 Critérios de Sucesso
- ✅ Sistema captura 100% das decisões da IA
- ✅ Operadores podem corrigir qualquer decisão
- ✅ Correções são persistidas no Supabase
- ✅ UI responsiva e intuitiva
- ✅ Logs acessíveis e filtráveis
- ✅ Aprendizado contínuo ativo

## 🔍 Testes Recomendados

### Teste 1: Captura de Decisão
1. Acionar uma decisão da IA (ex: recomendação de rota)
2. Verificar se aparece no feed de decisões
3. Confirmar timestamp e contexto corretos
4. Validar dados completos salvos

### Teste 2: Correção de Decisão
1. Selecionar decisão da IA
2. Clicar em "Corrigir"
3. Escolher tipo de correção:
   - ❌ Decisão incorreta
   - ⚠️ Parcialmente correta
   - ✅ Correta mas pode melhorar
4. Adicionar justificativa detalhada
5. Enviar correção
6. Verificar salvo no Supabase

### Teste 3: Visualização de Logs
1. Acessar página de feedback
2. Filtrar por operador
3. Filtrar por tipo de correção
4. Filtrar por período
5. Verificar ordenação cronológica
6. Exportar logs em CSV/JSON

### Teste 4: Impacto no Aprendizado
1. Fazer 10+ correções
2. Acessar dashboard de métricas
3. Verificar taxa de acerto antes/depois
4. Confirmar padrões detectados
5. Validar sugestões geradas

### Teste 5: Real-time Updates
1. Operador A faz correção
2. Operador B vê atualização em tempo real
3. Notificação de nova correção
4. Dashboard atualiza sem refresh

## 🚨 Cenários de Erro

### Falha ao Salvar Feedback
- [ ] Supabase offline ou lento
- [ ] RLS bloqueando insert
- [ ] Campos obrigatórios faltando
- [ ] Timeout de requisição

### UI Não Responde
- [ ] Modal não abre
- [ ] Botão de envio travado
- [ ] Dropdown não carrega opções
- [ ] Toast não aparece

### Logs Vazios
- [ ] Query com filtros muito restritivos
- [ ] Nenhuma decisão capturada
- [ ] RLS impedindo leitura
- [ ] Cache não atualizado

## 📁 Arquivos a Verificar
- [ ] `src/ai/feedback-core.ts`
- [ ] `src/components/FeedbackModal.tsx`
- [ ] `src/pages/CognitiveFeedback.tsx`
- [ ] `src/hooks/useFeedback.ts`
- [ ] `supabase/migrations/*_cognitive_feedback.sql`

## 📊 Schema Supabase Esperado

```sql
-- Tabela de feedback cognitivo
CREATE TABLE public.cognitive_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID NOT NULL,
  operator_id UUID REFERENCES auth.users(id),
  correction_type TEXT NOT NULL CHECK (correction_type IN ('incorrect', 'partially_correct', 'can_improve')),
  before_state JSONB NOT NULL,
  after_state JSONB NOT NULL,
  reason TEXT NOT NULL,
  context JSONB,
  impact_score INTEGER DEFAULT 0,
  applied BOOLEAN DEFAULT false,
  timestamp TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX idx_cognitive_feedback_operator ON public.cognitive_feedback(operator_id);
CREATE INDEX idx_cognitive_feedback_decision ON public.cognitive_feedback(decision_id);
CREATE INDEX idx_cognitive_feedback_timestamp ON public.cognitive_feedback(timestamp DESC);
CREATE INDEX idx_cognitive_feedback_type ON public.cognitive_feedback(correction_type);

-- RLS
ALTER TABLE public.cognitive_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all feedback"
  ON public.cognitive_feedback FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own feedback"
  ON public.cognitive_feedback FOR INSERT
  WITH CHECK (auth.uid() = operator_id);
```

## 📊 Métricas
- [ ] Total de decisões capturadas: _____
- [ ] Total de correções feitas: _____
- [ ] Taxa de correção: _____%
- [ ] Operadores ativos: _____
- [ ] Tempo médio de resposta: _____ms
- [ ] Melhoria de acurácia: _____%

## 🧪 Validação Automatizada
```bash
# Testar conexão Supabase
npm run test:db

# Verificar tabela cognitive_feedback
supabase db lint

# Build production
npm run build

# Preview
npm run preview
```

## 📝 Notas de Validação
- **Data**: _____________
- **Validador**: _____________
- **Decisões testadas**: _____
- **Correções testadas**: _____
- **Ambiente**: [ ] Dev [ ] Staging [ ] Production
- **Status**: [ ] ✅ Aprovado [ ] ❌ Reprovado [ ] 🔄 Em Revisão

## 🎯 Checklist de Go-Live
- [ ] Sistema captura todas decisões
- [ ] UI de feedback intuitiva
- [ ] Logs acessíveis e completos
- [ ] Aprendizado contínuo ativo
- [ ] Performance dentro do esperado
- [ ] Documentação completa

## 📋 Observações Adicionais
_____________________________________________
_____________________________________________
_____________________________________________
