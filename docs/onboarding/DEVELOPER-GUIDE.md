# 🚀 Developer Onboarding Guide - NAUTI ONE v4.0

## Bem-vindo ao Time!

Este guia vai te ajudar a configurar o ambiente e entender a arquitetura do Nauti One em menos de 30 minutos.

---

## ⚡ Quick Start (5 minutos)

```bash
# 1. Clone o repositório
git clone https://github.com/your-org/nautilus-one
cd nautilus-one

# 2. Instale dependências (usamos Bun para velocidade)
bun install

# 3. Configure variáveis de ambiente
cp .env.example .env

# 4. Inicie o servidor de desenvolvimento
bun run dev
```

Acesse: http://localhost:5173

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│  React 18 + TypeScript + Vite + Tailwind + shadcn/ui        │
├─────────────────────────────────────────────────────────────┤
│                        BACKEND                               │
│  Supabase (PostgreSQL + PostgREST + Auth + Storage)         │
│  289 Edge Functions (Deno)                                  │
├─────────────────────────────────────────────────────────────┤
│                          AI                                  │
│  OpenAI GPT-4o | Google Gemini 2.5 | ElevenLabs             │
├─────────────────────────────────────────────────────────────┤
│                        MOBILE                                │
│  Capacitor 7 + PWA + Service Worker v19                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Estrutura de Pastas

```
src/
├── components/         # Componentes React reutilizáveis
│   ├── ui/            # shadcn/ui components
│   └── auth/          # Componentes de autenticação
├── contexts/          # React Contexts (Auth, Theme, etc.)
├── hooks/             # Custom hooks
├── integrations/      # Integrações externas (Supabase)
├── lib/               # Utilitários e helpers
│   ├── ai/           # AI utilities (rate-limiter, cache)
│   ├── auth/         # OAuth providers
│   ├── performance/  # Performance optimizations
│   └── security/     # Security utilities
├── modules/           # Feature modules (97 modules)
├── pages/             # Route pages
└── services/          # API services

supabase/
├── functions/         # 289 Edge Functions
├── migrations/        # Database migrations
└── config.toml        # Supabase configuration

public/
├── sw.js             # Service Worker v19
└── manifest.json     # PWA manifest
```

---

## 🔑 Conceitos Chave

### 1. Autenticação

```typescript
// Usar o hook useAuth
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, signOut } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" />;
  }
  
  return <div>Welcome, {user?.email}</div>;
}
```

### 2. Queries com React Query

```typescript
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

function useCrewMembers(vesselId: string) {
  return useQuery({
    queryKey: ['crew', vesselId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crew_members')
        .select('*')
        .eq('vessel_id', vesselId);
      
      if (error) throw error;
      return data;
    },
  });
}
```

### 3. Edge Functions

```typescript
// Chamar uma Edge Function
const { data, error } = await supabase.functions.invoke('nauti-brain', {
  body: { message: 'Olá!' }
});
```

### 4. RLS (Row Level Security)

Todas as tabelas têm RLS ativo. O usuário só vê dados permitidos pela policy.

```sql
-- Exemplo de policy
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = user_id);
```

---

## 🎨 Design System

Usamos shadcn/ui com tokens semânticos definidos em `index.css`:

```css
/* Cores semânticas - NUNCA use cores diretas */
--background: 0 0% 100%;
--foreground: 240 10% 3.9%;
--primary: 240 5.9% 10%;
--secondary: 240 4.8% 95.9%;
--muted: 240 4.8% 95.9%;
--accent: 240 4.8% 95.9%;
```

```tsx
// ✅ Correto
<div className="bg-background text-foreground" />

// ❌ Errado
<div className="bg-white text-black" />
```

---

## 🧪 Testes

```bash
# Unit tests
bun run test

# E2E tests
bun run test:e2e

# Coverage
bun run test:coverage
```

---

## 🚀 Deploy

O deploy é automático via Lovable:

1. Faça commit para `develop` → Deploy em Staging
2. Merge para `main` → Deploy em Produção

---

## 📚 Documentação

- [API Reference](../api/API-REFERENCE.md)
- [Security Guidelines](../../SECURITY-RLS-HARDENING.md)
- [Performance Tips](../../src/lib/performance/README.md)

---

## 🆘 Ajuda

- Slack: #nauti-one-dev
- Email: dev@nautione.com.br
- Docs: https://docs.nautione.com.br
