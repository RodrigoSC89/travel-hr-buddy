# ETAPA 34 — Navegação Tática com IA + Previsibilidade de Auditoria

## 📋 Visão Geral

Sistema completo de inteligência tática para previsão de riscos operacionais e simulação de auditorias, desenvolvido para apoiar tomada de decisão estratégica em embarcações offshore.

## 🎯 Objetivos

- 📡 Antecipar falhas técnicas e riscos operacionais por embarcação
- 🧪 Simular reprovação ou aprovação futura em auditorias
- 📊 Gerar relatórios dinâmicos de conformidade e vulnerabilidade
- 🧠 Apoiar tomada de decisão estratégica para manutenção, treinamentos e ações corretivas

## 📦 Componentes Implementados

### 1. Inteligência Tática de Risco Operacional

#### Tabela `tactical_risks`
```sql
CREATE TABLE public.tactical_risks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES public.vessels(id),
  system TEXT CHECK (system IN ('DP', 'Energia', 'SGSO', 'Comunicações', ...)),
  predicted_risk TEXT CHECK (predicted_risk IN ('Falha', 'Intermitência', 'Atraso', ...)),
  risk_score INTEGER CHECK (risk_score BETWEEN 0 AND 100),
  suggested_action TEXT,
  analysis_details JSONB DEFAULT '{}',
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  valid_until TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active',
  assigned_to UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

**Funcionalidades:**
- Previsão de riscos por sistema (DP, Energia, SGSO, Comunicações)
- Score de risco (0-100) com classificação automática
- Ações sugeridas pela IA
- Atribuição de responsáveis
- Tracking de status

**Funções SQL:**
- `get_vessel_risk_summary()` - Resumo de riscos por embarcação
- Índices otimizados para queries rápidas
- RLS policies para segurança

### 2. Previsibilidade de Auditoria

#### Tabela `audit_predictions`
```sql
CREATE TABLE public.audit_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES public.vessels(id),
  audit_type TEXT CHECK (audit_type IN ('Petrobras', 'IBAMA', 'ISO', ...)),
  expected_score INTEGER CHECK (expected_score BETWEEN 0 AND 100),
  probability_pass TEXT CHECK (probability_pass IN ('Alta', 'Média', 'Baixa')),
  weaknesses JSONB DEFAULT '[]',
  recommendations JSONB DEFAULT '[]',
  compliance_areas JSONB DEFAULT '{}',
  risk_factors JSONB DEFAULT '[]',
  strengths JSONB DEFAULT '[]',
  ai_confidence NUMERIC(5,2),
  ...
);
```

**Funcionalidades:**
- Previsão de score de auditoria por tipo (Petrobras, IBAMA, ISO, IMCA, ISM, SGSO)
- Probabilidade de aprovação (Alta/Média/Baixa)
- Identificação de pontos fracos
- Recomendações acionáveis
- Análise de áreas de conformidade
- Nível de confiança da IA

**Funções SQL:**
- `get_latest_audit_predictions()` - Últimas previsões por embarcação
- `get_audit_readiness_summary()` - Resumo de prontidão para auditorias

### 3. APIs Backend

#### `/api/ai/forecast-risks` (POST)
Endpoint para geração de previsões de risco sob demanda.

**Request:**
```json
{
  "vessel_id": "uuid-da-embarcacao" // opcional, se omitido processa todas
}
```

**Response:**
```json
{
  "success": true,
  "processed_vessels": 1,
  "results": [
    {
      "vessel_id": "...",
      "vessel_name": "...",
      "risks_generated": 4,
      "predictions": [
        {
          "system": "DP",
          "predicted_risk": "Intermitência",
          "risk_score": 65,
          "suggested_action": "Realizar manutenção preventiva...",
          "reasoning": "Histórico recente mostra 3 incidentes..."
        }
      ]
    }
  ]
}
```

**Lógica de IA:**
- Coleta dados operacionais dos últimos 60 dias
- Analisa incidentes DP, SGSO e safety
- Usa GPT-4o-mini para previsões
- Fallback com análise baseada em regras

#### `/api/audit/score-predict` (POST)
Endpoint para simulação de auditoria.

**Request:**
```json
{
  "vessel_id": "uuid-da-embarcacao",
  "audit_type": "Petrobras"
}
```

**Response:**
```json
{
  "success": true,
  "prediction": {
    "expected_score": 72,
    "probability_pass": "Média",
    "ai_confidence": 80,
    "weaknesses": [
      "Evidências incompletas na cláusula M117-6",
      "Capacitação não comprovada SGSO"
    ],
    "recommendations": [
      "Anexar PDF do treinamento SGSO de Setembro",
      "Inserir plano de ação para Blackout 07/10"
    ],
    "compliance_areas": {
      "documentacao": 75,
      "treinamentos": 65,
      "gestao_riscos": 80,
      "incidentes": 70,
      "equipamentos": 85
    },
    "risk_factors": [
      "3 incidentes não resolvidos",
      "2 certificados expirados"
    ],
    "strengths": [
      "Sistema DP bem mantido",
      "Boa taxa de compliance SGSO"
    ]
  }
}
```

**Dados Analisados:**
- Práticas SGSO (17 práticas ANP)
- Incidentes de segurança (últimos 6 meses)
- Avaliações de risco
- Registros de treinamento
- Incidentes DP
- Status de certificados

#### Supabase Edge Function: `forecast-risks-cron`
Função executada diariamente para atualização automática de riscos.

**Características:**
- Roda para todas embarcações ativas
- Marca previsões antigas como `resolved`
- Gera novas previsões válidas por 15 dias
- Log detalhado de execução

**Configuração do Cron:**
```yaml
# supabase/functions/cron.yaml
- name: daily-risk-forecast
  schedule: "0 6 * * *"  # 06:00 UTC todos os dias
  function: forecast-risks-cron
```

### 4. Frontend Dashboard

#### Página `/admin/risk-audit`
Dashboard completo com 4 abas principais.

**Aba 1: Riscos Táticos**
- Mapa de riscos por embarcação
- Cards com resumo de riscos (críticos, altos, médios, baixos)
- Score médio por embarcação
- Sistema mais crítico
- Detalhes de riscos com ações sugeridas
- Botão para gerar previsões sob demanda

**Aba 2: Simulador de Auditoria**
- Seleção de embarcação
- Seleção de tipo de auditoria
- Simulação com IA
- Resultado:
  - Score esperado
  - Probabilidade de aprovação
  - Confiança da IA
  - Pontos fracos
  - Recomendações

**Aba 3: Ações Recomendadas**
- Lista consolidada de ações de riscos e auditorias
- Priorização (Alta, Média, Baixa)
- Atribuição de responsáveis
- Filtro por embarcação
- Tracking de status

**Aba 4: Scores Normativos**
- Pontuação por padrão (IMCA, SGSO, ISM, ISO, Petrobras, IBAMA)
- Probabilidade de aprovação por padrão
- Visualização em cards
- Progress bars

## 🚀 Como Usar

### 1. Configuração Inicial

#### Aplicar Migrações
```bash
# As migrações serão aplicadas automaticamente no Supabase
# Verificar no Supabase Dashboard > SQL Editor
```

#### Configurar Variáveis de Ambiente
```env
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=...
```

### 2. Gerar Previsões de Risco

#### Via Interface (Recomendado)
1. Acesse `/admin/risk-audit`
2. Aba "Riscos Táticos"
3. Clique em "Gerar Previsões"
4. Aguarde o processamento

#### Via API
```bash
curl -X POST http://localhost:8080/api/ai/forecast-risks \
  -H "Content-Type: application/json" \
  -d '{
    "vessel_id": "uuid-da-embarcacao"
  }'
```

#### Via Cron (Automático)
O cron job executará automaticamente às 06:00 UTC todos os dias.

### 3. Simular Auditoria

1. Acesse `/admin/risk-audit`
2. Aba "Simulador de Auditoria"
3. Selecione embarcação
4. Selecione tipo de auditoria
5. Clique em "Simular Auditoria"
6. Analise os resultados

### 4. Gerenciar Ações

1. Acesse `/admin/risk-audit`
2. Aba "Ações Recomendadas"
3. Visualize ações priorizadas
4. Atribua responsáveis usando o dropdown
5. Monitore o status

## 📊 Benefícios Imediatos

🧩 **Previsão de Falhas Críticas**
- Antecipação de problemas em até 15 dias
- Manutenção preventiva direcionada
- Redução de downtime não planejado

🔒 **Planejamento Preventivo de Auditorias**
- Identificação prévia de não conformidades
- Tempo para correções antes da auditoria
- Aumento da taxa de aprovação

📊 **Gestão de Riscos Operacionais com IA**
- Análise contínua de múltiplas fontes de dados
- Recomendações acionáveis
- Tracking centralizado

🗂 **Centralização de Ações**
- Todas ações em um só lugar
- Atribuição e acompanhamento
- Priorização automática

## 🔧 Estrutura de Código

```
/pages/api/
  /ai/
    forecast-risks.ts          # Endpoint de previsão de riscos
  /audit/
    score-predict.ts           # Endpoint de previsão de auditoria

/src/
  /pages/admin/
    risk-audit.tsx             # Página principal
  /components/admin/risk-audit/
    TacticalRiskPanel.tsx      # Aba de riscos táticos
    AuditSimulator.tsx         # Aba de simulação
    RecommendedActions.tsx     # Aba de ações
    NormativeScores.tsx        # Aba de scores

/supabase/
  /migrations/
    20251018000000_create_tactical_risks.sql
    20251018000001_create_audit_predictions.sql
  /functions/
    /forecast-risks-cron/
      index.ts                 # Edge function para cron
```

## 🧪 Testes

### Teste de Previsão de Risco
```typescript
// Teste manual via interface
1. Criar embarcação de teste
2. Adicionar alguns incidentes DP
3. Executar "Gerar Previsões"
4. Verificar se riscos foram criados
5. Conferir scores e ações sugeridas
```

### Teste de Simulação de Auditoria
```typescript
// Teste manual via interface
1. Selecionar embarcação com dados
2. Escolher tipo "Petrobras"
3. Simular
4. Verificar se score é razoável
5. Conferir se recomendações fazem sentido
```

## 📈 Próximos Passos (Etapa 35 Sugerida)

| Opção | Objetivo |
|-------|----------|
| 🔬 Implantar testes e2e | Garantir robustez e evitar regressões |
| 🧪 Simulação de auditor + quiz | Avaliar tripulação de forma digital |
| 🌐 Modo viewer para certificadoras | Compartilhar relatórios com clientes |

## 🐛 Troubleshooting

### Erro: "OPENAI_API_KEY is not set"
**Solução:** Configurar a variável de ambiente no Supabase Dashboard > Project Settings > Edge Functions > Secrets

### Erro: "No active vessels found"
**Solução:** Verificar se existem embarcações com `status = 'active'` na tabela `vessels`

### Previsões não aparecem
**Solução:** 
1. Verificar se a função foi executada com sucesso
2. Checar logs no Supabase Dashboard
3. Verificar se há dados operacionais (incidentes) nos últimos 60 dias

### Score de auditoria muito baixo
**Solução:**
- Normal se há muitos incidentes críticos não resolvidos
- Verificar compliance SGSO
- Atualizar certificados expirados
- Resolver incidentes pendentes

## 📝 Notas Técnicas

### Performance
- Queries otimizadas com índices
- Uso de funções PostgreSQL SECURITY DEFINER
- Paginação onde necessário
- Caching de resultados via React Query (implícito no useEffect)

### Segurança
- RLS policies em todas tabelas
- Service role key apenas no backend
- Validação de inputs
- Sanitização de dados

### IA
- Modelo: GPT-4o-mini (rápido e econômico)
- Temperature: 0.3 (previsível)
- Max tokens: 2000
- Fallback: Análise baseada em regras se IA falhar

### Escalabilidade
- Suporta múltiplas embarcações
- Cron job assíncrono
- Edge functions escalam automaticamente
- Banco de dados com índices otimizados

## 📚 Referências

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Resolução ANP 43/2007](https://www.gov.br/anp/)
- [IMCA Guidelines](https://www.imca-int.com/)

---

**Desenvolvido para:** Travel HR Buddy - Sistema de Gestão Offshore
**Data:** Outubro 2025
**Versão:** 1.0.0
