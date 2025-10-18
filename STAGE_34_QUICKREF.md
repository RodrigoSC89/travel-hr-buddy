# ETAPA 34 — Quick Reference Guide

## 🚀 Acesso Rápido

**URL Principal:** `/admin/risk-audit`

## 📊 4 Abas Principais

### 1️⃣ Riscos Táticos
- **Função:** Visualizar e gerar previsões de risco por embarcação
- **Ação Rápida:** Botão "Gerar Previsões"
- **Filtros:** Por embarcação
- **Visualização:** Cards com resumo + lista detalhada

### 2️⃣ Simulador de Auditoria
- **Função:** Simular resultado de auditoria futura
- **Inputs:** Embarcação + Tipo de Auditoria
- **Outputs:** Score, Probabilidade, Pontos Fracos, Recomendações
- **Tipos Suportados:** Petrobras, IBAMA, ISO, IMCA, ISM, SGSO

### 3️⃣ Ações Recomendadas
- **Função:** Centralizar e atribuir ações corretivas
- **Features:** 
  - Priorização automática (Alta/Média/Baixa)
  - Atribuição de responsáveis
  - Origem: Riscos + Auditorias

### 4️⃣ Scores Normativos
- **Função:** Visão consolidada por padrão normativo
- **Padrões:** IMCA, SGSO, ISM, ISO, Petrobras, IBAMA
- **Visualização:** Score + Probabilidade de Aprovação

## 🔧 APIs Disponíveis

### Gerar Previsões de Risco
```bash
POST /api/ai/forecast-risks
Body: { "vessel_id": "uuid" }  # opcional
```

### Simular Auditoria
```bash
POST /api/audit/score-predict
Body: {
  "vessel_id": "uuid",
  "audit_type": "Petrobras"
}
```

## 📋 Tabelas do Banco

### `tactical_risks`
- Armazena previsões de risco operacional
- Campos chave: `system`, `predicted_risk`, `risk_score`, `suggested_action`

### `audit_predictions`
- Armazena simulações de auditoria
- Campos chave: `audit_type`, `expected_score`, `probability_pass`, `weaknesses`, `recommendations`

## ⚡ Funções SQL Úteis

```sql
-- Ver riscos por embarcação
SELECT * FROM get_vessel_risk_summary('vessel-uuid');

-- Ver últimas previsões de auditoria
SELECT * FROM get_latest_audit_predictions('vessel-uuid');

-- Ver prontidão para auditoria
SELECT * FROM get_audit_readiness_summary('vessel-uuid');
```

## 🎨 Score e Classificação

| Score | Classificação | Cor |
|-------|---------------|-----|
| 80-100 | Crítico | Vermelho |
| 60-79 | Alto | Amarelo |
| 40-59 | Médio | Padrão |
| 0-39 | Baixo | Cinza |

| Probabilidade | Cor |
|---------------|-----|
| Alta | Verde |
| Média | Amarelo |
| Baixa | Vermelho |

## 🔄 Fluxo de Trabalho

1. **Cron Diário** → Gera previsões automaticamente às 06:00 UTC
2. **Visualizar** → Dashboard mostra riscos atuais
3. **Simular** → Testa diferentes cenários de auditoria
4. **Atribuir** → Designa responsáveis para ações
5. **Monitorar** → Acompanha resolução

## 🐛 Troubleshooting Rápido

| Problema | Solução |
|----------|---------|
| Sem previsões | Clicar "Gerar Previsões" ou verificar dados de incidentes |
| IA não responde | Verificar OPENAI_API_KEY no Supabase |
| Score muito baixo | Normal se há muitos incidentes críticos |
| Sem embarcações | Verificar status='active' em vessels |

## 📱 Atalhos de Teclado

*(A ser implementado)*
- `Ctrl+G`: Gerar Previsões
- `Ctrl+S`: Simular Auditoria
- `Ctrl+A`: Ir para Ações

## 🔐 Permissões

- **Visualizar:** Todos usuários autenticados
- **Gerar Previsões:** Todos usuários autenticados
- **Atribuir Ações:** Todos usuários autenticados
- **Deletar:** Todos usuários autenticados

*(Ajustar RLS policies conforme necessidade)*

## 📞 Suporte

Ver documentação completa em `STAGE_34_IMPLEMENTATION_GUIDE.md`

---

**Última Atualização:** Outubro 2025
