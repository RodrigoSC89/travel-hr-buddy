# PATCH 196.0 – Learning Core Validation

## 📘 Objetivo
Validar o módulo de aprendizado contínuo (learning-core) que registra eventos de uso, falhas e decisões para gerar datasets de treinamento.

## ✅ Checklist de Validação

### 1. Módulo Learning Core
- [ ] Diretório `src/lib/learning/` criado
- [ ] Arquivo `learning-engine.ts` implementado
- [ ] Configuração de eventos definida
- [ ] Tipos TypeScript para eventos criados
- [ ] Exports corretos no index.ts
- [ ] Integração com sistema de logs

### 2. Captura de Eventos
- [ ] Eventos de uso do usuário registrados
- [ ] Eventos de falhas capturados
- [ ] Decisões do sistema logadas
- [ ] Contexto completo armazenado
- [ ] Timestamps corretos
- [ ] User ID associado quando aplicável

### 3. Tabela Supabase
- [ ] Tabela `learning_events` criada
- [ ] Colunas corretas: id, event_type, context, user_id, timestamp
- [ ] RLS configurada adequadamente
- [ ] Índices para queries otimizados
- [ ] Políticas de retenção definidas
- [ ] Particionamento por data implementado

### 4. Geração de Datasets
- [ ] Função de export de dados implementada
- [ ] Formato de dataset definido (CSV/JSON)
- [ ] Filtros por tipo de evento funcionam
- [ ] Agregação de dados por período
- [ ] Anonimização de dados sensíveis
- [ ] API para acesso aos datasets

### 5. Tipos de Eventos Registrados
- [ ] **user_action**: Cliques, navegação, inputs
- [ ] **system_decision**: Escolhas autônomas da IA
- [ ] **error_event**: Falhas, exceções, timeouts
- [ ] **performance_metric**: Latência, uso de recursos
- [ ] **ai_prediction**: Inferências e recomendações
- [ ] **user_feedback**: Aprovações/rejeições de sugestões

### 6. Integração com Módulos
- [ ] Autonomy Engine envia decisões
- [ ] Performance Dashboard envia métricas
- [ ] AI Assistants enviam interações
- [ ] Error boundaries capturam falhas
- [ ] Mission Control envia eventos críticos
- [ ] Fleet Management envia operações

## 📊 Critérios de Sucesso
- ✅ Learning Core registra >= 5 tipos de eventos
- ✅ Tabela `learning_events` contém dados reais
- ✅ 100% dos eventos têm contexto completo
- ✅ Geração de datasets funcional
- ✅ Performance < 10ms por evento registrado
- ✅ Armazenamento otimizado com particionamento

## 🔍 Testes Recomendados

### Teste 1: Registro de Eventos de Uso
1. Navegar por diferentes módulos
2. Executar ações (criar, editar, deletar)
3. Verificar eventos no Supabase
4. Confirmar contexto completo
5. Validar timestamps

### Teste 2: Captura de Falhas
1. Forçar erro em componente
2. Verificar error_event registrado
3. Confirmar stack trace armazenado
4. Validar categorização de erro
5. Testar retry automático

### Teste 3: Decisões Autônomas
1. Ativar Autonomy Engine
2. Aguardar decisão autônoma
3. Verificar system_decision logado
4. Confirmar resultado da ação
5. Validar learning feedback

### Teste 4: Geração de Dataset
1. Acumular >= 100 eventos
2. Executar função de export
3. Validar formato do dataset
4. Verificar anonimização
5. Testar filtros e agregações

### Teste 5: Performance
1. Registrar 1000 eventos em sequência
2. Medir tempo médio por evento
3. Verificar uso de memória
4. Validar batch processing
5. Confirmar sem bloqueio da UI

## 🚨 Cenários de Erro

### Eventos Não Registrados
- [ ] Supabase offline ou timeout
- [ ] RLS bloqueando insert
- [ ] Contexto malformado
- [ ] User ID inválido
- [ ] Quota de armazenamento excedida

### Dataset Inválido
- [ ] Dados sensíveis não anonimizados
- [ ] Formato inconsistente
- [ ] Campos obrigatórios faltando
- [ ] Encoding incorreto
- [ ] Estrutura JSON quebrada

### Performance Degradada
- [ ] Eventos bloqueando thread principal
- [ ] Batch processing falha
- [ ] Memória não liberada
- [ ] Queries lentas sem índices
- [ ] Particionamento não funciona

## 📁 Arquivos a Verificar
- [ ] `src/lib/learning/learning-engine.ts`
- [ ] `src/lib/learning/event-types.ts`
- [ ] `src/lib/learning/dataset-generator.ts`
- [ ] `src/lib/learning/index.ts`
- [ ] `supabase/migrations/*_learning_events.sql`
- [ ] Integrações em módulos principais

## 📊 Schema Supabase Esperado

### Tabela: learning_events
```sql
- id (uuid, pk)
- event_type (text: 'user_action' | 'system_decision' | 'error_event' | 'performance_metric' | 'ai_prediction' | 'user_feedback')
- event_name (text)
- context (jsonb)
- user_id (uuid, nullable)
- session_id (text)
- module_id (text)
- timestamp (timestamp with time zone)
- created_at (timestamp with time zone)
```

### Índices Recomendados
```sql
- idx_learning_events_timestamp (timestamp DESC)
- idx_learning_events_type (event_type)
- idx_learning_events_module (module_id)
- idx_learning_events_user (user_id)
```

## 📊 Métricas
- [ ] Total de eventos registrados: _____
- [ ] Tipos de eventos capturados: _____/6
- [ ] Tempo médio de registro: _____ms
- [ ] Tamanho médio do contexto: _____KB
- [ ] Taxa de falha no registro: _____%
- [ ] Datasets gerados: _____

## 🧪 Validação Automatizada
```bash
# Testar registro de eventos
npm run test:learning

# Verificar integridade dos dados
npm run validate:learning-data

# Gerar dataset de teste
npm run learning:export --days=7

# Build e preview
npm run build
npm run preview
```

## 📝 Notas de Validação
- **Data**: _____________
- **Validador**: _____________
- **Eventos testados**: _____
- **Datasets gerados**: _____
- **Ambiente**: [ ] Dev [ ] Staging [ ] Production
- **Status**: [ ] ✅ Aprovado [ ] ❌ Reprovado [ ] 🔄 Em Revisão

## 🎯 Checklist de Go-Live
- [ ] Learning Core registra todos tipos de eventos
- [ ] Tabela Supabase populada e funcional
- [ ] Geração de datasets testada
- [ ] Performance dentro do esperado (< 10ms)
- [ ] Integração com todos módulos principais
- [ ] Política de retenção configurada
- [ ] Documentação completa

## 📋 Observações Adicionais
_____________________________________________
_____________________________________________
_____________________________________________
