# Guia de Desenvolvimento

## Setup Local

```bash
# Clone
git clone <repo>
cd travel-hr-buddy

# Instale dependências
npm install

# Configure ambiente
cp .env.example .env.development

# Inicie
npm run dev
```

## Estrutura de Código

```
src/
├── components/          # Componentes reutilizáveis
│   ├── ui/             # shadcn/ui components
│   └── [feature]/      # Componentes por feature
├── modules/            # Módulos de negócio
│   └── [module]/
│       ├── components/
│       ├── hooks/
│       ├── services/
│       └── types/
├── pages/              # Rotas/páginas
├── hooks/              # Hooks globais
├── services/           # Serviços globais
├── lib/                # Utilitários
├── types/              # Types globais
└── integrations/       # Integrações externas
```

## Convenções

### Nomenclatura

- **Componentes**: PascalCase (`UserProfile.tsx`)
- **Hooks**: camelCase com `use` (`useAuth.ts`)
- **Services**: camelCase (`authService.ts`)
- **Types**: PascalCase (`User.types.ts`)

### Imports

```typescript
// 1. React
import React, { useState } from "react";

// 2. Bibliotecas externas
import { format } from "date-fns";

// 3. Componentes UI
import { Button } from "@/components/ui/button";

// 4. Componentes internos
import { UserCard } from "@/components/users/UserCard";

// 5. Hooks
import { useAuth } from "@/hooks/useAuth";

// 6. Services/Utils
import { formatDate } from "@/lib/utils";

// 7. Types
import type { User } from "@/types";
```

### Componentes

```typescript
// Preferir function components
export function UserProfile({ user }: UserProfileProps) {
  return <div>{user.name}</div>;
}

// Props tipadas
interface UserProfileProps {
  user: User;
  onEdit?: () => void;
}
```

### Hooks

```typescript
export function useUser(userId: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => fetchUser(userId),
  });

  return { user: data, isLoading, error };
}
```

## Testes

```bash
# Rodar todos
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

### Estrutura de Teste

```typescript
import { render, screen } from "@testing-library/react";
import { UserProfile } from "./UserProfile";

describe("UserProfile", () => {
  it("renders user name", () => {
    render(<UserProfile user={{ name: "John" }} />);
    expect(screen.getByText("John")).toBeInTheDocument();
  });
});
```

## Git Workflow

1. Crie branch da `main`: `git checkout -b feature/nome`
2. Faça commits pequenos e descritivos
3. Push e crie PR
4. Aguarde review
5. Merge após aprovação

### Commit Messages

```
feat: add user profile page
fix: resolve login redirect issue
refactor: extract auth logic to hook
docs: update API documentation
```

## Performance

### Lazy Loading

```typescript
const HeavyComponent = lazy(() => import("./HeavyComponent"));
```

### Memoization

```typescript
const MemoizedComponent = memo(ExpensiveComponent);
const memoizedValue = useMemo(() => compute(data), [data]);
const memoizedCallback = useCallback(() => action(), [deps]);
```

## Debug

### Console Logs

```typescript
import { logger } from "@/lib/logger";

logger.info("User logged in", { userId });
logger.error("Failed to fetch", { error });
```

### React Query DevTools

Já configurado em desenvolvimento - veja ícone no canto inferior.
