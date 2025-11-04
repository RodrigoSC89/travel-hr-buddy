# Módulo: Pre-PSC (Port State Control)

## ✅ Objetivo

Sistema de preparação para inspeções de Port State Control (PSC) com checklist baseado em Paris MoU, análise de risco, IA preditiva para identificação de deficiências potenciais e relatórios de preparação.

## 📁 Estrutura de Arquivos

```
src/modules/pre-psc/
├── index.tsx                            # Entry point
├── PrePSCForm.tsx                       # Formulário principal
├── PSCAIAssistant.tsx                   # Assistente IA
├── PSCAlertTrigger.ts                   # Sistema de alertas
├── PSCScoreCalculator.ts                # Calculador de score

src/modules/compliance/pre-psc/
└── PrePSCForm.tsx                       # Formulário de conformidade

tests/
├── pre-psc.test.tsx                     # Unit tests
└── e2e/
    ├── pre-psc.spec.ts                  # E2E tests (existente)
    └── playwright/
        └── pre-psc.spec.ts              # Playwright tests (PATCH 638)
```

## 🛢️ Tabelas Supabase

### `pre_psc_inspections`
Registros de preparação para inspeção PSC.

**Campos principais:**
- `id`: UUID único
- `vessel_id`: Referência à embarcação
- `inspector_name`: Nome do inspetor interno
- `port_country`: Porto/país da próxima inspeção
- `inspection_date`: Data prevista
- `checklist_version`: Versão do checklist (Paris, Tokyo, Caribbean MoU)
- `completion_progress`: Progresso de conclusão (0-100)
- `risk_score`: Score de risco (0-100)
- `status`: draft, in_progress, completed, submitted
- `created_at`: Timestamp
- `updated_at`: Timestamp

### `pre_psc_checklist_items`
Itens do checklist PSC por categoria.

**Campos principais:**
- `id`: UUID único
- `inspection_id`: Referência à inspeção
- `category`: Certificates, Fire Safety, LSA, Navigation, etc.
- `item_number`: Número do item
- `item_description`: Descrição do item
- `status`: not_started, compliant, deficiency, not_applicable
- `comments`: Comentários/observações
- `corrective_action`: Ação corretiva tomada
- `created_at`: Timestamp

### `psc_risk_factors`
Fatores de risco identificados pela IA.

**Campos principais:**
- `id`: UUID único
- `inspection_id`: Referência à inspeção
- `risk_type`: documentation, equipment, crew, operational
- `risk_level`: low, medium, high, critical
- `description`: Descrição do risco
- `ai_suggestion`: Sugestão da IA
- `mitigation_status`: planned, in_progress, completed
- `created_at`: Timestamp

### `psc_deficiency_history`
Histórico de deficiências PSC anteriores.

**Campos principais:**
- `id`: UUID único
- `vessel_id`: Referência à embarcação
- `inspection_date`: Data da inspeção PSC real
- `port`: Porto onde ocorreu
- `deficiency_code`: Código da deficiência
- `description`: Descrição
- `rectification_date`: Data de correção
- `detained`: Boolean de detenção
- `created_at`: Timestamp

## 🔌 Integrações

### Supabase Auth & Database
- Autenticação de usuários
- Armazenamento de checklists
- Histórico de inspeções

### AI Assistant
- Análise de risco preditiva
- Identificação de deficiências potenciais
- Sugestões de ações corretivas
- API: OpenAI GPT-4

### Paris MoU / Tokyo MoU Data
- Checklists oficiais
- Códigos de deficiência
- Estatísticas de inspeção (planejado)

### Export Services
- PDF de relatório de preparação
- Checklist imprimível
- Evidências de conformidade

## 🧩 UI - Componentes

### PrePSCForm
- Formulário de inspeção estruturado
- Categorias colapsáveis
- Campos de status por item
- Progress bar de conclusão
- Botões de ação (Save Draft, Submit)

### PSCAIAssistant
- Chat IA para assistência
- Análise de riscos em tempo real
- Sugestões contextuais
- Histórico de interações

### PSCAlertTrigger
- Alertas de deficiências potenciais
- Notificações de itens críticos
- Lembretes de prazos

### PSCScoreCalculator
- Cálculo automático de score
- Visualização de risco
- Comparação com histórico
- Indicadores de preparação

## 🔒 RLS Policies

```sql
-- Tripulação pode ver inspeções de seus navios
CREATE POLICY "Crew can view vessel inspections"
  ON pre_psc_inspections
  FOR SELECT
  USING (
    vessel_id IN (
      SELECT vessel_id FROM crew_assignments
      WHERE user_id = auth.uid()
    )
  );

-- Oficiais podem criar e editar inspeções
CREATE POLICY "Officers can manage inspections"
  ON pre_psc_inspections
  FOR ALL
  USING (
    vessel_id IN (
      SELECT vessel_id FROM crew_assignments
      WHERE user_id = auth.uid() AND role IN ('captain', 'chief_officer')
    )
  );
```

## 📊 Status Atual

### ✅ Implementado
- Formulário de preparação PSC
- Checklist por categorias
- Cálculo de score de risco
- Assistente IA
- Sistema de alertas
- Histórico de deficiências

### ✅ Ativo no Sidebar
- Rota: `/compliance/pre-psc`

### ✅ Testes Automatizados
- Unit tests: `tests/pre-psc.test.tsx`
- E2E tests: `tests/e2e/pre-psc.spec.ts`
- Playwright tests: `tests/e2e/playwright/pre-psc.spec.ts` (PATCH 638)

### 🟢 Pronto para Produção

## 📈 Melhorias Futuras

### Fase 2
- **PSC Database Integration**: Integração com bancos de dados oficiais PSC
- **Predictive Deficiencies**: Predição de deficiências baseada em histórico
- **Mobile Checklist**: App móvel para checklist offline

### Fase 3
- **Real PSC Data Sync**: Sincronização com dados reais de inspeções
- **Fleet Benchmarking**: Comparação de preparação entre frota
- **Automated Reporting**: Relatórios automáticos para autoridades

### Fase 4
- **VR Training**: Treinamento em realidade virtual para PSC
- **IoT Integration**: Integração com sensores para verificação automática
- **Blockchain Certificates**: Certificados verificáveis em blockchain

## 🔗 Referências

### Paris MoU
- Checklist oficial de inspeção
- Códigos de deficiência
- Estatísticas de detenções

### SOLAS, MARPOL, MLC
- Convenções internacionais
- Requisitos regulatórios
- Certificações obrigatórias

---

**Versão:** 1.0.0 (Múltiplos patches: 633-637)  
**Data:** Novembro 2025  
**Status:** ✅ Implementação Completa  
**Testes:** ✅ PATCH 638 - Cobertura E2E e Unit
