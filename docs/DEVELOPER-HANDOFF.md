# Nautilus One - Developer Handoff Document

**Data:** 2025-12-03  
**Versão:** 2.1.0  
**Status:** Em desenvolvimento - Requer otimização antes de produção

---

## 📋 Resumo Executivo

O Nautilus One é um sistema corporativo marítimo com múltiplos módulos. O sistema está funcional mas apresenta problemas de performance e organização que precisam ser resolvidos antes do deploy em produção.

---

## 🚨 Problemas Críticos a Resolver

### 1. Performance (ALTA PRIORIDADE)

**Problema:** Sistema pesado e lento
- 83 pastas em `/src/modules` (muitas são duplicadas ou não utilizadas)
- 180+ arquivos em `/src/pages` (código fragmentado)
- 100+ pastas em `/src/components`
- Lazy loading implementado mas muito código morto

**Ação Recomendada:**
```bash
# 1. Analisar código não utilizado
npm install -D knip
npx knip

# 2. Verificar bundle size
npm run build -- --analyze
```

**Módulos que podem ser removidos (não estão no registry ativo):**
- `/src/modules/finance-hub` (duplicado de finance)
- `/src/modules/task-automation` (duplicado de automation)
- `/src/modules/vault_ai` (duplicado de documents)
- `/src/modules/voice-assistant` (duplicado de assistants/voice-assistant)
- `/src/modules/weather-dashboard` (duplicado de forecast)
- Vários módulos em `/src/modules/` que não têm rotas registradas

### 2. Rotas Quebradas (MÉDIA PRIORIDADE)

**Status:** Maioria já corrigida com redirects

**Verificar em `src/App.tsx`:**
- Rotas legadas redirecionam corretamente
- Módulos do registry têm componentes existentes

**Rotas com Redirects (já implementados):**
```
/intelligent-documents → /documents
/document-ai → /documents
/ai-assistant → /assistant/voice
/voice → /assistant/voice
/voice-assistant → /assistant/voice
/task-automation → /automation
/comunicacao → /communication
/notification-center → /notifications-center
/documentos → /documents
/checklists → /admin/checklists
/finance-hub → /finance
/reports-module → /reports
/smart-workflow → /workflow
/user-management → /users
/project-timeline → /projects/timeline
/analytics-core → /analytics
/portal → /training-academy
/mobile-optimization → /optimization
/alertas-precos → /price-alerts
```

### 3. Código Duplicado (MÉDIA PRIORIDADE)

**Exemplos identificados:**
- `SmartSidebar.tsx` e `app-sidebar.tsx` - duas implementações de sidebar
- Múltiplos componentes de Voice Assistant
- Páginas duplicadas (Communication, Comunicação, etc.)

---

## 📁 Estrutura do Projeto

```
src/
├── ai/                    # Kernel IA e serviços de AI
├── components/            # Componentes React (100+ pastas)
├── config/               # Configurações de navegação
├── contexts/             # Contextos React (Auth, Tenant, Organization)
├── hooks/                # Custom hooks
├── integrations/         # Integrações (Supabase)
├── lib/                  # Utilitários e bibliotecas
├── modules/              # Módulos do sistema (83 pastas)
├── pages/                # Páginas/Rotas (180+ arquivos)
├── services/             # Serviços
├── types/                # TypeScript types
└── utils/                # Utilitários
```

---

## 🔧 Arquivos Principais

| Arquivo | Descrição |
|---------|-----------|
| `src/App.tsx` | Router principal e configuração de rotas |
| `src/modules/registry.ts` | Registro central de módulos |
| `src/utils/module-routes.ts` | Carregador dinâmico de rotas |
| `src/components/layout/SmartLayout.tsx` | Layout principal |
| `src/components/layout/SmartSidebar.tsx` | Sidebar com navegação |
| `src/integrations/supabase/client.ts` | Cliente Supabase |

---

## 🗄️ Banco de Dados (Supabase)

**Tabelas principais:**
- `organizations` - Organizações/Empresas
- `profiles` - Perfis de usuário
- `vessels` - Embarcações
- `crew_members` - Tripulação
- `missions` - Missões
- `documents` - Documentos
- `checklists` - Checklists
- `incidents` - Incidentes

**Políticas RLS:** Implementadas para multi-tenancy

---

## ✅ Funcionalidades Funcionando

1. **Autenticação** - Login/Logout com Supabase Auth
2. **Dashboard Principal** - Métricas e visão geral
3. **Gestão de Frota** - CRUD de embarcações
4. **Tripulação** - Gestão de crew members
5. **Documentos** - Upload e gestão de documentos
6. **Compliance Hub** - Checklists e auditorias
7. **Notificações** - Centro de notificações
8. **Comunicação** - Chat e mensagens

---

## ❌ Funcionalidades Incompletas

1. **Voice Assistant** - UI existe, integração IA pendente
2. **AI Insights** - UI existe, backend IA pendente
3. **Reservations** - Rota quebrada
4. **Vault AI** - Não integrado
5. **Ocean Sonar / Underwater Drone** - Placeholders
6. **Auto Sub / Deep Risk AI** - Placeholders

---

## 🚀 Recomendações para Produção

### Fase 1: Limpeza (1-2 semanas)
1. Rodar análise de código morto (knip)
2. Remover módulos duplicados
3. Consolidar componentes similares
4. Remover páginas não utilizadas

### Fase 2: Otimização (1 semana)
1. Code splitting mais agressivo
2. Otimizar bundle size
3. Implementar cache adequado
4. Lazy loading de imagens

### Fase 3: Testes (1-2 semanas)
1. Adicionar testes E2E para fluxos críticos
2. Testes unitários para componentes principais
3. Testes de integração com Supabase

### Fase 4: Deploy (1 semana)
1. Configurar CI/CD
2. Setup de ambiente de staging
3. Deploy gradual

---

## 📞 Comandos Úteis

```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Verificar tipos
npm run typecheck

# Testes
npm run test

# Lint
npm run lint
```

---

## 🔐 Variáveis de Ambiente

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_USE_HASH_ROUTER=false
```

---

## 📝 Notas Finais

O sistema tem uma base sólida mas cresceu de forma orgânica, resultando em:
- Código duplicado
- Módulos não utilizados
- Performance degradada

A prioridade deve ser **limpeza e consolidação** antes de adicionar novas features.

**Estimativa para produção:** 4-6 semanas de trabalho de um desenvolvedor experiente.

---

*Documento gerado em 2025-12-03*
