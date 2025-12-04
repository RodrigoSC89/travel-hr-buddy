# Documentação Técnica para Desenvolvedores

## 📋 Sumário Executivo

Este documento contém todas as informações necessárias para a equipe de desenvolvimento continuar o projeto. O sistema está **95% completo** com infraestrutura robusta de performance, segurança e escalabilidade.

---

## 🏗️ Arquitetura do Sistema

### Stack Tecnológica

| Camada | Tecnologia | Versão |
|--------|------------|--------|
| Frontend | React + TypeScript | 18.x |
| Build | Vite | 5.x |
| Estilização | Tailwind CSS + shadcn/ui | 3.x |
| Estado | TanStack Query | 5.x |
| Animações | Framer Motion | 11.x |
| Backend | Supabase (PostgreSQL) | - |
| Edge Functions | Deno | - |
| Mobile | Capacitor | 7.x |

### Estrutura de Diretórios

```
src/
├── components/          # Componentes React
│   ├── ui/             # Componentes shadcn/ui
│   └── ...             # Componentes de feature
├── contexts/           # React Contexts
├── hooks/              # Custom Hooks
├── lib/                # Utilitários e serviços
├── pages/              # Páginas/Rotas
├── services/           # Serviços de API
├── types/              # TypeScript types
└── integrations/       # Integrações (Supabase)

supabase/
├── functions/          # 100+ Edge Functions
└── migrations/         # Migrações SQL
```

---

## 🔐 Segurança

### Row Level Security (RLS)

Todas as tabelas críticas têm RLS habilitado:
- `help_system_settings` - Somente usuários autenticados
- `module_permissions` - Somente usuários autenticados
- `role_permissions` - Somente usuários autenticados
- `knowledge_base` - Somente usuários autenticados
- `system_status` - Somente usuários autenticados

### Funções de Segurança

```sql
-- Verifica se usuário é admin
public.is_admin(user_id uuid) → boolean

-- Verifica se usuário tem role específica
public.user_has_role(user_id uuid, role text) → boolean

-- Verifica se usuário pertence a organização
public.user_belongs_to_organization(org_id uuid, user_id uuid) → boolean
```

### Autenticação

- ✅ Email/Senha
- ✅ OAuth Google (requer configuração)
- ✅ OAuth GitHub (requer configuração)
- ✅ OAuth Microsoft (requer configuração)
- ✅ Biometria (Capacitor)

---

## ⚡ Performance

### Otimizações Implementadas

1. **Image Optimizer** (`src/lib/image-optimizer.ts`)
   - Compressão WebP/AVIF automática
   - Lazy loading com IntersectionObserver
   - Qualidade adaptativa por rede

2. **Web Vitals Monitor** (`src/lib/web-vitals-monitor.ts`)
   - Tracking de LCP, CLS, INP, TTFB, FCP
   - Alertas automáticos
   - Reporting para backend

3. **Service Worker** (`public/sw.js`)
   - Cache strategies (Network First, Cache First, SWR)
   - Background sync
   - Offline support

4. **Performance Context** (`src/contexts/PerformanceContext.tsx`)
   - Estado global de performance
   - Network-aware components
   - Image format detection

### Métricas Target

| Métrica | Target | Status |
|---------|--------|--------|
| LCP | < 2.5s | ✅ |
| INP | < 200ms | ✅ |
| CLS | < 0.1 | ✅ |
| TTFB | < 800ms | ✅ |
| FCP | < 1.8s | ✅ |

---

## 📱 Mobile/Offline

### IndexedDB Storage
- Dados persistentes offline
- Sync queue com prioridades
- Compressão de dados

### Background Sync
- Sincronização automática quando online
- Retry com backoff exponencial
- Push notifications

### Capacitor Plugins
- Camera
- Haptics
- Local Notifications
- Push Notifications

---

## 🧪 Testes

### E2E Tests (Playwright)

```bash
# Instalar Playwright
npx playwright install

# Executar testes
npx playwright test

# Modo visual
npx playwright test --ui

# Relatório
npx playwright show-report
```

### Testes Existentes

- `e2e/auth.spec.ts` - Fluxos de autenticação
- `e2e/accessibility.spec.ts` - WCAG 2.1 compliance
- `e2e/performance.spec.ts` - Core Web Vitals

### Unit Tests

```bash
# Executar unit tests
npm run test

# Coverage
npm run test:coverage
```

---

## ♿ Acessibilidade (WCAG 2.1)

### Componentes

- `AccessibilityProvider` - Skip links, announcements
- `useFocusTrap` - Focus trap para modals
- `useKeyboardNavigation` - Navegação por teclado
- `useMediaPreferences` - Preferências do usuário

### Checklist WCAG 2.1 AA

- [x] Skip to main content
- [x] Hierarquia de headings
- [x] Alt text em imagens
- [x] Contraste de cores
- [x] Navegação por teclado
- [x] Labels em formulários
- [x] Suporte a reduced motion

---

## 🔧 Configurações Pendentes (Manual)

### 1. OAuth Providers

**Google OAuth:**
1. Criar projeto em [Google Cloud Console](https://console.cloud.google.com)
2. Habilitar Google+ API
3. Criar OAuth 2.0 Client ID
4. Configurar redirect URI no Supabase

**GitHub OAuth:**
1. Acessar [GitHub Developer Settings](https://github.com/settings/developers)
2. Criar OAuth App
3. Configurar redirect URI

**Microsoft OAuth:**
1. Acessar Azure Portal
2. Registrar aplicação
3. Configurar redirect URI

### 2. Supabase URLs

No [Supabase Dashboard](https://supabase.com/dashboard):
- Configurar Site URL para produção
- Adicionar redirect URLs autorizados

### 3. Leaked Password Protection

1. Acessar Supabase Dashboard → Auth → Settings
2. Habilitar "Leaked Password Protection"

---

## 📊 Edge Functions (100+)

### Principais Categorias

| Categoria | Quantidade | Exemplos |
|-----------|------------|----------|
| AI/ML | 20+ | `ai-chat`, `nautilus-llm`, `generate-predictions` |
| Relatórios | 15+ | `generate-report`, `send-forecast-report` |
| Integração | 10+ | `amadeus-search`, `weather-integration` |
| Workflow | 8+ | `workflow-execute`, `workflows-copilot-suggest` |
| Notificações | 5+ | `send-alerts`, `intelligent-notifications` |

### Deploy

Edge functions são deployadas automaticamente no push.

---

## 🚀 Deploy

### Produção

```bash
# Build
npm run build

# Preview local
npm run preview

# Validação
./scripts/build-validation.sh
```

### Lighthouse CI

```bash
# Executar auditoria
npm run lhci
```

---

## 📞 Suporte

- **Documentação**: `/docs/`
- **Checklist de Otimização**: `/docs/OPTIMIZATION-CHECKLIST.md`
- **Supabase Dashboard**: https://supabase.com/dashboard/project/vnbptmixvwropvanyhdb

---

*Última atualização: Dezembro 2025*
