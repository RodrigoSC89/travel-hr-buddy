# Repository Structure Guide

## Overview

Este documento descreve a estrutura organizada do repositório Travel HR Buddy / Nautilus One.

## Estrutura Principal

```
travel-hr-buddy/
├── src/                    # 📦 Código fonte principal (TypeScript/React)
│   ├── components/         # Componentes React reutilizáveis
│   ├── pages/              # Páginas da aplicação
│   ├── modules/            # Módulos de funcionalidades
│   ├── hooks/              # Custom React hooks
│   ├── services/           # Serviços e APIs
│   ├── utils/              # Funções utilitárias
│   ├── types/              # Definições TypeScript
│   ├── lib/                # Bibliotecas internas
│   └── integrations/       # Integrações externas (Supabase, etc.)
│
├── docs/                   # 📚 Documentação consolidada
│   ├── getting-started.md  # Guia de início rápido
│   ├── architecture.md     # Arquitetura do sistema
│   ├── api/                # Documentação de APIs
│   ├── features/           # Documentação de features
│   ├── deployment/         # Guias de deploy
│   └── development/        # Guias de desenvolvimento
│
├── backend/                # 🐍 Código Python (legado/backend)
│   ├── core/               # Módulos core Python
│   └── modules/            # Módulos Python específicos
│
├── supabase/               # 🗄️ Configurações Supabase
│   ├── functions/          # Edge Functions
│   └── migrations/         # Migrações de banco
│
├── archive/                # 📁 Arquivos arquivados
│   └── legacy-docs/        # Documentação antiga
│
├── scripts/                # 🔧 Scripts de automação
├── tests/                  # 🧪 Testes unitários
├── e2e/                    # 🧪 Testes end-to-end
└── public/                 # 🌐 Assets públicos
```

## Diretórios Principais

### `/src` - Código Fonte
O código principal da aplicação React/TypeScript.

| Diretório | Descrição |
|-----------|-----------|
| `components/` | Componentes UI reutilizáveis (Button, Card, etc.) |
| `pages/` | Páginas da aplicação (rotas) |
| `modules/` | Módulos de features (admin, analytics, compliance, etc.) |
| `hooks/` | Custom hooks React |
| `services/` | Lógica de negócio e chamadas API |
| `utils/` | Funções utilitárias |
| `types/` | Tipos TypeScript |
| `lib/` | Bibliotecas internas |
| `integrations/` | Integrações com serviços externos |

### `/docs` - Documentação
Documentação consolidada e organizada.

| Arquivo/Diretório | Descrição |
|-------------------|-----------|
| `README.md` | Índice da documentação |
| `getting-started.md` | Como começar |
| `architecture.md` | Arquitetura do sistema |
| `api/` | Documentação de APIs |
| `features/` | Docs de funcionalidades |
| `deployment/` | Guias de deploy |
| `development/` | Guias para devs |

### `/supabase` - Backend Supabase
Configurações e funções do Supabase.

| Diretório | Descrição |
|-----------|-----------|
| `functions/` | Edge Functions (serverless) |
| `migrations/` | Migrações SQL do banco |

## Arquivos de Configuração (Raiz)

| Arquivo | Descrição |
|---------|-----------|
| `package.json` | Dependências npm |
| `vite.config.ts` | Configuração Vite |
| `tailwind.config.ts` | Configuração Tailwind CSS |
| `tsconfig.json` | Configuração TypeScript |
| `.env.example` | Exemplo de variáveis de ambiente |

## Convenções

### Nomenclatura
- **Componentes**: PascalCase (`UserCard.tsx`)
- **Hooks**: camelCase com prefixo `use` (`useAuth.ts`)
- **Utilitários**: camelCase (`formatDate.ts`)
- **Tipos**: PascalCase (`User.ts`)
- **Constantes**: UPPER_SNAKE_CASE

### Estrutura de Módulos
Cada módulo em `/src/modules/` segue:
```
module-name/
├── components/     # Componentes do módulo
├── hooks/          # Hooks específicos
├── services/       # Serviços/APIs
├── types/          # Tipos do módulo
├── utils/          # Utilitários
└── index.ts        # Exports públicos
```

## Arquivos Arquivados

Documentação antiga foi movida para `/archive/legacy-docs/` organizada por categoria:
- `ai/` - Docs de IA
- `api/` - Docs de APIs
- `deployment/` - Docs de deploy
- `features/` - Docs de features

## Scripts Disponíveis

```bash
npm run dev          # Desenvolvimento
npm run build        # Build produção
npm run test         # Testes
npm run lint         # Linting
npm run clean        # Limpar cache
```

## Próximos Passos para Novos Desenvolvedores

1. Ler `docs/getting-started.md`
2. Configurar ambiente com `.env.example`
3. Executar `npm install && npm run dev`
4. Explorar `/src/modules/` para entender features
