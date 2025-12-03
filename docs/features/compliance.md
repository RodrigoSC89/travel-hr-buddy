# Compliance e SGSO

## Visão Geral

Módulo para gestão de conformidade marítima, incluindo SGSO (Sistema de Gestão de Segurança Operacional) e auditorias ISM.

## Componentes

### SGSO (`src/modules/compliance/sgso/`)

Sistema de Gestão de Segurança Operacional:
- Políticas e procedimentos
- Registros de não-conformidades
- Planos de ação corretiva
- Indicadores de desempenho

### ISM Audit (`src/modules/compliance/ism-audit/`)

Auditorias do código ISM:
- Checklists de auditoria
- Evidências e documentos
- Relatórios de findings
- Acompanhamento de ações

### Checklists (`src/modules/compliance/checklists/`)

Listas de verificação customizáveis:
- Templates pré-definidos
- Criação personalizada
- Execução mobile-friendly
- Exportação PDF/Excel

## Fluxo de Auditoria

```
1. Planejamento
   ├── Definir escopo
   ├── Selecionar checklist
   └── Agendar data

2. Execução
   ├── Preencher checklist
   ├── Registrar evidências
   └── Anotar observações

3. Análise
   ├── Revisar findings
   ├── Classificar severidade
   └── Gerar relatório

4. Ações Corretivas
   ├── Criar plano de ação
   ├── Atribuir responsáveis
   └── Definir prazos

5. Fechamento
   ├── Verificar implementação
   ├── Validar evidências
   └── Encerrar auditoria
```

## Tabelas do Banco

```sql
-- Itens de compliance
compliance_items (
  id, category, title, severity, status,
  due_date, responsible_id, organization_id
)

-- Auditorias
audit_sessions (
  id, audit_type, vessel_id, auditor_id,
  scheduled_date, status, score
)

-- Findings
audit_findings (
  id, session_id, category, description,
  severity, status, corrective_action
)
```

## APIs

### Criar item de compliance

```typescript
const { data, error } = await supabase
  .from("compliance_items")
  .insert({
    category: "safety",
    title: "Verificação de extintores",
    severity: "medium",
    due_date: "2025-01-15"
  });
```

### Listar auditorias

```typescript
const { data } = await supabase
  .from("audit_sessions")
  .select("*, vessel:vessels(*), findings:audit_findings(*)")
  .eq("status", "in_progress");
```

## Relatórios

- **Compliance Score**: Índice geral de conformidade
- **Findings por Categoria**: Distribuição de não-conformidades
- **Tendência Mensal**: Evolução ao longo do tempo
- **Comparativo por Embarcação**: Ranking de compliance
