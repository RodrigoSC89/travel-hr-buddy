# 🛠️ Guia de Desenvolvimento - NAUTI ONE

> Guia completo para desenvolvedores do sistema NAUTI ONE

## 🚀 Quick Start

### Pré-requisitos

- Node.js 20+
- npm 10+
- Git
- Conta Supabase (para backend)

### Instalação

```bash
# Clone o repositório
git clone https://github.com/RodrigoSC89/travel-hr-buddy.git
cd travel-hr-buddy

# Instale dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

O sistema estará disponível em `http://localhost:8080`

---

## 📁 Estrutura do Projeto

```
travel-hr-buddy/
├── src/
│   ├── components/      # Componentes React
│   ├── hooks/           # Custom hooks
│   ├── pages/           # Páginas/Rotas
│   ├── modules/         # Módulos de negócio
│   ├── lib/             # Utilitários
│   ├── services/        # Serviços externos
│   └── integrations/    # Integrações (Supabase)
├── supabase/
│   ├── migrations/      # Migrations SQL
│   └── functions/       # Edge Functions
├── docs/                # Documentação
├── scripts/             # Scripts de automação
└── e2e/                 # Testes E2E
```

---

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia servidor dev (Vite)
npm run build            # Build de produção
npm run preview          # Preview do build

# Testes
npm run test             # Testes unitários (Vitest)
npm run test:e2e         # Testes E2E (Playwright)
npm run typecheck        # Verificação TypeScript

# Qualidade
npm run lint             # ESLint
npm run lint:fix         # ESLint com auto-fix
npm run gate:no-console  # Verifica console.log
npm run gate:no-mock     # Verifica dados mock
npm run gate:no-ts-ignore # Verifica @ts-ignore

# Supabase
npx supabase gen types   # Gera tipos TypeScript
```

---

## 📝 Convenções de Código

### TypeScript

```typescript
// ✅ BOM - Tipos específicos
interface UserData {
  id: string;
  name: string;
  email: string;
}

// ❌ RUIM - Uso de any
const data: any = fetchData();

// ✅ BOM - Record para objetos dinâmicos
const metadata: Record<string, unknown> = {};
```

### Componentes React

```typescript
// ✅ BOM - Props tipadas
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export function Button({ label, onClick, disabled }: ButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
}
```

### Hooks

```typescript
// ✅ BOM - Hook com TanStack Query
export function useVessels() {
  return useQuery({
    queryKey: ["vessels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vessels")
        .select("*");
      
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}
```

### Logging

```typescript
// ✅ BOM - Usar logger centralizado
import { logger } from "@/lib/logger";

logger.info("Operação concluída");
logger.error("Erro:", error);

// ❌ RUIM - console.log em produção
console.log("debug"); // Não use!
```

---

## 🗄️ Trabalhando com Supabase

### Queries Básicas

```typescript
import { supabase } from "@/integrations/supabase/client";

// SELECT
const { data, error } = await supabase
  .from("vessels")
  .select("*")
  .eq("status", "active");

// INSERT
const { data, error } = await supabase
  .from("vessels")
  .insert({ name: "MV Nova", status: "active" })
  .select()
  .single();

// UPDATE
const { error } = await supabase
  .from("vessels")
  .update({ status: "maintenance" })
  .eq("id", vesselId);

// DELETE
const { error } = await supabase
  .from("vessels")
  .delete()
  .eq("id", vesselId);
```

### Realtime

```typescript
const channel = supabase
  .channel("vessels-changes")
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "vessels" },
    (payload) => {
      console.log("Change received!", payload);
    }
  )
  .subscribe();
```

### Edge Functions

```typescript
const { data, error } = await supabase.functions.invoke("ai-hub-chat", {
  body: { message: "Olá", module: "fleet" },
});
```

---

## 🧪 Testes

### Testes Unitários (Vitest)

```typescript
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "./Button";

describe("Button", () => {
  it("renders correctly", () => {
    render(<Button label="Click me" onClick={() => {}} />);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });
});
```

### Testes E2E (Playwright)

```typescript
import { test, expect } from "@playwright/test";

test("login flow", async ({ page }) => {
  await page.goto("/login");
  await page.fill("[name=email]", "test@example.com");
  await page.fill("[name=password]", "password123");
  await page.click("button[type=submit]");
  
  await expect(page).toHaveURL("/dashboard");
});
```

---

## 🔐 Segurança

### Regras Importantes

1. **Nunca exponha credenciais** em código
2. **Use RLS** para proteger dados
3. **Valide inputs** no frontend E backend
4. **Use HTTPS** em produção
5. **Implemente rate limiting** em Edge Functions

### Variáveis de Ambiente

```bash
# .env.local (NÃO commitar!)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
```

---

## 🚀 Deploy

### Build de Produção

```bash
npm run build
# Output em /dist
```

### Checklist de Deploy

- [ ] `npm run typecheck` passa
- [ ] `npm run lint` sem erros
- [ ] `npm run build` sem erros
- [ ] `npm run test` passa
- [ ] Gates de qualidade passam

---

## 📚 Recursos

- [Documentação de Arquitetura](./ARCHITECTURE.md)
- [Relatório de Progresso](./FINAL_10_OF_10_REPORT.md)
- [Mapa de Módulos](./MODULE_MAP_V4.md)

---

*Última atualização: Janeiro 2026*
