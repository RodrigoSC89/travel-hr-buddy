# Fusão de Módulos - Nautilus CMMS

## Data: 2025-12-08
## Versão: UNIFY-1.0

## Resumo das Fusões

Este documento descreve a consolidação de módulos redundantes no sistema Nautilus CMMS.

---

## 1. TREINAMENTOS → Nautilus Academy

### Módulos Fundidos:
- `training` → Nautilus Academy
- `solas-training` → Nautilus Academy
- `solas-isps-training` → Nautilus Academy
- `training-simulation` → Nautilus Academy

### Módulo Unificado: `nautilus-academy`
- **Rota**: `/nautilus-academy`
- **Funcionalidades Consolidadas**:
  - Gestão de cursos e treinamentos
  - Drills SOLAS obrigatórios
  - Certificações STCW
  - ISPS Code Training
  - Resposta a emergências
  - IA preditiva e generativa
  - Simulações de treinamento
  - Analytics de performance

---

## 2. LOGÍSTICA & PROCUREMENT → Procurement & Inventory AI

### Módulos Fundidos:
- `autonomous-procurement` → Procurement & Inventory AI
- `smart-logistics` → Procurement & Inventory AI
- `logistics-multibase` → Procurement & Inventory AI

### Módulo Unificado: `procurement-inventory`
- **Rota**: `/procurement-inventory`
- **Funcionalidades Consolidadas**:
  - Gestão de estoque inteligente
  - Requisições com IA
  - Pedidos de compra (POs)
  - Gestão de fornecedores
  - Previsão de demanda com IA
  - Reabastecimento multibase
  - Blockchain para rastreabilidade
  - Chat assistente IA

---

## 3. CONECTIVIDADE → SATCOM Dashboard

### Módulos Fundidos:
- `maritime-connectivity` → SATCOM Dashboard
- `connectivity-panel` → SATCOM Dashboard

### Módulo Unificado: `satcom`
- **Rota**: `/satcom`
- **Funcionalidades Consolidadas**:
  - Monitoramento de satélite (Iridium, Starlink, Inmarsat)
  - Sincronização offline
  - Gestão de fallback
  - Terminal de comunicação
  - Histórico de comunicações
  - Diagnóstico de conexão
  - Mapa de cobertura

---

## 4. RH & PESSOAS → Nautilus People Hub

### Módulos Fundidos:
- `crew-wellbeing` → Nautilus People Hub
- Funcionalidades de crew-management mantidas separadas para operações

### Módulo Unificado: `nautilus-people`
- **Rota**: `/nautilus-people`
- **Funcionalidades Consolidadas**:
  - Dashboard de RH
  - Registro de colaboradores
  - Pipeline de recrutamento
  - Onboarding
  - Gestão de desempenho
  - Frequência e ponto
  - Desenvolvimento de carreira
  - Clima e engajamento
  - People Analytics
  - Chatbot RH com IA

---

## Notas de Migração

### Redirecionamentos Automáticos
Todos os módulos antigos agora redirecionam automaticamente para os módulos unificados através de arquivos `redirect.tsx`.

### Rotas Mantidas
As rotas antigas continuam funcionando via redirecionamento para manter compatibilidade.

### Próximos Passos
1. Monitorar uso dos redirecionamentos
2. Atualizar documentação de usuário
3. Remover módulos deprecated após 30 dias
4. Atualizar links no menu de navegação

---

## Benefícios da Fusão

1. **Menos duplicação**: Código compartilhado entre funcionalidades similares
2. **UX Unificada**: Experiência consistente em cada área
3. **Manutenção Simplificada**: Menos módulos para manter e atualizar
4. **IA Centralizada**: Um hook de IA por domínio ao invés de múltiplos
5. **Performance**: Menos código para carregar, bundle menor
